import { contains, validOutline, type Pt, type Rect } from './footprint';

const cross = (a: Pt, b: Pt): number => a.x * b.z - a.z * b.x;
const sub = (a: Pt, b: Pt): Pt => ({ x: a.x - b.x, z: a.z - b.z });
const key = (p: Pt): string => `${Math.round(p.x * 1e6)},${Math.round(p.z * 1e6)}`;
interface Segment { a: Pt; b: Pt; cuts: number[] }

/** Union/subtract an axis-aligned rectangle from a simple polygon. Only one simple outline is supported. */
export function polygonRect(poly: Pt[], input: Rect, op: 'add' | 'cut'): Pt[] | null {
  const r = { x0: Math.min(input.x0, input.x1), x1: Math.max(input.x0, input.x1), z0: Math.min(input.z0, input.z1), z1: Math.max(input.z0, input.z1) };
  if (!validOutline(poly) || !Object.values(r).every(Number.isFinite) || r.x1 - r.x0 < 0.25 || r.z1 - r.z0 < 0.25) return null;
  const box: Pt[] = [{x:r.x0,z:r.z0},{x:r.x1,z:r.z0},{x:r.x1,z:r.z1},{x:r.x0,z:r.z1}];
  const segments = (ring: Pt[]): Segment[] => ring.map((a, i) => ({a, b:ring[(i+1)%ring.length]!, cuts:[0, 1]}));
  const p = segments(poly), q = segments(box);
  const add = (s: Segment, t: number): void => { if (t > 1e-8 && t < 1 - 1e-8) s.cuts.push(t); };
  for (const a of p) for (const b of q) {
    const u = sub(a.b,a.a), v = sub(b.b,b.a), w = sub(b.a,a.a), det = cross(u,v);
    if (Math.abs(det) > 1e-10) {
      const t = cross(w,v)/det, k = cross(w,u)/det;
      if (t >= -1e-8 && t <= 1+1e-8 && k >= -1e-8 && k <= 1+1e-8) { add(a,t); add(b,k); }
    } else if (Math.abs(cross(w,u)) < 1e-8) {
      // Collinear overlap: split at each other's endpoints so shared boundaries can be classified.
      const dot = (x: Pt,y: Pt): number => x.x*y.x+x.z*y.z;
      const ul = dot(u,u), vl = dot(v,v);
      add(a,dot(sub(b.a,a.a),u)/ul); add(a,dot(sub(b.b,a.a),u)/ul);
      add(b,dot(sub(a.a,b.a),v)/vl); add(b,dot(sub(a.b,b.a),v)/vl);
    }
  }
  const inResult = (x:number,z:number): boolean => {
    const a = contains(poly,x,z), b = x > r.x0 && x < r.x1 && z > r.z0 && z < r.z1;
    return op === 'add' ? a || b : a && !b;
  };
  const edges = new Map<string,{a:Pt;b:Pt}>();
  for (const segment of [...p,...q]) {
    const v = sub(segment.b,segment.a), len = Math.hypot(v.x,v.z);
    const cuts = [...new Set(segment.cuts)].sort((a,b)=>a-b);
    for (let i=0;i+1<cuts.length;i++) {
      const t0=cuts[i]!,t1=cuts[i+1]!; if ((t1-t0)*len < 1e-7) continue;
      const at = (t:number):Pt => ({x:segment.a.x+v.x*t,z:segment.a.z+v.z*t});
      let a=at(t0),b=at(t1); const m=at((t0+t1)/2), epsilon=Math.min(1e-5,(t1-t0)*len/100);
      const left=inResult(m.x-v.z/len*epsilon,m.z+v.x/len*epsilon);
      const right=inResult(m.x+v.z/len*epsilon,m.z-v.x/len*epsilon);
      if (left===right) continue;
      if (!left) [a,b]=[b,a];
      edges.set(`${key(a)}>${key(b)}`,{a,b});
    }
  }
  if (!edges.size) return null;
  const next = new Map<string,{a:Pt;b:Pt}>();
  for (const edge of edges.values()) { const k=key(edge.a); if (next.has(k)) return null; next.set(k,edge); }
  const first=edges.values().next().value!; const result: Pt[]=[]; let edge=first;
  do {
    result.push(edge.a); const n=next.get(key(edge.b)); if (!n) return null; edge=n;
    if (result.length>edges.size) return null;
  } while (key(edge.a)!==key(first.a));
  if (result.length!==edges.size) return null; // a hole, disjoint island or pinch
  const clean = result.filter((v,i)=>{
    const before=result[(i+result.length-1)%result.length]!, after=result[(i+1)%result.length]!;
    return Math.abs(cross(sub(v,before),sub(after,v))) > 1e-7;
  });
  return validOutline(clean) ? clean : null;
}
