import { BASEMENT_COORD_LIMIT, bounds, contains, validOutline } from './footprint';
import type { BuildingSpec, Vec2 } from './site-spec';

/**
 * Basement courtyards (holes through the basement: the ground is kept inside, walls around them; the ground floor above still covers them) and separate
 * pieces (further perimeters under the same building), F-002. Both are rings in the basement outline's frame (the
 * building's centred frame). This module describes and validates them; courtyards are drawn and cut (phase 2), pieces are not yet
 * (docs/basement-holes-plan.md).
 */
export interface BasementRing {
  outline: Vec2[];
  /** One flag per edge (absent = every edge has a wall), as for the main perimeter. */
  wallEdges?: boolean[];
}

export const MAX_COURTYARDS = 16;
export const MAX_PIECES = 8;
/** A courtyard narrower than this is a void, not a courtyard. */
export const MIN_COURTYARD = 1;

/** The basement's own perimeter: its outline, else the building's footprint, else its rectangle (as basementVolume). */
export function mainBasementOutline(b: BuildingSpec): Vec2[] {
  return b.basement?.outline ?? b.footprint ?? [
    { x: -b.length / 2, z: -b.width / 2 }, { x: b.length / 2, z: -b.width / 2 },
    { x: b.length / 2, z: b.width / 2 }, { x: -b.length / 2, z: b.width / 2 },
  ];
}

/** Shape-only cleaning of a ring list from a file (finite, inside the coordinate limit, simple, flags matching). */
export function cleanRings(raw: unknown, max: number): BasementRing[] | undefined {
  if (!Array.isArray(raw)) return undefined;
  const point = (p: unknown): p is Vec2 => !!p && typeof p === 'object' && Number.isFinite((p as Vec2).x) && Number.isFinite((p as Vec2).z)
    && Math.abs((p as Vec2).x) <= BASEMENT_COORD_LIMIT && Math.abs((p as Vec2).z) <= BASEMENT_COORD_LIMIT;
  const out: BasementRing[] = [];
  for (const r of raw) {
    const ring = r as Partial<BasementRing> | null;
    if (!ring || !Array.isArray(ring.outline) || !ring.outline.every(point) || !validOutline(ring.outline)) continue;
    const outline = ring.outline.map(p => ({ x: p.x, z: p.z }));
    const flags = Array.isArray(ring.wallEdges) && ring.wallEdges.length === outline.length && ring.wallEdges.every(v => typeof v === 'boolean') ? [...ring.wallEdges] : undefined;
    out.push({ outline, ...(flags && flags.some(v => !v) ? { wallEdges: flags } : {}) });
    if (out.length >= max) break;
  }
  return out.length ? out : undefined;
}

const cross = (a: Vec2, b: Vec2, c: Vec2): number => (b.x - a.x) * (c.z - a.z) - (b.z - a.z) * (c.x - a.x);
/** Whether two segments touch or cross (shared points count). */
function segmentsMeet(a: Vec2, b: Vec2, c: Vec2, d: Vec2): boolean {
  const d1 = cross(c, d, a), d2 = cross(c, d, b), d3 = cross(a, b, c), d4 = cross(a, b, d);
  if (((d1 > 1e-9 && d2 < -1e-9) || (d1 < -1e-9 && d2 > 1e-9)) && ((d3 > 1e-9 && d4 < -1e-9) || (d3 < -1e-9 && d4 > 1e-9))) return true;
  const on = (p: Vec2, q: Vec2, r: Vec2): boolean => Math.abs(cross(p, q, r)) < 1e-9 && r.x >= Math.min(p.x, q.x) - 1e-9 && r.x <= Math.max(p.x, q.x) + 1e-9 && r.z >= Math.min(p.z, q.z) - 1e-9 && r.z <= Math.max(p.z, q.z) + 1e-9;
  return on(c, d, a) || on(c, d, b) || on(a, b, c) || on(a, b, d);
}
const edges = (poly: readonly Vec2[]): [Vec2, Vec2][] => poly.map((p, i) => [p, poly[(i + 1) % poly.length]!]);
/** The rings' boundaries touch or cross anywhere. */
export function ringsMeet(a: readonly Vec2[], b: readonly Vec2[]): boolean {
  return edges(a).some(([p, q]) => edges(b).some(([r, s]) => segmentsMeet(p, q, r, s)));
}
/** `inner` lies strictly inside `outer`: no shared boundary point, every vertex inside. */
export function strictlyInside(inner: readonly Vec2[], outer: Vec2[]): boolean {
  return !ringsMeet(inner, outer) && inner.every(p => contains(outer, p.x, p.z));
}
/** Two rings share no area and no boundary point. */
export function disjoint(a: Vec2[], b: Vec2[]): boolean {
  return !ringsMeet(a, b) && !contains(b, a[0]!.x, a[0]!.z) && !contains(a, b[0]!.x, b[0]!.z);
}

/**
 * Keep the courtyards and pieces a building can have, dropping (never reshaping) the others: a courtyard strictly
 * inside the main perimeter, at least MIN_COURTYARD across, clear of the other courtyards and of the floor items
 * (columns, partitions, voids, which use the basement's min-corner frame); a piece clear of the main perimeter and of
 * the other pieces. Returns the building's basement with the kept lists (a new object; the input is not changed).
 */
export function keepValidRings(b: BuildingSpec): BuildingSpec['basement'] {
  const basement = b.basement;
  if (!basement || (!basement.courtyards && !basement.pieces)) return basement;
  const main = mainBasementOutline(b), box = bounds(main);
  const local = (p: Vec2): Vec2 => ({ x: p.x + box.x0, z: p.z + box.z0 }); // floor items → outline frame
  const items: Vec2[] = [
    ...(basement.columns ?? []).map(c => local(c)),
    ...(basement.partitions ?? []).flatMap(w => w.map(local)),
    ...(basement.voids ?? []).flatMap(v => [local({ x: v.x0, z: v.z0 }), local({ x: v.x1, z: v.z1 })]),
  ];
  const courtyards: BasementRing[] = [];
  for (const c of basement.courtyards ?? []) {
    const r = bounds(c.outline);
    if (r.x1 - r.x0 < MIN_COURTYARD || r.z1 - r.z0 < MIN_COURTYARD) continue;
    if (!strictlyInside(c.outline, main) || courtyards.some(o => !disjoint(o.outline, c.outline))) continue;
    if (items.some(p => contains(c.outline, p.x, p.z))) continue;
    courtyards.push(c);
  }
  const pieces: BasementRing[] = [];
  for (const p of basement.pieces ?? []) {
    if (!disjoint(p.outline, main) || pieces.some(o => !disjoint(o.outline, p.outline))) continue;
    pieces.push(p);
  }
  const { courtyards: _courtyards, pieces: _pieces, ...rest } = basement;
  return { ...rest, ...(courtyards.length ? { courtyards } : {}), ...(pieces.length ? { pieces } : {}) };
}

/**
 * Whether an edited outline still holds the courtyards (each strictly inside) and keeps clear of the pieces. Outline
 * edits keep floor items where they are in the world, so their relation to a courtyard does not change.
 */
export function ringsFit(basement: NonNullable<BuildingSpec['basement']>, outline: Vec2[]): boolean {
  return (basement.courtyards ?? []).every(c => strictlyInside(c.outline, outline)) && (basement.pieces ?? []).every(p => disjoint(p.outline, outline));
}

/** Whether a saved basement keeps every courtyard and piece it had (none would be dropped as invalid). */
export function ringsKept(b: BuildingSpec, basement: NonNullable<BuildingSpec['basement']>): boolean {
  const kept = keepValidRings({ ...b, basement });
  return (kept?.courtyards?.length ?? 0) === (basement.courtyards?.length ?? 0) && (kept?.pieces?.length ?? 0) === (basement.pieces?.length ?? 0);
}
