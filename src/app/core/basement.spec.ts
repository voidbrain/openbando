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
    s.extent = 60; // Keep the terrain small while exercising the complete scene and collider.
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

describe('basement floor tools', () => {
  it('keeps floor-tool data separate from G and through save/import', async () => {
    const { editBasementFloor } = await import('./basement');
    const b = building();
    editBasementFloor(b, (floor) => {
      const l = floor.levels[0]!;
      l.doors.n = [{ kind: 'door', c: 1, w: 1, h: 2 }];
      l.columns = [{ x: 3, z: 3, size: 0.5 }];
      l.voids = [{ x0: 4, z0: 3, x1: 6, z1: 5 }];
      l.partitions.push([{ x: 1, z: 1 }, { x: 4, z: 1 }]);
    });
    const s = emptySpec(); s.buildings = [b];
    const copy = sanitizeSpec(JSON.parse(JSON.stringify(s)))!;
    const floor = basementBuilding(copy.buildings[0]!).levels[0]!;
    expect(floor.doors.n).toHaveLength(1);
    expect(floor.columns).toHaveLength(1);
    expect(floor.voids).toHaveLength(1);
    expect(floor.partitions).toHaveLength(1);
    expect(copy.buildings[0]!.levels[0]!.doors).toEqual({});
    expect(copy.buildings[0]!.levels[0]!.columns).toBeUndefined();
  });
});

it('undoes and redoes basement edits without changing ground-floor data', async () => {
  const { SiteEditor } = await import('./site-editor');
  const { editBasementFloor } = await import('./basement');
  const spec = emptySpec(); spec.buildings = [building()];
  const editor = new SiteEditor(); editor.load(spec);
  editor.commitSite(s => editBasementFloor(s.buildings[0]!, floor => {
    floor.levels[0]!.columns = [{ x: 2, z: 2, size: 0.5 }];
  }));
  expect(editor.draft().buildings[0]!.basement!.columns).toHaveLength(1);
  editor.undo();
  expect(editor.draft().buildings[0]!.basement!.columns).toBeUndefined();
  editor.redo();
  expect(editor.draft().buildings[0]!.basement!.columns).toHaveLength(1);
  expect(editor.draft().buildings[0]!.levels[0]!.columns).toBeUndefined();
});

it('renders basement columns and cuts a door through the basement wall', () => {
  const b = building();
  b.basement = { height: 3, doors: { n: [{ kind: 'door', c: 5, w: 2, h: 2.5 }] }, columns: [{ x: 2, z: 2, size: 1 }] };
  const s = emptySpec(); s.extent = 60; s.buildings = [b]; s.pads = [];
  const model = buildSiteFromSpec(s);
  expect(model.collider.hit(new Vec3(0, -2, -4))).toBe(false);
  expect(model.collider.hit(new Vec3(3, -2, -4))).toBe(true);
  expect(model.collider.hit(new Vec3(-3, -2, -2))).toBe(true);
});

it('opens the basement slab and connected room ceiling together for rendering and collision', () => {
  const b = building();
  b.basement = { height: 3, voids: [{ x0: 4, z0: 3, x1: 6, z1: 5 }] };
  const s = emptySpec(); s.extent = 60; s.buildings = [b]; s.pads = [];
  s.underground = [{ id: 'lower', name: 'Lower', outline: [{ x: -4, z: -3 }, { x: 4, z: -3 }, { x: 4, z: 3 }, { x: -4, z: 3 }], floor: -7, ceiling: -3, shape: 'box', wall: 0.2 }];
  const model = buildSiteFromSpec(s);
  expect(model.collider.groundAt(0, 0, -2)).toBe(-7);
  expect(model.collider.hit(new Vec3(0, -3, 0))).toBe(false);
  expect(model.collider.hit(new Vec3(2, -3, 0))).toBe(true);
  model.group.updateMatrixWorld(true);
  const ray = new THREE.Raycaster(new THREE.Vector3(0, -2, 0), new THREE.Vector3(0, -1, 0));
  const first = ray.intersectObject(model.group, true).find(h => h.object instanceof THREE.Mesh && h.object.visible);
  expect(first?.point.y).toBeCloseTo(-7, 1);
});

it('reshapes an offset rotated basement without moving the building above', async () => {
  const { reshapeBasement } = await import('./basement');
  const b = building(); b.rotDeg = 90; b.pos = { x: 20, z: 10 };
  b.basement!.columns = [{ x: 2, z: 2, size: 1 }];
  const oldPos = { ...b.pos };
  expect(reshapeBasement(b, { x0: 5, x1: 8, z0: -2, z1: 2 }, 'add')).toBe(true);
  expect(b.pos).toEqual(oldPos);
  const floor = basementBuilding(b);
  expect(floor.length).toBe(13);
  expect(floor.pos.x).toBeCloseTo(20);
  expect(floor.pos.z).toBeCloseTo(11.5);
  expect(floor.levels[0]!.columns![0]!.x).toBe(2);
  const s = emptySpec(); s.extent = 60; s.buildings = [b]; s.pads = [];
  const model = buildSiteFromSpec(s);
  // The column was at local (-3, -2), hence world (22, 7); it remains there after the wing.
  expect(model.collider.hit(new Vec3(22, -2, 7))).toBe(true);
  expect(model.collider.groundAt(20, 17, -2)).toBe(-3);
});

it('undoes and imports a shaped basement without changing the upper building', async () => {
  const { reshapeBasement } = await import('./basement');
  const { SiteEditor } = await import('./site-editor');
  const spec = emptySpec(); const b = building(); b.basement!.doors = { n: [{ kind: 'door', c: 2, w: 1, h: 2 }] }; spec.buildings = [b];
  const ed = new SiteEditor(); ed.load(spec);
  ed.commitSite(s => { expect(reshapeBasement(s.buildings[0]!, { x0: 5, x1: 8, z0: -2, z1: 2 }, 'add')).toBe(true); });
  const saved = sanitizeSpec(JSON.parse(JSON.stringify(ed.draft())))!;
  expect(saved.buildings[0]!.basement!.outline!.length).toBeGreaterThan(4);
  expect(saved.buildings[0]!.length).toBe(10);
  expect(basementBuilding(saved.buildings[0]!).levels[0]!.wallOpenings).toHaveLength(1);
  ed.undo(); expect(ed.draft().buildings[0]!.basement!.outline).toBeUndefined();
  ed.redo(); expect(ed.draft().buildings[0]!.basement!.outline!.length).toBeGreaterThan(4);
});
