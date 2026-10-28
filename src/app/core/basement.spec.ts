import { describe, expect, it } from 'vitest';
import { basementBuilding, insertBasementVertex, moveBasementVertex, removeBasementVertex, reshapeBasement, setBasementPerimeterWall } from './basement';
import { addOpening, listOpenings, moveOpening } from './openings';
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
  it('resolves the coplanar wall and terrain at the basement perimeter, including merged scenes', () => {
    const s = emptySpec(); s.extent = 60; s.buildings = [building()]; s.pads = [];
    for (const merge of [false, true]) {
      const model = buildSiteFromSpec(s, { merge });
      model.group.updateMatrixWorld(true);
      // Outside the basement outline but over the outer half of its wall: the wall top and terrain meet at y=0.
      const ray = new THREE.Raycaster(new THREE.Vector3(1, 0.02, -4.1), new THREE.Vector3(0, -1, 0), 0, 0.04);
      const hits = ray.intersectObject(model.group, true);
      const wall = hits.find(hit => {
        const material = (hit.object as THREE.Mesh).material as THREE.MeshStandardMaterial;
        return material?.polygonOffset && material.polygonOffsetFactor === -1 && material.polygonOffsetUnits === -2;
      });
      expect(wall).toBeDefined();
      expect(hits.some(hit => (hit.object as THREE.Mesh).material instanceof THREE.MeshStandardMaterial && ((hit.object as THREE.Mesh).material as THREE.MeshStandardMaterial).vertexColors)).toBe(true);
      expect(model.collider.hit(new Vec3(1, -2, -4))).toBe(true);
    }
  });
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
  it('keeps edited outline coordinates within the save/import limit without changing the draft on rejection', async () => {
    const { SiteEditor } = await import('./site-editor');
    const s = emptySpec(); s.buildings = [building()];
    const ed = new SiteEditor(); ed.load(s);
    const before = structuredClone(ed.draft().buildings[0]!);
    expect(moveBasementVertex(ed.draft().buildings[0]!, 1, { x: 301, z: -4 })).toBe(false);
    expect(ed.draft().buildings[0]).toEqual(before);
    ed.commitSite(d => { expect(moveBasementVertex(d.buildings[0]!, 1, { x: 300, z: -4 })).toBe(true); });
    expect(sanitizeSpec(JSON.parse(JSON.stringify(ed.draft())))!.buildings[0]!.basement!.outline).toEqual(ed.draft().buildings[0]!.basement!.outline);
    ed.undo(); expect(ed.draft().buildings[0]!.basement!.outline).toBeUndefined();
    ed.redo(); expect(ed.draft().buildings[0]!.basement!.outline![1]!.x).toBe(300);
  });
  it('rejects a vertex move that would put a floor item outside the saved coordinate range', () => {
    const b = building();
    b.basement = { height: 3, outline: [{x:-299,z:-4},{x:1,z:-4},{x:1,z:4},{x:-299,z:4}], columns: [{x:300,z:4,size:0.4}] };
    const before = structuredClone(b);
    // The vertex itself remains within ±300, but the shifted column would become 301.
    expect(moveBasementVertex(b, 0, {x:-300,z:-4})).toBe(false);
    expect(b).toEqual(before);
  });
  it('rejects an out-of-range wing without changing the basement', () => {
    const b = building(), before = structuredClone(b);
    expect(reshapeBasement(b, { x0: 5, x1: 301, z0: -4, z1: 4 }, 'add')).toBe(false);
    expect(b).toEqual(before);
  });
  it('renders and collides with diagonal partitions in basement and upper floors at both rotations', () => {
    for (const rotDeg of [0, 37]) for (const basement of [false, true]) {
      const b = building(); b.rotDeg = rotDeg;
      b.levels[0]!.sides = { n:false, s:false, e:false, w:false };
      b.basement!.sides = { n:false, s:false, e:false, w:false };
      const partition: [{x:number;z:number},{x:number;z:number}] = [{x:1,z:1},{x:8,z:6}];
      if (basement) b.basement!.partitions = [partition]; else b.levels[0]!.partitions = [partition];
      const s = emptySpec(); s.extent = 30; s.buildings = [b]; s.pads = [];
      const model = buildSiteFromSpec(s);
      const angle = rotDeg * Math.PI / 180;
      const world = (x:number,z:number) => ({x: x * Math.cos(angle) - z * Math.sin(angle), z: x * Math.sin(angle) + z * Math.cos(angle)});
      const on = world(-3, -2.285714), off = world(-3, 0.5), y = basement ? -2 : 2;
      expect(model.collider.hit(new Vec3(on.x, y, on.z))).toBe(true);
      expect(model.collider.hit(new Vec3(off.x, y, off.z))).toBe(false);
      model.group.updateMatrixWorld(true);
      const dx = 7 / Math.hypot(7, 5), dz = 5 / Math.hypot(7, 5), normal = world(-dz, dx);
      const ray = new THREE.Raycaster(new THREE.Vector3(on.x + normal.x, y, on.z + normal.z), new THREE.Vector3(-normal.x, 0, -normal.z), 0, 2);
      expect(ray.intersectObject(model.group, true).length).toBeGreaterThan(0);
    }
  });
  it('moves a basement vertex without moving floor objects and preserves undo and saved diagonal outlines', async () => {
    const { SiteEditor } = await import('./site-editor');
    const b = building();
    b.basement = { height: 3, columns: [{ x: 5, z: 4, size: 0.4 }], doors: { n: [{ kind: 'door', c: 5, w: 1, h: 2 }] } };
    const s = emptySpec(); s.buildings = [b];
    const ed = new SiteEditor(); ed.load(s);
    ed.commitSite(d => { expect(moveBasementVertex(d.buildings[0]!, 1, { x: 4, z: -3 })).toBe(true); });
    const changed = ed.draft().buildings[0]!;
    const floor = basementBuilding(changed);
    expect(floor.footprint).toBeDefined();
    expect(listOpenings(floor, 0)).toHaveLength(1);
    expect(changed.basement!.columns![0]!.x).toBe(5);
    expect(sanitizeSpec(JSON.parse(JSON.stringify(ed.draft())))!.buildings[0]!.basement!.outline).toEqual(changed.basement!.outline);
    ed.undo();
    expect(ed.draft().buildings[0]!.basement!.outline).toBeUndefined();
    ed.redo();
    expect(ed.draft().buildings[0]!.basement!.outline).toEqual(changed.basement!.outline);
    const invalid = structuredClone(changed);
    expect(moveBasementVertex(invalid, 1, { x: -6, z: 5 })).toBe(false);
    expect(invalid).toEqual(changed);
  });
  it('adds a wing to a diagonal basement while keeping floor items and rejects a cut through a door', async () => {
    const { SiteEditor } = await import('./site-editor');
    const b = building();
    b.basement = { height: 3, outline: [{x:0,z:0},{x:8,z:0},{x:8,z:4},{x:4,z:8},{x:0,z:8}],
      wallOpenings: [{kind:'door',x:4,z:0,w:1,h:2}], columns: [{x:2,z:2,size:0.4}] };
    const s = emptySpec(); s.extent = 20; s.buildings = [b]; s.pads = [];
    const ed = new SiteEditor(); ed.load(s);
    ed.commitSite(d => expect(reshapeBasement(d.buildings[0]!, {x0:1,z0:1,x1:5,z1:3}, 'add')).toBe(true));
    const changed = ed.draft().buildings[0]!;
    expect(changed.basement!.columns![0]).toMatchObject({x:2,z:2});
    expect(listOpenings(basementBuilding(changed), 0)).toHaveLength(1);
    expect(sanitizeSpec(JSON.parse(JSON.stringify(ed.draft())))!.buildings[0]!.basement!.outline).toEqual(changed.basement!.outline);
    const before = structuredClone(changed);
    // This notch would remove the existing door; the operation must leave all data untouched.
    expect(reshapeBasement(changed, {x0:-2,z0:-5,x1:0,z1:1}, 'cut')).toBe(false);
    expect(changed).toEqual(before);
    const model = buildSiteFromSpec(ed.draft());
    expect(model.collider.groundAt(2, 2, -2)).toBeCloseTo(-3);
    ed.undo(); expect(ed.draft().buildings[0]!.basement!.outline).toEqual(b.basement!.outline);
    ed.redo(); expect(ed.draft().buildings[0]!.basement!.outline).toEqual(before.basement!.outline);
  });
  it('places and slides an opening along a diagonal wall', () => {
    const b = building();
    b.basement = { height: 3, outline: [{ x: -5, z: -4 }, { x: 5, z: -4 }, { x: 5, z: 0 }, { x: 0, z: 4 }, { x: -5, z: 4 }] };
    const mini = basementBuilding(b);
    const id = addOpening(mini, 0, { x: 2.5, z: 2 }, 'door', 1)!;
    const opening = listOpenings(mini, 0).find(o => o.id === id)!;
    expect(opening.vector).toBeDefined();
    moveOpening(mini, 0, id, opening.c + 0.5);
    const moved = mini.levels[0]!.wallOpenings![0]!;
    expect((moved.x - 5) * 4 + moved.z * 5).toBeCloseTo(0, 5);
  });
  it('inserts a vertex without cutting a door in half', () => {
    const b = building();
    b.basement = { height: 3, doors: { n: [{ kind: 'door', c: 5, w: 2, h: 2 }] } };
    const unchanged = structuredClone(b);
    expect(insertBasementVertex(b, 0)).toBe(false);
    expect(b).toEqual(unchanged);
    expect(insertBasementVertex(b, 1)).toBe(true);
    expect(b.basement!.outline).toHaveLength(5);
    expect(listOpenings(basementBuilding(b), 0)).toHaveLength(1);
    const inserted = b.basement!.outline![2]!;
    expect(moveBasementVertex(b, 2, { x: inserted.x + 1, z: inserted.z })).toBe(true);
    expect(removeBasementVertex(b, 2)).toBe(true);
    expect(b.basement!.outline).toHaveLength(4);
    expect(listOpenings(basementBuilding(b), 0)).toHaveLength(1);
    const saved = structuredClone(b);
    expect(removeBasementVertex(b, 0)).toBe(false); // the adjacent north wall contains the door
    expect(b).toEqual(saved);
  });
  it('renders and collides against a diagonal basement wall with a door, including a floor void', () => {
    const b = building();
    b.basement = {
      height: 3,
      outline: [{ x: -5, z: -4 }, { x: 5, z: -4 }, { x: 5, z: 0 }, { x: 0, z: 4 }, { x: -5, z: 4 }],
      wallOpenings: [{ kind: 'door', x: 2.5, z: 2, w: 1.5, h: 2.2 }],
      voids: [{ x0: 3, z0: 2, x1: 5, z1: 4 }],
    };
    const s = emptySpec(); s.extent = 60; s.buildings = [b]; s.pads = [];
    const model = buildSiteFromSpec(s);
    expect(model.collider.hit(new Vec3(2.5, -2, 2))).toBe(false);
    expect(model.collider.hit(new Vec3(4.2, -2, 0.64))).toBe(true);
    expect(model.collider.groundAt(-4, 0, -2)).toBe(-3);
    expect(model.collider.groundAt(4, 3, -2)).toBe(0);
    model.group.updateMatrixWorld(true);
    const groundRay = (x: number, z: number) => new THREE.Raycaster(new THREE.Vector3(x, -2, z), new THREE.Vector3(0, -1, 0), 0, 2).intersectObject(model.group, true);
    expect(groundRay(-4, 0).length).toBeGreaterThan(0);
    expect(groundRay(-1, -1)).toHaveLength(0);
    expect(groundRay(4, 3)).toHaveLength(0);
  });
  it('keeps diagonal walls and floor aligned in a rotated building and isolated 3D floor', async () => {
    const { indoorViewSpec } = await import('../three/indoor-view');
    const b = building(); b.rotDeg = 30;
    b.basement = { height: 3, outline: [{ x: -5, z: -4 }, { x: 5, z: -4 }, { x: 5, z: 0 }, { x: 0, z: 4 }, { x: -5, z: 4 }] };
    const s = emptySpec(); s.extent = 60; s.buildings = [b]; s.pads = [];
    const at = (x: number, z: number) => ({ x: x * Math.cos(Math.PI / 6) - z * Math.sin(Math.PI / 6), z: x * Math.sin(Math.PI / 6) + z * Math.cos(Math.PI / 6) });
    const wall = at(2.5, 2), floor = at(-4, 0);
    for (const spec of [s, indoorViewSpec(s, { id: b.id, li: -1 })]) {
      const model = buildSiteFromSpec(spec);
      expect(model.collider.hit(new Vec3(wall.x, -2, wall.z))).toBe(true);
      model.group.updateMatrixWorld(true);
      const ray = new THREE.Raycaster(new THREE.Vector3(floor.x, -2, floor.z), new THREE.Vector3(0, -1, 0), 0, 2);
      expect(ray.intersectObject(model.group, true).length).toBeGreaterThan(0);
    }
  });
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

it('casts a shadow from the ground-floor slab but leaves the opening uncovered', () => {
  const b = building(); b.levels[0]!.voids = [{ x0: 4, z0: 3, x1: 6, z1: 5 }];
  const s = emptySpec(); s.extent = 60; s.buildings = [b]; s.pads = [];
  const model = buildSiteFromSpec(s, { merge: true });
  model.group.updateMatrixWorld(true);
  const shadowAt = (x: number, z: number): boolean => {
    const ray = new THREE.Raycaster(new THREE.Vector3(x, 1, z), new THREE.Vector3(0, -1, 0));
    return ray.intersectObject(model.group, true).some(h => h.object instanceof THREE.Mesh && h.object.visible && h.object.castShadow && Math.abs(h.point.y - 0.1) < 0.01);
  };
  expect(shadowAt(3, 0)).toBe(true);
  expect(shadowAt(0, 0)).toBe(false);
});

it('cuts only the overlap when a basement opening crosses the lower room boundary', () => {
  const b = building(); b.basement = { height: 3, voids: [{ x0: 4, z0: 3, x1: 8, z1: 5 }] };
  const s = emptySpec(); s.extent = 60; s.buildings = [b]; s.pads = [];
  s.underground = [{ id: 'lower', name: 'Lower', outline: [{ x: -3, z: -3 }, { x: 2, z: -3 }, { x: 2, z: 3 }, { x: -3, z: 3 }], floor: -7, ceiling: -3, shape: 'box', wall: 0.2 }];
  const model = buildSiteFromSpec(s); model.group.updateMatrixWorld(true);
  expect(model.collider.groundAt(0.5, 0, -2)).toBe(-7);
  expect(model.collider.groundAt(2.5, 0, -2)).toBeCloseTo(-3.3);
  expect(model.collider.hit(new Vec3(0.5, -3, 0))).toBe(false);
  expect(model.collider.hit(new Vec3(-2, -3, 0))).toBe(true);
  const ray = new THREE.Raycaster(new THREE.Vector3(0.5, -2, 0), new THREE.Vector3(0, -1, 0));
  const first = ray.intersectObject(model.group, true).find(h => h.object instanceof THREE.Mesh && h.object.visible);
  expect(first?.point.y).toBeCloseTo(-7, 1);
});

for (const shape of ['pipe', 'vault'] as const) it(`opens a basement floor into a curved ${shape} tunnel`, () => {
  const b = building(); b.basement = { height: 3, voids: [{ x0: 4, z0: 3, x1: 6, z1: 5 }] };
  const s = emptySpec(); s.extent = 60; s.buildings = [b]; s.pads = [];
  s.underground = [{ id: 'lower', name: 'Lower', outline: [{ x: -8, z: -3 }, { x: 8, z: -3 }, { x: 8, z: 3 }, { x: -8, z: 3 }], floor: -7, ceiling: -3, shape, wall: 0.2 }];
  const model = buildSiteFromSpec(s); model.group.updateMatrixWorld(true);
  expect(model.collider.groundAt(0, 0, -2)).toBe(-7);
  expect(model.collider.hit(new Vec3(0, -3, 0))).toBe(false);
  expect(model.collider.hit(new Vec3(3, -3, 0))).toBe(true);
  const ray = new THREE.Raycaster(new THREE.Vector3(0, -2, 0), new THREE.Vector3(0, -1, 0));
  const first = ray.intersectObject(model.group, true).find(h => h.object instanceof THREE.Mesh && h.object.visible);
  expect(first?.point.y).toBeCloseTo(-7, 1);
});


describe('basement perimeter wall identity', () => {
  it('preserves wall flags through indoor floor tools and rejects a mismatched saved edge mask', async () => {
    const {editBasementFloor,saveBasementFloor}=await import('./basement');
    const b=building();expect(setBasementPerimeterWall(b,1,false)).toBe(true);
    editBasementFloor(b,floor=>{floor.levels[0]!.columns=[{x:5,z:4,size:0.4}];});
    expect(b.basement!.wallEdges).toEqual([true,false,true,true]);
    expect(b.basement!.columns).toHaveLength(1);
    const before=structuredClone(b), floor=basementBuilding(b);
    floor.levels[0]!.wallEdges=[false];
    expect(saveBasementFloor(b,floor)).toBe(false);expect(b).toEqual(before);
  });
  it('toggles an explicit edge while retaining openings for when the wall is enabled again', () => {
    const b=building(); b.basement={height:3,doors:{n:[{kind:'door',c:3,w:1,h:2}]}};
    expect(setBasementPerimeterWall(b,0,false)).toBe(true);
    expect(b.basement!.wallEdges).toEqual([false,true,true,true]);
    expect(listOpenings(basementBuilding(b),0)).toHaveLength(1);
    expect(setBasementPerimeterWall(b,0,true)).toBe(true);
    expect(b.basement!.wallEdges).toEqual([true,true,true,true]);
    expect(listOpenings(basementBuilding(b),0)).toHaveLength(1);
    const before=structuredClone(b);
    expect(setBasementPerimeterWall(b,9,false)).toBe(false); expect(b).toEqual(before);
  });
  it('maps legacy side flags correctly with clockwise winding', () => {
    const b=building();b.basement={height:3,sides:{e:false},outline:[{x:-5,z:-4},{x:-5,z:4},{x:5,z:4},{x:5,z:-4}]};
    expect(moveBasementVertex(b,3,{x:6,z:-4})).toBe(true);
    expect(b.basement!.wallEdges).toEqual([true,true,false,true]);
  });
  it('keeps a disabled east wall open after a diagonal vertex edit, save/import and undo', async () => {
    const {SiteEditor} = await import('./site-editor');
    const {indoorViewSpec} = await import('../three/indoor-view');
    const b = building(); b.basement = {height:3, sides:{e:false}, doors:{n:[{kind:'door',c:3,w:1,h:2}]}};
    const s=emptySpec(); s.extent=30; s.buildings=[b]; s.pads=[];
    const ed=new SiteEditor(); ed.load(s);
    ed.commitSite(d=>expect(moveBasementVertex(d.buildings[0]!,1,{x:6,z:-4})).toBe(true));
    const changed=ed.draft().buildings[0]!;
    expect(changed.basement!.wallEdges).toEqual([true,false,true,true]);
    expect(listOpenings(basementBuilding(changed),0)).toHaveLength(1);
    const saved=sanitizeSpec(JSON.parse(JSON.stringify(ed.draft())))!;
    expect(saved.buildings[0]!.basement!.wallEdges).toEqual([true,false,true,true]);
    for(const spec of [saved,indoorViewSpec(saved,{id:'b',li:-1})]) {
      const model=buildSiteFromSpec(spec);
      expect(model.collider.hit(new Vec3(5.5,-1.5,0))).toBe(false);
      expect(model.collider.hit(new Vec3(0,-1.5,-4))).toBe(true);
      model.group.updateMatrixWorld(true);
      const ray=new THREE.Raycaster(new THREE.Vector3(0,-1.5,0),new THREE.Vector3(1,0,0),0,7);
      expect(ray.intersectObject(model.group,true)).toHaveLength(0);
    }
    const mini=basementBuilding(changed);
    expect(addOpening(mini,0,{x:5.5,z:0},'door',0.5)).toBeNull();
    ed.undo();expect(ed.draft().buildings[0]!.basement!.sides).toEqual({e:false});
    ed.redo();expect(ed.draft().buildings[0]!.basement!.wallEdges).toEqual([true,false,true,true]);
  });
  it('inherits wall visibility on split and refuses to merge open and closed edges', () => {
    const b=building(); b.basement={height:3,sides:{e:false}};
    expect(insertBasementVertex(b,1)).toBe(true);
    expect(b.basement!.wallEdges).toEqual([true,false,false,true,true]);
    expect(moveBasementVertex(b,2,{x:6,z:0})).toBe(true);
    expect(removeBasementVertex(b,2)).toBe(true);
    expect(b.basement!.wallEdges).toEqual([true,false,true,true]);
    const before=structuredClone(b);
    expect(removeBasementVertex(b,1)).toBe(false);
    expect(b).toEqual(before);
  });
});

describe('Cut/Wing with open basement perimeter edges', () => {
  it.each([[false,0],[true,0],[false,37],[true,37]] as const)('preserves open spans through cut/add, save and undo (reversed=%s, rotation=%s)', async (reversed, rotation) => {
    const {SiteEditor} = await import('./site-editor');
    for (const op of ['cut','add'] as const) {
      const b=building(); b.rotDeg=rotation;
      b.basement={height:3,sides:{e:false},doors:{n:[{kind:'door',c:5,w:1,h:2}]}};
      if (reversed) b.basement.outline=[{x:-5,z:-4},{x:-5,z:4},{x:5,z:4},{x:5,z:-4}];
      const s=emptySpec();s.extent=30;s.buildings=[b];s.pads=[];
      const editor=new SiteEditor();editor.load(s);
      const rect=op==='cut'?{x0:2,x1:6,z0:-1,z1:1}:{x0:3,x1:8,z0:-2,z1:2};
      editor.commitSite(d=>expect(reshapeBasement(d.buildings[0]!,rect,op)).toBe(true));
      const saved=sanitizeSpec(JSON.parse(JSON.stringify(editor.draft())))!;
      const edited=saved.buildings[0]!;
      expect(edited.levels).toEqual(b.levels);
      expect(listOpenings(basementBuilding(edited),0)).toHaveLength(1);
      expect(edited.basement!.wallEdges).toContain(false);
      expect(edited.basement!.wallEdges).toHaveLength(edited.basement!.outline!.length);
      const angle=rotation*Math.PI/180;
      const world=(x:number,z:number)=>new Vec3(x*Math.cos(angle)-z*Math.sin(angle),-1.5,x*Math.sin(angle)+z*Math.cos(angle));
      const model=buildSiteFromSpec(saved);
      expect(model.collider.hit(world(5,-3))).toBe(false);
      expect(model.collider.hit(world(5,3))).toBe(false);
      const newX=op==='cut'?2:8;
      expect(model.collider.hit(world(newX,0))).toBe(true);
      model.group.updateMatrixWorld(true);
      const normal=new THREE.Vector3(Math.cos(angle),0,Math.sin(angle));
      const point=world(newX-1,0);
      const ray=new THREE.Raycaster(new THREE.Vector3(point.x,point.y,point.z),normal,0,2);
      expect(ray.intersectObject(model.group,true).length).toBeGreaterThan(0);
      const open=world(4,-3);
      const throughOpen=new THREE.Raycaster(new THREE.Vector3(open.x,open.y,open.z),normal,0,2);
      expect(throughOpen.intersectObject(model.group,true)).toHaveLength(0);
      editor.undo();expect(editor.draft().buildings[0]!.basement).toEqual(b.basement);
      editor.redo();expect(editor.draft().buildings[0]!.basement!.outline).toEqual(edited.basement!.outline);
    }
  });

  it.each(['cut','add'] as const)('keeps diagonal open wall fragments after %s', op => {
    const b=building();b.basement={height:3,outline:[{x:-6,z:-4},{x:6,z:-4},{x:5,z:4},{x:-5,z:4}],wallEdges:[true,false,true,true]};
    const rect=op==='cut'?{x0:2,x1:7,z0:-1,z1:1}:{x0:3,x1:8,z0:-2,z1:2};
    expect(reshapeBasement(b,rect,op)).toBe(true);
    const spec=emptySpec();spec.extent=30;spec.buildings=[b];spec.pads=[];
    const saved=sanitizeSpec(JSON.parse(JSON.stringify(spec)))!;
    const model=buildSiteFromSpec(saved);
    expect(model.collider.hit(new Vec3(5.875,-1.5,-3))).toBe(false);
    expect(model.collider.hit(new Vec3(5.125,-1.5,3))).toBe(false);
    expect(model.collider.hit(new Vec3(op==='cut'?2:8,-1.5,0))).toBe(true);
  });

  it('retains collinear wall-state transitions which polygon simplification would otherwise merge', () => {
    const b=building();b.basement={height:3,outline:[{x:-5,z:-4},{x:0,z:-4},{x:5,z:-4},{x:5,z:4},{x:-5,z:4}],wallEdges:[false,true,true,true,true],columns:[{x:1,z:1,size:.5}]};
    expect(reshapeBasement(b,{x0:-8,x1:-3,z0:-2,z1:2},'add')).toBe(true);
    expect(b.basement.columns).toEqual([{x:4,z:1,size:.5}]);
    const outline=b.basement.outline!,walls=b.basement.wallEdges!;
    const transition=outline.findIndex(p=>p.x===0&&p.z===-4);
    expect(transition).toBeGreaterThanOrEqual(0);
    expect(walls[transition]).not.toBe(walls[(transition+walls.length-1)%walls.length]);
    const s=emptySpec();s.extent=30;s.buildings=[b];s.pads=[];
    const model=buildSiteFromSpec(s);
    expect(model.collider.hit(new Vec3(-2.5,-1.5,-4))).toBe(false);
    expect(model.collider.hit(new Vec3(2.5,-1.5,-4))).toBe(true);
  });

  it('rejects loss of openings/items or disconnected output atomically even when a perimeter is open', () => {
    for(const item of ['door','column','island'] as const){
      const b=building();b.basement={height:3,sides:{e:false}};
      if(item==='door')b.basement.doors={n:[{kind:'door',c:5,w:2,h:2}]};
      if(item==='column')b.basement.columns=[{x:5,z:1,size:.5}];
      const before=structuredClone(b);
      const rect=item==='island'?{x0:-1,x1:1,z0:-5,z1:5}:{x0:-2,x1:2,z0:-5,z1:0};
      expect(reshapeBasement(b,rect,'cut')).toBe(false);
      expect(b).toEqual(before);
    }
  });
});
