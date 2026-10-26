import { describe, expect, it } from 'vitest';
import { xraySubject } from './xray-policy';

describe('x-ray tracked subject', () => {
  it('does not fade a model while orbiting a parked drone or panning away', () => {
    expect(xraySubject('orbit', true, false, false, false)).toBeNull();
    expect(xraySubject('orbit', false, false, true, false)).toBeNull();
    expect(xraySubject('orbit', true, true, false, true)).toBeNull();
  });
  it('tracks the active flight, rather than also fading for the parked simulator', () => {
    expect(xraySubject('orbit', true, false, false, true)).toBe('replay');
    expect(xraySubject('chase', true, false, true, false)).toBe('simulator');
    expect(xraySubject('fpv', true, false, true, false)).toBeNull();
  });
});
