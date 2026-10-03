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

// v2.5.0: the watch list now lives in src/relevant-entity-ids.ts and these
// tests call THE REAL FUNCTION. Until 2.4.x this file replicated the list by
// hand, and the replica had drifted: it asserted `average_area_30d` and
// `mission_count_30d`, which production never watched (it watches
// `cleaning_analytics_30d` and `missions_last_30d`) — green tests for a
// list nobody ran.
import { relevantEntityIds as realRelevantEntityIds } from '../src/relevant-entity-ids';
import { makeHass, st } from './helpers';

function relevantEntityIds(robotName: string, activeRobot: string, helperEntity?: string): string[] {
  return realRelevantEntityIds(makeHass(), robotName, activeRobot, helperEntity);
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

  it('watches cleaning_analytics_30d (vs-usual delta)', () =>
    expect(has(`sensor.${n}_cleaning_analytics_30d`)).toBe(true));

  it('watches missions_last_30d (gates vs-usual delta)', () =>
    expect(has(`sensor.${n}_missions_last_30d`)).toBe(true));

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

  it('watches image map (v2.3.0: hasAlignment/rooms/zones/door_markers/furniture_candidates)', () =>
    expect(has(`image.${n}_map`)).toBe(true));

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

describe('relevantEntityIds() — v2.2.0 additions watched', () => {
  const ids = relevantEntityIds('roomba', 'vacuum.roomba');
  for (const id of [
    'sensor.roomba_last_error_at',
    'sensor.roomba_health_score_trend',
    'binary_sensor.roomba_layout_change_detected',
    'sensor.roomba_optical_dirt_detections',
    'sensor.roomba_piezo_dirt_detections',
    'sensor.roomba_scrubs_count',
    'sensor.roomba_dock_tank_level',
    'sensor.roomba_dock_knockoffs',
    'sensor.roomba_dock_charge_aborts',
    'sensor.roomba_dock_contact_chatters',
  ]) {
    it(`watches ${id}`, () => expect(ids).toContain(id));
  }
});

describe('relevantEntityIds() — v2.3.0 additions watched', () => {
  const ids = relevantEntityIds('roomba', 'vacuum.roomba');
  it('watches sensor.roomba_rooms_overdue', () =>
    expect(ids).toContain('sensor.roomba_rooms_overdue'));
  it('watches sensor.roomba_dirt_weather_correlation', () =>
    expect(ids).toContain('sensor.roomba_dirt_weather_correlation'));
});

describe('relevantEntityIds() — v2.4.0 additions watched', () => {
  const ids = relevantEntityIds('roomba', 'vacuum.roomba');
  it('watches sensor.roomba_room_accessibility_scores', () =>
    expect(ids).toContain('sensor.roomba_room_accessibility_scores'));
});

describe('relevantEntityIds() — v2.5.0 additions watched', () => {
  const ids = relevantEntityIds('roomba', 'vacuum.roomba');
  it('watches switch.roomba_gentle_mode', () =>
    expect(ids).toContain('switch.roomba_gentle_mode'));
  it('watches the pad days row and wear-rate sensors (rendered, never watched before)', () => {
    expect(ids).toContain('sensor.roomba_pad_days_until_due');
    expect(ids).toContain('sensor.roomba_filter_wear_rate');
  });
  it('no longer watches the removed recent_coverage_pct / retired zone_select', () => {
    expect(ids).not.toContain('sensor.roomba_recent_coverage_pct');
    expect(ids).not.toContain('select.roomba_zone_select');
  });
  it('returns no duplicates', () => expect(new Set(ids).size).toBe(ids.length));
});

// v2.5.0 F3/F4/F8: resolved ids are watched — whichever exist on this install.
describe('relevantEntityIds() — v2.5.0 resolved ids', () => {
  const hass = makeHass({
    'select.roomba_cloud_zone_p1': st('Kitchen', { is_active_map: true }),
    'select.roomba_cloud_zone_p2': st('Attic', { is_active_map: false }),
    'device_tracker.roomba': st('Kitchen', { room: 'Kitchen' }),
    'sensor.roomba_battery_level': st('80'),
    'image.roomba_cleaning_map': st('idle', { rooms: { K: {} } }),
    'select.roomba_upstairs_cloud_zone_p9': st('Bath', { is_active_map: true }),
  });
  const ids = realRelevantEntityIds(hass, 'roomba', 'vacuum.roomba');

  it('watches every cloud zone select of THIS robot', () => {
    expect(ids).toContain('select.roomba_cloud_zone_p1');
    expect(ids).toContain('select.roomba_cloud_zone_p2');
    expect(ids).not.toContain('select.roomba_upstairs_cloud_zone_p9');
  });
  it('watches device_tracker.{n} (F4)', () => expect(ids).toContain('device_tracker.roomba'));
  it('watches the migrated battery and map ids (F8)', () => {
    expect(ids).toContain('sensor.roomba_battery_level');
    expect(ids).toContain('image.roomba_cleaning_map');
  });
  it('without hass, only the static list (no crash)', () =>
    expect(realRelevantEntityIds(undefined, 'roomba', 'vacuum.roomba')).not.toContain('device_tracker.roomba'));
});
