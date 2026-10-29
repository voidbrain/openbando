import * as THREE from 'three';
import { Vec3 } from '../core/math3d';
import { emptySpec, type BuildingSpec, type SiteSpec } from '../core/site-spec';
import { siteGround } from '../core/site-ground';
import { floorUnder } from '../core/underground';
import { buildSiteFromSpec } from './site-model';

/** A 10 × 8 building turned 90° (local x → site z, local z → site −x), a 3 m basement with a 2 m courtyard in the middle. */
function site(): SiteSpec {
  const s = emptySpec({ lat: 0, lon: 0 });
  s.extent = 60; s.pads = [];
  const b: BuildingSpec = {
    id: 'b', name: 'B', pos: { x: 0, z: 0 }, rotDeg: 90, length: 10, width: 8,
    levels: [{ baseY: 0, height: 4, sides: { n: true, s: true, e: true, w: true }, doors: {}, partitions: [], roof: 'flat', roofRise: 0 }],
    basement: { height: 3, courtyards: [{ outline: [{ x: 2, z: -1 }, { x: 4, z: -1 }, { x: 4, z: 1 }, { x: 2, z: 1 }] }] },
  };
  s.buildings = [b];
  return s;
}
// the courtyard's centre (3, 0) local is (0, 3) in the site; a basement point beside it, (−3, 0) local, is (0, −3)
const YARD = { x: 0, z: 3 }, ROOM = { x: 0, z: -3 };

describe('basement courtyards (geometry)', () => {
  it('the basement volume carries the courtyard in site coordinates, and the drone has no basement floor there', () => {
    const g = siteGround(site());
    const v = g.vols.find(item => item.id === 'basement-b')!;
    expect(v.holes).toHaveLength(1);
    const xs = v.holes![0]!.map(p => Math.round(p.x * 100) / 100), zs = v.holes![0]!.map(p => Math.round(p.z * 100) / 100);
    expect([Math.min(...xs), Math.max(...xs), Math.min(...zs), Math.max(...zs)]).toEqual([-1, 1, 2, 4]);
    const floor = floorUnder(g.vols, ROOM.x, ROOM.z, -1);
    expect(floor).toBeCloseTo(v.floor, 3);
    expect(floorUnder(g.vols, YARD.x, YARD.z, -1)).toBeNull();
  });

  it('keeps the ground in the courtyard and cuts it in the room', () => {
    const g = siteGround(site());
    const grid = g.grid!;
    const at = (x: number, z: number): number => g.cut![Math.round((z - grid.z0) / grid.cell) * grid.nx + Math.round((x - grid.x0) / grid.cell)]!;
    expect(at(ROOM.x, ROOM.z)).toBe(1);
    expect(at(YARD.x, YARD.z)).toBe(0);
  });

  it('builds no basement floor across the courtyard and walls with colliders around it', () => {
    const model = buildSiteFromSpec(site());
    model.group.updateMatrixWorld(true);
    const floorY = siteGround(site()).vols.find(item => item.id === 'basement-b')!.floor;
    const down = (p: { x: number; z: number }) => new THREE.Raycaster(new THREE.Vector3(p.x, floorY + 1, p.z), new THREE.Vector3(0, -1, 0), 0, 1.5)
      .intersectObject(model.group, true).filter(hit => Math.abs(hit.point.y - (floorY + 0.1)) < 0.3);
    expect(down(ROOM).length).toBeGreaterThan(0);
    expect(down(YARD)).toHaveLength(0);
    // the courtyard's walls stand on its edges (local x = 2 and 4 → site z = 2 and 4), the drone collides with them
    expect(model.collider.hit(new Vec3(0, floorY + 1, 2))).toBe(true);
    expect(model.collider.hit(new Vec3(0, floorY + 1, 4))).toBe(true);
    expect(model.collider.hit(new Vec3(0, floorY + 1, -3))).toBe(false); // the open room
  });
});
