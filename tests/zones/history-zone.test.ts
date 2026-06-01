import { describe, it, expect } from 'vitest';
import { renderHistoryZone, HistoryZoneState } from '../../src/zones/history-zone';
import { makeHass, defaultCaps, fullCaps, baseConfig, st } from '../helpers';
import type { DaySummary, MissionRecord } from '../../src/types';

const n = 'roomba';

const emptyState: HistoryZoneState = {
  data: null, loading: false, error: null,
  openDay: null, dayMissions: null, openDaySummary: null,
  lifetimeExpanded: false,
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
    [`sensor.${n}_lifetime_missions`]: st('847'),
    [`sensor.${n}_lifetime_area`]:     st('25200'),
    [`sensor.${n}_lifetime_time`]:     st('1247'),
  };

  it('lifetime toggle button shown when all cloud sensors present', () => {
    const html = render(lifetimeStates);
    expect(html).toContain('Lifetime');
    expect(html).toContain('data-lifetime-toggle');
  });

  it('lifetime stats hidden when sensors absent', () =>
    expect(render()).not.toContain('data-lifetime-toggle'));

  it('expanded content shown when lifetimeExpanded=true', () => {
    const html = render(lifetimeStates, { lifetimeExpanded: true });
    expect(html).toContain('847');
    expect(html).toContain('1,247 h');
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
