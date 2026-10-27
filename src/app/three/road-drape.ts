import * as THREE from 'three';
import { meshHeightAt, type HeightGrid } from '../core/terrain';

interface Pt { x: number; z: number }
const cross = (a: Pt, b: Pt, p: Pt): number => (b.x - a.x) * (p.z - a.z) - (b.z - a.z) * (p.x - a.x);

/** Clip a convex polygon to a triangle in the horizontal plane. */
function clip(poly: Pt[], triangle: readonly Pt[]): Pt[] {
  const sign = Math.sign(cross(triangle[0]!, triangle[1]!, triangle[2]!));
  for (let i = 0; i < 3 && poly.length; i++) {
    const a = triangle[i]!, b = triangle[(i + 1) % 3]!, next: Pt[] = [];
    for (let j = 0; j < poly.length; j++) {
      const p = poly[j]!, q = poly[(j + 1) % poly.length]!;
      const dp = sign * cross(a, b, p), dq = sign * cross(a, b, q);
      if (dp >= -1e-8) next.push(p);
      if ((dp < -1e-8 && dq > 1e-8) || (dp > 1e-8 && dq < -1e-8)) {
        const t = dp / (dp - dq);
        next.push({ x: p.x + (q.x - p.x) * t, z: p.z + (q.z - p.z) * t });
      }
    }
    poly = next;
  }
  return poly;
}

/** Divide road triangles along the rendered terrain's triangle edges, so interpolation cannot cut into slopes. */
export function drapeRoad(pos: number[], indices: number[], grid: HeightGrid | null, lift: number): THREE.BufferGeometry {
  const out: number[] = [];
  const emit = (p: Pt): void => { out.push(p.x, meshHeightAt(grid, p.x, p.z) + lift, p.z); };
  const emitPoly = (poly: Pt[]): void => {
    for (let j = 1; j + 1 < poly.length; j++) {
      if (Math.abs(cross(poly[0]!, poly[j]!, poly[j + 1]!)) < 1e-8) continue;
      emit(poly[0]!); emit(poly[j]!); emit(poly[j + 1]!);
    }
  };
  if (!grid) {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    geo.setIndex(indices);
    geo.computeVertexNormals();
    return geo;
  }
  const step = grid.nx * grid.nz > 250_000 ? 2 : 1;
  const size = grid.cell * step;
  const nx = Math.floor((grid.nx - 1) / step), nz = Math.floor((grid.nz - 1) / step);
  for (let n = 0; n < indices.length; n += 3) {
    const tri = indices.slice(n, n + 3).map(i => ({ x: pos[i * 3]!, z: pos[i * 3 + 2]! }));
    const left = Math.floor((Math.min(...tri.map(p => p.x)) - grid.x0) / size);
    const right = Math.floor((Math.max(...tri.map(p => p.x)) - grid.x0) / size);
    const top = Math.floor((Math.min(...tri.map(p => p.z)) - grid.z0) / size);
    const bottom = Math.floor((Math.max(...tri.map(p => p.z)) - grid.z0) / size);
    // Outside the terrain grid the existing skirt is not triangulated on this grid; retain the original road there.
    if (left < 0 || top < 0 || right >= nx || bottom >= nz) { emitPoly(tri); continue; }
    for (let z = top; z <= bottom; z++) for (let x = left; x <= right; x++) {
      const x0 = grid.x0 + x * size, z0 = grid.z0 + z * size;
      const a = { x: x0, z: z0 }, b = { x: x0 + size, z: z0 }, c = { x: x0, z: z0 + size }, d = { x: x0 + size, z: z0 + size };
      emitPoly(clip(tri, [a, c, b]));
      emitPoly(clip(tri, [b, c, d]));
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(out, 3));
  geo.computeVertexNormals();
  return geo;
}
