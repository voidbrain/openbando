import { describe, expect, it } from 'vitest';
import { addPin, pinOffset, sanitizePins } from './moment-pins';

describe('pins at moments of a flight (B-017)', () => {
  it('blends from the take-off (left where it was placed) through the pins, and holds after the last', () => {
    const pins = [{ t: 10, dx: 4, dz: 0 }, { t: 30, dx: 0, dz: -8 }];
    expect(pinOffset([], 5)).toEqual({ dx: 0, dy: 0, dz: 0 });
    expect(pinOffset(pins, 0)).toEqual({ dx: 0, dy: 0, dz: 0 });
    expect(pinOffset(pins, 5)).toEqual({ dx: 2, dy: 0, dz: 0 });
    expect(pinOffset(pins, 20)).toEqual({ dx: 2, dy: 0, dz: -4 });
    expect(pinOffset(pins, 99)).toEqual({ dx: 0, dy: 0, dz: -8 });
    // a pin at the very start replaces the take-off anchor
    expect(pinOffset([{ t: 0.2, dx: 3, dz: 3 }], 0)).toEqual({ dx: 3, dy: 0, dz: 3 });
  });

  it('a new pin puts the drone exactly where it is pinned, on top of the pins already there', () => {
    let pins = addPin([], 27.6, { x: -11.5, z: -4.2 }, { x: -25.2, z: 0 }); // the Villetta west-face moment, in a building frame
    expect(pinOffset(pins, 27.6)).toEqual({ dx: -13.7, dy: 0, dz: 4.2 });
    // the path at 73.1 s, with that pin applied, is 7.8 m off the centre line: pin it to the centre
    const path73 = { x: 1.9 - 13.7, z: -7.8 + 4.2 };
    pins = addPin(pins, 73.1, path73, { x: 1.9 - 13.7, z: 0 });
    const at73 = pinOffset(pins, 73.1);
    expect(1.9 + at73.dx).toBeCloseTo(1.9 - 13.7, 9);
    expect(-7.8 + at73.dz).toBeCloseTo(0, 9);
    expect(pinOffset(pins, 27.6).dx).toBeCloseTo(-13.7, 9); // the first pin still holds
    // a pin near another replaces it
    expect(addPin(pins, 73.3, { x: 0, z: 0 }, { x: 1, z: 1 })).toHaveLength(2);
  });

  it('keeps only well-formed saved pins, clamped and in order', () => {
    expect(sanitizePins([{ t: 5, dx: 1, dz: 2 }, { t: 'x' }, null, { t: 1, dx: 9999, dz: 0 }])).toEqual([{ t: 1, dx: 500, dz: 0 }, { t: 5, dx: 1, dz: 2 }]);
    expect(sanitizePins('nope')).toEqual([]);
  });
  it('carries a height too, blended the same way; a click on the ground keeps it (F-040)', () => {
    let pins = addPin([], 10, { x: 0, y: 6, z: 0 }, { x: 0, y: 2, z: 0 }); // 4 m lower at 10 s
    expect(pinOffset(pins, 5).dy).toBeCloseTo(-2, 9); // blended up from the take-off
    expect(pinOffset(pins, 10).dy).toBeCloseTo(-4, 9);
    pins = addPin(pins, 20, { x: 0, z: 0 }, { x: 3, z: 0 }); // a ground click: the height stays as it is there
    expect(pinOffset(pins, 20).dy).toBeCloseTo(-4, 9);
    expect(sanitizePins([{ t: 1, dx: 0, dz: 0, dy: -999 }])[0]!.dy).toBe(-200);
  });
});
