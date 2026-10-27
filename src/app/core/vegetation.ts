import { contains, type Pt } from './footprint';
import { newFence } from './fences';
import { nearBuilding, scatterTrees, type ScatterOpts } from './scatter';
import type { SiteSpec, WallSpec } from './site-spec';

export type ShrubKind = 'hedge' | 'bramble';

/** A small living wall stays an ordinary editable hedge or bramble in the site spec. */
export function vegetationAt(p: Pt, kind: ShrubKind, angle = 0): WallSpec {
  const half = kind === 'bramble' ? 1 : 0.75;
  const dx = Math.cos(angle) * half, dz = Math.sin(angle) * half;
  return newFence({ x: p.x - dx, z: p.z - dz }, { x: p.x + dx, z: p.z + dz }, kind);
}

function distanceToWall(p: Pt, w: WallSpec): number {
  const dx = w.b.x - w.a.x, dz = w.b.z - w.a.z, l2 = dx * dx + dz * dz;
  const t = l2 ? Math.max(0, Math.min(1, ((p.x - w.a.x) * dx + (p.z - w.a.z) * dz) / l2)) : 0;
  return Math.hypot(p.x - w.a.x - t * dx, p.z - w.a.z - t * dz);
}

/** Fill a brush area with individually editable short living walls, retaining the usual vegetation spacing. */
export function scatterVegetation(poly: Pt[], site: Pick<SiteSpec, 'trees' | 'walls' | 'buildings'>, kind: ShrubKind, opts: ScatterOpts = {}): WallSpec[] {
  const rng = opts.rng ?? Math.random;
  const spacing = Math.max(1.5, opts.spacing ?? 5);
  const old = site.walls ?? [];
  const candidates = scatterTrees(poly, site.trees, { ...opts, rng, max: Math.min(160, opts.max ?? 160) }, (p) =>
    nearBuilding(site.buildings, p) || old.some(w => distanceToWall(p, w) < Math.max(1.5, spacing * 0.5 + w.thick / 2)),
  );
  const out: WallSpec[] = [];
  for (const p of candidates) {
    const w = vegetationAt(p, kind, rng() * Math.PI * 2);
    const samples = Array.from({ length: 9 }, (_, i) => ({ x: w.a.x + (w.b.x - w.a.x) * i / 8, z: w.a.z + (w.b.z - w.a.z) * i / 8 }));
    if (!samples.every(q => contains(poly, q.x, q.z) && !nearBuilding(site.buildings, q))) continue;
    if ([...old, ...out].some(v => [w.a, w.b].some(q => distanceToWall(q, v) < (w.thick + v.thick) / 2))) continue;
    out.push(w);
  }
  return out;
}
