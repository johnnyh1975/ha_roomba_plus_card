/**
 * robot-model.ts — v3.0 A2: generation-neutral roles.
 *
 * The zones render ROLES (status, error, start check, rooms, consumables,
 * dock, connectivity), not entities. Each builder below fills a role from
 * Classic or Prime entities — found through registry.ts — so a zone needs
 * no `if (prime)` of its own. Roles whose data is identical on both
 * generations (battery, rooms overdue, mission progress, …) stay simple
 * registry lookups in the zones; only what DIFFERS lives here.
 *
 * Facts per role: integration 4.2.19 entity inventory (scratchpad
 * inventory_v30.md), file:line cited in the builders.
 */
import type { HomeAssistant, HAState } from './types.js';
import { robot, RobotEntities, Generation } from './registry.js';
import { zoneSelectId } from './entity-ids.js';
import { favoriteList, FavoriteItem } from './favorites.js';
import { OFFLINE_PHASES } from './slugs.js';

const live = (s: HAState | undefined): s is HAState =>
  !!s && s.state !== 'unavailable' && s.state !== 'unknown';

// ── status ────────────────────────────────────────────────────────────────

export interface StatusRole {
  /** Phase slug (`charge`… on old integrations, `running`, `emptying_bin`,
   *  `washing_pad`, …). '' when unknown. */
  phase: string;
  phaseId: string | null;
  /** Prime vacuum attribute: `pad_washing` | `pad_drying` | `evacuating`
   *  while the dock works (vacuum.py:381-421), as the matching PHASE slug
   *  so the integration's phase translation can name it. */
  dockActivityPhase: string | null;
  /** Prime vacuum attribute while a cycle runs: `vacuuming` | `mopping` |
   *  `vacuuming_and_mopping` (vacuum.py:351-379). */
  cleaningMode: string | null;
  /** Entity whose translations name `cleaningMode` (Prime sensor
   *  `prime_cleaning_mode`, same slugs). */
  cleaningModeId: string | null;
  offline: boolean;
}

const DOCK_ACTIVITY_TO_PHASE: Record<string, string> = {
  pad_washing: 'washing_pad',
  pad_drying: 'drying_pad',
  evacuating: 'emptying_bin',
};

export function statusRole(hass: HomeAssistant, n: string, r: RobotEntities = robot(hass, n)): StatusRole {
  const phaseId = r.id('sensor', 'phase');
  const phase = phaseId ? (hass.states[phaseId]?.state ?? '') : '';
  const vac = hass.states[r.vacuumId]?.attributes ?? {};
  const activity = typeof vac.dock_activity === 'string' ? vac.dock_activity : null;
  const mode = typeof vac.cleaning_mode === 'string' ? vac.cleaning_mode : null;
  // Prime connectivity: binary_sensor `connected` (binary_sensor.py:1620)
  // off means the cloud has lost the robot. Classic `connected` is the
  // local MQTT link, and Classic offline is already the phase/vacuum state.
  const connected = r.generation === 'prime' ? r.st('binary_sensor', 'connected')?.state : undefined;
  return {
    phase,
    phaseId,
    dockActivityPhase: activity ? (DOCK_ACTIVITY_TO_PHASE[activity] ?? null) : null,
    cleaningMode: mode,
    cleaningModeId: r.id('sensor', 'prime_cleaning_mode'),
    offline: OFFLINE_PHASES.has(phase) || connected === 'off',
  };
}

// ── error ─────────────────────────────────────────────────────────────────

export interface ErrorRole {
  /** An error is live on the robot right now. */
  active: boolean;
  code: string | null;
  title: string | null;
  description: string | null;
  /** Classic: what to do (`action`). */
  action: string | null;
  /** Prime: severity bucket and what still works. */
  severity: string | null;
  partiallyOperable: boolean;
  availableModes: string[];
}

export function errorRole(hass: HomeAssistant, n: string, r: RobotEntities = robot(hass, n)): ErrorRole {
  const vacuum = hass.states[r.vacuumId];
  const none: ErrorRole = {
    active: false, code: null, title: null, description: null, action: null,
    severity: null, partiallyOperable: false, availableModes: [],
  };
  if (r.generation === 'prime') {
    // Prime: sensor `error` (`prime_error`), state "Error <code>" while an
    // error is live and None (unknown) otherwise; localized title and
    // description from the iRobot help catalogue (sensor_prime.py:1375-1440).
    const e = r.st('sensor', 'error');
    const a = e?.attributes ?? {};
    const code = a.error_code != null && a.error_code !== 0 ? String(a.error_code) : null;
    const active = (live(e) && /\d/.test(e.state)) || vacuum?.state === 'error';
    if (!active) return none;
    return {
      active: true,
      code,
      title: typeof a.error_title === 'string' ? a.error_title : null,
      description: typeof a.error_description === 'string' ? a.error_description : null,
      action: null,
      severity: typeof a.severity === 'string' ? a.severity : null,
      partiallyOperable: a.partially_operable === true,
      availableModes: Array.isArray(a.available_modes) ? a.available_modes.map(String) : [],
    };
  }
  // Classic: the vacuum's `error_code` attribute is the robot's raw
  // cleanMissionStatus.error, which the firmware does NOT reset when the
  // robot docks after a failure (sensor_helpers.py:150-167). The `error`
  // sensor applies exactly that suppression — unknown while the robot rests
  // with no mission — so it decides whether an error is live; the vacuum
  // attribute only without that sensor (older installs).
  // `last_error_code` keeps the last code with `description` / `action`
  // (sensor_core.py:2034-2044).
  const errSensor = r.st('sensor', 'error');
  const vcode = vacuum?.attributes?.error_code;
  const active = !!vacuum && (vacuum.state === 'error'
    || (errSensor ? live(errSensor) && errSensor.state !== '' : !!vcode));
  if (!active) return none;
  const last = r.st('sensor', 'last_error_code');
  const usable = live(last) && last.state !== '0' && last.state !== ''
    && (vcode == null || String(vcode) === last.state);
  const la = usable ? last.attributes : {};
  return {
    active: true,
    code: usable ? last.state : (vcode != null && vcode !== 0 ? String(vcode) : null),
    title: typeof la.description === 'string' && la.description ? la.description
      : (live(errSensor) ? errSensor.state
        : (typeof vacuum?.attributes?.error === 'string' ? vacuum.attributes.error as string : null)),
    description: null,
    action: typeof la.action === 'string' ? la.action : null,
    severity: null,
    partiallyOperable: false,
    availableModes: [],
  };
}

// ── start check ───────────────────────────────────────────────────────────

export interface StartCheckRole {
  blocked: boolean;
  reason: string | null;
  availableModes: string[];
}

/** Prime: `prime_start_blocked` — robot faults that block some or all modes
 *  (binary_sensor.py:1671). Classic `start_blocked` is a user-configured
 *  blocking-sensor feature with another meaning and is not mapped here. */
export function startCheckRole(hass: HomeAssistant, n: string, r: RobotEntities = robot(hass, n)): StartCheckRole | null {
  const s = r.st('binary_sensor', 'prime_start_blocked');
  if (!live(s)) return null;
  const a = s.attributes ?? {};
  return {
    blocked: s.state === 'on',
    reason: typeof a.blocked_reason === 'string' ? a.blocked_reason : null,
    availableModes: Array.isArray(a.available_modes) ? a.available_modes.map(String) : [],
  };
}

// ── rooms ─────────────────────────────────────────────────────────────────

export interface RoomsRole {
  /** The select whose options are the room names `clean_room` accepts. */
  selectId: string | null;
  /** The names `clean_room` takes. Prime: rooms only — the Prime backend
   *  refuses a zone (`room_name_is_a_zone`, services.py:420-445). Classic:
   *  rooms and zones alike — the Classic backend sends a zone as `zid`
   *  (room_cleaning.py:1856-1867, 2172). */
  rooms: string[];
  icons: Record<string, string>;
  areasM2: Record<string, number>;
  /** Prime: room → floor (map) name, and the floor the robot is on. */
  floors: Record<string, string>;
  robotFloor: string | null;
  robotFloorIsLive: boolean;
}

const objAttr = <T>(s: HAState | undefined, key: string): Record<string, T> => {
  const raw = s?.attributes?.[key];
  return raw && typeof raw === 'object' && !Array.isArray(raw) ? raw as Record<string, T> : {};
};

export function roomsRole(hass: HomeAssistant, n: string, r: RobotEntities = robot(hass, n)): RoomsRole {
  const empty: RoomsRole = {
    selectId: null, rooms: [], icons: {}, areasM2: {}, floors: {}, robotFloor: null, robotFloorIsLive: false,
  };
  if (r.generation === 'prime') {
    // Prime: `prime_zone_select` lists rooms AND zones of every map by name
    // (select_prime.py:1473); the rooms map lists rooms only (image.py:4600).
    const id = r.id('select', 'prime_zone_select');
    const sel = id ? hass.states[id] : undefined;
    if (!sel || sel.state === 'unavailable') return empty;
    const options = (sel.attributes?.options as string[] | undefined) ?? [];
    const floors = objAttr<string>(sel, 'segment_map');
    // Integration ≥ 4.2.20 says which entries are zones (`segment_type`,
    // {name: "room" | "zone"}, from the segment id — Plan v3 I13), on every
    // floor. A name it does not cover falls back to the heuristic below.
    const segType = objAttr<string>(sel, 'segment_type');
    // Before that the select did not say which entries are zones. The rooms map lists
    // the rooms of ONE map (the selected or current one, image.py:3781);
    // so: a name on that map is a room, a name not on it but on the same
    // floor is a zone, a name on another floor is kept — there the card
    // cannot tell, and clean_room says so in words if it is a zone.
    const mapRooms = objAttr<{ name?: string }>(r.st('image', 'rooms_map'), 'rooms');
    const roomNames = new Set(Object.values(mapRooms).map(v => v?.name).filter((x): x is string => !!x));
    const shownFloors = new Set([...roomNames].map(nm => floors[nm]).filter((f): f is string => !!f));
    const guess = (o: string) => roomNames.size === 0 || roomNames.has(o)
      || (shownFloors.size > 0 && !!floors[o] && !shownFloors.has(floors[o]));
    const isRoom = (o: string) => segType[o] === 'room' || (segType[o] !== 'zone' && guess(o));
    return {
      selectId: id,
      rooms: options.filter(isRoom),
      icons: {},
      areasM2: {},
      floors,
      robotFloor: typeof sel.attributes?.robot_on_map === 'string' ? sel.attributes.robot_on_map as string : null,
      robotFloorIsLive: sel.attributes?.robot_map_is_live === true,
    };
  }
  const id = zoneSelectId(hass, n);
  const sel = id ? hass.states[id] : undefined;
  if (!sel) return empty;
  const options = (sel.attributes?.options as string[] | undefined) ?? [];
  const icons = objAttr<string>(sel, 'region_icons');
  return {
    selectId: id,
    rooms: options,
    icons,
    areasM2: objAttr<number>(sel, 'region_areas_m2'),
    floors: {},
    robotFloor: null,
    robotFloorIsLive: false,
  };
}

// ── consumables (Prime parts) ─────────────────────────────────────────────

export interface PartRole {
  entityId: string;
  /** Display text in the integration's words (entity friendly name minus
   *  the device name). */
  label: string;
  remaining: number;
  unit: string | null;
  /** Remaining share of the part's life, 0–100 — replacement parts only. */
  pct: number | null;
  /** `replacement` parts count down; `maintenance` parts count since the
   *  job was last done (prime_parts.py:49-80), so no percentage. */
  category: string | null;
}

/** Prime `prime_part_*` sensors (sensor_prime.py:1860-1945). */
export function primePartsRole(hass: HomeAssistant, n: string, r: RobotEntities = robot(hass, n)): PartRole[] {
  if (r.generation !== 'prime') return [];
  const deviceName = String(hass.states[r.vacuumId]?.attributes?.friendly_name ?? '').trim();
  const out: PartRole[] = [];
  for (const id of r.index.entityIds) {
    if (!id.startsWith('sensor.')) continue;
    const key = hass.entities?.[id]?.translation_key ?? '';
    const isPart = key === 'prime_consumable_part' || key.startsWith('prime_part_')
      || (!hass.entities && /_prime_part_/.test(id));
    if (!isPart) continue;
    const s = hass.states[id];
    if (!live(s)) continue;
    const remaining = parseFloat(s.state);
    if (isNaN(remaining)) continue;
    const a = s.attributes ?? {};
    // Lower-cased as the integration compares it (prime_parts.py:78).
    const category = typeof a.category === 'string' ? a.category.toLowerCase() : null;
    const used = Number(a.count_used);
    const rawLeft = Number(a.raw_count_remaining);
    const pct = category !== 'maintenance' && Number.isFinite(used) && Number.isFinite(rawLeft) && used + rawLeft > 0
      ? Math.round(rawLeft / (used + rawLeft) * 100)
      : null;
    let label = String(a.friendly_name ?? id).trim();
    if (deviceName && label.startsWith(deviceName + ' ')) label = label.slice(deviceName.length + 1);
    out.push({
      entityId: id, label, remaining,
      unit: typeof a.unit_of_measurement === 'string' ? a.unit_of_measurement : null,
      pct, category,
    });
  }
  return out.sort((x, y) => x.label.localeCompare(y.label));
}

// ── dock (Prime) ──────────────────────────────────────────────────────────

export interface DockRole {
  /** Entity ids — the zones show their state via HA's formatter. */
  statusId: string | null;
  tankLevelId: string | null;
  padWashId: string | null;
  padDryId: string | null;
  /** Buttons / switches the dock offers right now. */
  emptyBinButton: string | null;
  washPadButton: string | null;
  padDrySwitch: string | null;
  errorId: string | null;
}

export function primeDockRole(hass: HomeAssistant, n: string, r: RobotEntities = robot(hass, n)): DockRole | null {
  if (r.generation !== 'prime') return null;
  const avail = (id: string | null) => (id && hass.states[id] && hass.states[id].state !== 'unavailable') ? id : null;
  const role: DockRole = {
    statusId: avail(r.id('sensor', 'prime_dock_status')),
    tankLevelId: avail(r.id('sensor', 'prime_dock_tank_level')),
    padWashId: avail(r.id('sensor', 'prime_pad_wash_status')),
    padDryId: avail(r.id('sensor', 'prime_pad_dry_status')),
    emptyBinButton: avail(r.id('button', 'prime_empty_bin')),
    washPadButton: avail(r.id('button', 'prime_wash_pad')),
    padDrySwitch: avail(r.id('switch', 'prime_pad_dry')),
    errorId: avail(r.id('binary_sensor', 'prime_dock_error')),
  };
  return Object.values(role).some(v => v) ? role : null;
}

// ── whole model ───────────────────────────────────────────────────────────

export interface RobotModel {
  generation: Generation;
  vacuumId: string;
  status: StatusRole;
  error: ErrorRole;
  startCheck: StartCheckRole | null;
  rooms: RoomsRole;
  favorites: FavoriteItem[];
  parts: PartRole[];
  dock: DockRole | null;
}

export function robotModel(hass: HomeAssistant, n: string): RobotModel {
  const r = robot(hass, n);
  return {
    generation: r.generation,
    vacuumId: r.vacuumId,
    status: statusRole(hass, n, r),
    error: errorRole(hass, n, r),
    startCheck: startCheckRole(hass, n, r),
    rooms: roomsRole(hass, n, r),
    favorites: favoriteList(hass, n),
    parts: primePartsRole(hass, n, r),
    dock: primeDockRole(hass, n, r),
  };
}
