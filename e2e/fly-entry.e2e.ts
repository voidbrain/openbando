import {expect, test} from '@playwright/test';

test('returning pilots open bandos, Fly opens telemetry, and Views can close and reopen', async ({page}) => {
  await page.addInitScript(() => localStorage.setItem('openbando-welcome', JSON.stringify({completed: true})));
  await page.emulateMedia({reducedMotion: 'reduce'});
  await page.goto('/');
  await expect(page.locator('app-welcome-panel [data-tour="welcome-tour"]')).not.toHaveClass(/primary/);
  await page.locator('app-welcome-panel footer .primary').click();
  const studio = page.locator('app-studio-panel');
  const fixture = {version: 1, id: 'fly-yard', name: 'Fly yard', privacy: 'hidden', createdAt: 0,
    origin: {lat: 0, lon: 0}, bearingDeg: 0, genScale: 1, extent: 30, seed: 1,
    trees: [], buildings: [], pads: []};
  await studio.locator('input[type=file]').first().setInputFiles({name: 'yard.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(fixture))});
  const card = studio.locator('.card').filter({hasText: 'Fly yard'});
  await card.getByRole('button', {name: 'Fly', exact: true}).click();
  await expect(page.locator('app-panel[data-id="studio"]')).toBeHidden();
  for (const id of ['flights', 'video', 'timeline', 'speed', 'attitude', 'path', 'blackbox']) {
    await expect(page.locator(`app-panel[data-id="${id}"]`)).toBeVisible();
  }
  await expect(page.locator('app-panel[data-id="live"]')).toBeHidden();
  await expect.poll(async () => {
    const video = await page.locator('app-panel[data-id="video"]').boundingBox();
    const flights = await page.locator('app-panel[data-id="flights"]').boundingBox();
    return !!video && !!flights && flights.y >= video.y + video.height;
  }).toBe(true);
  await page.getByRole('button', {name: 'Close Views', exact: true}).click();
  await expect(page.locator('app-panel[data-id="views"]')).toBeHidden();
  await page.getByRole('button', {name: 'Open the Views panel', exact: true}).click();
  await expect(page.locator('app-panel[data-id="views"]')).toBeVisible();
});

test('loading either recording exposes the other panel and undecodable video has an explanation', async ({page}) => {
  await page.goto('/');
  await page.getByRole('button', {name: 'Load a video', exact: true}).click();
  await page.locator('app-video-panel input[type=file]').setInputFiles({name: 'bad.mp4', mimeType: 'video/mp4', buffer: Buffer.from('invalid video')});
  await expect(page.locator('app-panel[data-id="flights"]')).toBeVisible();
  await expect(page.getByText('Video could not be loaded. Try another format.', {exact: true})).toBeVisible();
  await page.getByRole('button', {name: 'Close Video', exact: true}).click();
  const points = [{lat: 1, lon: 1, alt: 1, t: 0}, {lat: 1, lon: 1.00001, alt: 2, t: 1}];
  await page.locator('app-flights-panel input[multiple]').setInputFiles({name: 'recording.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(points))});
  await expect(page.locator('app-panel[data-id="video"]')).toBeVisible();
});
