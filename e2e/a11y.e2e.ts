import AxeBuilder from '@axe-core/playwright';
import {expectInteractionContrast} from './contrast';
import { expect, test, type Page } from '@playwright/test';

/** axe on the page as it is now (WCAG 2 A and AA); the 3D canvases and the map tiles are left out. */
async function axe(page: Page): Promise<string[]> {
  // panels fade in: half-transparent text would fail the contrast check, so wait for the entrance animations to end
  await page.waitForFunction(() => !document.getAnimations().some((a) => a.playState === 'running' && 'animationName' in a && String(a.animationName).includes('panel-in')), null, { timeout: 15_000 }).catch(() => undefined);
  const r = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).exclude('canvas').exclude('.leaflet-tile-pane').analyze();
  return r.violations.map((v) => `${v.id} (${v.impact}): ${v.help} · ${v.nodes.slice(0, 3).map((n) => n.target.join(' ')).join(' | ')}`);
}

test('first visit: Welcome over the empty world', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('app-panel[data-id="welcome"]')).toBeVisible();
  expect(await axe(page)).toEqual([]);
  await expectInteractionContrast(page, 'app-panel:not([hidden])');
});

test('after Welcome: Views and Guide me', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Guide me', exact: true }).click();
  await expect(page.locator('app-panel[data-id="views"]')).toBeVisible();
  await expect(page.locator('app-panel[data-id="guide"]')).toBeVisible();
  expect(await axe(page)).toEqual([]);
  await expectInteractionContrast(page, 'app-panel:not([hidden])');
});

test('the editor with a model, the inspector and the library', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Open the bandos' }).click();
  // Contrast is a DOM/style check: use a small real model, not thousands of industrial meshes
  // whose continuous software-WebGL rendering turns every pointer/focus action into seconds.
  const fixture = {version: 1, id: 'a11y-yard', name: 'Accessibility yard', createdAt: 0,
    privacy: 'hidden', origin: {lat: 0, lon: 0}, bearingDeg: 0, genScale: 1, extent: 40, seed: 1,
    droneStart: {x: -12, z: 0}, calibCorners: {p1: {x: -20, z: -20}, p2: {x: 20, z: 20}},
    trees: [], pads: [], buildings: [{id: 'b', name: 'Shed', pos: {x: 0, z: 0}, rotDeg: 0, length: 10, width: 8,
      levels: [{baseY: 0, height: 4, sides: {n: true, s: true, e: true, w: true}, doors: {}, partitions: [], roof: 'flat', roofRise: 0}]}]};
  const studio = page.locator('app-studio-panel');
  await studio.locator('input[type=file]').first().setInputFiles({name: 'a11y.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(fixture))});
  await studio.locator('.card:not(.ex)').filter({hasText: fixture.name}).getByRole('button', {name: 'Edit', exact: true}).click();
  await page.locator('[data-pk="building:b"]').first().click({force: true});
  expect(await axe(page)).toEqual([]);
  await expectInteractionContrast(page, 'app-panel[data-id=studio]');
  await page.locator('app-bando-editor button').filter({ hasText: /^\W*Library$/ }).first().click();
  await expect(page.getByPlaceholder('Search blocks…')).toBeVisible();
  expect(await axe(page)).toEqual([]);
  await expectInteractionContrast(page, 'app-blocks-box');
  await page.locator('app-bando-editor button').filter({ hasText: /^\W*Library$/ }).first().click();
  await page.locator('app-bando-editor button[data-tour="ai"]').click();
  await page.getByRole('button', { name: 'Server / home PC', exact: true }).click();
  await expect(page.getByLabel('token (optional)')).toHaveAccessibleDescription("The token is saved in this browser's local storage.");
  expect(await axe(page)).toEqual([]);
  await expectInteractionContrast(page, 'app-assistant-box');
});

test('a guide step running (caption bar)', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Guide me', exact: true }).click();
  await page.getByRole('button', { name: 'Play: Start a bando: find the place', exact: true }).click();
  await expect(page.locator('app-tour-overlay .bar')).toBeVisible();
  await page.locator('app-tour-overlay .bar').getByRole('button', {name: /Pause/}).click();
  expect(await axe(page)).toEqual([]);
  await expectInteractionContrast(page, 'app-tour-overlay .bar');
});
