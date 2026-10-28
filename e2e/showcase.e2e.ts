import { expect, test } from '@playwright/test';

/** The showcase link plays the welcome tour by itself and returns to Welcome with playback stopped. */
test('the showcase link plays to the end', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => m.type() === 'warning' && m.text().startsWith('tour') && errors.push(m.text())); // a step that found nothing to point at
  await page.goto('/?tour=showcase&lang=it');
  const bar = page.locator('app-tour-overlay .bar');
  await expect(bar).toBeVisible({ timeout: 20_000 });
  await expect(bar).toContainText('Welcome'); // persistent tour title; the opening caption is intentionally brief
  await expect(bar).toBeHidden({ timeout: 300_000 });
  const shown = await page.locator('app-panel:not([hidden])').evaluateAll((els) => els.map((e) => `${e.getAttribute('data-id')}${e.classList.contains('ghost') ? '*' : ''}`));
  expect(shown).toEqual(['welcome']);
  await expect(page.locator('app-stage app-camera-compass')).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'OpenBando', exact: true })).toBeVisible();
  const replayVideo = page.locator('app-video-panel video');
  await expect(replayVideo).toHaveCount(1);
  await expect.poll(() => replayVideo.evaluate((video) => (video as HTMLVideoElement).paused)).toBe(true);
  await page.waitForTimeout(2000);
  await expect(bar).toBeHidden();
  await expect(page.locator('app-panel[data-id=welcome]')).toBeVisible();
  const media = await replayVideo.evaluate(video => ({time: (video as HTMLVideoElement).currentTime, duration: (video as HTMLVideoElement).duration}));
  expect(media.time).toBeGreaterThan(media.duration - 1);
  await page.locator('[data-tour=close-welcome]').click();
  const views = page.locator('app-views-panel');
  await expect(views.locator('.cams .seg button').first()).toHaveAttribute('aria-pressed', 'true');
  await expect(views.locator('button.btn.ib').filter({has: page.locator('app-tool-icon[name="follow"]')})).toHaveAttribute('aria-pressed', 'false');
  await views.locator('button.vis[data-panel=studio]').click();
  const studio = page.locator('app-studio-panel');
  // The showcase model is deliberately temporary; load a real saved fixture for this continuation.
  const fixture = {version: 1, id: 'after-showcase', name: 'After showcase', createdAt: 0,
    privacy: 'hidden', origin: {lat: 0, lon: 0}, bearingDeg: 0, genScale: 1, extent: 40, seed: 1,
    droneStart: {x: -12, z: 0}, calibCorners: {p1: {x: -20, z: -20}, p2: {x: 20, z: 20}},
    trees: [], pads: [], buildings: [{id: 'b', name: 'Shed', pos: {x: 0, z: 0}, rotDeg: 0, length: 10, width: 8,
      levels: [{baseY: 0, height: 4, sides: {n: true, s: true, e: true, w: true}, doors: {}, partitions: [], roof: 'flat', roofRise: 0}]}]};
  await studio.locator('input[type=file]').first().setInputFiles({name: 'after.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(fixture))});
  await studio.locator('.card:not(.ex)').filter({hasText: fixture.name}).locator('button.title').click();
  await expect(page.locator('app-stage app-camera-compass')).toBeVisible();
  expect(errors).toEqual([]);
});

test('showcase keeps Welcome open for a complete mascot loop', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  // Observe before navigation: short cursor actions can finish between Playwright polls.
  await page.addInitScript(() => {
    const actions: string[] = [];
    const films: Record<string, number> = {};
    Object.assign(window, { welcomeActions: actions, welcomeFilmProgress: films });
    document.addEventListener('timeupdate', event => {
      const film = event.target;
      if (film instanceof HTMLVideoElement && film.closest('app-welcome-panel') && film.dataset['id'])
        films[film.dataset['id']] = Math.max(films[film.dataset['id']] ?? 0, film.currentTime);
    }, true);
    new MutationObserver(records => {
      for (const record of records) {
        if (!(record.target instanceof Element) || !record.target.matches('app-tour-overlay .bar')) continue;
        const action = record.target.getAttribute('data-action');
        if (action && actions.at(-1) !== action) actions.push(action);
      }
    }).observe(document, { subtree: true, attributes: true, attributeFilter: ['data-action'] });
  });
  await page.goto('/?tour=showcase&lang=en');
  const bar = page.locator('app-tour-overlay .bar');
  // Observe each distributed gate; there is no long, separate gate after Share.
  for (const part of ['build', 'fly', 'share']) {
    await expect(bar).toHaveAttribute('data-action', `hook:welcomePart:${part}`, {timeout: 90_000});
    await expect(page.locator('app-panel[data-id="welcome"]')).toBeVisible();
    await expect(page.locator('app-stage app-camera-compass')).toHaveCount(0);
  }
  await expect(bar).not.toHaveAttribute('data-action', 'hook:welcomePart:share', {timeout: 90_000});
  const actions = await page.evaluate(() => (window as unknown as {welcomeActions: string[]}).welcomeActions);
  for (const part of ['build', 'fly', 'share']) expect(actions).toContain(`hook:welcomePart:${part}`);
  expect(actions).not.toContain('hook:mascotLoop');
  const films = await page.evaluate(() => (window as unknown as {welcomeFilmProgress: Record<string, number>}).welcomeFilmProgress);
  // The packaged films last eight seconds; check real media progress rather than a nominal wait.
  for (const part of ['build', 'fly', 'share']) expect(films[part], part).toBeGreaterThan(7.5);
  await bar.getByRole('button', { name: /Stop/ }).click();
  await expect(bar).toBeHidden();
});

test('reduced motion does not wait for an animation', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/?tour=showcase&lang=en');
  const bar = page.locator('app-tour-overlay .bar');
  await expect(bar).toBeVisible({ timeout: 20_000 });
  await expect(bar).toContainText('2 /', { timeout: 15_000 });
  await bar.getByRole('button', { name: /Stop/ }).click();
  await expect(bar).toBeHidden();
});

test('stopping the showcase returns to Welcome', async ({ page }) => {
  await page.goto('/?tour=showcase&lang=en');
  const bar = page.locator('app-tour-overlay .bar');
  await expect(bar).toBeVisible({ timeout: 20_000 });
  await bar.getByRole('button', { name: /Stop/ }).click();
  await expect(bar).toBeHidden();
  await expect(page.locator('app-panel[data-id="welcome"]')).toBeVisible();
  const shown = await page.locator('app-panel:not([hidden])').evaluateAll((els) => els.map((e) => e.getAttribute('data-id')));
  expect(shown).toEqual(['welcome']);
  await expect(page.locator('app-stage app-camera-compass')).toHaveCount(0);
});

/** The showcase skips the scan: the offset it uses must be the one a real Auto-sync finds for the demo flight. */
test('the showcase offset is what Auto-sync finds', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Close Welcome' }).click();
  const load = async (panel: string, url: string, name: string, type: string): Promise<void> => {
    await page.evaluate(
      async ([panel, url, name, type]) => {
        const blob = await (await fetch(url)).blob();
        const input = document.querySelector<HTMLInputElement>(`app-panel[data-id="${panel}"] input[type=file]`)!;
        const dt = new DataTransfer();
        dt.items.add(new File([blob], name, { type }));
        input.files = dt.files;
        input.dispatchEvent(new Event('change', { bubbles: true }));
      },
      [panel, url, name, type],
    );
  };
  await page.evaluate(() => {
    for (const id of ['flights', 'video']) document.querySelector<HTMLElement>(`app-panel[data-id="${id}"]`)!.hidden = false;
  });
  await load('flights', 'guide-demo/flight.csv', 'demo.csv', 'text/csv');
  await load('video', 'guide-demo/flight.mp4', 'demo.mp4', 'video/mp4');
  await page.waitForTimeout(1500);
  await page.locator('app-panel[data-id="video"] [data-tour~="auto-sync"]').click();
  const status = page.locator('app-panel[data-id="video"]');
  await expect(status).toContainText(/offset -?\d+\.\d+ s/, { timeout: 240_000 });
  const found = Number(/offset (-?\d+\.\d+) s/.exec((await status.textContent()) ?? '')![1]);
  expect(Math.abs(found - -0.54)).toBeLessThan(0.15); // DEMO_OFFSET in services/tour.service.ts
});
