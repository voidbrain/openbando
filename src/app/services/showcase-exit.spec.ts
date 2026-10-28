import {TestBed} from '@angular/core/testing';
import * as THREE from 'three';
import {emptySpec, type BuildingSpec} from '../core/site-spec';
import {SceneHost} from '../three/scene-host';
import {buildSiteFromSpec} from '../three/site-model';
import {LayoutStore} from '../state/layout.store';
import {ViewStore} from '../state/view.store';
import {SceneService} from './scene.service';
import {SiteService} from './site.service';
import {SiteLibraryService} from './site-library.service';
import {TourService} from './tour.service';
import {FlightService} from './flight.service';

it('returns from showcase to an empty overview, then loads a visible stored model without following the old path', async () => {
  localStorage.clear(); TestBed.resetTestingModule();
  const scene = TestBed.inject(SceneService), site = TestBed.inject(SiteService);
  const view = TestBed.inject(ViewStore), layout = TestBed.inject(LayoutStore);
  const flights = TestBed.inject(FlightService), library = TestBed.inject(SiteLibraryService);
  // Exercise the real SceneHost replacement and visibility methods without a WebGL context.
  const host = Object.create(SceneHost.prototype) as SceneHost;
  Object.assign(host, {scene: new THREE.Scene(), site: buildSiteFromSpec(emptySpec()), voidGrid: new THREE.Group(), paths: {group: new THREE.Group(), rebuild: () => undefined}});
  scene.host = host;
  try {
    const flight = flights.add('existing flight', [{lat: 1, lon: 1, alt: 0, t: 0}, {lat: 1.001, lon: 1, alt: 10, t: 1}]);
    view.setMainSource('video'); view.setCameraView('fpv');
    const tour = TestBed.inject(TourService);
    await tour.playTour({id: 'exit-test', title: 'Test', about: '', snippets: [], returnToWelcome: true});
    TestBed.tick();
    expect(tour.welcomeSeen()).toBe(true);
    expect(JSON.parse(localStorage.getItem('openbando-welcome')!)).toEqual({completed: true});
    expect(layout.panels().welcome.visible).toBe(true);
    expect(host.paths.group.visible).toBe(false);
    // Even a same-frame rebuild cannot leak the path past the render boundary.
    host.paths.group.visible = true;
    Object.assign(host, {resizeMain: () => undefined, renderMain: () => expect(host.paths.group.visible).toBe(false)});
    Reflect.get(scene, 'renderAll').call(scene, 0);
    expect(host.paths.group.visible).toBe(false);
    expect(host.site.group.visible).toBe(false);
    expect(view.mainSource()).toBe('3d');
    expect(view.cameraView()).toBe('orbit');
    expect(view.orbitFollow()).toBe(false);
    expect(flights.active).toBe(flight);
    const b: BuildingSpec = {id: 'shed', name: 'Shed', pos: {x: 0, z: 0}, rotDeg: 0, length: 10, width: 8,
      levels: [{baseY: 0, height: 4, sides: {n: true, s: true, e: true, w: true}, doors: {}, partitions: [], roof: 'flat', roofRise: 0}]};
    const next = emptySpec(); next.id = 'after-tour'; next.buildings = [b]; library.save(next);
    layout.setVisible('welcome', false);
    expect(site.useStored(next.id)).toBe(true); TestBed.tick();
    expect(host.site.group.visible).toBe(true);
    expect(host.site.group.children.length).toBeGreaterThan(0);
    expect(site.active().id).toBe(next.id);
    expect(view.orbitFollow()).toBe(false);
    expect(view.cameraView()).toBe('orbit');
  } finally { scene.host = null; TestBed.resetTestingModule(); }
});
