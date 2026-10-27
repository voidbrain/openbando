import type { BuildingSpec, LevelSpec, Vec2 } from './site-spec';
import { outlineOf, reshapeBuilding } from './openings';
import { bounds, rectPoly, type Rect } from './footprint';

/** Basement dimensions are independent of the floors above, in the same centred building frame. */
export function basementOutline(b: BuildingSpec): Vec2[] {
  return b.basement?.outline ?? outlineOf(b);
}
export function basementBuilding(b: BuildingSpec): BuildingSpec {
  const h = Math.min(12, Math.max(2, b.basement?.height ?? 3));
  const outline = basementOutline(b);
  const box = bounds(outline);
  const offset = { x: (box.x0 + box.x1) / 2, z: (box.z0 + box.z1) / 2 };
  const angle = b.rotDeg * Math.PI / 180, c = Math.cos(angle), s = Math.sin(angle);
  const centred = outline.map(p => ({ x: p.x - offset.x, z: p.z - offset.z }));
  const level: LevelSpec = {
    baseY: -h,
    height: h,
    sides: { n: true, s: true, e: true, w: true, ...b.basement?.sides },
    doors: structuredClone(b.basement?.doors ?? {}),
    wallOpenings: b.basement?.wallOpenings?.map(o => ({ ...o, x: o.x - offset.x, z: o.z - offset.z })),
    columns: structuredClone(b.basement?.columns),
    voids: structuredClone(b.basement?.voids),
    partitions: b.basement?.partitions ?? [],
    roof: 'none',
    roofRise: 0,
  };
  const length = box.x1 - box.x0;
  const width = box.z1 - box.z0;
  const rectangular =
    centred.length === 4 &&
    centred.every(
      (p) =>
        Math.abs(Math.abs(p.x) - length / 2) < 0.001 && Math.abs(Math.abs(p.z) - width / 2) < 0.001,
    );
  return {
    ...b,
    pos: { x: b.pos.x + offset.x * c - offset.z * s, z: b.pos.z + offset.x * s + offset.z * c },
    length,
    width,
    footprint: rectangular ? undefined : centred,
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

/** Apply floor-tool edits to an isolated basement view and store them only in the basement. */
export function editBasementFloor(b: BuildingSpec, edit: (floor: BuildingSpec) => void): void {
  if (!b.basement) return;
  const floor = basementBuilding(b);
  floor.levels[0]!.partitions = structuredClone(floor.levels[0]!.partitions);
  edit(floor);
  saveBasementFloor(b, floor);
}

/** Save an edited virtual basement without moving the building above. */
export function saveBasementFloor(b: BuildingSpec, floor: BuildingSpec, saveOutline = false): void {
  if (!b.basement) return;
  const a = b.rotDeg * Math.PI / 180, c = Math.cos(a), s = Math.sin(a);
  const dx = floor.pos.x - b.pos.x, dz = floor.pos.z - b.pos.z;
  const offset = { x: dx * c + dz * s, z: -dx * s + dz * c };
  const level = floor.levels[0]!;
  b.basement = { ...b.basement, sides: { ...level.sides }, partitions: level.partitions, doors: level.doors,
    wallOpenings: level.wallOpenings?.map(o => ({ ...o, x: o.x + offset.x, z: o.z + offset.z })), columns: level.columns, voids: level.voids,
    ...(saveOutline ? { outline: (floor.footprint ?? rectPoly(floor.length, floor.width)).map(p => ({ x: p.x + offset.x, z: p.z + offset.z })) } : {}) };
}

/** Add or cut a rectangular section of the basement, leaving the upper building unchanged. */
export function reshapeBasement(b: BuildingSpec, rect: Rect, op: 'add' | 'cut'): boolean {
  if (!b.basement) return false;
  const floor = basementBuilding(b);
  floor.levels[0]!.partitions = structuredClone(floor.levels[0]!.partitions);
  if (!reshapeBuilding(floor, rect, op)) return false;
  saveBasementFloor(b, floor, true);
  return true;
}
