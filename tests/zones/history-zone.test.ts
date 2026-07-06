import { describe, it, expect } from 'vitest';
import { renderHistoryZone, HistoryZoneState } from '../../src/zones/history-zone';
import { makeHass, defaultCaps, fullCaps, baseConfig, st } from '../helpers';
import type { DaySummary, MissionRecord } from '../../src/types';

const n = 'roomba';

const emptyState: HistoryZoneState = {
  data: null, loading: false, error: null,
  openDay: null, dayMissions: null, openDaySummary: null,
  lifetimeExpanded: false,
  historyTab: 'calendar', hazards: [],
};

function render(
  states: Record<string, ReturnType<typeof st>> = {},
  stateOpts: Partial<HistoryZoneState> = {},
  configOpts = {},
) {
  return renderHistoryZone(
    makeHass(states),
    { ...baseConfig, ...configOpts },
    fullCaps,
    n,
    { ...emptyState, ...stateOpts },
    false,
  );
}

describe('renderHistoryZone() — visibility', () => {
  it('returns empty string when show_history: false', () => {
    const html = renderHistoryZone(
      makeHass(), { ...baseConfig, show_history: false },
      defaultCaps, n, emptyState, false,
    );
    expect(html).toBe('');
  });
});

describe('renderHistoryZone() — loading and errors', () => {
  it('skeleton shown when loading and no data', () => {
    const html = render({}, { loading: true, data: null });
    expect(html).toContain('svg');
    expect(html).toContain('rpc-skel');
  });

  it('error message shown when error', () => {
    const html = render({}, { error: 'History temporarily unavailable' });
    expect(html).toContain('History temporarily unavailable');
  });

  it('partial history message shown when data.length < days', () => {
    const data: DaySummary[] = [{ date: '2025-05-14', total: 1, completed: 1, stuck: 0, area_sqft: 200, result: 'completed' }];
    const html = render({}, { data });
    expect(html).toContain('full history builds over time');
  });

  it('heatmap SVG rendered when data present', () => {
    const data: DaySummary[] = Array.from({ length: 28 }, (_, i) => ({
      date: `2025-04-${String(i + 1).padStart(2, '0')}`,
      total: 1, completed: 1, stuck: 0, area_sqft: 100, result: 'completed' as const,
    }));
    const html = render({}, { data });
    expect(html).toContain('<svg');
  });
});

describe('renderHistoryZone() — summary bar', () => {
  it('streak shown when sensor > 0', () => {
    const html = render({ [`sensor.${n}_clean_streak`]: st('14') });
    expect(html).toContain('14-day streak');
  });

  it('streak hidden when sensor is 0', () => {
    const html = render({ [`sensor.${n}_clean_streak`]: st('0') });
    expect(html).not.toContain('streak');
  });

  it('completion rate shown', () => {
    const html = render({ [`sensor.${n}_completion_rate_30d`]: st('92') });
    expect(html).toContain('92% completion rate');
  });
});

describe('renderHistoryZone() — problem zone', () => {
  it('problem zone callout shown when hasProblemZone + stuck count > 0', () => {
    const html = render({
      [`sensor.${n}_problem_zone`]:    st('Bedroom'),
      [`sensor.${n}_stuck_count_30d`]: st('3'),
    });
    expect(html).toContain('Bedroom');
    expect(html).toContain('stuck 3×');
  });

  it('problem zone callout hidden when stuck count is 0', () => {
    const html = render({
      [`sensor.${n}_problem_zone`]:    st('Bedroom'),
      [`sensor.${n}_stuck_count_30d`]: st('0'),
    });
    expect(html).not.toContain('stuck');
  });
});

describe('renderHistoryZone() — day detail popover', () => {
  const summary: DaySummary = { date: '2025-05-14', total: 2, completed: 2, stuck: 0, area_sqft: 412, result: 'completed' };
  const missions: MissionRecord[] = [
    {
      id: 'm1', started_at: '2025-05-14T07:14:00Z', ended_at: null,
      duration_min: 37, run_min: null, area_sqft: 412, result: 'completed',
      initiator: 'schedule', zones: ['Kitchen', 'Hallway'], error_code: null,
      recharges: null, evacuations: null, dirt_events: null, wifi_signal: null, source: 'local',
    },
  ];

  it('popover shown when openDay set with missions', () => {
    const html = render({}, { openDay: '2025-05-14', dayMissions: missions, openDaySummary: summary });
    expect(html).toContain('rpc-day-popover');
    expect(html).toContain('Kitchen');
  });

  it('"No missions this day" when total=0', () => {
    const zeroSummary = { ...summary, total: 0 };
    const html = render({}, { openDay: '2025-05-14', dayMissions: [], openDaySummary: zeroSummary });
    expect(html).toContain('No missions this day');
  });

  it('aggregate shown when no per-mission data but total > 0', () => {
    const html = render({}, { openDay: '2025-05-14', dayMissions: [], openDaySummary: summary });
    expect(html).toContain('Per-mission detail not available');
    expect(html).toContain('2 missions');
  });

  it('escapes zone names', () => {
    const ms: MissionRecord[] = [{
      id: 'm1', started_at: '2025-05-14T07:00:00Z', ended_at: null,
      duration_min: 30, run_min: null, area_sqft: null, result: 'completed',
      initiator: 'manual', zones: ['Kitchen & Dining'], error_code: null,
      recharges: null, evacuations: null, dirt_events: null, wifi_signal: null, source: 'local',
    }];
    const html = render({}, { openDay: '2025-05-14', dayMissions: ms, openDaySummary: summary });
    expect(html).toContain('Kitchen &amp; Dining');
  });

  // ── v2.0.2: three-tier mission result classification ─────────────────────
  // Supersedes the v2.0.1 binary success/failure icon fix. User feedback:
  // "stuck_and_resumed ist aus cloud sicht completed, battery error kann
  // auch aus cloud sicht completed sein — in beiden fällen wurde die
  // mission beendet." The binary model conflated "did the mission end"
  // with "was it a clean success." Three tiers per
  // REST_API_CONTRACT.md's result enumeration:
  //   success ✓ — completed, stuck_and_resumed
  //   caution ⚠ — mission ended with an incident: cancelled,
  //               cancelled_by_user, error/error_* (e.g. error_battery),
  //               and unclassified 'unknown' (treated cautiously, not as
  //               a hard failure, since its actual severity is unknown)
  //   failure ✗ — robot stuck and never recovered, or never started:
  //               stuck, stuck_and_abandoned, blocked_timeout
  describe('v2.0.2 three-tier mission result classification', () => {
    const mkMission = (result: string): MissionRecord => ({
      id: 'm1', started_at: '2025-05-14T07:14:00Z', ended_at: null,
      duration_min: 37, run_min: null, area_sqft: 412, result: result as MissionRecord['result'],
      initiator: 'schedule', zones: [], error_code: null,
      recharges: null, evacuations: null, dirt_events: null, wifi_signal: null, source: 'local',
    });

    const expectTier = (result: string, expectedClass: string) => {
      const html = render({}, { openDay: '2025-05-14', dayMissions: [mkMission(result)], openDaySummary: summary });
      const otherClasses = ['rpc-day-ok', 'rpc-day-caution', 'rpc-day-err'].filter(c => c !== expectedClass);
      expect(html).toContain(expectedClass);
      otherClasses.forEach(c => expect(html).not.toContain(c));
    };

    it('completed → success (✓)', () => expectTier('completed', 'rpc-day-ok'));
    it('stuck_and_resumed → success (✓) — counted as completed by the integration', () =>
      expectTier('stuck_and_resumed', 'rpc-day-ok'));

    it('cancelled → caution (⚠) — mission ended, not a hard failure', () =>
      expectTier('cancelled', 'rpc-day-caution'));
    it('cancelled_by_user → caution (⚠)', () => expectTier('cancelled_by_user', 'rpc-day-caution'));
    it('error → caution (⚠) — mission ended despite the error', () => expectTier('error', 'rpc-day-caution'));
    it('error_battery → caution (⚠) — prefix-style error result, e.g. from a live cloud record', () =>
      expectTier('error_battery', 'rpc-day-caution'));
    it('unknown → caution (⚠) — unclassified, treated cautiously rather than as a hard failure', () =>
      expectTier('unknown', 'rpc-day-caution'));

    it('stuck → failure (✗)', () => expectTier('stuck', 'rpc-day-err'));
    it('stuck_and_abandoned → failure (✗) — robot stuck and never recovered', () =>
      expectTier('stuck_and_abandoned', 'rpc-day-err'));
    it('blocked_timeout → failure (✗) — mission never ran', () =>
      expectTier('blocked_timeout', 'rpc-day-err'));
  });
});

describe('renderHistoryZone() — Wave C1 lifetime stats (SC1: migrated to cleaning_analytics_30d)', () => {
  // SC1 (integration v2.7.0): sensor.*_recent_area_30d / recent_time_30d
  // deprecated, removed in v3.0 — consolidated into cleaning_analytics_30d
  // (state = area m², `time_h` attribute = time in HOURS).
  //
  // Test data fix incidental to this migration: the old recent_time_30d
  // sensor's native unit was MINUTES, but the pre-migration test asserted
  // '1,247 h (30 d)' for a raw value of 1247 — i.e. it codified the
  // pre-existing minutes-as-hours display bug. 1247 min ≈ 20.8 h is the
  // value the same underlying 30-day window would now correctly display.
  const lifetimeStates = {
    [`sensor.${n}_lifetime_missions`]:     st('847'),
    [`sensor.${n}_cleaning_analytics_30d`]: st('25200', { time_h: 20.8 }),
  };

  it('lifetime toggle button shown when all cloud sensors present', () => {
    const html = render(lifetimeStates);
    expect(html).toContain('Stats');
    expect(html).toContain('data-lifetime-toggle');
  });

  it('lifetime stats hidden when sensors absent', () =>
    expect(render()).not.toContain('data-lifetime-toggle'));

  it('expanded content shown when lifetimeExpanded=true', () => {
    const html = render(lifetimeStates, { lifetimeExpanded: true });
    expect(html).toContain('847');
    expect(html).toContain('20.8 h (30 d)');
  });

  it('expanded content hidden when lifetimeExpanded=false', () => {
    const html = render(lifetimeStates, { lifetimeExpanded: false });
    expect(html).not.toContain('rpc-lifetime-stats');
  });

  it('show_lifetime: false → no lifetime section', () => {
    const html = render(lifetimeStates, {}, { show_lifetime: false });
    expect(html).not.toContain('data-lifetime-toggle');
  });
});

describe('renderHistoryZone() — Wave C2 dirt events', () => {
  const baseMission: MissionRecord = {
    id: 'm1', started_at: '2025-05-14T07:14:00Z', ended_at: null,
    duration_min: 37, run_min: null, area_sqft: 412, result: 'completed',
    initiator: 'schedule', zones: ['Kitchen'], error_code: null,
    recharges: null, evacuations: null, dirt_events: 3, wifi_signal: null, source: 'local',
  };
  const missions: MissionRecord[] = [baseMission];
  const summary: DaySummary = { date: '2025-05-14', total: 1, completed: 1, stuck: 0, area_sqft: 412, result: 'completed' };

  it('dirt events shown when show_dirt_events=true and dirt_events > 0', () => {
    const html = renderHistoryZone(
      makeHass(), { ...baseConfig, show_dirt_events: true },
      fullCaps, n,
      { ...emptyState, openDay: '2025-05-14', dayMissions: missions, openDaySummary: summary },
      false,
    );
    expect(html).toContain('3 dirt events');
  });

  it('dirt events hidden when show_dirt_events=false (default)', () => {
    const html = render({}, { openDay: '2025-05-14', dayMissions: missions, openDaySummary: summary });
    expect(html).not.toContain('dirt events');
  });

  it('no dirt events when dirt_events=0', () => {
    const ms = [{ ...baseMission, dirt_events: 0 }];
    const html = renderHistoryZone(
      makeHass(), { ...baseConfig, show_dirt_events: true },
      fullCaps, n,
      { ...emptyState, openDay: '2025-05-14', dayMissions: ms, openDaySummary: summary },
      false,
    );
    expect(html).not.toContain('dirt events');
  });

  it('C2 no double separator: "Kitchen · 3 dirt events" not "Kitchen · · 3 dirt events"', () => {
    const html = renderHistoryZone(
      makeHass(), { ...baseConfig, show_dirt_events: true },
      fullCaps, n,
      { ...emptyState, openDay: '2025-05-14', dayMissions: missions, openDaySummary: summary },
      false,
    );
    expect(html).not.toContain('· ·');
    expect(html).toContain('Kitchen · 3 dirt events');
  });

  it('dirt events only: no leading separator when no zones', () => {
    const ms: MissionRecord[] = [{
      id: 'm2', started_at: '2025-05-14T07:00:00Z', ended_at: null,
      duration_min: 30, run_min: null, area_sqft: null, result: 'completed',
      initiator: 'manual', zones: [], error_code: null,
      recharges: null, evacuations: null, dirt_events: 2, wifi_signal: null, source: 'local',
    }];
    const html = renderHistoryZone(
      makeHass(), { ...baseConfig, show_dirt_events: true },
      fullCaps, n,
      { ...emptyState, openDay: '2025-05-14', dayMissions: ms, openDaySummary: summary },
      false,
    );
    expect(html).toContain('2 dirt events');
    expect(html).not.toContain('· 2 dirt events'); // no leading ·
  });

  it('"1 dirt event" singular', () => {
    const ms = [{ ...baseMission, dirt_events: 1 }];
    const html = renderHistoryZone(
      makeHass(), { ...baseConfig, show_dirt_events: true },
      fullCaps, n,
      { ...emptyState, openDay: '2025-05-14', dayMissions: ms, openDaySummary: summary },
      false,
    );
    expect(html).toContain('1 dirt event');
    expect(html).not.toContain('1 dirt events');
  });
});

// ── v1.3 F6a / SC1: Speed trend in summary bar ───────────────────────────────
describe('renderHistoryZone() — F6a speed trend in summary bar (SC1: migrated to cleaning_performance)', () => {
  const n = 'roomba';

  // SC1 (integration v2.7.0): sensor.*_cleaning_speed_trend deprecated,
  // removed in v3.0 — trend now read from the `trend` attribute on
  // sensor.*_cleaning_performance.

  it('shows "↓ Speed declining" token when trend is declining', () => {
    const hass = makeHass({
      [`sensor.${n}_clean_streak`]: st('5'),
      [`sensor.${n}_cleaning_performance`]: st('12.4', { trend: 'declining' }),
    });
    const html = renderHistoryZone(hass, baseConfig, { ...defaultCaps, hasCleaningSpeedTrend: true }, n,
      { data: null, loading: false, error: null, openDay: null, dayMissions: null, openDaySummary: null, lifetimeExpanded: false, historyTab: 'calendar', hazards: [] },
      false);
    expect(html).toContain('rpc-trend-declining');
    expect(html).toContain('↓ Speed declining');
  });

  it('does not show trend token when trend is stable', () => {
    const hass = makeHass({
      [`sensor.${n}_clean_streak`]: st('5'),
      [`sensor.${n}_cleaning_performance`]: st('85.0', { trend: 'stable' }),
    });
    const html = renderHistoryZone(hass, baseConfig, { ...defaultCaps, hasCleaningSpeedTrend: true }, n,
      { data: null, loading: false, error: null, openDay: null, dayMissions: null, openDaySummary: null, lifetimeExpanded: false, historyTab: 'calendar', hazards: [] },
      false);
    expect(html).not.toContain('rpc-trend-declining');
    expect(html).not.toContain('Speed declining');
  });

  it('does not show trend when cap absent', () => {
    const hass = makeHass({
      [`sensor.${n}_cleaning_performance`]: st('12.4', { trend: 'declining' }),
    });
    const html = renderHistoryZone(hass, baseConfig, defaultCaps, n,
      { data: null, loading: false, error: null, openDay: null, dayMissions: null, openDaySummary: null, lifetimeExpanded: false, historyTab: 'calendar', hazards: [] },
      false);
    expect(html).not.toContain('Speed declining');
  });

  it('does not show trend when attribute is absent', () => {
    // Entity present (hasCleaningSpeedTrend true via flag) but `trend`
    // attribute missing — e.g. no records in the cloud window yet.
    const hass = makeHass({
      [`sensor.${n}_cleaning_performance`]: st('12.4'),
    });
    const html = renderHistoryZone(hass, baseConfig, { ...defaultCaps, hasCleaningSpeedTrend: true }, n,
      { data: null, loading: false, error: null, openDay: null, dayMissions: null, openDaySummary: null, lifetimeExpanded: false, historyTab: 'calendar', hazards: [] },
      false);
    expect(html).not.toContain('Speed');
  });
});

// ── v1.3 F6b: WiFi sparkline in day popover ───────────────────────────────────
describe('renderHistoryZone() — F6b wifi sparkline', () => {
  const n = 'roomba';

  const missionWithWifi = {
    id: 'm1', started_at: '2025-05-14T07:14:00Z', ended_at: '2025-05-14T07:51:00Z',
    duration_min: 37, run_min: 35, area_sqft: 412, result: 'completed',
    initiator: 'schedule', zones: ['Kitchen'], error_code: null,
    recharges: 0, evacuations: 0, dirt_events: null,
    // wlBars scale: 1=25%, 2=50%, 3=75% — min is 1 (25%) → red
    wifi_signal: [3, 3, 2, 2, 1, 2, 3],
    source: 'cloud' as const,
  };

  it('renders sparkline SVG when wifi_signal is present (wlBars normalised to %)', () => {
    const hass = makeHass({});
    const html = renderHistoryZone(hass, baseConfig, defaultCaps, n,
      { data: null, loading: false, error: null, openDay: '2025-05-14',
        dayMissions: [missionWithWifi],
        openDaySummary: { date: '2025-05-14', total: 1, completed: 1, stuck: 0, area_sqft: 412, result: 'completed' },
        lifetimeExpanded: false, historyTab: 'calendar', hazards: [] },
      false);
    expect(html).toContain('rpc-day-wifi');
    expect(html).toContain('<svg');
    // wlBars min=1 → normalised to 25%
    expect(html).toContain('25% min');
  });

  it('does not render wifi row when wifi_signal is null', () => {
    const hass = makeHass({});
    const missionNoWifi = { ...missionWithWifi, wifi_signal: null };
    const html = renderHistoryZone(hass, baseConfig, defaultCaps, n,
      { data: null, loading: false, error: null, openDay: '2025-05-14',
        dayMissions: [missionNoWifi],
        openDaySummary: { date: '2025-05-14', total: 1, completed: 1, stuck: 0, area_sqft: 412, result: 'completed' },
        lifetimeExpanded: false, historyTab: 'calendar', hazards: [] },
      false);
    expect(html).not.toContain('rpc-day-wifi');
  });
});

// ── T3: speed trend — improving surfaced, stable silent (L2) ──────────────────
describe('renderHistoryZone() — F6a speed trend — improving and stable (L2, SC1)', () => {
  const n = 'roomba';

  it('shows "↑ Speed improving" when trend is improving', () => {
    const hass = makeHass({
      [`sensor.${n}_cleaning_performance`]: st('92.0', { trend: 'improving' }),
    });
    const html = renderHistoryZone(hass, baseConfig, { ...defaultCaps, hasCleaningSpeedTrend: true }, n,
      { data: null, loading: false, error: null, openDay: null, dayMissions: null, openDaySummary: null, lifetimeExpanded: false, historyTab: 'calendar', hazards: [] },
      false);
    expect(html).toContain('↑ Speed improving');
  });

  it('shows nothing for "stable" trend — no noise when normal', () => {
    const hass = makeHass({
      [`sensor.${n}_cleaning_performance`]: st('85.0', { trend: 'stable' }),
    });
    const html = renderHistoryZone(hass, baseConfig, { ...defaultCaps, hasCleaningSpeedTrend: true }, n,
      { data: null, loading: false, error: null, openDay: null, dayMissions: null, openDaySummary: null, lifetimeExpanded: false, historyTab: 'calendar', hazards: [] },
      false);
    expect(html).not.toContain('Speed');
  });
});

// ── Summary bar flex-wrap tokens ──────────────────────────────────────────────
describe('renderHistoryZone() — summary bar token rendering', () => {
  const n = 'roomba';

  it('renders separator spans between tokens (flex-wrap pattern)', () => {
    const hass = makeHass({
      [`sensor.${n}_clean_streak`]: st('5'),
      [`sensor.${n}_completion_rate_30d`]: st('92'),
    });
    const html = renderHistoryZone(hass, baseConfig, defaultCaps, n,
      { data: null, loading: false, error: null, openDay: null, dayMissions: null, openDaySummary: null, lifetimeExpanded: false, historyTab: 'calendar', hazards: [] },
      false);
    expect(html).toContain('rpc-summary-sep');
    expect(html).toContain('rpc-history-summary');
  });

  it('no separator rendered for single token', () => {
    const hass = makeHass({
      [`sensor.${n}_clean_streak`]: st('3'),
    });
    const html = renderHistoryZone(hass, baseConfig, defaultCaps, n,
      { data: null, loading: false, error: null, openDay: null, dayMissions: null, openDaySummary: null, lifetimeExpanded: false, historyTab: 'calendar', hazards: [] },
      false);
    // Single token → no separator needed
    expect(html).not.toContain('rpc-summary-sep');
  });
});

// ── E1: Demand initiator badge (F1 spec) ─────────────────────────────────────
describe('renderHistoryZone() — demand initiator badge (E1)', () => {
  const baseRecord: MissionRecord = {
    id: 'm1', started_at: '2025-05-14T07:14:00Z', ended_at: '2025-05-14T07:51:00Z',
    duration_min: 37, run_min: null, area_sqft: 412,
    result: 'completed', initiator: 'schedule', zones: ['Kitchen'],
    error_code: null, recharges: null, evacuations: null,
    dirt_events: null, wifi_signal: null, source: 'cloud',
  };

  it('shows [demand] badge when initiator === "demand"', () => {
    const record: MissionRecord = { ...baseRecord, initiator: 'demand' };
    const day: DaySummary = {
      date: '2025-05-14', total: 1, completed: 1, stuck: 0,
      area_sqft: 412, result: 'completed', missions: [record],
    };
    const html = render({}, { data: [day], openDay: '2025-05-14', dayMissions: [record], openDaySummary: day });
    expect(html).toContain('rpc-initiator-badge');
    expect(html).toContain('demand');
  });

  it('does not show badge when initiator === "schedule"', () => {
    const record: MissionRecord = { ...baseRecord, initiator: 'schedule' };
    const day: DaySummary = {
      date: '2025-05-14', total: 1, completed: 1, stuck: 0,
      area_sqft: 412, result: 'completed', missions: [record],
    };
    const html = render({}, { data: [day], openDay: '2025-05-14', dayMissions: [record], openDaySummary: day });
    expect(html).not.toContain('rpc-initiator-badge');
  });

  it('does not show badge when initiator === "manual"', () => {
    const record: MissionRecord = { ...baseRecord, initiator: 'manual' };
    const day: DaySummary = {
      date: '2025-05-14', total: 1, completed: 1, stuck: 0,
      area_sqft: 412, result: 'completed', missions: [record],
    };
    const html = render({}, { data: [day], openDay: '2025-05-14', dayMissions: [record], openDaySummary: day });
    expect(html).not.toContain('rpc-initiator-badge');
  });

  it('badge coexists with zones and wifi sparkline on same row', () => {
    const record: MissionRecord = {
      ...baseRecord, initiator: 'demand',
      zones: ['Living Room'],
      wifi_signal: [3, 3, 2, 3, 4],
    };
    const day: DaySummary = {
      date: '2025-05-14', total: 1, completed: 1, stuck: 0,
      area_sqft: 412, result: 'completed', missions: [record],
    };
    const html = render({}, { data: [day], openDay: '2025-05-14', dayMissions: [record], openDaySummary: day });
    expect(html).toContain('rpc-initiator-badge');
    expect(html).toContain('Living Room');
    expect(html).toContain('rpc-day-wifi');
  });
});

// ── H3: null-guard for room_coverage and alignment_confidence (v2.2+ fields) ──
describe('renderHistoryZone() — H3 room_coverage null-guard', () => {
  const baseRecord: MissionRecord = {
    id: 'm1', started_at: '2025-05-14T07:14:00Z', ended_at: '2025-05-14T07:51:00Z',
    duration_min: 37, run_min: null, area_sqft: 412,
    result: 'completed', initiator: 'schedule', zones: [],
    error_code: null, recharges: null, evacuations: null,
    dirt_events: null, wifi_signal: null, source: 'cloud',
  };

  it('renders without error when record contains room_coverage (v2.2+ field)', () => {
    // room_coverage is Record<string, number> — keyed by display name, value 0.0–1.0
    // (corrected from speculative array-of-objects shape in card v1.5.0)
    const record: MissionRecord = {
      ...baseRecord,
      room_coverage: { 'Kitchen': 0.87, 'Hallway': 0.60 },
      alignment_confidence: 0.92,
    };
    const day: DaySummary = {
      date: '2025-05-14', total: 1, completed: 1, stuck: 0,
      area_sqft: 412, result: 'completed', missions: [record],
    };
    expect(() =>
      render({}, { data: [day], openDay: '2025-05-14', dayMissions: [record], openDaySummary: day })
    ).not.toThrow();
  });

  it('renders without error when alignment_confidence is 0 (edge case)', () => {
    // Empty dict (not empty array) — no rooms cleaned in this mission
    const record: MissionRecord = {
      ...baseRecord,
      room_coverage: {},
      alignment_confidence: 0,
    };
    const day: DaySummary = {
      date: '2025-05-14', total: 1, completed: 1, stuck: 0,
      area_sqft: 412, result: 'completed', missions: [record],
    };
    expect(() =>
      render({}, { data: [day], openDay: '2025-05-14', dayMissions: [record], openDaySummary: day })
    ).not.toThrow();
  });
});

// ── F7: Coverage heatmap tab toggle ──────────────────────────────────────────
const coverageCaps = { ...fullCaps, hasCoverageImage: true };

function renderWithCoverage(
  states: Record<string, ReturnType<typeof st>> = {},
  stateOpts: Partial<HistoryZoneState> = {},
) {
  return renderHistoryZone(
    makeHass(states),
    baseConfig,
    coverageCaps,
    n,
    { ...emptyState, ...stateOpts },
    false,
  );
}

describe('renderHistoryZone() — F7 tab toggle', () => {
  it('tab toggle absent when hasCoverageImage false', () => {
    const html = render();
    expect(html).not.toContain('rpc-history-tabs');
    expect(html).not.toContain('data-history-tab');
  });

  it('tab toggle present when hasCoverageImage true', () => {
    const html = renderWithCoverage();
    expect(html).toContain('rpc-history-tabs');
    expect(html).toContain('data-history-tab="calendar"');
    expect(html).toContain('data-history-tab="coverage"');
  });

  // ── v2.0 bug fix (found via screenshot review): the Map tab and standalone
  // History tab both reuse this zone with a forced historyTab, but the
  // internal Calendar/Coverage toggle rendered regardless — letting a tap
  // inside the dedicated Map tab silently swap its content to the calendar
  // heatmap, with no top-level indication of what had happened. ──
  describe('v2.0 suppressSubTabToggle', () => {
    it('toggle absent when suppressSubTabToggle is true, even with hasCoverageImage', () => {
      const html = renderWithCoverage({}, { suppressSubTabToggle: true });
      expect(html).not.toContain('rpc-history-tabs');
      expect(html).not.toContain('data-history-tab');
    });

    it('toggle present when suppressSubTabToggle is false', () => {
      const html = renderWithCoverage({}, { suppressSubTabToggle: false });
      expect(html).toContain('rpc-history-tabs');
    });

    it('toggle present when suppressSubTabToggle is omitted (default unset, backward compatible)', () => {
      const html = renderWithCoverage();
      expect(html).toContain('rpc-history-tabs');
    });

    it('forced historyTab content still renders correctly when toggle is suppressed', () => {
      // The Map tab forces historyTab: 'coverage' AND suppresses the toggle —
      // confirms suppressing the toggle doesn't also break the forced content.
      const html = renderWithCoverage(
        { [`image.${n}_coverage_map`]: st('idle', { entity_picture: '/api/image/serve/abc/512x512' }) },
        { historyTab: 'coverage', suppressSubTabToggle: true },
      );
      expect(html).not.toContain('rpc-history-tabs');
      expect(html).toContain('rpc-coverage-img');
    });
  });

  // ── v2.0.2: isMapContext — suppresses history-specific sections in Map tab ──
  describe('v2.0.2 isMapContext', () => {
    it('suppresses "LAST N DAYS" header in map context', () => {
      const html = renderWithCoverage({}, { isMapContext: true });
      expect(html).not.toContain('LAST 28 DAYS');
    });

    it('suppresses completion rate summary in map context', () => {
      const html = render(
        { [`sensor.${n}_completion_rate_30d`]: st('100') },
        { isMapContext: true },
      );
      expect(html).not.toContain('completion rate');
    });

    it('suppresses Stats/lifetime footer in map context', () => {
      const html = render({}, { isMapContext: true, lifetimeExpanded: false });
      expect(html).not.toContain('rpc-lifetime-toggle');
    });

    it('shows "LAST N DAYS" header normally when isMapContext is false', () => {
      const html = render({}, { isMapContext: false });
      expect(html).toContain('LAST 28 DAYS');
    });

    it('shows Stats footer normally when isMapContext is false', () => {
      // Need the lifetime_missions sensor to be present so lifetimeHtml is generated.
      const html = render(
        { [`sensor.${n}_lifetime_missions`]: st('425') },
        { isMapContext: false },
      );
      expect(html).toContain('rpc-lifetime-toggle');
    });
  });

  it('calendar tab has active class by default', () => {
    const html = renderWithCoverage();
    // The calendar button should have 'active'; coverage should not
    expect(html).toMatch(/data-history-tab="calendar"[^>]*class="rpc-tab active"|class="rpc-tab active"[^>]*data-history-tab="calendar"/);
  });

  it('coverage tab has active class when historyTab=coverage', () => {
    const html = renderWithCoverage({}, { historyTab: 'coverage' });
    expect(html).toMatch(/data-history-tab="coverage"[^>]*class="rpc-tab active"|class="rpc-tab active"[^>]*data-history-tab="coverage"/);
  });
});

// ── F7: Coverage panel ────────────────────────────────────────────────────────
describe('renderHistoryZone() — F7 coverage panel', () => {
  const imageState = st('idle', { entity_picture: '/api/image/serve/abc/512x512',
    x_min_mm: -1000, x_max_mm: 1000, y_min_mm: -800, y_max_mm: 800, last_mission_end: new Date(Date.now() - 3_600_000).toISOString() });

  it('coverage panel renders image when tab=coverage and entity present', () => {
    const html = renderWithCoverage(
      { [`image.${n}_coverage_map`]: imageState },
      { historyTab: 'coverage' },
    );
    expect(html).toContain('rpc-coverage-img');
    expect(html).toContain('/api/image/serve/abc/512x512');
  });

  it('stuck_events pins rendered with 📍 icon when extent attributes present', () => {
    const hazards = [{ gx: 3, gy: 5, x_mm: 200, y_mm: 300, stuck_count: 4,
      room_name: 'Kitchen', bearing_deg: 45, distance_mm: 360, source: 'stuck_events' as const, dominant_weekday: null, dominant_hour: null }];
    const html = renderWithCoverage(
      { [`image.${n}_coverage_map`]: imageState },
      { historyTab: 'coverage', hazards },
    );
    expect(html).toContain('rpc-hazard-pin');
    expect(html).toContain('rpc-pin-stuck_events');
    expect(html).toContain('📍');
  });

  it('robot_learned pins rendered with 🚧 icon (Q_coord resolved)', () => {
    const hazards = [{ gx: null, gy: null, x_mm: 400, y_mm: 200, stuck_count: null,
      room_name: null, bearing_deg: 90, distance_mm: 450, source: 'robot_learned' as const, dominant_weekday: null, dominant_hour: null }];
    const html = renderWithCoverage(
      { [`image.${n}_coverage_map`]: imageState },
      { historyTab: 'coverage', hazards },
    );
    expect(html).toContain('rpc-pin-robot_learned');
    expect(html).toContain('🚧');
  });

  it('keepout pins rendered with 🚫 icon (Q_coord resolved)', () => {
    const hazards = [{ gx: null, gy: null, x_mm: -300, y_mm: 500, stuck_count: null,
      room_name: 'Hallway', bearing_deg: 270, distance_mm: 583, source: 'keepout' as const, dominant_weekday: null, dominant_hour: null }];
    const html = renderWithCoverage(
      { [`image.${n}_coverage_map`]: imageState },
      { historyTab: 'coverage', hazards },
    );
    expect(html).toContain('rpc-pin-keepout');
    expect(html).toContain('🚫');
  });

  it('coverage panel renders without pins when hazards=[]', () => {
    const html = renderWithCoverage(
      { [`image.${n}_coverage_map`]: imageState },
      { historyTab: 'coverage', hazards: [] },
    );
    expect(html).toContain('rpc-coverage-img');
    expect(html).not.toContain('rpc-hazard-pin');
  });

  // ── v2.3.0 F22 — temporal hotspot data ────────────────────────────────────
  describe('F22 temporal pattern', () => {
    it('appends "usually <day> ~<hour>" to the tooltip when both fields present', () => {
      const hazards = [{ gx: 3, gy: 5, x_mm: 200, y_mm: 300, stuck_count: 9,
        room_name: 'Kitchen', bearing_deg: 45, distance_mm: 360, source: 'stuck_events' as const,
        dominant_weekday: 0, dominant_hour: 9 }];
      const html = renderWithCoverage(
        { [`image.${n}_coverage_map`]: imageState },
        { historyTab: 'coverage', hazards },
      );
      // dominant_weekday: 0 is Monday (Python datetime.weekday() convention,
      // NOT JS Date.getDay()'s Sunday=0) — verified against integration source.
      expect(html).toContain('usually Mon ~9am');
    });

    it('formats afternoon/midnight/noon hours correctly (12-hour, no minutes)', () => {
      const hazards = [
        { gx: 1, gy: 1, x_mm: 0, y_mm: 0, stuck_count: 9, room_name: null,
          bearing_deg: 0, distance_mm: 0, source: 'stuck_events' as const,
          dominant_weekday: 6, dominant_hour: 14 },
      ];
      const html = renderWithCoverage(
        { [`image.${n}_coverage_map`]: imageState },
        { historyTab: 'coverage', hazards },
      );
      // dominant_weekday: 6 is Sunday in the Python convention.
      expect(html).toContain('usually Sun ~2pm');
    });

    it('no pattern text when dominant_weekday/dominant_hour are null (threshold gap or n/a)', () => {
      const hazards = [{ gx: 3, gy: 5, x_mm: 200, y_mm: 300, stuck_count: 4,
        room_name: 'Kitchen', bearing_deg: 45, distance_mm: 360, source: 'stuck_events' as const,
        dominant_weekday: null, dominant_hour: null }];
      const html = renderWithCoverage(
        { [`image.${n}_coverage_map`]: imageState },
        { historyTab: 'coverage', hazards },
      );
      expect(html).not.toContain('usually');
    });

    it('robot_learned/keepout pins never show a pattern even if the fields were non-null', () => {
      const hazards = [{ gx: null, gy: null, x_mm: 400, y_mm: 200, stuck_count: null,
        room_name: null, bearing_deg: 90, distance_mm: 450, source: 'robot_learned' as const,
        dominant_weekday: 0, dominant_hour: 9 }];
      const html = renderWithCoverage(
        { [`image.${n}_coverage_map`]: imageState },
        { historyTab: 'coverage', hazards },
      );
      expect(html).not.toContain('usually');
    });

    it('shows the shared threshold-gap footnote when a 3–7-count pin lacks a pattern', () => {
      const hazards = [{ gx: 3, gy: 5, x_mm: 200, y_mm: 300, stuck_count: 5,
        room_name: 'Kitchen', bearing_deg: 45, distance_mm: 360, source: 'stuck_events' as const,
        dominant_weekday: null, dominant_hour: null }];
      const html = renderWithCoverage(
        { [`image.${n}_coverage_map`]: imageState },
        { historyTab: 'coverage', hazards },
      );
      expect(html).toContain('Time patterns need ≥8 stuck events');
    });

    it('no footnote once the pin has reached the pattern threshold', () => {
      const hazards = [{ gx: 3, gy: 5, x_mm: 200, y_mm: 300, stuck_count: 9,
        room_name: 'Kitchen', bearing_deg: 45, distance_mm: 360, source: 'stuck_events' as const,
        dominant_weekday: 0, dominant_hour: 9 }];
      const html = renderWithCoverage(
        { [`image.${n}_coverage_map`]: imageState },
        { historyTab: 'coverage', hazards },
      );
      expect(html).not.toContain('Time patterns need');
    });

    it('no footnote when stuck_count is below 3 (not even hotspot-eligible) or already at/above 8', () => {
      const hazards = [{ gx: 3, gy: 5, x_mm: 200, y_mm: 300, stuck_count: 2,
        room_name: 'Kitchen', bearing_deg: 45, distance_mm: 360, source: 'stuck_events' as const,
        dominant_weekday: null, dominant_hour: null }];
      const html = renderWithCoverage(
        { [`image.${n}_coverage_map`]: imageState },
        { historyTab: 'coverage', hazards },
      );
      expect(html).not.toContain('Time patterns need');
    });
  });

  // ── v2.0 C7-ROOM-BOUNDS: room polygon overlay + tap-to-select ────────────
  describe('v2.0 C7-ROOM-BOUNDS room overlay', () => {
    const roomsAttr = {
      Kitchen: {
        outline: [[-200, -100], [200, -100], [200, 100], [-200, 100]] as [number, number][],
        name: 'Kitchen', room_id: 'kitchen', icon: 'mdi:fridge', x: 0, y: 0,
      },
      Hallway: {
        outline: [[300, -50], [500, -50], [500, 50], [300, 50]] as [number, number][],
        name: 'Hallway', room_id: 'hallway', icon: 'mdi:door', x: 400, y: 0,
      },
    };
    // v2.3.0 CORRECTION: rooms/calibration_points live on image.*_map
    // (RoombaMapImage), NOT image.*_coverage_map (RoombaCoverageImage —
    // verified against source to carry neither attribute at all). Three
    // calibration anchor points, matching the integration's own
    // (minX,minY)/(maxX,minY)/(maxX,maxY) construction — see
    // calibration.test.ts for the transform math itself; here they just
    // need to be internally consistent so the overlay renders.
    const calibrationPoints = [
      { vacuum: { x: -1000, y: -800 }, map: { x: 0, y: 480 } },
      { vacuum: { x: 1000, y: -800 }, map: { x: 600, y: 480 } },
      { vacuum: { x: 1000, y: 800 }, map: { x: 600, y: 0 } },
    ];
    const coverageImageState = st('idle', {
      entity_picture: '/api/image/serve/abc/512x512',
      x_min_mm: -1000, x_max_mm: 1000, y_min_mm: -800, y_max_mm: 800,
    });
    const mapImageState = st('idle', {
      rooms: roomsAttr,
      calibration_points: calibrationPoints,
    });

    it('renders room polygons and labels when caps.hasAlignment is true', () => {
      const html = renderHistoryZone(
        makeHass({
          [`image.${n}_coverage_map`]: coverageImageState,
          [`image.${n}_map`]: mapImageState,
        }),
        baseConfig, { ...coverageCaps, hasAlignment: true }, n,
        { ...emptyState, historyTab: 'coverage' }, false,
      );
      expect(html).toContain('rpc-room-overlay');
      expect(html).toContain('data-room-poly="Kitchen"');
      expect(html).toContain('data-room-poly="Hallway"');
      expect(html).toContain('data-room-label="Kitchen"');
    });

    it('omits room overlay when caps.hasAlignment is false, even with rooms data present', () => {
      const html = renderHistoryZone(
        makeHass({
          [`image.${n}_coverage_map`]: coverageImageState,
          [`image.${n}_map`]: mapImageState,
        }),
        baseConfig, { ...coverageCaps, hasAlignment: false }, n,
        { ...emptyState, historyTab: 'coverage' }, false,
      );
      expect(html).not.toContain('rpc-room-overlay');
      expect(html).not.toContain('data-room-poly');
    });

    it('marks a room as selected when present in mapSelectedRooms', () => {
      const html = renderHistoryZone(
        makeHass({
          [`image.${n}_coverage_map`]: coverageImageState,
          [`image.${n}_map`]: mapImageState,
        }),
        baseConfig, { ...coverageCaps, hasAlignment: true }, n,
        { ...emptyState, historyTab: 'coverage', mapSelectedRooms: new Set(['Kitchen']) }, false,
      );
      const kitchenPoly = html.match(/<polygon[^>]*data-room-poly="Kitchen"[^>]*>/)?.[0] ?? '';
      const hallwayPoly = html.match(/<polygon[^>]*data-room-poly="Hallway"[^>]*>/)?.[0] ?? '';
      expect(kitchenPoly).toContain('rpc-room-poly--selected');
      expect(hallwayPoly).not.toContain('rpc-room-poly--selected');
    });

    it('omits room overlay when calibration_points are absent (graceful degradation — no transform to derive)', () => {
      const noCalMapState = st('idle', { rooms: roomsAttr });
      const html = renderHistoryZone(
        makeHass({
          [`image.${n}_coverage_map`]: coverageImageState,
          [`image.${n}_map`]: noCalMapState,
        }),
        baseConfig, { ...coverageCaps, hasAlignment: true }, n,
        { ...emptyState, historyTab: 'coverage' }, false,
      );
      expect(html).not.toContain('rpc-room-overlay');
    });

    it('omits room overlay when image.*_map itself is entirely absent', () => {
      const html = renderHistoryZone(
        makeHass({ [`image.${n}_coverage_map`]: coverageImageState }),
        baseConfig, { ...coverageCaps, hasAlignment: true }, n,
        { ...emptyState, historyTab: 'coverage' }, false,
      );
      expect(html).not.toContain('rpc-room-overlay');
    });

    // ── v2.3.0 ZONE-OVERLAY / F24 — zones, door markers, furniture shadows.
    // All three share image.*_map + calibration_points with rooms above;
    // all gated on their own cap flag AND caps.hasAlignment (the transform
    // itself requires calibration_points, same source as rooms). ──
    describe('v2.3.0 ZONE-OVERLAY: observed/keepout zones', () => {
      it('renders an observed-obstacle circle', () => {
        const html = renderHistoryZone(
          makeHass({
            [`image.${n}_coverage_map`]: coverageImageState,
            [`image.${n}_map`]: st('idle', {
              rooms: roomsAttr, calibration_points: calibrationPoints,
              zones: [{ type: 'observed', x: 100, y: 200 }],
            }),
          }),
          baseConfig, { ...coverageCaps, hasAlignment: true, hasZoneOverlays: true }, n,
          { ...emptyState, historyTab: 'coverage' }, false,
        );
        expect(html).toContain('rpc-zone-observed');
      });

      it('renders a keepout polygon', () => {
        const html = renderHistoryZone(
          makeHass({
            [`image.${n}_coverage_map`]: coverageImageState,
            [`image.${n}_map`]: st('idle', {
              rooms: roomsAttr, calibration_points: calibrationPoints,
              zones: [{ type: 'keepout', polygon: [[0, 0], [100, 0], [100, 100]] }],
            }),
          }),
          baseConfig, { ...coverageCaps, hasAlignment: true, hasZoneOverlays: true }, n,
          { ...emptyState, historyTab: 'coverage' }, false,
        );
        expect(html).toContain('rpc-zone-keepout');
      });

      it('skips a degenerate keepout polygon (fewer than 3 vertices) without throwing', () => {
        const html = renderHistoryZone(
          makeHass({
            [`image.${n}_coverage_map`]: coverageImageState,
            [`image.${n}_map`]: st('idle', {
              rooms: roomsAttr, calibration_points: calibrationPoints,
              zones: [{ type: 'keepout', polygon: [[0, 0], [100, 0]] }],
            }),
          }),
          baseConfig, { ...coverageCaps, hasAlignment: true, hasZoneOverlays: true }, n,
          { ...emptyState, historyTab: 'coverage' }, false,
        );
        expect(html).not.toContain('rpc-zone-keepout');
      });

      it('omits zone overlay when hasZoneOverlays is false, even with zones data present', () => {
        const html = renderHistoryZone(
          makeHass({
            [`image.${n}_coverage_map`]: coverageImageState,
            [`image.${n}_map`]: st('idle', {
              rooms: roomsAttr, calibration_points: calibrationPoints,
              zones: [{ type: 'observed', x: 100, y: 200 }],
            }),
          }),
          baseConfig, { ...coverageCaps, hasAlignment: true, hasZoneOverlays: false }, n,
          { ...emptyState, historyTab: 'coverage' }, false,
        );
        expect(html).not.toContain('rpc-zone-observed');
      });
    });

    describe('v2.3.0 ZONE-OVERLAY: door markers', () => {
      it('renders a door marker with a label + mission-count tooltip', () => {
        const html = renderHistoryZone(
          makeHass({
            [`image.${n}_coverage_map`]: coverageImageState,
            [`image.${n}_map`]: st('idle', {
              rooms: roomsAttr, calibration_points: calibrationPoints,
              door_markers: [{ id: 'dm_1', cx: 100, cy: 200, label: 'Hallway door', mission_count: 4 }],
            }),
          }),
          baseConfig, { ...coverageCaps, hasAlignment: true, hasDoorMarkers: true }, n,
          { ...emptyState, historyTab: 'coverage' }, false,
        );
        expect(html).toContain('rpc-door-marker');
        expect(html).toContain('Hallway door (seen 4×)');
      });

      it('omits door markers when hasDoorMarkers is false', () => {
        const html = renderHistoryZone(
          makeHass({
            [`image.${n}_coverage_map`]: coverageImageState,
            [`image.${n}_map`]: st('idle', {
              rooms: roomsAttr, calibration_points: calibrationPoints,
              door_markers: [{ id: 'dm_1', cx: 100, cy: 200, label: 'Hallway door', mission_count: 4 }],
            }),
          }),
          baseConfig, { ...coverageCaps, hasAlignment: true, hasDoorMarkers: false }, n,
          { ...emptyState, historyTab: 'coverage' }, false,
        );
        expect(html).not.toContain('rpc-door-marker');
      });
    });

    describe('v2.3.0 F24: furniture shadows', () => {
      it('renders a furniture shadow marker', () => {
        const html = renderHistoryZone(
          makeHass({
            [`image.${n}_coverage_map`]: coverageImageState,
            [`image.${n}_map`]: st('idle', {
              rooms: roomsAttr, calibration_points: calibrationPoints,
              furniture_candidates: [{ x_mm: 150, y_mm: 250 }],
            }),
          }),
          baseConfig, { ...coverageCaps, hasAlignment: true, hasFurnitureShadows: true }, n,
          { ...emptyState, historyTab: 'coverage' }, false,
        );
        expect(html).toContain('rpc-furniture-shadow');
      });

      it('omits furniture shadows when hasFurnitureShadows is false', () => {
        const html = renderHistoryZone(
          makeHass({
            [`image.${n}_coverage_map`]: coverageImageState,
            [`image.${n}_map`]: st('idle', {
              rooms: roomsAttr, calibration_points: calibrationPoints,
              furniture_candidates: [{ x_mm: 150, y_mm: 250 }],
            }),
          }),
          baseConfig, { ...coverageCaps, hasAlignment: true, hasFurnitureShadows: false }, n,
          { ...emptyState, historyTab: 'coverage' }, false,
        );
        expect(html).not.toContain('rpc-furniture-shadow');
      });

      it('no furniture shadows, zones, or door markers render when caps.hasAlignment is false (calibration transform unavailable)', () => {
        const html = renderHistoryZone(
          makeHass({
            [`image.${n}_coverage_map`]: coverageImageState,
            [`image.${n}_map`]: st('idle', {
              rooms: roomsAttr, calibration_points: calibrationPoints,
              zones: [{ type: 'observed', x: 100, y: 200 }],
              door_markers: [{ id: 'dm_1', cx: 100, cy: 200, label: 'Door', mission_count: 1 }],
              furniture_candidates: [{ x_mm: 150, y_mm: 250 }],
            }),
          }),
          baseConfig, { ...coverageCaps, hasAlignment: false, hasZoneOverlays: true, hasDoorMarkers: true, hasFurnitureShadows: true }, n,
          { ...emptyState, historyTab: 'coverage' }, false,
        );
        expect(html).not.toContain('rpc-zone-observed');
        expect(html).not.toContain('rpc-door-marker');
        expect(html).not.toContain('rpc-furniture-shadow');
      });
    });


    describe('region_areas_m2 area annotation', () => {
      it('appends area to the label when region_areas_m2 has data for that room', () => {
        const html = renderHistoryZone(
          makeHass({
            [`image.${n}_coverage_map`]: coverageImageState,
            [`image.${n}_map`]: mapImageState,
            [`select.${n}_smart_zone_select`]: st('Kitchen', { options: ['Kitchen', 'Hallway'], region_areas_m2: { Kitchen: 20.0 } }),
          }),
          baseConfig, { ...coverageCaps, hasAlignment: true, hasSmartZones: true }, n,
          { ...emptyState, historyTab: 'coverage' }, false,
        );
        const kitchenLabel = html.match(/<div[^>]*data-room-label="Kitchen"[^>]*>[\s\S]*?<\/div>/)?.[0] ?? '';
        expect(kitchenLabel).toContain('20.0 m²');
      });

      it('shows name only (no area suffix) when region_areas_m2 lacks data for that specific room', () => {
        const html = renderHistoryZone(
          makeHass({
            [`image.${n}_coverage_map`]: coverageImageState,
            [`image.${n}_map`]: mapImageState,
            // Only Kitchen has an area; Hallway is absent from the dict —
            // e.g. partial cloud data for that room.
            [`select.${n}_smart_zone_select`]: st('Kitchen', { options: ['Kitchen', 'Hallway'], region_areas_m2: { Kitchen: 20.0 } }),
          }),
          baseConfig, { ...coverageCaps, hasAlignment: true, hasSmartZones: true }, n,
          { ...emptyState, historyTab: 'coverage' }, false,
        );
        const hallwayLabel = html.match(/<div[^>]*data-room-label="Hallway"[^>]*>[\s\S]*?<\/div>/)?.[0] ?? '';
        expect(hallwayLabel).not.toContain('m²');
        expect(hallwayLabel).toContain('Hallway');
      });

      it('shows name only when the select entity is entirely absent (local-only / old integration / EPHEMERAL without CloudSmartZoneSelect)', () => {
        const html = renderHistoryZone(
          makeHass({
            [`image.${n}_coverage_map`]: coverageImageState,
            [`image.${n}_map`]: mapImageState,
          }),
          baseConfig, { ...coverageCaps, hasAlignment: true, hasSmartZones: true }, n,
          { ...emptyState, historyTab: 'coverage' }, false,
        );
        expect(html).toContain('data-room-label="Kitchen"');
        expect(html).not.toContain('m²');
      });

      it('falls back to zone_select entity id when hasSmartZones is false', () => {
        const html = renderHistoryZone(
          makeHass({
            [`image.${n}_coverage_map`]: coverageImageState,
            [`image.${n}_map`]: mapImageState,
            [`select.${n}_zone_select`]: st('Kitchen', { options: ['Kitchen'], region_areas_m2: { Kitchen: 15.5 } }),
          }),
          baseConfig, { ...coverageCaps, hasAlignment: true, hasSmartZones: false }, n,
          { ...emptyState, historyTab: 'coverage' }, false,
        );
        const kitchenLabel = html.match(/<div[^>]*data-room-label="Kitchen"[^>]*>[\s\S]*?<\/div>/)?.[0] ?? '';
        expect(kitchenLabel).toContain('15.5 m²');
      });

      it('does not throw and shows name only when region_areas_m2 attribute is malformed (not an object)', () => {
        const html = renderHistoryZone(
          makeHass({
            [`image.${n}_coverage_map`]: coverageImageState,
            [`image.${n}_map`]: mapImageState,
            [`select.${n}_smart_zone_select`]: st('Kitchen', { options: ['Kitchen'], region_areas_m2: 'not-an-object' }),
          }),
          baseConfig, { ...coverageCaps, hasAlignment: true, hasSmartZones: true }, n,
          { ...emptyState, historyTab: 'coverage' }, false,
        );
        expect(html).toContain('data-room-label="Kitchen"');
        expect(html).not.toContain('m²');
      });
    });
  });

  it('coverage image renders without pins when extent attrs absent (R2 graceful degradation)', () => {
    const noExtentState = st('idle', { entity_picture: '/api/image/serve/abc/512x512' });
    const hazards = [{ gx: 3, gy: 5, x_mm: 200, y_mm: 300, stuck_count: 2,
      room_name: null, bearing_deg: 45, distance_mm: 360, source: 'stuck_events' as const, dominant_weekday: null, dominant_hour: null }];
    const html = renderWithCoverage(
      { [`image.${n}_coverage_map`]: noExtentState },
      { historyTab: 'coverage', hazards },
    );
    expect(html).toContain('rpc-coverage-img');
    expect(html).not.toContain('rpc-hazard-pin');
  });

  it('grid accumulating note shown when extent absent but image present (R2)', () => {
    const noExtentState = st('idle', { entity_picture: '/api/image/serve/abc/512x512' });
    const html = renderWithCoverage(
      { [`image.${n}_coverage_map`]: noExtentState },
      { historyTab: 'coverage' },
    );
    expect(html).toContain('grid accumulating');
  });

  it('legend shows entries only for pin sources that are present', () => {
    const hazards = [
      { gx: 3, gy: 5, x_mm: 200, y_mm: 300, stuck_count: 4, room_name: null,
        bearing_deg: 45, distance_mm: 360, source: 'stuck_events' as const, dominant_weekday: null, dominant_hour: null },
    ];
    const html = renderWithCoverage(
      { [`image.${n}_coverage_map`]: imageState },
      { historyTab: 'coverage', hazards },
    );
    expect(html).toContain('📍');       // stuck present
    expect(html).not.toContain('🚧');  // robot_learned absent
    expect(html).not.toContain('🚫');  // keepout absent
  });
});

// ── F8: Room coverage in day detail popover ───────────────────────────────────
describe('renderHistoryZone() — F8 room coverage chips', () => {
  const baseRecord: MissionRecord = {
    id: 'm1', started_at: '2025-05-14T07:14:00Z', ended_at: '2025-05-14T07:51:00Z',
    duration_min: 37, run_min: null, area_sqft: 412,
    result: 'completed', initiator: 'schedule', zones: [],
    error_code: null, recharges: null, evacuations: null,
    dirt_events: null, wifi_signal: null, source: 'cloud',
  };
  const day: DaySummary = {
    date: '2025-05-14', total: 1, completed: 1, stuck: 0,
    area_sqft: 412, result: 'completed',
  };

  it('room_coverage chips rendered with correct colour classes', () => {
    const record: MissionRecord = { ...baseRecord,
      room_coverage: { 'Kitchen': 0.82, 'Hallway': 0.65, 'Bathroom': 0.48 } };
    const html = render({}, { data: [day], openDay: '2025-05-14',
      dayMissions: [record], openDaySummary: { ...day, missions: [record] } });
    expect(html).toContain('rpc-cov-green');   // Kitchen 82% ≥ 80
    expect(html).toContain('rpc-cov-amber');   // Hallway 65%  60–79
    expect(html).toContain('rpc-cov-red');     // Bathroom 48% < 60
    expect(html).toContain('Kitchen 82%');
    expect(html).toContain('Hallway 65%');
    expect(html).toContain('Bathroom 48%');
  });

  it('alignment note shown when confidence < 0.85', () => {
    const record: MissionRecord = { ...baseRecord,
      room_coverage: { 'Kitchen': 0.75 }, alignment_confidence: 0.72 };
    const html = render({}, { data: [day], openDay: '2025-05-14',
      dayMissions: [record], openDaySummary: { ...day, missions: [record] } });
    expect(html).toContain('alignment confidence: 72%');
    expect(html).toContain('rpc-alignment-note');
  });

  it('alignment note absent when confidence ≥ 0.85', () => {
    const record: MissionRecord = { ...baseRecord,
      room_coverage: { 'Kitchen': 0.90 }, alignment_confidence: 0.91 };
    const html = render({}, { data: [day], openDay: '2025-05-14',
      dayMissions: [record], openDaySummary: { ...day, missions: [record] } });
    expect(html).not.toContain('alignment confidence');
    expect(html).not.toContain('rpc-alignment-note');
  });

  it('room_coverage block absent when field undefined', () => {
    const record: MissionRecord = { ...baseRecord };
    const html = render({}, { data: [day], openDay: '2025-05-14',
      dayMissions: [record], openDaySummary: { ...day, missions: [record] } });
    expect(html).not.toContain('rpc-room-coverage');
  });
});

// ── F12: Cleaned rooms sequence in today's day detail ─────────────────────────
describe('renderHistoryZone() — F12 cleaned rooms sequence', () => {
  const todayStr = new Date().toLocaleDateString('en-CA');

  const todayRecord: MissionRecord = {
    id: 'm1', started_at: `${todayStr}T07:14:00Z`, ended_at: `${todayStr}T07:51:00Z`,
    duration_min: 37, run_min: null, area_sqft: 412,
    result: 'completed', initiator: 'schedule', zones: [],
    error_code: null, recharges: null, evacuations: null,
    dirt_events: null, wifi_signal: null, source: 'cloud',
  };
  const todaySummary: DaySummary = {
    date: todayStr, total: 1, completed: 1, stuck: 0,
    area_sqft: 412, result: 'completed',
  };

  it('sequence row shown when openDay is today and last_cleaned_rooms present', () => {
    const html = renderHistoryZone(
      makeHass({ [`vacuum.roomba`]: st('docked', { last_cleaned_rooms: ['Kitchen', 'Hallway'] }) }),
      baseConfig, fullCaps, 'roomba',
      { ...emptyState, data: [todaySummary], openDay: todayStr,
        dayMissions: [todayRecord], openDaySummary: todaySummary },
      false,
    );
    expect(html).toContain('rpc-traversal-row');
    expect(html).toContain('Kitchen');
    expect(html).toContain('rpc-trav-sep');
  });

  it('sequence row absent when openDay is not today', () => {
    const html = renderHistoryZone(
      makeHass({ [`vacuum.roomba`]: st('docked', { last_cleaned_rooms: ['Kitchen'] }) }),
      baseConfig, fullCaps, 'roomba',
      { ...emptyState, data: [todaySummary], openDay: '2025-01-01',
        dayMissions: [todayRecord], openDaySummary: todaySummary },
      false,
    );
    expect(html).not.toContain('rpc-traversal-row');
  });

  it('sequence row absent when last_cleaned_rooms is empty', () => {
    const html = renderHistoryZone(
      makeHass({ [`vacuum.roomba`]: st('docked', { last_cleaned_rooms: [] }) }),
      baseConfig, fullCaps, 'roomba',
      { ...emptyState, data: [todaySummary], openDay: todayStr,
        dayMissions: [todayRecord], openDaySummary: todaySummary },
      false,
    );
    expect(html).not.toContain('rpc-traversal-row');
  });

  it('mission_destination line shown below sequence when attribute present', () => {
    const html = renderHistoryZone(
      makeHass({ [`vacuum.roomba`]: st('docked', {
        last_cleaned_rooms: ['Kitchen'], mission_destination: 'Kitchen',
      }) }),
      baseConfig, fullCaps, 'roomba',
      { ...emptyState, data: [todaySummary], openDay: todayStr,
        dayMissions: [todayRecord], openDaySummary: todaySummary },
      false,
    );
    expect(html).toContain('rpc-mission-dest-popover');
    expect(html).toContain('Final: Kitchen');
  });
});

describe('renderHistoryZone() — v2.2.0 F1 "Why?" explanation', () => {
  const summary: DaySummary = { date: '2025-05-14', total: 2, completed: 1, stuck: 0, area_sqft: 100, result: 'error' };
  const mk = (id: string, result: string, source: 'local' | 'cloud' = 'local'): MissionRecord => ({
    id, started_at: '2025-05-14T07:14:00Z', ended_at: null,
    duration_min: 20, run_min: null, area_sqft: null, result,
    initiator: 'schedule', zones: [], error_code: null,
    recharges: null, evacuations: null, dirt_events: null, wifi_signal: null, source,
  });

  it('v2.3.0 EXPLAIN-CLOUD: Why? button now shows on cloud-source rows too (integration resolves c_{ts} ids via a dedicated cloud-fallback path — verified against source)', () => {
    const html = render({}, {
      openDay: '2025-05-14', openDaySummary: summary,
      dayMissions: [mk('c_1750912345', 'error_battery', 'cloud')],
    });
    expect(html).toContain('data-explain="c_1750912345"');
  });

  it('shows Why? button on caution and failure missions, not on success', () => {
    const html = render({}, {
      openDay: '2025-05-14', openDaySummary: summary,
      dayMissions: [mk('m1', 'completed'), mk('m2', 'error_battery'), mk('m3', 'stuck')],
    });
    const count = (html.match(/data-explain=/g) ?? []).length;
    expect(count).toBe(2);
    expect(html).toContain('data-explain="m2"');
    expect(html).toContain('data-explain="m3"');
  });

  it('shows loading panel while data is null without error', () => {
    const html = render({}, {
      openDay: '2025-05-14', openDaySummary: summary,
      dayMissions: [mk('m2', 'error')],
      openExplain: { missionId: 'm2', data: null },
    });
    expect(html).toContain('Analysing…');
  });

  it('renders anomalous explanation with friendly reason label and recommendation', () => {
    const html = render({}, {
      openDay: '2025-05-14', openDaySummary: summary,
      dayMissions: [mk('m2', 'error')],
      openExplain: { missionId: 'm2', data: {
        mission_id: 'm2', is_anomalous: true, anomaly_reason: 'obstacle_or_blockage',
        robot_lifted: true, error_code: 2,
        recommended_action: 'Check for cords, rugs, or furniture.',
      } },
    });
    expect(html).toContain('Obstacle or blockage');
    expect(html).toContain('picked up during this mission');
    expect(html).toContain('Check for cords, rugs, or furniture.');
  });

  it('is_anomalous=false renders the "nothing unusual" answer', () => {
    const html = render({}, {
      openDay: '2025-05-14', openDaySummary: summary,
      dayMissions: [mk('m2', 'cancelled')],
      openExplain: { missionId: 'm2', data: {
        mission_id: 'm2', is_anomalous: false, anomaly_reason: null,
        robot_lifted: false, error_code: null, recommended_action: null,
      } },
    });
    expect(html).toContain('Nothing statistically unusual');
  });

  it('error state renders graceful integration-version hint', () => {
    const html = render({}, {
      openDay: '2025-05-14', openDaySummary: summary,
      dayMissions: [mk('m2', 'error')],
      openExplain: { missionId: 'm2', data: null, error: true },
    });
    expect(html).toContain('Explanation not available for this mission.');
  });

  it('unknown future reason keys degrade to readable text, never hidden', () => {
    const html = render({}, {
      openDay: '2025-05-14', openDaySummary: summary,
      dayMissions: [mk('m2', 'error')],
      openExplain: { missionId: 'm2', data: {
        mission_id: 'm2', is_anomalous: true, anomaly_reason: 'thermal_throttling',
        robot_lifted: false, error_code: null, recommended_action: null,
      } },
    });
    expect(html).toContain('thermal throttling');
  });

  it('panel attaches only to the matching mission', () => {
    const html = render({}, {
      openDay: '2025-05-14', openDaySummary: summary,
      dayMissions: [mk('m2', 'error'), mk('m3', 'stuck')],
      openExplain: { missionId: 'm3', data: null },
    });
    const m2Idx = html.indexOf('data-explain="m2"');
    const m3Idx = html.indexOf('data-explain="m3"');
    const panelIdx = html.indexOf('rpc-explain-panel');
    expect(panelIdx).toBeGreaterThan(m3Idx);
    expect(m3Idx).toBeGreaterThan(m2Idx);
  });
});

describe('renderHistoryZone() — v2.2.0 F4 path replay', () => {
  const summary: DaySummary = { date: '2025-05-14', total: 1, completed: 1, stuck: 0, area_sqft: 100, result: 'completed' };
  const mk = (over: Partial<MissionRecord> = {}): MissionRecord => ({
    id: 'm1', started_at: '2025-05-14T07:14:00Z', ended_at: null,
    duration_min: 20, run_min: null, area_sqft: null, result: 'completed',
    initiator: 'schedule', zones: [], error_code: null,
    recharges: null, evacuations: null, dirt_events: null, wifi_signal: null, source: 'cloud',
    ...over,
  });

  it('no Route button when n_mssn absent (integration ≤ 3.2.0 records)', () => {
    const html = render({}, { openDay: '2025-05-14', openDaySummary: summary, dayMissions: [mk()] });
    expect(html).not.toContain('data-replay');
  });

  it('Route button appears when n_mssn present — also on success missions', () => {
    const html = render({}, { openDay: '2025-05-14', openDaySummary: summary, dayMissions: [mk({ n_mssn: 425 })] });
    expect(html).toContain('data-replay="425"');
  });

  it('renders room timeline with times and separators', () => {
    const html = render({}, {
      openDay: '2025-05-14', openDaySummary: summary, dayMissions: [mk({ n_mssn: 425 })],
      openReplay: { nMssn: 425, data: { nMssn: 425, path: [
        { room: 'Kitchen', time: '2025-05-14T07:05:00Z' },
        { room: 'Hallway & More', time: '2025-05-14T07:23:00Z' },
      ] } },
    });
    expect(html).toContain('rpc-replay-panel');
    expect(html).toContain('Kitchen');
    expect(html).toContain('Hallway &amp; More');
    expect(html).toContain('rpc-trav-sep');
  });

  it('empty path renders honest fallback', () => {
    const html = render({}, {
      openDay: '2025-05-14', openDaySummary: summary, dayMissions: [mk({ n_mssn: 425 })],
      openReplay: { nMssn: 425, data: { nMssn: 425, path: [] } },
    });
    expect(html).toContain('No room-level path recorded');
  });

  it('error state renders graceful message', () => {
    const html = render({}, {
      openDay: '2025-05-14', openDaySummary: summary, dayMissions: [mk({ n_mssn: 425 })],
      openReplay: { nMssn: 425, data: null, error: true },
    });
    expect(html).toContain('Path not available');
  });
});

describe('renderHistoryZone() — v2.2.0 A2 lifetime dirt-detection counters', () => {
  it('shows dirt detect line in expanded Stats when sensors present', () => {
    const html = render({
      [`sensor.${n}_lifetime_missions`]:        st('425'),
      [`sensor.${n}_optical_dirt_detections`]:  st('1043'),
      [`sensor.${n}_piezo_dirt_detections`]:    st('877'),
      [`sensor.${n}_scrubs_count`]:             st('212'),
    }, { lifetimeExpanded: true });
    expect(html).toContain('Dirt detect:');
    expect(html).toContain('optical');
    expect(html).toContain('piezo');
    expect(html).toContain('212 scrub events');
  });

  it('renders subset when only scrubs_count is enabled', () => {
    const html = render({
      [`sensor.${n}_lifetime_missions`]:  st('425'),
      [`sensor.${n}_scrubs_count`]:       st('212'),
    }, { lifetimeExpanded: true });
    expect(html).toContain('212 scrub events');
    expect(html).not.toContain('optical');
  });

  it('no dirt line when sensors absent (default-disabled diagnostics)', () => {
    const html = render({ [`sensor.${n}_lifetime_missions`]: st('425') }, { lifetimeExpanded: true });
    expect(html).not.toContain('Dirt detect:');
  });

  it('dirt sensors alone make the Stats section appear', () => {
    const html = render({ [`sensor.${n}_scrubs_count`]: st('212') });
    expect(html).toContain('Stats');
  });

  it('hidden when Stats collapsed', () => {
    const html = render({
      [`sensor.${n}_lifetime_missions`]:       st('425'),
      [`sensor.${n}_optical_dirt_detections`]: st('1043'),
    }, { lifetimeExpanded: false });
    expect(html).not.toContain('Dirt detect:');
  });
});

describe('renderHistoryZone() — v2.2.0 F4 against integration 3.2.1 record shapes', () => {
  const summary: DaySummary = { date: '2025-05-14', total: 1, completed: 1, stuck: 0, area_sqft: 100, result: 'completed' };
  it('local row with n_mssn null (not yet cloud-backfilled) gets no Route button', () => {
    const m: MissionRecord = {
      id: 'm_1750912345', started_at: '2025-05-14T07:14:00Z', ended_at: null,
      duration_min: 20, run_min: null, area_sqft: null, result: 'completed',
      initiator: 'schedule', zones: [], error_code: null,
      recharges: null, evacuations: null, dirt_events: null, wifi_signal: null,
      source: 'local', n_mssn: null,
    };
    const html = render({}, { openDay: '2025-05-14', openDaySummary: summary, dayMissions: [m] });
    expect(html).not.toContain('data-replay');
  });
});

describe('renderHistoryZone() — v2.3.0 MISSION-MAP coverage replay', () => {
  const summary: DaySummary = { date: '2025-05-14', total: 1, completed: 1, stuck: 0, area_sqft: 100, result: 'completed' };
  const mk = (over: Partial<MissionRecord> = {}): MissionRecord => ({
    id: 'm1', started_at: '2025-05-14T07:14:00Z', ended_at: null,
    duration_min: 20, run_min: null, area_sqft: null, result: 'completed',
    initiator: 'schedule', zones: [], error_code: null,
    recharges: null, evacuations: null, dirt_events: null, wifi_signal: null,
    source: 'local', n_mssn: 425,
    ...over,
  });

  it('no Map button when n_mssn absent (same SMART+cloud proxy as Route)', () => {
    const html = render({}, { openDay: '2025-05-14', openDaySummary: summary, dayMissions: [mk({ n_mssn: null })] });
    expect(html).not.toContain('data-map');
  });

  it('R2-1-style gate: no Map button on cloud-source rows even with n_mssn present', () => {
    // v2.3.0: Why?'s equivalent gap was fixed (EXPLAIN-CLOUD, verified
    // against source), but _mission_map_payload()'s own record resolution
    // is a separate, still-unfixed lookup with no cloud fallback — this
    // gate must stay until that endpoint gets its own fix.
    const html = render({}, { openDay: '2025-05-14', openDaySummary: summary, dayMissions: [mk({ source: 'cloud', n_mssn: 425 })] });
    expect(html).not.toContain('data-map');
  });

  it('Map button appears for local rows with n_mssn present', () => {
    const html = render({}, { openDay: '2025-05-14', openDaySummary: summary, dayMissions: [mk()] });
    expect(html).toContain('data-map="m1"');
  });

  it('loading state shows a calm "Loading…" message', () => {
    const html = render({}, {
      openDay: '2025-05-14', openDaySummary: summary, dayMissions: [mk()],
      openMissionMap: { recordId: 'm1', data: null },
    });
    expect(html).toContain('rpc-map-panel');
    expect(html).toContain('Loading…');
  });

  it('renders the coverage SVG when data is present', () => {
    const html = render({}, {
      openDay: '2025-05-14', openDaySummary: summary, dayMissions: [mk()],
      openMissionMap: {
        recordId: 'm1',
        data: {
          record_id: 'm1', mission_id: 'abc', nmssn: 425, pmap_id: 'p1', pmapv_id: 'v1',
          point_area_m: [0.1049, 0.1049], coverage_mm: [[0, 0], [1000, 1000]],
          rooms: { Kitchen: [[0, 0], [2000, 0], [2000, 2000]] },
        },
      },
    });
    expect(html).toContain('<svg');
    expect(html).toContain('rpc-map-dot');
  });

  it('status "absent" (404) renders a calm honest-absence message, not an error', () => {
    const html = render({}, {
      openDay: '2025-05-14', openDaySummary: summary, dayMissions: [mk()],
      openMissionMap: { recordId: 'm1', data: null, status: 'absent' },
    });
    expect(html).toContain('No coverage map for this mission');
  });

  it('status "error" (409/502) renders a generic retry message', () => {
    const html = render({}, {
      openDay: '2025-05-14', openDaySummary: summary, dayMissions: [mk()],
      openMissionMap: { recordId: 'm1', data: null, status: 'error' },
    });
    expect(html).toContain("Couldn't load the map");
  });

  it('a different mission\'s open state does not leak the panel onto this row', () => {
    const html = render({}, {
      openDay: '2025-05-14', openDaySummary: summary, dayMissions: [mk({ id: 'm1' })],
      openMissionMap: { recordId: 'm2', data: null, status: 'absent' },
    });
    expect(html).toContain('data-map="m1"');
    expect(html).not.toContain('No coverage map for this mission');
  });
});
