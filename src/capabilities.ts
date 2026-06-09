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
    hasLifetimeArea:  e('recent_area_30d'),   // A4: renamed in integration v2.1.2; was e('lifetime_area')
    hasWearRate:      e('filter_wear_rate'),
    isMop:            hasPad && !hasBrush,
    hasMissionActive: b('mission_active'),
    hasMissionPhase:  e('phase'),
    // v1.3 / integration v2.1+
    hasCleaningSpeedTrend: e('cleaning_speed_trend'),
    hasBatteryRetention:   e('battery_capacity_retention'),
    hasWifiFloor:          e('recent_wifi_floor'),
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
  };
}
