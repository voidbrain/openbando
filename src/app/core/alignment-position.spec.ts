import { describe, expect, it } from 'vitest';
import { alignmentPosition } from './alignment-position';

describe('alignment endpoint availability', () => {
  it('enables each pin only near its corresponding endpoint', () => {
    expect(alignmentPosition(true, 0, 20)).toEqual({ start: true, end: false });
    expect(alignmentPosition(true, 10, 20)).toEqual({ start: false, end: false });
    expect(alignmentPosition(true, 19.95, 20)).toEqual({ start: false, end: true });
  });
  it('disables both when no flight or duration is available', () => {
    expect(alignmentPosition(false, 0, 20)).toEqual({ start: false, end: false });
    expect(alignmentPosition(true, 0, NaN)).toEqual({ start: false, end: false });
    expect(alignmentPosition(true, 0, 0)).toEqual({ start: false, end: false });
  });
});
