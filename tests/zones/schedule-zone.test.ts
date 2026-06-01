import { describe, it, expect } from 'vitest';
import { renderScheduleZone, ScheduleZoneState } from '../../src/zones/schedule-zone';
import { makeHass, defaultCaps, baseConfig, st } from '../helpers';

const n = 'roomba';

const defaultState: ScheduleZoneState = { holdTooltipVisible: false, holdToggling: false };

function render(states: Record<string, ReturnType<typeof st>> = {}, stateOpts = defaultState) {
  return renderScheduleZone(makeHass(states), baseConfig, defaultCaps, n, stateOpts);
}

describe('renderScheduleZone() — visibility', () => {
  it('returns empty string when no schedule entities and no analytics', () =>
    expect(render()).toBe(''));

  it('returns empty string when show_schedule: false', () => {
    const html = renderScheduleZone(
      makeHass({ [`sensor.${n}_next_clean`]: st('2025-06-03T09:00:00Z') }),
      { ...baseConfig, show_schedule: false },
      defaultCaps, n, defaultState,
    );
    expect(html).toBe('');
  });

  it('renders when only hold entity exists', () =>
    expect(render({ [`binary_sensor.${n}_schedule_hold_active`]: st('off') }))
      .toContain('rpc-zone4'));
});

describe('renderScheduleZone() — hold badge', () => {
  it('green "Schedule active" when isHeld=false', () => {
    const html = render({ [`binary_sensor.${n}_schedule_hold_active`]: st('off') });
    expect(html).toContain('Schedule active');
    expect(html).toContain('rpc-badge-green');
  });

  it('amber "Hold active" when manual hold', () => {
    const html = render({ [`binary_sensor.${n}_schedule_hold_active`]: st('on', { source: 'manual' }) });
    expect(html).toContain('Hold active');
    expect(html).toContain('rpc-badge-amber');
  });

  it('blue "Away hold" when presence-managed', () => {
    const html = render({ [`binary_sensor.${n}_schedule_hold_active`]: st('on', { source: 'presence_manager' }) });
    expect(html).toContain('Away hold');
    expect(html).toContain('rpc-badge-blue');
  });

  it('tooltip shown when holdTooltipVisible=true', () => {
    const html = render(
      { [`binary_sensor.${n}_schedule_hold_active`]: st('on', { source: 'presence_manager' }) },
      { holdTooltipVisible: true, holdToggling: false },
    );
    expect(html).toContain('controlled automatically');
  });
});

describe('renderScheduleZone() — next clean time', () => {
  it('next clean time shown from sensor', () => {
    const html = render({ [`sensor.${n}_next_clean`]: st('2025-06-03T09:00:00Z') });
    expect(html).toContain('Next scheduled');
    expect(html).toContain('Tue');
  });
});

describe('renderScheduleZone() — Wave B1 presence analytics', () => {
  it('analytics shown when both sensors have valid values', () => {
    const html = render({
      [`sensor.${n}_presence_clean_opportunities_7d`]: st('7'),
      [`sensor.${n}_presence_clean_utilisation_7d`]:   st('71'),
    });
    expect(html).toContain('7 opportunities this week');
    expect(html).toContain('71% utilised');
  });

  it('analytics hidden when opportunities sensor is unknown', () => {
    const html = render({
      [`sensor.${n}_presence_clean_opportunities_7d`]: st('unknown'),
      [`sensor.${n}_presence_clean_utilisation_7d`]:   st('71'),
    });
    expect(html).not.toContain('opportunities');
  });

  it('analytics hidden when utilisation sensor is unavailable', () => {
    const html = render({
      [`sensor.${n}_presence_clean_opportunities_7d`]: st('7'),
      [`sensor.${n}_presence_clean_utilisation_7d`]:   st('unavailable'),
    });
    expect(html).not.toContain('opportunities');
  });

  it('Wave B1 NaN guard: non-numeric state → hidden', () => {
    const html = render({
      [`sensor.${n}_presence_clean_opportunities_7d`]: st('error'),
      [`sensor.${n}_presence_clean_utilisation_7d`]:   st('error'),
    });
    expect(html).not.toContain('NaN');
    expect(html).not.toContain('opportunities');
  });

  it('singular "opportunity" when count is 1', () => {
    const html = render({
      [`sensor.${n}_presence_clean_opportunities_7d`]: st('1'),
      [`sensor.${n}_presence_clean_utilisation_7d`]:   st('100'),
    });
    expect(html).toContain('1 opportunity this week');
    expect(html).not.toContain('1 opportunities');
  });
});

describe('renderScheduleZone() — Wave B2 next likely window', () => {
  it('next likely window shown with ~ prefix', () => {
    const ts = '2025-06-04T11:00:00Z';
    const html = render({ [`sensor.${n}_next_likely_clean_window`]: st(ts) });
    expect(html).toContain('Next likely window');
    expect(html).toContain('~');
  });

  it('next likely window hidden when sensor state is unknown', () => {
    const html = render({ [`sensor.${n}_next_likely_clean_window`]: st('unknown') });
    expect(html).not.toContain('Next likely window');
  });

  it('Wave B2 invalid date guard: non-date string → hidden (no "Invalid Date")', () => {
    const html = render({ [`sensor.${n}_next_likely_clean_window`]: st('not-a-date') });
    expect(html).not.toContain('Invalid Date');
    expect(html).not.toContain('Next likely window');
  });

  it('zone renders even when only likely window sensor exists', () => {
    const ts = '2025-06-04T11:00:00Z';
    const html = render({ [`sensor.${n}_next_likely_clean_window`]: st(ts) });
    expect(html).toContain('rpc-zone4');
  });
});
