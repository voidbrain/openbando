import {expect, test} from '@playwright/test';

/** Every tool on offer has its own palette button, two to a row: nothing waits behind a long press or a right click. */
test('the tool palette shows every outdoor tool, two to a row', async ({page}) => {
  await page.emulateMedia({reducedMotion: 'reduce'});
  await page.goto('/');
  await page.getByRole('button', {name: 'Open the bandos', exact: true}).click();
  const fixture = {
    version: 1, id: 'palette', name: 'Palette yard', createdAt: 0, privacy: 'hidden',
    origin: {lat: 0, lon: 0}, bearingDeg: 0, genScale: 1, extent: 40, seed: 1, trees: [], pads: [],
    buildings: [{id: 'b', name: 'Shed', pos: {x: 0, z: 0}, rotDeg: 0, length: 12, width: 8,
      levels: [{baseY: 0, height: 4, sides: {n: true, s: true, e: true, w: true}, doors: {}, partitions: [], roof: 'flat', roofRise: 0}]}],
  };
  const studio = page.locator('app-studio-panel');
  await studio.locator('input[type=file]').first().setInputFiles({name: 'p.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(fixture))});
  await studio.locator('.card').filter({hasText: fixture.name}).getByRole('button', {name: 'Edit', exact: true}).click();
  const palette = page.getByRole('toolbar', {name: 'Tools'});
  const names = ['Select', 'Measure', 'Building', 'Merge', 'Cut', 'Wing', 'FPV gates and poles', 'Structure', 'Tree', 'Tree brush', 'Fence', 'Road', 'Surface', 'Water', 'Terrain', 'Tunnel'];
  for (const name of names) await expect(palette.getByRole('button', {name, exact: true})).toBeVisible();
  // two to a row: Wing sits beside Cut
  const cut = (await palette.getByRole('button', {name: 'Cut', exact: true}).boundingBox())!;
  const wing = (await palette.getByRole('button', {name: 'Wing', exact: true}).boundingBox())!;
  expect(Math.abs(cut.y - wing.y)).toBeLessThan(1);
  expect(wing.x).toBeGreaterThan(cut.x);
  // one click arms a tool; the terrain operation is chosen in its options bar
  await palette.getByRole('button', {name: 'Wing', exact: true}).click();
  await expect(palette.getByRole('button', {name: 'Wing', exact: true})).toHaveAttribute('aria-pressed', 'true');
  await palette.getByRole('button', {name: 'Terrain', exact: true}).click();
  await page.getByRole('button', {name: /^Shape the ground:/}).click();
  await page.getByRole('option', {name: /^Flatten/}).click();
  await expect(page.getByRole('button', {name: /^Shape the ground: Flatten/})).toBeVisible();
});
