/**
 * A5 (v2.1.0) — mission-completed event reload filter.
 */
import { describe, it, expect } from 'vitest';
import { shouldReloadForEvent } from '../src/mission-events';

describe('shouldReloadForEvent', () => {
  it('reloads when both entry_ids match (it is us)', () => {
    expect(shouldReloadForEvent('entry_1', 'entry_1')).toBe(true);
  });

  it('skips when entry_ids differ (another robot)', () => {
    expect(shouldReloadForEvent('entry_1', 'entry_2')).toBe(false);
  });

  it('reloads when our entry_id is unknown (conservative, single-robot)', () => {
    expect(shouldReloadForEvent(null, 'entry_2')).toBe(true);
    expect(shouldReloadForEvent(undefined, 'entry_2')).toBe(true);
  });

  it('reloads when the event entry_id is missing', () => {
    expect(shouldReloadForEvent('entry_1', undefined)).toBe(true);
    expect(shouldReloadForEvent('entry_1', null)).toBe(true);
  });

  it('reloads when both are unknown', () => {
    expect(shouldReloadForEvent(null, null)).toBe(true);
  });
});
