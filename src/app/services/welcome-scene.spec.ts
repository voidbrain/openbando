import { TestBed } from '@angular/core/testing';
import * as THREE from 'three';
import { LayoutStore } from '../state/layout.store';
import type { SceneHost } from '../three/scene-host';
import { SceneService } from './scene.service';
import { FlightService } from './flight.service';

describe('Welcome background after replay', () => {
  beforeEach(() => { localStorage.clear(); TestBed.resetTestingModule(); });
  it('hides the existing flight path and replay marker without discarding the flight', () => {
    const layout = TestBed.inject(LayoutStore), scene = TestBed.inject(SceneService);
    const flights = TestBed.inject(FlightService);
    const flight = flights.add('test', [{lat: 1, lon: 1, alt: 0, t: 0}, {lat: 1.001, lon: 1, alt: 1, t: 1}]);
    const group = new THREE.Group();
    scene.host = {paths: {group}} as unknown as SceneHost;
    layout.setVisible('welcome', false); TestBed.tick();
    expect(group.visible).toBe(true);
    expect(scene.rigContext().flight).toBe(flight);
    layout.setVisible('welcome', true); TestBed.tick();
    expect(group.visible).toBe(false);
    expect(scene.rigContext().flight).toBeNull();
    expect(scene.followingReplay()).toBe(false);
    expect(flights.active).toBe(flight);
    layout.setVisible('welcome', false); TestBed.tick();
    expect(group.visible).toBe(true);
    expect(scene.rigContext().flight).toBe(flight);
    scene.host = null;
  });
});
