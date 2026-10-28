import { polygonRect } from './polygon-rect';
import { contains, type Pt } from './footprint';
const area = (p: Pt[]): number => Math.abs(p.reduce((a,v,i)=>{const n=p[(i+1)%p.length]!;return a+v.x*n.z-n.x*v.z},0))/2;
describe('diagonal polygon and rectangle', () => {
  const poly = [{x:0,z:0},{x:8,z:0},{x:8,z:4},{x:4,z:8},{x:0,z:8}];
  it('adds a wing across a diagonal edge and cuts a notch without flattening the outline', () => {
    const add=polygonRect(poly,{x0:5,z0:5,x1:9,z1:7},'add');
    expect(add).not.toBeNull(); expect(area(add!)).toBeCloseTo(62);
    expect(add!.some((p,i)=>{const q=add![(i+1)%add!.length]!;return p.x!==q.x&&p.z!==q.z})).toBe(true);
    const cut=polygonRect(poly,{x0:1,z0:-1,x1:3,z1:2},'cut');
    expect(cut).not.toBeNull(); expect(area(cut!)).toBeCloseTo(52);
  });
  it('cuts across a diagonal edge and works with the reverse winding', () => {
    for (const ring of [poly, [...poly].reverse()]) {
      const cut = polygonRect(ring, {x0:6,z0:2,x1:9,z1:6}, 'cut');
      expect(cut).not.toBeNull(); expect(area(cut!)).toBeCloseTo(50);
    }
  });
  it('classifies sampled points correctly for a diagonal cut and wing', () => {
    const cases = [
      {op: 'add' as const, rect: {x0:5,z0:5,x1:9,z1:7}},
      {op: 'cut' as const, rect: {x0:6,z0:2,x1:9,z1:6}},
    ];
    for (const {op, rect} of cases) {
      const result = polygonRect(poly, rect, op)!;
      for (let x=-0.83; x<9.5; x+=0.37) for (let z=-0.91; z<8.5; z+=0.41) {
        const a = contains(poly,x,z), b = x > rect.x0 && x < rect.x1 && z > rect.z0 && z < rect.z1;
        expect(contains(result,x,z), `${op} at ${x}, ${z}`).toBe(op === 'add' ? a || b : a && !b);
      }
    }
  });
  it('rejects holes and disconnected pieces', () => {
    expect(polygonRect(poly,{x0:1,z0:1,x1:2,z1:2},'cut')).toBeNull();
    expect(polygonRect(poly,{x0:20,z0:20,x1:22,z1:22},'add')).toBeNull();
    expect(polygonRect(poly,{x0:3,z0:-1,x1:5,z1:9},'cut')).toBeNull();
  });
});
