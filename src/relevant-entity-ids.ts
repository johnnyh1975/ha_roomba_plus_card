/**
 * relevant-entity-ids.ts — the render guard's watch list.
 *
 * `set hass()` re-renders only when one of these entities changes state or
 * last_changed. Extracted from roomba-plus-card.ts in v2.5.0 so the test
 * exercises the real list instead of a hand-maintained replica (the old
 * replica had already drifted once, see tests/relevant-entity-ids.test.ts),
 * and because the list is no longer static: F3/F4/F8 resolve some ids from
 * what exists (entity-ids.ts), and the guard must watch exactly those.
 *
 * B1 fix (kept): uses the ACTIVE robot (not config.entity) so multi-robot
 * mode watches the currently displayed robot's entities.
 */
import type { HomeAssistant } from './types.js';
import { cloudZoneSelectIds, trackerId, batterySensorId, mapImageId, roomsOverdueId } from './entity-ids.js';

export function relevantEntityIds(
  hass: HomeAssistant | undefined,
  n: string,
  activeRobot: string,
  robotSelectorHelper?: string,
): string[] {
  const dynamic: string[] = hass ? [
    // v2.5.0 F3: every per-map cloud zone select (the active one feeds the
    // room picker; watching all keeps a map switch visible).
    ...cloudZoneSelectIds(hass, n),
    // v2.5.0 F4 / F8: resolved ids, whichever exist on this install.
    ...[trackerId(hass, n), batterySensorId(hass, n), mapImageId(hass, n), roomsOverdueId(hass, n)]
      .filter((id): id is string => id !== null),
  ] : [];
  const ids = [
    activeRobot,
    `sensor.${n}_last_error_code`,
    `sensor.${n}_last_error_zone`,          // B2: needed for error zone display
    `sensor.${n}_last_error_at`,            // v2.2.0 B1: resolved-error info line timestamp
    `sensor.${n}_health_score_trend`,       // v2.2.0 F3: trend badge + readiness countdown
    `binary_sensor.${n}_layout_change_detected`, // v2.2.0 F3b: layout change alert
    `sensor.${n}_optical_dirt_detections`,  // v2.2.0 A2 (diagnostic, default-disabled)
    `sensor.${n}_piezo_dirt_detections`,    // v2.2.0 A2 (diagnostic, default-disabled)
    `sensor.${n}_scrubs_count`,             // v2.2.0 A2 (diagnostic, default-disabled)
    `sensor.${n}_dock_tank_level`,          // v2.2.0 A3
    `sensor.${n}_dock_knockoffs`,           // v2.2.0 A3 (diagnostic, default-disabled)
    `sensor.${n}_dock_charge_aborts`,       // v2.2.0 A3 (diagnostic, default-disabled)
    `sensor.${n}_dock_contact_chatters`,    // v2.2.0 A3 (diagnostic, default-disabled)
    `sensor.${n}_rooms_overdue`,            // v2.3.0 ROOM-SCHED
    `sensor.${n}_dirt_weather_correlation`,  // v2.3.0 CROSS-CORR
    `sensor.${n}_phase`,
    `binary_sensor.${n}_mission_active`,
    `binary_sensor.${n}_maintenance_due`,
    `sensor.${n}_readiness`,                // B2: needed for A5 alert text
    `binary_sensor.${n}_schedule_hold_active`,
    `sensor.${n}_next_clean`,
    `sensor.${n}_filter_remaining_hours`,
    `sensor.${n}_brush_remaining_hours`,
    `sensor.${n}_mop_pad`,                  // B2: Braava pad consumable
    `sensor.${n}_mop_tank_level`,           // B2: Braava tank level
    `sensor.${n}_mop_behavior`,             // B2: Braava mop behavior
    `sensor.${n}_clean_base_status`,
    `sensor.${n}_nav_quality`,
    `sensor.${n}_nav_panics`,             // A1: navigation health detail
    `sensor.${n}_nav_landmark_quality`,   // A1
    `sensor.${n}_nav_good_landmarks`,     // A1
    `sensor.${n}_next_likely_clean_window`,
    `sensor.${n}_presence_clean_opportunities_7d`,
    `sensor.${n}_presence_clean_utilisation_7d`,
    `sensor.${n}_cleaning_passes`,
    `select.${n}_cleaning_passes`,
    `select.${n}_smart_zone_select`,
    `sensor.${n}_clean_streak`,
    `sensor.${n}_completion_rate_30d`,
    `sensor.${n}_lifetime_missions`,
    // SC1 (integration v2.7.0): sensor.*_recent_area_30d and
    // sensor.*_recent_time_30d are deprecated (removed in v3.0) and no
    // longer tracked. Both area (state) and time (time_h attribute) now
    // come from this single consolidated sensor.
    `sensor.${n}_cleaning_analytics_30d`,
    // v1.3 — performance & health sensors
    `sensor.${n}_battery_capacity_retention`,
    `sensor.${n}_estimated_battery_eol`,     // B2: EOL shown in popover
    // SC1 (integration v2.7.0): sensor.*_recent_wifi_floor deprecated
    // (removed in v3.0) — replaced by sensor.*_wifi_health. Note this is
    // not a like-for-like metric swap; see alert-zone.ts WIFI_FLOOR_MIGRATION.
    `sensor.${n}_wifi_health`,
    `sensor.${n}_missions_last_30d`,          // gates coverage bar skeleton
    `sensor.${n}_average_mission_time`,       // A1: progress bar duration estimate
    // SC1 (integration v2.7.0): sensor.*_cleaning_speed_trend deprecated
    // (removed in v3.0) — trend now read from `trend` attribute on
    // sensor.*_cleaning_performance (tracked above is unnecessary since
    // it's the same entity already needed for hasCleaningSpeedTrend detection
    // — listed explicitly here for clarity since cleaning_performance wasn't
    // otherwise in this list before this migration).
    `sensor.${n}_cleaning_performance`,
    `binary_sensor.${n}_consecutive_clean_skips`,
    // Status zone live metrics
    `sensor.${n}_area_cleaned_today`,         // B2: Wave A3 area-today line
    `sensor.${n}_mission_expire_time`,        // B2: recharge ETA countdown
    // cleaning_analytics_30d and missions_last_30d already tracked above — A4 vs-usual delta uses both
    // v2.2+
    `image.${n}_coverage_map`,               // B2: hasCoverageImage detection
    `image.${n}_map`,                        // v2.3.0: hasAlignment/rooms/zones/door_markers/furniture_candidates (CORRECTION — previously missing entirely; these attributes were never on coverage_map)
    `sensor.${n}_room_accessibility_scores`,  // v2.4.0 ROOM-ACCESS: room-label tooltip

    // v2.0.1 bug fix: these v2.0 entities were never added to the render
    // guard when their features were built — an update to any of them
    // alone (e.g. robot_health_score recalculating, or
    // battery_last_replaced changing after a reset_battery call) would
    // sit in this._hass unrendered until some unrelated tracked entity
    // happened to change and trigger a re-render that incidentally
    // picked up the fresher data. Found while fixing a missing
    // last-reset display on the Battery baseline maintenance row —
    // checked the whole v2.0 entity surface for the same gap rather than
    // only adding the one entity that prompted the check.
    `sensor.${n}_robot_health_score`,         // C1-HEALTH
    `sensor.${n}_wheel_last_cleaned`,         // C2-MAINT
    `sensor.${n}_contact_last_cleaned`,       // C2-MAINT
    `sensor.${n}_bin_last_cleaned`,           // C2-MAINT
    `sensor.${n}_battery_last_replaced`,      // C2-MAINT (battery row)
    `sensor.${n}_mission_progress`,           // C3-PROGRESS
    `sensor.${n}_last_mission_result`,
    `sensor.${n}_consecutive_mission_anomalies`,  // C5-ANOMALY (active, integration 3.0.0; disabled-by-default sensor)
    `select.${n}_carpet_boost_select`,        // Settings panel
    `switch.${n}_edge_clean`,                 // Settings panel
    `switch.${n}_always_finish`,              // Settings panel
    `switch.${n}_gentle_mode`,                // v2.5.0 GENTLE-MODE — Settings panel
    `binary_sensor.${n}_demand_clean_blocked`, // Header demand-blocked line
    // Pre-existing gap, not v2.0-specific, fixed alongside the above
    // since it was found during the same audit:
    `sensor.${n}_optimal_clean_window`,       // F15 (⚙ tab schedule)

    // ── v2.1.0 — header indicators ───────────────────────────────────────
    `binary_sensor.${n}_cloud_connected`,     // A1: connectivity indicator
    `binary_sensor.${n}_mqtt_stale`,          // A1: connectivity indicator
    `sensor.${n}_firmware_version`,           // A2: firmware badge

    // ── v2.5.0 — consumable bars that were rendered but never watched ─────
    `sensor.${n}_pad_days_until_due`,         // F6: pad row (days value)
    `sensor.${n}_filter_wear_rate`,           // wear arrows + alerts
    `sensor.${n}_brush_wear_rate`,
    `sensor.${n}_pad_wear_rate`,

    ...dynamic,
    // F3b — robot selector helper (when configured)
    ...(robotSelectorHelper ? [robotSelectorHelper] : []),
  ];
  return Array.from(new Set(ids));
}
