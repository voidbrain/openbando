import {expect, test} from '@playwright/test';

/** A menu in an options bar dragged to the bottom of the editor opens upwards and stays inside the editor (B-031, reopened). */
test('menu in an options bar at the bottom of the editor opens upward, inside the editor', async ({page}) => {
  await page.emulateMedia({reducedMotion: 'reduce'});
  await page.goto('/');
  await page.getByRole('button', {name: 'Open the bandos', exact: true}).click();
  const fixture = {version: 1, id: 'm', name: 'Menu clip', createdAt: 0, privacy: 'hidden', origin: {lat: 0, lon: 0}, bearingDeg: 0, genScale: 1, extent: 40, seed: 1, trees: [], pads: [],
    buildings: [{id: 'b', name: 'Shed', pos: {x: 0, z: 0}, rotDeg: 0, length: 8, width: 6, levels: [{baseY: 0, height: 4, sides: {n: true, s: true, e: true, w: true}, doors: {}, partitions: [], roof: 'flat', roofRise: 0}]}]};
  const studio = page.locator('app-studio-panel');
  await studio.locator('input[type=file]').first().setInputFiles({name: 'm.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(fixture))});
  await studio.locator('.card').filter({hasText: fixture.name}).getByRole('button', {name: 'Edit', exact: true}).click();
  await page.getByRole('toolbar', {name: 'Tools'}).getByRole('button', {name: 'Tree', exact: true}).click();
  const opts = page.locator('app-bando-editor .opts');
  const work = page.locator('app-bando-editor [data-tour=map]');
  const w = (await work.boundingBox())!;
  const grip = opts.locator('.tgrip');
  const g = (await grip.boundingBox())!;
  await page.mouse.move(g.x + g.width / 2, g.y + g.height / 2);
  await page.mouse.down();
  await page.mouse.move(g.x + g.width / 2, w.y + w.height - 6, {steps: 6});
  await page.mouse.up();
  await opts.getByRole('button', {name: /^Vegetation:/}).click();
  const list = opts.getByRole('listbox');
  await expect(list).toHaveClass(/up/);
  const l = (await list.boundingBox())!;
  expect(l.y).toBeGreaterThanOrEqual(w.y - 1);
  expect(l.y + l.height).toBeLessThanOrEqual(w.y + w.height + 1);
});
