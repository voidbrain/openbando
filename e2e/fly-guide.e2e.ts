import {expect, test, type Page} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

async function flyFromSavedBando(page: Page) {
  await page.addInitScript(() => localStorage.setItem('openbando-welcome', JSON.stringify({completed: true})));
  await page.emulateMedia({reducedMotion: 'reduce'});
  await page.goto('/');
  await page.locator('app-welcome-panel footer .primary').click();
  const studio = page.locator('app-studio-panel');
  const fixture = {version: 1, id: 'fly-guide', name: 'Fly guide yard', privacy: 'hidden', createdAt: 0,
    origin: {lat: 0, lon: 0}, bearingDeg: 0, genScale: 1, extent: 30, seed: 1,
    trees: [{x: 10, z: 10, h: 8, r: 3, kind: 'd'}], buildings: [], pads: []};
  await studio.locator('input[type=file]').first().setInputFiles({name: 'yard.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(fixture))});
  await studio.locator('.card').filter({hasText: fixture.name}).getByRole('button', {name: 'Fly', exact: true}).click();
  const panel = page.locator('app-panel[data-id="fly"]');
  await expect(panel).toBeVisible();
  return panel;
}

const current = (panel: import('@playwright/test').Locator) => panel.locator('li[aria-current="step"] .title');

test('Fly checklist: replay with a missing video, Back, and a real log ticking its step', async ({page}) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  const panel = await flyFromSavedBando(page);
  await expect(panel.getByRole('button', {name: 'Replay', exact: true})).toHaveAttribute('aria-pressed', 'true');
  // the bando is open, so the first thing to do is the log
  await expect(current(panel)).toHaveText('Load the flight log');
  await panel.getByRole('button', {name: 'Skip', exact: true}).click();
  await expect(current(panel)).toHaveText('Load its DVR video');
  await panel.getByRole('button', {name: 'Skip', exact: true}).click();
  // without both recordings, sync and alignment explain why they are not available; nothing is left to do but extras
  await expect(panel.getByText('Needs both the log and the video.')).toBeVisible();
  await expect(panel.getByText('Needs a flight log.')).toBeVisible();
  await expect(current(panel)).toHaveText('Compare more flights');
  await panel.screenshot({path: test.info().outputPath('fly-checklist.png')});
  const axe = await new AxeBuilder({page}).include('app-panel[data-id="fly"]').withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
  expect(axe.violations.map(v => v.id)).toEqual([]);
  // Back reopens the last skipped step
  await panel.getByRole('button', {name: 'Back', exact: true}).click();
  await expect(current(panel)).toHaveText('Load its DVR video');
  await panel.getByRole('button', {name: 'Back', exact: true}).click();
  await expect(current(panel)).toHaveText('Load the flight log');
  // loading the log in Flights ticks the step: the checklist reads the app, it does not ask
  await panel.getByRole('button', {name: 'Open Flights', exact: true}).click();
  await page.evaluate(async () => {
    const blob = await (await fetch('guide-demo/flight.csv')).blob();
    const input = document.querySelector<HTMLInputElement>('app-panel[data-id="flights"] input[type=file]')!;
    const dt = new DataTransfer(); dt.items.add(new File([blob], 'demo.csv', {type: 'text/csv'}));
    input.files = dt.files; input.dispatchEvent(new Event('change', {bubbles: true}));
  });
  await expect(current(panel)).toHaveText('Load its DVR video', {timeout: 30_000});
  await expect(panel.locator('li').filter({hasText: 'Load the flight log'}).locator('.state')).toHaveText('done');
  expect(errors).toEqual([]);
});

test('Fly checklist: the simulator route opens the simulator without arming, and resumes after a reload', async ({page}) => {
  const panel = await flyFromSavedBando(page);
  await panel.getByRole('button', {name: 'Simulator', exact: true}).click();
  await expect(current(panel)).toHaveText('Connect a controller');
  await panel.getByRole('button', {name: 'Skip', exact: true}).click();
  await expect(current(panel)).toHaveText('Open the simulator');
  await panel.getByRole('button', {name: 'Open Simulator', exact: true}).click();
  await expect(page.locator('app-panel[data-id="simulator"]')).toBeVisible();
  await expect(current(panel)).toHaveText('Arm and fly');
  // the step has no button that arms: arming stays with the pilot
  await expect(panel.locator('li[aria-current="step"] .btn.primary')).toHaveCount(0);
  await expect(page.locator('app-panel[data-id="simulator"]')).toContainText('Disarmed');
  // the route and the skipped step survive a reload
  await page.reload();
  await page.getByRole('button', {name: 'Close Welcome', exact: true}).click();
  await page.locator('app-panel[data-id="views"]').getByRole('button', {name: '▾ Tools', exact: true}).click();
  await page.locator('app-panel[data-id="views"]').getByTitle('Show Fly checklist', {exact: true}).click();
  const again = page.locator('app-panel[data-id="fly"]');
  await expect(again.getByRole('button', {name: 'Simulator', exact: true})).toHaveAttribute('aria-pressed', 'true');
  await expect(again.locator('li').filter({hasText: 'Connect a controller'}).locator('.state')).toHaveText('skipped');
});

test('Fly checklist: the live route opens Live link without connecting', async ({page}) => {
  const panel = await flyFromSavedBando(page);
  await panel.getByRole('button', {name: 'Live', exact: true}).click();
  await expect(current(panel)).toHaveText('Connect the live link');
  await expect(panel.getByText('Connect first.')).toBeVisible();
  await panel.getByRole('button', {name: 'Open Live link', exact: true}).click();
  const live = page.locator('app-panel[data-id="live"]');
  await expect(live).toBeVisible();
  // opening the panel connects nothing: the pilot presses Connect
  await expect(live.getByRole('button', {name: 'Connect', exact: true})).toBeVisible();
  await expect(current(panel)).toHaveText('Connect the live link');
});
