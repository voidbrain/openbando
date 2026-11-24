// Serve the page and the demo video, run the depth model in Chrome, save per-frame depth + colour.
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path';
const [, , wt, outFile, fps = '2'] = process.argv;
const { chromium } = await import(path.join(wt, 'node_modules/playwright/index.mjs'));
const files = { '/page.html': [new URL('./page.html', import.meta.url).pathname, 'text/html'], '/flight.mp4': [path.join(wt, 'public/guide-demo/flight.mp4'), 'video/mp4'] };
const srv = http.createServer((req, res) => {
  const f = files[new URL(req.url, 'http://x').pathname]; if (!f) { res.writeHead(404).end(); return; }
  const size = fs.statSync(f[0]).size, m = /bytes=(\d+)-(\d*)/.exec(req.headers.range || '');
  if (m) { const a = +m[1], b = m[2] ? +m[2] : size - 1; res.writeHead(206, { 'Content-Type': f[1], 'Accept-Ranges': 'bytes', 'Content-Range': `bytes ${a}-${b}/${size}`, 'Content-Length': b - a + 1 }); fs.createReadStream(f[0], { start: a, end: b }).pipe(res); }
  else { res.writeHead(200, { 'Content-Type': f[1], 'Accept-Ranges': 'bytes', 'Content-Length': size }); fs.createReadStream(f[0]).pipe(res); }
}).listen(0, '127.0.0.1');
await new Promise((r) => srv.once('listening', r));
const browser = await chromium.launch({ channel: 'chrome', headless: true, args: ['--enable-unsafe-webgpu', '--enable-features=Vulkan,WebGPU', '--use-angle=metal'] });
const page = await browser.newPage();
page.on('console', (m) => console.log('[page]', m.text()));
await page.goto(`http://127.0.0.1:${srv.address().port}/page.html?fps=${fps}`);
const json = await page.evaluate(() => window.__run());
fs.writeFileSync(outFile, json);
await browser.close(); srv.close();
