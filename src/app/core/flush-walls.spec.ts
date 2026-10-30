import { describe, expect, it } from 'vitest';
import type { BuildingSpec } from './site-spec';
import { flushWalls } from './flush-walls';

const box = (id: string, x: number, z: number, length: number, width: number, rotDeg = 0): BuildingSpec => ({
  id, name: id, pos: { x, z }, rotDeg, length, width,
  levels: [{ baseY: 0, height: 3, sides: { n: true, s: true, e: true, w: true }, doors: {}, partitions: [], roof: 'flat', roofRise: 0 }],
});

describe('walls of buildings snapped flush (B-035)', () => {
  it('finds the shared side and thins only the later building', () => {
    // a 10 m house and a 6 m shed against its east side
    expect([...flushWalls([box('house', 0, 0, 10, 8), box('shed', 8, 0, 6, 4)])]).toEqual(['shed:w']);
  });

  it('finds it at any rotation, and on a shaped building', () => {
    // the same pair turned 30° about the house's centre
    const r = (30 * Math.PI) / 180;
    expect([...flushWalls([box('house', 0, 0, 10, 8, 30), box('shed', 8 * Math.cos(r), 8 * Math.sin(r), 6, 4, 30)])]).toEqual(['shed:w']);
    // an L-shaped wing whose west edge (x = -3 local, centred) lies on the house's east side
    const wing: BuildingSpec = { ...box('wing', 8, 0, 6, 6), footprint: [{ x: -3, z: -3 }, { x: 3, z: -3 }, { x: 3, z: 0 }, { x: 0, z: 0 }, { x: 0, z: 3 }, { x: -3, z: 3 }] };
    expect([...flushWalls([box('house', 0, 0, 10, 8), wing])]).toEqual(['wing:edge5']);
  });

  it('leaves apart, crossing and merely touching walls alone', () => {
    expect(flushWalls([box('a', 0, 0, 10, 8), box('b', 8.2, 0, 6, 4)]).size).toBe(0); // 20 cm gap
    expect(flushWalls([box('a', 0, 0, 10, 8), box('b', 8, 0, 6, 4, 10)]).size).toBe(0); // turned 10°
    expect(flushWalls([box('a', 0, 0, 10, 8), box('b', 8, 6, 6, 4)]).size).toBe(0); // corner to corner only
  });
});
