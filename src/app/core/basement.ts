import type { BuildingSpec, LevelSpec, Vec2 } from './site-spec';
import { listOpenings, outlineOf, reshapeBuilding } from './openings';
import { polygonRect } from './polygon-rect';
import { BASEMENT_COORD_LIMIT, bounds, contains, isRectilinear, rectPoly, validOutline, type Rect } from './footprint';

/** Basement dimensions are independent of the floors above, in the same centred building frame. */
export function basementOutline(b: BuildingSpec): Vec2[] {
  return b.basement?.outline ?? outlineOf(b);
}
/** Convert legacy rectilinear compass-side flags without guessing which diagonal edge they meant. */
function perimeterWalls(b: BuildingSpec): boolean[] | null {
  const basement = b.basement!, poly = basementOutline(b);
  if (basement.wallEdges) return basement.wallEdges.length === poly.length ? [...basement.wallEdges] : null;
  if (!Object.values(basement.sides ?? {}).includes(false)) return poly.map(() => true);
  if (!isRectilinear(poly)) return null;
  const area = poly.reduce((sum, a, i) => { const z = poly[(i + 1) % poly.length]!; return sum + a.x * z.z - z.x * a.z; }, 0);
  return poly.map((a, i) => {
    const z = poly[(i + 1) % poly.length]!, dx = z.x - a.x, dz = z.z - a.z, sign = Math.sign(area);
    const side = Math.abs(dx) > Math.abs(dz) ? (dx * sign > 0 ? 'n' : 's') : (dz * sign > 0 ? 'e' : 'w');
    return basement.sides?.[side] !== false;
  });
}

export function basementBuilding(b: BuildingSpec): BuildingSpec {
  const h = Math.min(12, Math.max(2, b.basement?.height ?? 3));
  const outline = basementOutline(b);
  const box = bounds(outline);
  const offset = { x: (box.x0 + box.x1) / 2, z: (box.z0 + box.z1) / 2 };
  const angle = b.rotDeg * Math.PI / 180, c = Math.cos(angle), s = Math.sin(angle);
  const centred = outline.map(p => ({ x: p.x - offset.x, z: p.z - offset.z }));
  const level: LevelSpec = {
    baseY: -h,
    height: h,
    sides: { n: true, s: true, e: true, w: true, ...b.basement?.sides },
    doors: structuredClone(b.basement?.doors ?? {}),
    wallEdges: b.basement?.wallEdges ? [...b.basement.wallEdges] : undefined,
    wallOpenings: b.basement?.wallOpenings?.map(o => ({ ...o, x: o.x - offset.x, z: o.z - offset.z })),
    columns: structuredClone(b.basement?.columns),
    voids: structuredClone(b.basement?.voids),
    partitions: b.basement?.partitions ?? [],
    roof: 'none',
    roofRise: 0,
  };
  const length = box.x1 - box.x0;
  const width = box.z1 - box.z0;
  const rectangular =
    centred.length === 4 &&
    centred.every(
      (p) =>
        Math.abs(Math.abs(p.x) - length / 2) < 0.001 && Math.abs(Math.abs(p.z) - width / 2) < 0.001,
    );
  return {
    ...b,
    pos: { x: b.pos.x + offset.x * c - offset.z * s, z: b.pos.z + offset.x * s + offset.z * c },
    length,
    width,
    footprint: rectangular && !b.basement?.wallOpenings?.length && !b.basement?.wallEdges ? undefined : centred,
    levels: [level],
    basement: undefined,
    fixtures: undefined,
    frame: undefined,
    ruin: 0,
    ruinWalls: undefined,
    roofless: false,
    crenels: false,
  };
}

/** Apply floor-tool edits to an isolated basement view and store them only in the basement. */
export function editBasementFloor(b: BuildingSpec, edit: (floor: BuildingSpec) => void): void {
  if (!b.basement) return;
  const floor = basementBuilding(b);
  floor.levels[0]!.partitions = structuredClone(floor.levels[0]!.partitions);
  edit(floor);
  saveBasementFloor(b, floor);
}

/** Save an edited virtual basement without moving the building above. */
export function saveBasementFloor(b: BuildingSpec, floor: BuildingSpec, saveOutline = false): boolean {
  if (!b.basement) return false;
  const a = b.rotDeg * Math.PI / 180, c = Math.cos(a), s = Math.sin(a);
  const dx = floor.pos.x - b.pos.x, dz = floor.pos.z - b.pos.z;
  const offset = { x: dx * c + dz * s, z: -dx * s + dz * c };
  const level = floor.levels[0]!;
  const next = { ...b.basement, sides: { ...level.sides }, partitions: level.partitions, doors: level.doors, wallEdges: level.wallEdges?.some(v => !v) ? [...level.wallEdges] : undefined,
    wallOpenings: level.wallOpenings?.map(o => ({ ...o, x: o.x + offset.x, z: o.z + offset.z })), columns: level.columns, voids: level.voids,
    ...(saveOutline ? { outline: (floor.footprint ?? rectPoly(floor.length, floor.width)).map(p => ({ x: p.x + offset.x, z: p.z + offset.z })) } : {}) };
  const valid = (p: Vec2): boolean => Number.isFinite(p.x) && Number.isFinite(p.z) && Math.abs(p.x) <= BASEMENT_COORD_LIMIT && Math.abs(p.z) <= BASEMENT_COORD_LIMIT;
  if ((next.outline && (!validOutline(next.outline) || !next.outline.every(valid))) || (next.wallOpenings ?? []).some(o => !valid(o)) || (next.columns ?? []).some(c => !valid(c)) || (next.partitions ?? []).some(w => w.some(p => !valid(p))) || (next.voids ?? []).some(v => !valid({ x: v.x0, z: v.z0 }) || !valid({ x: v.x1, z: v.z1 }))) return false;
  if (next.wallEdges && (next.wallEdges.length !== (next.outline ?? basementOutline(b)).length || !next.wallEdges.every(v => typeof v === 'boolean'))) return false;
  b.basement = next;
  return true;
}

/** Restore old boundary breakpoints so collinear edges with different wall states never merge. */
function reshapePerimeter(old: Vec2[], flags: boolean[], next: Vec2[]): { outline: Vec2[]; walls: boolean[] } | null {
  const onSegment = (p: Vec2, a: Vec2, b: Vec2): number | null => {
    const dx = b.x - a.x, dz = b.z - a.z, length = Math.hypot(dx, dz);
    if (length < 1e-6) return null;
    const t = ((p.x - a.x) * dx + (p.z - a.z) * dz) / (length * length);
    return t >= -1e-6 && t <= 1 + 1e-6 && Math.abs((p.x - a.x) * dz - (p.z - a.z) * dx) / length < 1e-6 ? t : null;
  };
  const outline = next.flatMap((a, i) => {
    const b = next[(i + 1) % next.length]!;
    const splits = old.map(p => ({p, t: onSegment(p, a, b)}))
      .filter((cut): cut is {p: Vec2; t: number} => cut.t !== null && cut.t > 1e-6 && cut.t < 1 - 1e-6)
      .sort((x, y) => x.t - y.t);
    return [{...a}, ...splits.map(cut => ({...cut.p}))];
  });
  if (!validOutline(outline)) return null;
  const walls = outline.map((a, i) => {
    const b = outline[(i + 1) % outline.length]!;
    const edge = old.findIndex((p, j) => {
      const q = old[(j + 1) % old.length]!;
      return onSegment(a, p, q) !== null && onSegment(b, p, q) !== null;
    });
    return edge < 0 ? true : flags[edge]!;
  });
  return {outline, walls};
}

/** Add or cut a rectangular section of the basement, leaving the upper building unchanged. */
export function reshapeBasement(b: BuildingSpec, rect: Rect, op: 'add' | 'cut'): boolean {
  if (!b.basement) return false;
  const flags = perimeterWalls(b);
  if (!flags) return false;
  if (isRectilinear(basementOutline(b)) && flags.every(Boolean)) {
    const floor = basementBuilding(b);
    floor.levels[0]!.partitions = structuredClone(floor.levels[0]!.partitions);
    if (!reshapeBuilding(floor, rect, op)) return false;
    return saveBasementFloor(b, floor, true);
  }
  // The tool rectangle is relative to the centred basement view; the saved outline is building-local.
  const old = basementOutline(b), before = bounds(old), ox = (before.x0 + before.x1) / 2, oz = (before.z0 + before.z1) / 2;
  const result = polygonRect(old, {x0: rect.x0 + ox, x1: rect.x1 + ox, z0: rect.z0 + oz, z1: rect.z1 + oz}, op);
  const perimeter = result && reshapePerimeter(old, flags, result);
  if (!perimeter) return false;
  const next = perimeter.outline;
  if (next.some(p => Math.abs(p.x) > BASEMENT_COORD_LIMIT || Math.abs(p.z) > BASEMENT_COORD_LIMIT)) return false;
  // Convert and validate openings first; never commit a shape that would discard one or an interior item.
  const copy = structuredClone(b);
  if (!moveBasementVertex(copy, 0, old[0]!)) return false;
  const after = bounds(next), dx = before.x0 - after.x0, dz = before.z0 - after.z0, basement = copy.basement!;
  basement.outline = next;
  if (perimeter.walls.some(v => !v)) basement.wallEdges = perimeter.walls;
  else delete basement.wallEdges;
  if (basement.columns) basement.columns = basement.columns.map(c => ({...c, x:c.x + dx, z:c.z + dz}));
  if (basement.partitions) basement.partitions = basement.partitions.map(w => w.map(p => ({x:p.x + dx,z:p.z + dz})) as [Vec2, Vec2]);
  if (basement.voids) basement.voids = basement.voids.map(v => ({...v,x0:v.x0 + dx,x1:v.x1 + dx,z0:v.z0 + dz,z1:v.z1 + dz}));
  if (!moveBasementVertex(copy, 0, next[0]!)) return false;
  b.basement = copy.basement;
  return true;
}

/** Move one basement vertex, preserving floor objects in building coordinates and openings on their wall. */
export function moveBasementVertex(b: BuildingSpec, index: number, point: Vec2): boolean {
  const basement = b.basement;
  if (!basement) return false;
  const wallEdges = perimeterWalls(b);
  if (!wallEdges) return false;
  const old = basementOutline(b), next = old.map((p, i) => i === index ? { ...point } : { ...p });
  const validPoint = (p: Vec2): boolean => Number.isFinite(p.x) && Number.isFinite(p.z) && Math.abs(p.x) <= BASEMENT_COORD_LIMIT && Math.abs(p.z) <= BASEMENT_COORD_LIMIT;
  if (index < 0 || index >= old.length || !validOutline(next) || !next.every(validPoint)) return false;
  const before = bounds(old), after = bounds(next);
  const dx = before.x0 - after.x0, dz = before.z0 - after.z0;
  const shifted = (p: Vec2): Vec2 => ({ x: p.x + dx, z: p.z + dz });
  if ((basement.columns ?? []).some(c => !validPoint(shifted(c))) || (basement.partitions ?? []).some(w => w.some(p => !validPoint(shifted(p)))) || (basement.voids ?? []).some(v => !validPoint(shifted({ x: v.x0, z: v.z0 })) || !validPoint(shifted({ x: v.x1, z: v.z1 })))) return false;
  const inNext = (p: Vec2): boolean => contains(next, p.x, p.z) || next.some((a, i) => {
    const z = next[(i + 1) % next.length]!, ex = z.x - a.x, ez = z.z - a.z;
    const t = Math.max(0, Math.min(1, ((p.x - a.x) * ex + (p.z - a.z) * ez) / (ex * ex + ez * ez)));
    return Math.hypot(p.x - a.x - t * ex, p.z - a.z - t * ez) < 1e-6;
  });
  const asLocal = (p: Vec2): Vec2 => ({ x: before.x0 + p.x, z: before.z0 + p.z });
  const segmentInside = (a: Vec2, b: Vec2): boolean => {
    if (!inNext(a) || !inNext(b)) return false;
    const dx = b.x - a.x, dz = b.z - a.z, cuts = [0, 1];
    for (let i = 0; i < next.length; i++) {
      const p = next[i]!, q = next[(i + 1) % next.length]!, ex = q.x - p.x, ez = q.z - p.z;
      const det = dx * ez - dz * ex;
      if (Math.abs(det) < 1e-9) continue;
      const t = ((p.x - a.x) * ez - (p.z - a.z) * ex) / det;
      const u = ((p.x - a.x) * dz - (p.z - a.z) * dx) / det;
      if (t > 0 && t < 1 && u >= 0 && u <= 1) cuts.push(t);
    }
    cuts.sort((x, y) => x - y);
    return cuts.slice(1).every((t, i) => { const mid = (cuts[i]! + t) / 2; return inNext({ x: a.x + mid * dx, z: a.z + mid * dz }); });
  };
  if ((basement.columns ?? []).some(c => !inNext(asLocal(c))) || (basement.partitions ?? []).some(w => !segmentInside(asLocal(w[0]), asLocal(w[1]))) || (basement.voids ?? []).some(v => {
    const corners = [asLocal({ x: v.x0, z: v.z0 }), asLocal({ x: v.x1, z: v.z0 }), asLocal({ x: v.x1, z: v.z1 }), asLocal({ x: v.x0, z: v.z1 })];
    return corners.some((p, i) => !segmentInside(p, corners[(i + 1) % corners.length]!));
  })) return false;
  const mini = basementBuilding(b), offsetX = (before.x0 + before.x1) / 2, offsetZ = (before.z0 + before.z1) / 2;
  const currentOpenings = listOpenings(mini, 0);
  const expectedCount = mini.footprint ? mini.levels[0]!.wallOpenings?.length ?? 0 : Object.values(mini.levels[0]!.doors).reduce((n, list) => n + (list?.length ?? 0), 0);
  if (currentOpenings.length !== expectedCount) return false;
  const openings = currentOpenings.map(o => {
    const x = (o.vector ? o.vector.a.x + o.c * o.vector.ux : o.axis === 'x' ? o.c : o.at) + offsetX;
    const z = (o.vector ? o.vector.a.z + o.c * o.vector.uz : o.axis === 'x' ? o.at : o.c) + offsetZ;
    let best = -1, bestDistance = Infinity, fraction = 0;
    for (let i = 0; i < old.length; i++) {
      const a = old[i]!, q = old[(i + 1) % old.length]!, ex = q.x - a.x, ez = q.z - a.z;
      const t = Math.max(0, Math.min(1, ((x - a.x) * ex + (z - a.z) * ez) / (ex * ex + ez * ez)));
      const d = Math.hypot(x - a.x - t * ex, z - a.z - t * ez);
      if (d < bestDistance) { best = i; bestDistance = d; fraction = t; }
    }
    if (best < 0 || bestDistance > 0.08) return null;
    const a = next[best]!, q = next[(best + 1) % next.length]!, len = Math.hypot(q.x - a.x, q.z - a.z);
    if (fraction * len < o.w / 2 || (1 - fraction) * len < o.w / 2) return null;
    return { kind: o.kind, x: a.x + fraction * (q.x - a.x), z: a.z + fraction * (q.z - a.z), w: o.w, h: o.h, sill: o.sill, closed: o.closed };
  });
  if (openings.some(o => !o || !validPoint(o))) return false;
  basement.outline = next;
  delete basement.sides;
  if (wallEdges.some(v => !v)) basement.wallEdges = wallEdges;
  else delete basement.wallEdges;
  basement.doors = {};
  basement.wallOpenings = openings.filter(o => o !== null);
  if (basement.columns) basement.columns = basement.columns.map(c => ({ ...c, x: c.x + dx, z: c.z + dz }));
  if (basement.partitions) basement.partitions = basement.partitions.map(w => w.map(p => ({ x: p.x + dx, z: p.z + dz })) as [Vec2, Vec2]);
  if (basement.voids) basement.voids = basement.voids.map(v => ({ ...v, x0: v.x0 + dx, x1: v.x1 + dx, z0: v.z0 + dz, z1: v.z1 + dz }));
  return true;
}

/** Set one explicit perimeter wall, converting old doors and compass-side flags atomically. */
export function setBasementPerimeterWall(b: BuildingSpec, edge: number, on: boolean): boolean {
  const old = basementOutline(b);
  if (!b.basement || !Number.isInteger(edge) || edge < 0 || edge >= old.length) return false;
  const copy = structuredClone(b);
  if (!moveBasementVertex(copy, 0, old[0]!)) return false;
  const walls = copy.basement!.wallEdges ?? old.map(() => true);
  walls[edge] = on;
  copy.basement!.wallEdges = walls;
  b.basement = copy.basement;
  return true;
}

/** Split an edge at its midpoint without splitting an existing opening. */
export function insertBasementVertex(b: BuildingSpec, edge: number): boolean {
  const old = basementOutline(b);
  if (!b.basement || edge < 0 || edge >= old.length || old.length >= 64) return false;
  const copy = structuredClone(b), a = old[edge]!, z = old[(edge + 1) % old.length]!;
  if (!moveBasementVertex(copy, edge, a)) return false;
  const len = Math.hypot(z.x - a.x, z.z - a.z), mid = len / 2;
  if (len < 1) return false;
  for (const o of copy.basement!.wallOpenings ?? []) {
    const x = o.x - a.x, y = o.z - a.z, along = (x * (z.x - a.x) + y * (z.z - a.z)) / len;
    const distance = Math.abs(x * (z.z - a.z) - y * (z.x - a.x)) / len;
    if (distance < 0.08 && Math.abs(along - mid) < o.w / 2 + 0.1) return false;
  }
  copy.basement!.wallEdges?.splice(edge + 1, 0, copy.basement!.wallEdges[edge]!);
  copy.basement!.outline!.splice(edge + 1, 0, { x: (a.x + z.x) / 2, z: (a.z + z.z) / 2 });
  b.basement = copy.basement;
  return true;
}

/** Remove a vertex only when the new edge does not discard adjacent openings or floor items. */
export function removeBasementVertex(b: BuildingSpec, index: number): boolean {
  const old = basementOutline(b);
  if (!b.basement || old.length <= 3 || index < 0 || index >= old.length) return false;
  const copy = structuredClone(b);
  if (!moveBasementVertex(copy, index, old[index]!)) return false;
  const onEdge = (p: Vec2, a: Vec2, z: Vec2): boolean => {
    const dx = z.x - a.x, dz = z.z - a.z, len = Math.hypot(dx, dz);
    const along = ((p.x - a.x) * dx + (p.z - a.z) * dz) / len;
    return along >= -0.08 && along <= len + 0.08 && Math.abs((p.x - a.x) * dz - (p.z - a.z) * dx) / len < 0.08;
  };
  const previous = old[(index + old.length - 1) % old.length]!, vertex = old[index]!, next = old[(index + 1) % old.length]!;
  if ((copy.basement!.wallOpenings ?? []).some(o => onEdge(o, previous, vertex) || onEdge(o, vertex, next))) return false;
  const flags = copy.basement!.wallEdges;
  if (flags && flags[(index + old.length - 1) % old.length] !== flags[index]) return false;
  const outline = old.filter((_, i) => i !== index);
  if (!validOutline(outline)) return false;
  const before = bounds(old), after = bounds(outline), dx = before.x0 - after.x0, dz = before.z0 - after.z0;
  const basement = copy.basement!;
  basement.outline = outline;
  if (flags) basement.wallEdges = flags.filter((_, i) => i !== index);
  if (basement.columns) basement.columns = basement.columns.map(c => ({ ...c, x: c.x + dx, z: c.z + dz }));
  if (basement.partitions) basement.partitions = basement.partitions.map(w => w.map(p => ({ x: p.x + dx, z: p.z + dz })) as [Vec2, Vec2]);
  if (basement.voids) basement.voids = basement.voids.map(v => ({ ...v, x0: v.x0 + dx, x1: v.x1 + dx, z0: v.z0 + dz, z1: v.z1 + dz }));
  if (!moveBasementVertex(copy, 0, outline[0]!)) return false;
  b.basement = copy.basement;
  return true;
}
