import AxeBuilder from '@axe-core/playwright';
import {expect, type Page} from '@playwright/test';

/** Exercise distinct rendered control styles; axe on an idle page cannot see hover/focus overrides. */
export async function expectInteractionContrast(page: Page, scope: string): Promise<void> {
  const root = page.locator(scope);
  const controls = root.locator('button, a[href], input:not([type=hidden]), select, textarea, summary, [role=button], [role=tab]');
  expect(await controls.count()).toBeGreaterThan(0);
  const seen = new Set<string>();
  for (let i = 0; i < await controls.count(); i++) {
    const control = controls.nth(i);
    if (!await control.isVisible() || !await control.isEnabled()) continue;
    // Include the actual resting fill/ink in the key: identical class names can have different parent/state rules.
    const key = await control.evaluate(el => {
      const css = getComputedStyle(el);
      return [el.tagName, el.className, el.getAttribute('type'), el.getAttribute('aria-pressed'),
        el.getAttribute('aria-selected'), el.getAttribute('aria-expanded'), css.color, css.backgroundColor].join('|');
    });
    if (seen.has(key)) continue;
    seen.add(key);
    await control.evaluate(el => el.setAttribute('data-contrast-probe', ''));
    try {
      for (const state of ['hover', 'focus'] as const) {
        if (state === 'hover') await control.hover();
        else { await page.mouse.move(0, 0); await control.focus(); }
        const result = await new AxeBuilder({page}).include('[data-contrast-probe]').withRules(['color-contrast']).analyze();
        expect(result.violations.map(v => ({id: v.id, nodes: v.nodes.map(n => n.failureSummary)})), `${state}: ${key}`).toEqual([]);
      }
    } finally { await control.evaluate(el => el.removeAttribute('data-contrast-probe')); }
  }
  await page.mouse.move(0, 0);
}
