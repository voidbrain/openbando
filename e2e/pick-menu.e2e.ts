import {expect, test} from '@playwright/test';

/** A picture menu near the bottom of the window opens upwards, fits the window and never scrolls the page. */
test('a menu at the bottom of the window opens upwards without scrolling the page', async ({page}) => {
  await page.emulateMedia({reducedMotion: 'reduce'});
  await page.goto('/');
  await page.getByRole('button', {name: 'Open the bandos', exact: true}).click();
  const fixture = {
    version: 1, id: 'menu', name: 'Menu yard', createdAt: 0, privacy: 'hidden',
    origin: {lat: 0, lon: 0}, bearingDeg: 0, genScale: 1, extent: 40, seed: 1, trees: [], pads: [],
    buildings: [{id: 'b', name: 'Shed', pos: {x: 0, z: 0}, rotDeg: 0, length: 12, width: 8,
      levels: [{baseY: 0, height: 4, sides: {n: true, s: true, e: true, w: true}, doors: {}, partitions: [], roof: 'flat', roofRise: 0}]}],
  };
  const studio = page.locator('app-studio-panel');
  await studio.locator('input[type=file]').first().setInputFiles({name: 'm.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(fixture))});
  await studio.locator('.card').filter({hasText: fixture.name}).getByRole('button', {name: 'Edit', exact: true}).click();
  await page.getByRole('toolbar', {name: 'Tools'}).getByRole('button', {name: 'Tree', exact: true}).click();
  // the window ends just below the Tree options, as when the editor sits at the bottom of the page
  const opts = page.locator('app-bando-editor .opts');
  const button = opts.getByRole('button', {name: /^Vegetation:/});
  const at = (await button.boundingBox())!;
  await page.setViewportSize({width: 1400, height: Math.round(at.y + at.height + 24)});
  await expect.poll(async () => { const b = (await button.boundingBox())!; return page.viewportSize()!.height - (b.y + b.height); }).toBeLessThan(60);
  // every scrolled element of the page but the menu's own list
  const scrolled = (): Promise<string> => page.evaluate(() =>
    [...document.querySelectorAll('*')].filter((el) => el.scrollTop && !el.matches('[role=listbox]')).map((el) => `${el.tagName}.${el.className}:${el.scrollTop}`).join(' | '));
  await button.scrollIntoViewIfNeeded(); // Playwright would do it on click: count only what the menu scrolls
  const before = await scrolled();
  await button.click();
  expect(await scrolled()).toBe(before);
  const list = opts.getByRole('listbox');
  await expect(list).toBeVisible();
  await expect(list).toHaveClass(/up/);
  const box = (await list.boundingBox())!;
  const view = page.viewportSize()!;
  expect(box.y).toBeGreaterThanOrEqual(0);
  expect(box.y + box.height).toBeLessThanOrEqual(view.height);
  await page.keyboard.press('End');
  expect(await scrolled()).toBe(before);
  await page.keyboard.press('Escape');
  await expect(list).toHaveCount(0);
});
