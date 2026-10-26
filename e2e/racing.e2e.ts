import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.beforeEach(async ({ page }) => {
  // Neutral open-sea fixture, positioned near the blank world's origin without an external map request.
  await page.addInitScript(() =>
    localStorage.setItem(
      'abando-ng-cal',
      JSON.stringify({ rot: 0, dx: -111320 * Math.cos(Math.PI / 180), dz: 111132, modelScale: 1 }),
    ),
  );
  await page.goto('/');
  await page.getByRole('button', { name: 'Load a log', exact: true }).click();
  await page.locator('app-racing-controls > details > summary').click();
});
test('two logs: identity colours, race delay, lap gate and portable export/import', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  const points = Array.from({ length: 30 }, (_, i) => ({
    lat: 1,
    lon: 1 + i * 0.00001,
    alt: 2,
    t: i * 0.5,
  }));
  await page
    .locator('app-flights-panel input[multiple]')
    .setInputFiles(
      ['A', 'B'].map((name) => ({
        name: `${name}.json`,
        mimeType: 'application/json',
        buffer: Buffer.from(JSON.stringify(points)),
      })),
    );
  const panel = page.locator('app-racing-controls');
  await panel.getByLabel('Show racing ghosts', { exact: true }).check();
  await expect(panel.locator('.pilot')).toHaveCount(2);
  await panel.getByLabel('Start delay (s)', { exact: true }).nth(1).fill('2');
  await panel.getByLabel('Start delay (s)', { exact: true }).nth(1).press('Tab');
  await panel.getByLabel('Closed loop', { exact: true }).first().check();
  await panel.getByRole('button', { name: 'Set start gate', exact: true }).first().click();
  await expect(panel.getByLabel('Gate width (m)', { exact: true })).toBeVisible();
  await panel.getByRole('button', { name: 'Play race', exact: true }).click();
  await expect(panel.getByRole('button', { name: 'Pause race', exact: true })).toBeVisible();
  await panel.getByRole('button', { name: 'Pause race', exact: true }).click();
  const download = page.waitForEvent('download');
  await panel.getByRole('button', { name: 'Export race', exact: true }).click();
  const file = await (await download).path();
  expect(file).toBeTruthy();
  await page.getByRole('button', { name: 'Clear paths', exact: true }).click();
  await panel.locator('input[type=file]').setInputFiles(file!);
  await expect(panel.locator('.pilot')).toHaveCount(2);
  await expect(panel.getByLabel('Start delay (s)', { exact: true }).nth(1)).toHaveValue('2');
  expect(errors).toEqual([]);
  const axe = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .include('app-racing-controls')
    .analyze();
  expect(axe.violations.map((v) => v.id)).toEqual([]);
});
test('two independent live URLs produce two pilots and disconnect retains the recording', async ({
  page,
}) => {
  const timers: ReturnType<typeof setTimeout>[] = [];
  for (const host of ['source-a', 'source-b'])
    await page.routeWebSocket(`ws://${host}.test/`, (route) => {
      route.send(JSON.stringify({ lat: 1.001, lon: 1.001, alt: 2, sats: 10 }));
      timers.push(
        setTimeout(
          () => route.send(JSON.stringify({ lat: 1.00101, lon: 1.00102, alt: 3, sats: 10 })),
          350,
        ),
      );
    });
  const panel = page.locator('app-racing-controls');
  await panel.getByText('Multiple live sources', { exact: true }).click();
  for (const [host, name] of [
    ['source-a', 'Alice'],
    ['source-b', 'Bob'],
  ]) {
    await panel.getByLabel('Pilot name', { exact: true }).fill(name!);
    await panel.getByLabel('Telemetry URL', { exact: true }).fill(`ws://${host}.test/`);
    await panel.getByRole('button', { name: 'Add live source', exact: true }).click();
  }
  await expect(panel.locator('.pilot')).toHaveCount(2);
  await expect(panel.getByLabel('Pilot name: Alice', { exact: true })).toBeVisible();
  await expect(panel.getByLabel('Pilot name: Bob', { exact: true })).toBeVisible();
  await panel.getByRole('button', { name: 'Disconnect', exact: true }).first().click();
  await expect(panel.locator('.pilot')).toHaveCount(2);
  timers.forEach(clearTimeout);
});
