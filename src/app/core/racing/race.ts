/** Shared race coordinates are local metres, never latitude/longitude. No Angular or transport code here. */
export const PILOT_COLORS = [
  '#38bdf8',
  '#fb923c',
  '#a78bfa',
  '#4ade80',
  '#f472b6',
  '#facc15',
  '#f87171',
  '#2dd4bf',
] as const;
export const MAX_PILOTS = 8;
export const MAX_POINTS = 12000;
export interface RacePoint {
  x: number;
  y: number;
  z: number;
  t: number;
}
export interface RaceTrack {
  id: string;
  name: string;
  color: string;
  points: RacePoint[];
  offset: number;
  visible: boolean;
  closed: boolean;
  live: boolean;
}
export interface Gate {
  x: number;
  y: number;
  z: number;
  nx: number;
  nz: number;
  width: number;
  height: number;
  minSeconds: number;
  minDistance: number;
}
export interface Lap {
  start: number;
  end: number;
  seconds: number;
}
export interface RacePack {
  format: 'openbando-race';
  version: 1;
  frame: string;
  gate: Gate | null;
  tracks: RaceTrack[];
}
const obj = (v: unknown): Record<string, unknown> | null =>
  v !== null && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, unknown>) : null;
const num = (v: unknown, min: number, max: number): v is number =>
  typeof v === 'number' && Number.isFinite(v) && v >= min && v <= max;
export function parseGate(raw: unknown): Gate | null {
  const g = obj(raw);
  if (
    !g ||
    !['x', 'y', 'z'].every((k) => num(g[k], -20000, 20000)) ||
    !num(g['nx'], -1, 1) ||
    !num(g['nz'], -1, 1) ||
    Math.abs(Math.hypot(g['nx'], g['nz']) - 1) > 0.01 ||
    !num(g['width'], 1, 100) ||
    !num(g['height'], 1, 100) ||
    !num(g['minSeconds'], 1, 600) ||
    !num(g['minDistance'], 5, 10000)
  )
    return null;
  return {
    x: g['x'] as number,
    y: g['y'] as number,
    z: g['z'] as number,
    nx: g['nx'],
    nz: g['nz'],
    width: g['width'],
    height: g['height'],
    minSeconds: g['minSeconds'],
    minDistance: g['minDistance'],
  };
}
/** Reject malformed/oversized packages atomically; return only known fields. */
export function parseRacePack(raw: unknown): RacePack {
  const o = obj(raw);
  if (
    !o ||
    o['format'] !== 'openbando-race' ||
    o['version'] !== 1 ||
    typeof o['frame'] !== 'string' ||
    !/^race-[a-z0-9:-]{1,80}$/.test(o['frame']) ||
    !Array.isArray(o['tracks']) ||
    o['tracks'].length > MAX_PILOTS
  )
    throw new Error('Invalid race package');
  const ids = new Set<string>();
  const tracks: RaceTrack[] = o['tracks'].map((value: unknown) => {
    const r = obj(value);
    if (
      !r ||
      typeof r['id'] !== 'string' ||
      !/^[a-zA-Z0-9:_-]{1,100}$/.test(r['id']) ||
      ids.has(r['id']) ||
      typeof r['name'] !== 'string' ||
      !r['name'].trim() ||
      r['name'].length > 80 ||
      typeof r['color'] !== 'string' ||
      !/^#[0-9a-f]{6}$/i.test(r['color']) ||
      !num(r['offset'], -86400, 86400) ||
      !Array.isArray(r['points']) ||
      r['points'].length < 2 ||
      r['points'].length > MAX_POINTS
    )
      throw new Error('Invalid race track');
    ids.add(r['id']);
    let previous = -1;
    const points: RacePoint[] = r['points'].map((value: unknown) => {
      const p = obj(value);
      if (
        !p ||
        !['x', 'y', 'z'].every((k) => num(p[k], -20000, 20000)) ||
        !num(p['t'], 0, 86400) ||
        p['t'] <= previous
      )
        throw new Error('Race points must be finite and strictly time ordered');
      previous = p['t'];
      return { x: p['x'] as number, y: p['y'] as number, z: p['z'] as number, t: p['t'] };
    });
    return {
      id: r['id'],
      name: r['name'].trim(),
      color: r['color'],
      points,
      offset: r['offset'],
      visible: r['visible'] !== false,
      closed: r['closed'] === true,
      live: r['live'] === true,
    };
  });
  const gate = o['gate'] == null ? null : parseGate(o['gate']);
  if (o['gate'] != null && !gate) throw new Error('Invalid race gate');
  return { format: 'openbando-race', version: 1, frame: o['frame'], gate, tracks };
}
export function gateFromTrack(points: readonly RacePoint[]): Gate | null {
  const a = points[0];
  if (!a) return null;
  const b = points.find((p) => Math.hypot(p.x - a.x, p.z - a.z) > 3);
  if (!b) return null;
  const d = Math.hypot(b.x - a.x, b.z - a.z);
  return {
    x: a.x,
    y: a.y + 5,
    z: a.z,
    nx: (b.x - a.x) / d,
    nz: (b.z - a.z) / d,
    width: 12,
    height: 10,
    minSeconds: 5,
    minDistance: 30,
  };
}
/** Forward plane crossing, finite gate rectangle, rearm distance, time and distance guards. GPS gaps reset a lap. */
export function lapTimes(points: readonly RacePoint[], gate: Gate): Lap[] {
  if (points.length < 2) return [];
  const signed = (p: RacePoint) => (p.x - gate.x) * gate.nx + (p.z - gate.z) * gate.nz;
  const first = points[0]!;
  const inside = (p: RacePoint) =>
    Math.abs((p.x - gate.x) * -gate.nz + (p.z - gate.z) * gate.nx) <= gate.width / 2 &&
    Math.abs(p.y - gate.y) <= gate.height / 2;
  let start: number | null = Math.abs(signed(first)) < 2 && inside(first) ? first.t : null;
  let distance = 0,
    armed = false;
  const laps: Lap[] = [];
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1]!,
      b = points[i]!,
      dt = b.t - a.t,
      dist = Math.hypot(b.x - a.x, b.y - a.y, b.z - a.z);
    if (dt <= 0 || dt > 5 || dist / dt > 150) {
      start = null;
      distance = 0;
      armed = false;
      continue;
    }
    distance += dist;
    const sa = signed(a),
      sb = signed(b);
    if (sa < -2) armed = true;
    if (!armed || sa > 0 || sb <= 0) continue;
    const u = -sa / (sb - sa),
      hit = {
        x: a.x + (b.x - a.x) * u,
        y: a.y + (b.y - a.y) * u,
        z: a.z + (b.z - a.z) * u,
        t: a.t + dt * u,
      };
    if (!inside(hit)) continue;
    armed = false;
    if (start !== null && hit.t - start >= gate.minSeconds && distance >= gate.minDistance)
      laps.push({ start, end: hit.t, seconds: hit.t - start });
    if (start === null || (hit.t - start >= gate.minSeconds && distance >= gate.minDistance)) {
      start = hit.t;
      distance = dist * (1 - u);
    }
  }
  return laps;
}
/** Linear interpolation with no extrapolation: a ghost is hidden before its start and after its finish. */
export function racePose(
  track: RaceTrack,
  raceTime: number,
): { x: number; y: number; z: number; heading: number } | null {
  const ps = track.points;
  if (ps.length < 2 || !track.visible) return null;
  const t = track.live ? ps.at(-1)!.t : raceTime - track.offset + ps[0]!.t;
  if (t < ps[0]!.t || t > ps.at(-1)!.t) return null;
  let lo = 0,
    hi = ps.length - 1;
  while (lo + 1 < hi) {
    const mid = (lo + hi) >> 1;
    if (ps[mid]!.t <= t) lo = mid;
    else hi = mid;
  }
  const a = ps[lo]!,
    b = ps[hi]!,
    u = (t - a.t) / (b.t - a.t);
  if (b.t - a.t > 5) return null;
  return {
    x: a.x + (b.x - a.x) * u,
    y: a.y + (b.y - a.y) * u,
    z: a.z + (b.z - a.z) * u,
    heading: Math.atan2(-(b.x - a.x), -(b.z - a.z)),
  };
}
/** Geometry tag for accidental frame mismatches, not an authentication or secrecy mechanism. */
export function raceFrameKey(spec: {
  buildings: unknown;
  structures?: unknown;
  extent: number;
  droneStart: unknown;
  terrain?: unknown;
  roads?: unknown;
  surfaces?: unknown;
  waters?: unknown;
  walls?: unknown;
  trees?: unknown;
}): string {
  const text = JSON.stringify(
    [
      spec.extent,
      spec.droneStart,
      spec.buildings,
      spec.structures,
      spec.terrain,
      spec.roads,
      spec.surfaces,
      spec.waters,
      spec.walls,
      spec.trees,
    ],
    (key, value) =>
      ['id', 'name', 'block', 'color', 'floorColor', 'roofColor', 'nameFromMap'].includes(key)
        ? undefined
        : value,
  );
  let hash = 2166136261;
  for (let i = 0; i < text.length; i++) hash = Math.imul(hash ^ text.charCodeAt(i), 16777619);
  return `race-${(hash >>> 0).toString(36)}`;
}
