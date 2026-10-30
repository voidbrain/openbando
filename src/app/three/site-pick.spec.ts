import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { emptySpec, type BuildingSpec } from '../core/site-spec';
import { buildSiteFromSpec } from './site-model';
import { pickModel } from './site-pick';
describe('main-page and editor picking', () => {
  it('resolves the building id through merged scene meshes and excludes a hidden roof', () => {
    const s = emptySpec();
    s.pads = [];
    s.buildings = [
      {
        id: 'shed',
        name: 'Shed',
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
      } satisfies BuildingSpec,
    ];
    const model = buildSiteFromSpec(s, { merge: true });
    const ray = new THREE.Raycaster(new THREE.Vector3(0, 20, 0), new THREE.Vector3(0, -1, 0));
    expect(pickModel(ray, model, s)).toEqual({ kind: 'building', id: 'shed' });
    model.setRoofHidden(true);
    expect(pickModel(ray, model, s)).toEqual({ kind: 'building', id: 'shed' }); // the floor is still selectable
  });
  it('selects instanced trees by their original spec index', () => {
    const s = emptySpec();
    s.pads = [];
    s.trees = [
      { x: 10, z: 0, r: 2, h: 8, kind: 'c' },
      { x: -10, z: 0, r: 2, h: 8, kind: 'd' },
    ];
    const model = buildSiteFromSpec(s);
    expect(
      pickModel(
        new THREE.Raycaster(new THREE.Vector3(-10, 30, 0), new THREE.Vector3(0, -1, 0)),
        model,
        s,
      ),
    ).toEqual({ kind: 'tree', i: 1 });
  });
  it('does not select a buried tunnel through the intact hill above it', () => {
    const s = emptySpec();
    s.pads = [];
    s.terrain = {
      cell: 1,
      half: { e: 60, n: 60 },
      strokes: [{ op: 'hill', pts: [{ x: 0, z: 0 }], radius: 20, strength: 10 }],
    };
    s.underground = [
      {
        id: 'u',
        name: 'Tunnel',
        outline: [
          { x: -15, z: -2 },
          { x: 15, z: -2 },
          { x: 15, z: 2 },
          { x: -15, z: 2 },
        ],
        floor: 0,
        ceiling: 3,
        shape: 'vault',
        wall: 0.3,
      },
    ];
    const model = buildSiteFromSpec(s);
    expect(
      pickModel(
        new THREE.Raycaster(new THREE.Vector3(0, 30, 0), new THREE.Vector3(0, -1, 0)),
        model,
        s,
      ),
    ).toBeNull();
  });
  it('picks the take-off pad (the last pad), not another pad, in the merged view (F-035)', () => {
    const s = emptySpec();
    s.pads = [{ x: 20, z: 0, w: 6, d: 6 }, { x: -20, z: 0, w: 6, d: 6 }];
    s.droneStart = { x: -20, z: 0 };
    const model = buildSiteFromSpec(s, { merge: true });
    const down = (x: number) => new THREE.Raycaster(new THREE.Vector3(x, 20, 1.5), new THREE.Vector3(0, -1, 0));
    expect(pickModel(down(-20), model, s)).toEqual({ kind: 'pad' });
    expect(pickModel(down(20), model, s)).toBeNull();
  });
});
