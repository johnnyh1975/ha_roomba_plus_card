export interface CardConfig {
  entity: string;           // single robot (backward compat — required by HA card spec)
  entities?: string[];      // F3: multi-robot list (takes precedence over entity when present)
  show_health?: boolean;
  show_schedule?: boolean;
  show_alerts?: boolean;
  show_history?: boolean;
  show_rooms?: boolean;
  history_days?: 7 | 14 | 28;
  area_unit?: 'auto' | 'sqft' | 'm2';
  presence_entities?: string[];
  /** Wave C: show lifetime stats row in history zone (default: true, hidden when cloud sensors absent) */
  show_lifetime?: boolean;
  /** Wave C: show dirt event count in day detail popover (default: false — requires integration ≥ v2.0, uses dirt_events field) */
  show_dirt_events?: boolean;
}

export interface RobotCapabilities {
  hasArea: boolean;
  hasBrush: boolean;
  hasPad: boolean;
  hasWater: boolean;
  hasCleanBase: boolean;
  hasZones: boolean;
  hasSmartZones: boolean;
  hasProblemZone: boolean;
  hasLifetimeArea: boolean;
  hasWearRate: boolean;
  isMop: boolean;
  /** binary_sensor.*_mission_active — v1.9.0+ */
  hasMissionActive: boolean;
  /** sensor.*_mission_phase (run/charge/dock/pause/evac/none) — v1.9.0+ */
  hasMissionPhase: boolean;
  /** binary_sensor.*_demand_clean_blocked — v2.3+: floor dirty but robot blocked */
  hasDemandBlocked: boolean;
  /** sensor.*_total_energy_consumed — v2.3+ */
  hasEnergyConsumption: boolean;
}

/** Per-mission record from GET …/mission_history?format=records (integration ≥ v2.0) */
export interface MissionRecord {
  id: string;
  started_at: string;           // was: start_time in v1.1 summary shape
  ended_at: string | null;
  duration_min: number;
  run_min: number | null;       // cloud only
  area_sqft: number | null;
  result: string;               // 'completed' | 'stuck' | 'error' | 'cancelled'
  initiator: string;            // 'schedule' | 'manual' | 'demand' | ...
  zones: string[];
  error_code: number | null;
  recharges: number | null;     // cloud only — used for format=records capability detection
  evacuations: number | null;   // cloud only
  dirt_events: number | null;   // cloud only — replaces nScrubs
  wifi_signal: number[] | null; // cloud only
  source: 'cloud' | 'local';
}

/** Daily summary from GET /api/roomba_plus/{id}/mission_history */
export interface DaySummary {
  date: string;           // ISO date "2025-05-14"
  total: number;
  completed: number;
  stuck: number;
  area_sqft: number | null;
  result: 'completed' | 'stuck' | 'error' | 'cancelled' | 'none';
  missions?: MissionRecord[];  // per-mission detail, present on integrations ≥ 1.8
}

export interface HomeAssistant {
  states: Record<string, HAState>;
  callService(domain: string, service: string, data?: Record<string, unknown>): Promise<void>;
  callWS(msg: Record<string, unknown>): Promise<unknown>;
  fetchWithAuth(url: string, init?: RequestInit): Promise<Response>;
  language: string;
  config: { unit_system: { length: string } };
}

export interface HAState {
  entity_id: string;
  state: string;
  attributes: Record<string, unknown>;
  last_changed: string;
  last_updated: string;
}
