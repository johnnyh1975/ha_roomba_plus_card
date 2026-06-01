import { HomeAssistant, RobotCapabilities } from './types.js';

export function detectCapabilities(hass: HomeAssistant, name: string): RobotCapabilities {
  const e = (key: string) => !!hass.states[`sensor.${name}_${key}`];
  const s = (key: string) => !!hass.states[`select.${name}_${key}`];
  const b = (key: string) => !!hass.states[`binary_sensor.${name}_${key}`];
  const hasPad   = e('mop_pad');
  const hasBrush = e('brush_remaining_hours');
  return {
    hasArea:          e('area_cleaned_today'),
    hasBrush,
    hasPad,
    hasWater:         e('mop_tank_level'),
    hasCleanBase:     e('clean_base_status'),
    hasZones:         s('smart_zone_select') || s('zone_select'),
    hasSmartZones:    s('smart_zone_select'),
    hasProblemZone:   e('problem_zone'),
    hasLifetimeArea:  e('lifetime_area'),
    hasWearRate:      e('filter_wear_rate'),
    isMop:            hasPad && !hasBrush,
    hasMissionActive: b('mission_active'),
    hasMissionPhase:  e('mission_phase'),
    hasDemandBlocked: b('demand_clean_blocked'),
    hasEnergyConsumption: e('total_energy_consumed'),
  };
}
