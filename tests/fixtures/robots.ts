/**
 * Realistic robots for tests — registry rows + states, derived from the
 * integration 4.2.19 code (entity inventory: domain, translation_key and
 * object-id suffix per entity; Classic vs Prime setup branches). Not a field
 * snapshot: the Card-Diagnose (A4) "copy for issue" output will replace these
 * with real installs as testers send them.
 */
import type { HomeAssistant, HAState, HARegistryEntry } from '../../src/types';
import { makeHass } from '../helpers';

type Row = [entityId: string, translationKey: string | null, state: string, attributes?: Record<string, unknown>];

function build(device: string, rows: Row[], extra: Record<string, Partial<HAState>> = {}): HomeAssistant {
  const states: Record<string, Partial<HAState>> = {};
  const entities: Record<string, HARegistryEntry> = {};
  for (const [id, tk, state, attributes] of rows) {
    states[id] = { state, attributes: attributes ?? {} };
    entities[id] = { entity_id: id, device_id: device, platform: 'roomba_plus', translation_key: tk };
  }
  const hass = makeHass({ ...states, ...extra });
  hass.entities = entities;
  hass.devices = { [device]: { id: device, name: device, model: 'test' } };
  return hass;
}

/** Classic i7 with cloud: `vacuum.i7`, device `dev_i7`. */
export function classicI7(overrides: Row[] = []): HomeAssistant {
  const rows: Row[] = [
    ['vacuum.i7', null, 'docked', { friendly_name: 'i7', favorites: [{ id: 'f1', name: 'Kitchen quick' }] }],
    ['sensor.i7_battery', null, '88', { device_class: 'battery', unit_of_measurement: '%' }],
    ['sensor.i7_phase', 'phase', 'charge'],
    ['sensor.i7_readiness', 'readiness', 'ready'],
    ['sensor.i7_error', 'error', 'unknown'], // None while no live error (sensor_helpers.py:150)
    ['sensor.i7_last_error_code', 'last_error_code', '0'],
    ['binary_sensor.i7_mission_active', 'mission_active', 'off'],
    ['binary_sensor.i7_maintenance_due', 'maintenance_due', 'off'],
    ['sensor.i7_filter_remaining_hours', 'filter_remaining_hours', '120', { threshold_hours: 150, max_hours: 150 }],
    ['sensor.i7_brush_remaining_hours', 'brush_remaining_hours', '200', { threshold_hours: 300, max_hours: 300 }],
    ['sensor.i7_firmware_version', 'firmware_version', 'lewis+22.52.10'],
    ['select.i7_cloud_zone_abc', 'cloud_smart_zone_select', 'Kitchen', { options: ['Kitchen', 'Hall'], is_active_map: true, region_icons: { Kitchen: 'mdi:fridge' } }],
    ['sensor.i7_rooms_overdue', 'rooms_overdue', '0', { rooms: {}, overdue_rooms: [] }],
    ['device_tracker.i7', 'position', 'Docked'],
    ['image.i7_map', 'map', 'idle', {}],
    ['image.i7_rooms_map', 'rooms_map', 'idle', { entity_picture: '/api/image_proxy/image.i7_rooms_map' }],
    ['image.i7_coverage_map', 'coverage_map', 'idle', {}],
    ['button.i7_fav_f1', null, 'unknown', { friendly_name: 'i7 Kitchen quick' }],
    ['button.i7_locate', 'locate', 'unknown'],
    ['button.i7_evac', 'evac', 'unknown'],
  ];
  return build('dev_i7', mergeRows(rows, overrides));
}

/** Prime Combo: `vacuum.combo`, device `dev_combo`. */
export function primeCombo(overrides: Row[] = []): HomeAssistant {
  const rows: Row[] = [
    ['vacuum.combo', null, 'docked', { friendly_name: 'Combo', favorites: [{ id: '42', name: 'After dinner' }] }],
    ['sensor.combo_battery', null, '91', { device_class: 'battery', unit_of_measurement: '%' }],
    ['sensor.combo_prime_phase', 'phase', 'charge', { dock_task: null, cleaning: null }],
    ['sensor.combo_prime_readiness', 'readiness', 'ready', { code: 0 }],
    ['sensor.combo_prime_error', 'error', 'unknown', {}],
    ['sensor.combo_prime_firmware_version', 'prime_firmware_version', '1.2.3'],
    ['sensor.combo_prime_dock_tank_level', 'prime_dock_tank_level', '80'],
    ['sensor.combo_prime_rooms_overdue', 'rooms_overdue', '0', { rooms: {}, overdue_rooms: [] }],
    ['binary_sensor.combo_prime_start_blocked', 'prime_start_blocked', 'off', {}],
    ['binary_sensor.combo_connected', 'connected', 'on'],
    ['select.combo_prime_zone_select', 'prime_zone_select', 'Kitchen', { options: ['Kitchen', 'Bath'] }],
    ['image.combo_map', 'raw_map', 'idle', {}],
    ['image.combo_rooms_map', 'rooms_map', 'idle', { entity_picture: '/api/image_proxy/image.combo_rooms_map' }],
    ['image.combo_prime_cleaning_map', 'cleaning_map', 'idle', {}],
    ['button.combo_favorite_42', 'prime_favorite', 'unknown', { favorite_id: '42' }],
    ['button.combo_locate', 'prime_locate', 'unknown'],
    ['button.combo_prime_empty_bin', 'prime_empty_bin', 'unknown'],
    ['device_tracker.combo', 'position', 'Docked'],
    ['calendar.combo_prime_schedule', 'schedule', 'off'],
    ['sensor.combo_prime_part_filter', 'prime_part_filter', '30', { part_id: '72' }],
  ];
  return build('dev_combo', mergeRows(rows, overrides));
}

function mergeRows(base: Row[], overrides: Row[]): Row[] {
  const byId = new Map(base.map(r => [r[0], r]));
  for (const r of overrides) byId.set(r[0], r);
  return [...byId.values()];
}
