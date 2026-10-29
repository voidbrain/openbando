import {expect, test} from '@playwright/test';
import {readFile} from 'node:fs/promises';
import type {SiteSpec} from '../src/app/core/site-spec';

test('3D basement vertex handles on a rotated building: drag, undo, redo and save', async ({page}) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.emulateMedia({reducedMotion: 'reduce'});
  await page.goto('/');
  await page.getByRole('button', {name: 'Open the bandos', exact: true}).click();
  const fixture = {
    version: 1, id: 'vertices', name: 'Vertex hall', createdAt: 0, privacy: 'hidden',
    origin: {lat: 0, lon: 0}, bearingDeg: 0, genScale: 1, extent: 50, seed: 1, trees: [], pads: [],
    buildings: [{id: 'b', name: 'Hall', pos: {x: 0, z: 0}, rotDeg: 37, length: 20, width: 14, basement: {height: 3},
      levels: [{baseY: 0, height: 4, sides: {n: true, s: true, e: true, w: true}, doors: {}, partitions: [], roof: 'flat', roofRise: 0}]}],
  };
  const studio = page.locator('app-studio-panel');
  await studio.locator('input[type=file]').first().setInputFiles({name: 'v.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(fixture))});
  const card = studio.locator('.card').filter({hasText: fixture.name});
  await card.getByRole('button', {name: 'Edit', exact: true}).click();
  await page.locator('[data-pk="building:b"]').first().click({force: true});
  const bar = page.locator('app-bando-editor > .bar');
  await page.locator('[data-tour="inspector"]').getByRole('button', {name: '−1', exact: true}).click();
  await bar.getByRole('button', {name: 'Indoors', exact: true}).click();
  // the plan's vertex knobs give the outline as the spec has it
  const vertices = () => page.locator('.basement-vertex').evaluateAll(els => els.map(e => `${e.getAttribute('cx')},${e.getAttribute('cy')}`).join(' '));
  const start = await vertices();
  expect(start.split(' ')).toHaveLength(4);

  await page.locator('[data-tour="view-3d"]').click();
  const canvas = page.locator('app-site-view canvas');
  await expect(canvas).toBeVisible();
  // find a vertex handle by the cursor it shows on hover (no camera geometry)
  const hover = () => canvas.evaluate((el: HTMLCanvasElement) => {
    const r = el.getBoundingClientRect();
    for (let y = 6; y < r.height; y += 6) for (let x = 6; x < r.width; x += 6) {
      el.dispatchEvent(new PointerEvent('pointermove', {clientX: r.left + x, clientY: r.top + y, bubbles: true}));
      if (el.style.cursor === 'grab') return {x: r.left + x, y: r.top + y};
    }
    return null;
  });
  await expect.poll(hover, {timeout: 60_000}).not.toBeNull();
  const knob = (await hover())!;
  const box = (await canvas.boundingBox())!;
  // drag it away from the middle of the view: the basement grows at that corner
  const out = {x: Math.sign(knob.x - (box.x + box.width / 2)) * 40, y: Math.sign(knob.y - (box.y + box.height / 2)) * 40};
  await page.mouse.move(knob.x, knob.y);
  await page.mouse.down();
  try { await page.mouse.move(knob.x + out.x, knob.y + out.y, {steps: 8}); } finally { await page.mouse.up(); }

  await page.locator('[data-tour="view-2d"]').click();
  const moved = await vertices();
  expect(moved).not.toBe(start);
  await bar.getByTitle('Undo (Ctrl+Z)', {exact: true}).click();
  await expect.poll(vertices).toBe(start);
  await bar.getByTitle('Redo', {exact: true}).click();
  await expect.poll(vertices).toBe(moved);

  await bar.getByRole('button', {name: 'Save', exact: true}).click();
  await bar.getByRole('button', {name: '← Bandos', exact: true}).click();
  const downloading = page.waitForEvent('download');
  await card.getByRole('button', {name: 'Export', exact: true}).click();
  const saved = JSON.parse((await readFile((await (await downloading).path())!)).toString()) as SiteSpec;
  const b = saved.buildings[0]!;
  expect(b.rotDeg).toBe(37);
  expect(b.basement!.outline).toHaveLength(4);
  // the saved outline is no longer the building's 20 × 14 rectangle
  const xs = b.basement!.outline!.map(p => p.x), zs = b.basement!.outline!.map(p => p.z);
  expect(Math.max(...xs) - Math.min(...xs) > 20.01 || Math.max(...zs) - Math.min(...zs) > 14.01).toBe(true);
  expect(errors).toEqual([]);
});
