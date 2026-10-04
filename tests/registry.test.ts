/** v3.0 A1 — registry.ts: entities found by device + translation_key. */
import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { robot, robotIndex, RobotEntities } from '../src/registry';
import { makeHass, st } from './helpers';
import { classicI7, primeCombo } from './fixtures/robots';

describe('registry mode — Classic', () => {
  const hass = classicI7();
  const r = robot(hass, 'i7');

  it('indexes the robot\'s device and detects the generation', () => {
    expect(r.index.source).toBe('registry');
    expect(r.index.deviceId).toBe('dev_i7');
    expect(r.generation).toBe('classic');
  });
  it('finds by translation_key', () => {
    expect(r.lookup('sensor', 'readiness')).toEqual({ via: 'key', id: 'sensor.i7_readiness' });
    expect(r.id('device_tracker', 'position')).toBe('device_tracker.i7');
  });
  it('lists families', () =>
    expect(r.ids('select', 'cloud_smart_zone_select')).toEqual(['select.i7_cloud_zone_abc']));
  it('entities without a key: by suffix (battery) and by device_class', () => {
    expect(r.lookup('sensor', 'battery')).toEqual({ via: 'suffix', id: 'sensor.i7_battery' });
    expect(r.byDeviceClass('sensor', 'battery')).toBe('sensor.i7_battery');
  });
  it('Classic favourite buttons (no key) by suffix prefix', () =>
    expect(r.idsWithSuffixPrefix('button', 'fav_')).toEqual(['button.i7_fav_f1']));
  it('missing is reported as such', () =>
    expect(r.lookup('sensor', 'nonexistent')).toEqual({ via: 'missing', id: null }));
});

describe('registry mode — renamed entity', () => {
  it('a user-renamed entity is still found by its key', () => {
    const hass = classicI7([['sensor.living_room_robot_readiness', 'readiness', 'ready']]);
    delete hass.entities!['sensor.i7_readiness'];
    delete hass.states['sensor.i7_readiness'];
    expect(robot(hass, 'i7').id('sensor', 'readiness')).toBe('sensor.living_room_robot_readiness');
  });
});

describe('registry mode — Prime', () => {
  const hass = primeCombo();
  const r = robot(hass, 'combo');

  it('detects Prime', () => expect(r.generation).toBe('prime'));
  it('shared keys resolve to the prime_ entities', () => {
    expect(r.id('sensor', 'phase')).toBe('sensor.combo_prime_phase');
    expect(r.id('sensor', 'readiness')).toBe('sensor.combo_prime_readiness');
    expect(r.id('sensor', 'rooms_overdue')).toBe('sensor.combo_prime_rooms_overdue');
    expect(r.id('calendar', 'schedule')).toBe('calendar.combo_prime_schedule');
  });
  it('role pairs via aliases (firmware, locate, empty bin, dock tank)', () => {
    expect(r.lookup('sensor', 'firmware_version')).toEqual({ via: 'alias', id: 'sensor.combo_prime_firmware_version' });
    expect(r.id('button', 'locate')).toBe('button.combo_locate');
    expect(r.id('button', 'evac')).toBe('button.combo_prime_empty_bin');
    expect(r.id('sensor', 'dock_tank_level')).toBe('sensor.combo_prime_dock_tank_level');
  });
  it('TRAP: Prime image.*_map is the raw diagnostic map — not returned for the Classic "map" role', () =>
    expect(r.id('image', 'map')).toBeNull());
  it('negative control: the trap exists (same suffix, other key)', () =>
    expect(hass.entities!['image.combo_map'].translation_key).toBe('raw_map'));
});

describe('registry mode — multi robot', () => {
  it('does not leak entities across devices', () => {
    const a = classicI7();
    const b = primeCombo();
    const hass = makeHass();
    hass.states = { ...a.states, ...b.states };
    hass.entities = { ...a.entities!, ...b.entities! };
    expect(robot(hass, 'i7').id('sensor', 'phase')).toBe('sensor.i7_phase');
    expect(robot(hass, 'combo').id('sensor', 'phase')).toBe('sensor.combo_prime_phase');
    expect(robotIndex(hass, 'vacuum.i7').entityIds.some(id => id.includes('combo'))).toBe(false);
  });
});

describe('fallback mode (no registry)', () => {
  const hass = makeHass({
    'vacuum.combo': st('docked'),
    'sensor.combo_prime_phase': st('charge'),
    'sensor.combo_prime_firmware_version': st('1'),
    'image.combo_map': st('idle'),
    'select.combo_cloud_zone_p1': st('Kitchen'),
    'device_tracker.combo': st('Docked'),
    'button.combo_favorite_7': st('unknown'),
  });
  const r = robot(hass, 'combo');

  it('maps known suffixes to keys', () => {
    expect(r.index.source).toBe('states');
    expect(r.id('sensor', 'phase')).toBe('sensor.combo_prime_phase');
    expect(r.ids('select', 'cloud_smart_zone_select')).toEqual(['select.combo_cloud_zone_p1']);
    expect(r.ids('button', 'prime_favorite')).toEqual(['button.combo_favorite_7']);
    expect(r.id('device_tracker', 'position')).toBe('device_tracker.combo');
  });
  it('detects Prime and keeps its raw map out of the Classic "map" role', () => {
    expect(r.generation).toBe('prime');
    expect(r.id('image', 'map')).toBeNull();
  });
});

describe('caching', () => {
  it('re-uses the index for the same registry object, rebuilds for a new one', () => {
    const hass = classicI7();
    const a = robotIndex(hass, 'vacuum.i7');
    expect(robotIndex(hass, 'vacuum.i7')).toBe(a);
    hass.entities = { ...hass.entities! };
    expect(robotIndex(hass, 'vacuum.i7')).not.toBe(a);
  });
  it('falls back to states when the vacuum is not in the registry', () => {
    const hass = classicI7();
    delete hass.entities!['vacuum.i7'];
    expect(new RobotEntities(hass, 'vacuum.i7').index.source).toBe('states');
  });
});

// Plan v3 invariant 1: no entity id is built from a string outside
// registry.ts. A source scan, so a new `sensor.${n}_…` cannot creep back.
describe('invariant 1 — no string-built entity ids outside registry.ts', () => {
  const SRC = join(__dirname, '..', 'src');
  const files: string[] = [];
  const walk = (dir: string) => {
    for (const name of readdirSync(dir)) {
      const p = join(dir, name);
      if (statSync(p).isDirectory()) walk(p);
      else if (p.endsWith('.ts') && !p.endsWith('registry.ts')) files.push(p);
    }
  };
  walk(SRC);
  const PATTERN = /(sensor|binary_sensor|select|switch|button|image|vacuum|device_tracker|calendar|todo)\.\$\{/;

  it('scans the source tree', () => expect(files.length).toBeGreaterThan(20));
  it('finds none', () => {
    const hits = files.flatMap(f => readFileSync(f, 'utf-8').split('\n')
      .map((line, i) => ({ f, i: i + 1, line }))
      .filter(({ line }) => PATTERN.test(line) && !/^\s*(\/\/|\*)/.test(line)));
    expect(hits.map(h => `${h.f}:${h.i}: ${h.line.trim()}`)).toEqual([]);
  });
  it('negative control: the pattern catches the pre-3.0 form', () =>
    expect(PATTERN.test('hass.states[`sensor.${n}_readiness`]')).toBe(true));
});

describe('fallback mode — v3.0 bug-hunt fixes', () => {
  it('Classic switch schedule_hold keeps its own key (not a Prime schedule)', () => {
    const r = robot(makeHass({ 'vacuum.r': st('docked'), 'sensor.r_phase': st('charge'), 'switch.r_schedule_hold': st('off') }), 'r');
    expect(r.id('switch', 'schedule_hold')).toBe('switch.r_schedule_hold');
    expect(r.ids('switch', 'prime_schedule')).toEqual([]);
  });
  it('robots `roomba` and `roomba_2`: the shorter name does not claim the longer one\'s entities', () => {
    const hass = makeHass({
      'vacuum.roomba': st('docked'), 'sensor.roomba_phase': st('charge'),
      'vacuum.roomba_2': st('docked'), 'sensor.roomba_2_phase': st('run'), 'sensor.roomba_2_prime_part_filter': st('3'),
    });
    const ids = robotIndex(hass, 'vacuum.roomba').entityIds;
    expect(ids).toContain('sensor.roomba_phase');
    expect(ids.some(id => id.includes('roomba_2'))).toBe(false);
    expect(robotIndex(hass, 'vacuum.roomba_2').entityIds).toContain('sensor.roomba_2_phase');
  });
});
