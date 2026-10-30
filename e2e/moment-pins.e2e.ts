import {expect, test} from '@playwright/test';
/** Pins at moments (B-017): stop the replay, press Pin this moment, click the ground; the pin is reported and can be removed. */
test('a pin at a moment of the replay is placed from the 3D view and can be removed', async ({page}) => {
  test.setTimeout(180_000);
  await page.addInitScript(() => localStorage.setItem('openbando-welcome', JSON.stringify({completed: true})));
  await page.goto('/');
  await page.locator('app-welcome-panel footer').getByRole('button', {name: 'Open the bandos', exact: true}).click();
  const views = page.locator('app-views-panel');
  for (const id of ['flights', 'timeline', 'path']) {
    const b = views.locator(`button.vis[data-panel=${id}]`);
    if (await b.count() && (await b.getAttribute('aria-pressed')) !== 'true') await b.click();
  }
  await page.evaluate(async () => {
    const blob = await (await fetch('guide-demo/flight.csv')).blob();
    const input = document.querySelector<HTMLInputElement>('app-panel[data-id="flights"] input[type=file]')!;
    const dt = new DataTransfer(); dt.items.add(new File([blob], 'demo.csv', {type: 'text/csv'}));
    input.files = dt.files; input.dispatchEvent(new Event('change', {bubbles: true}));
  });
  const pin = page.getByRole('button', {name: 'Pin this moment', exact: true});
  await expect(pin).toBeEnabled({timeout: 30_000});
  const scrub = page.locator('app-timeline-panel .scrub'); const b = (await scrub.boundingBox())!;
  await page.mouse.click(b.x + b.width * 0.3, b.y + b.height / 2);
  await pin.click();
  await expect(pin).toHaveClass(/on/);
  const stage = page.locator('app-stage canvas').first(); const s = (await stage.boundingBox())!;
  await page.mouse.click(s.x + s.width * 0.5, s.y + s.height * 0.7);
  await expect(page.getByText(/Pinned at \d+:\d+/)).toBeVisible();
  await expect(page.getByRole('button', {name: 'Remove the pins at moments', exact: true})).toBeVisible();
  await page.getByRole('button', {name: 'Remove the pins at moments', exact: true}).click();
  await expect(page.getByRole('button', {name: 'Remove the pins at moments', exact: true})).toHaveCount(0);
});
