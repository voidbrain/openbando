// Scoring shared by the trial routes: wall lines in the top view, their spread, parallel-wall distances, a top-view PNG.
import fs from 'node:fs';
import zlib from 'node:zlib';

/** A cloud point in site metres, y above the ground. */
export interface CloudPoint { x: number; y: number; z: number; r: number; g: number; b: number }

export function score(cloud: CloudPoint[], path: { x: number; z: number }[], outPrefix: string) {
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
  for (const l of path) {
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

  return {
    wallPoints: wall.length,
    extent: `${(x1 - x0).toFixed(0)} x ${(z1 - z0).toFixed(0)} m`,
    lines: lines.map((l, i) => `${i}: ${l.th}° rho=${l.rho.toFixed(1)} n=${l.n} len=${l.len.toFixed(1)} m spread=${l.spread.toFixed(2)} m`),
    pairs,
  };
}
