import {expect, test} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {readFile} from 'node:fs/promises';
import type {SiteSpec} from '../src/app/core/site-spec';

// Exercise real canvas pointers, then inspect the exported source rather than only its rendered silhouette.
for (const floor of ['−1', 'G', 'L1']) {
  test(`3D indoor ${floor}: rotated placement, undo and saved floor isolation`, async ({page}) => {
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
      if ((await group.getAttribute('title'))?.startsWith(name + ' ·')) await group.click();
      else {
        await group.click({button: 'right'});
        await page.locator('app-bando-editor .palette .fly').getByRole('button', {name, exact: true}).click();
      }
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
    for (const other of [building.basement!, ...building.levels].filter(item => item !== edited)) {
      expect(other.columns ?? []).toHaveLength(0);
      expect(other.partitions ?? []).toHaveLength(0);
      expect(other.voids ?? []).toHaveLength(0);
    }
    expect(errors).toEqual([]);
  });
}
