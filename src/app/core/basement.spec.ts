import { describe, expect, it } from 'vitest';
import { basementBuilding } from './basement';
import { emptySpec, sanitizeSpec, type BuildingSpec } from './site-spec';
import { siteGround } from './site-ground';
import { pickModel } from '../three/site-pick';
import * as THREE from 'three';
import { buildSiteFromSpec } from '../three/site-model';
import { Vec3 } from './math3d';
const building = (): BuildingSpec => ({
  id: 'b',
  name: 'B',
  pos: { x: 0, z: 0 },
  rotDeg: 0,
  length: 10,
  width: 8,
  levels: [
    {
      baseY: 0,
      height: 4,
      sides: { n: true, s: true, e: true, w: true },
      doors: {},
      partitions: [],
      roof: 'gable',
      roofRise: 2,
    },
  ],
  basement: { height: 3 },
});
describe('editable basement join', () => {
  it('keeps the basement below G with independent dimensions and walls in preview and scene', () => {
    const b = building();
    b.basement = {
      height: 4,
      outline: [
        { x: -3, z: -2 },
        { x: 3, z: -2 },
        { x: 3, z: 2 },
        { x: -3, z: 2 },
      ],
      sides: { e: false },
    };
    const mini = basementBuilding(b);
    expect(mini.levels[0]!.baseY).toBe(-4);
    expect(mini.length).toBe(6);
    expect(mini.basement).toBeUndefined();
    const s = emptySpec();
    s.buildings = [b];
    s.pads = [];
    const model = buildSiteFromSpec(s);
    expect(model.collider.groundAt(0, 0, -2)).toBe(-4);
    expect(model.collider.hit(new Vec3(3, -2, 0))).toBe(false);
    expect(model.collider.hit(new Vec3(-3, -2, 0))).toBe(true);
    expect(
      pickModel(
        new THREE.Raycaster(new THREE.Vector3(-10, -2, 0), new THREE.Vector3(1, 0, 0)),
        model,
        s,
      ),
    ).toEqual({ kind: 'basement', id: b.id });
    expect(siteGround(s).grid).not.toBeNull(); // a flat saved site must still be cut
  });
  it('preserves edits through saved-file sanitization and separates basement edits from G', () => {
    const s = emptySpec();
    const b = building();
    b.basement!.partitions = [
      [
        { x: 1, z: 1 },
        { x: 9, z: 1 },
      ],
    ];
    s.buildings = [b];
    const copy = sanitizeSpec(JSON.parse(JSON.stringify(s)))!;
    expect(copy.buildings[0]!.basement).toEqual(b.basement);
    expect(basementBuilding(copy.buildings[0]!).levels[0]!.partitions).toHaveLength(1);
    expect(copy.buildings[0]!.levels[0]!.partitions).toHaveLength(0);
  });
});
