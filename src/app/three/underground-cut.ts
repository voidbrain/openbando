import * as THREE from 'three';
import type { UndergroundSpec } from '../core/site-spec';
import { tunnelAxis, tunnelSection } from '../core/underground';

type Plane = readonly [number, number, number, number];

function prisms(v: UndergroundSpec, lift: number): Plane[][] {
  const axis = tunnelAxis(v),
    section = tunnelSection(v);
  if (axis && section) {
    const dx = axis.b.x - axis.a.x,
      dz = axis.b.z - axis.a.z,
      len = Math.hypot(dx, dz);
    const ux = dx / len,
      uz = dz / len,
      nx = -uz,
      nz = ux;
    const p: Plane[] = [
      [-ux, 0, -uz, ux * axis.a.x + uz * axis.a.z],
      [ux, 0, uz, -ux * axis.b.x - uz * axis.b.z],
    ];
    for (let i = 0; i < section.length; i++) {
      const a = section[i]!,
        b = section[(i + 1) % section.length]!;
      const ex = b.x - a.x,
        ey = b.y - a.y;
      // CCW polygon: interior lies left of each edge.
      p.push([
        ey * nx,
        -ex,
        ey * nz,
        -ey * (nx * axis.a.x + nz * axis.a.z + a.x) + ex * (a.y + lift),
      ]);
    }
    return [p];
  }
  // Triangulate arbitrary (including concave) room footprints into convex prisms; courtyards are holes (ground kept).
  const contour = v.outline.map((q) => new THREE.Vector2(q.x, q.z));
  const holes = (v.holes ?? []).map((h) => h.map((q) => new THREE.Vector2(q.x, q.z)));
  const pts = [...contour, ...holes.flat()];
  return THREE.ShapeUtils.triangulateShape(contour, holes).map((ids) => {
    const tri = ids.map((i) => pts[i]!);
    if (THREE.ShapeUtils.isClockWise(tri)) tri.reverse();
    const p: Plane[] = [
      [0, -1, 0, v.floor + lift],
      [0, 1, 0, -v.ceiling - lift],
    ];
    for (let i = 0; i < 3; i++) {
      const a = tri[i]!,
        b = tri[(i + 1) % 3]!,
        dx = b.x - a.x,
        dz = b.y - a.y;
      p.push([dz, 0, -dx, -dz * a.x + dx * a.y]);
    }
    return p;
  });
}

/** Subtract actual 3D interiors from surface triangles. Keeps the terrain right up to the lining,
 * including rotated portals and basement corners; interpolates colour/UV at new vertices. */
export function cutUnderground(
  geo: THREE.BufferGeometry,
  volumes: readonly UndergroundSpec[],
  lift = 0,
): THREE.BufferGeometry {
  if (!volumes.length) return geo;
  const attrs = Object.entries(geo.attributes).filter(([name]) => name !== 'normal');
  const sizes = attrs.map(([, a]) => a.itemSize);
  const posOffset = attrs
    .slice(
      0,
      attrs.findIndex(([n]) => n === 'position'),
    )
    .reduce((n, [, a]) => n + a.itemSize, 0);
  const source = (i: number): number[] =>
    attrs.flatMap(([, a]) =>
      Array.from({ length: a.itemSize }, (_, j) => a.array[i * a.itemSize + j]!),
    );
  let polygons: number[][][] = [];
  const count = geo.index?.count ?? geo.getAttribute('position').count;
  for (let i = 0; i < count; i += 3)
    polygons.push([0, 1, 2].map((j) => source(geo.index ? geo.index.getX(i + j) : i + j)));
  for (const v of volumes)
    for (const planes of prisms(v, lift)) {
      const result: number[][][] = [];
      for (const original of polygons) {
        // A separating plane proves there is no intersection; leave the entire triangle unchanged.
        if (
          planes.some((p) =>
            original.every(
              (q) =>
                p[0] * q[posOffset]! + p[1] * q[posOffset + 1]! + p[2] * q[posOffset + 2]! + p[3] >
                1e-7,
            ),
          )
        ) {
          result.push(original);
          continue;
        }
        let inside = original;
        for (const p of planes) {
          if (!inside.length) break;
          const keep: number[][] = [],
            outside: number[][] = [];
          const distance = (q: number[]) =>
            p[0] * q[posOffset]! + p[1] * q[posOffset + 1]! + p[2] * q[posOffset + 2]! + p[3];
          for (let i = 0; i < inside.length; i++) {
            const a = inside[i]!,
              b = inside[(i + 1) % inside.length]!,
              da = distance(a),
              db = distance(b);
            if (da <= 1e-7) keep.push(a);
            if (da >= -1e-7) outside.push(a);
            if ((da < -1e-7 && db > 1e-7) || (da > 1e-7 && db < -1e-7)) {
              const t = da / (da - db),
                q = a.map((x, k) => x + (b[k]! - x) * t);
              keep.push(q);
              outside.push(q);
            }
          }
          // A polygon entirely on this plane belongs to the interior; duplicating it as
          // an outside fragment leaves terrain across a basement ceiling.
          if (outside.length >= 3 && inside.some(q => distance(q) > 1e-7)) result.push(outside);
          inside = keep;
        }
      }
      polygons = result;
    }
  const data: number[][] = attrs.map(() => []);
  for (const poly of polygons)
    for (let i = 1; i < poly.length - 1; i++)
      for (const q of [poly[0]!, poly[i]!, poly[i + 1]!]) {
        let offset = 0;
        for (let j = 0; j < attrs.length; j++) {
          data[j]!.push(...q.slice(offset, offset + sizes[j]!));
          offset += sizes[j]!;
        }
      }
  const out = new THREE.BufferGeometry();
  attrs.forEach(([name], i) =>
    out.setAttribute(name, new THREE.Float32BufferAttribute(data[i]!, sizes[i]!)),
  );
  out.computeVertexNormals();
  geo.dispose();
  return out;
}
