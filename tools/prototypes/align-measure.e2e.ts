// F-041 measurement (not part of the app, not run by CI): run Align automatically on the demo flight and print the shift it
// proposes at the owner's three moments. Run it by copying it into e2e/. Results 2026-10-30 are in the F-041 record.
import {expect, test} from '@playwright/test';
test('align the demo flight automatically and measure it against the owner moments', async ({page}) => {
  test.setTimeout(3_000_000);
  await page.setViewportSize({width: 1280, height: 800});
  await page.addInitScript(() => localStorage.setItem('openbando-welcome', JSON.stringify({completed: true})));
  await page.goto('/');
  await page.locator('app-welcome-panel footer').getByRole('button', {name: 'Open the bandos', exact: true}).click();
  const studio = page.locator('app-studio-panel');
  await studio.locator('button[data-tour="example-villetta-no-place"]').click();
  await expect(studio.locator('.card').filter({hasText: 'Villetta'}).first()).toBeVisible({timeout: 30_000});
  await studio.locator('.card').filter({hasText: 'Villetta'}).first().getByRole('button', {name: 'Fly', exact: true}).click();
  const views = page.locator('app-views-panel');
  for (const id of ['flights', 'video', 'path']) {
    const b = views.locator(`button.vis[data-panel=${id}]`);
    if (await b.count() && (await b.getAttribute('aria-pressed')) !== 'true') await b.click();
  }
  await page.evaluate(async () => {
    const put = async (url: string, sel: string, name: string, type: string) => {
      const blob = await (await fetch(url)).blob();
      const input = document.querySelector<HTMLInputElement>(sel)!;
      const dt = new DataTransfer(); dt.items.add(new File([blob], name, {type}));
      input.files = dt.files; input.dispatchEvent(new Event('change', {bubbles: true}));
    };
    await put('guide-demo/flight.csv', 'app-panel[data-id="flights"] input[type=file]', 'demo.csv', 'text/csv');
    await put('guide-demo/flight.mp4', 'app-panel[data-id="video"] input[type=file]', 'demo.mp4', 'video/mp4');
  });
  await page.waitForTimeout(4000);
  // Auto-sync's offset, and the drone positions before alignment at the owner's moments
  const probe = (ts: number[]) => page.evaluate((ts) => {
    const scene = (window as any).ng.getComponent(document.querySelector('app-stage')!)['scene'];
    const f = scene['flights'].active, first = f.pts[0].t;
    return ts.map((t) => { const i = f.pts.findIndex((p: any) => p.t - first >= t); const p = f.loc[i]; return [p.x, p.y, p.z]; });
  }, ts);
  await page.evaluate(() => { const scene = (window as any).ng.getComponent(document.querySelector('app-stage')!)['scene']; scene['playback'].pause?.(); });
  await page.evaluate(() => { const v = (window as any).ng.getComponent(document.querySelector('app-video-panel')!); (v.video ?? v['video']).setOffset(-0.69); });
  const T = [27.6, 73.1, 95.9];
  const before = await probe(T);
  const t0 = Date.now();
  await page.getByRole('button', {name: 'Align automatically', exact: true}).click();
  await expect(page.getByRole('button', {name: 'Keep', exact: true})).toBeVisible({timeout: 2_900_000});
  const after = await probe(T);
  const summary = await page.locator('app-path-panel .align').textContent();
  console.log('took', Math.round((Date.now() - t0) / 1000), 's ·', summary?.replace(/\s+/g, ' ').trim());
  for (let k = 0; k < T.length; k++) console.log(`moment ${T[k]}: shift ${(after[k]![0] - before[k]![0]).toFixed(1)}, ${(after[k]![1] - before[k]![1]).toFixed(1)}, ${(after[k]![2] - before[k]![2]).toFixed(1)}`);
});
