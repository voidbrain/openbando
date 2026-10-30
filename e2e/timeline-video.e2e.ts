import {expect, test} from '@playwright/test';
/** Timeline drags move the video with the replay, paused and playing (B-040). A browser that drops a seek is covered by
 * the stalled-seek case in services.spec.ts; this guards the ordinary path with the real demo flight and video. */
test('timeline drags move the video with the replay', async ({page}) => {
  test.setTimeout(240_000);
  await page.addInitScript(() => localStorage.setItem('openbando-welcome', JSON.stringify({completed: true})));
  await page.goto('/');
  await page.locator('app-welcome-panel footer').getByRole('button', {name: 'Open the bandos', exact: true}).click();
  const views = page.locator('app-views-panel');
  for (const id of ['flights', 'video', 'timeline']) {
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
  const video = page.locator('app-video-panel video');
  await expect.poll(() => video.evaluate((v) => (v as HTMLVideoElement).readyState), {timeout: 60_000}).toBeGreaterThanOrEqual(2);
  const scrub = page.locator('app-timeline-panel .scrub');
  const caption = page.locator('app-timeline-panel .mono').first();
  const replayTime = async () => { const m = (await caption.textContent())!.match(/(\d+):(\d+(?:\.\d+)?)/)!; return Number(m[1]) * 60 + Number(m[2]); };
  const diff = async () => (await video.evaluate((v) => (v as HTMLVideoElement).currentTime)) - (await replayTime());
  const box = (await scrub.boundingBox())!;
  const drag = async (from: number, to: number, steps: number) => {
    await page.mouse.move(box.x + box.width * from, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width * to, box.y + box.height / 2, {steps});
    await page.mouse.up();
    await page.waitForTimeout(600);
  };
  await drag(0.1, 0.2, 3);
  const base = await diff();
  for (const [a, b, s] of [[0.2, 0.6, 20], [0.6, 0.3, 40], [0.3, 0.31, 2], [0.8, 0.5, 60], [0.5, 0.9, 5]] as const) {
    await drag(a, b, s);
    expect(Math.abs((await diff()) - base), `drag ${a} → ${b}`).toBeLessThan(0.15);
  }
  // playing at the speed of the report
  await page.locator('app-timeline-panel select').first().selectOption({label: '0.25×'}).catch(() => undefined);
  await page.locator('app-timeline-panel').getByRole('button', {name: /^(▶|Play)/}).first().click().catch(() => undefined);
  await page.waitForTimeout(1500);
  for (const [a, b, s] of [[0.2, 0.6, 20], [0.6, 0.3, 40], [0.4, 0.42, 3]] as const) {
    await drag(a, b, s);
    expect(Math.abs((await diff()) - base), `drag while playing ${a} → ${b}`).toBeLessThan(0.15);
  }
});
