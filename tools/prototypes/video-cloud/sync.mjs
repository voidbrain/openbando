// Sync a flight video to its log with the app's own auto-sync, in Chrome. Prints the offset (video time = replay time + offset).
// Usage: node sync.mjs <repo> <video.mp4> <log.csv>   (files stay on this machine; nothing is uploaded)
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';

const [, , repo, video, log] = process.argv;
const root = path.resolve(repo);
const { build } = await import(path.join(root, 'node_modules/esbuild/lib/main.js'));
const { chromium } = await import(path.join(root, 'node_modules/playwright/index.mjs'));
const bundle = await build({
  entryPoints: [path.join(root, 'tools/prototypes/video-cloud/sync.ts')],
  bundle: true,
  format: 'esm',
  write: false,
  logLevel: 'warning',
});
const files = {
  '/': ['<!doctype html><meta charset="utf-8"><script type="module" src="/sync.js"></script>', 'text/html'],
  '/sync.js': [bundle.outputFiles[0].text, 'text/javascript'],
};
const disk = { '/video': [path.resolve(video), 'video/mp4'], '/log': [path.resolve(log), 'text/plain'] };
const srv = http
  .createServer((req, res) => {
    const p = new URL(req.url, 'http://x').pathname;
    if (files[p]) return void res.writeHead(200, { 'Content-Type': files[p][1] }).end(files[p][0]);
    const f = disk[p];
    if (!f) return void res.writeHead(404).end();
    const size = fs.statSync(f[0]).size,
      m = /bytes=(\d+)-(\d*)/.exec(req.headers.range || '');
    const a = m ? +m[1] : 0,
      b = m && m[2] ? +m[2] : size - 1;
    res.writeHead(m ? 206 : 200, {
      'Content-Type': f[1],
      'Accept-Ranges': 'bytes',
      'Content-Length': b - a + 1,
      ...(m ? { 'Content-Range': `bytes ${a}-${b}/${size}` } : {}),
    });
    fs.createReadStream(f[0], { start: a, end: b }).pipe(res);
  })
  .listen(0, '127.0.0.1');
await new Promise((r) => srv.once('listening', r));
const browser = await chromium.launch({ channel: 'chrome', headless: true, args: ['--autoplay-policy=no-user-gesture-required'] });
try {
  const page = await browser.newPage();
  await page.goto(`http://127.0.0.1:${srv.address().port}/`);
  await page.waitForFunction(() => typeof window.sync === 'function');
  console.log(JSON.stringify(await page.evaluate(() => window.sync())));
} finally {
  await browser.close();
  srv.close();
}
