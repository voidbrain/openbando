import { describe, expect, it } from 'vitest';
import {
  gateFromTrack,
  lapTimes,
  parseRacePack,
  racePose,
  raceFrameKey,
  type RaceTrack,
  type RacePoint,
} from './race';
const point = (x: number, z: number, t: number): RacePoint => ({ x, y: 2, z, t });
const track = (): RaceTrack => ({
  id: 'p1',
  name: 'Pilot',
  color: '#38bdf8',
  points: [point(0, 0, 0), point(10, 0, 2)],
  offset: 0,
  visible: true,
  closed: false,
  live: false,
});
const pack = () => ({
  format: 'openbando-race',
  version: 1,
  frame: 'race-test:1000',
  gate: null,
  tracks: [track()],
});
describe('race coordinates and replay', () => {
  it('uses elapsed time plus pilot delay, hides outside the flight, and never mutates its points', () => {
    const t = track();
    t.offset = 3;
    expect(racePose(t, 2)).toBeNull();
    expect(racePose(t, 4)?.x).toBe(5);
    expect(racePose(t, 6)).toBeNull();
    t.live = true;
    expect(racePose(t, 0)?.x).toBe(10);
    t.visible = false;
    expect(racePose(t, 0)).toBeNull();
    expect(t.points[0]!.x).toBe(0);
  });
  it('does not fly a ghost across a missing GPS interval', () => {
    const t = track();
    t.points[1]!.t = 10;
    expect(racePose(t, 4)).toBeNull();
  });
  it('round-trips local metres only and rejects malformed packages atomically', () => {
    expect(parseRacePack(JSON.parse(JSON.stringify(pack()))).tracks[0]!.points).toEqual(
      track().points,
    );
    const extra = { ...pack(), lat: 45, tracks: [{ ...track(), gps: 'private' }] };
    expect(JSON.stringify(parseRacePack(extra))).not.toContain('gps');
    expect(JSON.stringify(parseRacePack(extra))).not.toContain('lat');
    for (const bad of [
      null,
      {},
      { ...pack(), version: 2 },
      { ...pack(), tracks: [track(), track()] },
      { ...pack(), tracks: [{ ...track(), points: [point(0, 0, 0), point(0, 0, 0)] }] },
      { ...pack(), tracks: [{ ...track(), points: [point(0, 0, 0), point(Infinity, 0, 2)] }] },
    ])
      expect(() => parseRacePack(bad)).toThrow();
  });
  it('matches exported copies despite renamed ids, but notices changed geometry', () => {
    const a = {
      extent: 100,
      droneStart: { x: 0, z: 0 },
      buildings: [{ id: 'a', name: 'A', length: 12, color: '#fff' }],
    };
    const b = { ...a, buildings: [{ id: 'new', name: 'Copy', length: 12, color: '#000' }] };
    expect(raceFrameKey(a)).toBe(raceFrameKey(b));
    expect(raceFrameKey({ ...a, extent: 101 })).not.toBe(raceFrameKey(a));
  });
});
describe('closed-loop lap timing', () => {
  const ps = [
    point(0, 0, 0),
    point(10, 0, 2),
    point(10, 10, 4),
    point(-10, 10, 6),
    point(-10, 0, 8),
    point(10, 0, 10),
    point(10, 10, 12),
    point(-10, 10, 14),
    point(-10, 0, 16),
    point(10, 0, 18),
  ];
  it('counts forward gate crossings with interpolated times and a shared finite gate', () => {
    const g = gateFromTrack(ps)!;
    const laps = lapTimes(ps, g);
    expect(laps.map((l) => l.seconds)).toEqual([9, 8]);
    expect(lapTimes(ps, { ...g, z: 50 })).toEqual([]);
    expect(lapTimes(ps, { ...g, y: 50 })).toEqual([]);
  });
  it('rejects jitter, backwards crossing, short loops and gaps', () => {
    const g = gateFromTrack(ps)!;
    expect(
      lapTimes([point(-0.5, 0, 0), point(0.5, 0, 1), point(-0.5, 0, 2), point(0.5, 0, 3)], g),
    ).toEqual([]);
    expect(lapTimes(ps, { ...g, nx: -g.nx, nz: -g.nz, minSeconds: 100 })).toEqual([]);
    expect(lapTimes(ps, { ...g, minDistance: 1000 })).toEqual([]);
    const gap = ps.map((p) => ({ ...p }));
    gap[1]!.t = 6;
    expect(lapTimes(gap.slice(0, 5), g)).toEqual([]);
  });
});
