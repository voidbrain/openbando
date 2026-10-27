import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { emptySpec, type BuildingSpec } from '../core/site-spec';
import { floorPoint, indoorSourcePick, indoorViewSpec } from './indoor-view';

const building: BuildingSpec = {
  id: 'b', name: 'B', pos: { x: 0, z: 0 }, rotDeg: 0, length: 10, width: 8,
  levels: [0, 4].map((baseY) => ({ baseY, height: 4, sides: { n: true, s: true, e: true, w: true }, doors: {}, partitions: [], roof: 'gable' as const, roofRise: 2 })),
  basement: { height: 3 },
};

describe('3D indoor floor', () => {
  it('isolates the chosen floor without changing the source and preserves the terrain cut', () => {
    const spec = emptySpec({ lat: 0, lon: 0 }, 'test');
    spec.buildings = [building];
    const result = indoorViewSpec(spec, { id: 'b', li: 1 });
    expect(result.buildings[0]!.levels).toHaveLength(1);
    expect(result.buildings[0]!.levels[0]!.baseY).toBe(4);
    expect(result.buildings[0]!.levels[0]!.roof).toBe('none');
    expect(result.buildings[0]!.basement).toEqual(building.basement);
    expect(building.levels).toHaveLength(2);
    expect(building.levels[1]!.roof).toBe('gable');
  });
  it('isolates the basement with its own floor data and maps its picks to −1', () => {
    const spec = emptySpec(); spec.extent = 60;
    const b = { ...building, basement: { height: 3, columns: [{ x: 2, z: 2, size: 0.5 }] } };
    spec.buildings = [b];
    const result = indoorViewSpec(spec, { id: 'b', li: -1 });
    expect(result.buildings).toHaveLength(1);
    expect(result.buildings[0]!.levels[0]!.baseY).toBe(-3);
    expect(result.buildings[0]!.levels[0]!.columns).toHaveLength(1);
    expect(result.buildings[0]!.basement).toBeUndefined();
    expect(indoorSourcePick({ kind: 'column', id: 'b', li: 0, i: 0 }, { id: 'b', li: -1 })).toEqual({ kind: 'column', id: 'b', li: -1, i: 0 });
  });
  it('maps isolated picks to their original level and projects onto the selected height', () => {
    expect(indoorSourcePick({ kind: 'column', id: 'b', li: 0, i: 2 }, { id: 'b', li: 1 })).toEqual({ kind: 'column', id: 'b', li: 1, i: 2 });
    expect(floorPoint(new THREE.Ray(new THREE.Vector3(2, 10, 3), new THREE.Vector3(0, -1, 0)), 4)).toEqual({ x: 2, z: 3 });
    expect(floorPoint(new THREE.Ray(new THREE.Vector3(2, 0, 3), new THREE.Vector3(0, -1, 0)), 4)).toBeNull();
  });
});
