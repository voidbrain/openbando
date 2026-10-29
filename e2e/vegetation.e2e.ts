import {expect, test, type Locator, type Page} from '@playwright/test';
import {readFile} from 'node:fs/promises';
import type {SiteSpec} from '../src/app/core/site-spec';

/** A nearly empty, place-hidden bando in the editor (one tree in a corner: an empty bando opens on the Area step). */
async function openEmpty(page: Page) {
  await page.emulateMedia({reducedMotion: 'reduce'});
  await page.goto('/');
  await page.getByRole('button', {name: 'Open the bandos', exact: true}).click();
  const fixture = {
    version: 1, id: 'vegetation', name: 'Vegetation brush', createdAt: 0, privacy: 'hidden',
    origin: {lat: 0, lon: 0}, bearingDeg: 0, genScale: 1, extent: 60, seed: 1,
    droneStart: {x: -25, z: 25}, calibCorners: {p1: {x: -30, z: -30}, p2: {x: 30, z: 30}},
    trees: [{x: 28, z: -28, h: 8, r: 3, kind: 'd'}], pads: [], buildings: [],
  };
  const studio = page.locator('app-studio-panel');
  await studio.locator('input[type=file]').first().setInputFiles({
    name: 'vegetation.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(fixture)),
  });
  const card = studio.locator('.card').filter({hasText: fixture.name});
  await card.getByRole('button', {name: 'Edit', exact: true}).click();
  const bar = page.locator('app-bando-editor > .bar');
  const entry = async (name: string): Promise<void> => {
    const group = page.locator('app-bando-editor .palette .pbtn[data-tour~="tool-scatter"]');
    if ((await group.getAttribute('title'))?.startsWith(name)) await group.click();
    else {
      await group.click({button: 'right'});
      await page.locator('app-bando-editor .palette .fly').getByRole('button', {name, exact: true}).click();
    }
    await expect(group).toHaveClass(/on/);
  };
  const vegetation = async (kind: RegExp): Promise<void> => {
    await page.getByRole('button', {name: /^Vegetation:/}).click();
    await page.getByRole('option', {name: kind}).click();
  };
  const exported = async (): Promise<SiteSpec> => {
    await bar.getByRole('button', {name: 'Save', exact: true}).click();
    await bar.getByRole('button', {name: '← Bandos', exact: true}).click();
    const downloading = page.waitForEvent('download');
    await card.getByRole('button', {name: 'Export', exact: true}).click();
    return JSON.parse((await readFile((await (await downloading).path())!)).toString()) as SiteSpec;
  };
  return {bar, entry, vegetation, exported};
}

test('the vegetation brush plants hedges in 2D and brambles in 3D, one undo step per stroke', async ({page}, testInfo) => {
  test.setTimeout(180_000);
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  const {bar, entry, vegetation, exported} = await openEmpty(page);
  const fences = page.locator('[data-pk^="fence:"]');
  // Kept in the test output (and the CI report) for a visual review of the brush shapes in both views.
  const shot = async (name: string, of: Page | Locator = page): Promise<void> => {
    const path = testInfo.outputPath(`${name}.png`);
    await of.screenshot({path});
    await testInfo.attach(name, {path, contentType: 'image/png'});
  };

  // 2D: a hedge square. The dashed preview follows the drag before anything is planted.
  await entry('Tree area · square');
  await vegetation(/^Hedge/);
  const plan = page.locator('app-bando-editor svg.ov');
  const p = (await plan.boundingBox())!;
  await page.mouse.move(p.x + p.width * 0.30, p.y + p.height * 0.30);
  await page.mouse.down();
  await page.mouse.move(p.x + p.width * 0.55, p.y + p.height * 0.55, {steps: 8});
  await expect(plan.locator('polygon[stroke-dasharray="6 4"]')).toHaveCount(1);
  await shot('2d-preview');
  await page.mouse.up();
  await expect(page.getByText(/shrubs planted\. Undo removes the whole stroke\./)).toBeVisible();
  const hedges = await fences.count();
  expect(hedges).toBeGreaterThan(1);
  await shot('2d-hedges');
  await bar.getByTitle('Undo (Ctrl+Z)', {exact: true}).click();
  await expect(fences).toHaveCount(0);
  await bar.getByTitle('Redo', {exact: true}).click();
  await expect(fences).toHaveCount(hedges);

  // 3D: a bramble circle dragged on the canvas.
  await page.locator('[data-tour="view-3d"]').click();
  const canvas = page.locator('app-site-view canvas');
  await expect(canvas).toBeVisible();
  await entry('Tree area · circle');
  await vegetation(/^Bramble/);
  const c = (await canvas.boundingBox())!;
  await page.mouse.move(c.x + c.width * 0.65, c.y + c.height * 0.70);
  await page.mouse.down();
  await page.mouse.move(c.x + c.width * 0.75, c.y + c.height * 0.72, {steps: 8});
  await shot('3d-preview', canvas);
  await page.mouse.up();
  await expect(page.getByText(/shrubs planted/).last()).toBeVisible();
  await shot('3d-brambles');
  await page.locator('[data-tour="view-2d"]').click();
  const all = await fences.count();
  expect(all).toBeGreaterThan(hedges);

  const saved = await exported();
  const materials = (saved.walls ?? []).map(w => w.material);
  expect(materials.filter(m => m === 'hedge')).toHaveLength(hedges);
  expect(materials.filter(m => m === 'bramble')).toHaveLength(all - hedges);
  expect(errors).toEqual([]);
});
