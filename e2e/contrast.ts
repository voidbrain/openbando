import {source as axeSource} from 'axe-core';
import {expect, type Page} from '@playwright/test';

/** Page-wide axe is separate; these probes exercise representative real hover/focus states in this document. */
export async function expectInteractionContrast(page: Page, scope: string): Promise<void> {
  const probes = await page.evaluate(scope => {
    const seen = new Set<string>();
    const probes: {id: string; key: string}[] = [];
    const selector = 'button, a[href], input:not([type=hidden]), select, textarea, summary, [role=button], [role=tab]';
    for (const root of document.querySelectorAll(scope)) for (const el of root.querySelectorAll<HTMLElement>(selector)) {
      if (!el.checkVisibility() || !el.getClientRects().length || el.matches(':disabled, [aria-disabled=true]')) continue;
      const css = getComputedStyle(el);
      const key = [el.tagName, el.className, el.getAttribute('type'), el.getAttribute('aria-pressed'),
        el.getAttribute('aria-selected'), el.getAttribute('aria-expanded'), css.color, css.backgroundColor].join('|');
      if (seen.has(key)) continue;
      seen.add(key);
      const id = String(probes.length);
      el.dataset['contrastProbe'] = id;
      probes.push({id, key});
    }
    return probes;
  }, scope);
  expect(probes.length).toBeGreaterThan(0);
  // Reuse one engine. AxeBuilder.analyze() reinjects axe and builds a multi-frame result on every call.
  // Every probe here is explicitly in the main document; the separate page-wide check retains its frame coverage.
  await page.evaluate(axeSource);
  try {
    for (const {id, key} of probes) {
      const control = page.locator(`[data-contrast-probe="${id}"]`);
      for (const state of ['hover', 'focus'] as const) {
        if (state === 'hover') await control.hover();
        else { await page.mouse.move(0, 0); await control.focus(); }
        const failures = await page.evaluate(async id => {
          const axe = (window as unknown as {axe: typeof import('axe-core')}).axe;
          const result = await axe.run(`[data-contrast-probe="${id}"]`, {
            runOnly: {type: 'rule', values: ['color-contrast']}, iframes: false,
            resultTypes: ['violations'],
          });
          return result.violations.map(v => ({id: v.id, nodes: v.nodes.map(n => n.failureSummary)}));
        }, id);
        expect(failures, `${state}: ${key}`).toEqual([]);
      }
    }
  } finally {
    await page.locator('[data-contrast-probe]').evaluateAll(els => els.forEach(el => el.removeAttribute('data-contrast-probe')));
  }
  await page.mouse.move(0, 0);
}
