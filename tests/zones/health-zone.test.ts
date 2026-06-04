import { describe, it, expect } from 'vitest';
import { renderHealthZone, HealthZoneState } from '../../src/zones/health-zone';
import { makeHass, defaultCaps, baseConfig, st } from '../helpers';
import type { RobotCapabilities } from '../../src/types';

const n = 'roomba';

function render(
  states: Record<string, ReturnType<typeof st>> = {},
  caps: RobotCapabilities = defaultCaps,
  stateOpts: Partial<HealthZoneState> = {},
) {
  const healthState: HealthZoneState = {
    openPopover: null, resetting: null, resetError: null, legendShown: false,
    ...stateOpts,
  };
  return renderHealthZone(makeHass(states), baseConfig, caps, n, healthState);
}

describe('renderHealthZone() — visibility', () => {
  it('returns empty string when show_health: false', () => {
    const html = renderHealthZone(makeHass(), { ...baseConfig, show_health: false }, defaultCaps, n,
      { openPopover: null, resetting: null, resetError: null, legendShown: false });
    expect(html).toBe('');
  });

  it('returns empty string when no bar entities present', () =>
    expect(render()).toBe(''));
});

describe('renderHealthZone() — filter bar', () => {
  it('filter bar renders at 50% remaining', () => {
    const html = render({
      [`sensor.${n}_filter_remaining_hours`]: st('100', { threshold_hours: 200 }),
    });
    expect(html).toContain('Filter');
    expect(html).toContain('50%');
  });

  it('filter bar renders at 22% remaining', () => {
    const html = render({
      [`sensor.${n}_filter_remaining_hours`]: st('43', { threshold_hours: 200 }),
    });
    expect(html).toContain('22%');
  });

  it('filter reset service rendered in popover', () => {
    const html = render(
      { [`sensor.${n}_filter_remaining_hours`]: st('43', { threshold_hours: 200 }) },
      defaultCaps,
      { openPopover: 'filter', resetting: null, resetError: null, legendShown: false },
    );
    expect(html).toContain('Mark as replaced');
    expect(html).toContain('reset_filter');
  });
});

describe('renderHealthZone() — bar colours', () => {
  it('>50% → green colour', () => {
    const html = render({ [`sensor.${n}_filter_remaining_hours`]: st('120', { threshold_hours: 200 }) });
    expect(html).toContain('var(--rpc-green)');
  });

  it('10-50% → amber colour', () => {
    const html = render({ [`sensor.${n}_filter_remaining_hours`]: st('40', { threshold_hours: 200 }) });
    expect(html).toContain('var(--rpc-amber)');
  });

  it('<10% → red colour', () => {
    const html = render({ [`sensor.${n}_filter_remaining_hours`]: st('5', { threshold_hours: 200 }) });
    expect(html).toContain('var(--rpc-red)');
  });
});

describe('renderHealthZone() — battery', () => {
  it('battery bar from dedicated sensor', () => {
    const html = render({ [`sensor.${n}_battery`]: st('84') });
    expect(html).toContain('Battery');
    expect(html).toContain('84%');
  });

  it('battery bar from vacuum attribute fallback', () => {
    // No battery sensor, but vacuum entity has battery_level attribute
    const hass = makeHass({ 'vacuum.roomba': st('docked', { battery_level: 72 }) });
    const html = renderHealthZone(hass, baseConfig, { ...defaultCaps }, n,
      { openPopover: null, resetting: null, resetError: null, legendShown: false });
    expect(html).toContain('Battery');
    expect(html).toContain('72%');
  });

  it('battery fallback popover renders (entity not null)', () => {
    const hass = makeHass({ 'vacuum.roomba': st('docked', { battery_level: 72 }) });
    const html = renderHealthZone(hass, baseConfig, defaultCaps, n,
      { openPopover: 'battery', resetting: null, resetError: null, legendShown: false });
    expect(html).toContain('rpc-popover');
  });
});

describe('renderHealthZone() — Clean Base', () => {
  it('numeric state → "~N uses remaining"', () => {
    const html = render(
      { [`sensor.${n}_clean_base_status`]: st('3') },
      { ...defaultCaps, hasCleanBase: true },
    );
    expect(html).toContain('~3 uses remaining');
  });

  it('"Empty" state → "Bag full — replace soon"', () => {
    const html = render(
      { [`sensor.${n}_clean_base_status`]: st('Empty') },
      { ...defaultCaps, hasCleanBase: true },
    );
    expect(html).toContain('Bag full');
  });
});

describe('renderHealthZone() — wear legend', () => {
  it('wear legend shown when legendShown=false and bar has wear sensor', () => {
    const html = render(
      {
        [`sensor.${n}_filter_remaining_hours`]: st('100', { threshold_hours: 200 }),
        [`sensor.${n}_filter_wear_rate`]:       st('2.0'),
      },
      { ...defaultCaps, hasWearRate: true },
      { openPopover: 'filter', legendShown: false, resetting: null, resetError: null },
    );
    expect(html).toContain('Wear trend');
    expect(html).toContain('faster than normal');
  });

  it('wear legend hidden when legendShown=true', () => {
    const html = render(
      {
        [`sensor.${n}_filter_remaining_hours`]: st('100', { threshold_hours: 200 }),
        [`sensor.${n}_filter_wear_rate`]:       st('2.0'),
      },
      { ...defaultCaps, hasWearRate: true },
      { openPopover: 'filter', legendShown: true, resetting: null, resetError: null },
    );
    expect(html).not.toContain('Wear trend');
  });
});

describe('renderHealthZone() — Wave A4 mop config', () => {
  it('mop config row shown for Braava', () => {
    // Health zone requires at least one bar to render; add filter bar alongside mop sensors
    const html = render(
      {
        [`sensor.${n}_mop_pad`]:              st('Wet (reusable)'),
        [`sensor.${n}_mop_behavior`]:         st('Standard'),
        [`sensor.${n}_filter_remaining_hours`]: st('100', { threshold_hours: 200 }),
      },
      { ...defaultCaps, hasPad: true, isMop: true, hasMopBehavior: true },
    );
    expect(html).toContain('Wet (reusable)');
    expect(html).toContain('Standard intensity');
  });

  it('mop config hidden when sensors absent', () =>
    expect(render({}, { ...defaultCaps, isMop: true })).toBe(''));

  it('mop config hidden for non-Braava', () => {
    const html = render(
      { [`sensor.${n}_filter_remaining_hours`]: st('100', { threshold_hours: 200 }) },
      { ...defaultCaps, isMop: false },
    );
    expect(html).not.toContain('intensity');
  });
});

describe('renderHealthZone() — popover', () => {
  it('popover renders when openPopover matches bar key', () => {
    const html = render(
      { [`sensor.${n}_filter_remaining_hours`]: st('100', { threshold_hours: 200 }) },
      defaultCaps,
      { openPopover: 'filter', legendShown: false, resetting: null, resetError: null },
    );
    expect(html).toContain('rpc-popover');
    expect(html).toContain('Threshold');
  });

  it('popover not rendered when openPopover is null', () => {
    const html = render(
      { [`sensor.${n}_filter_remaining_hours`]: st('100', { threshold_hours: 200 }) },
    );
    expect(html).not.toContain('Threshold');
  });

  it('last-replaced date shown in popover', () => {
    const html = render(
      {
        [`sensor.${n}_filter_remaining_hours`]: st('100', { threshold_hours: 200 }),
        [`sensor.${n}_filter_last_replaced`]:   st('2025-04-01T00:00:00Z'),
      },
      defaultCaps,
      { openPopover: 'filter', legendShown: false, resetting: null, resetError: null },
    );
    expect(html).toContain('Last replaced');
  });

  it('reset button disabled while resetting', () => {
    const html = render(
      { [`sensor.${n}_filter_remaining_hours`]: st('50', { threshold_hours: 200 }) },
      defaultCaps,
      { openPopover: 'filter', resetting: 'filter', resetError: null, legendShown: false },
    );
    expect(html).toContain('disabled');
    expect(html).toContain('rpc-spinner');
  });
});

// ── v1.3 F6a: Battery retention bar ──────────────────────────────────────────
describe('renderHealthZone() — F6a battery retention bar', () => {
  const n = 'roomba';

  it('renders retention bar when hasBatteryRetention and sensor present', () => {
    const hass = makeHass({
      [`sensor.${n}_filter_remaining_hours`]: st('200', { threshold_hours: 500 }),
      [`sensor.${n}_battery_capacity_retention`]: st('82'),
    });
    const html = renderHealthZone(hass, baseConfig, { ...defaultCaps, hasBatteryRetention: true }, n, {
      openPopover: null, resetting: null, resetError: null, legendShown: false,
    });
    expect(html).toContain('Health');
    expect(html).toContain('82%');
  });

  it('shows popover with EOL when hasBatteryEol and eol sensor present', () => {
    const hass = makeHass({
      [`sensor.${n}_filter_remaining_hours`]: st('200', { threshold_hours: 500 }),
      [`sensor.${n}_battery_capacity_retention`]: st('65'),
      [`sensor.${n}_estimated_battery_eol`]: st('42'),
    });
    const html = renderHealthZone(hass, baseConfig, { ...defaultCaps, hasBatteryRetention: true, hasBatteryEol: true }, n, {
      openPopover: 'retention', resetting: null, resetError: null, legendShown: false,
    });
    expect(html).toContain('~42 days remaining');
  });

  it('shows end-of-life warning when eol sensor is 0', () => {
    const hass = makeHass({
      [`sensor.${n}_filter_remaining_hours`]: st('200', { threshold_hours: 500 }),
      [`sensor.${n}_battery_capacity_retention`]: st('55'),
      [`sensor.${n}_estimated_battery_eol`]: st('0'),
    });
    const html = renderHealthZone(hass, baseConfig, { ...defaultCaps, hasBatteryRetention: true, hasBatteryEol: true }, n, {
      openPopover: 'retention', resetting: null, resetError: null, legendShown: false,
    });
    expect(html).toContain('end of life');
  });

  it('does not render retention bar when cap absent', () => {
    const hass = makeHass({
      [`sensor.${n}_filter_remaining_hours`]: st('200', { threshold_hours: 500 }),
    });
    const html = renderHealthZone(hass, baseConfig, defaultCaps, n, {
      openPopover: null, resetting: null, resetError: null, legendShown: false,
    });
    expect(html).not.toContain('data-bar="retention"');
  });

  it('A5: shows battery_cycles from sensor.*_battery_cycles (not _charge_cycles)', () => {
    const hass = makeHass({
      [`sensor.${n}_filter_remaining_hours`]: st('200', { threshold_hours: 500 }),
      [`sensor.${n}_battery_capacity_retention`]: st('88'),
      [`sensor.${n}_battery_cycles`]: st('247'),
    });
    const html = renderHealthZone(hass, baseConfig, { ...defaultCaps, hasBatteryRetention: true }, n, {
      openPopover: 'retention', resetting: null, resetError: null, legendShown: false,
    });
    expect(html).toContain('247 charge cycles');
  });

  it('A5: charge_cycles is absent from popover when only stale _charge_cycles entity present', () => {
    const hass = makeHass({
      [`sensor.${n}_filter_remaining_hours`]: st('200', { threshold_hours: 500 }),
      [`sensor.${n}_battery_capacity_retention`]: st('88'),
      [`sensor.${n}_charge_cycles`]: st('247'),   // stale key — should not be read
    });
    const html = renderHealthZone(hass, baseConfig, { ...defaultCaps, hasBatteryRetention: true }, n, {
      openPopover: 'retention', resetting: null, resetError: null, legendShown: false,
    });
    expect(html).not.toContain('247 charge cycles');
  });
});

// ── A6: mop pad bar uses pad_days_until_due ───────────────────────────────────
describe('renderHealthZone() — A6 mop pad bar', () => {
  const n = 'roomba';

  it('renders pad bar from sensor.*_pad_days_until_due', () => {
    const hass = makeHass({
      [`sensor.${n}_pad_days_until_due`]: st('18', { threshold_days: 30 }),
      [`sensor.${n}_mop_pad`]: st('Wet (reusable)'),
    });
    const html = renderHealthZone(hass, baseConfig, { ...defaultCaps, hasPad: true }, n, {
      openPopover: null, resetting: null, resetError: null, legendShown: false,
    });
    expect(html).toContain('Pad');
    expect(html).toContain('60%');    // 18/30 = 60%
  });

  it('pad bar absent when only stale _mop_pad_remaining_hours present', () => {
    const hass = makeHass({
      [`sensor.${n}_mop_pad_remaining_hours`]: st('18', { threshold_hours: 30 }),
      [`sensor.${n}_mop_pad`]: st('Wet (reusable)'),
    });
    const html = renderHealthZone(hass, baseConfig, { ...defaultCaps, hasPad: true }, n, {
      openPopover: null, resetting: null, resetError: null, legendShown: false,
    });
    expect(html).not.toContain('data-bar="pad"');
  });
});

// ── v1.3 F6a: Coverage percentage bar ────────────────────────────────────────
describe('renderHealthZone() — F6a coverage pct bar', () => {
  const n = 'roomba';

  it('renders coverage bar with percentage when ≥10 missions', () => {
    const hass = makeHass({
      [`sensor.${n}_filter_remaining_hours`]: st('200', { threshold_hours: 500 }),
      [`sensor.${n}_recent_coverage_pct`]: st('78'),
      [`sensor.${n}_missions_last_30d`]: st('15'),
    });
    const html = renderHealthZone(hass, baseConfig, { ...defaultCaps, hasCoveragePct: true }, n, {
      openPopover: null, resetting: null, resetError: null, legendShown: false,
    });
    expect(html).toContain('78%');
    expect(html).toContain('last mission');
    expect(html).toContain('data-bar="coverage"');
  });

  it('shows "Building history…" skeleton when fewer than 10 missions', () => {
    const hass = makeHass({
      [`sensor.${n}_filter_remaining_hours`]: st('200', { threshold_hours: 500 }),
      [`sensor.${n}_recent_coverage_pct`]: st('62'),
      [`sensor.${n}_missions_last_30d`]: st('7'),
    });
    const html = renderHealthZone(hass, baseConfig, { ...defaultCaps, hasCoveragePct: true }, n, {
      openPopover: null, resetting: null, resetError: null, legendShown: false,
    });
    expect(html).toContain('Building history');
    expect(html).not.toContain('last mission');
  });
});

// ── T2: coverage bar skeleton when mission count absent or < 10 (L1 regression) ──
describe('renderHealthZone() — F6a coverage bar skeleton fallback (L1)', () => {
  const n = 'roomba';

  it('shows skeleton when missions_last_30d entity is absent (NaN guard)', () => {
    const hass = makeHass({
      [`sensor.${n}_filter_remaining_hours`]: st('200', { threshold_hours: 500 }),
      [`sensor.${n}_recent_coverage_pct`]: st('72'),
      // missions_last_30d intentionally absent
    });
    const html = renderHealthZone(hass, baseConfig, { ...defaultCaps, hasCoveragePct: true }, n, {
      openPopover: null, resetting: null, resetError: null, legendShown: false,
    });
    expect(html).toContain('Building history');
    expect(html).not.toContain('last mission');
  });

  it('shows bar when missions_last_30d >= 10', () => {
    const hass = makeHass({
      [`sensor.${n}_filter_remaining_hours`]: st('200', { threshold_hours: 500 }),
      [`sensor.${n}_recent_coverage_pct`]: st('82'),
      [`sensor.${n}_missions_last_30d`]: st('14'),
    });
    const html = renderHealthZone(hass, baseConfig, { ...defaultCaps, hasCoveragePct: true }, n, {
      openPopover: null, resetting: null, resetError: null, legendShown: false,
    });
    expect(html).toContain('last mission');
    expect(html).toContain('data-bar="coverage"');
    expect(html).not.toContain('Building history');
  });
});

// ── T1b: retention popover close button uses correct data attribute (B1 regression) ──
describe('renderHealthZone() — F6a retention popover close button (B1)', () => {
  const n = 'roomba';

  it('close button uses data-close not data-bar-close', () => {
    const hass = makeHass({
      [`sensor.${n}_filter_remaining_hours`]: st('200', { threshold_hours: 500 }),
      [`sensor.${n}_battery_capacity_retention`]: st('78'),
    });
    const html = renderHealthZone(hass, baseConfig, { ...defaultCaps, hasBatteryRetention: true }, n, {
      openPopover: 'retention', resetting: null, resetError: null, legendShown: false,
    });
    expect(html).toContain('data-close="retention"');
    expect(html).not.toContain('data-bar-close');
    // U3: label should be "Bat. Health", not ambiguous "Health"
    expect(html).toContain('Bat. Health');
  });
});

// ── B4 regression: separator only rendered when a new bar actually appears ────
describe('renderHealthZone() — B4 orphaned separator regression', () => {
  const n = 'roomba';

  it('does not render separator when retention entity is absent', () => {
    const hass = makeHass({
      [`sensor.${n}_filter_remaining_hours`]: st('200', { threshold_hours: 500 }),
      // battery_capacity_retention intentionally absent
    });
    const html = renderHealthZone(hass, baseConfig, { ...defaultCaps, hasBatteryRetention: true }, n, {
      openPopover: null, resetting: null, resetError: null, legendShown: false,
    });
    expect(html).not.toContain('rpc-health-battery-sep');
  });

  it('does not render separator when retention entity is unavailable', () => {
    const hass = makeHass({
      [`sensor.${n}_filter_remaining_hours`]: st('200', { threshold_hours: 500 }),
      [`sensor.${n}_battery_capacity_retention`]: st('unavailable'),
    });
    const html = renderHealthZone(hass, baseConfig, { ...defaultCaps, hasBatteryRetention: true }, n, {
      openPopover: null, resetting: null, resetError: null, legendShown: false,
    });
    expect(html).not.toContain('rpc-health-battery-sep');
  });

  it('renders separator when retention bar renders', () => {
    const hass = makeHass({
      [`sensor.${n}_filter_remaining_hours`]: st('200', { threshold_hours: 500 }),
      [`sensor.${n}_battery_capacity_retention`]: st('82'),
    });
    const html = renderHealthZone(hass, baseConfig, { ...defaultCaps, hasBatteryRetention: true }, n, {
      openPopover: null, resetting: null, resetError: null, legendShown: false,
    });
    expect(html).toContain('rpc-health-battery-sep');
  });
});

// ── Coverage bar popover ───────────────────────────────────────────────────────
describe('renderHealthZone() — F6a coverage bar popover', () => {
  const n = 'roomba';

  it('renders coverage bar as interactive (data-bar="coverage")', () => {
    const hass = makeHass({
      [`sensor.${n}_filter_remaining_hours`]: st('200', { threshold_hours: 500 }),
      [`sensor.${n}_recent_coverage_pct`]: st('78'),
      [`sensor.${n}_missions_last_30d`]: st('15'),
    });
    const html = renderHealthZone(hass, baseConfig, { ...defaultCaps, hasCoveragePct: true }, n, {
      openPopover: null, resetting: null, resetError: null, legendShown: false,
    });
    expect(html).toContain('data-bar="coverage"');
    expect(html).toContain('role="button"');
  });

  it('renders popover with mission count context when openPopover is coverage', () => {
    const hass = makeHass({
      [`sensor.${n}_filter_remaining_hours`]: st('200', { threshold_hours: 500 }),
      [`sensor.${n}_recent_coverage_pct`]: st('72'),
      [`sensor.${n}_missions_last_30d`]: st('20'),
    });
    const html = renderHealthZone(hass, baseConfig, { ...defaultCaps, hasCoveragePct: true }, n, {
      openPopover: 'coverage', resetting: null, resetError: null, legendShown: false,
    });
    expect(html).toContain('Floor Coverage');
    expect(html).toContain('72% of floor area');
    expect(html).toContain('20 missions');
  });

  it('clamps coverage pct at 100', () => {
    const hass = makeHass({
      [`sensor.${n}_filter_remaining_hours`]: st('200', { threshold_hours: 500 }),
      [`sensor.${n}_recent_coverage_pct`]: st('103'),
      [`sensor.${n}_missions_last_30d`]: st('12'),
    });
    const html = renderHealthZone(hass, baseConfig, { ...defaultCaps, hasCoveragePct: true }, n, {
      openPopover: null, resetting: null, resetError: null, legendShown: false,
    });
    expect(html).toContain('100%');
    expect(html).not.toContain('103%');
  });
});
