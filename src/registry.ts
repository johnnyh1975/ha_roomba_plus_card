/**
 * registry.ts — v3.0 A1: find a robot's entities instead of guessing them.
 *
 * Up to 2.5 the card built entity ids as `sensor.${robot}_${suffix}` in ~130
 * places. Every rename (schema migrations), every Prime prefix
 * (`prime_phase`), every family (one select per map, one button per
 * favourite) broke a feature without a sound.
 *
 * The integration gives every entity a translation_key, and Prime shares the
 * key with Classic wherever the role is the same (`phase`, `readiness`,
 * `error`, `rooms_overdue`, `schedule`, `rooms_map`, …) — only the entity ids
 * differ. Home Assistant's frontend registry (`hass.entities`) exposes, per
 * entity: platform, device_id and translation_key (verified against HA
 * 2025.5 `RegistryEntry._as_display_dict`; disabled entities are not listed,
 * unique_id and device_class are not exposed).
 *
 * So: vacuum → its device_id → every `roomba_plus` entity of that device →
 * an index by `domain:translation_key`. Lookups go through that index first.
 *
 * FALLBACK, documented and contained (Plan v3 invariant 1 — this file is the
 * only place an entity id is built from a string):
 *   - no `hass.entities` (test harnesses, very old frontends), or the vacuum
 *     not in it / without a device: the index is built from `hass.states`
 *     by entity-id prefix, mapping known suffixes to their keys;
 *   - an entity without a translation_key (the battery sensor, Classic
 *     favourite buttons): found by suffix or by `device_class` in its state.
 *
 * The index is cached per (hass.entities object, vacuum) — HA replaces the
 * object when the registry changes — or per (hass.states object, vacuum) in
 * fallback mode.
 */
import type { HomeAssistant, HAState, HARegistryEntry } from './types.js';

export type Generation = 'classic' | 'prime' | 'unknown';

export interface RobotIndex {
  vacuumId: string;
  /** Object id of the vacuum — the prefix suffix-based ids are built on. */
  n: string;
  deviceId: string | null;
  source: 'registry' | 'states';
  generation: Generation;
  /** `domain:translation_key` → entity ids (sorted). */
  byKey: Map<string, string[]>;
  /** Every entity of this robot (registry: same device + platform). */
  entityIds: string[];
}

const PLATFORM = 'roomba_plus';

/**
 * Fallback only: entity-id suffixes whose translation_key differs from the
 * suffix (Prime prefixes, families, renamed object ids). Everything else is
 * assumed to carry key == suffix — true for every Classic description
 * (inventory 4.2.19, §1).
 */
const SUFFIX_TO_KEY: Array<[RegExp, string, string?]> = [
  // [suffix pattern, translation_key, only for this domain]
  [/^prime_phase$/, 'phase', 'sensor'],
  [/^prime_readiness$/, 'readiness', 'sensor'],
  [/^prime_error$/, 'error', 'sensor'],
  [/^prime_rooms_overdue$/, 'rooms_overdue', 'sensor'],
  [/^prime_(total|successful|canceled|failed)_missions$/, '$1_missions', 'sensor'],
  [/^cleaning_mode$/, 'prime_cleaning_mode', 'sensor'],
  [/^cloud_lifetime_missions$/, 'lifetime_missions', 'sensor'],
  [/^last_cleaned_.+$/, 'region_last_cleaned', 'sensor'],
  [/^prime_part_.+$/, 'prime_consumable_part', 'sensor'],
  [/^prime_schedule$/, 'schedule', 'calendar'],
  [/^prime_cleaning_map$/, 'cleaning_map', 'image'],
  [/^cloud_zone_.+$/, 'cloud_smart_zone_select', 'select'],
  [/^favorite_.+$/, 'prime_favorite', 'button'],
  // Prime schedule switches are `schedule_<id>`; Classic `schedule_hold`
  // is a different, fixed switch.
  [/^schedule_(?!hold$).+$/, 'prime_schedule', 'switch'],
];

function keyForSuffix(domain: string, suffix: string): string {
  for (const [re, key, dom] of SUFFIX_TO_KEY) {
    if (dom && dom !== domain) continue;
    if (re.test(suffix)) return suffix.replace(re, key);
  }
  return suffix;
}

function generationOf(byKey: Map<string, string[]>): Generation {
  for (const k of byKey.keys()) {
    if (k.startsWith('sensor:prime_') || k === 'binary_sensor:prime_start_blocked') return 'prime';
  }
  for (const k of ['sensor:readiness', 'sensor:phase', 'binary_sensor:mission_active', 'sensor:filter_remaining_hours']) {
    if (byKey.has(k)) return 'classic';
  }
  return 'unknown';
}

function push(map: Map<string, string[]>, key: string, id: string): void {
  const list = map.get(key);
  if (list) { if (!list.includes(id)) list.push(id); } else map.set(key, [id]);
}

function buildFromRegistry(
  entities: Record<string, HARegistryEntry>, vacuumId: string, n: string,
): RobotIndex | null {
  const vac = entities[vacuumId];
  const deviceId = vac?.device_id ?? null;
  if (!vac || !deviceId) return null;
  const byKey = new Map<string, string[]>();
  const entityIds: string[] = [];
  for (const entry of Object.values(entities)) {
    if (entry.device_id !== deviceId) continue;
    if (entry.platform && entry.platform !== PLATFORM) continue;
    const id = entry.entity_id;
    entityIds.push(id);
    const domain = id.slice(0, id.indexOf('.'));
    if (entry.translation_key) push(byKey, `${domain}:${entry.translation_key}`, id);
  }
  for (const list of byKey.values()) list.sort();
  entityIds.sort();
  return { vacuumId, n, deviceId, source: 'registry', generation: generationOf(byKey), byKey, entityIds };
}

function buildFromStates(states: Record<string, HAState>, vacuumId: string, n: string): RobotIndex {
  const byKey = new Map<string, string[]>();
  const entityIds: string[] = [];
  // Another robot whose name starts with this one's (`roomba` / `roomba_2`):
  // its entities carry this robot's prefix too and must not be claimed.
  const longer = Object.keys(states)
    .filter(id => id.startsWith('vacuum.') && id !== vacuumId)
    .map(id => id.slice('vacuum.'.length))
    .filter(o => o.startsWith(`${n}_`));
  for (const id of Object.keys(states)) {
    const dot = id.indexOf('.');
    const domain = id.slice(0, dot);
    const object = id.slice(dot + 1);
    if (longer.some(o => object === o || object.startsWith(`${o}_`))) continue;
    if (object === n) {
      // vacuum.{n}, device_tracker.{n}: no suffix.
      entityIds.push(id);
      if (domain === 'device_tracker') push(byKey, 'device_tracker:position', id);
      continue;
    }
    if (!object.startsWith(`${n}_`)) continue;
    const suffix = object.slice(n.length + 1);
    entityIds.push(id);
    push(byKey, `${domain}:${keyForSuffix(domain, suffix)}`, id);
    if (domain === 'device_tracker' && suffix === 'position') push(byKey, 'device_tracker:position', id);
  }
  for (const list of byKey.values()) list.sort();
  entityIds.sort();
  const generation = generationOf(byKey);
  // Prime's `image.*_map` is the diagnostic raw map (`raw_map`), not the
  // Classic path map — same suffix, other role (inventory §2).
  if (generation === 'prime' && byKey.has('image:map')) {
    byKey.set('image:raw_map', byKey.get('image:map')!);
    byKey.delete('image:map');
  }
  return { vacuumId, n, deviceId: null, source: 'states', generation, byKey, entityIds };
}

const registryCache = new WeakMap<object, Map<string, RobotIndex>>();
const statesCache = new WeakMap<object, Map<string, RobotIndex>>();

/** The robot's entity index (cached). `vacuumId` is `vacuum.<object id>`. */
export function robotIndex(hass: HomeAssistant, vacuumId: string): RobotIndex {
  const n = vacuumId.replace(/^vacuum\./, '');
  const entities = hass.entities;
  if (entities && typeof entities === 'object') {
    let perVac = registryCache.get(entities);
    if (!perVac) { perVac = new Map(); registryCache.set(entities, perVac); }
    const cached = perVac.get(vacuumId);
    if (cached) return cached;
    const built = buildFromRegistry(entities, vacuumId, n);
    if (built) { perVac.set(vacuumId, built); return built; }
  }
  const states = hass.states ?? {};
  let perVac = statesCache.get(states);
  if (!perVac) { perVac = new Map(); statesCache.set(states, perVac); }
  const cached = perVac.get(vacuumId);
  if (cached) return cached;
  const built = buildFromStates(states, vacuumId, n);
  perVac.set(vacuumId, built);
  return built;
}

/**
 * Same role, different key per generation (inventory §2): a lookup for the
 * Classic key also tries these. Only pairs the card actually reads.
 */
export const KEY_ALIASES: Record<string, string[]> = {
  'sensor:firmware_version': ['sensor:prime_firmware_version'],
  'sensor:dock_tank_level': ['sensor:prime_dock_tank_level'],
  'button:evac': ['button:prime_empty_bin'],
  'button:locate': ['button:prime_locate'],
  'switch:child_lock': ['switch:prime_child_lock'],
  'switch:eco_charge': ['switch:prime_eco_charge'],
  'binary_sensor:cloud_connected': [],
};

export interface Lookup {
  /** How an entity was found — for the card diagnostics (A4). */
  via: 'key' | 'alias' | 'suffix' | 'device_class' | 'missing';
  id: string | null;
}

/** Resolver bound to one robot and one hass snapshot. */
export class RobotEntities {
  readonly index: RobotIndex;
  constructor(private readonly hass: HomeAssistant, vacuumId: string) {
    this.index = robotIndex(hass, vacuumId);
  }

  get vacuumId(): string { return this.index.vacuumId; }
  get generation(): Generation { return this.index.generation; }

  /** Entity id for `domain` + translation_key, with how it was found. */
  lookup(domain: string, key: string): Lookup {
    const k = `${domain}:${key}`;
    const direct = this.index.byKey.get(k);
    if (direct?.length) return { via: 'key', id: direct[0] };
    for (const alias of KEY_ALIASES[k] ?? []) {
      const hit = this.index.byKey.get(alias);
      if (hit?.length) return { via: 'alias', id: hit[0] };
    }
    // Entities without a key, or not in the registry: the documented suffix.
    // Not when the registry says that entity has ANOTHER key: same suffix,
    // different role exists (`image.*_map` is the Classic path map `map`
    // but Prime's diagnostic `raw_map`; inventory §2 "traps").
    const bySuffix = `${domain}.${this.index.n}_${key}`;
    if (this.hass.states[bySuffix] && (this.index.source === 'states' || this.belongsToRobot(bySuffix))) {
      const regKey = this.hass.entities?.[bySuffix]?.translation_key;
      const claimedElsewhere = this.index.source === 'states'
        && [...this.index.byKey.entries()].some(([k2, ids]) => k2 !== `${domain}:${key}` && ids.includes(bySuffix));
      if (claimedElsewhere) return { via: 'missing', id: null };
      if (this.index.source === 'states' || !regKey || regKey === key) {
        return { via: 'suffix', id: bySuffix };
      }
    }
    // The device tracker is named after the device alone (no suffix).
    if (k === 'device_tracker:position') {
      const bare = `device_tracker.${this.index.n}`;
      if (this.hass.states[bare]) return { via: 'suffix', id: bare };
    }
    return { via: 'missing', id: null };
  }

  /** Entity id or null. */
  id(domain: string, key: string): string | null {
    return this.lookup(domain, key).id;
  }

  /** State object or undefined. */
  st(domain: string, key: string): HAState | undefined {
    const id = this.id(domain, key);
    return id ? this.hass.states[id] : undefined;
  }

  /** Every entity of a family (one per map, favourite, schedule, part, …). */
  ids(domain: string, key: string): string[] {
    return [...(this.index.byKey.get(`${domain}:${key}`) ?? [])];
  }

  /** Entities of this robot whose object id is `<robot>_<prefix>…` — for
   *  families without a translation_key (Classic favourite buttons
   *  `fav_{id}`). Registry mode still restricts to the robot's device. */
  idsWithSuffixPrefix(domain: string, prefix: string): string[] {
    const start = `${domain}.${this.index.n}_${prefix}`;
    const pool = this.index.source === 'registry'
      ? this.index.entityIds
      : Object.keys(this.hass.states);
    return pool.filter(id => id.startsWith(start)).sort();
  }

  /** First entity of `domain` whose state carries `device_class`. */
  byDeviceClass(domain: string, deviceClass: string): string | null {
    for (const id of this.index.entityIds) {
      if (!id.startsWith(`${domain}.`)) continue;
      if (this.hass.states[id]?.attributes?.device_class === deviceClass) return id;
    }
    return null;
  }

  /** Whether an entity id belongs to this robot (registry device, or the
   *  suffix family in fallback mode). */
  belongsToRobot(entityId: string): boolean {
    if (this.index.entityIds.includes(entityId)) return true;
    // Entities registered without a device (none known in 4.2.19) or not in
    // the registry at all still count when they carry the robot's prefix.
    const reg = this.hass.entities?.[entityId];
    return !reg || !reg.device_id;
  }
}

/** Convenience: resolver for `vacuum.<n>`. */
export function robot(hass: HomeAssistant, n: string): RobotEntities {
  return new RobotEntities(hass, `vacuum.${n}`);
}
