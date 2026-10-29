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
