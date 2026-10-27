import { describe, expect, it } from 'vitest';
import type { BuildingSpec } from '../core/site-spec';
import { buildingHandles } from './building-handles';

describe('3D building handles', () => {
  it('places shaped-building edge handles in the rotated frame', () => {
    const b: BuildingSpec = { id: 'l', name: 'L', pos: { x: 10, z: 20 }, rotDeg: 90, length: 8, width: 6, levels: [{ baseY: 0, height: 4, sides: { n: true, s: true, e: true, w: true }, doors: {}, partitions: [], roof: 'none', roofRise: 0 }], footprint: [{ x: -4, z: -3 }, { x: 4, z: -3 }, { x: 4, z: 0 }, { x: 0, z: 0 }, { x: 0, z: 3 }, { x: -4, z: 3 }] };
    const handles = buildingHandles(b, 0);
    expect(handles).toHaveLength(7);
    expect(handles[1]!.kind).toBe('edge');
    expect(handles[1]!.edge).toBe(0);
    expect(handles[1]!.x).toBeCloseTo(13);
    expect(handles[1]!.z).toBeCloseTo(20);
  });
  it('places corners in the rotated building frame above the selected floor', () => {
    const b: BuildingSpec = { id: 'b', name: 'B', pos: { x: 10, z: 20 }, rotDeg: 90, length: 8, width: 4, levels: [{ baseY: 4, height: 3, sides: { n: true, s: true, e: true, w: true }, doors: {}, partitions: [], roof: 'none', roofRise: 0 }] };
    const handles = buildingHandles(b, 2);
    expect(handles[0]).toEqual({ kind: 'move', sx: 0, sz: 0, x: 10, z: 20, y: 9.5 });
    expect(handles[1]!.x).toBeCloseTo(12);
    expect(handles[1]!.z).toBeCloseTo(16);
    expect(handles).toHaveLength(5);
  });
});
