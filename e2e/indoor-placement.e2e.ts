import {expect, test} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {readFile} from 'node:fs/promises';
import type {SiteSpec} from '../src/app/core/site-spec';

// Exercise real canvas pointers, then inspect the exported source rather than only its rendered silhouette.
for (const floor of ['−1', 'G', 'L1']) {
  test(`3D indoor ${floor}: rotated placement, stairs, undo and saved floor isolation`, async ({page}) => {
    test.setTimeout(180_000);
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.emulateMedia({reducedMotion: 'reduce'});
    await page.goto('/');
    await page.getByRole('button', {name: 'Open the bandos', exact: true}).click();
    const fixture = {
      version: 1, id: 'indoor-matrix', name: 'Indoor matrix', createdAt: 0, privacy: 'hidden',
      origin: {lat: 0, lon: 0}, bearingDeg: 0, genScale: 1, extent: 50, seed: 1,
      droneStart: {x: -20, z: 0}, calibCorners: {p1: {x: -25, z: -25}, p2: {x: 25, z: 25}},
      trees: [], pads: [], buildings: [{
        id: 'b', name: 'Workshop', pos: {x: 0, z: 0}, rotDeg: 37, length: 30, width: 30,
        basement: {height: 3}, levels: [0, 4].map(baseY => ({
          baseY, height: 4, sides: {n: true, s: true, e: true, w: true}, doors: {},
          partitions: [], roof: 'flat', roofRise: 0,
        })),
      }],
    };
    const studio = page.locator('app-studio-panel');
    await studio.locator('input[type=file]').first().setInputFiles({
      name: 'indoor.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(fixture)),
    });
    const card = studio.locator('.card').filter({hasText: fixture.name});
    await card.getByRole('button', {name: 'Edit', exact: true}).click();
    await page.locator('[data-pk="building:b"]').first().click({force: true});
    const inspector = page.locator('[data-tour="inspector"]');
    const bar = page.locator('app-bando-editor > .bar');
    // Choose the level before entering indoors; the toolbar then exposes its source-floor identity.
    await inspector.getByRole('button', {name: floor, exact: true}).click();
    await bar.getByRole('button', {name: 'Indoors', exact: true}).click();
    await expect(bar.getByRole('button', {name: floor, exact: true})).toHaveClass(/on/);
    await page.locator('[data-tour="view-3d"]').click();
    const canvas = page.locator('app-site-view canvas');
    await expect(canvas).toBeVisible();
    await expect(page.locator('app-site-view .fail')).toHaveCount(0);
    const tool = async (id: string, name: string): Promise<void> => {
      const group = page.locator(`app-bando-editor .palette .pbtn[data-tour~="tool-${id}"]`);
      await expect(group).toHaveAttribute('aria-label', name);
      await group.click();
      await expect(group).toHaveClass(/on/);
    };
    const drag = async (a: [number, number], b: [number, number]): Promise<void> => {
      const box = await canvas.boundingBox();
      expect(box).not.toBeNull();
      await page.mouse.move(box!.x + box!.width * a[0], box!.y + box!.height * a[1]);
      await page.mouse.down();
      try { await page.mouse.move(box!.x + box!.width * b[0], box!.y + box!.height * b[1], {steps: 5}); }
      finally { await page.mouse.up(); }
    };
    await tool('column', 'Column');
    const box = await canvas.boundingBox();
    await canvas.click({position: {x: box!.width * .5, y: box!.height * .56}});
    await page.locator('[data-tour="view-2d"]').click();
    await expect(page.locator('[data-pk="col:0"]')).toHaveCount(1);
    await bar.getByTitle('Undo (Ctrl+Z)', {exact: true}).click();
    await expect(page.locator('[data-pk="col:0"]')).toHaveCount(0);
    await bar.getByTitle('Redo', {exact: true}).click();
    await expect(page.locator('[data-pk="col:0"]')).toHaveCount(1);
    await page.locator('[data-tour="view-3d"]').click();
    await tool('wall', 'Wall');
    await drag([.42, .58], [.55, .62]);
    await page.locator('[data-tour="view-2d"]').click();
    await expect(page.locator('[data-pk="wall:0"]')).toHaveCount(1);
    await page.locator('[data-tour="view-3d"]').click();
    await tool('void', 'Void');
    await drag([.60, .40], [.68, .48]);
    await page.locator('[data-tour="view-2d"]').click();
    await expect(page.locator('[data-pk="void:0"]')).toHaveCount(1);
    await expect(bar.getByRole('button', {name: floor, exact: true})).toHaveClass(/on/);
    await page.locator('[data-tour="view-3d"]').click();
    await tool('stairs', 'Stairs');
    // Isolate placement from the optional cross-floor stairwell operation.
    const stairwell = page.getByRole('checkbox', {name: 'open floor above', exact: true});
    if (floor === 'L1') await expect(stairwell).toHaveCount(0);
    else await stairwell.uncheck();
    const stairBox = await canvas.boundingBox();
    expect(stairBox).not.toBeNull();
    await canvas.click({position: {x: stairBox!.width * .42, y: stairBox!.height * .50}});
    await page.locator('[data-tour="view-2d"]').click();
    await expect(page.locator('[data-pk="structure:0"]')).toHaveCount(1);
    await bar.getByTitle('Undo (Ctrl+Z)', {exact: true}).click();
    await expect(page.locator('[data-pk="structure:0"]')).toHaveCount(0);
    await bar.getByTitle('Redo', {exact: true}).click();
    await expect(page.locator('[data-pk="structure:0"]')).toHaveCount(1);
    await page.locator('[data-tour="view-3d"]').click();
    const axe = await new AxeBuilder({page}).include('app-site-view').withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
    expect(axe.violations.map(violation => violation.id)).toEqual([]);
    await bar.getByRole('button', {name: 'Save', exact: true}).click();
    await bar.getByRole('button', {name: '← Bandos', exact: true}).click();
    const downloading = page.waitForEvent('download');
    await card.getByRole('button', {name: 'Export', exact: true}).click();
    const download = await downloading;
    const filename = await download.path();
    expect(filename).not.toBeNull();
    const saved = JSON.parse((await readFile(filename!)).toString()) as SiteSpec;
    const building = saved.buildings[0]!;
    const edited = floor === '−1' ? building.basement! : building.levels[floor === 'G' ? 0 : 1]!;
    expect(edited.columns).toHaveLength(1);
    expect(edited.partitions).toHaveLength(1);
    expect(edited.voids).toHaveLength(1);
    const column = edited.columns![0]!;
    expect(column.x).toBeGreaterThan(0); expect(column.x).toBeLessThan(30);
    expect(column.z).toBeGreaterThan(0); expect(column.z).toBeLessThan(30);
    expect(building.rotDeg).toBe(37);
    expect(saved.structures).toHaveLength(1);
    const stairs = saved.structures![0]!;
    expect(stairs.kind).toBe('stairs');
    expect(stairs.rotDeg).toBe(37);
    expect(stairs.y).toBe(floor === '−1' ? -3 : floor === 'G' ? 0 : 4);
    expect(stairs.height).toBe(floor === '−1' ? 3 : 4);
    expect(stairs.length).toBeGreaterThan(2);
    expect(Number.isFinite(stairs.x) && Number.isFinite(stairs.z)).toBe(true);
    for (const other of [building.basement!, ...building.levels].filter(item => item !== edited)) {
      expect(other.columns ?? []).toHaveLength(0);
      expect(other.partitions ?? []).toHaveLength(0);
      expect(other.voids ?? []).toHaveLength(0);
    }
    expect(errors).toEqual([]);
  });
}

/** The matrix fixture, opened in the 3D indoor view of `floor`. Returns what the opening and stairwell cases need. */
async function openIndoor3d(page: import('@playwright/test').Page, floor: string) {
  await page.emulateMedia({reducedMotion: 'reduce'});
  await page.goto('/');
  await page.getByRole('button', {name: 'Open the bandos', exact: true}).click();
  const fixture = {
    version: 1, id: 'indoor-openings', name: 'Indoor openings', createdAt: 0, privacy: 'hidden',
    origin: {lat: 0, lon: 0}, bearingDeg: 0, genScale: 1, extent: 50, seed: 1,
    droneStart: {x: -20, z: 0}, calibCorners: {p1: {x: -25, z: -25}, p2: {x: 25, z: 25}},
    trees: [], pads: [], buildings: [{
      id: 'b', name: 'Workshop', pos: {x: 0, z: 0}, rotDeg: 37, length: 30, width: 30,
      basement: {height: 3}, levels: [0, 4].map(baseY => ({
        baseY, height: 4, sides: {n: true, s: true, e: true, w: true}, doors: {},
        partitions: [], roof: 'flat', roofRise: 0,
      })),
    }],
  };
  const studio = page.locator('app-studio-panel');
  await studio.locator('input[type=file]').first().setInputFiles({
    name: 'openings.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(fixture)),
  });
  const card = studio.locator('.card').filter({hasText: fixture.name});
  await card.getByRole('button', {name: 'Edit', exact: true}).click();
  await page.locator('[data-pk="building:b"]').first().click({force: true});
  const bar = page.locator('app-bando-editor > .bar');
  await page.locator('[data-tour="inspector"]').getByRole('button', {name: floor, exact: true}).click();
  await bar.getByRole('button', {name: 'Indoors', exact: true}).click();
  await expect(bar.getByRole('button', {name: floor, exact: true})).toHaveClass(/on/);
  await page.locator('[data-tour="view-3d"]').click();
  const canvas = page.locator('app-site-view canvas');
  await expect(canvas).toBeVisible();
  const tool = async (id: string, name: string): Promise<void> => {
    const group = page.locator(`app-bando-editor .palette .pbtn[data-tour~="tool-${id}"]`);
    await expect(group).toHaveAttribute('aria-label', name);
    await group.click();
    await expect(group).toHaveClass(/on/);
  };
  const exported = async (): Promise<SiteSpec> => {
    await bar.getByRole('button', {name: 'Save', exact: true}).click();
    await bar.getByRole('button', {name: '← Bandos', exact: true}).click();
    const downloading = page.waitForEvent('download');
    await card.getByRole('button', {name: 'Export', exact: true}).click();
    const path = await (await downloading).path();
    return JSON.parse((await readFile(path!)).toString()) as SiteSpec;
  };
  return {bar, canvas, tool, exported};
}

for (const floor of ['−1', 'G', 'L1']) {
  test(`3D indoor ${floor}: a door and a window land on this floor's wall, with undo`, async ({page}) => {
    test.setTimeout(180_000);
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    const {bar, canvas, tool, exported} = await openIndoor3d(page, floor);
    const box = (await canvas.boundingBox())!;
    // A click only places an opening near a wall of this floor (otherwise the tool stays armed): walk out from the
    // middle of the view until one lands, as a pilot would, instead of hard-coding where the camera puts the walls.
    const place = async (id: 'door' | 'window', name: string, row: number): Promise<void> => {
      await tool(id, name);
      const group = page.locator(`app-bando-editor .palette .pbtn[data-tour~="tool-${id}"]`);
      for (let x = 0.5; x <= 0.98; x += 0.03) {
        await canvas.click({position: {x: box.width * x, y: box.height * row}});
        if (!(await group.getAttribute('class'))?.includes('on')) return; // placed: the editor went back to Select
      }
      throw new Error(`no ${id} placed along the row at ${row}`);
    };
    const openings = page.locator('[data-pk^="opening:"]');
    await place('door', 'Door', 0.5);
    await page.locator('[data-tour="view-2d"]').click();
    await expect(openings).toHaveCount(1);
    await bar.getByTitle('Undo (Ctrl+Z)', {exact: true}).click();
    await expect(openings).toHaveCount(0);
    await bar.getByTitle('Redo', {exact: true}).click();
    await expect(openings).toHaveCount(1);
    await page.locator('[data-tour="view-3d"]').click();
    await place('window', 'Window', 0.42);
    await page.locator('[data-tour="view-2d"]').click();
    await expect(openings).toHaveCount(2);
    const saved = await exported();
    const building = saved.buildings[0]!;
    const edited = floor === '−1' ? building.basement! : building.levels[floor === 'G' ? 0 : 1]!;
    const kinds = (level: typeof edited) => [...Object.values(level.doors ?? {}).flat(), ...(level.wallOpenings ?? [])].map(o => o!.kind).sort();
    expect(kinds(edited)).toEqual(['door', 'window']);
    for (const other of [building.basement!, ...building.levels].filter(item => item !== edited)) expect(kinds(other)).toEqual([]);
    expect(errors).toEqual([]);
  });
}

for (const floor of ['−1', 'G']) {
  test(`3D indoor ${floor}: stairs with "open floor above" cut the stairwell in the floor above`, async ({page}) => {
    test.setTimeout(180_000);
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    const {canvas, tool, exported} = await openIndoor3d(page, floor);
    await tool('stairs', 'Stairs');
    await expect(page.getByRole('checkbox', {name: 'open floor above', exact: true})).toBeChecked();
    const box = (await canvas.boundingBox())!;
    await canvas.click({position: {x: box.width * .42, y: box.height * .50}});
    await page.locator('[data-tour="view-2d"]').click();
    await expect(page.locator('[data-pk="structure:0"]')).toHaveCount(1);
    const saved = await exported();
    const building = saved.buildings[0]!;
    const above = floor === '−1' ? building.levels[0]! : building.levels[1]!;
    expect(above.voids).toHaveLength(1);
    const hole = above.voids![0]!;
    expect(hole.x1 - hole.x0).toBeGreaterThan(0.5);
    expect(hole.z1 - hole.z0).toBeGreaterThan(0.5);
    // only the floor above gets the hole
    for (const other of [building.basement!, ...building.levels].filter(item => item !== above)) expect(other.voids ?? []).toHaveLength(0);
    expect(saved.structures).toHaveLength(1);
    expect(errors).toEqual([]);
  });
}
