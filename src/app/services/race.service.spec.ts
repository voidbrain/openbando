import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { RaceService } from './race.service';
import { FlightService } from './flight.service';
import { FrameLoopService } from './frame-loop.service';
import { PlaybackService } from './playback.service';
import { setSiteOrigin, DEFAULT_SITE_ORIGIN } from '../core/constants';
import { setAutoAlign, setActiveGround } from '../core/takeoff';
import { racePose } from '../core/racing/race';
describe('racing across loaded/shared flights', () => {
  beforeEach(() => {
    localStorage.clear();
    setSiteOrigin({ lat: 45.4642, lon: 9.19 });
    setAutoAlign(false);
    setActiveGround(null);
  });
  afterEach(() => {
    TestBed.resetTestingModule();
    setSiteOrigin(DEFAULT_SITE_ORIGIN);
  });
  it('replays two pilots together without moving the single-flight clock and round-trips their shared coordinates', () => {
    const race = TestBed.inject(RaceService),
      flights = TestBed.inject(FlightService),
      playback = TestBed.inject(PlaybackService);
    TestBed.tick();
    const a = flights.add('A', [
      { lat: 45.4642, lon: 9.19, alt: 0, t: 0 },
      { lat: 45.4642, lon: 9.1901, alt: 2, t: 2 },
    ]);
    const b = flights.add('B', [
      { lat: 45.4642, lon: 9.19, alt: 0, t: 0 },
      { lat: 45.4642, lon: 9.1901, alt: 2, t: 2 },
    ]);
    TestBed.tick();
    race.set(b.id, { offset: 1, closed: true });
    race.useGate(a.id);
    race.start();
    playback.time = 0.5;
    TestBed.inject(FrameLoopService).runOnce(1, 1, 0);
    expect(race.time).toBe(1);
    expect(playback.time).toBe(0.5);
    expect(racePose(race.tracks()[0]!, race.time)!.x).toBeGreaterThan(
      racePose(race.tracks()[1]!, race.time)!.x,
    );
    const pack = JSON.parse(JSON.stringify(race.pack()));
    flights.clear();
    race.importPack(pack);
    expect(race.tracks()).toHaveLength(2);
    expect(race.tracks()[1]!.offset).toBe(1);
    expect(race.tracks()[0]!.points[1].x).toBe(a.loc[1]!.x);
    expect(() => race.importPack({ ...pack, frame: 'race-wrong:1000' })).toThrow();
    expect(race.tracks()).toHaveLength(2);
  });
  it('keeps two live feeds independent, hides stale ghosts and retains recordings on disconnect', () => {
    const race = TestBed.inject(RaceService);
    TestBed.tick();
    for (const id of ['a', 'b']) {
      race.livePoint(id, id, { x: 0, y: 1, z: 0, t: 0 });
      race.livePoint(id, id, { x: id === 'a' ? 5 : 10, y: 1, z: 0, t: 1 });
    }
    expect(race.tracks().map((t) => racePose(t, 0)!.x)).toEqual([5, 10]);
    expect(race.stale('a', performance.now() + 6000)).toBe(true);
    race.finishLive('a');
    expect(race.tracks().find((t) => t.id === 'a')!.live).toBe(false);
    expect(race.tracks()).toHaveLength(2);
    race.siteKey.set('race-next');
    TestBed.tick();
    expect(race.tracks()).toHaveLength(0);
  });
});
