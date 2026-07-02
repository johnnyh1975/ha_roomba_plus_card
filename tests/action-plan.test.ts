/**
 * R3 — action-plan tests.
 */
import { describe, it, expect } from 'vitest';
import { planAction, passesOption, VACUUM_ACTION_MAP } from '../src/action-plan';

describe('planAction — special cases', () => {
  it('clean-selected', () => {
    expect(planAction('clean-selected')).toEqual({ kind: 'clean-selected' });
  });
  it('repeat-last', () => {
    expect(planAction('repeat-last')).toEqual({ kind: 'repeat-last' });
  });
  it('toggle-room-picker', () => {
    expect(planAction('toggle-room-picker')).toEqual({ kind: 'toggle-room-picker' });
  });
  it('unknown action → noop', () => {
    expect(planAction('frobnicate')).toEqual({ kind: 'noop' });
    expect(planAction('')).toEqual({ kind: 'noop' });
  });
});

describe('planAction — vacuum actions', () => {
  it('maps start/pause/return_home/stop to their services without pulse', () => {
    expect(planAction('start')).toEqual({ kind: 'vacuum', domain: 'vacuum', service: 'start', action: 'start', pulse: false });
    expect(planAction('pause')).toMatchObject({ service: 'pause', pulse: false });
    expect(planAction('return_home')).toMatchObject({ service: 'return_to_base', pulse: false });
    expect(planAction('stop')).toMatchObject({ service: 'stop', pulse: false });
  });

  it('resume and retry both map to vacuum.start', () => {
    expect(planAction('resume')).toMatchObject({ domain: 'vacuum', service: 'start' });
    expect(planAction('retry')).toMatchObject({ domain: 'vacuum', service: 'start' });
  });

  it('locate is the only pulse action', () => {
    expect(planAction('locate')).toEqual({ kind: 'vacuum', domain: 'vacuum', service: 'locate', action: 'locate', pulse: true });
  });

  it('VACUUM_ACTION_MAP has exactly the expected keys', () => {
    expect(Object.keys(VACUUM_ACTION_MAP).sort()).toEqual(
      ['locate', 'pause', 'resume', 'retry', 'return_home', 'start', 'stop'].sort(),
    );
  });
});

describe('passesOption', () => {
  const chipToOption = { Single: 'one', Double: 'two' };

  it('returns null for Auto', () => {
    expect(passesOption('Auto', true, chipToOption)).toBeNull();
  });
  it('returns null when no passes entity exists', () => {
    expect(passesOption('Double', false, chipToOption)).toBeNull();
  });
  it('maps a chip label to its option', () => {
    expect(passesOption('Double', true, chipToOption)).toBe('two');
  });
  it('falls back to the raw label when not in the map', () => {
    expect(passesOption('Triple', true, chipToOption)).toBe('Triple');
  });
});
