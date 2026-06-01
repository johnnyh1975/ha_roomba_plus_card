import { describe, it, expect } from 'vitest';
import { detectCapabilities } from '../src/capabilities';
import { makeHass, st } from './helpers';

const n = 'roomba';

describe('detectCapabilities()', () => {
  it('hasArea false when sensor absent', () =>
    expect(detectCapabilities(makeHass(), n).hasArea).toBe(false));

  it('hasArea true when sensor present', () =>
    expect(detectCapabilities(makeHass({ [`sensor.${n}_area_cleaned_today`]: st('42') }), n).hasArea).toBe(true));

  it('hasBrush false when sensor absent', () =>
    expect(detectCapabilities(makeHass(), n).hasBrush).toBe(false));

  it('hasBrush true when sensor present', () =>
    expect(detectCapabilities(makeHass({ [`sensor.${n}_brush_remaining_hours`]: st('80', { threshold_hours: 100 }) }), n).hasBrush).toBe(true));

  it('hasPad false when sensor absent', () =>
    expect(detectCapabilities(makeHass(), n).hasPad).toBe(false));

  it('hasPad true when mop_pad sensor present', () =>
    expect(detectCapabilities(makeHass({ [`sensor.${n}_mop_pad`]: st('Wet (reusable)') }), n).hasPad).toBe(true));

  it('isMop = false when only brush present', () => {
    const hass = makeHass({ [`sensor.${n}_brush_remaining_hours`]: st('80', { threshold_hours: 100 }) });
    expect(detectCapabilities(hass, n).isMop).toBe(false);
  });

  it('isMop = true when pad present and no brush', () => {
    const hass = makeHass({ [`sensor.${n}_mop_pad`]: st('Wet (reusable)') });
    const caps = detectCapabilities(hass, n);
    expect(caps.hasPad).toBe(true);
    expect(caps.isMop).toBe(true);
  });

  it('isMop = false when both pad and brush present', () => {
    const hass = makeHass({
      [`sensor.${n}_mop_pad`]:              st('Wet (reusable)'),
      [`sensor.${n}_brush_remaining_hours`]: st('80', { threshold_hours: 100 }),
    });
    expect(detectCapabilities(hass, n).isMop).toBe(false);
  });

  it('hasZones true from smart_zone_select', () =>
    expect(detectCapabilities(makeHass({ [`select.${n}_smart_zone_select`]: st('Kitchen', { options: ['Kitchen'] }) }), n).hasZones).toBe(true));

  it('hasZones true from zone_select fallback', () =>
    expect(detectCapabilities(makeHass({ [`select.${n}_zone_select`]: st('Zone1', { options: ['Zone1'] }) }), n).hasZones).toBe(true));

  it('hasZones false when neither selector exists', () =>
    expect(detectCapabilities(makeHass(), n).hasZones).toBe(false));

  it('hasMissionActive true from binary_sensor', () =>
    expect(detectCapabilities(makeHass({ [`binary_sensor.${n}_mission_active`]: st('on') }), n).hasMissionActive).toBe(true));

  it('hasMissionPhase true from sensor', () =>
    expect(detectCapabilities(makeHass({ [`sensor.${n}_mission_phase`]: st('run') }), n).hasMissionPhase).toBe(true));

  it('hasWearRate true from filter_wear_rate sensor', () =>
    expect(detectCapabilities(makeHass({ [`sensor.${n}_filter_wear_rate`]: st('1.2') }), n).hasWearRate).toBe(true));
});

describe('detectCapabilities() — F1 new caps', () => {
  it('hasDemandBlocked true from binary_sensor.*_demand_clean_blocked', () =>
    expect(detectCapabilities(makeHass({ [`binary_sensor.${n}_demand_clean_blocked`]: st('on') }), n).hasDemandBlocked).toBe(true));

  it('hasDemandBlocked false when entity absent', () =>
    expect(detectCapabilities(makeHass(), n).hasDemandBlocked).toBe(false));

  it('hasEnergyConsumption true from sensor.*_total_energy_consumed', () =>
    expect(detectCapabilities(makeHass({ [`sensor.${n}_total_energy_consumed`]: st('42.3') }), n).hasEnergyConsumption).toBe(true));

  it('hasEnergyConsumption false when entity absent', () =>
    expect(detectCapabilities(makeHass(), n).hasEnergyConsumption).toBe(false));
});
