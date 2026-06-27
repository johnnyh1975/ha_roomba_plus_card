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
    hasMaintenanceCalendar: e('wheel_last_cleaned') || e('contact_last_cleaned') || e('bin_last_cleaned'),
    hasMissionProgressSensor: e('mission_progress'),
    // hasAlignment: non-empty `rooms` dict on image.*_coverage_map. The
    // integration only populates this once its own internal alignment
    // confidence is >= 0.70 — no threshold check needed here, presence alone
    // is sufficient. No `alignment_confidence` attribute exists to read.
    hasAlignment: (() => {
      const rooms = hass.states[`image.${name}_coverage_map`]?.attributes?.rooms;
      return !!rooms && typeof rooms === 'object' && Object.keys(rooms).length > 0;
    })(),
    // hasFavorites: at least one button.*_fav_<id> entity. Favorite IDs are
    // arbitrary per-user iRobot routine identifiers, so this scans all
    // entity_ids for the prefix rather than checking a single fixed key.
    hasFavorites: Object.keys(hass.states).some(id => id.startsWith(`button.${name}_fav_`)),
  };
}
