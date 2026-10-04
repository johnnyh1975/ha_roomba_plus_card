/** v3.0 A5 — layout.ts: two-column threshold with hysteresis. */
import { describe, it, expect } from 'vitest';
import { isWideCard, WIDE_PX } from '../src/layout';

describe('isWideCard', () => {
  it('narrow below the threshold, wide at it', () => {
    expect(isWideCard(WIDE_PX - 1, false)).toBe(false);
    expect(isWideCard(WIDE_PX, false)).toBe(true);
  });
  it('stays wide within the band (no flip-flop on a scrollbar)', () => {
    expect(isWideCard(WIDE_PX - 10, true)).toBe(true);
    expect(isWideCard(WIDE_PX - 30, true)).toBe(false);
  });
  it('phone width is never wide', () => expect(isWideCard(390, true)).toBe(false));
});
