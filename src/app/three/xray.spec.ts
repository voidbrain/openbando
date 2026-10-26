import {describe, expect, it} from 'vitest';
import * as THREE from 'three';
import {XRay} from './xray';
import type {SiteModel} from './site-model';

describe('x-ray during free inspection', () => {
  it('only fades an obstacle immediately in front of the camera and restores it after moving away', () => {
    const wall = new THREE.Mesh(new THREE.BoxGeometry(2, 2, 0.2), new THREE.MeshStandardMaterial());
    wall.position.z = -1; wall.updateMatrixWorld(true);
    const site = {occluders:[wall],trees:{dec:[],con:[],setHidden:()=>undefined}} as unknown as SiteModel;
    const camera = new THREE.PerspectiveCamera(); camera.updateMatrixWorld(true);
    const xray = new XRay(site); const original = wall.material;
    xray.step(1, camera, [], 1); xray.step(1, camera, [], 1);
    expect(wall.material).not.toBe(original);
    wall.position.z = -10; wall.updateMatrixWorld(true);
    xray.step(1, camera, [], 1); xray.step(1, camera, [], 1);
    expect(wall.material).toBe(original);
  });
});
