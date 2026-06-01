export interface CardConfig {
  entity: string;           // single robot (backward compat — required by HA card spec)
  entities?: string[];      // F3: multi-robot list (takes precedence over entity when present)
  show_health?: boolean;
  show_schedule?: boolean;
  show_alerts?: boolean;
  show_history?: boolean;
  show_rooms?: boolean;
  /** F3b: show settings panel (edge clean, always finish, carpet boost, passes).
   *  When show_rooms:false and show_settings:true, settings panel moves to Status zone. */
  show_settings?: boolean;
  history_days?: 7 | 14 | 28;
  area_unit?: 'auto' | 'sqft' | 'm2';
  presence_entities?: string[];
  /** Wave C: show lifetime stats row in history zone (default: true, hidden when cloud sensors absent) */
  show_lifetime?: boolean;
  /** Wave C: show dirt event count in day detail popover (default: false — requires integration ≥ v2.0) */
  show_dirt_events?: boolean;
  /** F3b: input_text.* or input_select.* entity ID — written when robot dropdown switches.
   *  Used by conditional xiaomi-vacuum-map-card instances to show/hide per active robot. */
  robot_selector_helper?: string;
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
  // ── v1.3 / integration v2.1+ ──────────────────────────────────────────────
  /** sensor.*_cleaning_speed_trend — 'improving'|'stable'|'declining' */
  hasCleaningSpeedTrend: boolean;
  /** sensor.*_battery_capacity_retention — percentage, green>85/amber>70/red≤70 */
  hasBatteryRetention: boolean;
  /** sensor.*_recent_wifi_floor — min wifi % across last mission; alert <50 */
  hasWifiFloor: boolean;
  /** sensor.*_recent_coverage_pct — percentage of floor covered last mission */
  hasCoveragePct: boolean;
  /** sensor.*_estimated_battery_eol — days remaining; 0 = end of life.
   *  Only rendered inside the battery retention popover; requires hasBatteryRetention. */
  hasBatteryEol: boolean;
  /** binary_sensor.*_consecutive_clean_skips — on when robot blocked N times */
  hasConsecutiveSkips: boolean;
  /** sensor.*_mop_behavior — Braava only */
  hasMopBehavior: boolean;
  // ── v2.2+ ─────────────────────────────────────────────────────────────────
  /** image.*_coverage_map — Tier 1 entity-based (v2.2+) */
  hasCoverageImage: boolean;
  // ── Tier 2 — API-field-based (false until loadHistory completes) ──────────
  /** wifi_signal non-null in first format=records record (v2.1+) */
  hasWifiSignal: boolean;
  /** room_coverage present in first format=records record (v2.2+) */
  hasRoomCoverage: boolean;
  /** dirt_density present in first format=summary record (v2.3+) */
  hasDirtDensity: boolean;
  // ── Config-based ──────────────────────────────────────────────────────────
  /** config.robot_selector_helper entity exists in hass.states */
  hasRobotSelectorHelper: boolean;
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
  // ── v2.2+ fields (integration ≥ 2.2.0) ───────────────────────────────────
  /** Per-room coverage fractions — present in format=records when GridStore is available */
  room_coverage?: RoomCoverage[];
  /** Spatial alignment confidence 0–1; shown as footnote when < 0.85 */
  alignment_confidence?: number;
}

/** Room-level coverage record within a MissionRecord (v2.2+) */
export interface RoomCoverage {
  region_id: string;
  name: string;
  coverage_fraction: number;    // 0–1
  estimated_area_mm2: number;
  umf_area_mm2: number;
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
