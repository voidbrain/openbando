import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('Welcome keeps the ASCII title, Features link and revised pose assets', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'OpenBando', exact: true })).toBeVisible();
  await expect(page.locator('app-welcome-panel .wordmark')).toContainText('###');
  const asset = await page.request.get('/mascot/poses/16-confused-a.png');
  expect(asset.ok()).toBe(true);
  await expect(page.getByRole('button', { name: 'Explore features' })).toBeVisible();
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
  await expect(inspector.getByText('Basement · −1', { exact: true })).toBeVisible();
  await inspector.getByLabel('length m', { exact: true }).last().fill('8');
  await inspector.getByLabel('length m', { exact: true }).last().press('Tab');
  await expect(inspector.getByLabel('length m', { exact: true }).last()).toHaveValue('8');
  await inspector.getByRole('button', { name: 'Add basement wall', exact: true }).click();
  await expect(
    inspector.getByRole('button', { name: 'Delete basement wall', exact: true }),
  ).toBeVisible();
  await inspector.getByLabel('shape', { exact: true }).selectOption('vault');
  await expect(inspector.getByLabel('ruined %', { exact: true })).toHaveValue('55');
  await expect(
    inspector.getByText('Roof removed by ruin or open shell. Choosing a shape restores it.', {
      exact: true,
    }),
  ).toHaveCount(0);
});
