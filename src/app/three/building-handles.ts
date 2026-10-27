import type { BuildingSpec } from '../core/site-spec';

export interface BuildingHandle {
  kind: 'move' | 'resize';
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
  return [at(0, 0), at(-1, -1), at(1, -1), at(1, 1), at(-1, 1)];
}
