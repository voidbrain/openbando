// F-041 prototype (not part of the app, not run by CI): render Villetta from the replay's FPV camera shifted on a grid
// and compare each render's edges with the demo video's frame at that moment. Run it by copying it into e2e/ with
// MOMENTS=27.6,73.1,95.9 OUT=<folder>. Results 2026-10-30 are in the F-041 record.
import {expect, test} from '@playwright/test';
import {writeFileSync} from 'node:fs';
const OFFSET = -0.69; // Auto-sync's video offset for the demo flight
test('visual probe', async ({page}) => {
  test.setTimeout(900_000);
  await page.setViewportSize({width: 1280, height: 800});
  await page.addInitScript(() => localStorage.setItem('openbando-welcome', JSON.stringify({completed: true})));
  await page.goto('/');
  await page.locator('app-welcome-panel footer').getByRole('button', {name: 'Open the bandos', exact: true}).click();
  const studio = page.locator('app-studio-panel');
  await studio.locator('button[data-tour="example-villetta-no-place"]').click();
  await expect(studio.locator('.card').filter({hasText: 'Villetta'}).first()).toBeVisible({timeout: 30_000});
  await studio.locator('.card').filter({hasText: 'Villetta'}).first().getByRole('button', {name: 'Fly', exact: true}).click();
  await page.evaluate(async () => {
    const blob = await (await fetch('guide-demo/flight.csv')).blob();
    const input = document.querySelector<HTMLInputElement>('app-panel[data-id="flights"] input[type=file]')!;
    const dt = new DataTransfer(); dt.items.add(new File([blob], 'demo.csv', {type: 'text/csv'}));
    input.files = dt.files; input.dispatchEvent(new Event('change', {bubbles: true}));
  });
  await page.waitForTimeout(3000);
  const moments = (process.env.MOMENTS ?? '27.6').split(',').map(Number);
  for (const t of moments) {
    await page.evaluate((t) => {
      const scene = (window as any).ng.getComponent(document.querySelector('app-stage')!)['scene'];
      scene['view'].setCameraView('fpv'); scene['playback'].pause?.(); scene['playback'].seekTo(t);
    }, t);
    await page.waitForTimeout(1500);
    const out = await page.evaluate(async ({t, off}) => {
      const W = 160, H = 90;
      // the video frame at this moment
      const v = document.createElement('video'); v.muted = true; v.src = 'guide-demo/flight.mp4';
      await new Promise((r) => v.addEventListener('loadeddata', r, {once: true}));
      v.currentTime = t + off; await new Promise((r) => v.addEventListener('seeked', r, {once: true}));
      const grab = (src: CanvasImageSource, sw: number, sh: number, sy = 0): Float32Array => {
        const c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d')!;
        g.drawImage(src, 0, sy, sw, sh, 0, 0, W, H); const d = g.getImageData(0, 0, W, H).data;
        const gray = new Float32Array(W * H); for (let i = 0; i < W * H; i++) gray[i] = (d[i * 4]! + d[i * 4 + 1]! + d[i * 4 + 2]!) / 3;
        return gray;
      };
      const edges = (a: Float32Array): Float32Array => { // Sobel magnitude, then a 3×3 box blur
        const e = new Float32Array(W * H), b = new Float32Array(W * H);
        for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
          const p = (dx: number, dy: number) => a[(y + dy) * W + x + dx]!;
          const gx = p(1, -1) + 2 * p(1, 0) + p(1, 1) - p(-1, -1) - 2 * p(-1, 0) - p(-1, 1);
          const gy = p(-1, 1) + 2 * p(0, 1) + p(1, 1) - p(-1, -1) - 2 * p(0, -1) - p(1, -1);
          e[y * W + x] = Math.hypot(gx, gy);
        }
        for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) { let s = 0; for (let j = -1; j <= 1; j++) for (let i = -1; i <= 1; i++) s += e[(y + j) * W + x + i]!; b[y * W + x] = s / 9; }
        return b;
      };
      const corr = (a: Float32Array, b: Float32Array): number => { let ma = 0, mb = 0; for (let i = 0; i < a.length; i++) { ma += a[i]!; mb += b[i]!; } ma /= a.length; mb /= b.length; let sab = 0, saa = 0, sbb = 0; for (let i = 0; i < a.length; i++) { const x = a[i]! - ma, y = b[i]! - mb; sab += x * y; saa += x * x; sbb += y * y; } return sab / Math.sqrt(saa * sbb || 1); };
      const video = edges(grab(v, v.videoWidth, v.videoHeight));
      // the model alone, seen from the FPV camera shifted by each candidate
      const scene = (window as any).ng.getComponent(document.querySelector('app-stage')!)['scene'];
      const host = scene.host, r = host.renderer, root = host.scene, site = host.site.group;
      const hidden: any[] = []; for (const c of root.children) if (c !== site && !c.isLight && c.visible) { c.visible = false; hidden.push(c); }
      const cam0 = host.mainCamera.clone(); cam0.aspect = 16 / 9; cam0.updateProjectionMatrix();
      const size = r.getSize(new (host.mainCamera.position.constructor)()); // a Vector2-like with x, y
      const vw = 320, vh = 180;
      const render = (dx: number, dy: number, dz: number): Float32Array => {
        const cam = cam0.clone(); cam.position.x += dx; cam.position.y += dy; cam.position.z += dz; cam.updateMatrixWorld();
        r.setViewport(0, 0, vw, vh); r.setScissor(0, 0, vw, vh); r.setScissorTest(true);
        r.render(root, cam);
        const canvasH = r.domElement.height, dpr = r.getPixelRatio();
        const img = grab(r.domElement, vw * dpr, vh * dpr, canvasH - vh * dpr);
        return img;
      };
      const results: {dx: number; dy: number; dz: number; s: number}[] = [];
      for (const dy of [-3, -1.5, 0, 1.5]) for (let dx = -16; dx <= 16; dx += 2) for (let dz = -16; dz <= 16; dz += 2) results.push({dx, dy, dz, s: corr(video, edges(render(dx, dy, dz)))});
      results.sort((a, b) => b.s - a.s);
      const zero = results.find((o) => o.dx === 0 && o.dy === 0 && o.dz === 0)!;
      // images for a look: the video frame, the unshifted render, the best render
      const toUrl = (dx: number, dy: number, dz: number): string => { render(dx, dy, dz); const c = document.createElement('canvas'); c.width = 320; c.height = 180; c.getContext('2d')!.drawImage(r.domElement, 0, r.domElement.height - 180 * r.getPixelRatio(), 320 * r.getPixelRatio(), 180 * r.getPixelRatio(), 0, 0, 320, 180); return c.toDataURL(); };
      const imgs = {zero: toUrl(0, 0, 0), best: toUrl(results[0]!.dx, results[0]!.dy, results[0]!.dz)};
      r.setScissorTest(false); r.setViewport(0, 0, size.x, size.y);
      for (const c of hidden) c.visible = true;
      const vc = document.createElement('canvas'); vc.width = 320; vc.height = 180; vc.getContext('2d')!.drawImage(v, 0, 0, 320, 180);
      return {top: results.slice(0, 8), zero, imgs: {...imgs, video: vc.toDataURL()}};
    }, {t, off: OFFSET});
    console.log(`moment ${t}: unshifted score ${out.zero.s.toFixed(3)}; best ${out.top.map((o) => `(${o.dx},${o.dy},${o.dz}) ${o.s.toFixed(3)}`).join('  ')}`);
    for (const [k, u] of Object.entries(out.imgs)) writeFileSync(`${process.env.OUT ?? '.'}/vis-${t}-${k}.png`, Buffer.from((u as string).split(',')[1]!, 'base64'));
  }
});
