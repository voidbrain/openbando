import { describe, expect, it } from 'vitest';
import { mascotFrame, MASCOT_DURATION, MASCOT_POSES } from './mascot';
import timeline from '../../../public/mascot/timeline.json';
describe('mascot timeline', () => {
  it('covers the whole loop exactly, with valid pose assets', () => {
    let end = 0;
    for (const p of timeline.phases) {
      expect(p.start).toBe(end);
      expect(p.end).toBeGreaterThan(p.start);
      for (const id of p.poses) expect(MASCOT_POSES[id]).toBeTruthy();
      end = p.end;
    }
    expect(end).toBe(MASCOT_DURATION);
    expect(mascotFrame(MASCOT_DURATION)).toEqual(mascotFrame(0));
  });
  it('searches, runs with the drone, sits perplexed and watches it take off', () => {
    expect(mascotFrame(0).droneVisible).toBe(false);
    expect(mascotFrame(3000).phase).toBe('run');
    expect(mascotFrame(3000).droneVisible).toBe(true);
    expect(mascotFrame(4300).droneX).toBeLessThan(mascotFrame(2600).droneX);
    expect(mascotFrame(8000).pose).toBe(16);
    const takeoff=timeline.phases.find(p=>p.name==='takeoff')!;
    const flight=timeline.phases.find(p=>p.name==='fly-out')!;
    expect(mascotFrame(takeoff.start).propellersSpinning).toBe(true);
    expect(mascotFrame(flight.start).droneRight).toBe(true);
    expect(mascotFrame(3000).propellersSpinning).toBe(false);
    expect(timeline.phases.map(p=>p.name)).toEqual(expect.arrayContaining(['takeoff','rise','higher','look-up','jump','victory','fly-out']));
  });
});
