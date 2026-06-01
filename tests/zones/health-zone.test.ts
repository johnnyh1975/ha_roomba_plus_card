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
    const html = render({ [`sensor.${n}_battery_level`]: st('84') });
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
      { ...defaultCaps, hasPad: true, isMop: true },
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
