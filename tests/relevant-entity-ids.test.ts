/**
 * Render guard watch list (relevant-entity-ids.ts).
 *
 * v3.0: the list is every entity of the robot (registry device, or the id
 * prefix without a registry) instead of a hand-maintained catalogue of ~100
 * ids — which had gaps more than once (v2.0.1, v2.5.0) and whose replica in
 * this file had drifted from production (v2.5.0).
 */
import { describe, it, expect } from 'vitest';
import { relevantEntityIds } from '../src/relevant-entity-ids';
import { makeHass, st } from './helpers';
import type { HomeAssistant } from '../src/types';

function withRegistry(hass: HomeAssistant, rows: Array<[string, string | null, string | null]>): HomeAssistant {
  // [entity_id, device_id, translation_key]
  hass.entities = Object.fromEntries(rows.map(([id, dev, tk]) =>
    [id, { entity_id: id, device_id: dev, platform: 'roomba_plus', translation_key: tk }]));
  return hass;
}

describe('relevantEntityIds() — registry mode (v3.0)', () => {
  const hass = withRegistry(makeHass({
    'vacuum.roomba': st('docked'),
    'sensor.roomba_phase': st('charge'),
    'sensor.my_renamed_readiness': st('ready'),
    'device_tracker.roomba': st('Docked'),
    'sensor.other_phase': st('run'),
  }), [
    ['vacuum.roomba', 'dev1', null],
    ['sensor.roomba_phase', 'dev1', 'phase'],
    ['sensor.my_renamed_readiness', 'dev1', 'readiness'],
    ['device_tracker.roomba', 'dev1', 'position'],
    ['sensor.other_phase', 'dev2', 'phase'],
  ]);
  const ids = relevantEntityIds(hass, 'roomba', 'vacuum.roomba');

  it('watches every entity of the robot\'s device', () => {
    expect(ids).toContain('sensor.roomba_phase');
    expect(ids).toContain('device_tracker.roomba');
  });
  it('watches a user-renamed entity (found by device, not by name)', () =>
    expect(ids).toContain('sensor.my_renamed_readiness'));
  it('does not watch another robot\'s entities', () =>
    expect(ids).not.toContain('sensor.other_phase'));
  it('returns no duplicates', () => expect(new Set(ids).size).toBe(ids.length));
});

describe('relevantEntityIds() — fallback without registry', () => {
  const hass = makeHass({
    'vacuum.roomba': st('docked'),
    'sensor.roomba_area_cleaned_today': st('12'),
    'select.roomba_cloud_zone_p1': st('Kitchen'),
    'device_tracker.roomba': st('Docked'),
    'sensor.roomba_2_phase': st('run'),
  });
  const ids = relevantEntityIds(hass, 'roomba', 'vacuum.roomba');

  it('watches every entity with the robot\'s prefix, incl. families and the tracker', () => {
    expect(ids).toContain('sensor.roomba_area_cleaned_today');
    expect(ids).toContain('select.roomba_cloud_zone_p1');
    expect(ids).toContain('device_tracker.roomba');
  });
});

describe('relevantEntityIds() — B1: active robot, helper', () => {
  it('watches the ACTIVE robot first, not config.entity', () => {
    const ids = relevantEntityIds(makeHass({ 'vacuum.roomba_upstairs': st('docked') }), 'roomba_upstairs', 'vacuum.roomba_upstairs');
    expect(ids[0]).toBe('vacuum.roomba_upstairs');
    expect(ids).not.toContain('vacuum.roomba');
  });
  it('includes the robot selector helper when configured', () =>
    expect(relevantEntityIds(makeHass(), 'roomba', 'vacuum.roomba', 'input_text.active_roomba')).toContain('input_text.active_roomba'));
  it('without hass: just the vacuum (and helper)', () =>
    expect(relevantEntityIds(undefined, 'roomba', 'vacuum.roomba')).toEqual(['vacuum.roomba']));
});

import { anyEntityChanged } from '../src/relevant-entity-ids';
describe('anyEntityChanged() — v3.0', () => {
  const at = (state: string, changed: string, updated: string, attributes = {}) =>
    ({ entity_id: 'x', state, attributes, last_changed: changed, last_updated: updated });
  it('an attribute-only change (last_updated moves) counts', () => {
    const a = makeHass(); a.states['vacuum.r'] = at('docked', 't1', 't1');
    const b = makeHass(); b.states['vacuum.r'] = at('docked', 't1', 't2', { dock_activity: 'pad_drying' });
    expect(anyEntityChanged(a, b, ['vacuum.r'])).toBe(true);
  });
  it('nothing moved → false (negative control)', () => {
    const a = makeHass(); a.states['vacuum.r'] = at('docked', 't1', 't1');
    const b = makeHass(); b.states['vacuum.r'] = at('docked', 't1', 't1');
    expect(anyEntityChanged(a, b, ['vacuum.r'])).toBe(false);
  });
  it('entity appearing counts', () => {
    const a = makeHass(); const b = makeHass(); b.states['sensor.n'] = at('1', 't', 't');
    expect(anyEntityChanged(a, b, ['sensor.n'])).toBe(true);
  });
});
