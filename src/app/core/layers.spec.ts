import { describe, expect, it } from 'vitest';
import { digWater, insertPoint, stripFrames, layerShape, nearestEdge, removePoint, levelRoad, levelRoads, orderedRoads, padsToRoads, pathLength, roadLine, roadRadius, nearestOnPath, sanitizeLayers, simplifyPath, waterLevel } from './layers';
import { siteGround } from './site-ground';
import { emptySpec, moveTakeoff, sanitizeSpec, takeoffPadIndex } from './site-spec';
import { applyStroke, emptyGrid, heightAt } from './terrain';

const sq = (cx: number, cz: number, h: number) => [
  { x: cx - h, z: cz - h },
  { x: cx + h, z: cz - h },
  { x: cx + h, z: cz + h },
  { x: cx - h, z: cz + h },
];

describe('layers: stored specs', () => {
  it('turns old road pads into two-point roads and keeps the take-off pad', () => {
    const { roads, pads } = padsToRoads([{ x: 10, z: 0, w: 20, d: 6, rotDeg: 0 }, { x: 0, z: 0, w: 6, d: 6 }]);
    expect(roads).toEqual([{ pts: [{ x: 0, z: 0 }, { x: 20, z: 0 }], width: 6, kind: 'road' }]);
    expect(pads).toHaveLength(1);
    const old = sanitizeSpec({ ...emptySpec(), pads: [{ x: 10, z: 0, w: 20, d: 6, rotDeg: 90 }, { x: 0, z: 0, w: 6, d: 6 }] })!;
    expect(old.roads).toHaveLength(1);
    expect(old.pads).toHaveLength(1);
    expect(old.roads![0]!.pts[1]!.z).toBeCloseTo(10);
  });

  it('checks every value: unknown kinds fall back, short outlines drop, numbers are clamped', () => {
    const l = sanitizeLayers({
      roads: [{ pts: [{ x: 0, z: 0 }, { x: 5, z: 0 }], width: 999, kind: 'motorway' as never }, { pts: [{ x: 0, z: 0 }], width: 3, kind: 'path' }],
      surfaces: [{ pts: sq(0, 0, 5), kind: 'lava' as never }, { pts: [], kind: 'sand' }],
      waters: [{ pts: sq(0, 0, 5), depth: -4 }],
    });
    expect(l.roads).toEqual([{ pts: [{ x: 0, z: 0 }, { x: 5, z: 0 }], width: 40, kind: 'road' }]);
    expect(l.surfaces).toEqual([{ pts: sq(0, 0, 5), kind: 'grass' }]);
    expect(l.waters![0]!.depth).toBe(0.2);
  });
});

describe('layers on the ground', () => {
  it('levels a road across its width but keeps its slope along it', () => {
    const g = emptyGrid({ cell: 1, half: { e: 40, n: 40 } });
    for (let j = 0; j < g.nz; j++) for (let i = 0; i < g.nx; i++) g.h[j * g.nx + i] = (j - 40) * 0.2 + i * 0.05; // tilted both ways
    levelRoad(g, { pts: [{ x: -30, z: 0 }, { x: 30, z: 0 }], width: 6, kind: 'road' });
    expect(heightAt(g, 0, 2.5)).toBeCloseTo(heightAt(g, 0, 0), 1); // flat across
    expect(heightAt(g, 20, 0) - heightAt(g, -20, 0)).toBeCloseTo(2, 1); // still climbs east
  });

  it('levels two crossing roads flat at the crossing, no zig-zag trough', () => {
    const g = emptyGrid({ cell: 1, half: { e: 40, n: 40 } });
    for (let j = 0; j < g.nz; j++) for (let i = 0; i < g.nx; i++) g.h[j * g.nx + i] = (j - 40) * 0.2 + i * 0.05;
    const eW = { pts: [{ x: -30, z: 0 }, { x: 30, z: 0 }], width: 6, kind: 'road' as const };
    const nS = { pts: [{ x: 0, z: -30 }, { x: 0, z: 30 }], width: 6, kind: 'road' as const };
    levelRoads(g, [eW, nS]);
    const y = heightAt(g, 0, 0); // the crossing sits at the common level both roads take there
    expect(heightAt(g, 2, 0)).toBeGreaterThan(y - 0.05); // no dip carved along the east road
    expect(heightAt(g, -2, 0)).toBeLessThan(y + 0.05); // and no hump either: the crossing is flat
    expect(heightAt(g, 0, 2)).toBeGreaterThan(y - 0.05); // same along the north-south road
    expect(heightAt(g, 0, -2)).toBeLessThan(y + 0.05);
    expect(heightAt(g, 20, 0) - heightAt(g, -20, 0)).toBeCloseTo(2, 1); // east road keeps its slope
    expect(heightAt(g, 0, 20) - heightAt(g, 0, -20)).toBeCloseTo(8, 1); // north-south road too
  });

  it('digs a basin below the lowest bank and reports the water level', () => {
    const g = emptyGrid({ cell: 1, half: { e: 40, n: 40 } });
    applyStroke(g, { op: 'raise', pts: [{ x: 20, z: 0 }], radius: 15, strength: 3 });
    const w = { pts: sq(0, 0, 8), depth: 2 };
    const before = waterLevel(g, w);
    const level = digWater(g, w);
    expect(level).toBeCloseTo(before);
    expect(heightAt(g, 0, 0)).toBeCloseTo(level - 2, 1);
    expect(heightAt(g, 0, 0)).toBeLessThan(level);
  });

  it('a site ground applies water, roads and pads, and is remembered', () => {
    const s = emptySpec();
    s.terrain = { cell: 1, half: { e: 60, n: 60 }, strokes: [{ op: 'raise', pts: [{ x: 0, z: 30 }], radius: 30, strength: 4 }] };
    s.waters = [{ pts: sq(30, -30, 6), depth: 1.5 }];
    s.roads = [{ pts: [{ x: -40, z: 30 }, { x: 40, z: 30 }], width: 6, kind: 'road' }];
    const a = siteGround(s);
    expect(a.water).toHaveLength(1);
    expect(a.at(30, -30)).toBeLessThan(a.water[0]!);
    expect(siteGround(s)).toBe(a);
  });

  it('simplifies a hand-drawn line', () => {
    const wobble = Array.from({ length: 50 }, (_, i) => ({ x: i, z: (i % 2) * 0.1 }));
    expect(simplifyPath(wobble)).toHaveLength(2);
    const corner = [{ x: 0, z: 0 }, { x: 5, z: 0 }, { x: 10, z: 0 }, { x: 10, z: 5 }, { x: 10, z: 10 }];
    expect(simplifyPath(corner)).toEqual([{ x: 0, z: 0 }, { x: 10, z: 0 }, { x: 10, z: 10 }]);
  });
});

describe('layer shapes from a drag', () => {
  const line = [{ x: 0, z: 0 }, { x: 10, z: 0 }, { x: 20, z: 0.1 }];
  it('roads and canals need a drag of 2 m, outlines three points', () => {
    expect(layerShape([{ x: 0, z: 0 }, { x: 1, z: 0 }], 'line', { tol: 0.5 })).toBe('Drag along the way to draw a road.');
    expect(layerShape(line, 'line', { tol: 0.5 })).toEqual([{ x: 0, z: 0 }, { x: 20, z: 0.1 }]);
    expect(layerShape(line, 'outline', { tol: 0.5 })).toBe('Draw a loop: the outline of the area.');
    const strip = layerShape(line, 'strip', { tol: 0.5, width: 6 });
    expect(Array.isArray(strip) && strip.length).toBe(4);
  });
  it('measures a line', () => {
    expect(pathLength([{ x: 0, z: 0 }, { x: 3, z: 4 }, { x: 3, z: 10 }])).toBe(11);
    expect(pathLength([])).toBe(0);
  });
});

describe('editing outlines point by point', () => {
  const sq = [{ x: 0, z: 0 }, { x: 10, z: 0 }, { x: 10, z: 10 }, { x: 0, z: 10 }];
  it('finds the nearest edge, closing the outline', () => {
    expect(nearestEdge(sq, { x: -1, z: 5 }, true)).toEqual({ i: 3, at: { x: 0, z: 5 }, d: 1 });
    expect(nearestEdge(sq, { x: -1, z: 5 }, false)!.i).not.toBe(3); // an open line has no closing edge
  });
  it('adds a point on that edge and removes one, keeping a minimum', () => {
    const r = insertPoint(sq, { x: 5, z: -2 }, true)!;
    expect(r.k).toBe(1);
    expect(r.pts[1]).toEqual({ x: 5, z: 0 });
    expect(removePoint(r.pts, 1, 3)).toEqual(sq);
    expect(removePoint(sq.slice(0, 3), 0, 3)).toBeNull();
  });
});

describe('road overlap priority', () => {
  const roads = [
    { kind: 'road' as const, width: 8, pts: [{ x: -20, z: 0 }, { x: 20, z: 0 }] },
    { kind: 'path' as const, width: 2, pts: [{ x: 0, z: -20 }, { x: 0, z: 20 }] },
  ];
  it('uses the major road across a crossing, independent of insertion order', () => {
    const make = () => {
      const g = emptyGrid({ cell: 1, half: { e: 30, n: 30 } });
      for (let j = 0; j < g.nz; j++) for (let i = 0; i < g.nx; i++) g.h[j * g.nx + i] = (j - 30) * 0.2;
      return g;
    };
    const a = make(), b = make();
    levelRoads(a, roads);
    levelRoads(b, [...roads].reverse());
    expect(a.h).toEqual(b.h);
    expect(heightAt(a, 0, 3)).toBeCloseTo(0); // major road, not path centre-line height 0.6
    expect(heightAt(a, 0, 10)).toBeCloseTo(2); // path keeps its slope away from crossing
  });
  it('orders classes consistently without mutating the saved spec', () => {
    const all = [...roads, { ...roads[0]!, kind: 'track' as const }, { ...roads[0]!, kind: 'rail' as const }];
    expect(orderedRoads(all).map((r) => r.kind)).toEqual(['path', 'track', 'road', 'rail']);
    expect(all[0]!.kind).toBe('road');
  });
});

describe('moving the take-off pad', () => {
  it('moves the last pad and the drone start together, keeping their offset; road pads stay', () => {
    const s = emptySpec({ lat: 45.4642, lon: 9.19 });
    s.pads = [{ x: 30, z: 5, w: 40, d: 4, rotDeg: 30 }, { x: -14, z: 1, w: 12, d: 12 }];
    s.droneStart = { x: -14, z: 0 };
    moveTakeoff(s, { x: 6, z: -8 });
    expect(s.droneStart).toEqual({ x: 6, z: -8 });
    expect(s.pads[1]).toMatchObject({ x: 6, z: -7, w: 12, d: 12 });
    expect(s.pads[0]).toMatchObject({ x: 30, z: 5 });
  });
});

describe('road strips turn without gaps', () => {
  it('a straight road has square frames; a bend shares one mitred frame between its two segments', () => {
    const straight = stripFrames([{ x: 0, z: 0 }, { x: 10, z: 0 }], 2.5);
    expect(straight).toHaveLength(5);
    for (const f of straight) expect(f).toMatchObject({ nx: -0, nz: 1, s: 1 });
    // a right-angle bend at (10, 0): one frame there, normal at 45°, half-width stretched by √2
    const bend = stripFrames([{ x: 0, z: 0 }, { x: 10, z: 0 }, { x: 10, z: 10 }], 5);
    const at = bend.filter((f) => f.x === 10 && f.z === 0);
    expect(at).toHaveLength(1);
    expect(Math.hypot(at[0]!.nx, at[0]!.nz)).toBeCloseTo(1, 6);
    expect(at[0]!.s).toBeCloseTo(Math.SQRT2, 6);
    expect(bend).toHaveLength(5); // 0, 5, 10 | 5, 10 along the second segment
    // a hairpin is capped, and a repeated point is skipped
    expect(Math.max(...stripFrames([{ x: 0, z: 0 }, { x: 10, z: 0 }, { x: 10, z: 0 }, { x: 0, z: 0.5 }], 5).map((f) => f.s))).toBeLessThanOrEqual(2);
  });
});

describe('rounded road corners (B-036)', () => {
  const corner = { pts: [{ x: 0, z: 0 }, { x: 40, z: 0 }, { x: 40, z: 40 }], width: 4, kind: 'road' as const };

  it('replaces a corner with a curve tangent to both segments, the road\'s turn radius wide', () => {
    const line = roadLine(corner);
    expect(line[0]).toEqual({ x: 0, z: 0 });
    expect(line.at(-1)).toEqual({ x: 40, z: 40 });
    expect(line.length).toBeGreaterThan(5);
    expect(line.some((p) => p.x === 40 && p.z === 0)).toBe(false); // the corner itself is cut
    const t = roadRadius(4); // a right angle: the curve starts and ends one radius from the corner
    const near = (x: number, z: number) => line.some((p) => Math.hypot(p.x - x, p.z - z) < 1e-9);
    expect(near(40 - t, 0)).toBe(true);
    expect(near(40, t)).toBe(true);
    // no step turns by more than 30°: a curve, not a corner
    for (let i = 1; i + 1 < line.length; i++) {
      const a = line[i - 1]!, b = line[i]!, c = line[i + 1]!;
      const u = Math.atan2(b.z - a.z, b.x - a.x), v = Math.atan2(c.z - b.z, c.x - b.x);
      expect(Math.abs(v - u)).toBeLessThan(Math.PI / 6);
    }
  });

  it('keeps straight lines, end points and dense map lines as they are', () => {
    const straight = { pts: [{ x: 0, z: 0 }, { x: 10, z: 0 }, { x: 20, z: 0.1 }], width: 6, kind: 'road' as const };
    expect(roadLine(straight)).toEqual(straight.pts);
    // points 1 m apart: the curve uses at most half a segment each side, so it stays within 0.5 m of the corner
    const dense = { pts: [{ x: 0, z: 0 }, { x: 1, z: 0 }, { x: 1, z: 1 }], width: 6, kind: 'road' as const };
    for (const p of roadLine(dense)) expect(nearestOnPath(dense.pts, p.x, p.z).d).toBeLessThan(0.3);
  });

  it('levels the ground along the curve, where the strip is drawn', () => {
    // a ramp rising to the east, flattened across the road; the inside of the bend, off the old corner, is levelled
    const g = emptyGrid({ cell: 1, half: { e: 60, n: 60 } });
    for (let k = 0; k < g.h.length; k++) g.h[k] = (k % g.nx) * 0.1;
    levelRoad(g, corner);
    const line = roadLine(corner), mid = line[Math.floor(line.length / 2)]!;
    expect(nearestOnPath(line, mid.x, mid.z).d).toBe(0);
    // a point on the curve, inside the old corner by more than the half width: levelled to the curve's height
    const inner = { x: mid.x - 1, z: mid.z + 1 };
    expect(nearestOnPath(corner.pts, inner.x, inner.z).d).toBeGreaterThan(2);
    expect(Math.abs(heightAt(g, inner.x, inner.z) - heightAt(g, mid.x, mid.z))).toBeLessThan(0.25);
  });
});

describe('which pad is the take-off pad (F-021)', () => {
  it('is the pad under the drone\'s start, not simply the last one; none when the start is off every pad', () => {
    const s = emptySpec();
    s.pads = [{ x: 0, z: 0, w: 6, d: 6 }, { x: -14, z: 0, w: 12, d: 12 }]; // the last pad is a slab elsewhere (Playground)
    s.droneStart = { x: 1, z: 2 };
    expect(takeoffPadIndex(s)).toBe(0);
    s.droneStart = { x: -30, z: 128 };
    expect(takeoffPadIndex(s)).toBe(-1);
    // a turned pad: its rectangle, not its bounding box
    s.pads = [{ x: 0, z: 0, w: 10, d: 2, rotDeg: 90 }];
    s.droneStart = { x: 0, z: 4 };
    expect(takeoffPadIndex(s)).toBe(0);
    s.droneStart = { x: 4, z: 0 };
    expect(takeoffPadIndex(s)).toBe(-1);
  });

  it('moves only the start when no pad is under it, and the pad under it otherwise', () => {
    const s = emptySpec();
    s.pads = [{ x: -14, z: 0, w: 12, d: 12 }];
    s.droneStart = { x: -30, z: 128 };
    moveTakeoff(s, { x: 0, z: 100 });
    expect(s.droneStart).toEqual({ x: 0, z: 100 });
    expect(s.pads[0]).toMatchObject({ x: -14, z: 0 }); // the slab stays
    s.droneStart = { x: -12, z: 1 };
    moveTakeoff(s, { x: 8, z: 21 });
    expect(s.pads[0]).toMatchObject({ x: 6, z: 20 }); // the pad under the start moves with it
  });
});
