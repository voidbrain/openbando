// Fuse per-frame relative depth into one point cloud in metres, using OpenBando's own flight code for the poses.
// Usage (README.md): node fuse.mjs <repo> <frames.json> <outPrefix> <pinhole|fisheye> <hfovDeg> [tiltDeg] [offset] [yawDeg]
import fs from 'node:fs';
import { score } from './score';
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

const sc = score(cloud, f.loc, outPrefix);
const fits = [...fitLog].sort((a, b) => a - b);
console.log(JSON.stringify({
  lens, hfov: +hfovArg, tilt: +tiltArg, offset: OFFSET, device: data.device, msPerFrame: Math.round(data.msPerFrame),
  frames: data.frames.length, used, skipped, groundFitMedian: +(fits[fits.length >> 1] ?? 0).toFixed(2),
  voxels: cloud.length, seenBy3plus: +(multi / cloud.length).toFixed(2), ...sc,
}, null, 1));
