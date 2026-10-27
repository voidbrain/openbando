import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { setSiteOrigin } from '../core/constants';
import { emptySpec, sanitizeSpec } from '../core/site-spec';
import { shareCopy } from '../core/share';
import { toLocal } from '../core/geo';
import { FlightService } from './flight.service';
import { setHiddenSite, setTakeoff } from '../core/takeoff';
import { CalibrationStore } from '../state/calibration.store';
import { SiteLibraryService } from './site-library.service';
import { SiteService } from './site.service';

describe('SiteService: the pilot\'s path alignment', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => {
    setSiteOrigin({ lat: 0, lon: 0 });
    setTakeoff({ x: 0, z: 0 });
    setHiddenSite(false);
  });

  it('a pin placed on the path survives Save and further edits (it used to jump back)', () => {
    const lib = TestBed.inject(SiteLibraryService);
    const spec = emptySpec({ lat: 45.46, lon: 9.19 }, 'Test bando');
    spec.id = 'test-1';
    lib.save(spec);
    const site = TestBed.inject(SiteService);
    const cal = TestBed.inject(CalibrationStore);
    site.useStored('test-1');
    TestBed.tick();
    const base = cal.calibration();

    cal.shift(5, 3); // what placing a pin does
    TestBed.tick();
    const pinned = cal.calibration();
    expect(pinned).not.toEqual(base);

    site.saveDraft(); // re-applies the spec
    TestBed.tick();
    expect(cal.calibration()).toEqual(pinned);

    site.editor.commitSite((s) => {
      s.name = 'renamed';
    });
    site.applyDraft();
    TestBed.tick();
    expect(cal.calibration()).toEqual(pinned); // an ordinary edit does not move the path either

    // and it is remembered with the bando: another session loads the same alignment
    cal.apply(base); // (the live store of a fresh session starts from something else)
    site.useStored('test-1');
    TestBed.tick();
    expect(cal.calibration()).toEqual(pinned);
    expect(lib.load('test-1')!.calibration).toEqual(pinned);
  });
  it('preserves a hidden GPS reference and pin shift across saving and loading without sharing it', () => {
    const lib = TestBed.inject(SiteLibraryService);
    const spec = emptySpec({lat: 0, lon: 0}, 'Hidden test');
    spec.id = 'hidden-reference-test'; spec.privacy = 'hidden'; spec.droneStart = {x: 40, z: -50};
    lib.save(spec);
    const site = TestBed.inject(SiteService), cal = TestBed.inject(CalibrationStore), flights = TestBed.inject(FlightService);
    site.useStored(spec.id); TestBed.tick();
    const first = {lat: 45, lon: 9, alt: 0, t: 0}, second = {lat: 45.001, lon: 9, alt: 1, t: 1};
    flights.add('test', [first, second]); TestBed.tick();
    cal.shift(0, 10); TestBed.tick();
    const saved = cal.calibration(), expected = toLocal(second.lat, second.lon, saved);
    expect(saved.reference).toEqual({lat: first.lat, lon: first.lon});
    site.saveDraft(); TestBed.tick();
    const roundTrip = sanitizeSpec(JSON.parse(JSON.stringify(lib.load(spec.id))))!;
    expect(roundTrip.calibration).toEqual(saved);
    expect(shareCopy(roundTrip, 'hidden', null).calibration).toBeUndefined();
    cal.reset(); site.useStored(spec.id); TestBed.tick();
    expect(cal.calibration()).toEqual(saved);
    expect(toLocal(second.lat, second.lon, cal.calibration())).toEqual(expected);
  });

});
