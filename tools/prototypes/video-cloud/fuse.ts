// Fuse per-frame relative depth into one point cloud in metres, using OpenBando's own flight code for the poses.
// Usage (README.md): node fuse.mjs <repo> <frames.json> <outPrefix> <pinhole|fisheye> <hfovDeg> [tiltDeg] [offset] [yawDeg]
import fs from 'node:fs';
import zlib from 'node:zlib';
import { parseLog } from '../../../src/app/core/flight/log-parser';
import { createFlight, prepareFlight } from '../../../src/app/core/flight/flight';
import { ReplayPose } from '../../../src/app/core/flight/replay';
import { Quat, Vec3 } from '../../../src/app/core/math3d';
import type { Calibration } from '../../../src/app/core/models';

const [, , wt, framesFile, outPrefix, lens = 'pinhole', hfovArg = '110', tiltArg = '25', offArg = '-0.69', yawArg = '0'] = process.argv;
const yawQ = new Quat().setFromAxisAngle(new Vec3(0, 1, 0), (+yawArg * Math.PI) / 180);
const HFOV = (+hfovArg * Math.PI) / 180;
const TILT = (+tiltArg * Math.PI) / 180;
const OFFSET = +offArg; // video time = replay time + offset

const { pts, tel } = parseLog(fs.readFileSync(`${wt}/public/guide-demo/flight.csv`, 'utf8'));
const f = createFlight('demo', pts, tel);
const cal: Calibration = { rot: 0, dx: 0, dz: 0, reference: { lat: pts[0]!.lat, lon: pts[0]!.lon } };
prepareFlight(f, cal);
// the site projection puts the open-sea test fix ~100 km out: start the flight at the origin so line offsets stay small
const ox = f.loc[0]!.x, oz = f.loc[0]!.z;
for (const l of f.loc) { l.x -= ox; l.z -= oz; }
const groundY = f.loc[0]!.y - 0.3; // the drone sits on the ground at the start of the log; flat ground assumed

const data = JSON.parse(fs.readFileSync(framesFile, 'utf8')) as {
  W: number; H: number; frames: { tv: number; disp: number[]; rgb: number[] }[]; msPerFrame: number; device: string;
};
const { W, H } = data;
const fpx = lens === 'fisheye' ? W / 2 / (HFOV / 2) : W / 2 / Math.tan(HFOV / 2);
// camera-frame ray per pixel, scaled so its -z component is 1 (so t = camera depth)
const rays: Vec3[] = [];
for (let y = 0; y < H; y++)
  for (let x = 0; x < W; x++) {
    const u = (x + 0.5 - W / 2) / fpx, v = -(y + 0.5 - H / 2) / fpx;
    if (lens === 'fisheye') {
      const th = Math.hypot(u, v), s = th > 1e-9 ? Math.tan(Math.min(th, 1.45)) / th : 1;
      rays.push(new Vec3(u * s, v * s, -1));
    } else rays.push(new Vec3(u, v, -1));
  }

const tiltQ = new Quat().setFromAxisAngle(new Vec3(1, 0, 0), TILT);
const pose = new ReplayPose();
type Vox = { x: number; y: number; z: number; r: number; g: number; b: number; n: number; frames: Set<number> };
const VOX = 0.25;
const vox = new Map<string, Vox>();
let used = 0, skipped = 0;
const fitLog: number[] = [];
let rng = 12345;
const rand = () => ((rng = (rng * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);

data.frames.forEach((fr, fi) => {
  const t = fr.tv - OFFSET;
  if (t < 0 || t > f.dur) return void skipped++;
  pose.update(f, t, cal, 1);
  if (pose.source !== 'telemetry') return void skipped++;
  const camQ = yawQ.clone().multiply(pose.q).multiply(tiltQ);
  const p = pose.p;
  const h = p.y - groundY;
  if (h < 1) return void skipped++; // on or near the ground: the plane fit is degenerate
  const dw = rays.map((r) => r.clone().applyQuat(camQ));
  // ground candidates: rays that hit the ground plane in front, within range
  const cx: number[] = [], cy: number[] = [];
  let dmin = Infinity, dmax = -Infinity;
  for (const d of fr.disp) { if (d < dmin) dmin = d; if (d > dmax) dmax = d; }
  for (let i = 0; i < dw.length; i += 3) {
    const d = dw[i]!;
    if (d.y > -0.02) continue;
    const z = h / -d.y;
    if (z < 0.5 || z > 60) continue;
    cx.push(1 / z); cy.push(fr.disp[i]!);
  }
  if (cx.length < 200) return void skipped++;
  const tol = 0.03 * (dmax - dmin);
  let best = { a: 0, b: 0, n: 0 };
  for (let it = 0; it < 300; it++) {
    const i = Math.floor(rand() * cx.length), j = Math.floor(rand() * cx.length);
    if (Math.abs(cx[i]! - cx[j]!) < 1e-4) continue;
    const a = (cy[i]! - cy[j]!) / (cx[i]! - cx[j]!), b = cy[i]! - a * cx[i]!;
    if (a <= 0) continue;
    let n = 0;
    for (let k = 0; k < cx.length; k++) if (Math.abs(cy[k]! - (a * cx[k]! + b)) < tol) n++;
    if (n > best.n) best = { a, b, n };
  }
  const frac = best.n / cx.length;
  if (frac < 0.35) return void skipped++;
  // least squares on the inliers
  let sx = 0, sy = 0, sxx = 0, sxy = 0, m = 0;
  for (let k = 0; k < cx.length; k++)
    if (Math.abs(cy[k]! - (best.a * cx[k]! + best.b)) < tol) { sx += cx[k]!; sy += cy[k]!; sxx += cx[k]! ** 2; sxy += cx[k]! * cy[k]!; m++; }
  const a = (m * sxy - sx * sy) / (m * sxx - sx * sx), b = (sy - a * sx) / m;
  if (!(a > 0)) return void skipped++;
  fitLog.push(frac);
  used++;
  for (let i = 0; i < dw.length; i++) {
    const q = fr.disp[i]! - b;
    if (q <= 1e-6) continue;
    const z = a / q;
    if (z < 0.5 || z > 40) continue;
    const d = dw[i]!;
    const X = p.x + d.x * z, Y = p.y + d.y * z, Z = p.z + d.z * z;
    if (Y < groundY - 3 || Y > groundY + 30) continue;
    const k = `${Math.floor(X / VOX)},${Math.floor(Y / VOX)},${Math.floor(Z / VOX)}`;
    let v = vox.get(k);
    if (!v) vox.set(k, (v = { x: 0, y: 0, z: 0, r: 0, g: 0, b: 0, n: 0, frames: new Set() }));
    v.x += X; v.y += Y; v.z += Z; v.r += fr.rgb[i * 3]!; v.g += fr.rgb[i * 3 + 1]!; v.b += fr.rgb[i * 3 + 2]!; v.n++; v.frames.add(fi);
  }
});

const cloud = [...vox.values()].filter((v) => v.frames.size >= 2).map((v) => ({
  x: v.x / v.n, y: v.y / v.n - groundY, z: v.z / v.n, r: v.r / v.n, g: v.g / v.n, b: v.b / v.n, k: v.frames.size,
}));
const multi = cloud.filter((c) => c.k >= 3).length;

// PLY
fs.writeFileSync(`${outPrefix}.ply`, `ply\nformat ascii 1.0\nelement vertex ${cloud.length}\nproperty float x\nproperty float y\nproperty float z\nproperty uchar red\nproperty uchar green\nproperty uchar blue\nend_header\n` +
  cloud.map((c) => `${c.x.toFixed(2)} ${c.y.toFixed(2)} ${c.z.toFixed(2)} ${c.r | 0} ${c.g | 0} ${c.b | 0}`).join('\n') + '\n');

// --- walls: points 1..5 m above the ground, top view, Hough lines, spread around each line
const wall = cloud.filter((c) => c.y > 1 && c.y < 5);
const lines: { th: number; rho: number; n: number; spread: number; len: number }[] = [];
const taken = new Uint8Array(wall.length);
for (let li = 0; li < 8; li++) {
  const acc = new Map<string, number>();
  for (let i = 0; i < wall.length; i++) {
    if (taken[i]) continue;
    for (let a = 0; a < 180; a += 1) {
      const th = (a * Math.PI) / 180, rho = Math.round((wall[i]!.x * Math.cos(th) + wall[i]!.z * Math.sin(th)) / 0.5);
      const k = `${a},${rho}`; acc.set(k, (acc.get(k) ?? 0) + 1);
    }
  }
  let bk = '', bn = 0;
  for (const [k, n] of acc) if (n > bn) { bn = n; bk = k; }
  if (bn < 40) break;
  const [a, r] = bk.split(',').map(Number);
  const th = (a! * Math.PI) / 180, rho = r! * 0.5;
  const ds: number[] = [], along: number[] = [];
  for (let i = 0; i < wall.length; i++) {
    if (taken[i]) continue;
    const d = wall[i]!.x * Math.cos(th) + wall[i]!.z * Math.sin(th) - rho;
    if (Math.abs(d) < 1.5) { ds.push(d); along.push(-wall[i]!.x * Math.sin(th) + wall[i]!.z * Math.cos(th)); taken[i] = 1; }
  }
  const med = [...ds].sort((p, q) => p - q)[ds.length >> 1]!;
  const mad = [...ds.map((d) => Math.abs(d - med))].sort((p, q) => p - q)[ds.length >> 1]! * 1.4826;
  along.sort((p, q) => p - q);
  lines.push({ th: a!, rho: rho + med, n: ds.length, spread: mad, len: along[Math.floor(along.length * 0.95)]! - along[Math.floor(along.length * 0.05)]! });
}
const pairs: string[] = [];
for (let i = 0; i < lines.length; i++)
  for (let j = i + 1; j < lines.length; j++) {
    const d = Math.abs(((lines[i]!.th - lines[j]!.th + 90) % 180 + 180) % 180 - 90);
    // near 0° / 180° the normal flips: rho changes sign
    const flip = Math.abs(lines[i]!.th - lines[j]!.th) > 90;
    if (d <= 5) pairs.push(`${i}-${j}: ${Math.abs(lines[i]!.rho + (flip ? 1 : -1) * lines[j]!.rho).toFixed(1)} m`);
    else if (Math.abs(d - 90) <= 5) pairs.push(`${i}-${j}: square (${(90 - d).toFixed(0)}°)`);
  }

// --- top view PNG: ground in its colour, anything above 1 m in a height ramp, the flight path in red
const xs = cloud.map((c) => c.x), zs = cloud.map((c) => c.z);
const q = (arr: number[], p: number) => [...arr].sort((a, b) => a - b)[Math.floor(arr.length * p)]!;
const x0 = q(xs, 0.005) - 5, x1 = q(xs, 0.995) + 5, z0 = q(zs, 0.005) - 5, z1 = q(zs, 0.995) + 5;
const PX = 0.25, IW = Math.ceil((x1 - x0) / PX), IH = Math.ceil((z1 - z0) / PX);
const img = Buffer.alloc(IW * IH * 3, 255), top = new Float32Array(IW * IH).fill(-99);
for (const c of [...cloud].sort((a, b) => a.y - b.y)) {
  const ix = Math.floor((c.x - x0) / PX), iz = Math.floor((c.z - z0) / PX);
  if (ix < 0 || iz < 0 || ix >= IW || iz >= IH) continue;
  const o = iz * IW + ix;
  if (c.y < top[o]!) continue;
  top[o] = c.y;
  const col = c.y < 1 ? [c.r * 0.6 + 100, c.g * 0.6 + 100, c.b * 0.6 + 100] : (() => { const t = Math.min(1, (c.y - 1) / 12); return [40 + 200 * t, 60 + 80 * (1 - t), 220 - 180 * t]; })();
  img[o * 3] = col[0]!; img[o * 3 + 1] = col[1]!; img[o * 3 + 2] = col[2]!;
}
for (const l of f.loc) {
  const ix = Math.floor((l.x - x0) / PX), iz = Math.floor((l.z - z0) / PX);
  if (ix >= 0 && iz >= 0 && ix < IW && iz < IH) { const o = (iz * IW + ix) * 3; img[o] = 230; img[o + 1] = 0; img[o + 2] = 0; }
}
const png = (w: number, h: number, rgb: Buffer) => {
  const crc = (b: Buffer) => { let c = ~0; for (const x of b) { c ^= x; for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1)); } return ~c >>> 0; };
  const chunk = (t: string, d: Buffer) => { const l = Buffer.alloc(4); l.writeUInt32BE(d.length); const td = Buffer.concat([Buffer.from(t), d]); const c = Buffer.alloc(4); c.writeUInt32BE(crc(td)); return Buffer.concat([l, td, c]); };
  const raw = Buffer.alloc((w * 3 + 1) * h);
  for (let y = 0; y < h; y++) rgb.copy(raw, y * (w * 3 + 1) + 1, y * w * 3, (y + 1) * w * 3);
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 2;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]);
};
fs.writeFileSync(`${outPrefix}-top.png`, png(IW, IH, img));

const fits = [...fitLog].sort((a, b) => a - b);
console.log(JSON.stringify({
  lens, hfov: +hfovArg, tilt: +tiltArg, offset: OFFSET, device: data.device, msPerFrame: Math.round(data.msPerFrame),
  frames: data.frames.length, used, skipped, groundFitMedian: +(fits[fits.length >> 1] ?? 0).toFixed(2),
  voxels: cloud.length, seenBy3plus: +(multi / cloud.length).toFixed(2), wallPoints: wall.length,
  extent: `${(x1 - x0).toFixed(0)} x ${(z1 - z0).toFixed(0)} m`,
  lines: lines.map((l, i) => `${i}: ${l.th}° rho=${l.rho.toFixed(1)} n=${l.n} len=${l.len.toFixed(1)} m spread=${l.spread.toFixed(2)} m`),
  pairs,
}, null, 1));
