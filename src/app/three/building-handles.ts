import type { BuildingSpec } from '../core/site-spec';
import { edgesOf } from '../core/footprint';
import { basementOutline, basementBuilding } from '../core/basement';

export interface BuildingHandle {
  kind: 'move' | 'resize' | 'edge' | 'basementVertex';
  vertex?: number;
  edge?: number;
  sx: number;
  sz: number;
  x: number;
  y: number;
  z: number;
}

/** Move at the top centre and resize at its four corners, in the building's rotated frame. */
export function buildingHandles(b: BuildingSpec, groundY: number): BuildingHandle[] {
  const last = b.levels.at(-1);
  const y = groundY + (last ? last.baseY + last.height : 0) + 0.5;
  const angle = b.rotDeg * Math.PI / 180, c = Math.cos(angle), s = Math.sin(angle);
  const at = (sx: number, sz: number): BuildingHandle => {
    const x = sx * b.length / 2, z = sz * b.width / 2;
    return { kind: sx || sz ? 'resize' : 'move', sx, sz, x: b.pos.x + x * c - z * s, z: b.pos.z + x * s + z * c, y };
  };
  if (b.footprint) return [at(0, 0), ...edgesOf(b.footprint).map(e => {
    const x = (e.a.x + e.b.x) / 2, z = (e.a.z + e.b.z) / 2;
    return { kind: 'edge' as const, edge: e.i, sx: 0, sz: 0, x: b.pos.x + x * c - z * s, z: b.pos.z + x * s + z * c, y };
  })];
  return [at(0, 0), at(-1, -1), at(1, -1), at(1, 1), at(-1, 1)];
}

/** Vertex handles on the isolated basement floor, transformed from the building's local frame. */
export function basementHandles(b: BuildingSpec, groundY: number): BuildingHandle[] {
  if (!b.basement) return [];
  const angle = b.rotDeg * Math.PI / 180, c = Math.cos(angle), s = Math.sin(angle);
  const y = groundY + basementBuilding(b).levels[0]!.baseY + 0.25;
  return basementOutline(b).map((p, vertex) => ({ kind: 'basementVertex', vertex, sx: 0, sz: 0,
    x: b.pos.x + p.x * c - p.z * s, z: b.pos.z + p.x * s + p.z * c, y }));
}
