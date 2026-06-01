import { describe, it, expect } from 'vitest';
import { detectCapabilities } from '../src/capabilities';
import { makeHass, st, baseConfig } from './helpers';

const n = 'roomba';

describe('detectCapabilities()', () => {
  it('hasArea false when sensor absent', () =>
    expect(detectCapabilities(makeHass(), n, baseConfig).hasArea).toBe(false));

  it('hasArea true when sensor present', () =>
    expect(detectCapabilities(makeHass({ [`sensor.${n}_area_cleaned_today`]: st('42') }), n, baseConfig).hasArea).toBe(true));

  it('hasBrush false when sensor absent', () =>
    expect(detectCapabilities(makeHass(), n, baseConfig).hasBrush).toBe(false));

  it('hasBrush true when sensor present', () =>
    expect(detectCapabilities(makeHass({ [`sensor.${n}_brush_remaining_hours`]: st('80', { threshold_hours: 100 }) }), n, baseConfig).hasBrush).toBe(true));

  it('hasPad false when sensor absent', () =>
    expect(detectCapabilities(makeHass(), n, baseConfig).hasPad).toBe(false));

  it('hasPad true when mop_pad sensor present', () =>
    expect(detectCapabilities(makeHass({ [`sensor.${n}_mop_pad`]: st('Wet (reusable)') }), n, baseConfig).hasPad).toBe(true));

  it('isMop = false when only brush present', () => {
    const hass = makeHass({ [`sensor.${n}_brush_remaining_hours`]: st('80', { threshold_hours: 100 }) });
    expect(detectCapabilities(hass, n, baseConfig).isMop).toBe(false);
  });

  it('isMop = true when pad present and no brush', () => {
    const hass = makeHass({ [`sensor.${n}_mop_pad`]: st('Wet (reusable)') });
    const caps = detectCapabilities(hass, n, baseConfig);
    expect(caps.hasPad).toBe(true);
    expect(caps.isMop).toBe(true);
  });

  it('isMop = false when both pad and brush present', () => {
    const hass = makeHass({
      [`sensor.${n}_mop_pad`]:              st('Wet (reusable)'),
      [`sensor.${n}_brush_remaining_hours`]: st('80', { threshold_hours: 100 }),
    });
    expect(detectCapabilities(hass, n, baseConfig).isMop).toBe(false);
  });

  it('hasZones true from smart_zone_select', () =>
    expect(detectCapabilities(makeHass({ [`select.${n}_smart_zone_select`]: st('Kitchen', { options: ['Kitchen'] }) }), n, baseConfig).hasZones).toBe(true));

  it('hasZones true from zone_select fallback', () =>
    expect(detectCapabilities(makeHass({ [`select.${n}_zone_select`]: st('Zone1', { options: ['Zone1'] }) }), n, baseConfig).hasZones).toBe(true));

  it('hasZones false when neither selector exists', () =>
    expect(detectCapabilities(makeHass(), n, baseConfig).hasZones).toBe(false));

  it('hasMissionActive true from binary_sensor', () =>
    expect(detectCapabilities(makeHass({ [`binary_sensor.${n}_mission_active`]: st('on') }), n, baseConfig).hasMissionActive).toBe(true));

  it('hasMissionPhase true from sensor', () =>
    expect(detectCapabilities(makeHass({ [`sensor.${n}_mission_phase`]: st('run') }), n, baseConfig).hasMissionPhase).toBe(true));

  it('hasWearRate true from filter_wear_rate sensor', () =>
    expect(detectCapabilities(makeHass({ [`sensor.${n}_filter_wear_rate`]: st('1.2') }), n, baseConfig).hasWearRate).toBe(true));
});

describe('detectCapabilities() — F1 new caps', () => {
  it('hasDemandBlocked true from binary_sensor.*_demand_clean_blocked', () =>
    expect(detectCapabilities(makeHass({ [`binary_sensor.${n}_demand_clean_blocked`]: st('on') }), n, baseConfig).hasDemandBlocked).toBe(true));

  it('hasDemandBlocked false when entity absent', () =>
    expect(detectCapabilities(makeHass(), n, baseConfig).hasDemandBlocked).toBe(false));

  it('hasEnergyConsumption true from sensor.*_total_energy_consumed', () =>
    expect(detectCapabilities(makeHass({ [`sensor.${n}_total_energy_consumed`]: st('42.3') }), n, baseConfig).hasEnergyConsumption).toBe(true));

  it('hasEnergyConsumption false when entity absent', () =>
    expect(detectCapabilities(makeHass(), n, baseConfig).hasEnergyConsumption).toBe(false));
});

// ── Two-tier capability detection ─────────────────────────────────────────────
describe('detectCapabilities() — Tier 2 API-field caps', () => {
  it('hasWifiSignal false before loadHistory (no firstRecord)', () => {
    const caps = detectCapabilities(makeHass(), n, baseConfig);
    expect(caps.hasWifiSignal).toBe(false);
  });

  it('hasWifiSignal false when firstRecord.wifi_signal is null', () => {
    const rec = { id: 'r1', started_at: '2025-05-01T07:00:00Z', ended_at: null,
      duration_min: 30, run_min: null, area_sqft: null, result: 'completed',
      initiator: 'schedule', zones: [], error_code: null, recharges: null,
      evacuations: null, dirt_events: null, wifi_signal: null, source: 'local' as const };
    const caps = detectCapabilities(makeHass(), n, baseConfig, rec);
    expect(caps.hasWifiSignal).toBe(false);
  });

  it('hasWifiSignal true when firstRecord.wifi_signal is present', () => {
    const rec = { id: 'r1', started_at: '2025-05-01T07:00:00Z', ended_at: null,
      duration_min: 30, run_min: null, area_sqft: null, result: 'completed',
      initiator: 'schedule', zones: [], error_code: null, recharges: null,
      evacuations: null, dirt_events: null, wifi_signal: [3, 2, 4], source: 'cloud' as const };
    const caps = detectCapabilities(makeHass(), n, baseConfig, rec);
    expect(caps.hasWifiSignal).toBe(true);
  });

  it('hasRoomCoverage false when room_coverage not in firstRecord', () => {
    const rec = { id: 'r1', started_at: '2025-05-01T07:00:00Z', ended_at: null,
      duration_min: 30, run_min: null, area_sqft: null, result: 'completed',
      initiator: 'schedule', zones: [], error_code: null, recharges: null,
      evacuations: null, dirt_events: null, wifi_signal: null, source: 'cloud' as const };
    const caps = detectCapabilities(makeHass(), n, baseConfig, rec);
    expect(caps.hasRoomCoverage).toBe(false);
  });
});

// ── Config-based cap ──────────────────────────────────────────────────────────
describe('detectCapabilities() — config-based caps', () => {
  it('hasRobotSelectorHelper false when not configured', () => {
    const caps = detectCapabilities(makeHass(), n, baseConfig);
    expect(caps.hasRobotSelectorHelper).toBe(false);
  });

  it('hasRobotSelectorHelper false when helper entity absent from hass', () => {
    const cfg = { ...baseConfig, robot_selector_helper: 'input_text.active_robot' };
    const caps = detectCapabilities(makeHass(), n, cfg);
    expect(caps.hasRobotSelectorHelper).toBe(false);
  });

  it('hasRobotSelectorHelper true when helper entity present in hass', () => {
    const cfg = { ...baseConfig, robot_selector_helper: 'input_text.active_robot' };
    const hass = makeHass({ 'input_text.active_robot': st('vacuum.roomba') });
    const caps = detectCapabilities(hass, n, cfg);
    expect(caps.hasRobotSelectorHelper).toBe(true);
  });
});

// ── hasCoverageImage (v2.2+ Tier 1) ──────────────────────────────────────────
describe('detectCapabilities() — hasCoverageImage', () => {
  it('hasCoverageImage false when image entity absent', () =>
    expect(detectCapabilities(makeHass(), n, baseConfig).hasCoverageImage).toBe(false));

  it('hasCoverageImage true when image.*_coverage_map entity present', () =>
    expect(detectCapabilities(
      makeHass({ [`image.${n}_coverage_map`]: st('idle') }), n, baseConfig
    ).hasCoverageImage).toBe(true));
});

// ── B1 regression: Tier 2 uses most recent record ────────────────────────────
describe('detectCapabilities() — B1 regression: most recent record used', () => {
  it('hasWifiSignal true when last record has wifi_signal even if first does not', () => {
    // Simulates: early local records have no wifi_signal, recent cloud records do
    const oldRecord = { id: 'r1', started_at: '2025-01-01T07:00:00Z', ended_at: null,
      duration_min: 30, run_min: null, area_sqft: null, result: 'completed',
      initiator: 'schedule', zones: [], error_code: null, recharges: null,
      evacuations: null, dirt_events: null, wifi_signal: null, source: 'local' as const };
    const newRecord = { ...oldRecord, id: 'r2', started_at: '2025-05-01T07:00:00Z',
      wifi_signal: [3, 2, 4], source: 'cloud' as const };
    // Calling with newRecord (most recent) should detect wifi
    const caps = detectCapabilities(makeHass(), n, baseConfig, newRecord);
    expect(caps.hasWifiSignal).toBe(true);
    // Calling with oldRecord (oldest) would miss it
    const capsOld = detectCapabilities(makeHass(), n, baseConfig, oldRecord);
    expect(capsOld.hasWifiSignal).toBe(false);
  });
});
