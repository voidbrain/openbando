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

/**
 * The area frame is a place on the map and is never cut by its edge: an edge dragged past the map stops at the margin;
 * zooming in past the frame's fit refines the area (it shrinks to the view, B-029, the owner 2026-10-30), down to its
 * smallest size, and zooming back out does not make it grow; the wheel zooms about the centre (as the frame does); a turn
 * or a smaller window zooms the map out and does not change the area.
 */
test('the area frame is never cut by the map edge; zooming in refines it, nothing else resizes it', async ({page}) => {
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
    const [l, t, r, b] = await frame.evaluate((el) => {
      const box = el.getBoundingClientRect();
      return [box.left, box.top, box.right, box.bottom];
    });
    return l! >= m.x + 30 && t! >= m.y + 30 && r! <= m.x + m.width - 30 && b! <= m.y + m.height - 30;
  };
  const drag = async (handle: string, to: (box: {x: number; y: number; width: number; height: number}) => [number, number]): Promise<void> => {
    const h = (await studio.locator(handle).boundingBox())!;
    await page.mouse.move(h.x + h.width / 2, h.y + h.height / 2);
    await page.mouse.down();
    const [x, y] = to(h);
    await page.mouse.move(x, y, {steps: 8});
    await page.mouse.up();
  };
  // the editor's Leaflet map (development build): where the view is centred
  const centre = (): Promise<{lat: number; lng: number}> => page.evaluate(() => {
    const ng = (window as unknown as {ng: {getComponent: (el: Element) => {map: {getCenter: () => {lat: number; lng: number}}}}}).ng;
    const c = ng.getComponent(document.querySelector('app-bando-editor')!).map.getCenter();
    return {lat: c.lat, lng: c.lng};
  });
  await drag('.frame .h.e', (h) => [h.x + 2000, h.y + h.height / 2]);
  expect(await inside()).toBe(true);
  // zooming in past the fit refines the area: the frame stays inside, the area gets smaller, down to its smallest size
  const metres = async (): Promise<number> => Number((await readout.textContent())!.match(/([\d.]+)\s*×/)?.[1] ?? NaN);
  const big = await metres();
  const zoomIn = studio.locator('.leaflet-control-zoom-in');
  for (let i = 0; i < 30 && !/leaflet-disabled/.test((await zoomIn.getAttribute('class')) ?? ''); i++) {
    await zoomIn.click();
    expect(await inside()).toBe(true);
  }
  await expect(zoomIn).toHaveClass(/leaflet-disabled/);
  const small = await metres();
  expect(small).toBeLessThan(big);
  // zooming back out keeps the refined area
  await studio.locator('.leaflet-control-zoom-out').click();
  await studio.locator('.leaflet-control-zoom-out').click();
  expect(await metres()).toBe(small);
  const size = await readout.textContent();
  // the wheel, off-centre, zooms about the view's centre like the frame (out, then back in up to the limit)
  const before = await centre();
  const m = (await map.boundingBox())!;
  await page.mouse.move(m.x + 60, m.y + m.height - 60);
  await page.mouse.wheel(0, 300);
  await page.waitForTimeout(500);
  await page.mouse.wheel(0, -600);
  await page.waitForTimeout(500);
  const after = await centre();
  expect(Math.abs(after.lat - before.lat) + Math.abs(after.lng - before.lng)).toBeLessThan(1e-7);
  await expect.poll(inside).toBe(true);
  expect(await readout.textContent()).toBe(size);
  // a 45° turn and a smaller window zoom the map out instead
  await drag('.frame .rotk', (h) => [h.x + 400, h.y + 8]);
  await expect.poll(inside).toBe(true);
  await page.setViewportSize({width: 900, height: 600});
  await expect.poll(inside).toBe(true);
  expect((await readout.textContent())!.split('·')[0]).toBe(size!.split('·')[0]);
});
