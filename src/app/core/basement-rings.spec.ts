import { MAX_COURTYARDS, cleanRings, keepValidRings } from './basement-rings';
import { emptySpec, sanitizeSpec, type BuildingSpec, type Vec2 } from './site-spec';

/** A 10 × 8 building (centred frame: x −5…5, z −4…4) with a basement under it. */
const building = (basement: BuildingSpec['basement']): BuildingSpec => ({
  id: 'b', name: 'B', pos: { x: 0, z: 0 }, rotDeg: 0, length: 10, width: 8,
  levels: [{ baseY: 0, height: 4, sides: { n: true, s: true, e: true, w: true }, doors: {}, partitions: [], roof: 'flat', roofRise: 0 }],
  basement,
});
const square = (x0: number, z0: number, size: number): Vec2[] => [{ x: x0, z: z0 }, { x: x0 + size, z: z0 }, { x: x0 + size, z: z0 + size }, { x: x0, z: z0 + size }];
const saved = (b: BuildingSpec): BuildingSpec => sanitizeSpec(JSON.parse(JSON.stringify({ ...emptySpec({ lat: 0, lon: 0 }), buildings: [b] })))!.buildings[0]!;

describe('basement courtyards and pieces (model)', () => {
  it('leaves a saved basement without them unchanged', () => {
    const b = saved(building({ height: 3 }));
    expect(b.basement).toEqual({ height: 3 });
  });

  it('keeps a courtyard strictly inside the perimeter through save and load, with its open edges', () => {
    const courtyard = { outline: square(-1, -1, 2), wallEdges: [true, false, true, true] };
    const b = saved(building({ height: 3, courtyards: [courtyard] }));
    expect(b.basement!.courtyards).toEqual([courtyard]);
    // all walls is the default: the flags are not stored
    expect(saved(building({ height: 3, courtyards: [{ outline: square(-1, -1, 2), wallEdges: [true, true, true, true] }] })).basement!.courtyards).toEqual([{ outline: square(-1, -1, 2) }]);
  });

  it('drops (never reshapes) a courtyard that is not a hole through the basement', () => {
    const cases: Vec2[][] = [
      square(3, -1, 2),   // touches the east wall (x = 5): that is a Cut, not a courtyard
      square(4, -1, 2),   // partly outside
      square(-1, -1, 0.5), // narrower than a courtyard
    ];
    for (const outline of cases) expect(saved(building({ height: 3, courtyards: [{ outline }] })).basement!.courtyards).toBeUndefined();
    // the second of two overlapping courtyards goes, the first stays
    const two = saved(building({ height: 3, courtyards: [{ outline: square(-2, -2, 2) }, { outline: square(-1, -1, 2) }] }));
    expect(two.basement!.courtyards).toEqual([{ outline: square(-2, -2, 2) }]);
  });

  it('a courtyard cannot swallow a column (floor items use the basement min-corner frame)', () => {
    // centre (0, 0) of the outline frame is (5, 4) from the basement's min corner
    const b = building({ height: 3, columns: [{ x: 5, z: 4, size: 0.5 }], courtyards: [{ outline: square(-1, -1, 2) }] });
    expect(keepValidRings(b)!.courtyards).toBeUndefined();
    expect(keepValidRings({ ...b, basement: { ...b.basement!, columns: [{ x: 1, z: 1, size: 0.5 }] } })!.courtyards).toHaveLength(1);
  });

  it('keeps a separate piece only when it is apart from the main perimeter and the other pieces', () => {
    const apart = { outline: square(8, -2, 4) };
    expect(saved(building({ height: 3, pieces: [apart] })).basement!.pieces).toEqual([apart]);
    expect(saved(building({ height: 3, pieces: [{ outline: square(4, -2, 4) }] })).basement!.pieces).toBeUndefined(); // overlaps
    expect(saved(building({ height: 3, pieces: [{ outline: square(5, -2, 4) }] })).basement!.pieces).toBeUndefined(); // touches: a Wing
    expect(saved(building({ height: 3, pieces: [apart, { outline: square(9, -1, 2) }] })).basement!.pieces).toEqual([apart]);
  });

  it('cleans malformed rings and caps the list', () => {
    const bow: Vec2[] = [{ x: 0, z: 0 }, { x: 2, z: 2 }, { x: 2, z: 0 }, { x: 0, z: 2 }]; // self-crossing
    expect(cleanRings([{ outline: bow }, { outline: [{ x: 0, z: 0 }, { x: 1, z: NaN }, { x: 1, z: 1 }] }, null, 'x'], 4)).toBeUndefined();
    expect(cleanRings('nope', 4)).toBeUndefined();
    const many = Array.from({ length: MAX_COURTYARDS + 5 }, (_, i) => ({ outline: square(i * 3, 0, 1) }));
    expect(cleanRings(many, MAX_COURTYARDS)).toHaveLength(MAX_COURTYARDS);
  });
});
