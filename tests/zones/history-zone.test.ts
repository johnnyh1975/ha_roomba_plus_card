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
});

describe('renderHistoryZone() — Wave C1 lifetime stats', () => {
  const lifetimeStates = {
    [`sensor.${n}_lifetime_missions`]:  st('847'),
    [`sensor.${n}_recent_area_30d`]: st('25200'),
    [`sensor.${n}_recent_time_30d`]:    st('1247'),
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
    expect(html).toContain('1,247 h (30 d)');
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

// ── v1.3 F6a: Speed trend in summary bar ──────────────────────────────────────
describe('renderHistoryZone() — F6a speed trend in summary bar', () => {
  const n = 'roomba';

  it('shows "↓ Speed declining" token when trend is declining', () => {
    const hass = makeHass({
      [`sensor.${n}_clean_streak`]: st('5'),
      [`sensor.${n}_cleaning_speed_trend`]: st('declining'),
    });
    const html = renderHistoryZone(hass, baseConfig, { ...defaultCaps, hasCleaningSpeedTrend: true }, n,
      { data: null, loading: false, error: null, openDay: null, dayMissions: null, openDaySummary: null, lifetimeExpanded: false },
      false);
    expect(html).toContain('rpc-trend-declining');
    expect(html).toContain('↓ Speed declining');
  });

  it('does not show trend token when trend is stable', () => {
    const hass = makeHass({
      [`sensor.${n}_clean_streak`]: st('5'),
      [`sensor.${n}_cleaning_speed_trend`]: st('stable'),
    });
    const html = renderHistoryZone(hass, baseConfig, { ...defaultCaps, hasCleaningSpeedTrend: true }, n,
      { data: null, loading: false, error: null, openDay: null, dayMissions: null, openDaySummary: null, lifetimeExpanded: false },
      false);
    expect(html).not.toContain('rpc-trend-declining');
    expect(html).not.toContain('Speed declining');
  });

  it('does not show trend when cap absent', () => {
    const hass = makeHass({
      [`sensor.${n}_cleaning_speed_trend`]: st('declining'),
    });
    const html = renderHistoryZone(hass, baseConfig, defaultCaps, n,
      { data: null, loading: false, error: null, openDay: null, dayMissions: null, openDaySummary: null, lifetimeExpanded: false },
      false);
    expect(html).not.toContain('Speed declining');
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
        lifetimeExpanded: false },
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
        lifetimeExpanded: false },
      false);
    expect(html).not.toContain('rpc-day-wifi');
  });
});

// ── T3: speed trend — improving surfaced, stable silent (L2) ──────────────────
describe('renderHistoryZone() — F6a speed trend — improving and stable (L2)', () => {
  const n = 'roomba';

  it('shows "↑ Speed improving" when trend is improving', () => {
    const hass = makeHass({
      [`sensor.${n}_cleaning_speed_trend`]: st('improving'),
    });
    const html = renderHistoryZone(hass, baseConfig, { ...defaultCaps, hasCleaningSpeedTrend: true }, n,
      { data: null, loading: false, error: null, openDay: null, dayMissions: null, openDaySummary: null, lifetimeExpanded: false },
      false);
    expect(html).toContain('↑ Speed improving');
  });

  it('shows nothing for "stable" trend — no noise when normal', () => {
    const hass = makeHass({
      [`sensor.${n}_cleaning_speed_trend`]: st('stable'),
    });
    const html = renderHistoryZone(hass, baseConfig, { ...defaultCaps, hasCleaningSpeedTrend: true }, n,
      { data: null, loading: false, error: null, openDay: null, dayMissions: null, openDaySummary: null, lifetimeExpanded: false },
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
      { data: null, loading: false, error: null, openDay: null, dayMissions: null, openDaySummary: null, lifetimeExpanded: false },
      false);
    expect(html).toContain('rpc-summary-sep');
    expect(html).toContain('rpc-history-summary');
  });

  it('no separator rendered for single token', () => {
    const hass = makeHass({
      [`sensor.${n}_clean_streak`]: st('3'),
    });
    const html = renderHistoryZone(hass, baseConfig, defaultCaps, n,
      { data: null, loading: false, error: null, openDay: null, dayMissions: null, openDaySummary: null, lifetimeExpanded: false },
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
      room_name: 'Kitchen', bearing_deg: 45, distance_mm: 360, source: 'stuck_events' as const }];
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
      room_name: null, bearing_deg: 90, distance_mm: 450, source: 'robot_learned' as const }];
    const html = renderWithCoverage(
      { [`image.${n}_coverage_map`]: imageState },
      { historyTab: 'coverage', hazards },
    );
    expect(html).toContain('rpc-pin-robot_learned');
    expect(html).toContain('🚧');
  });

  it('keepout pins rendered with 🚫 icon (Q_coord resolved)', () => {
    const hazards = [{ gx: null, gy: null, x_mm: -300, y_mm: 500, stuck_count: null,
      room_name: 'Hallway', bearing_deg: 270, distance_mm: 583, source: 'keepout' as const }];
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

  it('coverage image renders without pins when extent attrs absent (R2 graceful degradation)', () => {
    const noExtentState = st('idle', { entity_picture: '/api/image/serve/abc/512x512' });
    const hazards = [{ gx: 3, gy: 5, x_mm: 200, y_mm: 300, stuck_count: 2,
      room_name: null, bearing_deg: 45, distance_mm: 360, source: 'stuck_events' as const }];
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
        bearing_deg: 45, distance_mm: 360, source: 'stuck_events' as const },
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
