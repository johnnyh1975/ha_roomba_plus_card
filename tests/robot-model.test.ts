/** v3.0 A2 — robot-model.ts: generation-neutral roles from Classic and Prime. */
import { describe, it, expect } from 'vitest';
import {
  statusRole, errorRole, startCheckRole, roomsRole, primePartsRole, primeDockRole, robotModel,
} from '../src/robot-model';
import { classicI7, primeCombo } from './fixtures/robots';

describe('statusRole', () => {
  it('Classic: phase from the phase sensor, no dock activity', () => {
    const s = statusRole(classicI7(), 'i7');
    expect(s.phase).toBe('charge');
    expect(s.phaseId).toBe('sensor.i7_phase');
    expect(s.dockActivityPhase).toBeNull();
    expect(s.offline).toBe(false);
  });
  it('Prime: dock activity maps onto the matching phase slug', () => {
    const hass = primeCombo([['vacuum.combo', null, 'docked', { friendly_name: 'Combo', dock_activity: 'pad_washing' }]]);
    expect(statusRole(hass, 'combo').dockActivityPhase).toBe('washing_pad');
  });
  it('Prime: unknown dock activity yields null, not a raw slug', () => {
    const hass = primeCombo([['vacuum.combo', null, 'docked', { friendly_name: 'Combo', dock_activity: 'teleporting' }]]);
    expect(statusRole(hass, 'combo').dockActivityPhase).toBeNull();
  });
  it('Prime: cleaning mode and its translating sensor', () => {
    const hass = primeCombo([
      ['vacuum.combo', null, 'cleaning', { friendly_name: 'Combo', cleaning_mode: 'vacuuming_and_mopping' }],
      ['sensor.combo_cleaning_mode', 'prime_cleaning_mode', 'vacuuming_and_mopping'],
    ]);
    const s = statusRole(hass, 'combo');
    expect(s.cleaningMode).toBe('vacuuming_and_mopping');
    expect(s.cleaningModeId).toBe('sensor.combo_cleaning_mode');
  });
  it('Prime: connected off → offline', () => {
    const hass = primeCombo([['binary_sensor.combo_connected', 'connected', 'off']]);
    expect(statusRole(hass, 'combo').offline).toBe(true);
    expect(statusRole(primeCombo(), 'combo').offline).toBe(false);
  });
  it('Classic: connected off does NOT mean offline (it is the local MQTT link)', () => {
    const hass = classicI7([['binary_sensor.i7_connected', 'connected', 'off']]);
    expect(statusRole(hass, 'i7').offline).toBe(false);
  });
});

describe('errorRole', () => {
  it('no error on either generation', () => {
    expect(errorRole(classicI7(), 'i7').active).toBe(false);
    expect(errorRole(primeCombo(), 'combo').active).toBe(false);
  });
  it('Prime: title, description, severity, available modes from the error sensor', () => {
    const hass = primeCombo([['sensor.combo_prime_error', 'error', 'Error 18', {
      error_code: 18, error_title: 'Docking issue', error_description: 'Clear the area around the dock.',
      severity: 'stuck', partially_operable: true, available_modes: ['vacuum'],
    }]]);
    const e = errorRole(hass, 'combo');
    expect(e).toMatchObject({
      active: true, code: '18', title: 'Docking issue', description: 'Clear the area around the dock.',
      severity: 'stuck', partiallyOperable: true, availableModes: ['vacuum'], action: null,
    });
  });
  it('Prime: attributes alone (state unknown) are not an active error', () => {
    const hass = primeCombo([['sensor.combo_prime_error', 'error', 'unknown', { error_code: 18, error_title: 'stale' }]]);
    expect(errorRole(hass, 'combo').active).toBe(false);
  });
  it('Classic: live error from the vacuum, words from last_error_code', () => {
    const hass = classicI7([
      ['vacuum.i7', null, 'error', { friendly_name: 'i7', error_code: 15 }],
      ['sensor.i7_last_error_code', 'last_error_code', '15', { description: 'Reboot required', action: 'Restart the robot' }],
    ]);
    expect(errorRole(hass, 'i7')).toMatchObject({ active: true, code: '15', title: 'Reboot required', action: 'Restart the robot' });
  });
  it('Classic: a stored last error without a live one is not active', () => {
    const hass = classicI7([['sensor.i7_last_error_code', 'last_error_code', '15', { description: 'old' }]]);
    expect(errorRole(hass, 'i7').active).toBe(false);
  });
  it('Classic: stale vacuum error_code after docking is NOT live (error sensor suppresses it)', () => {
    // The firmware keeps cleanMissionStatus.error after a failed run; the
    // `error` sensor reads None while the robot rests (sensor_helpers.py:150).
    const hass = classicI7([
      ['vacuum.i7', null, 'docked', { friendly_name: 'i7', error_code: 1, error: 'Left wheel off floor' }],
      ['sensor.i7_error', 'error', 'unknown'],
    ]);
    expect(errorRole(hass, 'i7').active).toBe(false);
  });
  it('Classic: error sensor live → active, its label as title when last_error_code lags', () => {
    const hass = classicI7([
      ['vacuum.i7', null, 'paused', { friendly_name: 'i7', error_code: 7 }],
      ['sensor.i7_error', 'error', 'Wheel stuck'],
      ['sensor.i7_last_error_code', 'last_error_code', '15', { description: 'older one' }],
    ]);
    expect(errorRole(hass, 'i7')).toMatchObject({ active: true, code: '7', title: 'Wheel stuck' });
  });
  it('Classic without an error sensor (older install): vacuum attribute decides', () => {
    const hass = classicI7([['vacuum.i7', null, 'docked', { friendly_name: 'i7', error_code: 7, error: 'Wheel stuck' }]]);
    delete hass.states['sensor.i7_error']; delete hass.entities!['sensor.i7_error'];
    expect(errorRole(hass, 'i7')).toMatchObject({ active: true, code: '7', title: 'Wheel stuck' });
  });
});

describe('startCheckRole', () => {
  it('Classic has no start check role', () => expect(startCheckRole(classicI7(), 'i7')).toBeNull());
  it('Prime not blocked', () => expect(startCheckRole(primeCombo(), 'combo')).toMatchObject({ blocked: false }));
  it('Prime blocked with reason and remaining modes', () => {
    const hass = primeCombo([['binary_sensor.combo_prime_start_blocked', 'prime_start_blocked', 'on',
      { blocked_reason: 'Mop pad missing', available_modes: ['vacuum'] }]]);
    expect(startCheckRole(hass, 'combo')).toEqual({ blocked: true, reason: 'Mop pad missing', availableModes: ['vacuum'] });
  });
  it('unavailable sensor → null (no false "ready")', () => {
    const hass = primeCombo([['binary_sensor.combo_prime_start_blocked', 'prime_start_blocked', 'unavailable']]);
    expect(startCheckRole(hass, 'combo')).toBeNull();
  });
});

describe('roomsRole', () => {
  it('Classic: every option — clean_room takes rooms and zones (zid)', () => {
    const hass = classicI7([['select.i7_cloud_zone_abc', 'cloud_smart_zone_select', 'Kitchen', {
      options: ['Kitchen', 'Hall', 'Rug zone'], is_active_map: true,
      region_icons: { Kitchen: 'mdi:fridge', Hall: 'mdi:door' }, region_areas_m2: { Kitchen: 12 },
    }]]);
    const r = roomsRole(hass, 'i7');
    expect(r.selectId).toBe('select.i7_cloud_zone_abc');
    expect(r.rooms).toEqual(['Kitchen', 'Hall', 'Rug zone']);
    expect(r.areasM2).toEqual({ Kitchen: 12 });
  });
  it('Classic local select without icons: all options are rooms', () => {
    const hass = classicI7([['select.i7_smart_zone_select', 'smart_zone_select', 'A', { options: ['A', 'B'] }]]);
    expect(roomsRole(hass, 'i7').rooms).toEqual(['A', 'B']);
  });
  it('Prime: rooms of OTHER floors are kept; zones on the shown floor are dropped', () => {
    const hass = primeCombo([
      ['select.combo_prime_zone_select', 'prime_zone_select', 'Kitchen', {
        options: ['Kitchen', 'Couch zone', 'Bedroom', 'Attic zone'],
        segment_map: { Kitchen: 'Ground', 'Couch zone': 'Ground', Bedroom: 'Upstairs', 'Attic zone': 'Upstairs' },
      }],
      ['image.combo_rooms_map', 'rooms_map', 'idle', { rooms: { '1': { name: 'Kitchen' } } }],
    ]);
    // 'Attic zone' cannot be told apart from a room (other floor) — kept.
    expect(roomsRole(hass, 'combo').rooms).toEqual(['Kitchen', 'Bedroom', 'Attic zone']);
  });
  it('Prime: prime_zone_select options ∩ rooms map names, plus floors', () => {
    const hass = primeCombo([
      ['select.combo_prime_zone_select', 'prime_zone_select', 'Kitchen', {
        options: ['Kitchen', 'Bath', 'Couch zone'], segment_map: { Kitchen: 'Ground', Bath: 'Upstairs' },
        robot_on_map: 'Ground', robot_map_is_live: true,
      }],
      ['image.combo_rooms_map', 'rooms_map', 'idle', { rooms: { '1': { name: 'Kitchen' }, '2': { name: 'Bath' } } }],
    ]);
    const r = roomsRole(hass, 'combo');
    expect(r.rooms).toEqual(['Kitchen', 'Bath']);
    expect(r.floors).toEqual({ Kitchen: 'Ground', Bath: 'Upstairs' });
    expect(r.robotFloor).toBe('Ground');
    expect(r.robotFloorIsLive).toBe(true);
  });
  it('Prime without rooms map: options as they are', () =>
    expect(roomsRole(primeCombo(), 'combo').rooms).toEqual(['Kitchen', 'Bath']));
  it('Prime unavailable select → empty', () => {
    const hass = primeCombo([['select.combo_prime_zone_select', 'prime_zone_select', 'unavailable', {}]]);
    expect(roomsRole(hass, 'combo')).toMatchObject({ selectId: null, rooms: [] });
  });
});

describe('primePartsRole', () => {
  const parts = primeCombo([
    ['sensor.combo_prime_part_filter', 'prime_part_filter', '30', {
      friendly_name: 'Combo Filter', unit_of_measurement: 'h', category: 'replacement', count_used: 90, raw_count_remaining: 30,
    }],
    ['sensor.combo_prime_part_dock_clean', 'prime_part_dock_clean', '12', {
      friendly_name: 'Combo Dock cleaning', unit_of_measurement: 'd', category: 'maintenance', count_used: 12, raw_count_remaining: 18,
    }],
    ['sensor.combo_prime_part_gone', 'prime_part_gone', 'unavailable', {}],
  ]);
  const list = primePartsRole(parts, 'combo');

  it('lists live parts sorted by label, device name stripped', () =>
    expect(list.map(p => p.label)).toEqual(['Dock cleaning', 'Filter']));
  it('replacement part: percentage of life left', () =>
    expect(list.find(p => p.label === 'Filter')).toMatchObject({ remaining: 30, unit: 'h', pct: 25 }));
  it('maintenance part: no percentage (counts since last done)', () =>
    expect(list.find(p => p.label === 'Dock cleaning')?.pct).toBeNull());
  it('Classic: none', () => expect(primePartsRole(classicI7(), 'i7')).toEqual([]));
});

describe('primeDockRole', () => {
  it('Classic: null', () => expect(primeDockRole(classicI7(), 'i7')).toBeNull());
  it('Prime: collects what the dock offers', () => {
    const hass = primeCombo([
      ['sensor.combo_prime_dock_status', 'prime_dock_status', 'idle'],
      ['button.combo_prime_wash_pad', 'prime_wash_pad', 'unknown'],
      ['switch.combo_prime_pad_dry', 'prime_pad_dry', 'off'],
    ]);
    expect(primeDockRole(hass, 'combo')).toMatchObject({
      statusId: 'sensor.combo_prime_dock_status',
      tankLevelId: 'sensor.combo_prime_dock_tank_level',
      emptyBinButton: 'button.combo_prime_empty_bin',
      washPadButton: 'button.combo_prime_wash_pad',
      padDrySwitch: 'switch.combo_prime_pad_dry',
      padWashId: null,
    });
  });
  it('unavailable entities are left out', () => {
    const hass = primeCombo([['button.combo_prime_empty_bin', 'prime_empty_bin', 'unavailable']]);
    expect(primeDockRole(hass, 'combo')?.emptyBinButton).toBeNull();
  });
});

describe('robotModel', () => {
  it('aggregates per generation', () => {
    const c = robotModel(classicI7(), 'i7');
    const p = robotModel(primeCombo(), 'combo');
    expect(c.generation).toBe('classic');
    expect(p.generation).toBe('prime');
    expect(c.favorites.map(f => f.name)).toEqual(['Kitchen quick']);
    expect(p.favorites.map(f => f.favoriteId)).toEqual(['42']);
    expect(c.dock).toBeNull();
    expect(p.dock).not.toBeNull();
  });
});

// ── I13 (integration 4.2.20): Prime select marks rooms and zones ─────────
describe('roomsRole — I13 segment_type', () => {
  const sel = (segment_type?: Record<string, string>) => primeCombo([
    ['select.combo_prime_zone_select', 'prime_zone_select', 'Kitchen', {
      options: ['Kitchen', 'Couch zone', 'Bedroom', 'Attic zone'],
      segment_map: { Kitchen: 'Ground', 'Couch zone': 'Ground', Bedroom: 'Upstairs', 'Attic zone': 'Upstairs' },
      ...(segment_type ? { segment_type } : {}),
    }],
    ['image.combo_rooms_map', 'rooms_map', 'idle', { rooms: { '1': { name: 'Kitchen' } } }],
  ]);
  it('zones on every floor are dropped, rooms kept', () =>
    expect(roomsRole(sel({ Kitchen: 'room', 'Couch zone': 'zone', Bedroom: 'room', 'Attic zone': 'zone' }), 'combo').rooms)
      .toEqual(['Kitchen', 'Bedroom']));
  it('a name segment_type does not cover falls back to the heuristic', () =>
    expect(roomsRole(sel({ Kitchen: 'room', 'Couch zone': 'zone' }), 'combo').rooms).toEqual(['Kitchen', 'Bedroom', 'Attic zone']));
  it('negative control: without segment_type the other floor\'s zone cannot be told apart', () =>
    expect(roomsRole(sel(), 'combo').rooms).toContain('Attic zone'));
  it('segment_type alone (no rooms map yet) still separates', () => {
    const hass = sel({ Kitchen: 'room', 'Couch zone': 'zone', Bedroom: 'room', 'Attic zone': 'zone' });
    delete hass.states['image.combo_rooms_map']; delete hass.entities!['image.combo_rooms_map'];
    expect(roomsRole(hass, 'combo').rooms).toEqual(['Kitchen', 'Bedroom']);
  });
});
