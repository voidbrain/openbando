import { it, expect } from 'vitest';
import * as THREE from 'three';
import { emptySpec } from '../core/site-spec';
import { meshHeightAt } from '../core/terrain';
import { buildSiteFromSpec } from './site-model';
it('keeps a diagonal steep road above terrain between vertices without losing area', () => {
  const s = emptySpec(); s.extent=60; s.pads=[];
  s.terrain={cell:1,half:{e:60,n:60},strokes:[{op:'hill',pts:[{x:0,z:0}],radius:6,strength:30}]};
  s.roads=[{kind:'road',width:7,pts:[{x:-20,z:-17},{x:20,z:17}]}];
  const model=buildSiteFromSpec(s); const road=model.group.children.find(o=>o.userData['roadKind']) as THREE.Mesh;
  const p=road.geometry.getAttribute('position'), idx=road.geometry.index; let min=Infinity; let worst='';
  let area=0;
  for(let i=0;i<(idx?.count??p.count);i+=3){
    const points=[0,1,2].map(k=>idx?.getX(i+k)??(i+k));
    const [ia,ib,ic]=points;
    area += Math.abs((p.getX(ib!) - p.getX(ia!)) * (p.getZ(ic!) - p.getZ(ia!)) - (p.getZ(ib!) - p.getZ(ia!)) * (p.getX(ic!) - p.getX(ia!))) / 2;
    for(const [a,b,c] of [[1/3,1/3,1/3],[0.6,0.2,0.2],[0.2,0.6,0.2],[0.2,0.2,0.6]]){
      const x=points.reduce((s,k,j)=>s+p.getX(k)*[a,b,c][j]!,0), y=points.reduce((s,k,j)=>s+p.getY(k)*[a,b,c][j]!,0),z=points.reduce((s,k,j)=>s+p.getZ(k)*[a,b,c][j]!,0);
      if (y-meshHeightAt(model.ground.grid,x,z)<min) { min=y-meshHeightAt(model.ground.grid,x,z); worst=JSON.stringify({x,y,z,tri:points.map(i=>[p.getX(i),p.getY(i),p.getZ(i)]),indexed:!!idx}); }
    }
  }
  expect(min, worst).toBeGreaterThan(0.05);
  expect(area).toBeCloseTo(7 * Math.hypot(40, 34), 2);
});
