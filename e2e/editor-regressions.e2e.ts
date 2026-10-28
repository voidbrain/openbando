import { expect, test, type Locator } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFile } from 'node:fs/promises';
import type { SiteSpec } from '../src/app/core/site-spec';

/** Check actual CSS cascade states: a palette-pair check cannot catch a hover override. */
async function expectButtonContrast(button: Locator): Promise<void> {
  const read = () => button.evaluate(el => {
    const style = getComputedStyle(el);
    return {text: style.color, fill: style.backgroundColor};
  });
  const contrast = (state: {text: string; fill: string}): number => {
    const luminance = (css: string): number => {
      const values = css.match(/[\d.]+/g)!.map(Number);
      // These shared controls have opaque fills; do not silently ignore alpha blending.
      expect(values.length === 3 || values[3] === 1, css).toBe(true);
      return values.slice(0, 3).reduce((sum, value, index) => {
        const channel = value / 255;
        return sum + [0.2126, 0.7152, 0.0722][index]! *
          (channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4);
      }, 0);
    };
    const a = luminance(state.text), b = luminance(state.fill);
    return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
  };
  await button.page().mouse.move(0, 0);
  const resting = await read();
  expect(contrast(resting), JSON.stringify({state: 'rest', ...resting})).toBeGreaterThanOrEqual(4.5);
  await button.hover();
  const hovered = await read();
  expect(hovered.fill).not.toBe(resting.fill);
  expect(contrast(hovered), JSON.stringify({state: 'hover', ...hovered})).toBeGreaterThanOrEqual(4.5);
  await button.page().mouse.move(0, 0);
}

test('Welcome shows the approved wordmark, Features link and revised pose assets', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'OpenBando', exact: true })).toBeVisible();
  await expect(page.locator('app-stage app-camera-compass')).toHaveCount(0);
  const wordmark = page.getByRole('img', { name: 'OpenBando', exact: true });
  await expect(wordmark).toBeVisible();
  await expect(wordmark).toHaveJSProperty('complete', true);
  await expect.poll(() => wordmark.evaluate((img: HTMLImageElement) => img.naturalWidth)).toBeGreaterThan(0);
  const asset = await page.request.get('/mascot/poses/16-confused-a.png');
  expect(asset.ok()).toBe(true);
  await expect(page.getByRole('button', { name: 'Features' })).toBeVisible();
  await expectButtonContrast(page.locator('app-welcome-panel .btn.primary'));
  const axe = await new AxeBuilder({ page })
    .include('app-welcome-panel')
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
  expect(axe.violations.map((v) => v.id)).toEqual([]);
  expect(errors).toEqual([]);
});

test('active Views icon buttons retain contrast on hover', async ({page}) => {
  await page.goto('/');
  await page.getByRole('button', {name: 'Close Welcome', exact: true}).click();
  await page.locator('app-views-panel .options > summary').click();
  const roofs = page.locator('app-views-panel').getByRole('button', {name: 'Hide roofs', exact: true});
  if (await roofs.getAttribute('aria-pressed') !== 'true') await roofs.click();
  await expect(roofs).toHaveClass(/\bib\b/);
  await expect(roofs).toHaveClass(/\bon\b/);
  await expectButtonContrast(roofs);
  await expectButtonContrast(page.locator('app-views-panel').getByRole('button', {name: 'Reset UI', exact: true}));
});

test('basement controls and explicit roof choice update the selected building', async ({
  page,
}) => {
  test.setTimeout(180_000);
  await page.goto('/');
  await page.getByRole('button', { name: 'Open the bandos', exact: true }).click();
  const fixture = {
    version: 1,
    id: 'regression-yard',
    name: 'Regression yard',
    createdAt: 0,
    origin: { lat: 0, lon: 0 },
    privacy: 'hidden',
    bearingDeg: 0,
    genScale: 1,
    groundColor: '#789b52',
    extent: 60,
    seed: 7,
    droneStart: { x: -20, z: 0 },
    calibCorners: { p1: { x: -30, z: -30 }, p2: { x: 30, z: 30 } },
    trees: [],
    pads: [],
    buildings: [
      {
        id: 'b',
        name: 'Shed',
        pos: { x: 0, z: 0 },
        rotDeg: 0,
        length: 14,
        width: 10,
        ruin: 0.7,
        basement: { height: 3 },
        levels: [
          {
            baseY: 0,
            height: 4,
            sides: { n: true, s: true, e: true, w: true },
            doors: {},
            partitions: [],
            roof: 'gable',
            roofRise: 2,
          },
        ],
      },
    ],
  };
  await page
    .locator('app-studio-panel input[type=file]')
    .first()
    .setInputFiles({
      name: 'yard.json',
      mimeType: 'application/json',
      buffer: Buffer.from(JSON.stringify(fixture)),
    });
  await page
    .locator('app-studio-panel .card')
    .filter({ hasText: 'Regression yard' })
    .getByRole('button', { name: 'Edit', exact: true })
    .click();
  await expect(page.locator('app-stage app-camera-compass')).toBeVisible();
  await page.locator('[data-pk="building:b"]').first().click({ force: true });
  const inspector = page.locator('[data-tour="inspector"]');
  await expect(inspector).toHaveClass(/docked/);
  const work = page.locator('app-bando-editor .work');
  const workBox = await work.boundingBox(), inspectorBox = await inspector.boundingBox();
  expect(workBox!.x + workBox!.width).toBeLessThanOrEqual(inspectorBox!.x);

  await inspector.getByRole('button', { name: '−1', exact: true }).click();
  await expect(inspector.locator('.st').filter({ hasText: /^Basement · −1$/ })).toBeVisible();
  await inspector.getByLabel('length m', { exact: true }).last().fill('8');
  await inspector.getByLabel('length m', { exact: true }).last().press('Tab');
  await expect(inspector.getByLabel('length m', { exact: true }).last()).toHaveValue('8');
  await inspector.getByRole('button', { name: 'Add basement wall', exact: true }).click();
  await expect(
    inspector.getByRole('button', { name: 'Delete basement wall', exact: true }),
  ).toBeVisible();
  // Edit −1 in the plan, then confirm it stays selected and accessible in 3D.
  const topBar = page.locator('app-bando-editor > .bar');
  await topBar.getByRole('button', { name: 'Indoors', exact: true }).click();
  await expect(topBar.getByRole('button', { name: '−1', exact: true })).toHaveClass(/on/);
  await expectButtonContrast(topBar.getByRole('button', {name: '−1', exact: true}));
  // Click the building itself: bubbling used to immediately end an indoor measurement.
  await page.locator('app-bando-editor .palette button[title^="Measure ·"]').click();
  const floor = page.locator('[data-pk="building:b"]').first();
  const fb = await floor.boundingBox();
  await floor.click({position: {x: fb!.width * 0.3, y: fb!.height * 0.4}, force: true});
  await floor.click({position: {x: fb!.width * 0.7, y: fb!.height * 0.4}, force: true});
  await expect(page.locator('[data-pk="meas:0"]')).toHaveCount(1);
  await page.locator('app-bando-editor .wrap').press('Escape');
  await topBar.getByLabel('Debug coordinates', {exact: true}).check();
  await floor.click({position: {x: fb!.width * 0.5, y: fb!.height * 0.5}, force: true});
  await expect(page.locator('.debug-readout')).toContainText(/x .+ · y .+ · z .+ m/);
  await expect(page.locator('[data-pk="meas:0"]')).toHaveCount(1);
  await topBar.getByLabel('Debug coordinates', {exact: true}).uncheck();
  // Clear the measurement overlay before exercising unrelated placement tools.
  await page.locator('app-bando-editor .palette button[title^="Measure ·"]').click();
  await page.getByRole('button', {name: 'Clear all', exact: true}).click();
  await expect(page.locator('[data-pk="meas:0"]')).toHaveCount(0);
  await page.locator('app-bando-editor .palette button[title^="Select ·"]').click();

  await expect(page.getByText(/Floor −1: roof off in 3D/)).toBeVisible();
  const height = inspector.getByLabel('wall height m', { exact: true });
  await height.fill('3.5'); await height.press('Tab');
  await expect(inspector.getByLabel('basement m', { exact: true })).toHaveValue('3.5');
  await inspector.getByLabel('east wall', {exact: true}).last().uncheck();
  // A keyboard move changes one vertex, making a diagonal wall while keeping the −1 floor selected.
  const vertex = page.locator('[data-pk="basement-vertex:1"]');
  await expect(vertex).toBeVisible();
  const oldX = await vertex.getAttribute('cx');
  await vertex.focus();
  await page.keyboard.press('ArrowRight');
  await expect(vertex).not.toHaveAttribute('cx', oldX!);
  await expect(inspector.getByLabel('Perimeter edge 2', {exact: true})).not.toBeChecked();
  await expect(topBar.getByRole('button', { name: '−1', exact: true })).toHaveClass(/on/);
  await vertex.focus();
  await page.keyboard.press('Insert');
  await expect(page.locator('[data-pk^="basement-vertex:"]')).toHaveCount(5);
  await page.locator('[data-pk="basement-vertex:2"]').focus();
  await page.keyboard.press('Delete');
  await expect(page.locator('[data-pk^="basement-vertex:"]')).toHaveCount(4);
  await page.locator('app-bando-editor .palette button[title^="Column ·"]').click();
  const svg = page.locator('app-bando-editor svg.ov');
  await expect(page.locator('app-bando-editor .palette button[title^="Column ·"]')).toHaveClass(/on/);
  const buildingBox = await page.locator('[data-pk="building:b"]').first().boundingBox();
  expect(buildingBox).not.toBeNull();
  // A docked inspector changes available space; click visible floor, never through a toolbar.
  const target = await svg.evaluate((el, box) => {
    for (const [u, v] of [[0.5, 0.5], [0.6, 0.6], [0.4, 0.6], [0.5, 0.65]]) {
      const x = box.x + box.width * u!, y = box.y + box.height * v!;
      const hit = document.elementFromPoint(x, y);
      if (hit && el.contains(hit) && !hit.closest('.palette, .opts, app-float-box, .mhit'))
        return {x, y, hit: hit.outerHTML.slice(0, 500)};
    }
    return null;
  }, buildingBox!);
  expect(target, 'No visible floor point is available for column placement').not.toBeNull();
  await page.mouse.click(target!.x, target!.y);
  const feedback = await page.locator('app-toast, .toast, app-bando-editor .read').allTextContents();
  await expect(page.locator('[data-pk="col:0"]'), JSON.stringify({target, feedback})).toHaveCount(1);
  // Placement switches away from Select; reselect the building before reading its handles.
  await page.locator('app-bando-editor .palette button[title^="Select ·"]').click();
  await page.locator('[data-pk="building:b"]').first().click({ force: true });
  await expect(vertex).toBeVisible();
  const pre3dX = await vertex.getAttribute('cx');
  await page.locator('[data-tour="view-3d"]').click();
  await expect(page.locator('app-site-view canvas')).toBeVisible();
  await expect(page.locator('app-site-view .fail')).toHaveCount(0);
  // The docked Inspector must reserve real canvas space in 3D as well as the plan.
  const indoorCanvas = page.locator('app-site-view canvas');
  const canvasBox = await indoorCanvas.boundingBox(), dockBox = await inspector.boundingBox();
  expect(canvasBox).not.toBeNull(); expect(dockBox).not.toBeNull();
  expect(canvasBox!.x + canvasBox!.width).toBeLessThanOrEqual(dockBox!.x);
  // Debug deliberately reads outdoor ground even while the basement editing plane is active.
  await topBar.getByLabel('Debug coordinates', {exact: true}).check();
  await indoorCanvas.click({position: {x: canvasBox!.width * 0.5, y: canvasBox!.height * 0.7}});
  const debugReadout = page.locator('.debug-readout');
  await expect(debugReadout).toContainText(/x [-\d.]+ · y 0\.00 · z [-\d.]+ m/);
  const firstGroundPoint = await debugReadout.innerText();
  await indoorCanvas.click({position: {x: canvasBox!.width * 0.65, y: canvasBox!.height * 0.7}});
  await expect(debugReadout).not.toHaveText(firstGroundPoint);
  await expect(debugReadout).toContainText(/· y 0\.00 ·/);
  await expect(topBar.getByRole('button', {name: '−1', exact: true})).toHaveClass(/on/);
  await topBar.getByLabel('Debug coordinates', {exact: true}).uncheck();
  await expect(debugReadout).toHaveCount(0);
  await expect(topBar.getByRole('button', { name: '−1', exact: true })).toHaveClass(/on/);
  await page.locator('app-bando-editor .palette button[title^="Select ·"]').click();
  await page.locator('app-site-view .vertex-access summary').click();
  const vertexControls = page.locator('app-site-view .vertex-access .vertex-key');
  await expect(vertexControls).toHaveCount(4);
  await vertexControls.nth(1).focus();
  await page.keyboard.press('Insert');
  await expect(vertexControls).toHaveCount(5);
  await vertexControls.nth(2).focus();
  await page.keyboard.press('Delete');
  await expect(vertexControls).toHaveCount(4);
  await vertexControls.nth(1).focus();
  await page.keyboard.press('ArrowRight');
  const studioAxe = await new AxeBuilder({ page }).include('app-site-view').withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
  expect(studioAxe.violations.map(v => v.id)).toEqual([]);
  await page.locator('[data-tour="view-2d"]').click();
  await expect(page.locator('[data-pk="basement-vertex:1"]')).not.toHaveAttribute('cx', pre3dX!);
  await topBar.getByRole('button', { name: 'G', exact: true }).click();
  await expect(height).toHaveValue('4');
  await expect(page.locator('[data-pk="col:0"]')).toHaveCount(0);
  await topBar.getByRole('button', { name: '−1', exact: true }).click();
  await expect(height).toHaveValue('3.5');
  await expect(page.locator('[data-pk="col:0"]')).toHaveCount(1);
  await topBar.locator('button[title^="Take the roof off"]').click();
  const roof = inspector.locator('.sec').filter({ has: page.locator('.st').filter({ hasText: /^Roof$/ }) });
  const roofShape = roof.locator('select');
  await expect(roofShape).toBeVisible();
  await roofShape.selectOption('vault');
  await expect(inspector.getByLabel('ruined %', { exact: true })).toHaveValue('55');
  await expect(
    inspector.getByText('Roof removed by ruin or open shell. Choosing a shape restores it.', {
      exact: true,
    }),
  ).toHaveCount(0);
  await page.locator('[data-tour="view-3d"]').click();
  await expect(page.locator('app-site-view app-camera-compass')).toBeVisible();
  const compass = page.locator('app-site-view app-camera-compass button');
  const compassBox = await compass.boundingBox(), viewBox = await page.locator('app-site-view').boundingBox();
  expect(compassBox).not.toBeNull(); expect(viewBox).not.toBeNull();
  expect(compassBox!.x - viewBox!.x).toBeLessThan(30);
  expect(viewBox!.y + viewBox!.height - (compassBox!.y + compassBox!.height)).toBeLessThan(30);
  await compass.focus();
  await compass.press('Enter');
  const needle = compass.locator('.needle');
  await expect.poll(async () => Math.abs(parseFloat((await needle.getAttribute('style'))?.match(/rotate\(([-.\d]+)/)?.[1] ?? '999'))).toBeLessThan(1);
  await compass.press('ArrowRight');
  await expect.poll(async () => Math.abs(parseFloat((await needle.getAttribute('style'))?.match(/rotate\(([-.\d]+)/)?.[1] ?? '0'))).toBeGreaterThan(3);
  await compass.click();
  await expect.poll(async () => Math.abs(parseFloat((await needle.getAttribute('style'))?.match(/rotate\(([-.\d]+)/)?.[1] ?? '999'))).toBeLessThan(1);
  await page.locator('app-bando-editor .palette button[title^="Measure"]').click();
  const canvas = page.locator('app-site-view canvas');
  const bounds = await canvas.boundingBox();
  expect(bounds).not.toBeNull();
  await canvas.click({ position: { x: bounds!.width * 0.35, y: bounds!.height * 0.8 }, force: true });
  await canvas.click({ position: { x: bounds!.width * 0.55, y: bounds!.height * 0.8 }, force: true });
  const measure = page.getByRole('group', { name: 'Measures' }).getByRole('button').first();
  await expect(measure).toHaveCount(1);
  await measure.focus();
  await measure.press('Enter');
  await expect(measure).toHaveAttribute('aria-pressed', 'true');
  await page.locator('[data-tour="view-2d"]').click();
  await expect(page.locator('[data-pk="meas:0"]')).toHaveCount(1);
  await page.locator('app-bando-editor .palette button[title^="Tree ·"]').click();
  await page.getByRole('button', { name: /^Vegetation:/ }).click();
  await page.getByRole('option', { name: /^Hedge/ }).click();
  const plan = page.locator('app-bando-editor svg.ov');
  const planBounds = await plan.boundingBox();
  expect(planBounds).not.toBeNull();
  await plan.click({ position: { x: planBounds!.width * 0.25, y: planBounds!.height * 0.75 }, force: true });
  await expect(page.locator('[data-pk^="fence:"]')).toHaveCount(1);
});

test('Reset UI restores hidden panels at default geometry without reopening closed panels', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/?lang=en');
  await page.getByRole('button', { name: 'Close Welcome', exact: true }).click();
  const views = page.locator('app-panel[data-id="views"]');
  await views.getByTitle('Show Timeline', { exact: true }).click();
  await views.getByTitle('Show Speed', { exact: true }).click();
  const timeline = page.locator('app-panel[data-id="timeline"]');
  const speed = page.locator('app-panel[data-id="speed"]');
  await expect(timeline).toBeVisible();
  await expect(speed).toBeVisible();
  const initial = await timeline.boundingBox();
  expect(initial).not.toBeNull();
  const grip = await timeline.locator('header.grip').boundingBox();
  expect(grip).not.toBeNull();
  await page.mouse.move(grip!.x + 70, grip!.y + grip!.height / 2);
  await page.mouse.down();
  await page.mouse.move(grip!.x + 190, grip!.y + grip!.height / 2 - 100, { steps: 6 });
  await page.mouse.up();
  await expect.poll(async () => (await timeline.boundingBox())!.x).toBeGreaterThan(initial!.x + 80);
  await timeline.getByRole('button', { name: 'Transparent', exact: true }).click();
  await timeline.getByRole('button', { name: 'Collapse / expand', exact: true }).click();
  await expect(timeline).toHaveClass(/ghost/);
  await expect(timeline).toHaveClass(/min/);
  await views.getByRole('button', { name: 'Hide every panel but this one', exact: true }).click();
  await expect(timeline).toBeHidden();
  await expect(speed).toBeHidden();
  // Repeated Hide all must not replace the saved working panel set with an empty one.
  await views.getByRole('button', { name: 'Hide every panel but this one', exact: true }).click();
  await views.getByRole('button', { name: 'Reset UI', exact: true }).click();
  await expect(timeline).toBeVisible();
  await expect(speed).toBeVisible();
  await expect(timeline).not.toHaveClass(/ghost|min/);
  await expect.poll(async () => Math.abs((await timeline.boundingBox())!.x - initial!.x)).toBeLessThan(2);
  await expect.poll(async () => Math.abs((await timeline.boundingBox())!.y - initial!.y)).toBeLessThan(2);
  await expect.poll(async () => Math.abs((await timeline.boundingBox())!.width - initial!.width)).toBeLessThan(2);
  const visibleIds = () => page.locator('app-panel:not([hidden])').evaluateAll(els => els.map(el => el.getAttribute('data-id')).sort());
  expect(await visibleIds()).toEqual(['speed', 'timeline', 'views']);
  await speed.getByRole('button', { name: 'Close Speed', exact: true }).click();
  await views.getByRole('button', { name: 'Reset UI', exact: true }).click();
  await expect(speed).toBeHidden();
  expect(await visibleIds()).toEqual(['timeline', 'views']);
});

for (const locale of [
  {lang: 'en', edit: 'Edit', open: 'Open the bandos', server: 'Server / home PC', notice: "The token is saved in this browser's local storage."},
  {lang: 'it', edit: 'Modifica', open: 'Apri i bando', server: 'Server / PC di casa', notice: 'Il token viene salvato nella memoria locale di questo browser.'},
]) {
  test(`AI token storage notice is visible and associated with its input (${locale.lang})`, async ({ page }) => {
    test.setTimeout(60_000);
    await page.addInitScript(lang => localStorage.setItem('abando-lang', lang), locale.lang);
    await page.goto(`/?lang=${locale.lang}`);
    await page.getByRole('button', {name: locale.open, exact: true}).click();
    // Opening Bandos shows the list; import and edit a local model before opening its assistant.
    const fixture = {
      version: 1, id: 'notice-yard', name: 'Notice yard', createdAt: 0, privacy: 'hidden',
      origin: {lat: 0, lon: 0}, bearingDeg: 0, genScale: 1, extent: 30, seed: 1,
      droneStart: {x: -10, z: 0}, calibCorners: {p1: {x: -15, z: -15}, p2: {x: 15, z: 15}},
      trees: [], pads: [], buildings: [{id: 'b', name: 'Shed', pos: {x: 0, z: 0}, rotDeg: 0,
        length: 10, width: 8, levels: [{baseY: 0, height: 3, sides: {n: true, s: true, e: true, w: true},
          doors: {}, partitions: [], roof: 'flat', roofRise: 0}]}],
    };
    const studio = page.locator('app-studio-panel');
    await studio.locator('input[type=file]').first().setInputFiles({name: 'notice.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(fixture))});
    await studio.locator('.card').filter({hasText: fixture.name}).getByRole('button', {name: locale.edit, exact: true}).click();
    await page.locator('app-bando-editor [data-tour="ai"]').click();
    const assistant = page.locator('app-assistant-box');
    await assistant.getByRole('button', {name: locale.server, exact: true}).click();
    const token = assistant.locator('input[type="password"]');
    await expect(assistant.locator('#ai-token-storage')).toHaveText(locale.notice);
    await expect(assistant.locator('#ai-token-storage')).toBeVisible();
    await expect(token).toHaveAccessibleDescription(locale.notice);
    await token.fill('regression-test-token');
    await token.press('Tab');
    await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('abando-ai-server') ?? '{}').token)).toBe('regression-test-token');
  });
}


for (const rotation of [0, 37]) {
  test(`diagonal partitions and edited basement survive real export/import (${rotation} degrees)`, async ({ page }, testInfo) => {
    test.setTimeout(180_000);
    await page.emulateMedia({reducedMotion: 'reduce'});
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    const partition = [{x: 1, z: 1}, {x: 12, z: 8}];
    const fixture = {
      version: 1, id: `diagonal-yard-${rotation}`, name: `Diagonal yard ${rotation}`, createdAt: 0,
      privacy: 'hidden', origin: {lat: 0, lon: 0}, bearingDeg: 0, genScale: 1,
      extent: 60, seed: 1, droneStart: {x: -20, z: 0}, trees: [], pads: [],
      calibCorners: {p1: {x: -30, z: -30}, p2: {x: 30, z: 30}},
      buildings: [{id: 'b', name: 'Shed', pos: {x: 0, z: 0}, rotDeg: rotation, length: 14, width: 10,
        basement: {height: 3, partitions: [partition]},
        levels: [{baseY: 0, height: 4, sides: {n: true, s: true, e: true, w: true},
          doors: {}, partitions: [partition], roof: 'flat', roofRise: 0}]}],
    };
    await page.goto('/?lang=en');
    await page.getByRole('button', {name: 'Open the bandos', exact: true}).click();
    const studio = page.locator('app-studio-panel');
    const upload = async (buffer: Buffer): Promise<void> => {
      await studio.locator('input[type=file]').first().setInputFiles({name: 'diagonal.bando.json', mimeType: 'application/json', buffer});
    };
    const card = studio.locator('.card').filter({hasText: fixture.name});
    await upload(Buffer.from(JSON.stringify(fixture)));
    await card.getByRole('button', {name: 'Edit', exact: true}).click();
    const bar = page.locator('app-bando-editor > .bar');
    const inspector = page.locator('[data-tour="inspector"]');
    await page.locator('[data-pk="building:b"]').first().click({force: true});
    await bar.getByRole('button', {name: 'Indoors', exact: true}).click();
    const wall = page.locator('[data-pk="wall:0"]');
    const checkWall = async (): Promise<void> => {
      await expect(wall).toHaveCount(1);
      for (const [attr, value] of [['x1', '-6'], ['y1', '-4'], ['x2', '5'], ['y2', '3']])
        await expect(wall).toHaveAttribute(attr!, value!);
    };
    await checkWall();
    // The same local diagonal must survive floor isolation and the rotated building transform.
    for (const floor of ['G', '−1']) {
      if (floor === '−1') await bar.getByRole('button', {name: floor, exact: true}).click();
      await checkWall();
      await page.locator('[data-tour="view-3d"]').click();
      await expect(page.locator('app-site-view canvas')).toBeVisible();
      await expect(page.locator('app-site-view .fail')).toHaveCount(0);
      await testInfo.attach(`diagonal-${rotation}-${floor}`, {body: await page.locator('app-site-view').screenshot(), contentType: 'image/png'});
      await page.locator('[data-tour="view-2d"]').click();
      await checkWall();
    }
    const vertex = page.locator('[data-pk="basement-vertex:1"]');
    const oldZ = await vertex.getAttribute('cy');
    await vertex.focus();
    await page.keyboard.press('ArrowDown');
    await expect(vertex).not.toHaveAttribute('cy', oldZ!);
    const changedZ = await vertex.getAttribute('cy');
    await bar.getByTitle('Undo (Ctrl+Z)', {exact: true}).click();
    await expect(vertex).toHaveAttribute('cy', oldZ!);
    await bar.getByTitle('Redo', {exact: true}).click();
    await expect(vertex).toHaveAttribute('cy', changedZ!);
    const expectedOutline = await page.locator('[data-pk^="basement-vertex:"]').evaluateAll(els => els.map(el => ({x: Number(el.getAttribute('cx')), z: Number(el.getAttribute('cy'))})));
    await bar.getByRole('button', {name: 'Save', exact: true}).click();
    await bar.getByRole('button', {name: '← Bandos', exact: true}).click();
    const downloading = page.waitForEvent('download');
    await card.getByRole('button', {name: 'Export', exact: true}).click();
    const download = await downloading;
    const filename = await download.path();
    expect(filename).not.toBeNull();
    const bytes = await readFile(filename!);
    const exported = JSON.parse(bytes.toString()) as SiteSpec;
    expect(exported.buildings[0]!.basement!.outline).toEqual(expectedOutline);
    expect(exported.buildings[0]!.basement!.partitions).toEqual([partition]);
    expect(exported.buildings[0]!.levels[0]!.partitions).toEqual([partition]);
    // Remove only this test fixture so re-import cannot accidentally reopen the original saved copy.
    page.once('dialog', dialog => dialog.accept());
    await card.getByRole('button', {name: 'Delete', exact: true}).click();
    await expect(card).toHaveCount(0);
    await upload(bytes);
    await card.getByRole('button', {name: 'Edit', exact: true}).click();
    await page.locator('[data-pk="building:b"]').first().click({force: true});
    await inspector.getByRole('button', {name: '−1', exact: true}).click();
    await bar.getByRole('button', {name: 'Indoors', exact: true}).click();
    await expect(vertex).toHaveAttribute('cy', changedZ!);
    await checkWall();
    await expect(bar.getByRole('button', {name: '−1', exact: true})).toHaveClass(/on/);
    if (rotation === 0) {
      // Wheel events over the SVG used to stop at zoom 21 despite the map allowing 25.
      const plan = page.locator('app-bando-editor svg.ov');
      await plan.evaluate(el => {
        const box = el.getBoundingClientRect();
        for (let i = 0; i < 30; i++) el.dispatchEvent(new WheelEvent('wheel', {
          deltaY: -100, clientX: box.x + box.width / 2, clientY: box.y + box.height / 2,
          bubbles: true, cancelable: true,
        }));
      });
      await expect.poll(() => plan.evaluate(el => Math.abs((el as SVGSVGElement).getScreenCTM()!.a))).toBeGreaterThan(100);
      // A basement selection orbits around its underground centre. Clear it before a ground-level zoom test.
      await page.locator('[data-tour="view-3d"]').click();
      await bar.getByRole('button', {name: /Indoors/}).click();
      let canvas = page.locator('app-site-view canvas');
      const overview = await canvas.boundingBox();
      expect(overview).not.toBeNull();
      await canvas.click({position: {x: overview!.width * 0.9, y: overview!.height * 0.1}});
      await expect(inspector.locator('app-element-preview')).toHaveCount(0);
      // Recreate the view with no selected-object target so the camera orbits the ground origin.
      await page.locator('[data-tour="view-2d"]').click();
      await page.locator('[data-tour="view-3d"]').click();
      await bar.getByLabel('Debug coordinates', {exact: true}).check();
      canvas = page.locator('app-site-view canvas');
      const box = await canvas.boundingBox();
      expect(box).not.toBeNull();
      const readout = page.locator('.debug-readout');
      // A successful pick establishes renderer readiness before dispatching the wheel event.
      await canvas.click({position: {x: box!.width * 0.5, y: box!.height * 0.5}});
      await expect(readout).toContainText(/x [-\d.]+ · y 0\.00 · z [-\d.]+ m/);
      await canvas.dispatchEvent('wheel', {deltaY: -999});
      const sample = async (u: number): Promise<number[]> => {
        const previous = await readout.count() ? await readout.innerText() : null;
        await canvas.click({position: {x: box!.width * u, y: box!.height * 0.5}});
        await expect(readout).toContainText(/x [-\d.]+ · y 0\.00 · z [-\d.]+ m/);
        if (previous) await expect(readout).not.toHaveText(previous);
        return (await readout.innerText()).match(/-?\d+\.\d+/g)!.map(Number);
      };
      // Real pointer actions own their actionability waits; do not put two slow WebGL clicks
      // inside a five-second assertion poll, which can expire before the second action completes.
      const a = await sample(0.45), b = await sample(0.55);
      const distance = Math.hypot(a[0]! - b[0]!, a[2]! - b[2]!);
      expect(distance, JSON.stringify({a, b})).toBeLessThan(0.1);
      expect(distance).toBeGreaterThan(0);
      await bar.getByLabel('Debug coordinates', {exact: true}).uncheck();
    }
    expect(errors).toEqual([]);
  });
}

test('basement Cut preserves open perimeter spans in plan and 3D', async ({page}) => {
  test.setTimeout(120_000);
  await page.emulateMedia({reducedMotion: 'reduce'});
  await page.goto('/');
  await page.getByRole('button', {name: 'Open the bandos', exact: true}).click();
  const fixture={version:1,id:'open-wall-yard',name:'Open wall yard',createdAt:0,privacy:'hidden',
    origin:{lat:0,lon:0},bearingDeg:0,genScale:1,extent:40,seed:1,droneStart:{x:-12,z:0},
    calibCorners:{p1:{x:-20,z:-20},p2:{x:20,z:20}},trees:[],pads:[],
    buildings:[{id:'b',name:'Shed',pos:{x:0,z:0},rotDeg:0,length:10,width:8,basement:{height:3,sides:{e:false},columns:[{x:1,z:1,size:.5}]},
      levels:[{baseY:0,height:4,sides:{n:true,s:true,e:true,w:true},doors:{},partitions:[],roof:'flat',roofRise:0}]}]};
  const studio=page.locator('app-studio-panel');
  await studio.locator('input[type=file]').first().setInputFiles({name:'open-wall.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(fixture))});
  await studio.locator('.card').filter({hasText:fixture.name}).getByRole('button',{name:'Edit',exact:true}).click();
  await page.locator('[data-pk="building:b"]').first().click({force:true});
  const inspector=page.locator('[data-tour="inspector"]'),bar=page.locator('app-bando-editor > .bar');
  await inspector.getByRole('button',{name:'−1',exact:true}).click();
  await bar.getByRole('button',{name:'Indoors',exact:true}).click();
  const length=inspector.getByLabel('length m',{exact:true}).last();
  await length.fill('14');await length.press('Tab');
  await expect(length).toHaveValue('14');
  await expect(inspector.getByLabel('Perimeter edge 2',{exact:true})).not.toBeChecked();
  await inspector.getByRole('button',{name:'Use building footprint',exact:true}).click();
  await expect(length).toHaveValue('10');
  await expect(inspector.getByLabel('Perimeter edge 2',{exact:true})).not.toBeChecked();
  await length.fill('2');await length.press('Tab');
  await expect(length).toHaveValue('10'); // rejected shrink displays the actual retained size
  await expect(page.locator('[data-pk="col:0"]')).toHaveCount(1);
  await page.locator('app-bando-editor .palette button[title^="Cut ·"]').click();
  const points=await page.locator('app-bando-editor svg.ov').evaluate(el=>{
    const matrix=(el as SVGSVGElement).getScreenCTM()!;
    return [[2,-1],[6,1]].map(([x,z])=>{const p=new DOMPoint(x,z).matrixTransform(matrix);return {x:p.x,y:p.y};});
  });
  await page.mouse.move(points[0]!.x,points[0]!.y);
  await page.mouse.down();
  await page.mouse.move(points[1]!.x,points[1]!.y,{steps:5});
  await page.mouse.up();
  await page.locator('app-bando-editor .palette button[title^="Select ·"]').click();
  await expect(page.locator('[data-pk^="basement-vertex:"]')).toHaveCount(8);
  const edges=inspector.getByLabel(/^Perimeter edge \d+$/);
  await expect(edges).toHaveCount(8);
  await expect.poll(()=>edges.evaluateAll(els=>els.filter(el=>!(el as HTMLInputElement).checked).length)).toBe(2);
  await page.locator('[data-tour="view-3d"]').click();
  await expect(page.locator('app-site-view canvas')).toBeVisible();
  await expect(page.locator('app-site-view .fail')).toHaveCount(0);
  await page.locator('app-site-view .vertex-access summary').click();
  await expect(page.locator('app-site-view .vertex-key')).toHaveCount(8);
});


test('Views promotes workflow panels and scopes camera controls to the 3D main page', async ({page}) => {
  await page.goto('/');
  await page.getByRole('button', {name: 'Close Welcome', exact: true}).click();
  const views = page.locator('app-views-panel');
  const quick = views.locator('.quick [data-panel]');
  await expect(quick).toHaveCount(4);
  expect(await quick.evaluateAll(els => els.map(el => el.getAttribute('data-panel')))).toEqual(['flights', 'timeline', 'video', 'studio']);
  await expect(views.locator('.quick [data-panel="studio"]')).toHaveAttribute('class', /^vis( on)?$/);
  for (const name of ['Telemetry', 'Simulator', 'Tools'])
    await expect(views.getByRole('button', {name: '▾ ' + name, exact: true})).toHaveAttribute('aria-expanded', 'false');
  await expect(views.locator('.options')).not.toHaveAttribute('open');
  await views.getByRole('radio', {name: 'Video', exact: true}).check();
  await expect(views.getByRole('group', {name: 'Main page camera', exact: true})).toHaveCount(0);
  await views.getByRole('radio', {name: '3D model', exact: true}).check();
  await expect(views.getByRole('group', {name: 'Main page camera', exact: true})).toBeVisible();
  await views.locator('.options > summary').click();
  const options = views.getByRole('group', {name: 'View options', exact: true});
  await expect(options.locator('app-tool-icon svg').first()).toHaveAttribute('width', '18');
  await views.getByRole('group', {name: 'Main page camera', exact: true}).getByRole('button', {name: 'FPV', exact: true}).click();
  await expect(views.getByText('Follow replay', {exact: true})).toHaveCount(0);
  await expect(options.getByRole('button', {name: 'Follow the replay (Chase & FPV)', exact: true})).toBeVisible();
});


test('a shown panel is fully opaque even when its entrance animation stalls', async ({page}) => {
  // Frames stall when the 3D scene loads the main thread (or the page is not painted): freeze every entrance at its start.
  const frozen = () => page.evaluate(() => {
    for (const a of document.getAnimations()) if (String((a as CSSAnimation).animationName ?? '').includes('panel-in')) { a.pause(); a.currentTime = 0; }
  });
  const opacity = (id: string) => page.locator(`app-panel[data-id="${id}"]`).evaluate(el => getComputedStyle(el).opacity);
  await page.addInitScript(() => localStorage.setItem('openbando-welcome', JSON.stringify({completed: true})));
  await page.goto('/');
  await page.locator('app-welcome-panel footer').getByRole('button', {name: 'Open the bandos', exact: true}).click();
  await frozen();
  await expect(page.locator('app-panel[data-id="views"]')).toBeVisible();
  expect(await opacity('views')).toBe('1');
  expect(await opacity('studio')).toBe('1');
  await page.getByRole('button', {name: 'Close Views', exact: true}).click();
  await page.getByRole('button', {name: 'Open the Views panel', exact: true}).click();
  await frozen();
  expect(await opacity('views')).toBe('1');
  await expect(page.getByRole('button', {name: 'Open the Views panel', exact: true})).toHaveCount(0);
});
