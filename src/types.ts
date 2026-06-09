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
  /** sensor.*_phase (run/charge/dock/pause/evac/none) — v1.9.0+ */
  hasMissionPhase: boolean;
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
  /** sensor.*_consecutive_clean_skips — numeric count; > 0 when robot blocked */
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
  // ── v1.6 / integration v2.3–v2.4 ──────────────────────────────────────────
  /** vacuum.* last_cleaned_rooms attribute — non-empty array (integration v2.3 CR4) */
  hasCleanedRooms: boolean;
  /** binary_sensor.*_demand_clean_blocked (integration v2.4 F11) */
  hasDemandBlocked: boolean;
  /** sensor.*_total_energy_consumed (integration v2.4 F12e) */
  hasEnergyConsumption: boolean;
  /** sensor.*_optimal_clean_window (integration v2.4 F12a) */
  hasOptimalWindow: boolean;
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
  /** Per-room coverage fractions — keyed by room display name, value 0.0–1.0.
   *  Source: timeline.finEvents room.totalArea/area ratio (v2.2) or UmfAligner
   *  polygon intersection (v2.3+). Present when cloud credentials configured
   *  and robot has SMART map. null for whole-home missions. */
  room_coverage?: RoomCoverage;
  /** Spatial alignment confidence 0–1; shown as footnote when < 0.85.
   *  Present from integration v2.3+ (UmfAligner). null on v2.2. */
  alignment_confidence?: number;
}

/** Per-room coverage fractions within a MissionRecord (v2.2+).
 *  Keys are room display names; values are coverage fraction 0.0–1.0.
 *  e.g. { "Kitchen": 0.75, "Hallway": 0.60 }
 *  Matches the format=records REST API shape exactly.
 *  NOTE: the previous array-of-objects shape was speculative (v2.3 UmfAligner).
 *  Corrected to dict shape in card v1.5.0. */
export type RoomCoverage = Record<string, number>;

/** Obstacle/hazard pin from GET …/mission_history?format=hazards (integration ≥ v2.2) */
export interface HazardRecord {
  gx: number | null;              // GridStore grid cell x; null for robot_learned source
  gy: number | null;              // GridStore grid cell y; null for robot_learned source
  x_mm: number;                   // Dock-relative mm (pose space for stuck_events; UMF space for robot_learned until v2.3 F8)
  y_mm: number;
  stuck_count: number | null;     // null for robot_learned source
  room_name: string | null;       // null when UMF alignment absent
  bearing_deg: number;            // 0–359, compass from dock
  distance_mm: number;            // Euclidean distance from dock in mm
  source: 'stuck_events' | 'robot_learned' | 'keepout';
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
  /** v2.4 (F12b): average dirt event density across day's missions. null when no cloud data. */
  dirt_density?: number | null;
  /** v2.4 (F12b): ratio to 30-day median dirt density. > 1.5 = notably dirty day. null when no baseline. */
  relative_to_baseline?: number | null;
}

/** Per-robot row in GET /api/roomba_plus/household (integration ≥ v2.3 F10b) */
export interface HouseholdRobotSummary {
  entry_id: string;
  name: string;
  floor: string | null;
  missions: number;
  completed: number;
  completion_pct: number;
  area_sqft: number | null;
}

/** Per-floor row in GET /api/roomba_plus/household */
export interface HouseholdFloorSummary {
  label: string;
  missions: number;
  completed: number;
  area_sqft: number | null;
}

/** Response from GET /api/roomba_plus/household (integration ≥ v2.3 F10b) */
export interface HouseholdSummary {
  period_days: number;
  total: {
    missions: number;
    completed: number;
    completion_pct: number;
    area_sqft: number | null;
  };
  robots: HouseholdRobotSummary[];
  /** Present when any robot has a floor label configured */
  floors?: HouseholdFloorSummary[];
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
