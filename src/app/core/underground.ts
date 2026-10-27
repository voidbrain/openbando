/**
 * Underground volumes (tunnels, culverts, bunkers): the one rule is that the terrain is cut wherever it passes through
 * the inside of a volume, between its floor and its ceiling. Pure: where the ground is cut, where the floor is under a
 * point, and the collision boxes of the walls and slabs.
 */
import { insidePolygon } from './layers';
import type { BuildingSpec, UndergroundSpec, Vec2 } from './site-spec';
import { heightAt, type HeightGrid } from './terrain';
import type { SolidBox } from './sim/collider';

/** The outline of a straight tunnel from `a` to `b`, `width` metres wide: [a-left, b-left, b-right, a-right]. */
export function tunnelOutline(a: Vec2, b: Vec2, width: number): Vec2[] {
  const dx = b.x - a.x, dz = b.z - a.z, len = Math.hypot(dx, dz) || 1;
  const nx = (-dz / len) * (width / 2), nz = (dx / len) * (width / 2);
  return [
    { x: a.x + nx, z: a.z + nz },
    { x: b.x + nx, z: b.z + nz },
    { x: b.x - nx, z: b.z - nz },
    { x: a.x - nx, z: a.z - nz },
  ];
}

/** Distance from a point to a segment, in metres. */
function distToSegment(x: number, z: number, a: Vec2, b: Vec2): number {
  const dx = b.x - a.x, dz = b.z - a.z, l2 = dx * dx + dz * dz;
  const t = l2 ? Math.max(0, Math.min(1, ((x - a.x) * dx + (z - a.z) * dz) / l2)) : 0;
  return Math.hypot(x - (a.x + t * dx), z - (a.z + t * dz));
}

/** The volume's footprint at a vertex: inside the outline, or within half a cell of it — vertices on the border count. */
function coversVertex(v: UndergroundSpec, x: number, z: number, cell: number): boolean {
  if (insidePolygon(v.outline, x, z)) return true;
  const n = v.outline.length;
  for (let i = 0; i < n; i++) if (distToSegment(x, z, v.outline[i]!, v.outline[(i + 1) % n]!) <= cell / 2) return true;
  return false;
}

/**
 * One flag per grid vertex: 1 = the ground there is cut (a portal or an open trench).
 *
 * The opening is an *aligned block*, not a ragged diagonal. First the band where the surface genuinely passes
 * through the inside: vertices on the volume's footprint (inside the outline, or within half a cell of it — the
 * tube always covers its own border vertices) whose height lies between floor and ceiling. On a slope that band
 * runs diagonally, and dropping every mesh cell that touches one flagged vertex tore the hillside open far around
 * the tunnel: looking through the hole you saw the trough of the cut and the void where the hill should have
 * carried on. So each contiguous stretch of the band is snapped to its bounding box in the grid, kept within the
 * footprint: every cell touching a flagged vertex then lies inside the block too, the staircase fills into straight
 * aligned portals flush with the tube, and the hole never bleeds past it. A ridge high enough over the tunnel
 * crosses nothing and stays whole; basements (boxes with ceiling = pad) get one tidy rectangular opening instead of
 * scattered cut cells.
 */
export function cutMask(g: HeightGrid, vols: readonly UndergroundSpec[]): Uint8Array {
  const m = new Uint8Array(g.nx * g.nz);
  if (!vols.length) return m;
  const px = (i: number): number => g.x0 + i * g.cell, pz = (j: number): number => g.z0 + j * g.cell;
  for (const v of vols) {
    const xs = v.outline.map((p) => p.x), zs = v.outline.map((p) => p.z);
    const i0 = Math.max(0, Math.floor((Math.min(...xs) - g.x0) / g.cell)), i1 = Math.min(g.nx - 1, Math.ceil((Math.max(...xs) - g.x0) / g.cell));
    const j0 = Math.max(0, Math.floor((Math.min(...zs) - g.z0) / g.cell)), j1 = Math.min(g.nz - 1, Math.ceil((Math.max(...zs) - g.z0) / g.cell));
    // the band the surface crosses: on the footprint, the ground between floor and ceiling
    const band = new Uint8Array(g.nx * g.nz);
    let any = false;
    for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) {
      const h = g.h[j * g.nx + i]!;
      // Include the ceiling: a basement pad sits exactly there and must not seal its floor opening.
      if (h <= v.floor || h > v.ceiling) continue;
      if (!coversVertex(v, px(i), pz(j), g.cell)) continue;
      band[j * g.nx + i] = 1;
      any = true;
    }
    if (!any) continue; // nothing crosses the inside: the ridge stands over the tunnel, uncut
    // snap every 4-connected stretch of the band to its bounding box, clipped to the footprint: aligned quads
    const seen = new Uint8Array(g.nx * g.nz);
    const stack: number[] = [];
    for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) {
      const s = j * g.nx + i;
      if (!band[s] || seen[s]) continue;
      let bi0 = i, bj0 = j, bi1 = i, bj1 = j;
      seen[s] = 1;
      stack.push(s);
      while (stack.length) {
        const k = stack.pop()!;
        const ki = k % g.nx, kj = (k - ki) / g.nx;
        bi0 = Math.min(bi0, ki); bi1 = Math.max(bi1, ki);
        bj0 = Math.min(bj0, kj); bj1 = Math.max(bj1, kj);
        for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]] as const) {
          const ni = ki + di, nj = kj + dj;
          if (ni < i0 || ni > i1 || nj < j0 || nj > j1) continue;
          const nk = nj * g.nx + ni;
          if (band[nk] && !seen[nk]) { seen[nk] = 1; stack.push(nk); }
        }
      }
      for (let j2 = bj0; j2 <= bj1; j2++) for (let i2 = bi0; i2 <= bi1; i2++) {
        if (coversVertex(v, px(i2), pz(j2), g.cell)) m[j2 * g.nx + i2] = 1;
      }
    }
  }
  return m;
}

/**
 * The floor a point stands on: inside a volume and below its ceiling, that volume's floor (a tunnel under a hill);
 * otherwise null (the terrain decides).
 */
export function floorUnder(vols: readonly UndergroundSpec[], x: number, z: number, y: number): number | null {
  const inside = vols.filter(v => insidePolygon(v.outline, x, z));
  const current = inside.filter(v => y < v.ceiling && y > v.floor - v.wall - 0.5).sort((a, b) => b.floor - a.floor)[0];
  if (!current) return null;
  if (!current.floorHoles?.some(hole => insidePolygon(hole, x, z))) return current.floor + (current.water ?? 0);
  // A hole exposes a connected lower volume if there is one. Otherwise the undisturbed soil directly below the
  // slab is still solid: a floor opening must not manufacture an infinitely deep underground chamber.
  const lower = inside.filter(v => v !== current && v.floor < current.floor && Math.abs(v.ceiling - current.floor) < 0.1 && v.ceilingHoles?.some(hole => insidePolygon(hole, x, z)))
    .sort((a, b) => b.floor - a.floor)[0];
  return lower ? lower.floor + (lower.water ?? 0) : current.floor - current.wall;

}

/** Link a basement opening to a lower box room only when the whole opening fits within that room. */
export function linkBasementFloors(vols: readonly UndergroundSpec[]): UndergroundSpec[] {
  const out = vols.map(v => ({ ...v, ceilingHoles: undefined as Vec2[][] | undefined }));
  for (const top of out) for (const hole of top.floorHoles ?? []) {
    for (const lower of out) {
      if (lower === top || lower.shape !== 'box' || lower.floor >= top.floor || Math.abs(lower.ceiling - top.floor) >= 0.1) continue;
      if (!hole.every(p => insidePolygon(lower.outline, p.x, p.z))) continue;
      (lower.ceilingHoles ??= []).push(hole);
    }
  }
  return out;
}

/** Collision boxes of a volume: its walls along every edge, cut into ~1 m pieces, and floor / ceiling slabs in ~2 m tiles. */
export function volumeSolids(v: UndergroundSpec): SolidBox[] {
  const out: SolidBox[] = [];
  const axis=tunnelAxis(v), section=tunnelSection(v);
  if(axis && section) {
    const dx=axis.b.x-axis.a.x,dz=axis.b.z-axis.a.z,len=Math.hypot(dx,dz), nx=-dz/len,nz=dx/len;
    const count=Math.max(1,Math.ceil(len)), t=v.wall;
    for(let i=0;i<section.length;i++) {
      const a=section[i]!,b=section[(i+1)%section.length]!;
      for(let j=0;j<count;j++) {
        const pts=[j/count,(j+1)/count].flatMap(u=>[a,b].map(p=>({x:axis.a.x+dx*u+nx*p.x,z:axis.a.z+dz*u+nz*p.x})));
        out.push([Math.min(...pts.map(p=>p.x))-t/2,Math.max(...pts.map(p=>p.x))+t/2,Math.min(a.y,b.y)-t/2,Math.max(a.y,b.y)+t/2,Math.min(...pts.map(p=>p.z))-t/2,Math.max(...pts.map(p=>p.z))+t/2,false]);
      }
    }
    return out;
  }
  const t = v.wall, y0 = v.floor - t, y1 = v.ceiling + t;
  for (let i = 0; i < v.outline.length; i++) {
    const a = v.outline[i]!, b = v.outline[(i + 1) % v.outline.length]!;
    const dx = b.x - a.x, dz = b.z - a.z, len = Math.hypot(dx, dz);
    if (len < 0.05) continue;
    const n = Math.max(1, Math.ceil(len));
    const ca = Math.abs(dx / len), sa = Math.abs(dz / len), seg = len / n;
    const hw = (seg * ca + t * sa) / 2, hd = (seg * sa + t * ca) / 2;
    for (let k = 0; k < n; k++) {
      const cx = a.x + (dx * (k + 0.5)) / n, cz = a.z + (dz * (k + 0.5)) / n;
      out.push([cx - hw, cx + hw, y0, y1, cz - hd, cz + hd, false]);
    }
  }
  const xs = v.outline.map((p) => p.x), zs = v.outline.map((p) => p.z);
  const x0 = Math.min(...xs), x1 = Math.max(...xs), z0 = Math.min(...zs), z1 = Math.max(...zs);
  for (let x = x0; x < x1; x += 2) {
    for (let z = z0; z < z1; z += 2) {
      if (!insidePolygon(v.outline, x + 1, z + 1)) continue;
      out.push([x, Math.min(x + 2, x1), v.floor - t, v.floor, z, Math.min(z + 2, z1), false]);
      out.push([x, Math.min(x + 2, x1), v.ceiling, v.ceiling + t, z, Math.min(z + 2, z1), false]);
    }
  }
  return out;
}

/** A tunnel's axis (for drawing pipes and vaults): from the middle of its first end to the middle of the other, and its width. */
export function tunnelAxis(v: UndergroundSpec): { a: Vec2; b: Vec2; width: number } | null {
  if (v.outline.length !== 4) return null;
  const [p0, p1, p2, p3] = v.outline as [Vec2, Vec2, Vec2, Vec2];
  const mid = (p: Vec2, q: Vec2): Vec2 => ({ x: (p.x + q.x) / 2, z: (p.z + q.z) / 2 });
  const d01 = Math.hypot(p1.x - p0.x, p1.z - p0.z), d03 = Math.hypot(p3.x - p0.x, p3.z - p0.z);
  // the axis runs along the longer side (a tunnel is longer than wide; a room drawn either way)
  return d01 >= d03 ? { a: mid(p0, p3), b: mid(p1, p2), width: d03 } : { a: mid(p0, p1), b: mid(p3, p2), width: d01 };
}

/** Convex tunnel cross-section, in width/height metres. Used by lining and terrain clipping. */
export function tunnelSection(v: UndergroundSpec): {x:number;y:number}[] | null {
  const a = tunnelAxis(v);
  if (!a || v.shape === 'box') return null;
  const r = a.width / 2, h = v.ceiling - v.floor;
  if (v.shape === 'pipe') return Array.from({ length: 32 }, (_, i) => {
    const t = i * 2 * Math.PI / 32;
    return ({x:r * Math.cos(t), y:v.floor + h / 2 + h / 2 * Math.sin(t)});
  });
  const rise = Math.min(r, h), spring = v.ceiling - rise;
  return [({x:-r,y:v.floor}), ({x:r,y:v.floor}),
    ...Array.from({ length: 17 }, (_, i) => { const t = i * Math.PI / 16; return ({x:r * Math.cos(t), y:spring + rise * Math.sin(t)}); })];
}


/** A new tunnel `depth` metres below the ground at its start, `height` metres tall inside. */
export function newTunnel(g: HeightGrid | null, a: Vec2, b: Vec2, o: { width: number; height: number; depth: number; shape: UndergroundSpec['shape']; id: string; name: string }): UndergroundSpec {
  const floor = Math.round((heightAt(g, a.x, a.z) - o.depth) * 10) / 10;
  return { id: o.id, name: o.name, outline: tunnelOutline(a, b, o.width), floor, ceiling: floor + o.height, shape: o.shape, wall: 0.4 };
}

/** Wall and slab thickness of basements. */
export const BASEMENT_WALL = 0.3;

/**
 * A building's basement as an underground volume under its outline (`outline` in site metres, `ground` = the height of
 * its levelled pad): the terrain inside is cut, the drone inside stands on the basement floor. Null without a basement.
 */
export function basementVolume(b: BuildingSpec, outline: Vec2[], ground: number): UndergroundSpec | null {
  if (!b.basement || b.frame) return null;
  const h = Math.min(12, Math.max(2, b.basement.height));
  const local = b.basement.outline ?? (b.footprint ?? [
    { x: -b.length / 2, z: -b.width / 2 }, { x: b.length / 2, z: -b.width / 2 },
    { x: b.length / 2, z: b.width / 2 }, { x: -b.length / 2, z: b.width / 2 },
  ]);
  const x0 = Math.min(...local.map(p => p.x)), z0 = Math.min(...local.map(p => p.z));
  const a = b.rotDeg * Math.PI / 180, c = Math.cos(a), s = Math.sin(a);
  const world = (x: number, z: number): Vec2 => ({ x: b.pos.x + x * c - z * s, z: b.pos.z + x * s + z * c });
  const floorHoles = b.basement.voids?.map(v => [world(x0 + v.x0, z0 + v.z0), world(x0 + v.x1, z0 + v.z0), world(x0 + v.x1, z0 + v.z1), world(x0 + v.x0, z0 + v.z1)]);
  return { id: `basement-${b.id}`, name: `${b.name} basement`, outline, floor: ground - h, ceiling: ground, shape: 'box', wall: BASEMENT_WALL, ...(floorHoles?.length ? { floorHoles } : {}) };
}

/**
 * The side view along a volume: its axis (a straight tunnel's centre line, else the long middle line of its outline),
 * the ground height every few metres along it, and its floor / ceiling. For the inspector's section drawing.
 */
export function sectionProfile(v: UndergroundSpec, at: (x: number, z: number) => number, samples = 60): { len: number; ground: number[]; floor: number; ceiling: number; wall: number } {
  let a: Vec2, b: Vec2;
  const ax = tunnelAxis(v);
  if (ax) ({ a, b } = ax);
  else {
    const xs = v.outline.map((p) => p.x), zs = v.outline.map((p) => p.z);
    const x0 = Math.min(...xs), x1 = Math.max(...xs), z0 = Math.min(...zs), z1 = Math.max(...zs);
    if (x1 - x0 >= z1 - z0) [a, b] = [{ x: x0, z: (z0 + z1) / 2 }, { x: x1, z: (z0 + z1) / 2 }];
    else [a, b] = [{ x: (x0 + x1) / 2, z: z0 }, { x: (x0 + x1) / 2, z: z1 }];
  }
  const len = Math.hypot(b.x - a.x, b.z - a.z);
  // a little ground either side of the ends, so the mouths show
  const pad = Math.min(15, len * 0.2), ux = (b.x - a.x) / (len || 1), uz = (b.z - a.z) / (len || 1);
  const ground: number[] = [];
  for (let i = 0; i <= samples; i++) {
    const t = -pad + ((len + 2 * pad) * i) / samples;
    ground.push(at(a.x + ux * t, a.z + uz * t));
  }
  return { len: len + 2 * pad, ground, floor: v.floor, ceiling: v.ceiling, wall: v.wall };
}

/** A room (bunker, basement) over the rectangle a–b, its ceiling `depth` under the lower ground corner. */
export function newRoom(a: Vec2, b: Vec2, at: (x: number, z: number) => number, o: { height: number; depth: number; id: string; name: string }): UndergroundSpec {
  const floor = Math.round((Math.min(at(a.x, a.z), at(b.x, b.z)) - o.depth - o.height) * 10) / 10;
  return { id: o.id, name: o.name, outline: [a, { x: b.x, z: a.z }, b, { x: a.x, z: b.z }], floor, ceiling: floor + o.height, shape: 'box', wall: 0.4 };
}

/**
 * The inspector's side view of a volume, scaled into a `W` × `H` drawing (4 px margin left, 8 px on top): the ground line
 * and its fill as SVG paths, the inside as a box from `x0` to `x1` between `ceil` and `floor`, and the heights shown.
 */
export function sectionDrawing(v: UndergroundSpec, at: (x: number, z: number) => number, W = 252, H = 80): { ground: string; groundFill: string; x0: number; x1: number; ceil: number; floor: number; top: number; bottom: number; len: number } {
  const p = sectionProfile(v, at, 64);
  const top = Math.max(...p.ground, p.ceiling + p.wall) + 1, bottom = Math.min(...p.ground, p.floor - p.wall) - 1;
  const sx = W / p.len, sy = H / Math.max(1, top - bottom);
  const X = (t: number): number => 4 + t * sx, Y = (h: number): number => 8 + (top - h) * sy;
  const pts = p.ground.map((h, i) => `${X((p.len * i) / (p.ground.length - 1)).toFixed(1)},${Y(h).toFixed(1)}`);
  const ax = tunnelAxis(v);
  const pad = (p.len - (ax ? Math.hypot(ax.b.x - ax.a.x, ax.b.z - ax.a.z) : p.len)) / 2;
  return {
    ground: 'M' + pts.join('L'),
    groundFill: 'M' + pts.join('L') + `L${X(p.len)},${8 + H}L${X(0)},${8 + H}Z`,
    x0: X(Math.max(0, pad)), x1: X(p.len - Math.max(0, pad)), ceil: Y(p.ceiling), floor: Y(p.floor), top, bottom, len: p.len,
  };
}

/** The grid cells where the ground is cut (the openings of underground volumes), as one SVG path; '' when nothing is cut. */
export function cutCellsPath(g: HeightGrid | null, cut: Uint8Array | null): string {
  if (!g || !cut) return '';
  const out: string[] = [];
  const c = g.cell;
  for (let k = 0; k < cut.length; k++) {
    if (!cut[k]) continue;
    const i = k % g.nx, j = (k - i) / g.nx;
    out.push(`M${g.x0 + i * c - c / 2} ${g.z0 + j * c - c / 2}h${c}v${c}h${-c}Z`);
  }
  return out.join('');
}
