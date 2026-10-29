import {expect, test} from '@playwright/test';
import {readFile} from 'node:fs/promises';
import type {SiteSpec} from '../src/app/core/site-spec';

test('the Courtyard tool adds a courtyard on −1 only, with undo, delete and export', async ({page}, testInfo) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.emulateMedia({reducedMotion: 'reduce'});
  await page.goto('/');
  await page.getByRole('button', {name: 'Open the bandos', exact: true}).click();
  const fixture = {
    version: 1, id: 'courtyard', name: 'Courtyard hall', createdAt: 0, privacy: 'hidden',
    origin: {lat: 0, lon: 0}, bearingDeg: 0, genScale: 1, extent: 50, seed: 1, trees: [], pads: [],
    buildings: [{id: 'b', name: 'Hall', pos: {x: 0, z: 0}, rotDeg: 0, length: 24, width: 18, basement: {height: 3},
      levels: [{baseY: 0, height: 4, sides: {n: true, s: true, e: true, w: true}, doors: {}, partitions: [], roof: 'flat', roofRise: 0}]}],
  };
  const studio = page.locator('app-studio-panel');
  await studio.locator('input[type=file]').first().setInputFiles({name: 'c.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(fixture))});
  const card = studio.locator('.card').filter({hasText: fixture.name});
  await card.getByRole('button', {name: 'Edit', exact: true}).click();
  await page.locator('[data-pk="building:b"]').first().click({force: true});
  const inspector = page.locator('[data-tour="inspector"]');
  const bar = page.locator('app-bando-editor > .bar');
  const tool = page.locator('app-bando-editor .palette .pbtn[data-tour~="tool-courtyard"]');

  // indoors on G there is no courtyard tool; on −1 there is
  await inspector.getByRole('button', {name: 'G', exact: true}).click();
  await bar.getByRole('button', {name: 'Indoors', exact: true}).click();
  await expect(tool).toHaveCount(0);
  await inspector.getByRole('button', {name: '−1', exact: true}).click();
  await expect(tool).toHaveCount(1);
  await tool.click();
  await expect(tool).toHaveClass(/on/);

  // drag a rectangle in the middle of the floor
  const plan = page.locator('[data-pk="building:b"]').first();
  const box = (await plan.boundingBox())!;
  await page.mouse.move(box.x + box.width * 0.42, box.y + box.height * 0.42);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * 0.58, box.y + box.height * 0.58, {steps: 6});
  await page.mouse.up();
  const rows = inspector.getByText(/^Courtyard \d · /);
  await expect(rows).toHaveCount(1);
  // drawn on the plan in the tool's colour
  await expect(page.locator('app-bando-editor svg.ov polygon[fill="#cf6a87"]')).toHaveCount(1);
  await page.screenshot({path: testInfo.outputPath('plan.png')});
  await bar.getByTitle('Undo (Ctrl+Z)', {exact: true}).click();
  await expect(rows).toHaveCount(0);
  await bar.getByTitle('Redo', {exact: true}).click();
  await expect(rows).toHaveCount(1);

  // one of its walls switched off in the inspector
  await inspector.getByRole('checkbox', {name: 'Courtyard 1 wall 1', exact: true}).uncheck();

  // the export carries it; Delete removes it
  await bar.getByRole('button', {name: 'Save', exact: true}).click();
  await bar.getByRole('button', {name: '← Bandos', exact: true}).click();
  const downloading = page.waitForEvent('download');
  await card.getByRole('button', {name: 'Export', exact: true}).click();
  const saved = JSON.parse((await readFile((await (await downloading).path())!)).toString()) as SiteSpec;
  const yards = saved.buildings[0]!.basement!.courtyards!;
  expect(yards).toHaveLength(1);
  expect(yards[0]!.wallEdges).toEqual([false, true, true, true]);
  const xs = yards[0]!.outline.map(p => p.x), zs = yards[0]!.outline.map(p => p.z);
  expect(Math.max(...xs) - Math.min(...xs)).toBeGreaterThanOrEqual(1);
  expect(Math.min(...xs)).toBeGreaterThan(-12); expect(Math.max(...xs)).toBeLessThan(12);
  expect(Math.min(...zs)).toBeGreaterThan(-9); expect(Math.max(...zs)).toBeLessThan(9);
  await card.getByRole('button', {name: 'Edit', exact: true}).click();
  await page.locator('[data-pk="building:b"]').first().click({force: true});
  await inspector.getByRole('button', {name: '−1', exact: true}).click();
  await inspector.getByRole('button', {name: 'Delete courtyard 1', exact: true}).click();
  await expect(inspector.getByText(/^Courtyard \d · /)).toHaveCount(0);
  expect(errors).toEqual([]);
});

test('the Basement piece tool adds a separate piece beside the basement, with export and delete', async ({page}) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.emulateMedia({reducedMotion: 'reduce'});
  await page.goto('/');
  await page.getByRole('button', {name: 'Open the bandos', exact: true}).click();
  const fixture = {
    version: 1, id: 'pieces', name: 'Piece hall', createdAt: 0, privacy: 'hidden',
    origin: {lat: 0, lon: 0}, bearingDeg: 0, genScale: 1, extent: 60, seed: 1, trees: [], pads: [],
    buildings: [{id: 'b', name: 'Hall', pos: {x: 0, z: 0}, rotDeg: 0, length: 16, width: 12, basement: {height: 3},
      levels: [{baseY: 0, height: 4, sides: {n: true, s: true, e: true, w: true}, doors: {}, partitions: [], roof: 'flat', roofRise: 0}]}],
  };
  const studio = page.locator('app-studio-panel');
  await studio.locator('input[type=file]').first().setInputFiles({name: 'p.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(fixture))});
  const card = studio.locator('.card').filter({hasText: fixture.name});
  await card.getByRole('button', {name: 'Edit', exact: true}).click();
  await page.locator('[data-pk="building:b"]').first().click({force: true});
  const inspector = page.locator('[data-tour="inspector"]');
  const bar = page.locator('app-bando-editor > .bar');
  await inspector.getByRole('button', {name: '−1', exact: true}).click();
  await bar.getByRole('button', {name: 'Indoors', exact: true}).click();
  const group = page.locator('app-bando-editor .palette .pbtn[data-tour~="tool-piece"]');
  await expect(group).toHaveCount(1);
  await group.click();
  // east of the basement: from a quarter of its width beyond the east wall, a third of its width long
  const box = (await page.locator('[data-pk="building:b"]').first().boundingBox())!;
  await page.mouse.move(box.x + box.width * 1.25, box.y + box.height * 0.3);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * 1.6, box.y + box.height * 0.7, {steps: 6});
  await page.mouse.up();
  await expect(inspector.getByText(/^Piece \d · /)).toHaveCount(1);
  await expect(page.locator('app-bando-editor svg.ov polygon[fill="#786fa6"]')).toHaveCount(1);
  await bar.getByRole('button', {name: 'Save', exact: true}).click();
  await bar.getByRole('button', {name: '← Bandos', exact: true}).click();
  const downloading = page.waitForEvent('download');
  await card.getByRole('button', {name: 'Export', exact: true}).click();
  const saved = JSON.parse((await readFile((await (await downloading).path())!)).toString()) as SiteSpec;
  const piece = saved.buildings[0]!.basement!.pieces![0]!;
  expect(Math.min(...piece.outline.map(p => p.x))).toBeGreaterThan(8); // apart from the basement's east wall (x = 8)
  await card.getByRole('button', {name: 'Edit', exact: true}).click();
  await page.locator('[data-pk="building:b"]').first().click({force: true});
  await inspector.getByRole('button', {name: '−1', exact: true}).click();
  await inspector.getByRole('button', {name: 'Delete piece 1', exact: true}).click();
  await expect(inspector.getByText(/^Piece \d · /)).toHaveCount(0);
  expect(errors).toEqual([]);
});
