import { HomeAssistant, CardConfig, RobotCapabilities, MissionRecord, DaySummary } from './types.js';

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
  const e   = (key: string) => !!hass.states[`sensor.${name}_${key}`];
  const s   = (key: string) => !!hass.states[`select.${name}_${key}`];
  const b   = (key: string) => !!hass.states[`binary_sensor.${name}_${key}`];
  const img = (key: string) => !!hass.states[`image.${name}_${key}`];

  const hasPad   = e('mop_pad');
  const hasBrush = e('brush_remaining_hours');

  return {
    // ── Tier 1 — entity-based (synchronous) ──────────────────────────────
    hasArea:          e('area_cleaned_today'),
    hasBrush,
    hasPad,
    hasWater:         e('mop_tank_level'),
    hasCleanBase:     e('clean_base_status'),
    hasZones:         s('smart_zone_select') || s('zone_select'),
    hasSmartZones:    s('smart_zone_select'),
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
    hasCoveragePct:        e('recent_coverage_pct'),
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
    hasCleanedRooms: Array.isArray(hass.states[`vacuum.${name}`]?.attributes?.last_cleaned_rooms)
                     && (hass.states[`vacuum.${name}`]?.attributes?.last_cleaned_rooms as unknown[]).length > 0,
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
      const rooms = hass.states[`image.${name}_map`]?.attributes?.rooms;
      return !!rooms && typeof rooms === 'object' && Object.keys(rooms).length > 0;
    })(),
    // v2.3.0 ZONE-OVERLAY / F24 — same image.*_map entity as hasAlignment,
    // same aligned-mode gate (integration withholds all three attributes
    // together outside aligned mode — verified against source).
    hasZoneOverlays: (() => {
      const zones = hass.states[`image.${name}_map`]?.attributes?.zones;
      return Array.isArray(zones) && zones.length > 0;
    })(),
    hasDoorMarkers: (() => {
      const markers = hass.states[`image.${name}_map`]?.attributes?.door_markers;
      return Array.isArray(markers) && markers.length > 0;
    })(),
    hasFurnitureShadows: (() => {
      const candidates = hass.states[`image.${name}_map`]?.attributes?.furniture_candidates;
      return Array.isArray(candidates) && candidates.length > 0;
    })(),
    // v2.4.0 ROOM-ACCESS — separate sensor entity (not image.*_map), but
    // registered by the integration only when umf_aligner is present —
    // same underlying gate as hasAlignment, so presence alone suffices.
    hasRoomAccess: e('room_accessibility_scores'),
    // hasFavorites: at least one button.*_fav_<id> entity. Favorite IDs are
    // arbitrary per-user iRobot routine identifiers, so this scans all
    // entity_ids for the prefix rather than checking a single fixed key.
    hasFavorites: Object.keys(hass.states).some(id => id.startsWith(`button.${name}_fav_`)),

    // ── v2.1.0 — header indicators ───────────────────────────────────────────
    // A1: connectivity. Both are binary_sensors (verified vs integration
    // v3.0.0). Either present is enough to surface the indicator; the header
    // reads both states to decide visibility.
    hasConnectivity: b('cloud_connected') || b('mqtt_stale'),
    // A2: firmware badge.
    hasFirmware: e('firmware_version'),
    // A4: position tracker carrying room_estimate (SMART). device_tracker
    // domain, so checked directly rather than via the sensor helper.
    hasPositionTracker: !!hass.states[`device_tracker.${name}_position`],

    // ── v2.3.0 — Rooms-Overdue widget ─────────────────────────────────────
    hasRoomsOverdue: e('rooms_overdue'),
    // v2.3.0 — dirt/sensor correlation. Opt-in diagnostic; presence alone
    // is sufficient (integration only registers it when the user has
    // configured correlation entities AND cloud is available).
    hasDirtCorrelation: e('dirt_weather_correlation'),
  };
}
