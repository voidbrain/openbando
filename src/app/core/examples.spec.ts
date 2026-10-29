import { describe, expect, it } from 'vitest';
import { newerExample, sanitizeExamples } from './examples';
import { fixturesInSite, sanitizeSpec } from './site-spec';
import { expandShapes, shapeSolids } from './shapes';
import index from '../../../public/library/bandos.json';
import chiari from '../../../public/library/bandos/chiari-e-forti.json';
import hidden from '../../../public/library/bandos/villetta-no-place.json';
import bardwell from '../../../public/library/bandos/bardwell-house-no-place.json';
import playground from '../../../public/library/bandos/playground.json';
import catalog from '../../../public/library/catalog.json';

describe('example bandos', () => {
  it('keeps only well-formed rows, with files inside bandos/', () => {
    const rows = sanitizeExamples({
      bandos: [
        { file: 'bandos/a.json', name: 'A', origin: { lat: 1, lon: 2 }, buildings: 3 },
        { file: '../secret.json', name: 'B', origin: { lat: 1, lon: 2 } },
        { file: 'bandos/c.json', name: 'C', origin: { lat: 'x', lon: 2 } },
        null,
      ],
    });
    expect(rows.map((r) => r.name)).toEqual(['A']);
    expect(sanitizeExamples('nope')).toEqual([]);
  });

  it('every published example is listed and loads as a bando', () => {
    const rows = sanitizeExamples(index);
    expect(rows.map((r) => r.name)).toEqual(['Bardwell House', 'Chiari e Forti', 'Playground', 'Bando Villetta']);
    expect(rows.find((r) => r.name === 'Bando Villetta')?.privacy).toBe('hidden');
    expect(rows.find((r) => r.name === 'Bardwell House')?.privacy).toBe('hidden');
    for (const raw of [hidden, chiari, bardwell]) {
      const spec = sanitizeSpec(raw);
      expect(spec).not.toBeNull();
      expect(spec!.buildings.length).toBeGreaterThan(5);
      expect(spec!.terrain?.base?.key).toBeTruthy(); // its real ground: fetched again, or carried inside
    }
    // the factory's roofless mill with battlements, and its landmarks from the library
    const c = sanitizeSpec(chiari)!;
    expect(c.buildings.find((b) => b.name === 'Ruined mill')).toMatchObject({ roofless: true, crenels: true });
    expect(c.structures?.map((s) => s.block?.id).sort()).toEqual(['abando/sign-tower', 'abando/water-tower']);
    expect(sanitizeSpec(hidden)!.buildings.find((b) => b.block?.id === 'abando/vault-shed')?.levels[0]?.roof).toBe('vault');
  });

  it.each([['Villetta', hidden], ['Bardwell House', bardwell]] as const)('%s, without its place, gives nothing away and carries its own ground', (_, file) => {
    const h = sanitizeSpec(file)!;
    expect(h.privacy).toBe('hidden');
    expect(h.origin).toEqual({ lat: 0, lon: 0 });
    expect(h.zone ?? h.areas ?? h.geoCorners ?? h.calibration).toBeUndefined();
    expect(h.terrain?.base?.source).toBe('embedded');
    expect((h.terrain?.base?.data ?? '').length).toBeGreaterThan(1000);
    expect(JSON.stringify(file)).not.toMatch(/Via | Ln\b|nameFromMap|terrarium/);
    // nothing near the real place: no coordinates of any kind in the file
    expect(JSON.stringify(file)).not.toMatch(/"(lat|lon)": *-?[1-9]/);
  });

  it('Bardwell House: the gambrel house and barn, the store, sheds and patio wall, and no map surface over the fields', () => {
    const b = sanitizeSpec(bardwell)!;
    const named = (n: string) => b.buildings.find((x) => x.name === n);
    expect(named('House')?.levels.at(-1)?.roof).toBe('gambrel');
    expect(named('Barn')?.levels.at(-1)?.roof).toBe('gambrel');
    expect(named('House wing')?.levels.at(-1)?.roof).toBe('flat');
    expect(named('Store')).toBeDefined();
    expect(b.buildings.filter((x) => x.name === 'Shed')).toHaveLength(3);
    expect(b.walls?.filter((w) => w.material === 'brick')).toHaveLength(3);
    // the generator's "concrete" over the west fields is gone; only the patio and the drive are paved
    for (const sf of b.surfaces ?? []) expect(Math.max(...sf.pts.map((p) => Math.abs(p.x)))).toBeLessThan(40);
    expect(b.droneStart).toEqual({ x: b.pads.at(-1)!.x, z: b.pads.at(-1)!.z });
    // only the model's ground: every road point and tree inside the area of its heights, the grass just around it
    const half = b.terrain!.half;
    for (const r of b.roads ?? []) for (const p of r.pts) expect(Math.abs(p.x) <= half.e + 1e-6 && Math.abs(p.z) <= half.n + 1e-6).toBe(true);
    for (const t of b.trees) expect(Math.abs(t.x) <= half.e && Math.abs(t.z) <= half.n).toBe(true);
    expect(b.extent).toBeLessThanOrEqual(Math.max(half.e, half.n) + 5);
    // the hedge on the south side of the house, the second drive and the pad in front of the house
    expect(b.walls?.filter((w) => w.material === 'hedge')).toHaveLength(2);
    expect(b.walls?.filter((w) => w.material === 'rail').length).toBeGreaterThan(3); // the drive's white post-and-rail fence
    expect(b.walls?.some((w) => w.material === 'wood')).toBe(false);
    expect(b.roads?.length).toBeGreaterThanOrEqual(5);
    expect(named('House')!.rotDeg).toBeLessThan(360);
  });
});

describe('the Playground', () => {
  const p = sanitizeSpec(playground)!;
  it('is a made-up place: hidden, at no coordinates, its ground shaped by brush strokes', () => {
    expect(p).not.toBeNull();
    expect(p.privacy).toBe('hidden');
    expect(p.origin).toEqual({ lat: 0, lon: 0 });
    expect(JSON.stringify(playground)).not.toMatch(/"(lat|lon)": *[1-9]/);
    expect(p.terrain?.base).toBeUndefined();
    expect(p.terrain!.strokes.map((s) => s.op)).toEqual(expect.arrayContaining(['hill', 'ramp', 'crater', 'raise']));
  });
  it('has water, a tunnel, a basement under a hole in the floor, ruins, trees and every block of the library', () => {
    expect(p.waters?.length).toBeGreaterThan(0);
    expect(p.underground?.length).toBeGreaterThan(0);
    const wh = p.buildings.find((b) => b.basement)!;
    expect(wh.levels[0]!.voids?.length).toBeGreaterThan(0);
    expect(p.buildings.some((b) => b.roofless && b.crenels)).toBe(true);
    expect(p.trees.length).toBeGreaterThan(40);
    const placed = new Set([...p.buildings, ...(p.structures ?? []), ...(p.walls ?? []), ...p.trees].map((e) => e.block?.id).filter(Boolean));
    const patterns = (catalog.blocks as { id: string; kind?: string }[]).filter((b) => b.kind === 'pattern').map((b) => b.id);
    for (const b of catalog.blocks as { id: string; kind?: string }[]) if (b.kind !== 'pattern') expect(placed.has(b.id), b.id).toBe(true);
    expect(patterns.length).toBeGreaterThan(0); // patterns write ordinary openings and columns: checked by the builder
  });
});

describe('example releases', () => {
  const ex = sanitizeExamples({ bandos: [{ file: 'bandos/a.json', name: 'A', origin: { lat: 0, lon: 0 }, release: 3 }, { file: 'bandos/b.json', name: 'B', origin: { lat: 0, lon: 0 } }] });
  it('reads the release (1 when absent)', () => {
    expect(ex.map((e) => e.release)).toEqual([3, 1]);
  });
  it('a copy hears of a newer release of its example, not of an equal one or a missing example', () => {
    expect(newerExample({ derivedFrom: { example: 'bandos/a.json', release: 2 } }, ex)?.name).toBe('A');
    expect(newerExample({ derivedFrom: { example: 'bandos/a.json', release: 3 } }, ex)).toBeNull();
    expect(newerExample({ derivedFrom: { example: 'bandos/gone.json', release: 1 } }, ex)).toBeNull();
    expect(newerExample({}, ex)).toBeNull();
  });
  it('a spec keeps where it came from, checked', () => {
    const base = { ...emptySpecLike(), derivedFrom: { example: 'bandos/a.json', release: 2.4 } };
    expect(sanitizeSpec(base)!.derivedFrom).toEqual({ example: 'bandos/a.json', release: 2 });
    expect(sanitizeSpec({ ...base, derivedFrom: { example: '../x', release: 1 } })!.derivedFrom).toBeUndefined();
  });
});
const emptySpecLike = () => JSON.parse(JSON.stringify(chiari)) as Record<string, unknown>;

describe('Villetta survey refinements', () => {
  const v = sanitizeSpec(hidden)!;
  const store = v.buildings.find((b) => b.name === 'Main store')!;
  const greenhouse = v.buildings.find((b) => b.frame === 'greenhouse')!;
  const annex = v.buildings.find((b) => b.name === 'Annex')!;
  it('keeps the four store crowns at 8 m and surveyed façade openings', () => {
    const l = store.levels[0]!;
    expect(l.roofCenterStrip).toBe(1);
    expect(l.baseY + l.height + (store.width - l.roofCenterStrip!) / l.roofCount! / 2 * l.vaultK!).toBeCloseTo(8);
    for (const o of Object.values(l.doors).flat()) {
      if (o.kind === 'door') expect(o.w).toBe(4.64);
      else expect(o.sill).toBe(2.69);
    }
    const rows = [...new Set(l.columns!.map((c) => c.z))].sort((a, b) => a - b);
    expect(rows[2]! - rows[1]! - l.columns![0]!.size).toBeCloseTo(1); // clear gap between column faces
  });
  it('keeps the north facade mostly closed with two covered windows and one door on the exposed eastern end', () => {
    const north = store.levels[0]!.doors.e!; // the rotated store's local east side faces site north
    expect(north.filter(o => o.kind === 'window').map(o => o.c)).toEqual([7.499, 27.599]);
    expect(north.filter(o => o.kind === 'door').map(o => o.c)).toEqual([47.699]);
    expect(store.levels[0]!.roofColor).toBe(annex.levels[1]!.roofColor);
  });
  it('places a separately selectable cabin over the blue ladder with an open bottom and doorway', () => {
    const ladder = fixturesInSite(store)[0]!;
    const cabin = v.structures!.find(s => s.id === 'villetta-ladder-cabin')!;
    expect(cabin.x).toBeCloseTo(ladder.x, 2);
    expect(cabin.z).toBeCloseTo(ladder.z, 2);
    expect(cabin.y).toBe(7);
    const boxes = shapeSolids(expandShapes(cabin.shapes!), 0, 0, 0).boxes;
    const contains = (x: number, y: number, z: number): boolean => boxes.some(b => x > b[0] && x < b[1] && y > b[2] && y < b[3] && z > b[4] && z < b[5]);
    expect(contains(0, 0.05, 0)).toBe(false); // ladder can enter through the open bottom
    expect(contains(0, 1, -0.9)).toBe(false); // doorway remains open
    expect(contains(0, 2.25, 0)).toBe(true); // a roof closes the cabin
  });
  it('keeps the south and east walls and their openings without a duplicate partition', () => {
    expect(annex.levels[0]!.partitions).toHaveLength(0);
    expect(v.walls![8]!.b).toEqual(v.walls![11]!.b); // the south wall reaches the east corner
    expect(annex.levels[0]!.sides.w).toBe(false);
    expect(annex.levels[1]!.sides.w).toBe(true);
    expect(annex.levels[0]!.columns!.length).toBeGreaterThan(0);
    expect(v.walls).toHaveLength(12);
    expect(v.walls!.slice(9, 12).every(w => w.height === 6.2)).toBe(true);
  });
  it('keeps the greenhouse footprint but uses the measured crown and rib pitch', () => {
    expect(greenhouse.width).toBeCloseTo(20.289);
    expect(greenhouse.width / 2 * greenhouse.levels[0]!.vaultK!).toBeCloseTo(9.3);
    expect(greenhouse.ribSpacing).toBe(4.61);
    expect(greenhouse.glass).toBe(false);
    expect(greenhouse.archShape).toBe('parabola');
    expect(greenhouse.levels[0]!.baseY).toBeCloseTo(0.35); // 30–40 cm above its levelled ground, estimated
    expect(greenhouse.fixtures?.find(f => f.id === 'villetta-greenhouse-east-frame')?.y).toBeCloseTo(0.35);
    const end = greenhouse.fixtures?.find(f => f.id === 'villetta-greenhouse-east-frame');
    expect(end?.x).toBeCloseTo(-greenhouse.length / 2);
    const placed = fixturesInSite(greenhouse).find(f => f.id === end?.id)!;
    const opposite = fixturesInSite({ ...greenhouse, fixtures: [{ ...end!, x: -end!.x }] })[0]!;
    const distanceToAnnex = (p: { x: number; z: number }) => Math.hypot(p.x - annex.pos.x, p.z - annex.pos.z);
    expect(distanceToAnnex(placed)).toBeGreaterThan(distanceToAnnex(opposite));
    expect(end?.shapes).toHaveLength(8);
  });
  it('leaves a 3.11 m first-floor walkway, a central void and a 6.20 m slab underside', () => {
    const g = annex.levels[0]!, u = annex.levels[1]!, hole = u.voids![0]!;
    expect(u.baseY - 0.1).toBeCloseTo(6.2);
    expect(g.height).toBe(u.baseY);
    expect(u.roof).toBe('gable');
    expect(hole.x0).toBe(3.11);
    expect(hole.z0).toBe(3.11);
    expect(annex.length - hole.x1).toBeCloseTo(3.11);
    expect(annex.width - hole.z1).toBeCloseTo(3.11);
    const row = g.columns!.filter((c) => c.z === 0.3).sort((a, b) => a.x - b.x);
    for (let i = 1; i < row.length - 1; i++) expect(row[i]!.x - row[i - 1]!.x).toBeCloseTo(3.43);
  });
});
