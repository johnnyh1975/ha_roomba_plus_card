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
    healthDetailsExpanded: false, openMaintPopover: null, navDetailsExpanded: false,
    ...stateOpts,
  };
  return renderHealthZone(makeHass(states), baseConfig, caps, n, healthState);
}

describe('renderHealthZone() — visibility', () => {
  it('returns empty string when show_health: false', () => {
    const html = renderHealthZone(makeHass(), { ...baseConfig, show_health: false }, defaultCaps, n,
      { openPopover: null, resetting: null, resetError: null, legendShown: false, healthDetailsExpanded: false, openMaintPopover: null, navDetailsExpanded: false });
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
      { openPopover: 'filter', resetting: null, resetError: null, legendShown: false, healthDetailsExpanded: false, openMaintPopover: null, navDetailsExpanded: false },
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
      { openPopover: null, resetting: null, resetError: null, legendShown: false, healthDetailsExpanded: false, openMaintPopover: null, navDetailsExpanded: false });
    expect(html).toContain('Battery');
    expect(html).toContain('72%');
  });

  it('battery fallback popover renders (entity not null)', () => {
    const hass = makeHass({ 'vacuum.roomba': st('docked', { battery_level: 72 }) });
    const html = renderHealthZone(hass, baseConfig, defaultCaps, n,
      { openPopover: 'battery', resetting: null, resetError: null, legendShown: false, healthDetailsExpanded: false, openMaintPopover: null, navDetailsExpanded: false });
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
      { openPopover: 'filter', resetting: 'filter', resetError: null, legendShown: false, healthDetailsExpanded: false, openMaintPopover: null, navDetailsExpanded: false },
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
      healthDetailsExpanded: false, openMaintPopover: null, navDetailsExpanded: false,
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
      healthDetailsExpanded: false, openMaintPopover: null, navDetailsExpanded: false,
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
      healthDetailsExpanded: false, openMaintPopover: null, navDetailsExpanded: false,
    });
    expect(html).toContain('end of life');
  });

  it('does not render retention bar when cap absent', () => {
    const hass = makeHass({
      [`sensor.${n}_filter_remaining_hours`]: st('200', { threshold_hours: 500 }),
    });
    const html = renderHealthZone(hass, baseConfig, defaultCaps, n, {
      openPopover: null, resetting: null, resetError: null, legendShown: false,
      healthDetailsExpanded: false, openMaintPopover: null, navDetailsExpanded: false,
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
      healthDetailsExpanded: false, openMaintPopover: null, navDetailsExpanded: false,
    });
    expect(html).toContain('247 charge cycles');
  });

  // v2.0.2 UX fix: layout alignment + battery replacement trigger
  it('bar row includes an rpc-bar-hours placeholder for layout alignment with Filter/Brush', () => {
    const hass = makeHass({
      [`sensor.${n}_battery_capacity_retention`]: st('100'),
    });
    const html = renderHealthZone(hass, baseConfig, { ...defaultCaps, hasBatteryRetention: true }, n, {
      openPopover: null, resetting: null, resetError: null, legendShown: false,
      healthDetailsExpanded: false, openMaintPopover: null, navDetailsExpanded: false,
    });
    expect(html).toMatch(/data-bar="retention"[\s\S]*?rpc-bar-hours/);
  });

  // v2.0.2 bug fix: retention and coverage bars used <span> elements for
  // rpc-bar-track / rpc-bar-fill. <span> is display:inline by default —
  // the CSS rule height:100% on rpc-bar-fill has no effect on inline
  // elements, so the green fill span had zero visible height and the bar
  // appeared entirely gray regardless of the percentage value. Regular
  // consumable bars correctly use <div>. Confirmed by screenshot: Battery
  // bar showed gray at 100% while Filter/Brush showed green at ~83/95%.
  it('retention bar fill uses <div>, not <span>, so height:100% works', () => {
    const hass = makeHass({
      [`sensor.${n}_battery_capacity_retention`]: st('100'),
    });
    const html = renderHealthZone(hass, baseConfig, { ...defaultCaps, hasBatteryRetention: true }, n, {
      openPopover: null, resetting: null, resetError: null, legendShown: false,
      healthDetailsExpanded: false, openMaintPopover: null, navDetailsExpanded: false,
    });
    // The fill must be a <div class="rpc-bar-fill">, not a <span>
    expect(html).toContain('<div class="rpc-bar-fill"');
    expect(html).not.toContain('<span class="rpc-bar-fill"');
  });

  it('retention popover includes a "Mark as replaced" button wired to reset_battery', () => {
    const hass = makeHass({
      [`sensor.${n}_battery_capacity_retention`]: st('100'),
    });
    const html = renderHealthZone(hass, baseConfig, { ...defaultCaps, hasBatteryRetention: true }, n, {
      openPopover: 'retention', resetting: null, resetError: null, legendShown: false,
      healthDetailsExpanded: false, openMaintPopover: null, navDetailsExpanded: false,
    });
    expect(html).toContain('Mark as replaced');
    expect(html).toContain('data-reset="retention"');
    expect(html).toContain('data-service="reset_battery"');
  });

  it('Mark as replaced button shows a spinner and is disabled while resetting', () => {
    const hass = makeHass({
      [`sensor.${n}_battery_capacity_retention`]: st('100'),
    });
    const html = renderHealthZone(hass, baseConfig, { ...defaultCaps, hasBatteryRetention: true }, n, {
      openPopover: 'retention', resetting: 'retention', resetError: null, legendShown: false,
      healthDetailsExpanded: false, openMaintPopover: null, navDetailsExpanded: false,
    });
    expect(html).toContain('rpc-btn-loading');
    expect(html).toContain('disabled');
    expect(html).not.toContain('Mark as replaced');
  });

  it('shows reset-failed message when resetError matches', () => {
    const hass = makeHass({
      [`sensor.${n}_battery_capacity_retention`]: st('100'),
    });
    const html = renderHealthZone(hass, baseConfig, { ...defaultCaps, hasBatteryRetention: true }, n, {
      openPopover: 'retention', resetting: null, resetError: 'retention', legendShown: false,
      healthDetailsExpanded: false, openMaintPopover: null, navDetailsExpanded: false,
    });
    expect(html).toContain('Reset failed');
  });

  // v2.0.2 bug fix: the early-return guard didn't account for
  // hasBatteryRetention/hasCoveragePct, both computed independently of the
  // `bars` array — a robot with only retention or only coverage data (no
  // consumable bars, no health score, no maintenance calendar, no
  // anomaly) would see an entirely empty Health tab.
  it('renders the zone for retention-only data, with zero consumable bars present', () => {
    const hass = makeHass({
      [`sensor.${n}_battery_capacity_retention`]: st('72'),
    });
    const html = renderHealthZone(hass, baseConfig, { ...defaultCaps, hasBatteryRetention: true }, n, {
      openPopover: null, resetting: null, resetError: null, legendShown: false,
      healthDetailsExpanded: false, openMaintPopover: null, navDetailsExpanded: false,
    });
    expect(html).not.toBe('');
    expect(html).toContain('data-bar="retention"');
  });

  it('renders the zone for coverage-only data, with zero consumable bars present', () => {
    const hass = makeHass({
      [`sensor.${n}_recent_coverage_pct`]: st('91'),
    });
    const html = renderHealthZone(hass, baseConfig, { ...defaultCaps, hasCoveragePct: true }, n, {
      openPopover: null, resetting: null, resetError: null, legendShown: false,
      healthDetailsExpanded: false, openMaintPopover: null, navDetailsExpanded: false,
    });
    expect(html).not.toBe('');
  });

  it('A5: charge_cycles is absent from popover when only stale _charge_cycles entity present', () => {
    const hass = makeHass({
      [`sensor.${n}_filter_remaining_hours`]: st('200', { threshold_hours: 500 }),
      [`sensor.${n}_battery_capacity_retention`]: st('88'),
      [`sensor.${n}_charge_cycles`]: st('247'),   // stale key — should not be read
    });
    const html = renderHealthZone(hass, baseConfig, { ...defaultCaps, hasBatteryRetention: true }, n, {
      openPopover: 'retention', resetting: null, resetError: null, legendShown: false,
      healthDetailsExpanded: false, openMaintPopover: null, navDetailsExpanded: false,
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
      healthDetailsExpanded: false, openMaintPopover: null, navDetailsExpanded: false,
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
      healthDetailsExpanded: false, openMaintPopover: null, navDetailsExpanded: false,
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
      healthDetailsExpanded: false, openMaintPopover: null, navDetailsExpanded: false,
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
      healthDetailsExpanded: false, openMaintPopover: null, navDetailsExpanded: false,
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
      healthDetailsExpanded: false, openMaintPopover: null, navDetailsExpanded: false,
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
      healthDetailsExpanded: false, openMaintPopover: null, navDetailsExpanded: false,
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
      healthDetailsExpanded: false, openMaintPopover: null, navDetailsExpanded: false,
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
      healthDetailsExpanded: false, openMaintPopover: null, navDetailsExpanded: false,
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
      healthDetailsExpanded: false, openMaintPopover: null, navDetailsExpanded: false,
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
      healthDetailsExpanded: false, openMaintPopover: null, navDetailsExpanded: false,
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
      healthDetailsExpanded: false, openMaintPopover: null, navDetailsExpanded: false,
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
      healthDetailsExpanded: false, openMaintPopover: null, navDetailsExpanded: false,
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
      healthDetailsExpanded: false, openMaintPopover: null, navDetailsExpanded: false,
    });
    expect(html).toContain('100%');
    expect(html).not.toContain('103%');
  });
});

// ── F14: Energy row ───────────────────────────────────────────────────────────
describe('renderHealthZone() — F14 energy row', () => {
  const baseHealthState: HealthZoneState = {
    openPopover: null, resetting: null, resetError: null, legendShown: false,
    healthDetailsExpanded: false, openMaintPopover: null, navDetailsExpanded: false,
  };

  it('energy row renders when hasEnergyConsumption and entity present', () => {
    const capsWithEnergy = { ...defaultCaps, hasEnergyConsumption: true };
    const html = renderHealthZone(
      makeHass({
        [`sensor.roomba_total_energy_consumed`]: st('42.3'),
        [`sensor.roomba_filter_remaining_hours`]: st('100', { threshold_hours: 200 }),
      }),
      baseConfig, capsWithEnergy, 'roomba', baseHealthState,
    );
    expect(html).toContain('rpc-energy-val');
    expect(html).toContain('42.3 kWh');
  });

  it('energy row absent when hasEnergyConsumption false', () => {
    const html = renderHealthZone(
      makeHass({
        [`sensor.roomba_total_energy_consumed`]: st('42.3'),
        [`sensor.roomba_filter_remaining_hours`]: st('100', { threshold_hours: 200 }),
      }),
      baseConfig, defaultCaps, 'roomba', baseHealthState,
    );
    expect(html).not.toContain('rpc-energy-val');
  });
});

// ── v2.0 C1-HEALTH: robot health score ───────────────────────────────────────
describe('renderHealthZone() — v2.0 C1-HEALTH robot health score', () => {
  const capsWithScore = { ...defaultCaps, hasRobotHealthScore: true };

  it('shows score and GOOD band when score >= 80', () => {
    const html = render({ [`sensor.${n}_robot_health_score`]: st('82') }, capsWithScore);
    expect(html).toContain('rpc-health-score-value');
    expect(html).toContain('82');
    expect(html).toContain('GOOD');
  });

  it('shows FAIR band when score is 60-79', () => {
    const html = render({ [`sensor.${n}_robot_health_score`]: st('65') }, capsWithScore);
    expect(html).toContain('FAIR');
  });

  it('shows NEEDS ATTENTION band when score < 60', () => {
    const html = render({ [`sensor.${n}_robot_health_score`]: st('45') }, capsWithScore);
    expect(html).toContain('NEEDS ATTENTION');
  });

  it('shows "Calibrating…" placeholder when state is unknown', () => {
    const html = render({ [`sensor.${n}_robot_health_score`]: st('unknown') }, capsWithScore);
    expect(html).toContain('Calibrating');
    expect(html).not.toContain('rpc-health-score-value');
  });

  it('shows "Calibrating…" placeholder when state is unavailable', () => {
    const html = render({ [`sensor.${n}_robot_health_score`]: st('unavailable') }, capsWithScore);
    expect(html).toContain('Calibrating');
  });

  it('absent entirely when hasRobotHealthScore is false', () => {
    const html = render({ [`sensor.${n}_robot_health_score`]: st('82') }, defaultCaps);
    expect(html).not.toContain('rpc-health-score');
  });

  it('component bars hidden by default (collapsed) when score present', () => {
    const html = render({
      [`sensor.${n}_robot_health_score`]: st('82'),
      [`sensor.${n}_filter_remaining_hours`]: st('100', { threshold_hours: 200 }),
    }, capsWithScore);
    expect(html).toContain('Show details');
    expect(html).not.toContain('rpc-bar-row" data-bar="filter"');
  });

  it('component bars shown when healthDetailsExpanded is true', () => {
    const html = render({
      [`sensor.${n}_robot_health_score`]: st('82'),
      [`sensor.${n}_filter_remaining_hours`]: st('100', { threshold_hours: 200 }),
    }, capsWithScore, { healthDetailsExpanded: true });
    expect(html).toContain('Hide details');
    expect(html).toContain('data-bar="filter"');
  });

  it('component bars always shown when hasRobotHealthScore is false, regardless of expand state', () => {
    const html = render({
      [`sensor.${n}_filter_remaining_hours`]: st('100', { threshold_hours: 200 }),
    }, defaultCaps, { healthDetailsExpanded: false });
    expect(html).toContain('data-bar="filter"');
  });

  it('zone still renders score when robot has zero consumable bars', () => {
    // Regression guard: the pre-v2.0 `bars.length === 0` early-return would
    // have hidden the entire zone, including the score, for a robot with no
    // detected filter/brush/battery/pad/tank/cleanbase sensors.
    const html = render({ [`sensor.${n}_robot_health_score`]: st('82') }, capsWithScore);
    expect(html).toContain('rpc-health-score-value');
  });
});

// ── v2.0 C2-MAINT: maintenance calendar ──────────────────────────────────────
describe('renderHealthZone() — v2.0 C2-MAINT maintenance calendar', () => {
  const capsWithMaint = { ...defaultCaps, hasMaintenanceCalendar: true };

  it('shows "Cleaned X ago" when sensor has a real timestamp', () => {
    const html = render({
      [`sensor.${n}_wheel_last_cleaned`]: st('2026-05-01T00:00:00Z'),
    }, capsWithMaint);
    expect(html).toContain('Wheels');
    expect(html).toContain('Cleaned');
  });

  it('shows "Never recorded" when sensor is unavailable', () => {
    const html = render({
      [`sensor.${n}_bin_last_cleaned`]: st('unavailable'),
    }, capsWithMaint);
    expect(html).toContain('Bin');
    expect(html).toContain('Never recorded');
  });

  it('only renders rows for sensors that are actually present', () => {
    const html = render({
      [`sensor.${n}_wheel_last_cleaned`]: st('2026-05-01T00:00:00Z'),
    }, capsWithMaint);
    expect(html).toContain('Wheels');
    expect(html).not.toContain('Contacts');
    expect(html).not.toContain('Bin');
  });

  it('absent entirely when hasMaintenanceCalendar is false', () => {
    const html = render({
      [`sensor.${n}_wheel_last_cleaned`]: st('2026-05-01T00:00:00Z'),
    }, defaultCaps);
    expect(html).not.toContain('rpc-maint-row');
  });

  it('zone still renders maintenance calendar when robot has zero consumable bars', () => {
    const html = render({
      [`sensor.${n}_wheel_last_cleaned`]: st('2026-05-01T00:00:00Z'),
    }, capsWithMaint);
    expect(html).toContain('rpc-maint-row');
  });
});

// ── v2.0 C5-ANOMALY: mission anomaly banner ──────────────────────────────────
// Active against integration 3.0.0: dedicated sensor
// `sensor.*_consecutive_mission_anomalies` whose STATE is the count. Threshold
// ≥3 per the integration author's intent. Sensor is disabled-by-default, so the
// entity may be absent — that yields no banner.
describe('renderHealthZone() — C5-ANOMALY banner (integration 3.0.0)', () => {
  it('shows banner when consecutive count >= 3', () => {
    const html = render({
      [`sensor.${n}_consecutive_mission_anomalies`]: st('3'),
    });
    expect(html).toContain('rpc-anomaly-banner');
    expect(html).toContain('Last 3 missions were anomalous');
  });

  it('shows banner with the actual count (e.g. 5)', () => {
    const html = render({
      [`sensor.${n}_consecutive_mission_anomalies`]: st('5'),
    });
    expect(html).toContain('Last 5 missions were anomalous');
  });

  it('does not show banner at count 2 (coincidence, below threshold)', () => {
    const html = render({
      [`sensor.${n}_consecutive_mission_anomalies`]: st('2'),
    });
    expect(html).not.toContain('rpc-anomaly-banner');
  });

  it('does not show banner when the sensor is absent (disabled by default)', () => {
    const html = render({
      [`sensor.${n}_last_mission_result`]: st('completed'),
    });
    expect(html).not.toContain('rpc-anomaly-banner');
  });

  it('does not show banner for a non-numeric state (unavailable/unknown)', () => {
    const html = render({
      [`sensor.${n}_consecutive_mission_anomalies`]: st('unavailable'),
    });
    expect(html).not.toContain('rpc-anomaly-banner');
  });
});

// ── A1 (v2.1.0): navigation health detail ────────────────────────────────────
describe('renderHealthZone() — A1 navigation health', () => {
  const navState: HealthZoneState = {
    openPopover: null, resetting: null, resetError: null, legendShown: false,
    healthDetailsExpanded: false, openMaintPopover: null, navDetailsExpanded: false,
  };
  const navCaps = { ...defaultCaps, hasNavStats: true };

  function renderNav(states: Record<string, ReturnType<typeof st>>, stateOpts: Partial<HealthZoneState> = {}) {
    return renderHealthZone(makeHass(states), baseConfig, navCaps, n, { ...navState, ...stateOpts });
  }

  it('absent when hasNavStats is false', () => {
    const html = renderHealthZone(
      makeHass({ [`sensor.${n}_nav_panics`]: st('3') }),
      baseConfig, defaultCaps, n, navState,
    );
    expect(html).not.toContain('rpc-nav-health');
  });

  it('shows the navigation score with ampel colour', () => {
    const html = renderNav({
      [`sensor.${n}_nav_quality`]: st('85'),
      [`sensor.${n}_nav_panics`]: st('0'),
    });
    expect(html).toContain('rpc-nav-health');
    expect(html).toContain('NAVIGATION');
    expect(html).toContain('85');
    expect(html).toContain('--rpc-green'); // 85 → good
  });

  it('factors are hidden when collapsed', () => {
    const html = renderNav({
      [`sensor.${n}_nav_quality`]: st('85'),
      [`sensor.${n}_nav_panics`]: st('4'),
    }, { navDetailsExpanded: false });
    expect(html).not.toContain('rpc-nav-factors');
    expect(html).toContain('Details ▼');
  });

  it('factors are shown when expanded (panics, landmark quality, good landmarks)', () => {
    const html = renderNav({
      [`sensor.${n}_nav_quality`]: st('55'),
      [`sensor.${n}_nav_panics`]: st('4'),
      [`sensor.${n}_nav_landmark_quality`]: st('72'),
      [`sensor.${n}_nav_good_landmarks`]: st('11'),
    }, { navDetailsExpanded: true });
    expect(html).toContain('rpc-nav-factors');
    expect(html).toContain('Panic events');
    expect(html).toContain('Landmark quality');
    expect(html).toContain('Good landmarks');
    expect(html).toContain('--rpc-red'); // 55 → needs attention
  });

  it('does NOT render nav_orientations (deliberately omitted)', () => {
    const html = renderNav({
      [`sensor.${n}_nav_quality`]: st('85'),
      [`sensor.${n}_nav_panics`]: st('1'),
    }, { navDetailsExpanded: true });
    expect(html).not.toContain('rientation');
  });

  it('omits a factor whose sensor is unavailable', () => {
    const html = renderNav({
      [`sensor.${n}_nav_panics`]: st('2'),
      [`sensor.${n}_nav_landmark_quality`]: st('unavailable'),
    }, { navDetailsExpanded: true });
    expect(html).toContain('Panic events');
    expect(html).not.toContain('Landmark quality');
  });

  it('shows — for the score when nav_quality is unavailable but factors exist', () => {
    const html = renderNav({
      [`sensor.${n}_nav_panics`]: st('3'),
    });
    expect(html).toContain('rpc-nav-health');
    expect(html).toContain('rpc-nav-score--na');
  });
});

describe('renderHealthZone() — v2.2.0 B1 resolved-error info line', () => {
  it('shows muted "Last error" line when error is resolved (no active vacuum error)', () => {
    const html = render({
      [`vacuum.${n}`]:                 st('docked', {}),
      [`sensor.${n}_last_error_code`]: st('2', { label: 'Brush stuck' }),
      [`sensor.${n}_last_error_at`]:   st(new Date(Date.now() - 6 * 86400000).toISOString()),
    });
    expect(html).toContain('rpc-last-error-info');
    expect(html).toContain('Last error: Brush stuck');
    expect(html).toContain('(resolved)');
    expect(html).toMatch(/6 days ago|6d ago/);
  });

  it('omits the info line while the error is still ACTIVE (banner owns it)', () => {
    const html = render({
      [`vacuum.${n}`]:                 st('error', { error_code: 2 }),
      [`sensor.${n}_last_error_code`]: st('2', { label: 'Brush stuck' }),
    });
    expect(html).not.toContain('rpc-last-error-info');
  });

  it('omits the info line when no error was ever recorded', () => {
    const html = render({
      [`vacuum.${n}`]:                 st('docked', {}),
      [`sensor.${n}_last_error_code`]: st('0'),
    });
    expect(html).not.toContain('rpc-last-error-info');
  });

  it('renders without timestamp when last_error_at is unavailable', () => {
    const html = render({
      [`vacuum.${n}`]:                 st('docked', {}),
      [`sensor.${n}_last_error_code`]: st('9', { label: 'Cliff sensor' }),
      [`sensor.${n}_last_error_at`]:   st('unavailable'),
    });
    expect(html).toContain('Last error: Cliff sensor (resolved)');
  });

  it('falls back to "Error N" label and escapes XSS', () => {
    const html = render({
      [`vacuum.${n}`]:                 st('docked', {}),
      [`sensor.${n}_last_error_code`]: st('5', { label: '<b>x</b>' }),
    });
    expect(html).not.toContain('<b>x</b>');
    expect(html).toContain('&lt;b&gt;');
  });
});

describe('renderHealthZone() — v2.2.0 F2 plain status (PLAIN-STATUS, integration ≥ 3.1.0)', () => {
  const capsScore = { ...defaultCaps, hasRobotHealthScore: true };

  it('renders status_text and recommendation from score attributes', () => {
    const html = render({
      [`sensor.${n}_robot_health_score`]: st('72', {
        status_text: 'Akkuleistung lässt nach',
        recommendation: 'Akkuzustand im Blick behalten.',
      }),
    }, capsScore);
    expect(html).toContain('rpc-health-plain-status');
    expect(html).toContain('Akkuleistung lässt nach');
    expect(html).toContain('Akkuzustand im Blick behalten.');
  });

  it('renders status_text without recommendation when recommendation is null (healthy)', () => {
    const html = render({
      [`sensor.${n}_robot_health_score`]: st('95', {
        status_text: 'Robot is in good condition',
        recommendation: null,
      }),
    }, capsScore);
    expect(html).toContain('Robot is in good condition');
    expect(html).not.toContain('rpc-health-recommendation');
  });

  it('renders nothing extra on integration ≤ 3.0.x (attrs absent)', () => {
    const html = render({ [`sensor.${n}_robot_health_score`]: st('82') }, capsScore);
    expect(html).not.toContain('rpc-health-plain-status');
  });

  it('escapes HTML in status_text', () => {
    const html = render({
      [`sensor.${n}_robot_health_score`]: st('50', { status_text: '<b>x</b>' }),
    }, capsScore);
    expect(html).not.toContain('<b>x</b>');
  });
});

describe('renderHealthZone() — v2.2.0 F3 health score trend (integration ≥ 3.2.0)', () => {
  const capsScore = { ...defaultCaps, hasRobotHealthScore: true };
  const score = { [`sensor.${n}_robot_health_score`]: st('82') };

  it('shows improving trend with up arrow', () => {
    const html = render({ ...score, [`sensor.${n}_health_score_trend`]: st('improving') }, capsScore);
    expect(html).toContain('rpc-health-trend');
    expect(html).toContain('↗ improving');
  });

  it('shows declining trend in amber', () => {
    const html = render({ ...score, [`sensor.${n}_health_score_trend`]: st('declining') }, capsScore);
    expect(html).toContain('↘ declining');
    expect(html).toContain('#d97706');
  });

  it('shows stable trend', () => {
    const html = render({ ...score, [`sensor.${n}_health_score_trend`]: st('stable') }, capsScore);
    expect(html).toContain('→ stable');
  });

  it('calibrating trend shows countdown, never zero or error (calibration-state invariant)', () => {
    const html = render({
      ...score,
      [`sensor.${n}_health_score_trend`]: st('unknown', { days_until_ready: 31, days_recorded: 13 }),
    }, capsScore);
    expect(html).toContain('trend in ~31d');
    expect(html).not.toContain('↘');
  });

  it('calibrating trend with days_until_ready 0 or missing renders nothing', () => {
    const html = render({
      ...score,
      [`sensor.${n}_health_score_trend`]: st('unknown', { days_until_ready: 0 }),
    }, capsScore);
    expect(html).not.toContain('rpc-health-trend');
    const html2 = render({ ...score, [`sensor.${n}_health_score_trend`]: st('unknown') }, capsScore);
    expect(html2).not.toContain('rpc-health-trend');
  });

  it('trend entity absent (≤ 3.1.x) renders no trend markup', () => {
    const html = render(score, capsScore);
    expect(html).not.toContain('rpc-health-trend');
  });
});

describe('renderHealthZone() — v2.2.0 A3 dock health', () => {
  it('renders tank level and lifetime counters when sensors present', () => {
    const html = render({
      [`sensor.${n}_dock_tank_level`]:        st('68'),
      [`sensor.${n}_dock_knockoffs`]:         st('3'),
      [`sensor.${n}_dock_charge_aborts`]:     st('12'),
      [`sensor.${n}_dock_contact_chatters`]:  st('154'),
    });
    expect(html).toContain('DOCK');
    expect(html).toContain('Tank level 68%');
    expect(html).toContain('3 knockoffs');
    expect(html).toContain('12 charge aborts');
    expect(html).toContain('154 contact chatters');
    expect(html).toContain('(lifetime)');
  });

  it('renders subset: tank only (default-enabled sensor, diagnostics disabled)', () => {
    const html = render({ [`sensor.${n}_dock_tank_level`]: st('40') });
    expect(html).toContain('Tank level 40%');
    expect(html).not.toContain('knockoffs');
  });

  it('renders counters without tank (dock without water tank)', () => {
    const html = render({ [`sensor.${n}_dock_knockoffs`]: st('1') });
    expect(html).toContain('1 knockoffs');
    expect(html).not.toContain('Tank level');
  });

  it('renders no dock section when all sensors absent (e.g. Roomba 980, no Clean Base)', () => {
    const html = render({ [`sensor.${n}_filter_remaining_hours`]: st('50', { threshold_hours: 200 }) });
    expect(html).not.toContain('rpc-dock-health');
  });

  it('unavailable sensors are treated as absent', () => {
    const html = render({ [`sensor.${n}_dock_tank_level`]: st('unavailable') });
    expect(html).not.toContain('rpc-dock-health');
  });
});

describe('renderHealthZone() — v2.2.0 R1: dock block respects details collapse', () => {
  it('dock hidden when health score present and details collapsed', () => {
    const html = render({
      [`sensor.${n}_robot_health_score`]: st('82'),
      [`sensor.${n}_dock_tank_level`]:    st('68'),
    }, { ...defaultCaps, hasRobotHealthScore: true }, { healthDetailsExpanded: false });
    expect(html).not.toContain('rpc-dock-health');
  });

  it('dock visible when details expanded', () => {
    const html = render({
      [`sensor.${n}_robot_health_score`]: st('82'),
      [`sensor.${n}_dock_tank_level`]:    st('68'),
    }, { ...defaultCaps, hasRobotHealthScore: true }, { healthDetailsExpanded: true });
    expect(html).toContain('rpc-dock-health');
  });
});

describe('renderHealthZone() — v2.3.0 Rooms-Overdue widget', () => {
  const caps = { ...defaultCaps, hasRoomsOverdue: true };

  it('no section when capability absent, even with the entity present', () => {
    const html = render({
      [`sensor.${n}_rooms_overdue`]: st('2', { overdue_rooms: ['Kitchen'], rooms: { Kitchen: { days_since_last: 6, expected_interval_days: 3, source: 'configured', status: 'overdue', overdue_factor: 2 } } }),
    }, defaultCaps);
    expect(html).not.toContain('rpc-rooms-overdue');
  });

  it('renders "All rooms in rhythm" as a real answer, not hidden, at zero overdue', () => {
    const html = render({
      [`sensor.${n}_rooms_overdue`]: st('0', { rooms: {}, overdue_rooms: [] }),
    }, caps);
    expect(html).toContain('rpc-rooms-overdue');
    expect(html).toContain('All rooms in rhythm');
  });

  it('renders overdue rooms in the pre-sorted order from overdue_rooms, with day counts', () => {
    const html = render({
      [`sensor.${n}_rooms_overdue`]: st('2', {
        rooms: {
          Kitchen: { days_since_last: 6.2, expected_interval_days: 3.0, source: 'configured', status: 'overdue', overdue_factor: 2.07 },
          Bedroom: { days_since_last: 9.6, expected_interval_days: 7.0, source: 'learned', status: 'overdue', overdue_factor: 1.37 },
        },
        overdue_rooms: ['Kitchen', 'Bedroom'],
      }),
    }, caps);
    expect(html).toContain('Kitchen — 6d since last clean (expected ~3d)');
    expect(html).toContain('Bedroom — 10d since last clean (expected ~7d)');
    // order: Kitchen (higher overdue_factor) must appear before Bedroom
    expect(html.indexOf('Kitchen')).toBeLessThan(html.indexOf('Bedroom'));
  });

  it('omits the expected-interval parenthetical when expected_interval_days is null', () => {
    const html = render({
      [`sensor.${n}_rooms_overdue`]: st('1', {
        rooms: { Attic: { days_since_last: 40, expected_interval_days: null, source: 'insufficient_data', status: 'overdue', overdue_factor: null } },
        overdue_rooms: ['Attic'],
      }),
    }, caps);
    expect(html).toContain('Attic — 40d since last clean');
    expect(html).not.toContain('(expected ~');
  });

  it('renders the daily_suggested line when present', () => {
    const html = render({
      [`sensor.${n}_rooms_overdue`]: st('1', {
        rooms: { Kitchen: { days_since_last: 2, expected_interval_days: 2, source: 'learned', status: 'overdue', overdue_factor: 1.0 } },
        overdue_rooms: ['Kitchen'],
        daily_suggested: ['Kitchen'],
      }),
    }, caps);
    expect(html).toContain('Kitchen could use daily cleaning');
  });

  it('omits the daily_suggested line when the key is entirely absent (not just empty)', () => {
    const html = render({
      [`sensor.${n}_rooms_overdue`]: st('0', { rooms: {}, overdue_rooms: [] }),
    }, caps);
    expect(html).not.toContain('could use daily cleaning');
  });

  it('no section when the entity itself is absent despite the capability flag', () => {
    const html = render({}, caps);
    expect(html).not.toContain('rpc-rooms-overdue');
  });

  // ── Bug-hunt round 1: an unavailable/unknown entity must not read as a
  // false "0 overdue" — HA clears attributes on unavailable entities, so
  // without an explicit guard this would render the calm "All rooms in
  // rhythm" message when the sensor is actually just down. ──
  it('renders nothing (not "All rooms in rhythm") when the entity is unavailable', () => {
    const html = render({
      [`sensor.${n}_rooms_overdue`]: st('unavailable', {}),
    }, caps);
    expect(html).not.toContain('rpc-rooms-overdue');
    expect(html).not.toContain('All rooms in rhythm');
  });

  it('renders nothing (not "All rooms in rhythm") when the entity state is unknown', () => {
    const html = render({
      [`sensor.${n}_rooms_overdue`]: st('unknown', {}),
    }, caps);
    expect(html).not.toContain('rpc-rooms-overdue');
    expect(html).not.toContain('All rooms in rhythm');
  });

  it('rooms-overdue alone (no other health content) still produces a non-empty render', () => {
    const html = render({
      [`sensor.${n}_rooms_overdue`]: st('1', {
        rooms: { Kitchen: { days_since_last: 6, expected_interval_days: 3, source: 'configured', status: 'overdue', overdue_factor: 2 } },
        overdue_rooms: ['Kitchen'],
      }),
    }, caps);
    expect(html).not.toBe('');
  });

  // ── "Clean overdue" trigger button — reuses the generic data-reset/
  // data-service mechanism (dispatchClick's 'reset' case), keyed 'overdue-clean'.
  it('button appears when rooms are overdue', () => {
    const html = render({
      [`sensor.${n}_rooms_overdue`]: st('1', {
        rooms: { Kitchen: { days_since_last: 6, expected_interval_days: 3, source: 'configured', status: 'overdue', overdue_factor: 2 } },
        overdue_rooms: ['Kitchen'],
      }),
    }, caps);
    expect(html).toContain('data-reset="overdue-clean"');
    expect(html).toContain('data-service="clean_overdue_rooms"');
    expect(html).toContain('Clean overdue');
  });

  it('button absent when nothing is overdue — no action for nothing to do', () => {
    const html = render({
      [`sensor.${n}_rooms_overdue`]: st('0', { rooms: {}, overdue_rooms: [] }),
    }, caps);
    expect(html).not.toContain('data-reset="overdue-clean"');
  });

  it('shows a spinner and disables the button while sending', () => {
    const html = render({
      [`sensor.${n}_rooms_overdue`]: st('1', {
        rooms: { Kitchen: { days_since_last: 6, expected_interval_days: 3, source: 'configured', status: 'overdue', overdue_factor: 2 } },
        overdue_rooms: ['Kitchen'],
      }),
    }, caps, { resetting: 'overdue-clean' });
    expect(html).toContain('rpc-spinner');
    expect(html).toContain('disabled');
    expect(html).not.toContain('Clean overdue');
  });

  it('shows an error message when the send failed', () => {
    const html = render({
      [`sensor.${n}_rooms_overdue`]: st('1', {
        rooms: { Kitchen: { days_since_last: 6, expected_interval_days: 3, source: 'configured', status: 'overdue', overdue_factor: 2 } },
        overdue_rooms: ['Kitchen'],
      }),
    }, caps, { resetError: 'overdue-clean' });
    expect(html).toContain("Couldn't start — try again");
  });

  it('a different reset key\'s loading/error state does not leak onto this button', () => {
    const html = render({
      [`sensor.${n}_rooms_overdue`]: st('1', {
        rooms: { Kitchen: { days_since_last: 6, expected_interval_days: 3, source: 'configured', status: 'overdue', overdue_factor: 2 } },
        overdue_rooms: ['Kitchen'],
      }),
    }, caps, { resetting: 'retention', resetError: 'retention' });
    expect(html).toContain('Clean overdue');
    expect(html).not.toContain("Couldn't start — try again");
  });

  // ── v2.4.0 — suggested_interval_days (full per-room dict, previously
  // only its daily_suggested subset was surfaced) ──
  it('renders the full suggested_interval_days dict, sorted ascending by days', () => {
    const html = render({
      [`sensor.${n}_rooms_overdue`]: st('0', {
        rooms: {}, overdue_rooms: [],
        suggested_interval_days: { Bedroom: 4.5, Kitchen: 2.1 },
      }),
    }, caps);
    expect(html).toContain('Kitchen: suggested every 2.1d');
    expect(html).toContain('Bedroom: suggested every 4.5d');
    expect(html.indexOf('Kitchen')).toBeLessThan(html.indexOf('Bedroom'));
  });

  it('omits the suggested-interval section when the key is entirely absent', () => {
    const html = render({
      [`sensor.${n}_rooms_overdue`]: st('0', { rooms: {}, overdue_rooms: [] }),
    }, caps);
    expect(html).not.toContain('rpc-rooms-suggested');
  });

  it('omits the suggested-interval section when the dict is empty', () => {
    const html = render({
      [`sensor.${n}_rooms_overdue`]: st('0', { rooms: {}, overdue_rooms: [], suggested_interval_days: {} }),
    }, caps);
    expect(html).not.toContain('rpc-rooms-suggested');
  });

  it('skips a non-finite suggested-interval value defensively instead of rendering "every NaNd"', () => {
    const html = render({
      [`sensor.${n}_rooms_overdue`]: st('0', {
        rooms: {}, overdue_rooms: [],
        suggested_interval_days: { Kitchen: 2.1, Attic: 'unknown' as unknown as number },
      }),
    }, caps);
    expect(html).toContain('Kitchen: suggested every 2.1d');
    expect(html).not.toContain('NaN');
    expect(html).not.toContain('Attic');
  });

  // ── v2.4.0 — "Auto-clean dirty rooms" trigger button — same generic
  // data-reset/data-service mechanism, own key 'auto-clean-dirty'. Unlike
  // Clean overdue, deliberately NOT gated on anything overdue-related —
  // always present once the ROOMS block itself renders.
  it('button appears even when nothing is overdue (different signal, no no-op case to hide for)', () => {
    const html = render({
      [`sensor.${n}_rooms_overdue`]: st('0', { rooms: {}, overdue_rooms: [] }),
    }, caps);
    expect(html).toContain('data-reset="auto-clean-dirty"');
    expect(html).toContain('data-service="auto_clean_dirty_rooms"');
    expect(html).toContain('Auto-clean dirty rooms');
  });

  it('button appears alongside Clean overdue when rooms are also overdue', () => {
    const html = render({
      [`sensor.${n}_rooms_overdue`]: st('1', {
        rooms: { Kitchen: { days_since_last: 6, expected_interval_days: 3, source: 'configured', status: 'overdue', overdue_factor: 2 } },
        overdue_rooms: ['Kitchen'],
      }),
    }, caps);
    expect(html).toContain('data-reset="overdue-clean"');
    expect(html).toContain('data-reset="auto-clean-dirty"');
  });

  it('shows its own spinner/disabled state without affecting the Clean overdue button', () => {
    const html = render({
      [`sensor.${n}_rooms_overdue`]: st('1', {
        rooms: { Kitchen: { days_since_last: 6, expected_interval_days: 3, source: 'configured', status: 'overdue', overdue_factor: 2 } },
        overdue_rooms: ['Kitchen'],
      }),
    }, caps, { resetting: 'auto-clean-dirty' });
    expect(html).toContain('rpc-spinner');
    expect(html).not.toContain('Auto-clean dirty rooms');
    expect(html).toContain('Clean overdue'); // unaffected — different key
  });

  it('shows an error message for its own key without leaking onto Clean overdue', () => {
    const html = render({
      [`sensor.${n}_rooms_overdue`]: st('1', {
        rooms: { Kitchen: { days_since_last: 6, expected_interval_days: 3, source: 'configured', status: 'overdue', overdue_factor: 2 } },
        overdue_rooms: ['Kitchen'],
      }),
    }, caps, { resetError: 'auto-clean-dirty' });
    expect(html).toContain("Couldn't start — try again");
    expect(html).toContain('Clean overdue');
  });
});

describe('renderHealthZone() — v2.3.0 dirt/sensor correlation widget', () => {
  const caps = { ...defaultCaps, hasDirtCorrelation: true };

  it('no section when capability absent, even with the entity present', () => {
    const html = render({
      [`sensor.${n}_dirt_weather_correlation`]: st('0.61', {
        by_entity: { 'sensor.humidity': { r: 0.61, n: 40 } }, strongest_entity: 'sensor.humidity',
      }),
    }, defaultCaps);
    expect(html).not.toContain('rpc-dirt-corr');
  });

  it('no section when the entity itself is absent despite the capability flag', () => {
    const html = render({}, caps);
    expect(html).not.toContain('rpc-dirt-corr');
  });

  // ── Bug-hunt round 1 (self-correction): unlike rooms_overdue, this
  // sensor's state legitimately reads "unknown" whenever nothing passes
  // the correlation threshold yet — that's the normal case the progress
  // display exists for, not a broken entity. Only "unavailable" should
  // hide the section. ──
  it('renders nothing when the entity is genuinely unavailable', () => {
    const html = render({
      [`sensor.${n}_dirt_weather_correlation`]: st('unavailable', {}),
    }, caps);
    expect(html).not.toContain('rpc-dirt-corr');
  });

  it('still renders (does NOT hide) when state is "unknown" with no passing correlation — the normal case', () => {
    const html = render({
      [`sensor.${n}_dirt_weather_correlation`]: st('unknown', {
        by_entity: { 'sensor.humidity': { r: null, n: 5 } }, strongest_entity: null,
      }),
    }, caps);
    expect(html).toContain('rpc-dirt-corr');
    expect(html).toContain('5/30 missions');
  });

  it('shows the strongest correlation with the friendly entity name and r value', () => {
    const html = render({
      [`sensor.${n}_dirt_weather_correlation`]: st('0.61', {
        by_entity: { 'sensor.humidity': { r: 0.61, n: 40 } }, strongest_entity: 'sensor.humidity',
      }),
      'sensor.humidity': st('55', { friendly_name: 'Outdoor Humidity' }),
    }, caps);
    expect(html).toContain('rpc-dirt-corr');
    expect(html).toContain('Strongest link: Outdoor Humidity (r = 0.61)');
  });

  it('falls back to the entity id when no friendly_name is available', () => {
    const html = render({
      [`sensor.${n}_dirt_weather_correlation`]: st('0.61', {
        by_entity: { 'sensor.humidity': { r: 0.61, n: 40 } }, strongest_entity: 'sensor.humidity',
      }),
    }, caps);
    expect(html).toContain('Strongest link: sensor.humidity (r = 0.61)');
  });

  it('shows sample-count progress toward the 30-sample threshold when nothing passes yet', () => {
    const html = render({
      [`sensor.${n}_dirt_weather_correlation`]: st('unknown', {
        by_entity: { 'sensor.humidity': { r: null, n: 18 } }, strongest_entity: null,
      }),
      'sensor.humidity': st('55', { friendly_name: 'Outdoor Humidity' }),
    }, caps);
    expect(html).toContain('Outdoor Humidity: 18/30 missions');
  });

  it('shows a calm "Collecting data…" message when by_entity is empty', () => {
    const html = render({
      [`sensor.${n}_dirt_weather_correlation`]: st('unknown', { by_entity: {}, strongest_entity: null }),
    }, caps);
    expect(html).toContain('Collecting data…');
  });

  it('dirt-correlation alone (no other health content) still produces a non-empty render', () => {
    const html = render({
      [`sensor.${n}_dirt_weather_correlation`]: st('unknown', { by_entity: {}, strongest_entity: null }),
    }, caps);
    expect(html).not.toBe('');
  });
});
