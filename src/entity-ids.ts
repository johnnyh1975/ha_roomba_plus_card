/**
 * entity-ids.ts — named lookups for entities that need more than one key.
 *
 * v3.0: everything here resolves through registry.ts (device + translation
 * key), so renamed entities and Prime prefixes are found; the history below
 * explains why each lookup exists. Originally (v2.5.0) this was the card's
 * fallback table for entity IDs that the integration does NOT name
 * `{domain}.{robot}_{fixed suffix}`.
 *
 * Plan v3 invariant 1 ("no entity id is built by string outside the fallback
 * table") starts here. Each resolver below exists because a hard-coded id
 * silently missed a real entity in the field:
 *
 *  - F3  room selection: with iRobot cloud credentials (the normal setup)
 *        the integration replaces select.{n}_smart_zone_select with one
 *        select.{n}_cloud_zone_{pmap_id} per map (CloudSmartZoneSelect).
 *        The card only knew the former, so the room picker, "Rooms…",
 *        room icons and room areas never appeared on cloud installs.
 *  - F4  current room: the device tracker takes the device name alone
 *        (`_attr_name = None`, suggested_object_id → None), i.e.
 *        device_tracker.{n}. The card looked for device_tracker.{n}_position.
 *  - F8  long-lived installs: schema migration 21 renamed
 *        sensor.{n}_battery → _battery_level and image.{n}_map →
 *        _cleaning_map for entries created before it.
 *
 * Every function is pure over hass.states, so the render guard
 * (relevant-entity-ids.ts) can watch exactly what rendering reads.
 * 3.0.0 replaces this table with registry-based resolution (device +
 * translation_key); until then this is the single place ids are guessed.
 */
import type { HomeAssistant } from './types.js';
import { robot } from './registry.js';

/** All of this robot's cloud zone selects (one per Smart Map), sorted. */
export function cloudZoneSelectIds(hass: HomeAssistant, n: string): string[] {
  return robot(hass, n).ids('select', 'cloud_smart_zone_select');
}

/**
 * The Classic room/zone select the card should use for multi-room
 * selection, or null. Local SmartZoneSelect first (no-cloud installs).
 * Otherwise the cloud select of the ACTIVE map: `is_active_map: true`,
 * usable (not unavailable — the integration reports unavailable when the
 * map has no selectable options). A single cloud select is used even
 * without the attribute (older integrations); with several and none marked
 * active, none is chosen — offering rooms from a map the robot is not on
 * cleans nothing (or the wrong floor), which is worse than no picker.
 * Prime robots have their own select (rooms.ts handles both).
 */
export function zoneSelectId(hass: HomeAssistant, n: string): string | null {
  const r = robot(hass, n);
  const local = r.id('select', 'smart_zone_select');
  if (local && hass.states[local]?.state !== 'unavailable') return local;

  const usable = r.ids('select', 'cloud_smart_zone_select')
    .filter(id => hass.states[id] && hass.states[id].state !== 'unavailable');
  const active = usable.filter(id => hass.states[id].attributes?.is_active_map === true);
  if (active.length > 0) return active[0];
  if (usable.length === 1 && hass.states[usable[0]].attributes?.is_active_map === undefined) {
    return usable[0];
  }
  // An unavailable local select is NOT used: after cloud credentials are
  // added its registry row lingers, and HA keeps its last `options` in the
  // placeholder state — the picker would offer stale pre-cloud room names.
  return null;
}

/** The robot's device tracker (translation_key `position`; its entity id is
 *  the device name alone, or a user-renamed `_position`). */
export function trackerId(hass: HomeAssistant, n: string): string | null {
  return robot(hass, n).id('device_tracker', 'position');
}

/** The battery sensor: no translation_key on either generation, so by
 *  suffix (`_battery`, or `_battery_level` after schema migration 21) or by
 *  `device_class: battery`. */
export function batterySensorId(hass: HomeAssistant, n: string): string | null {
  const r = robot(hass, n);
  return r.id('sensor', 'battery') ?? r.id('sensor', 'battery_level') ?? r.byDeviceClass('sensor', 'battery');
}

/**
 * The Classic live map image carrying `rooms` / `calibration_points` /
 * `zones` / `door_markers` / `furniture_candidates` (translation_key `map`;
 * entity id `_map`, or `_cleaning_map` after schema migration 21). Prime's
 * `image.*_map` is a raw diagnostic map with another key and is not
 * returned.
 */
export function mapImageId(hass: HomeAssistant, n: string): string | null {
  const r = robot(hass, n);
  const candidates = [r.id('image', 'map'), r.index.generation === 'prime' ? null : r.id('image', 'cleaning_map')]
    .filter((id): id is string => !!id && !!hass.states[id]);
  const withRooms = candidates.find(id => {
    const rooms = hass.states[id].attributes?.rooms;
    return !!rooms && typeof rooms === 'object';
  });
  return withRooms ?? candidates[0] ?? null;
}

/** Rooms-overdue sensor, both generations (translation_key `rooms_overdue`;
 *  Prime since integration 4.2.19 as `_prime_rooms_overdue`). */
export function roomsOverdueId(hass: HomeAssistant, n: string): string | null {
  return robot(hass, n).id('sensor', 'rooms_overdue');
}

/** Plain-object attribute of the chosen zone select (region_icons,
 *  region_areas_m2), or {} when absent/malformed. */
export function zoneSelectMapAttr<T>(hass: HomeAssistant, n: string, attr: string): Record<string, T> {
  const id = zoneSelectId(hass, n);
  const raw = id ? hass.states[id]?.attributes?.[attr] : undefined;
  return (raw && typeof raw === 'object' && !Array.isArray(raw))
    ? raw as Record<string, T>
    : {};
}
