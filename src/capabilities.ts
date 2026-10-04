import { HomeAssistant, CardConfig, RobotCapabilities, MissionRecord, DaySummary } from './types.js';
import { robot } from './registry.js';
import { zoneSelectId, trackerId, mapImageId, roomsOverdueId } from './entity-ids.js';
import { favoriteList } from './favorites.js';
import { roomsRole } from './robot-model.js';
import { roomsMapUsable } from './zones/map-zone.js';

/**
 * Detect robot capabilities from hass entity state (Tier 1) and optional
 * API-fetched data (Tier 2).
 *
 * Two-render pattern:
 *   - Initial render: called with (hass, name, config) — all Tier 2 caps false.
 *   - Post-loadHistory render: called with firstRecord and firstSummary — Tier 2
 *     caps resolved. One extra render, under 10ms, invisible to the user.
 */
export function detectCapabilities(
  hass: HomeAssistant,
  name: string,
  config: CardConfig,
  firstRecord?: MissionRecord | null,
  firstSummary?: DaySummary | null,
): RobotCapabilities {
  // v3.0 A1: presence by device + translation_key (registry.ts), suffix
  // only as the documented fallback.
  const R   = robot(hass, name);
  const e   = (key: string) => !!R.st('sensor', key);
  const b   = (key: string) => !!R.st('binary_sensor', key);
  const img = (key: string) => !!R.st('image', key);

  const hasPad   = e('mop_pad');
  const hasBrush = e('brush_remaining_hours');
  // v2.5.0 F3/F8: resolved, not guessed (entity-ids.ts).
  const zoneSelect = zoneSelectId(hass, name);
  const mapImage   = mapImageId(hass, name);
  const roomsSelect = roomsRole(hass, name, R).rooms.length > 0 ? roomsRole(hass, name, R).selectId : null;
  const mapAttrs   = mapImage ? (hass.states[mapImage]?.attributes ?? {}) : {};

  return {
    // ── Tier 1 — entity-based (synchronous) ──────────────────────────────
    hasArea:          e('area_cleaned_today'),
    hasBrush,
    hasPad,
    hasWater:         e('mop_tank_level'),
    hasCleanBase:     e('clean_base_status'),
    // v2.5.0 F3: select.*_zone_select (EPHEMERAL) was retired by the
    // integration in v3.2.1; with cloud credentials the SMART select is
    // select.*_cloud_zone_{pmap_id}, one per map. Both flags now mean
    // "a usable multi-room select exists" (smart_zone_select or the active
    // map's cloud select).
    // v3.0 B5: the Prime select (prime_zone_select) counts too — rooms are
    // read through the robot model, which knows both.
    hasZones:         zoneSelect !== null || roomsSelect !== null,
    hasSmartZones:    roomsSelect !== null,
    hasRoomsMap:      roomsMapUsable(hass, name),
    hasProblemZone:   e('problem_zone'),
    hasLifetimeArea:  e('cleaning_analytics_30d'),  // SC1 (v2.7.0): was recent_area_30d
    hasWearRate:      e('filter_wear_rate'),
    isMop:            hasPad && !hasBrush,
    hasMissionActive: b('mission_active'),
    hasMissionPhase:  e('phase'),
    // v1.3 / integration v2.1+
    hasCleaningSpeedTrend: e('cleaning_performance'),  // SC1 (v2.7.0): was cleaning_speed_trend
    hasBatteryRetention:   e('battery_capacity_retention'),
    hasWifiFloor:          e('wifi_health'),  // SC1 (v2.7.0): was recent_wifi_floor — NOT a like-for-like
                                               // metric swap, see WIFI_FLOOR_MIGRATION note in alert-zone.ts
    // v2.5.0 F5: sensor.*_recent_coverage_pct was removed in integration
    // v3.0; its successor is the `coverage_pct` attribute on
    // cleaning_performance (last mission's area vs the 60-day p75).
    hasCoveragePct:        typeof robot(hass, name).st('sensor', 'cleaning_performance')?.attributes?.coverage_pct === 'number',
    hasBatteryEol:         e('estimated_battery_eol'),
    hasConsecutiveSkips:   e('consecutive_clean_skips'),
    hasMopBehavior:        e('mop_behavior'),
    // v2.2+
    hasCoverageImage:      img('coverage_map'),

    // ── Tier 2 — API-field-based (false until loadHistory completes) ──────
    hasWifiSignal:    firstRecord?.wifi_signal != null,
    hasRoomCoverage:  firstRecord != null && 'room_coverage' in firstRecord,
    hasDirtDensity:   firstSummary != null && 'dirt_density' in firstSummary,

    // ── Config-based ──────────────────────────────────────────────────────
    hasRobotSelectorHelper: !!config.robot_selector_helper &&
                            !!hass.states[config.robot_selector_helper],

    // ── v1.6 / integration v2.3–v2.4 ─────────────────────────────────────
    // hasCleanedRooms: non-empty array only — empty array means whole-home
    // clean (no room events) and should NOT trigger the chip row.
    hasCleanedRooms: Array.isArray(hass.states[robot(hass, name).vacuumId]?.attributes?.last_cleaned_rooms)
                     && (hass.states[robot(hass, name).vacuumId]?.attributes?.last_cleaned_rooms as unknown[]).length > 0,
    hasDemandBlocked:     b('demand_clean_blocked'),
    hasEnergyConsumption: e('total_energy_consumed'),
    hasOptimalWindow:     e('optimal_clean_window'),

    // ── v2.0 — integration v2.7.0–v2.8.6 ─────────────────────────────────────
    hasRobotHealthScore:    e('robot_health_score'),
    hasNavStats:            e('nav_panics') || e('nav_landmark_quality'),
    hasMaintenanceCalendar: e('wheel_last_cleaned') || e('contact_last_cleaned') || e('bin_last_cleaned'),
    hasMissionProgressSensor: e('mission_progress'),
    // v2.3.0 CORRECTION: hasAlignment previously read image.*_coverage_map
    // (RoombaCoverageImage — a GridStore EMA-diagnostic heatmap with NO
    // rooms/calibration_points attribute at all, verified against source).
    // The correct entity is image.*_map (RoombaMapImage) — presence alone
    // is sufficient, same reasoning as before, just the right target now.
    hasAlignment: (() => {
      const rooms = mapAttrs.rooms;
      return !!rooms && typeof rooms === 'object' && Object.keys(rooms).length > 0;
    })(),
    // v2.3.0 ZONE-OVERLAY / F24 — same image.*_map entity as hasAlignment,
    // same aligned-mode gate (integration withholds all three attributes
    // together outside aligned mode — verified against source).
    hasZoneOverlays: (() => {
      const zones = mapAttrs.zones;
      return Array.isArray(zones) && zones.length > 0;
    })(),
    hasDoorMarkers: (() => {
      const markers = mapAttrs.door_markers;
      return Array.isArray(markers) && markers.length > 0;
    })(),
    hasFurnitureShadows: (() => {
      const candidates = mapAttrs.furniture_candidates;
      return Array.isArray(candidates) && candidates.length > 0;
    })(),
    // v2.4.0 ROOM-ACCESS — separate sensor entity (not image.*_map), but
    // registered by the integration only when umf_aligner is present —
    // same underlying gate as hasAlignment, so presence alone suffices.
    hasRoomAccess: e('room_accessibility_scores'),
    // hasFavorites: at least one button.*_fav_<id> entity. Favorite IDs are
    // arbitrary per-user iRobot routine identifiers, so this scans all
    // entity_ids for the prefix rather than checking a single fixed key.
    // v2.5.0: Prime favourites are button.*_favorite_<id> (favorites.ts).
    hasFavorites: favoriteList(hass, name).length > 0,

    // ── v2.1.0 — header indicators ───────────────────────────────────────────
    // A1: connectivity. Both are binary_sensors (verified vs integration
    // v3.0.0). Either present is enough to surface the indicator; the header
    // reads both states to decide visibility.
    hasConnectivity: b('cloud_connected') || b('mqtt_stale'),
    // A2: firmware badge.
    hasFirmware: e('firmware_version'),
    // A4 / v2.5.0 F4: the integration names the tracker after the device
    // alone (device_tracker.{n}); the old `_position` id only exists when a
    // user renamed it. Resolved in entity-ids.ts.
    hasPositionTracker: trackerId(hass, name) !== null,

    // ── v2.3.0 — Rooms-Overdue widget ─────────────────────────────────────
    // v2.5.0: also the Prime sensor (integration ≥ 4.2.19), entity-ids.ts.
    hasRoomsOverdue: roomsOverdueId(hass, name) !== null,
    // v2.3.0 — dirt/sensor correlation. Opt-in diagnostic; presence alone
    // is sufficient (integration only registers it when the user has
    // configured correlation entities AND cloud is available).
    hasDirtCorrelation: e('dirt_weather_correlation'),
  };
}
