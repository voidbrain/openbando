import { expect, test, type Page } from '@playwright/test';

const load = async (page: Page, panel: string, url: string, name: string, type: string): Promise<void> => {
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

const syncKeys = (page: Page): Promise<string[]> =>
  page.evaluate(() => Object.keys(localStorage).filter((k) => k.startsWith('abando-sync:')));

/** An Auto-sync still scanning when the pilot picks another flight must not sync the new pair with its result (B-051). */
test('an Auto-sync of one flight does not sync the flight selected while it scans', async ({ page }) => {
  test.setTimeout(300_000);
  await page.goto('/');
  await page.getByRole('button', { name: 'Close Welcome' }).click();
  await page.evaluate(() => {
    for (const id of ['flights', 'video'])
      document.querySelector<HTMLElement>(`app-panel[data-id="${id}"]`)!.hidden = false;
  });
  await load(page, 'flights', 'guide-demo/flight.csv', 'demo.csv', 'text/csv');
  await load(page, 'video', 'guide-demo/flight.mp4', 'demo.mp4', 'video/mp4');
  await page.waitForTimeout(1500);
  const panel = page.locator('app-panel[data-id="video"]');
  const autoSync = panel.locator('[data-tour~="auto-sync"]');
  await autoSync.click();
  await expect(panel).toContainText(/scanning \d+/, { timeout: 60_000 });
  // while it scans, another flight becomes the active one (the same log under another name: a different pair)
  await load(page, 'flights', 'guide-demo/flight.csv', 'other.csv', 'text/csv');
  // the old scan ends (cancelled or finished) and the button can be used again
  await expect(autoSync).toBeEnabled({ timeout: 240_000 });
  await page.waitForTimeout(500);
  expect((await syncKeys(page)).filter((k) => k.endsWith('|other.csv'))).toEqual([]); // no offset stored for the new pair
  await expect(panel).not.toContainText(/offset -?\d+\.\d+ s/); // and no result shown for it
});
