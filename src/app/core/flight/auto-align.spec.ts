import { describe, expect, it } from 'vitest';
import { alignCandidates, alignFlight, type AlignMoment } from './auto-align';

const C = alignCandidates(8, 2, [0]);
const at = (dx: number, dz: number) => C.findIndex((c) => c.dx === dx && c.dz === dz);
/** Visual evidence peaking at (px, pz), falling off with distance; `along` widens it into a ridge along x. */
const visual = (px: number, pz: number, along = 1) => C.map((c) => 0.6 - 0.1 * Math.hypot((c.dx - px) / along, c.dz - pz));
const clear = C.map(() => 0);
const moment = (t: number, v: readonly number[] | null, collisions: readonly number[] = clear): AlignMoment => ({ t, visual: v, collisions });

describe('aligning a replay automatically (F-041)', () => {
  it('without evidence keeps the GPS path', () => {
    const r = alignFlight(C, [0, 2, 4].map((t) => moment(t, null)));
    expect(r.map((x) => [x.offset.dx, x.offset.dz])).toEqual([[0, 0], [0, 0], [0, 0]]);
  });

  it('follows a clear visual match, and is sure of it', () => {
    const r = alignFlight(C, [0, 2, 4].map((t) => moment(t, visual(-6, 4))));
    for (const x of r) expect([x.offset.dx, x.offset.dz]).toEqual([-6, 4]);
    expect(r[1]!.confidence).toBe('sure');
  });

  it('a moment blind along one axis is settled by its neighbours (the heading changed)', () => {
    // the middle moment sees only z (a long ridge along x); its neighbours see the full position
    const r = alignFlight(C, [moment(0, visual(-6, 4)), moment(2, visual(0, 4, 40)), moment(4, visual(-6, 4))]);
    expect([r[1]!.offset.dx, r[1]!.offset.dz]).toEqual([-6, 4]);
    // alone, the ridge cannot say where along x
    expect(alignFlight(C, [moment(2, visual(0, 4, 40))])[0]!.confidence).toBe('unsure');
  });

  it('leaves a solid by the cheapest shift; when nothing clears it, says so', () => {
    const wall = C.map((c) => (c.dx < 4 ? 3 : 0)); // inside a wall unless shifted 4 m east or more
    const r = alignFlight(C, [moment(0, null, wall)]);
    expect(r[0]!.offset.dx).toBe(4);
    expect(r[0]!.throughSolid).toBe(false);
    const everywhere = C.map(() => 2); // a gap the model lacks: the drone crossed it anyway
    expect(alignFlight(C, [moment(0, null, everywhere)])[0]!.throughSolid).toBe(true);
    expect(at(4, 0)).toBeGreaterThan(-1);
  });

  it('flat evidence gives an unsure moment', () => {
    expect(alignFlight(C, [moment(0, C.map(() => 0.3))])[0]!.confidence).toBe('unsure');
  });
});
