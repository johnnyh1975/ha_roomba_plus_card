export interface CardConfig {
  entity: string;
  show_health?: boolean;
  show_schedule?: boolean;
  show_alerts?: boolean;
  show_history?: boolean;
  show_rooms?: boolean;
  history_days?: 7 | 14 | 28;
  area_unit?: 'auto' | 'sqft' | 'm2';
  presence_entities?: string[];
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
}

/** Per-mission record from the API history endpoint */
export interface MissionRecord {
  start_time: string;
  duration_min: number;
  area_sqft: number | null;
  result: 'completed' | 'stuck' | 'error' | 'cancelled';
  zones?: string[];
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
