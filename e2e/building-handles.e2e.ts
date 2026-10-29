import {expect, test} from '@playwright/test';
import {readFile} from 'node:fs/promises';
import type {SiteSpec} from '../src/app/core/site-spec';

test('3D building handles show a drag cursor, move and resize the building, one undo step each', async ({page}) => {
  test.setTimeout(180_000);
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.emulateMedia({reducedMotion: 'reduce'});
  await page.goto('/');
  await page.getByRole('button', {name: 'Open the bandos', exact: true}).click();
  const fixture = {
    version: 1, id: 'handles', name: 'Handles', createdAt: 0, privacy: 'hidden',
    origin: {lat: 0, lon: 0}, bearingDeg: 0, genScale: 1, extent: 60, seed: 1,
    droneStart: {x: -40, z: 40}, calibCorners: {p1: {x: -50, z: -50}, p2: {x: 50, z: 50}},
    trees: [], pads: [], buildings: [{
      id: 'b', name: 'Shed', pos: {x: 0, z: 0}, rotDeg: 37, length: 24, width: 16,
      levels: [{baseY: 0, height: 4, sides: {n: true, s: true, e: true, w: true}, doors: {}, partitions: [], roof: 'flat', roofRise: 0}],
    }],
  };
  const studio = page.locator('app-studio-panel');
  await studio.locator('input[type=file]').first().setInputFiles({
    name: 'handles.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(fixture)),
  });
  const card = studio.locator('.card').filter({hasText: fixture.name});
  await card.getByRole('button', {name: 'Edit', exact: true}).click();
  // the plan's outline (local points, placed by its group's transform) tells where the spec put the building; 2D only
  const outline = () => page.locator('[data-pk="building:b"]').first().evaluate(el => `${el.closest('g[transform]')?.getAttribute('transform')} ${el.getAttribute('points')}`);
  await page.locator('[data-pk="building:b"]').first().click({force: true});
  const start = await outline();
  expect(start).toContain('-12,-8');
  await page.locator('[data-tour="view-3d"]').click();
  const canvas = page.locator('app-site-view canvas');
  await expect(canvas).toBeVisible();
  const bar = page.locator('app-bando-editor > .bar');

  // Hover over a grid of the canvas and keep where the cursor says a handle can be dragged.
  const hover = (cursor: 'move' | 'grab') => canvas.evaluate((el: HTMLCanvasElement, want) => {
    const r = el.getBoundingClientRect();
    for (let y = 8; y < r.height; y += 8) for (let x = 8; x < r.width; x += 8) {
      el.dispatchEvent(new PointerEvent('pointermove', {clientX: r.left + x, clientY: r.top + y, bubbles: true}));
      if (el.style.cursor === want) return {x: r.left + x, y: r.top + y};
    }
    return null;
  }, cursor);
  const find = async (cursor: 'move' | 'grab'): Promise<{x: number; y: number}> => {
    await expect.poll(() => hover(cursor), {timeout: 15_000}).not.toBeNull();
    return (await hover(cursor))!;
  };
  const view = (which: '2d' | '3d') => page.locator(`[data-tour="view-${which}"]`).click();
  const drag = async (from: {x: number; y: number}, dx: number, dy: number): Promise<void> => {
    await page.mouse.move(from.x, from.y);
    await page.mouse.down();
    try { await page.mouse.move(from.x + dx, from.y + dy, {steps: 8}); } finally { await page.mouse.up(); }
  };
  const exported = async (): Promise<SiteSpec> => {
    await bar.getByRole('button', {name: 'Save', exact: true}).click();
    await bar.getByRole('button', {name: '← Bandos', exact: true}).click();
    const downloading = page.waitForEvent('download');
    await card.getByRole('button', {name: 'Export', exact: true}).click();
    return JSON.parse((await readFile((await (await downloading).path())!)).toString()) as SiteSpec;
  };

  // move: the building follows the handle; Undo puts it back
  await drag(await find('move'), 60, 0);
  await view('2d');
  const moved = await outline();
  expect(moved).not.toBe(start);
  await bar.getByTitle('Undo (Ctrl+Z)', {exact: true}).click();
  await expect.poll(outline).toBe(start);
  await bar.getByTitle('Redo', {exact: true}).click();
  await expect.poll(outline).toBe(moved);
  await view('3d');
  // resize: drag a corner or edge outwards from the middle of the canvas
  const grab = await find('grab');
  const box = (await canvas.boundingBox())!;
  const out = {x: Math.sign(grab.x - (box.x + box.width / 2)) * 40, y: Math.sign(grab.y - (box.y + box.height / 2)) * 40};
  await drag(grab, out.x, out.y);
  await view('2d');
  await expect.poll(outline).not.toBe(moved);
  const saved = await exported();
  const b = saved.buildings[0]!;
  expect(Math.hypot(b.pos.x, b.pos.z)).toBeGreaterThan(1); // moved
  expect(b.length * b.width).toBeGreaterThan(24 * 16); // resized outwards
  expect(b.rotDeg).toBe(37);
  expect(errors).toEqual([]);
});
