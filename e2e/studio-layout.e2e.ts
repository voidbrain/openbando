import {expect, test} from '@playwright/test';

test('Expand studio fills the window in 2D and 3D, keeps the docked inspector and the compass in place, and restores', async ({page}, testInfo) => {
  test.setTimeout(120_000);
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.emulateMedia({reducedMotion: 'reduce'});
  await page.goto('/');
  await page.getByRole('button', {name: 'Open the bandos', exact: true}).click();
  const fixture = {
    version: 1, id: 'layout', name: 'Studio layout', createdAt: 0, privacy: 'hidden',
    origin: {lat: 0, lon: 0}, bearingDeg: 0, genScale: 1, extent: 40, seed: 1,
    trees: [], pads: [], buildings: [{
      id: 'b', name: 'Hall', pos: {x: 0, z: 0}, rotDeg: 20, length: 20, width: 12,
      levels: [{baseY: 0, height: 5, sides: {n: true, s: true, e: true, w: true}, doors: {}, partitions: [], roof: 'flat', roofRise: 0}],
    }],
  };
  const studio = page.locator('app-studio-panel');
  await studio.locator('input[type=file]').first().setInputFiles({
    name: 'layout.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(fixture)),
  });
  await studio.locator('.card').filter({hasText: fixture.name}).getByRole('button', {name: 'Edit', exact: true}).click();
  await page.locator('[data-pk="building:b"]').first().click({force: true});
  const panel = page.locator('app-panel[data-id="studio"]');
  const inspector = page.locator('[data-tour="inspector"]');
  const work = page.locator('app-bando-editor .work');
  await expect(inspector).toHaveClass(/docked/);
  const before = (await panel.boundingBox())!;
  const viewport = page.viewportSize()!;
  // opening the editor widens the studio: it must stay inside the window (it used to run 27 px off the right edge)
  expect(before.x).toBeGreaterThanOrEqual(0);
  expect(before.x + before.width).toBeLessThanOrEqual(viewport.width);

  // the inspector stays docked inside the panel and never covers the editing area
  const docked = async (): Promise<void> => {
    const p = (await panel.boundingBox())!, i = (await inspector.boundingBox())!, w = (await work.boundingBox())!;
    expect(i.x + i.width).toBeLessThanOrEqual(p.x + p.width + 1);
    expect(w.x + w.width).toBeLessThanOrEqual(i.x + 1);
  };

  await page.getByRole('button', {name: 'Expand studio', exact: true}).click();
  await expect(page.getByRole('button', {name: 'Restore studio size', exact: true})).toHaveAttribute('aria-pressed', 'true');
  await expect.poll(async () => (await panel.boundingBox())!.width).toBeGreaterThan(viewport.width * 0.9);
  await docked();

  // 3D while expanded: the canvas fills the editing area and the compass sits at its bottom-left corner
  await page.locator('[data-tour="view-3d"]').click();
  const view = page.locator('app-site-view');
  const compass = view.locator('app-camera-compass button');
  await expect(compass).toBeVisible();
  const corner = async (): Promise<void> => {
    const c = (await compass.boundingBox())!, v = (await view.boundingBox())!, w = (await work.boundingBox())!;
    expect(Math.abs(v.width - w.width)).toBeLessThan(4);
    expect(c.x - v.x).toBeLessThan(30);
    expect(v.y + v.height - (c.y + c.height)).toBeLessThan(30);
  };
  await expect.poll(async () => (await view.boundingBox())!.width).toBeGreaterThan(before.width);
  await corner();
  await docked();
  await page.screenshot({path: testInfo.outputPath('expanded-3d.png')});

  // restore: the panel returns to its size, the 3D view and compass follow it
  await page.getByRole('button', {name: 'Restore studio size', exact: true}).click();
  await expect(page.getByRole('button', {name: 'Expand studio', exact: true})).toHaveAttribute('aria-pressed', 'false');
  await expect.poll(async () => Math.abs((await panel.boundingBox())!.width - before.width)).toBeLessThan(2);
  await expect.poll(async () => Math.abs((await panel.boundingBox())!.height - before.height)).toBeLessThan(2);
  await corner();
  await docked();
  await page.screenshot({path: testInfo.outputPath('restored-3d.png')});
  expect(errors).toEqual([]);
});
