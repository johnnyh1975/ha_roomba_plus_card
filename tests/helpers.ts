import { HomeAssistant, HAState, RobotCapabilities, CardConfig } from '../src/types';

export function st(state: string, attributes: Record<string, unknown> = {}): HAState {
  return { entity_id: '', state, attributes, last_changed: '2025-05-14T10:00:00Z', last_updated: '2025-05-14T10:00:00Z' };
}

export function makeHass(states: Record<string, Partial<HAState>> = {}): HomeAssistant {
  return {
    states: Object.fromEntries(
      Object.entries(states).map(([id, partial]) => [
        id,
        { entity_id: id, state: 'unavailable', attributes: {}, last_changed: '2025-05-14T10:00:00Z', last_updated: '2025-05-14T10:00:00Z', ...partial },
      ])
    ),
    callService: async () => {},
    callWS: async () => ({ config_entry_id: 'test-entry' }),
    fetchWithAuth: async () => ({ ok: true, json: async () => [] } as unknown as Response),
    language: 'en',
    config: { unit_system: { length: 'ft' } },
  };
}

export const defaultCaps: RobotCapabilities = {
  hasArea: false, hasBrush: true, hasPad: false, hasWater: false,
  hasCleanBase: false, hasZones: false, hasSmartZones: false,
  hasProblemZone: false, hasLifetimeArea: false, hasWearRate: false,
  isMop: false, hasMissionActive: false, hasMissionPhase: false,
  // v1.3
  hasCleaningSpeedTrend: false, hasBatteryRetention: false, hasWifiFloor: false,
  hasCoveragePct: false, hasBatteryEol: false, hasConsecutiveSkips: false,
  hasMopBehavior: false,
  // v2.2+ Tier 1
  hasCoverageImage: false,
  // Tier 2
  hasWifiSignal: false, hasRoomCoverage: false, hasDirtDensity: false,
  // Config-based
  hasRobotSelectorHelper: false,
};

export const fullCaps: RobotCapabilities = {
  hasArea: true, hasBrush: true, hasPad: false, hasWater: false,
  hasCleanBase: true, hasZones: true, hasSmartZones: true,
  hasProblemZone: true, hasLifetimeArea: true, hasWearRate: true,
  isMop: false, hasMissionActive: true, hasMissionPhase: true,
  // v1.3
  hasCleaningSpeedTrend: true, hasBatteryRetention: true, hasWifiFloor: true,
  hasCoveragePct: true, hasBatteryEol: true, hasConsecutiveSkips: true,
  hasMopBehavior: false,
  // v2.2+ Tier 1
  hasCoverageImage: false,
  // Tier 2
  hasWifiSignal: true, hasRoomCoverage: false, hasDirtDensity: false,
  // Config-based
  hasRobotSelectorHelper: false,
};

export const baseConfig: CardConfig = {
  entity: 'vacuum.roomba',
};
