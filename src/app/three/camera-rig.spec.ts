import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import { Quat, Vec3 } from '../core/math3d';
import { CAMERA_CLEARANCE, createOrbitState, orbitFromCamera, orbitPan, placeCamera } from './camera-rig';

const opts = { orbitFollow: true, calRotDeg: 0, fpvTiltDeg: 0 };

describe('leaving the chase camera to look around', () => {
  it('the orbit starts from exactly where the chase camera was', () => {
    const drone = { p: new Vec3(12, 5, -30), q: new Quat() };
    const cam = new THREE.PerspectiveCamera();
    const at = new THREE.Vector3(18, 7.5, -24);
    const st = createOrbitState();
    st.manual = true;
    orbitFromCamera(st, at, drone.p);
    expect(st.manual).toBe(false); // it follows the drone again
    placeCamera(cam, 'orbit', st, drone, opts, 0);
    expect(cam.position.distanceTo(at)).toBeLessThan(1e-6);
  });

  it('a pan stops the follow; handing it back glides to the drone instead of jumping', () => {
    const drone = { p: new Vec3(0, 0, 0), q: new Quat() };
    const cam = new THREE.PerspectiveCamera();
    const st = createOrbitState();
    st.tg.set(0, 0, 0);
    orbitPan(st, 300, 0, 'orbit', 0);
    const away = st.tg.clone();
    placeCamera(cam, 'orbit', st, drone, opts, 1 / 60);
    expect(st.tg.distanceTo(away)).toBe(0); // panned: not pulled back
    st.manual = false;
    placeCamera(cam, 'orbit', st, drone, opts, 1 / 60);
    const d = st.tg.length();
    expect(d).toBeGreaterThan(0);
    expect(d).toBeLessThan(away.length()); // on its way back, not there in one frame
  });
});

describe('the camera never goes into the ground (B-037)', () => {
  // a hill 20 m high east of x = 10, flat ground before it
  const hill = (x: number): number => (x > 10 ? 20 : 0);
  const withGround = { ...opts, groundAt: (x: number) => hill(x) };

  it('an orbit looking at the valley from behind the hill rises over it, still aimed at the target', () => {
    const drone = { p: new Vec3(0, 1, 0), q: new Quat() };
    const cam = new THREE.PerspectiveCamera();
    const st = createOrbitState();
    st.manual = true;
    orbitFromCamera(st, new THREE.Vector3(30, 5, 0), drone.p); // the camera would be 15 m inside the hill
    st.manual = true;
    placeCamera(cam, 'orbit', st, drone, withGround, 0);
    expect(cam.position.y).toBeCloseTo(20 + CAMERA_CLEARANCE, 6);
    const dir = new THREE.Vector3();
    cam.getWorldDirection(dir);
    expect(dir.dot(new THREE.Vector3().subVectors(st.tg, cam.position).normalize())).toBeGreaterThan(0.999);
    // on flat ground nothing changes
    placeCamera(cam, 'orbit', st, drone, opts, 0);
    expect(cam.position.y).toBeCloseTo(5, 6);
  });

  it('the chase camera behind the drone stays above a slope', () => {
    const drone = { p: new Vec3(8, 1, 0), q: new Quat().setFromEuler(0, Math.PI / 2, 0) }; // facing west: the camera sits east, on the hill
    const cam = new THREE.PerspectiveCamera();
    cam.position.set(14, 3.5, 0);
    placeCamera(cam, 'chase', createOrbitState(), drone, withGround, 1);
    expect(cam.position.y).toBeGreaterThanOrEqual(hill(cam.position.x) + CAMERA_CLEARANCE - 1e-9);
  });
});
