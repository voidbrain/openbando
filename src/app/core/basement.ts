import type { BuildingSpec, LevelSpec, Vec2 } from './site-spec';
import { outlineOf } from './openings';

/** Basement dimensions are independent of the floors above, in the same centred building frame. */
export function basementOutline(b: BuildingSpec): Vec2[] {
  return b.basement?.outline ?? outlineOf(b);
}
export function basementBuilding(b: BuildingSpec): BuildingSpec {
  const h = Math.min(12, Math.max(2, b.basement?.height ?? 3));
  const level: LevelSpec = {
    baseY: -h,
    height: h,
    sides: { n: true, s: true, e: true, w: true, ...b.basement?.sides },
    doors: {},
    partitions: b.basement?.partitions ?? [],
    roof: 'none',
    roofRise: 0,
  };
  const outline = basementOutline(b);
  const length = Math.max(...outline.map((p) => p.x)) - Math.min(...outline.map((p) => p.x));
  const width = Math.max(...outline.map((p) => p.z)) - Math.min(...outline.map((p) => p.z));
  const rectangular =
    outline.length === 4 &&
    outline.every(
      (p) =>
        Math.abs(Math.abs(p.x) - length / 2) < 0.001 && Math.abs(Math.abs(p.z) - width / 2) < 0.001,
    );
  return {
    ...b,
    length,
    width,
    footprint: rectangular ? undefined : (b.basement?.outline ?? b.footprint),
    levels: [level],
    basement: undefined,
    fixtures: undefined,
    frame: undefined,
    ruin: 0,
    ruinWalls: undefined,
    roofless: false,
    crenels: false,
  };
}
