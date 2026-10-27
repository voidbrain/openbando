import { describe, expect, it } from 'vitest';
import { measureVertices } from './measure-view';

describe('3D measure projection', () => {
  it('follows the ground at both endpoints and across the line', () => {
    const p = measureVertices({ a: { x: 0, z: 0 }, b: { x: 8, z: 4 } }, (x, z) => x + z);
    expect(p).toHaveLength(99);
    expect(p.slice(0, 3)).toEqual([0, 0.3, 0]);
    expect(p.slice(-3)).toEqual([8, 12.3, 4]);
    expect(p.slice(48, 51)).toEqual([4, 6.3, 2]);
  });
});
