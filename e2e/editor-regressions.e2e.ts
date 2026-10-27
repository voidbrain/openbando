import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('Welcome shows the approved wordmark, Features link and revised pose assets', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'OpenBando', exact: true })).toBeVisible();
  await expect(page.locator('app-stage app-camera-compass')).toBeVisible();
  const wordmark = page.getByRole('img', { name: 'OpenBando', exact: true });
  await expect(wordmark).toBeVisible();
  await expect(wordmark).toHaveJSProperty('complete', true);
  await expect.poll(() => wordmark.evaluate((img: HTMLImageElement) => img.naturalWidth)).toBeGreaterThan(0);
  const asset = await page.request.get('/mascot/poses/16-confused-a.png');
  expect(asset.ok()).toBe(true);
  await expect(page.getByRole('button', { name: 'Features' })).toBeVisible();
  const axe = await new AxeBuilder({ page })
    .include('app-welcome-panel')
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
  expect(axe.violations.map((v) => v.id)).toEqual([]);
  expect(errors).toEqual([]);
});

test('basement controls and explicit roof choice update the selected building', async ({
  page,
}) => {
  test.setTimeout(90_000);
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
  await page.locator('[data-pk="building:b"]').first().click({ force: true });
  const inspector = page.locator('[data-tour="inspector"]');
  await inspector.getByRole('button', { name: '−1', exact: true }).click();
  await expect(inspector.locator('.st').filter({ hasText: /^Basement · −1$/ })).toBeVisible();
  await inspector.getByLabel('length m', { exact: true }).last().fill('8');
  await inspector.getByLabel('length m', { exact: true }).last().press('Tab');
  await expect(inspector.getByLabel('length m', { exact: true }).last()).toHaveValue('8');
  await inspector.getByRole('button', { name: 'Add basement wall', exact: true }).click();
  await expect(
    inspector.getByRole('button', { name: 'Delete basement wall', exact: true }),
  ).toBeVisible();
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
