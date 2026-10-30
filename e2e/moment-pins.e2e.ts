import {expect, test} from '@playwright/test';
/** Pins at moments (B-017): stop the replay, press Pin this moment, click the ground; the pin is reported and can be removed. */
test('a pin at a moment of the replay is placed from the 3D view and can be removed', async ({page}) => {
  test.setTimeout(180_000);
  await page.addInitScript(() => localStorage.setItem('openbando-welcome', JSON.stringify({completed: true})));
  await page.goto('/');
  await page.locator('app-welcome-panel footer').getByRole('button', {name: 'Open the bandos', exact: true}).click();
  const views = page.locator('app-views-panel');
  for (const id of ['flights', 'timeline', 'path']) {
    const b = views.locator(`button.vis[data-panel=${id}]`);
    if (await b.count() && (await b.getAttribute('aria-pressed')) !== 'true') await b.click();
  }
  await page.evaluate(async () => {
    const blob = await (await fetch('guide-demo/flight.csv')).blob();
    const input = document.querySelector<HTMLInputElement>('app-panel[data-id="flights"] input[type=file]')!;
    const dt = new DataTransfer(); dt.items.add(new File([blob], 'demo.csv', {type: 'text/csv'}));
    input.files = dt.files; input.dispatchEvent(new Event('change', {bubbles: true}));
  });
  const pin = page.getByRole('button', {name: 'Pin this moment', exact: true});
  await expect(pin).toBeEnabled({timeout: 30_000});
  const scrub = page.locator('app-timeline-panel .scrub'); const b = (await scrub.boundingBox())!;
  await page.mouse.click(b.x + b.width * 0.3, b.y + b.height / 2);
  await pin.click();
  await expect(pin).toHaveClass(/on/);
  const stage = page.locator('app-stage canvas').first(); const s = (await stage.boundingBox())!;
  await page.mouse.click(s.x + s.width * 0.5, s.y + s.height * 0.7);
  await expect(page.getByText(/Pinned at \d+:\d+/)).toBeVisible();
  await expect(page.getByRole('button', {name: 'Remove the pins at moments', exact: true})).toBeVisible();
  await page.getByRole('button', {name: 'Remove the pins at moments', exact: true}).click();
  await expect(page.getByRole('button', {name: 'Remove the pins at moments', exact: true})).toHaveCount(0);
});

/** With the Bandos editor open, an armed pin lands on its 2D plan and on its 3D view (its 3D view used to select instead). */
test('pins land from the editor, on its plan and in its 3D view', async ({page}) => {
  test.setTimeout(240_000);
  await page.addInitScript(() => localStorage.setItem('openbando-welcome', JSON.stringify({completed: true})));
  await page.goto('/');
  await page.locator('app-welcome-panel footer').getByRole('button', {name: 'Open the bandos', exact: true}).click();
  const fixture = {
    version: 1, id: 'pins', name: 'Pins yard', createdAt: 0, privacy: 'hidden',
    origin: {lat: 0, lon: 0}, bearingDeg: 0, genScale: 1, extent: 80, seed: 1, trees: [],
    pads: [{x: 0, z: 0, w: 6, d: 6}], droneStart: {x: 0, z: 0},
    buildings: [{id: 'b', name: 'Shed', pos: {x: 30, z: -30}, rotDeg: 0, length: 8, width: 6,
      levels: [{baseY: 0, height: 4, sides: {n: true, s: true, e: true, w: true}, doors: {}, partitions: [], roof: 'flat', roofRise: 0}]}],
  };
  const studio = page.locator('app-studio-panel');
  await studio.locator('input[type=file]').first().setInputFiles({name: 'pins.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(fixture))});
  await studio.locator('.card').filter({hasText: fixture.name}).getByRole('button', {name: 'Edit', exact: true}).click();
  const shedOnPlan = page.locator('[data-pk="building:b"]').first();
  await expect(shedOnPlan).toBeVisible();
  const views = page.locator('app-views-panel');
  for (const id of ['flights', 'timeline', 'path']) {
    const b = views.locator(`button.vis[data-panel=${id}]`);
    if (await b.count() && (await b.getAttribute('aria-pressed')) !== 'true') await b.click();
  }
  await page.evaluate(async () => {
    const blob = await (await fetch('guide-demo/flight.csv')).blob();
    const input = document.querySelector<HTMLInputElement>('app-panel[data-id="flights"] input[type=file]')!;
    const dt = new DataTransfer(); dt.items.add(new File([blob], 'demo.csv', {type: 'text/csv'}));
    input.files = dt.files; input.dispatchEvent(new Event('change', {bubbles: true}));
  });
  const path = page.locator('app-panel[data-id="path"]');
  const startX = path.locator('input').first();
  await expect(startX).not.toHaveValue('', {timeout: 30_000});
  if (!(await shedOnPlan.isVisible())) await views.locator('button.vis[data-panel=studio]').click(); // loading a log can hide the editor
  await expect(shedOnPlan).toBeVisible();
  // on the plan: pin the start (Pin start works with the replay at the start)
  await page.locator('app-timeline-panel button[title="Back to start"]').click();
  await expect(path.getByRole('button', {name: 'Pin start', exact: true})).toBeEnabled();
  const before = await startX.inputValue();
  await path.getByRole('button', {name: 'Pin start', exact: true}).dispatchEvent('click'); // the panel may sit partly off-screen beside the editor (Enter would also arm the simulator)
  const shed = (await shedOnPlan.boundingBox())!; // a point on the plan beside the shed
  await page.mouse.click(shed.x - 40, shed.y + shed.height + 40);
  await expect(startX).not.toHaveValue(before, {timeout: 20_000}); // the field follows the panel's canvas draw, slow under load
  // in the editor's 3D view: pin a moment
  const scrub = page.locator('app-timeline-panel .scrub'); const s = (await scrub.boundingBox())!;
  await page.mouse.click(s.x + s.width * 0.4, s.y + s.height / 2);
  if (!(await shedOnPlan.isVisible())) await views.locator('button.vis[data-panel=studio]').click();
  await page.locator('[data-tour="view-3d"]').click();
  const canvas = page.locator('app-site-view canvas'); await expect(canvas).toBeVisible();
  await path.getByRole('button', {name: 'Pin this moment', exact: true}).dispatchEvent('click');
  const c = (await canvas.boundingBox())!;
  await page.mouse.click(c.x + c.width * 0.5, c.y + c.height * 0.75);
  await expect(page.getByText(/Pinned at \d+:\d+/)).toBeVisible();
});

/** Adjust position (F-040): the move control on the replay drone; the keyboard nudges it, Enter keeps it as a pin. */
test('Adjust position moves the drone at this moment, height included, from the keyboard', async ({page}) => {
  test.setTimeout(180_000);
  await page.addInitScript(() => localStorage.setItem('openbando-welcome', JSON.stringify({completed: true})));
  await page.goto('/');
  await page.locator('app-welcome-panel footer').getByRole('button', {name: 'Open the bandos', exact: true}).click();
  const views = page.locator('app-views-panel');
  for (const id of ['flights', 'timeline', 'path']) {
    const b = views.locator(`button.vis[data-panel=${id}]`);
    if (await b.count() && (await b.getAttribute('aria-pressed')) !== 'true') await b.click();
  }
  await page.evaluate(async () => {
    const blob = await (await fetch('guide-demo/flight.csv')).blob();
    const input = document.querySelector<HTMLInputElement>('app-panel[data-id="flights"] input[type=file]')!;
    const dt = new DataTransfer(); dt.items.add(new File([blob], 'demo.csv', {type: 'text/csv'}));
    input.files = dt.files; input.dispatchEvent(new Event('change', {bubbles: true}));
  });
  const adjust = page.getByRole('button', {name: 'Adjust position', exact: true});
  await expect(adjust).toBeEnabled({timeout: 30_000});
  const scrub = page.locator('app-timeline-panel .scrub'); const s = (await scrub.boundingBox())!;
  await page.mouse.click(s.x + s.width * 0.3, s.y + s.height / 2);
  const caption = page.locator('app-timeline-panel .mono').first();
  const at = (await caption.textContent())!.split('/')[0];
  await adjust.click();
  await expect(page.getByRole('button', {name: 'Done adjusting', exact: true})).toBeVisible();
  for (let i = 0; i < 2; i++) await page.keyboard.press('Shift+ArrowUp');
  await page.keyboard.press('ArrowLeft');
  expect((await caption.textContent())!.split('/')[0]).toBe(at); // the arrows moved the drone, not the replay
  await page.keyboard.press('Enter');
  await expect(page.getByText(/Pinned at \d+:\d+/)).toBeVisible();
  await expect(page.getByRole('button', {name: 'Adjust position', exact: true})).toBeVisible();
  await expect(page.getByRole('button', {name: 'Remove the pins at moments', exact: true})).toBeVisible();
});
