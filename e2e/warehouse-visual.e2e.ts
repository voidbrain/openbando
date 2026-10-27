import { expect, test } from '@playwright/test';

/** Capture the warehouse from several angles so its terrain seam can be reviewed on the WebGL runner. */
test('warehouse terrain seam visual capture', async ({ page }, info) => {
  test.setTimeout(180_000);
  await page.goto('/');
  await page.getByRole('button', { name: 'Examples', exact: true }).click();
  await page.locator('app-studio-panel .card.ex').filter({ hasText: /^Playground/ }).getByRole('button', { name: 'Open a copy' }).click();
  await page.locator('app-studio-panel .card:not(.ex)').filter({ hasText: 'Playground' }).getByRole('button', { name: 'Edit', exact: true }).click();
  await page.locator('app-bando-editor button[title^="Elements: list"]').click();
  await page.getByRole('button', { name: /^Warehouse 24×12 m/ }).click();
  await page.locator('[data-tour="view-3d"]').click();
  const canvas = page.locator('app-site-view canvas');
  await expect(canvas).toBeVisible();
  await expect(page.locator('app-site-view .fail')).toHaveCount(0);
  await page.addStyleTag({ content: 'app-bando-editor app-float-box, app-bando-editor .palette, app-bando-editor .opts { visibility: hidden !important; }' });
  const box = await canvas.boundingBox();
  expect(box).not.toBeNull();
  // Let the scheduled rebuild and the software renderer complete before capturing each view.
  await page.waitForTimeout(1500);
  // Frame the building closely and lower the camera so the wall/terrain join is visible.
  await page.mouse.move(box!.x + box!.width * 0.2, box!.y + box!.height * 0.3);
  await page.mouse.wheel(0, -450);
  await page.mouse.down();
  await page.mouse.move(box!.x + box!.width * 0.2, box!.y + box!.height * 0.3 - 65, { steps: 8 });
  await page.mouse.up();
  await page.waitForTimeout(500);
  for (let i = 0; i < 4; i++) {
    await info.attach(`warehouse-angle-${i + 1}`, { body: await canvas.screenshot(), contentType: 'image/png' });
    await page.mouse.move(box!.x + box!.width * 0.2, box!.y + box!.height * 0.3);
    await page.mouse.down();
    await page.mouse.move(box!.x + box!.width * 0.38, box!.y + box!.height * 0.3, { steps: 8 });
    await page.mouse.up();
    await page.waitForTimeout(500);
  }
});
