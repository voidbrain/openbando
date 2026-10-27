import { describe, expect, it } from 'vitest';
import { contains } from './footprint';
import { mulberry } from './scatter';
import { scatterVegetation, vegetationAt } from './vegetation';
import { SiteEditor } from './site-editor';
import { emptySpec, sanitizeSpec } from './site-spec';

describe('living vegetation placement', () => {
  it('creates an editable hedge or bramble with its own dimensions', () => {
    const h = vegetationAt({ x: 2, z: 4 }, 'hedge');
    const b = vegetationAt({ x: 2, z: 4 }, 'bramble');
    expect(h.material).toBe('hedge');
    expect(b.material).toBe('bramble');
    expect(b.thick).toBeGreaterThan(h.thick);
    expect(h.b.x - h.a.x).toBeCloseTo(1.5);
  });
  it('keeps lasso-placed living walls inside the area and away from existing walls', () => {
    const poly = [{ x: 0, z: 0 }, { x: 30, z: 0 }, { x: 30, z: 30 }, { x: 0, z: 30 }];
    const existing = vegetationAt({ x: 15, z: 15 }, 'hedge');
    const result = scatterVegetation(poly, { trees: [], buildings: [], walls: [existing] }, 'bramble', { spacing: 5, rng: mulberry(42) });
    expect(result.length).toBeGreaterThan(0);
    expect(result.every(w => w.material === 'bramble' && contains(poly, w.a.x, w.a.z) && contains(poly, w.b.x, w.b.z))).toBe(true);
    expect(result.every(w => Math.hypot((w.a.x + w.b.x) / 2 - 15, (w.a.z + w.b.z) / 2 - 15) > 2)).toBe(true);
  });
  it('stores a lasso stroke as normal editable walls and undoes it in one step', () => {
    const ed = new SiteEditor();
    ed.load(emptySpec({ lat: 0, lon: 0 }, 'test'));
    const area = [{ x: 0, z: 0 }, { x: 30, z: 0 }, { x: 30, z: 30 }, { x: 0, z: 30 }];
    const made = scatterVegetation(area, ed.draft(), 'hedge', { rng: mulberry(10) });
    expect(made.length).toBeGreaterThan(0);
    ed.commitSite(s => (s.walls ??= []).push(...made));
    expect(sanitizeSpec(JSON.parse(JSON.stringify(ed.draft())))!.walls).toEqual(made);
    ed.undo();
    expect(ed.draft().walls ?? []).toHaveLength(0);
  });
});
