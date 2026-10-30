import { insidePolygon } from './layers';
import { siteOutline } from './site-ground';
import type { BuildingSpec, SiteSpec, Vec2 } from './site-spec';

/** A floor or roof the take-off pad can stand on: which building, which level (levels.length = the roof), its height. */
export interface TakeoffChoice {
  building: string;
  level: number;
  /** Height above the building's ground, metres (the top of the slab or roof). */
  height: number;
  /** What the pilot reads: "L1", "L2" …, "Roof". */
  label: string;
}

/**
 * A flat roof is a solid box and the collider keeps the drone 0.15 m clear of solids (`SiteCollider.margin`): the drone
 * stands that much above the roof's top, or every move from the pad would be a collision. Floor slabs are not solid.
 */
export const ROOF_CLEARANCE = 0.15;

const levelName = (i: number): string => (i === 0 ? 'G' : `L${i}`);

/** The building whose outline holds `p` (the pad's centre), if any. */
export function buildingAt(spec: SiteSpec, p: Vec2): BuildingSpec | undefined {
  return spec.buildings.find((b) => !b.frame && insidePolygon(siteOutline(b), p.x, p.z));
}

/**
 * The floors and roof of a building something can stand on: each upper floor (a slab is there unless the building is an
 * open shell) and the roof when it is flat and still there; heights above the building's ground. The ground floor is
 * the ground: not listed. One source for the take-off menu and the drone's ground (site-model's standing surfaces).
 */
export function standingLevels(b: BuildingSpec): { level: number; height: number; roof: boolean }[] {
  if (b.frame || b.roofless || (b.ruin ?? 0) >= 0.6) return [];
  const out = b.levels.slice(1).map((l, k) => ({ level: k + 1, height: l.baseY + 0.1, roof: false }));
  const top = b.levels.at(-1);
  if (top && top.roof !== 'none' && (top.roof === 'flat' || b.footprint)) // a shaped building's roof is always flat
    out.push({ level: b.levels.length, height: top.baseY + top.height + 0.3 + ROOF_CLEARANCE, roof: true });
  return out;
}

/** Where the pad can stand inside the building under it (see `standingLevels`). */
export function takeoffChoices(spec: SiteSpec, p: Vec2 = spec.droneStart): TakeoffChoice[] {
  const b = buildingAt(spec, p);
  return b ? standingLevels(b).map((l) => ({ building: b.id, level: l.level, height: l.height, label: l.roof ? 'Roof' : levelName(l.level) })) : [];
}

/** How high above the ground the pad stands (0 on the ground, or when its floor or roof is no longer there). */
export function takeoffHeight(spec: SiteSpec): number {
  const on = spec.takeoffOn;
  if (!on) return 0;
  return takeoffChoices(spec).find((c) => c.building === on.building && c.level === on.level)?.height ?? 0;
}
