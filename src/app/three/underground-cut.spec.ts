import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { cutUnderground } from './underground-cut';
import { tunnelOutline, tunnelSection } from '../core/underground';
import type { UndergroundSpec } from '../core/site-spec';
const volume = (shape: UndergroundSpec['shape'] = 'box'): UndergroundSpec => ({
  id: 'u',
  name: 'U',
  outline: tunnelOutline({ x: -4, z: 0 }, { x: 4, z: 0 }, 3),
  floor: -2,
  ceiling: 2,
  wall: 0.3,
  shape,
});
function area(g: THREE.BufferGeometry): number {
  const p = g.getAttribute('position');
  let sum = 0;
  for (let i = 0; i < p.count; i += 3) {
    const a = new THREE.Vector3().fromBufferAttribute(p, i),
      b = new THREE.Vector3().fromBufferAttribute(p, i + 1),
      c = new THREE.Vector3().fromBufferAttribute(p, i + 2);
    sum += b.sub(a).cross(c.sub(a)).length() / 2;
  }
  return sum;
}
describe('exact underground cuts', () => {
  it('removes only the actual footprint, leaving no grid-cell moat around a basement', () => {
    const g = new THREE.PlaneGeometry(20, 20).rotateX(-Math.PI / 2);
    const out = cutUnderground(g, [volume()]);
    expect(area(out)).toBeCloseTo(400 - 8 * 3, 4);
    expect(out.getAttribute('uv').count).toBe(out.getAttribute('position').count);
  });
  it('preserves the hill crest and cuts a road at the same opening with its decal offset', () => {
    expect(
      area(
        cutUnderground(new THREE.PlaneGeometry(20, 20).rotateX(-Math.PI / 2).translate(0, 3, 0), [
          volume(),
        ]),
      ),
    ).toBeCloseTo(400);
    expect(
      area(
        cutUnderground(
          new THREE.PlaneGeometry(20, 20).rotateX(-Math.PI / 2).translate(0, 0.06, 0),
          [volume()],
          0.06,
        ),
      ),
    ).toBeCloseTo(376, 4);
  });
  it('removes coplanar terrain at a basement ceiling without retaining green triangles', () => {
    const v = volume();
    v.ceiling = 0;
    const out = cutUnderground(new THREE.PlaneGeometry(20, 20).rotateX(-Math.PI / 2), [v]);
    expect(area(out)).toBeCloseTo(376, 4);
    const mesh = new THREE.Mesh(out, new THREE.MeshBasicMaterial({ side: THREE.DoubleSide }));
    const ray = new THREE.Raycaster(new THREE.Vector3(0, 10, 0), new THREE.Vector3(0, -1, 0));
    expect(ray.intersectObject(mesh)).toHaveLength(0);
  });
  it('clips rotated mouths by their real shape and preserves terrain outside them', () => {
    const v = volume();
    v.outline = tunnelOutline({ x: -3, z: -3 }, { x: 3, z: 3 }, 3);
    const out = cutUnderground(new THREE.PlaneGeometry(20, 20).rotateX(-Math.PI / 2), [v]);
    expect(area(out)).toBeCloseTo(400 - Math.hypot(6, 6) * 3, 4);
  });
  it('uses a full upright vault with its crown at the specified ceiling', () => {
    const v = volume('vault');
    const pts = tunnelSection(v)!;
    expect(Math.max(...pts.map((p) => p.y))).toBeCloseTo(v.ceiling);
    expect(Math.min(...pts.map((p) => p.y))).toBe(v.floor);
    expect(Math.max(...pts.map((p) => p.x)) - Math.min(...pts.map((p) => p.x))).toBeCloseTo(3);
  });
});
