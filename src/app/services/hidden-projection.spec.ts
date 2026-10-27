import { TestBed } from '@angular/core/testing';
import { setSiteOrigin } from '../core/constants';
import { toLocal } from '../core/geo';
import { setActiveGround, setAutoAlign, setHiddenSite, setTakeoff } from '../core/takeoff';
import { CalibrationStore } from '../state/calibration.store';
import { FlightService } from './flight.service';

describe('hidden-site GPS alignment', () => {
  beforeEach(() => {
    localStorage.clear(); TestBed.resetTestingModule(); setSiteOrigin({lat: 0, lon: 0});
    setTakeoff({x: 40, z: -50}); setHiddenSite(true); setAutoAlign(true); setActiveGround(null);
  });
  afterEach(() => { TestBed.resetTestingModule(); setHiddenSite(false); setAutoAlign(false); setTakeoff({x: 0, z: 0}); });
  it('aligns the first flight and keeps other flights and live positions in the same frame', () => {
    const service = TestBed.inject(FlightService), calibration = TestBed.inject(CalibrationStore);
    const points = [{lat:45,lon:9,alt:0,t:0}, {lat:45.001,lon:9,alt:2,t:1}];
    const a = service.add('A', points), b = service.add('B', points);
    TestBed.tick();
    expect(a.loc[0]!.x).toBeCloseTo(40, 4);
    expect(a.loc[0]!.z).toBeCloseTo(-50, 4);
    expect(a.loc[1]!.x).toBeCloseTo(40, 4);
    expect(a.loc[1]!.z).toBeCloseTo(-161.132, 3);
    expect(b.loc[1]!.x).toBeCloseTo(a.loc[1]!.x, 5);
    expect(b.loc[1]!.z).toBeCloseTo(a.loc[1]!.z, 5);
    const live = toLocal(points[1]!.lat, points[1]!.lon, calibration.calibration());
    expect(live[0]).toBeCloseTo(a.loc[1]!.x, 5);
    expect(live[1]).toBeCloseTo(a.loc[1]!.z, 5);
  });
});
