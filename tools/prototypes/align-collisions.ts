// F-041 prototype (not part of the app): where does the replayed demo flight pass through Villetta's solids, and what
// smallest 3D shift clears each such stretch? Run: npx esbuild tools/prototypes/align-collisions.ts --bundle
// --platform=node --format=esm --outfile=<file>.mjs, then node <file>.mjs. Results 2026-10-30 are in the F-041 record.
import { readFileSync } from 'node:fs';
import { parseLog } from '../../src/app/core/flight/log-parser';
import { createFlight, prepareFlight } from '../../src/app/core/flight/flight';
import { sanitizeSpec } from '../../src/app/core/site-spec';
import { siteGround } from '../../src/app/core/site-ground';
import { heightAt } from '../../src/app/core/terrain';
import { buildSiteFromSpec } from '../../src/app/three/site-model';
import { Vec3 } from '../../src/app/core/math3d';

const spec = sanitizeSpec(JSON.parse(readFileSync('library/bandos/villetta-no-place.json', 'utf8')))!;
const { pts, tel } = parseLog(readFileSync('public/guide-demo/flight.csv', 'utf8'));
const model = buildSiteFromSpec(spec);
const collider = model.collider;
const g = siteGround(spec);
const f = createFlight('demo', pts, tel);
const first = pts[0]!;
// as the app does on a bando without its place: the first fix on the take-off spot
const cal0 = { rot: 0, dx: 0, dz: 0, reference: { lat: first.lat, lon: first.lon } };
prepareFlight(f, cal0, (x, z) => heightAt(g.grid, x, z));
const s0 = f.loc[0]!;
const cal = { ...cal0, dx: spec.droneStart.x - s0.x, dz: spec.droneStart.z - s0.z };
prepareFlight(f, cal, (x, z) => heightAt(g.grid, x, z));
const times = pts.map((p) => p.t - first.t);
const hit = f.loc.map((p) => collider.hit(p));
console.log('fixes', f.loc.length, 'in solids', hit.filter(Boolean).length);
// runs of fixes inside solids
const runs: [number, number][] = [];
for (let i = 0; i < hit.length; i++) if (hit[i]) { const a = i; while (i + 1 < hit.length && hit[i + 1]) i++; runs.push([a, i]); }
for (const [a, b] of runs) console.log(`through a solid ${times[a]!.toFixed(1)}–${times[b]!.toFixed(1)} s (${b - a + 1} fixes) at ${f.loc[a]!.x.toFixed(1)}, ${f.loc[a]!.y.toFixed(1)}, ${f.loc[a]!.z.toFixed(1)}`);

// the building a point is in or nearest to (centre distance), for the report
const nearest = (p: Vec3): string => spec.buildings.map((b) => ({ b, d: Math.hypot(b.pos.x - p.x, b.pos.z - p.z) })).sort((u, v) => u.d - v.d)[0]!.b.name;
// smallest shift (grid 0.5 m across, 0.5 m vertical) that clears every fix from 1 s before to 1 s after the run;
// confidence: how many shifts within 1 m of it also clear (a narrow gap scores low), and the runner-up direction
for (const [a, b] of runs) {
  const t0 = times[a]! - 1, t1 = times[b]! + 1;
  const idx = times.map((t, i) => [t, i] as const).filter(([t]) => t >= t0 && t <= t1).map(([, i]) => i);
  const clears = (dx: number, dy: number, dz: number): boolean => idx.every((i) => { const p = f.loc[i]!; return !collider.hit(new Vec3(p.x + dx, p.y + dy, p.z + dz)); });
  const found: { dx: number; dy: number; dz: number; n: number }[] = [];
  for (let dy = -6; dy <= 6; dy += 0.5) for (let dx = -15; dx <= 15; dx += 0.5) for (let dz = -15; dz <= 15; dz += 0.5) {
    if (clears(dx, dy, dz)) found.push({ dx, dy, dz, n: Math.hypot(dx, dz) + 3 * Math.abs(dy) }); // the barometer holds height over seconds: a height shift costs 3×
  }
  found.sort((u, v) => u.n - v.n);
  const best = found[0];
  const near = best ? found.filter((o) => Math.hypot(o.dx - best.dx, o.dy - best.dy, o.dz - best.dz) <= 1).length : 0;
  const other = best ? found.find((o) => Math.hypot(o.dx - best.dx, o.dy - best.dy, o.dz - best.dz) > 4) : undefined;
  console.log(`${times[a]!.toFixed(1)}–${times[b]!.toFixed(1)} s in/near ${nearest(f.loc[a]!)}: ` + (best ? `smallest clear shift ${best.dx}, ${best.dy}, ${best.dz} (cost ${best.n.toFixed(1)}), ${near} clear shifts within 1 m` + (other ? `; another way ${other.dx}, ${other.dy}, ${other.dz} (cost ${other.n.toFixed(1)})` : '') : 'no clear shift within 15 m'));
}

// the store exit (1:35.9): the owner says the drone was leaving the store; express shifts in the store's own axes
const store = spec.buildings.find((b) => b.name === 'Main store')!;
const inStore = (dx: number, dz: number): string => { const a = (store.rotDeg * Math.PI) / 180; return `along ${(dx * Math.cos(a) + dz * Math.sin(a)).toFixed(1)}, across ${(-dx * Math.sin(a) + dz * Math.cos(a)).toFixed(1)}`; };
const i959 = times.findIndex((t) => t >= 95.9), p959 = f.loc[i959]!;
const a = (store.rotDeg * Math.PI) / 180, lx = p959.x - store.pos.x, lz = p959.z - store.pos.z;
console.log(`1:35.9 in the store's axes: along ${(lx * Math.cos(a) + lz * Math.sin(a)).toFixed(1)}, across ${(-lx * Math.sin(a) + lz * Math.cos(a)).toFixed(1)} (half width ${(store.width / 2).toFixed(1)}); a shift of (−1, 0.5) is ${inStore(-1, 0.5)}`);
