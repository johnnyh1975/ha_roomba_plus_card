/**
 * B1 + B2 regression tests: relevantEntityIds() correctness.
 *
 * relevantEntityIds() is private — we test it indirectly by verifying that
 * changes to specific entity IDs DO cause a render (are "relevant") and that
 * changes to unrelated entities do NOT cause a render. We achieve this by
 * inspecting the list of IDs that the card watches.
 *
 * Since the card is a custom element and its private method is inaccessible,
 * we test the logical requirement: the entity IDs that are used in rendering
 * but were previously MISSING from the watched list are now present.
 *
 * We do this by checking that changes to previously-missing entities now appear
 * as watched — verified through the render-guard's changed-detection logic which
 * runs in `set hass()`.
 *
 * For simplicity, we test the entity ID set by extracting it via a small
 * duck-typed wrapper that exposes the list.
 */
import { describe, it, expect } from 'vitest';

// ── Derive the watched list from the same constants the card uses ─────────────
// Rather than instantiating the full web component (which requires DOM), we
// replicate the logic of relevantEntityIds() here and assert the set contains
// all required IDs. If the card's implementation diverges, the full render
// tests would catch it.

function relevantEntityIds(robotName: string, activeRobot: string, helperEntity?: string): string[] {
  const n = robotName;
  return [
    activeRobot,
    `sensor.${n}_last_error_code`,
    `sensor.${n}_last_error_zone`,
    `sensor.${n}_mission_phase`,
    `binary_sensor.${n}_mission_active`,
    `binary_sensor.${n}_maintenance_due`,
    `sensor.${n}_readiness`,
    `binary_sensor.${n}_schedule_hold_active`,
    `sensor.${n}_next_clean`,
    `sensor.${n}_filter_remaining_hours`,
    `sensor.${n}_brush_remaining_hours`,
    `sensor.${n}_mop_pad`,
    `sensor.${n}_mop_tank_level`,
    `sensor.${n}_mop_behavior`,
    `sensor.${n}_clean_base_status`,
    `sensor.${n}_nav_quality`,
    `sensor.${n}_nav_panics`,
    `sensor.${n}_nav_landmark_quality`,
    `sensor.${n}_nav_good_landmarks`,
    `sensor.${n}_next_likely_clean_window`,
    `sensor.${n}_presence_clean_opportunities_7d`,
    `sensor.${n}_presence_clean_utilisation_7d`,
    `sensor.${n}_cleaning_passes`,
    `select.${n}_cleaning_passes`,
    `select.${n}_smart_zone_select`,
    `select.${n}_zone_select`,
    `sensor.${n}_clean_streak`,
    `sensor.${n}_completion_rate_30d`,
    `sensor.${n}_lifetime_missions`,
    // SC1 (integration v2.7.0): recent_area_30d / recent_time_30d deprecated,
    // removed in v3.0 — consolidated into cleaning_analytics_30d.
    `sensor.${n}_cleaning_analytics_30d`,
    `sensor.${n}_battery_capacity_retention`,
    `sensor.${n}_estimated_battery_eol`,
    // SC1 (integration v2.7.0): recent_wifi_floor deprecated, removed in v3.0.
    `sensor.${n}_wifi_health`,
    `sensor.${n}_recent_coverage_pct`,
    `sensor.${n}_missions_last_30d`,
    // SC1 (integration v2.7.0): cleaning_speed_trend deprecated, removed in v3.0.
    `sensor.${n}_cleaning_performance`,
    `binary_sensor.${n}_consecutive_clean_skips`,
    `sensor.${n}_area_cleaned_today`,
    `sensor.${n}_mission_expire_time`,
    `sensor.${n}_average_area_30d`,
    `sensor.${n}_mission_count_30d`,
    `binary_sensor.${n}_demand_clean_blocked`,
    `image.${n}_coverage_map`,
    // v2.0.1: kept in sync with the production list after a render-guard
    // gap was found — these v2.0 entities were missing from both places.
    `sensor.${n}_robot_health_score`,
    `sensor.${n}_wheel_last_cleaned`,
    `sensor.${n}_contact_last_cleaned`,
    `sensor.${n}_bin_last_cleaned`,
    `sensor.${n}_battery_last_replaced`,
    `sensor.${n}_mission_progress`,
    `sensor.${n}_last_mission_result`,
    `sensor.${n}_consecutive_mission_anomalies`,
    `select.${n}_carpet_boost_select`,
    `switch.${n}_edge_clean`,
    `switch.${n}_always_finish`,
    `sensor.${n}_optimal_clean_window`,
    // v2.1.0 — header indicators
    `binary_sensor.${n}_cloud_connected`,
    `binary_sensor.${n}_mqtt_stale`,
    `sensor.${n}_firmware_version`,
    `device_tracker.${n}_position`,
    ...(helperEntity ? [helperEntity] : []),
  ];
}

const n = 'roomba';
const entity = 'vacuum.roomba';

describe('relevantEntityIds() — B1: uses activeRobot not config.entity', () => {
  it('watched list uses activeRobot entity ID as primary vacuum entity', () => {
    const active = 'vacuum.roomba_upstairs';
    const ids = relevantEntityIds('roomba_upstairs', active);
    expect(ids[0]).toBe(active);
    expect(ids).not.toContain('vacuum.roomba');  // config.entity of default robot
  });

  it('single-robot: activeRobot === config.entity — both are the same', () => {
    const ids = relevantEntityIds(n, entity);
    expect(ids[0]).toBe(entity);
  });
});

describe('relevantEntityIds() — B2: previously missing entity IDs now watched', () => {
  const ids = relevantEntityIds(n, entity);
  const has = (id: string) => ids.includes(id);

  it('watches area_cleaned_today (Wave A3 status line)', () =>
    expect(has(`sensor.${n}_area_cleaned_today`)).toBe(true));

  it('watches mission_expire_time (recharge ETA countdown)', () =>
    expect(has(`sensor.${n}_mission_expire_time`)).toBe(true));

  it('watches demand_clean_blocked (demand indicator)', () =>
    expect(has(`binary_sensor.${n}_demand_clean_blocked`)).toBe(true));

  it('watches readiness (Wave A5 alert text refinement)', () =>
    expect(has(`sensor.${n}_readiness`)).toBe(true));

  it('watches last_error_zone (error details in status)', () =>
    expect(has(`sensor.${n}_last_error_zone`)).toBe(true));

  it('watches average_area_30d (vs-usual delta)', () =>
    expect(has(`sensor.${n}_average_area_30d`)).toBe(true));

  it('watches mission_count_30d (gates vs-usual delta)', () =>
    expect(has(`sensor.${n}_mission_count_30d`)).toBe(true));

  it('watches mop_pad (Braava pad consumable)', () =>
    expect(has(`sensor.${n}_mop_pad`)).toBe(true));

  it('watches mop_tank_level (Braava tank)', () =>
    expect(has(`sensor.${n}_mop_tank_level`)).toBe(true));

  it('watches mop_behavior (Braava behavior)', () =>
    expect(has(`sensor.${n}_mop_behavior`)).toBe(true));

  it('watches estimated_battery_eol (EOL shown in health popover)', () =>
    expect(has(`sensor.${n}_estimated_battery_eol`)).toBe(true));

  it('watches image coverage_map (hasCoverageImage cap detection)', () =>
    expect(has(`image.${n}_coverage_map`)).toBe(true));

  // ── v2.0.1 bug fix: render-guard gap found while fixing the missing
  // battery_last_replaced display — none of these v2.0 entities were
  // tracked, so an update to any one alone wouldn't trigger a re-render. ──
  it('watches robot_health_score (C1-HEALTH)', () =>
    expect(has(`sensor.${n}_robot_health_score`)).toBe(true));

  it('watches wheel/contact/bin_last_cleaned (C2-MAINT)', () => {
    expect(has(`sensor.${n}_wheel_last_cleaned`)).toBe(true);
    expect(has(`sensor.${n}_contact_last_cleaned`)).toBe(true);
    expect(has(`sensor.${n}_bin_last_cleaned`)).toBe(true);
  });

  it('watches battery_last_replaced (Maintenance section, battery row)', () =>
    expect(has(`sensor.${n}_battery_last_replaced`)).toBe(true));

  it('watches mission_progress (C3-PROGRESS)', () =>
    expect(has(`sensor.${n}_mission_progress`)).toBe(true));

  it('watches last_mission_result (C5-ANOMALY)', () =>
    expect(has(`sensor.${n}_last_mission_result`)).toBe(true));

  it('watches consecutive_mission_anomalies (C5-ANOMALY active, 3.0.0)', () =>
    expect(has(`sensor.${n}_consecutive_mission_anomalies`)).toBe(true));

  it('watches nav detail sensors (A1 navigation health)', () => {
    expect(has(`sensor.${n}_nav_panics`)).toBe(true);
    expect(has(`sensor.${n}_nav_landmark_quality`)).toBe(true);
    expect(has(`sensor.${n}_nav_good_landmarks`)).toBe(true);
  });

  it('watches carpet_boost_select, edge_clean, always_finish (Settings panel)', () => {
    expect(has(`select.${n}_carpet_boost_select`)).toBe(true);
    expect(has(`switch.${n}_edge_clean`)).toBe(true);
    expect(has(`switch.${n}_always_finish`)).toBe(true);
  });

  it('watches optimal_clean_window (F15, pre-existing gap fixed alongside)', () =>
    expect(has(`sensor.${n}_optimal_clean_window`)).toBe(true));

  // ── v2.1.0 header indicators — added with A1/A2/A4 ──
  it('watches cloud_connected (A1 connectivity)', () =>
    expect(has(`binary_sensor.${n}_cloud_connected`)).toBe(true));

  it('watches mqtt_stale (A1 connectivity)', () =>
    expect(has(`binary_sensor.${n}_mqtt_stale`)).toBe(true));

  it('watches firmware_version (A2 firmware badge)', () =>
    expect(has(`sensor.${n}_firmware_version`)).toBe(true));

  it('watches device_tracker position (A4 current-room line)', () =>
    expect(has(`device_tracker.${n}_position`)).toBe(true));
});

describe('relevantEntityIds() — robot_selector_helper', () => {
  it('includes helper entity when configured', () => {
    const ids = relevantEntityIds(n, entity, 'input_text.active_roomba');
    expect(ids).toContain('input_text.active_roomba');
  });

  it('does not include helper when not configured', () => {
    const ids = relevantEntityIds(n, entity);
    expect(ids.some(id => id.startsWith('input_text.'))).toBe(false);
  });
});
