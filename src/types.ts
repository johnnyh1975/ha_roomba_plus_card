export interface CardConfig {
  entity: string;           // single robot (backward compat — required by HA card spec)
  entities?: string[];      // F3: multi-robot list (takes precedence over entity when present)
  show_health?: boolean;
  show_schedule?: boolean;
  show_alerts?: boolean;
  show_history?: boolean;
  show_rooms?: boolean;
  /** @deprecated v2.0 — use mode: 'companion' instead. Accepted for one
   *  release as an alias with a console warning. Previously: show settings
   *  panel (edge clean, always finish, carpet boost, passes); when
   *  show_rooms:false and show_settings:true, settings panel moved to
   *  Status zone. */
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

  // ── v2.0 ──────────────────────────────────────────────────────────────────
  /** 'standalone' (default): card owns the Map tab and room selection.
   *  'companion': card assumes an external map card (e.g. XVMC) handles the
   *  spatial view and room selection — Map tab is hidden, header room picker
   *  is disabled. Cannot be auto-detected; the user opts in explicitly. */
  mode?: 'standalone' | 'companion';
  /** Optional override for which tab is shown on first render.
   *  Default: 'map' for standalone SMART/EPHEMERAL, 'history' otherwise. */
  default_tab?: 'map' | 'history' | 'health' | 'settings';
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
  /** sensor.*_cleaning_analytics_30d (state = m²). SC1 (integration v2.7.0):
   *  migrated from sensor.*_recent_area_30d, which is deprecated and removed
   *  in integration v3.0. Same m² unit — no display-side conversion needed. */
  hasLifetimeArea: boolean;
  hasWearRate: boolean;
  isMop: boolean;
  /** binary_sensor.*_mission_active — v1.9.0+ */
  hasMissionActive: boolean;
  /** sensor.*_phase (run/charge/dock/pause/evac/none) — v1.9.0+ */
  hasMissionPhase: boolean;
  // ── v1.3 / integration v2.1+ ──────────────────────────────────────────────
  /** sensor.*_cleaning_performance attr `trend` — 'improving'|'stable'|'declining'.
   *  SC1 (integration v2.7.0): migrated from sensor.*_cleaning_speed_trend,
   *  which is deprecated and removed in integration v3.0. */
  hasCleaningSpeedTrend: boolean;
  /** sensor.*_battery_capacity_retention — percentage, green>85/amber>70/red≤70 */
  hasBatteryRetention: boolean;
  /** sensor.*_wifi_health — entity presence only. NOT a like-for-like swap for
   *  the old sensor.*_recent_wifi_floor: wifi_health's state is a weighted
   *  AVERAGE signal quality %, a different metric from the old "floor" value.
   *  The floor concept's actual successor is the `weakest_bucket_observed`
   *  attribute (0–4 int, not a percentage) — see alert-zone.ts for the read. */
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

  // ── v2.0 — new capability flags (integration v2.7.0–v2.8.6) ───────────────
  /** sensor.*_robot_health_score (L8). Entity key corrected from initial plan
   *  draft (robot_health) against v2.8.6 source. Distinct from the unrelated
   *  sensor.*_integration_health (INTEG-HEALTH) — never conflate the two. */
  hasRobotHealthScore: boolean;
  /** A1 (v2.1.0) — navigation diagnostic detail. True when the detail nav
   *  sensors are present (nav_panics or nav_landmark_quality). These are
   *  DIAGNOSTIC + disabled-by-default in the integration, so absent unless the
   *  user enabled them. nav_quality alone does NOT set this — it's already used
   *  for the alert banner and a score-only view adds nothing. */
  hasNavStats: boolean;
  /** Any of sensor.*_wheel_last_cleaned / _contact_last_cleaned /
   *  _bin_last_cleaned present (IA74-MAINT, v2.7.0). */
  hasMaintenanceCalendar: boolean;
  /** sensor.*_mission_progress (MP1, v2.6.0+). Also carries mission_duration_min
   *  and recharge_min attributes (v2.8.6). */
  hasMissionProgressSensor: boolean;
  /** Non-empty `rooms` dict on image.*_map. NOT a confidence threshold
   *  check — the integration only populates `rooms` once its own internal
   *  alignment confidence is ≥ 0.70, so presence alone is sufficient.
   *  (The image entity carries no alignment_confidence attribute; that figure
   *  lives on cloud-source mission records instead — see MissionRecord.)
   *
   *  v2.3.0 CORRECTION: this previously read image.*_coverage_map, which
   *  is actually RoombaCoverageImage — an unrelated GridStore EMA-diagnostic
   *  heatmap with NO rooms/calibration_points attribute at all (verified
   *  against source). The entity that carries rooms/calibration_points is
   *  RoombaMapImage (image.*_map). This means hasAlignment likely evaluated
   *  false for every installation prior to this fix — the C7-ROOM-BOUNDS
   *  room-overlay feature (built in v2.0.0) may never have rendered. */
  hasAlignment: boolean;
  /** v2.3.0 ZONE-OVERLAY — non-empty `zones` array on image.*_map.
   *  Aligned-mode gate (same as hasAlignment): the integration withholds
   *  zones/door_markers/furniture_candidates entirely outside aligned mode,
   *  since pose-space overlay data would be spatially wrong against a
   *  UMF-space fallback render. */
  hasZoneOverlays: boolean;
  /** v2.3.0 ZONE-OVERLAY — non-empty `door_markers` array on image.*_map. */
  hasDoorMarkers: boolean;
  /** v2.3.0 F24 — non-empty `furniture_candidates` array on image.*_map. */
  hasFurnitureShadows: boolean;
  /** button.*_fav_* (any present) — FAVORITES, fully shipped in the
   *  integration but with no home in the card before v2.0. */
  hasFavorites: boolean;

  // ── v2.1.0 — header indicators (integration v2.8.x) ───────────────────────
  /** binary_sensor.*_cloud_connected and/or sensor.*_mqtt_stale present.
   *  A1: gates the "☁ Offline" connectivity indicator. Either entity being
   *  present is enough to attempt the indicator; display logic reads both. */
  hasConnectivity: boolean;
  /** sensor.*_firmware_version present. A2: gates the firmware badge. */
  hasFirmware: boolean;
  /** device_tracker.*_position present (carries room_estimate attribute).
   *  A4: gates the current-room header line during active SMART missions. */
  hasPositionTracker: boolean;

  // ── v2.3.0 — Rooms-Overdue widget (integration v3.3.0 ROOM-SCHED) ─────────
  /** sensor.*_rooms_overdue present. SMART + cloud only — the integration
   *  only creates this entity when map_capability === 'smart' and a cloud
   *  coordinator is configured (room data source is cloud-enriched
   *  timeline.finEvents). Not a diagnostic — enabled by default. */
  hasRoomsOverdue: boolean;
  /** v2.3.0 — dirt/sensor correlation (integration v3.3.0 CROSS-CORR).
   *  sensor.*_dirt_weather_correlation present. Opt-in: only registered
   *  when the user has configured correlation entities in the integration
   *  options AND cloud is available (dirt field is cloud-enriched).
   *  Diagnostic category. */
  hasDirtCorrelation: boolean;
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
  /** v2.2.0 F4 — lifetime mission counter, the key for the path-replay
   *  endpoint. Shipped by integration 3.2.1 in both unified converters
   *  (verified against source); ≤ 3.2.0 omits it. Local-source records are
   *  null until backfill_from_cloud() enrichment. The card gates the Route
   *  button on non-null presence. */
  n_mssn?: number | null;
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
  /** v2.3.0 F22 — GridStore.stuck_pattern()'s dominant weekday, present on
   *  every pin (all sources), null when not applicable or no pattern found.
   *  Python datetime.weekday() convention: 0=Monday ... 6=Sunday (verified
   *  against integration source, image.py's stuck_wh computation — NOT the
   *  JS Date.getDay() convention of 0=Sunday). Confirmed accepted gap: only
   *  populated once stuck_pattern()'s own threshold (8 stucks, higher than
   *  hotspots()'s pin-eligibility threshold of 3) is met — pins with
   *  stuck_count 3–7 always carry null here, by design, not a bug. */
  dominant_weekday: number | null;
  /** v2.3.0 F22 — dominant hour of day, 0–23, local time. Same
   *  null-until-threshold-8 rule as dominant_weekday. */
  dominant_hour: number | null;
}

/** v2.3.0 ZONE-OVERLAY — one entry of the `zones` array on image.*_map
 *  (aligned mode only). Pose-space mm, already transformed via
 *  aligner.umf_to_pose() server-side — no further conversion needed.
 *  Discriminated on `type`: 'observed' carries a single point (robot-
 *  detected obstacle centroid); 'keepout' carries a polygon. */
export type ZoneEntry =
  | { type: 'observed'; x: number; y: number }
  | { type: 'keepout'; polygon: [number, number][] };

/** v2.3.0 ZONE-OVERLAY — one entry of the `door_markers` array on
 *  image.*_map (aligned mode only). Pose-space mm, exposed as-is —
 *  NOT transformed via umf_to_pose() (collected directly from local pose
 *  data, never through UMF; verified against source). */
export interface DoorMarkerEntry {
  id: string;
  cx: number;
  cy: number;
  label: string;
  mission_count: number;
}

/** v2.3.0 F24 — one entry of the `furniture_candidates` array on
 *  image.*_map (aligned mode only). Pose-space mm (same _cell_to_mm
 *  family as GridStore.hotspots(), verified against source) — no `cell`
 *  key on the wire despite GridStore.furniture_candidates()'s internal
 *  shape carrying one; the image entity strips it down to x_mm/y_mm only. */
export interface FurnitureCandidate {
  x_mm: number;
  y_mm: number;
}

/** v2.2.0 F1 — GET /api/roomba_plus/{id}/mission/{mission_id}/explain
 *  (integration ≥ 3.2.0 ANOMALY-EXPLAIN). anomaly_reason is a machine key
 *  (e.g. 'obstacle_or_blockage'); recommended_action is server-composed
 *  English prose. is_anomalous=false is a valid, meaningful answer. */
export interface MissionExplain {
  mission_id: string;
  is_anomalous: boolean;
  anomaly_reason: string | null;
  robot_lifted: boolean;
  error_code: number | null;
  recommended_action: string | null;
}

/** v2.2.0 F4 — GET /api/roomba_plus/{id}/mission/{n_mssn}/path
 *  (integration ≥ 3.2.0 MISSION-REPLAY). Room-granular reconstruction from
 *  archived room_visits — deliberately NOT pixel pose tracking. */
export interface MissionPath {
  nMssn: number;
  path: { room: string; time: string }[];
}

/** v2.3.0 MISSION-MAP — GET /api/roomba_plus/{id}/missions/{record_id}/map.json
 *  (integration ≥ 3.3.0 MISSION-MAP). Coordinate space is UMF-space mm for
 *  BOTH coverage_mm and rooms — this is a different space from the live
 *  image.*_map entity's pose-space `rooms` attribute (which has
 *  umf_to_pose() already applied server-side). Do not mix the two: this
 *  payload is self-contained and must be rendered with its own bounding
 *  box, not against the live map's transform. coverage_poly is present in
 *  the wire shape but intentionally unused by the card in v1 — the
 *  integration does not convert it to mm (only `coverage` is), so it would
 *  need its own ×1000 conversion before use; deferred until a future
 *  version wants a filled-boundary look instead of a coverage dot cloud. */
export interface MissionMapPayload {
  record_id: string;
  mission_id: string | null;
  nmssn: number | null;
  pmap_id: string | null;
  pmapv_id: string | null;
  point_area_m: number[];
  coverage_mm: [number, number][];
  rooms: Record<string, [number, number][]>;
}

/** v2.3.0 MISSION-MAP fetch outcome. Three-way, not boolean-error like
 *  MissionExplain/MissionPath: the integration's 404 ("no coverage layer
 *  for this mission" — the known-open lewis/i-series case) is a real,
 *  calm answer and must read differently from a 409/502 transport failure. */
export type MissionMapResult =
  | { status: 'ok'; data: MissionMapPayload }
  | { status: 'absent' }   // 404 — no map for this mission (honest absence)
  | { status: 'error' };   // 409 / 502 / network — genuine failure

/** Daily summary from GET /api/roomba_plus/{id}/mission_history */export interface DaySummary {
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
  /** v2.1.0 A5: WebSocket connection for event subscriptions. Optional —
   *  absent in some test harnesses and very old HA frontends; the card falls
   *  back to the mission_active state-transition trigger when missing. */
  connection?: {
    subscribeMessage<T>(
      callback: (message: T) => void,
      subscribeMessage: { type: string; event_type?: string },
    ): Promise<() => Promise<void>>;
  };
}

export interface HAState {
  entity_id: string;
  state: string;
  attributes: Record<string, unknown>;
  last_changed: string;
  last_updated: string;
}
