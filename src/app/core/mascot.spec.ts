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
  it('runs in place while the grounded drone shifts left, then takes off and exits right', () => {
    expect(mascotFrame(4900).droneX).toBeLessThan(mascotFrame(2100).droneX);
    expect(mascotFrame(4900).droneY).toBe(132);
    expect(mascotFrame(11000).droneY).toBeLessThan(mascotFrame(10100).droneY);
    expect(mascotFrame(15200).droneX).toBeGreaterThan(320);
    expect(mascotFrame(11900).y).toBe(-18);
    expect(mascotFrame(13000).y).toBe(0);
  });
});
