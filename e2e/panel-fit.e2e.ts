import {expect, test} from '@playwright/test';

/** A panel expanded near the bottom of the window moves up to fit, and a click inside it never scrolls the page (B-032). */
test('a panel expanded at the bottom of the window fits, and clicking it does not scroll the page', async ({page}) => {
  const errors: string[] = [];
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text())); // e.g. NG0103, a fit that loops
  await page.emulateMedia({reducedMotion: 'reduce'});
  await page.goto('/');
  await page.getByRole('button', {name: 'Open the bandos', exact: true}).click();
  const panel = page.locator('app-panel[data-id=studio]');
  await expect(panel).toBeVisible();
  // collapse it, drag it by its title to the bottom of the window, expand it there
  await panel.getByRole('button', {name: 'Collapse / expand'}).click();
  const grip = panel.locator('header.grip');
  const g = (await grip.boundingBox())!;
  const view = page.viewportSize()!;
  await page.mouse.move(g.x + 60, g.y + g.height / 2);
  await page.mouse.down();
  await page.mouse.move(g.x + 60, view.height - 10, {steps: 6});
  await page.mouse.up();
  await panel.getByRole('button', {name: 'Collapse / expand'}).click();
  await expect.poll(async () => { const b = (await panel.boundingBox())!; return b.y + b.height <= view.height; }).toBe(true);
  const before = (await panel.boundingBox())!;
  // a click on a control near its bottom leaves the page where it is
  await panel.getByRole('button', {name: '＋ New bando'}).focus();
  await page.locator('app-panel[data-id=studio] .card, app-panel[data-id=studio] button').last().click();
  expect(await page.evaluate(() => [scrollX, scrollY, document.documentElement.scrollTop, document.body.scrollTop])).toEqual([0, 0, 0, 0]);
  const after = (await panel.boundingBox())!;
  expect(Math.abs(after.y - before.y)).toBeLessThan(2);
  expect(errors).toEqual([]);
});
