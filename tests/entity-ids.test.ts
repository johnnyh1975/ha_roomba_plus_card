/**
 * v2.5.0 — entity-ids.ts: the fallback table for ids the integration does
 * not name `{domain}.{robot}_{fixed suffix}` (F3, F4, F8).
 */
import { describe, it, expect } from 'vitest';
import {
  cloudZoneSelectIds, zoneSelectId, trackerId, batterySensorId, mapImageId, zoneSelectMapAttr, roomsOverdueId,
} from '../src/entity-ids';
import { makeHass, st } from './helpers';

const n = 'roomba';

describe('zoneSelectId() — F3', () => {
  it('prefers the local smart_zone_select (no-cloud installs)', () => {
    const hass = makeHass({
      [`select.${n}_smart_zone_select`]: st('Kitchen', { options: ['Kitchen'] }),
      [`select.${n}_cloud_zone_p1`]: st('Kitchen', { options: ['Kitchen'], is_active_map: true }),
    });
    expect(zoneSelectId(hass, n)).toBe(`select.${n}_smart_zone_select`);
  });

  it('uses the ACTIVE map\'s cloud select when there is no local one (cloud setup)', () => {
    const hass = makeHass({
      [`select.${n}_cloud_zone_aaa`]: st('Attic', { options: ['Attic'], is_active_map: false }),
      [`select.${n}_cloud_zone_bbb`]: st('Kitchen', { options: ['Kitchen'], is_active_map: true }),
    });
    expect(zoneSelectId(hass, n)).toBe(`select.${n}_cloud_zone_bbb`);
  });

  it('never picks an inactive map (rooms on another floor clean nothing or the wrong floor)', () => {
    const hass = makeHass({
      [`select.${n}_cloud_zone_aaa`]: st('Attic', { options: ['Attic'], is_active_map: false }),
    });
    expect(zoneSelectId(hass, n)).toBeNull();
  });

  it('skips an unavailable cloud select (map without selectable options)', () => {
    const hass = makeHass({
      [`select.${n}_cloud_zone_aaa`]: st('unavailable', { is_active_map: true }),
    });
    expect(zoneSelectId(hass, n)).toBeNull();
  });

  it('accepts a single cloud select without is_active_map (older integrations)', () => {
    const hass = makeHass({ [`select.${n}_cloud_zone_aaa`]: st('Kitchen', { options: ['Kitchen'] }) });
    expect(zoneSelectId(hass, n)).toBe(`select.${n}_cloud_zone_aaa`);
  });

  it('an orphaned, unavailable local select loses to a live cloud select', () => {
    const hass = makeHass({
      [`select.${n}_smart_zone_select`]: st('unavailable'),
      [`select.${n}_cloud_zone_p1`]: st('Kitchen', { options: ['Kitchen'], is_active_map: true }),
    });
    expect(zoneSelectId(hass, n)).toBe(`select.${n}_cloud_zone_p1`);
  });

  it('does not match another robot whose name shares the prefix', () => {
    const hass = makeHass({
      [`select.${n}_2_cloud_zone_p1`]: st('Kitchen', { options: ['Kitchen'], is_active_map: true }),
    });
    expect(cloudZoneSelectIds(hass, n)).toEqual([]);
    expect(zoneSelectId(hass, n)).toBeNull();
  });

  it('zoneSelectMapAttr reads region_icons from the chosen select; {} when malformed', () => {
    const ok = makeHass({
      [`select.${n}_cloud_zone_p1`]: st('Kitchen', { is_active_map: true, region_icons: { Kitchen: 'mdi:fridge' } }),
    });
    expect(zoneSelectMapAttr(ok, n, 'region_icons')).toEqual({ Kitchen: 'mdi:fridge' });
    const bad = makeHass({
      [`select.${n}_cloud_zone_p1`]: st('Kitchen', { is_active_map: true, region_icons: ['x'] }),
    });
    expect(zoneSelectMapAttr(bad, n, 'region_icons')).toEqual({});
    expect(zoneSelectMapAttr(makeHass(), n, 'region_icons')).toEqual({});
  });
});

describe('trackerId() — F4', () => {
  it('device_tracker.{n} is what the integration registers', () =>
    expect(trackerId(makeHass({ [`device_tracker.${n}`]: st('Docked') }), n)).toBe(`device_tracker.${n}`));
  it('a user-renamed _position tracker is still found', () =>
    expect(trackerId(makeHass({ [`device_tracker.${n}_position`]: st('Docked') }), n)).toBe(`device_tracker.${n}_position`));
  it('null when neither exists', () => expect(trackerId(makeHass(), n)).toBeNull());
});

describe('batterySensorId() — F8', () => {
  it('fresh install: sensor.{n}_battery', () =>
    expect(batterySensorId(makeHass({ [`sensor.${n}_battery`]: st('80') }), n)).toBe(`sensor.${n}_battery`));
  it('schema-21 migrated install: sensor.{n}_battery_level', () =>
    expect(batterySensorId(makeHass({ [`sensor.${n}_battery_level`]: st('80') }), n)).toBe(`sensor.${n}_battery_level`));
});

describe('mapImageId() — F8', () => {
  const rooms = { Kitchen: { outline: [[0, 0]], name: 'Kitchen' } };
  it('fresh install: image.{n}_map', () =>
    expect(mapImageId(makeHass({ [`image.${n}_map`]: st('idle', { rooms }) }), n)).toBe(`image.${n}_map`));
  it('migrated install: image.{n}_cleaning_map', () =>
    expect(mapImageId(makeHass({ [`image.${n}_cleaning_map`]: st('idle', { rooms }) }), n)).toBe(`image.${n}_cleaning_map`));
  it('when both exist, the one carrying rooms wins (Prime\'s _map is a raw map)', () =>
    expect(mapImageId(makeHass({
      [`image.${n}_map`]: st('idle', {}),
      [`image.${n}_cleaning_map`]: st('idle', { rooms }),
    }), n)).toBe(`image.${n}_cleaning_map`));
});

describe('zoneSelectId() — stale local select (bug hunt)', () => {
  it('an unavailable local select alone is not used (HA keeps its stale options)', () => {
    const hass = makeHass({ [`select.${n}_smart_zone_select`]: st('unavailable', { options: ['Old room'] }) });
    expect(zoneSelectId(hass, n)).toBeNull();
  });
});

describe('roomsOverdueId() — Prime sensor (integration 4.2.19)', () => {
  it('Classic sensor first', () =>
    expect(roomsOverdueId(makeHass({ [`sensor.${n}_rooms_overdue`]: st('1') }), n)).toBe(`sensor.${n}_rooms_overdue`));
  it('Prime sensor sensor.{n}_prime_rooms_overdue', () =>
    expect(roomsOverdueId(makeHass({ [`sensor.${n}_prime_rooms_overdue`]: st('2') }), n)).toBe(`sensor.${n}_prime_rooms_overdue`));
  it('null when neither exists', () => expect(roomsOverdueId(makeHass(), n)).toBeNull());
});
