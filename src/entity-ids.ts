/**
 * entity-ids.ts — v2.5.0: the card's fallback table for entity IDs that the
 * integration does NOT name `{domain}.{robot}_{fixed suffix}`.
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

const has = (hass: HomeAssistant, id: string): boolean => !!hass.states[id];

/** All of this robot's cloud zone selects (one per Smart Map), sorted. */
export function cloudZoneSelectIds(hass: HomeAssistant, n: string): string[] {
  const prefix = `select.${n}_cloud_zone_`;
  return Object.keys(hass.states).filter(id => id.startsWith(prefix)).sort();
}

/**
 * The room/zone select the card should use for multi-room selection, or
 * null. Local SmartZoneSelect first (no-cloud installs). Otherwise the
 * cloud select of the ACTIVE map: `is_active_map: true`, usable (not
 * unavailable — the integration reports unavailable when the map has no
 * selectable options). A single cloud select is used even without the
 * attribute (older integrations); with several and none marked active,
 * none is chosen — offering rooms from a map the robot is not on cleans
 * nothing (or the wrong floor), which is worse than no picker.
 */
export function zoneSelectId(hass: HomeAssistant, n: string): string | null {
  const local = `select.${n}_smart_zone_select`;
  if (has(hass, local) && hass.states[local].state !== 'unavailable') return local;

  const usable = cloudZoneSelectIds(hass, n)
    .filter(id => hass.states[id].state !== 'unavailable');
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

/** device_tracker.{n} (integration naming), else a user-renamed _position. */
export function trackerId(hass: HomeAssistant, n: string): string | null {
  for (const id of [`device_tracker.${n}`, `device_tracker.${n}_position`]) {
    if (has(hass, id)) return id;
  }
  return null;
}

/** sensor.{n}_battery (fresh installs), else _battery_level (migrated). */
export function batterySensorId(hass: HomeAssistant, n: string): string | null {
  for (const id of [`sensor.${n}_battery`, `sensor.${n}_battery_level`]) {
    if (has(hass, id)) return id;
  }
  return null;
}

/**
 * The Classic live map image carrying `rooms` / `calibration_points` /
 * `zones` / `door_markers` / `furniture_candidates`: image.{n}_map on fresh
 * installs, image.{n}_cleaning_map on entries migrated by schema 21. When
 * both exist the one actually carrying `rooms` wins (Prime's image.{n}_map
 * is a raw map without them).
 */
export function mapImageId(hass: HomeAssistant, n: string): string | null {
  const candidates = [`image.${n}_map`, `image.${n}_cleaning_map`].filter(id => has(hass, id));
  const withRooms = candidates.find(id => {
    const rooms = hass.states[id].attributes?.rooms;
    return !!rooms && typeof rooms === 'object';
  });
  return withRooms ?? candidates[0] ?? null;
}

/** sensor.{n}_rooms_overdue (Classic), else sensor.{n}_prime_rooms_overdue
 *  — the Prime sensor exists since integration 4.2.19 (same attributes, it
 *  subclasses the Classic one; `clean_overdue_rooms` serves both). */
export function roomsOverdueId(hass: HomeAssistant, n: string): string | null {
  for (const id of [`sensor.${n}_rooms_overdue`, `sensor.${n}_prime_rooms_overdue`]) {
    if (has(hass, id)) return id;
  }
  return null;
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
