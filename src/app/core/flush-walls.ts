import type { BuildingSpec } from './site-spec';
import { edgesOf, type Pt } from './footprint';

/**
 * How much thinner, on each face, the second of two coinciding walls is built (metres). Two buildings snapped flush
 * put two identical wall boxes in one place, whose faces fight in the depth buffer (B-035); the thinner one sits
 * inside the other, so through a window or door of either only one face shows.
 */
export const FLUSH_INSET = 0.03;

/** One wall edge of a building in site coordinates; `key` is its side (`n`, `s`, `e`, `w`) or footprint edge (`edge3`). */
interface SiteEdge {
  id: string;
  key: string;
  a: Pt;
  b: Pt;
}

/** The wall edges of a building, turned and placed in the site (the building's centred frame, as its handles use). */
function siteEdges(b: BuildingSpec): SiteEdge[] {
  const r = (b.rotDeg * Math.PI) / 180, c = Math.cos(r), s = Math.sin(r);
  const at = (p: Pt): Pt => ({ x: b.pos.x + p.x * c - p.z * s, z: b.pos.z + p.x * s + p.z * c });
  if (b.footprint) return edgesOf(b.footprint).map((e) => ({ id: b.id, key: `edge${e.i}`, a: at(e.a), b: at(e.b) }));
  const L = b.length / 2, W = b.width / 2;
  const sides: [string, Pt, Pt][] = [
    ['n', { x: -L, z: -W }, { x: L, z: -W }],
    ['s', { x: -L, z: W }, { x: L, z: W }],
    ['w', { x: -L, z: -W }, { x: -L, z: W }],
    ['e', { x: L, z: -W }, { x: L, z: W }],
  ];
  return sides.map(([key, a, p]) => ({ id: b.id, key, a: at(a), b: at(p) }));
}

/** Two edges on one line (within a few centimetres and a fraction of a degree) that share more than 10 cm of it. */
function coincide(p: SiteEdge, q: SiteEdge): boolean {
  const dx = p.b.x - p.a.x, dz = p.b.z - p.a.z, len = Math.hypot(dx, dz);
  if (len < 0.01) return false;
  const ux = dx / len, uz = dz / len;
  const qx = q.b.x - q.a.x, qz = q.b.z - q.a.z, qlen = Math.hypot(qx, qz);
  if (qlen < 0.01 || Math.abs(ux * qz - uz * qx) / qlen > 0.01) return false; // not parallel
  const off = (t: Pt): number => Math.abs((t.x - p.a.x) * uz - (t.z - p.a.z) * ux);
  if (off(q.a) > 0.05 || off(q.b) > 0.05) return false; // parallel but apart
  const along = (t: Pt): number => (t.x - p.a.x) * ux + (t.z - p.a.z) * uz;
  const t0 = Math.min(along(q.a), along(q.b)), t1 = Math.max(along(q.a), along(q.b));
  return Math.min(len, t1) - Math.max(0, t0) > 0.1;
}

/**
 * The walls to build thinner (`${building id}:${key}`): of every two buildings with a wall edge on the same line,
 * the later one in the list. Rectangles and shaped buildings, at any rotation.
 */
export function flushWalls(buildings: readonly BuildingSpec[]): Set<string> {
  const out = new Set<string>();
  const seen: SiteEdge[] = [];
  for (const b of buildings) {
    const mine = siteEdges(b);
    for (const e of mine) if (seen.some((o) => coincide(o, e))) out.add(`${e.id}:${e.key}`);
    seen.push(...mine);
  }
  return out;
}
