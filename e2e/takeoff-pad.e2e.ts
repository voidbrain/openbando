import {expect, test} from '@playwright/test';
import {readFile} from 'node:fs/promises';
import type {SiteSpec} from '../src/app/core/site-spec';

/** The take-off pad is picked and dragged with Select, and moved from the ground's right-click menu (pad and start together). */
test('the take-off pad can be selected, dragged and moved from the ground menu', async ({page}) => {
  await page.emulateMedia({reducedMotion: 'reduce'});
  await page.goto('/');
  await page.getByRole('button', {name: 'Open the bandos', exact: true}).click();
  const fixture = {
    version: 1, id: 'pad', name: 'Pad yard', createdAt: 0, privacy: 'hidden',
    origin: {lat: 0, lon: 0}, bearingDeg: 0, genScale: 1, extent: 60, seed: 1, trees: [],
    pads: [{x: -14, z: 0, w: 8, d: 8, color: '#a9aaa0'}], droneStart: {x: -14, z: 0},
    buildings: [{id: 'b', name: 'Shed', pos: {x: 10, z: 0}, rotDeg: 0, length: 8, width: 6,
      levels: [{baseY: 0, height: 4, sides: {n: true, s: true, e: true, w: true}, doors: {}, partitions: [], roof: 'flat', roofRise: 0}]}],
  };
  const studio = page.locator('app-studio-panel');
  await studio.locator('input[type=file]').first().setInputFiles({name: 'pad.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(fixture))});
  const card = studio.locator('.card').filter({hasText: fixture.name});
  await card.getByRole('button', {name: 'Edit', exact: true}).click();
  const bar = page.locator('app-bando-editor > .bar');
  const pad = page.locator('app-bando-editor [data-pk="pad"]');
  const shed = page.locator('[data-pk="building:b"]').first();
  await expect(pad).toBeVisible();
  const exported = async (): Promise<SiteSpec> => {
    await bar.getByRole('button', {name: 'Save', exact: true}).click();
    await bar.getByRole('button', {name: '← Bandos', exact: true}).click();
    const downloading = page.waitForEvent('download');
    await card.getByRole('button', {name: 'Export', exact: true}).click();
    const spec = JSON.parse((await readFile((await (await downloading).path())!)).toString()) as SiteSpec;
    await card.getByRole('button', {name: 'Edit', exact: true}).click();
    return spec;
  };

  // drag it with Select: the inspector names it, pad and start move together
  const a = (await pad.boundingBox())!, b = (await shed.boundingBox())!;
  const metre = b.width / 8; // the shed is 8 m long
  await page.mouse.move(a.x + a.width / 2, a.y + a.height / 2);
  await page.mouse.down();
  await page.mouse.move(a.x + a.width / 2, a.y + a.height / 2 + 10 * metre, {steps: 6});
  await page.mouse.up();
  await expect(page.locator('[data-tour="inspector"]')).toContainText('Take-off pad');
  let spec = await exported();
  expect(spec.droneStart.x).toBeCloseTo(-14, 0);
  expect(spec.droneStart.z).toBeGreaterThan(7);
  expect(spec.pads.at(-1)!.z - spec.droneStart.z).toBeCloseTo(0, 5);

  // right-click the ground north of the shed: Move the take-off pad here; the pad lands under the click
  const s2 = (await shed.boundingBox())!;
  const here = {x: s2.x + s2.width / 2, y: s2.y - 40};
  await page.mouse.click(here.x, here.y, {button: 'right'});
  await page.getByRole('button', {name: 'Move the take-off pad here', exact: true}).click();
  const moved = (await pad.boundingBox())!;
  expect(Math.abs(moved.x + moved.width / 2 - here.x)).toBeLessThan(6); // the click snaps to whole metres
  expect(Math.abs(moved.y + moved.height / 2 - here.y)).toBeLessThan(6);
  spec = await exported();
  expect(spec.droneStart.x).toBeCloseTo(10, 0);
  expect(spec.droneStart.z).toBeLessThan(-3);
  expect(spec.pads.at(-1)).toMatchObject({x: spec.droneStart.x, z: spec.droneStart.z});
});
