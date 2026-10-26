import {describe,expect,it} from 'vitest';
import * as THREE from 'three';
import {cameraNorthAngle} from './camera-compass';

describe('camera compass',()=>{
 it('keeps north aligned to the current camera and calibration',()=>{
  const q=new THREE.Quaternion();
  expect(cameraNorthAngle('orbit',q,{x:0,z:-1},0)).toBeCloseTo(0);
  q.setFromAxisAngle(new THREE.Vector3(0,1,0),Math.PI/2);
  expect(cameraNorthAngle('orbit',q,{x:0,z:-1},0)).toBeCloseTo(90);
  expect(cameraNorthAngle('orbit',q,{x:0,z:-1},30)).toBeCloseTo(120);
  expect(cameraNorthAngle('top',q,{x:1,z:0},0)).toBeCloseTo(-90);
 });
});
