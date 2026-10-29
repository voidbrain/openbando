import {expect, test} from '@playwright/test';

/** A new bando has a place of its own, even after a hidden one was open, and Generate waits until it is chosen. */
test('New bando after a hidden one shows the map and waits for a place', async ({page}) => {
  await page.addInitScript(() => localStorage.setItem('openbando-welcome', JSON.stringify({completed: true})));
  await page.emulateMedia({reducedMotion: 'reduce'});
  await page.goto('/');
  await page.locator('app-welcome-panel footer .primary').click();
  const studio = page.locator('app-studio-panel');
  const fixture = {version: 1, id: 'hidden-yard', name: 'Hidden yard', privacy: 'hidden', createdAt: 0,
    origin: {lat: 0, lon: 0}, bearingDeg: 0, genScale: 1, extent: 30, seed: 1, trees: [], buildings: [], pads: []};
  await studio.locator('input[type=file]').first().setInputFiles({name: 'hidden.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(fixture))});
  await studio.locator('.card').filter({hasText: fixture.name}).locator('button.title').click();
  if (await studio.getByRole('button', {name: '← Bandos'}).isVisible()) await studio.getByRole('button', {name: '← Bandos'}).click();
  await studio.locator('[data-tour=new-bando]').click();
  await expect(studio.getByText('no map · place hidden')).toHaveCount(0);
  await expect(studio.getByRole('button', {name: '1 · Area'})).toBeEnabled();
  const generate = studio.locator('[data-tour=generate]');
  await expect(generate).toBeDisabled();
  // typed coordinates never reach the geocoder: the place is chosen locally
  await studio.locator('[data-tour=search]').fill('45.4642, 9.1900');
  await studio.locator('[data-tour=search-go]').click();
  await expect(generate).toBeEnabled();
});

/** Go moves to the best match at once and lists all matches, the shown one marked; another row moves the map there. */
test('Go goes to the first match and lists the others', async ({page}) => {
  await page.route('https://nominatim.openstreetmap.org/**', (route) => route.fulfill({json: [
    {display_name: 'Piazza del Duomo, Milano, Italia', lat: '45.4642', lon: '9.1900'},
    {display_name: 'Duomo, Monza, Italia', lat: '45.5845', lon: '9.2744'},
  ]}));
  await page.addInitScript(() => localStorage.setItem('openbando-welcome', JSON.stringify({completed: true})));
  await page.emulateMedia({reducedMotion: 'reduce'});
  await page.goto('/');
  await page.locator('app-welcome-panel footer .primary').click();
  const studio = page.locator('app-studio-panel');
  await studio.locator('[data-tour=new-bando]').click();
  await studio.locator('[data-tour=search]').fill('Duomo');
  await studio.locator('[data-tour=search-go]').click();
  const matches = studio.getByRole('group', {name: 'Matches'});
  await expect(matches.getByRole('button', {name: /Milano/})).toHaveAttribute('aria-pressed', 'true');
  await expect(studio.locator('[data-tour=generate]')).toBeEnabled();
  await matches.getByRole('button', {name: /Monza/}).click();
  await expect(matches.getByRole('button', {name: /Monza/})).toHaveAttribute('aria-pressed', 'true');
  await expect(matches.getByRole('button', {name: /Milano/})).toHaveAttribute('aria-pressed', 'false');
  await matches.getByRole('button', {name: 'Close the matches'}).click();
  await expect(matches).toHaveCount(0);
});

/** The frame stays inside the map minus a margin: zooming in, dragging an edge past the map, turning it, resizing. */
test('the area frame is never cut by the map edge', async ({page}) => {
  await page.addInitScript(() => localStorage.setItem('openbando-welcome', JSON.stringify({completed: true})));
  await page.emulateMedia({reducedMotion: 'reduce'});
  await page.goto('/');
  await page.locator('app-welcome-panel footer .primary').click();
  const studio = page.locator('app-studio-panel');
  await studio.locator('[data-tour=new-bando]').click();
  const frame = studio.locator('.frame');
  const map = studio.locator('[data-tour=map]');
  const readout = studio.locator('.read');
  await expect(frame).toBeVisible();
  // the frame's corners (it may be turned) keep 30 px from the map's edges
  const inside = async (): Promise<boolean> => {
    const m = (await map.boundingBox())!;
    const corners = await frame.evaluate((el) => {
      const r = el.getBoundingClientRect();
      return [r.left, r.top, r.right, r.bottom];
    });
    const [l, t, r, b] = corners as [number, number, number, number];
    return l >= m.x + 30 && t >= m.y + 30 && r <= m.x + m.width - 30 && b <= m.y + m.height - 30;
  };
  const drag = async (handle: string, to: (box: {x: number; y: number; width: number; height: number}) => [number, number]): Promise<void> => {
    const h = (await studio.locator(handle).boundingBox())!;
    await page.mouse.move(h.x + h.width / 2, h.y + h.height / 2);
    await page.mouse.down();
    const [x, y] = to(h);
    await page.mouse.move(x, y, {steps: 8});
    await page.mouse.up();
  };
  // an edge dragged far past the map stops at the margin
  await drag('.frame .h.e', (h) => [h.x + 2000, h.y + h.height / 2]);
  expect(await inside()).toBe(true);
  // zooming in shrinks the area rather than cutting the frame
  const before = await readout.textContent();
  for (let i = 0; i < 3; i++) await studio.locator('.leaflet-control-zoom-in').click();
  await expect.poll(inside).toBe(true);
  expect(await readout.textContent()).not.toBe(before);
  await studio.locator('.leaflet-control-zoom-out').click();
  // turning it 45° keeps its corners in
  await drag('.frame .rotk', (h) => [h.x + 400, h.y + 8]);
  await expect.poll(inside).toBe(true);
  // a smaller window: the panel shrinks and the frame follows
  await page.setViewportSize({width: 900, height: 600});
  await expect.poll(inside).toBe(true);
});
