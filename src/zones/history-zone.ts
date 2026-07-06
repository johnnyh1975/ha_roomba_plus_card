import { HomeAssistant, CardConfig, RobotCapabilities, DaySummary, MissionRecord, HazardRecord, MissionExplain, MissionPath, MissionMapPayload } from '../types.js';
import { renderHeatmap, renderSkeletonHeatmap, renderSparkline, normalisedWifiPct, wifiQualityFromHistogram, mmToImagePct } from '../heatmap.js';
import { renderMissionMapSvg } from '../mission-map.js';
import { buildCalibrationTransform, calibrationToImagePct, calibrationToImagePctNum, CalibrationPoint } from '../calibration.js';
import { esc, timeSince } from '../utils.js';
import { MDI_TO_EMOJI } from '../const.js';

// ── v2.2.0 F1 — anomaly explanation display ──────────────────────────────────
//
// anomaly_reason machine keys → friendly labels. Keys mirror the
// integration's MissionStore._ANOMALY_RECOMMENDATIONS. Unknown future keys
// degrade to the raw key with underscores replaced — displayed, not hidden,
// so a new integration-side reason is never silently dropped.
const EXPLAIN_REASON_LABELS: Record<string, string> = {
  obstacle_or_blockage: 'Obstacle or blockage',
  excessive_recharge:   'Excessive recharging',
  dirt_spike:           'Unusually dirty area',
  incomplete_coverage:  'Incomplete coverage',
};

function explainReasonLabel(reason: string): string {
  return EXPLAIN_REASON_LABELS[reason] ?? reason.replace(/_/g, ' ');
}

export function renderExplainPanel(data: MissionExplain): string {
  if (!data.is_anomalous) {
    return `<div class="rpc-explain-panel rpc-explain-panel--muted">Nothing statistically unusual vs. this robot's own history — the result code above is the whole story.</div>`;
  }
  const reason = data.anomaly_reason ? explainReasonLabel(data.anomaly_reason) : 'Anomalous mission';
  const lifted = data.robot_lifted ? `<div class="rpc-explain-lifted">Robot was picked up during this mission.</div>` : '';
  const rec = data.recommended_action
    ? `<div class="rpc-explain-rec">${esc(data.recommended_action)}</div>`
    : '';
  return `
    <div class="rpc-explain-panel">
      <div class="rpc-explain-reason">${esc(reason)}</div>
      ${lifted}
      ${rec}
    </div>`;
}

// ── v2.2.0 F4 — mission path replay display ──────────────────────────────────
export function renderReplayPanel(data: MissionPath, locale: string): string {
  if (!data.path.length) {
    return `<div class="rpc-replay-panel rpc-explain-panel--muted">No room-level path recorded for this mission.</div>`;
  }
  const steps = data.path.map(step => {
    const t = new Date(step.time).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit', hour12: false });
    return `<span class="rpc-replay-step"><span class="rpc-replay-time">${t}</span> ${esc(step.room)}</span>`;
  }).join('<span class="rpc-trav-sep">→</span>');
  return `<div class="rpc-replay-panel">${steps}</div>`;
}

// ── v2.3.0 MISSION-MAP — coverage replay display ─────────────────────────────
export function renderMissionMapPanel(data: MissionMapPayload): string {
  return renderMissionMapSvg(data);
}

export interface HistoryZoneState {  data: DaySummary[] | null;
  loading: boolean;
  error: string | null;
  openDay: string | null;
  /** null = popover closed; [] = opened but no per-mission detail; [...] = real records */
  dayMissions: MissionRecord[] | null;
  /** The DaySummary for openDay, for showing aggregate when missions array is empty */
  openDaySummary: DaySummary | null;
  /** C1: whether the lifetime stats footer is expanded */
  lifetimeExpanded: boolean;
  /** F7: active tab — 'calendar' (default) or 'coverage' (requires hasCoverageImage) */
  historyTab: 'calendar' | 'coverage';
  /** F7: hazard pins from format=hazards — all three sources (stuck_events / robot_learned / keepout) */
  hazards: HazardRecord[];
  /** v2.0 C7-ROOM-BOUNDS: room names currently selected for a targeted clean
   *  via tap-to-select on the Map tab overlay. Undefined/omitted when this
   *  zone is rendered for the History tab (calendar) rather than Map tab. */
  mapSelectedRooms?: Set<string>;
  /** v2.0: suppresses the internal Calendar/Coverage sub-tab toggle. */
  suppressSubTabToggle?: boolean;
  /** v2.0.2: when true (Map tab context), suppresses the history summary
   *  header ("LAST 28 DAYS / completion rate") and the Stats/lifetime
   *  footer — both belong to the History tab, not to a spatial map view.
   *  The Map tab should show only: heatmap + legend + "Updated X ago". */
  isMapContext?: boolean;
  /** v2.2.0 F1 — inline "Why?" explanation state for one mission in the open
   *  day popover. null = no explanation open. data null while loading;
   *  error=true when the fetch failed or the endpoint is absent (≤ 3.1.x). */
  openExplain?: { missionId: string; data: MissionExplain | null; error?: boolean } | null;
  /** v2.2.0 F4 — inline path-replay state, same lifecycle as openExplain. */
  openReplay?: { nMssn: number; data: MissionPath | null; error?: boolean } | null;
  /** v2.3.0 MISSION-MAP — inline coverage-replay state, same lifecycle.
   *  status is undefined while loading; 'absent' = honest 404 (no map for
   *  this mission); 'error' = 409/502/network. */
  openMissionMap?: { recordId: string; data: MissionMapPayload | null; status?: 'absent' | 'error' } | null;
}

function formatArea(sqft: number, useMetric: boolean): string {
  if (useMetric) return `${Math.round(sqft * 0.0929)} m²`;
  return `${sqft} ft²`;
}

/** Return emoji icon for a hazard pin by source type */
function pinIcon(source: string): string {
  if (source === 'robot_learned') return '🚧';
  if (source === 'keepout')       return '🚫';
  return '📍'; // stuck_events (default)
}

// v2.3.0 F22 — dominant_weekday follows Python's datetime.weekday() convention
// (0=Monday ... 6=Sunday), verified against integration source (image.py's
// stuck_wh computation) — deliberately NOT the JS Date.getDay() convention
// (0=Sunday). Getting this backwards would silently show every pattern one
// day off.
const F22_WEEKDAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function formatF22Hour(hour: number): string {
  const period = hour < 12 ? 'am' : 'pm';
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${h12}${period}`;
}

/** v2.3.0 F22 — "usually Mon ~9am" when both fields are present; '' otherwise
 *  (robot_learned/keepout pins always carry null here — uniform schema, not
 *  an error; stuck_events pins with stuck_count 3–7 also carry null, the
 *  accepted threshold gap vs. stuck_pattern()'s own 8-count minimum). */
function formatF22Pattern(h: HazardRecord): string {
  if (h.dominant_weekday == null || h.dominant_hour == null) return '';
  const day = F22_WEEKDAY_LABELS[h.dominant_weekday] ?? '';
  return day ? ` · usually ${day} ~${formatF22Hour(h.dominant_hour)}` : '';
}

/** Build a tooltip string for a hazard pin */
function buildPinTip(h: HazardRecord): string {
  const room = h.room_name ? ` · ${h.room_name}` : '';
  if (h.source === 'stuck_events')
    return `Stuck hotspot${h.stuck_count ? ` (${h.stuck_count}×)` : ''}${room}${formatF22Pattern(h)}`;
  if (h.source === 'robot_learned') return `Robot-detected obstacle${room}`;
  if (h.source === 'keepout')       return `Keep-out zone${room}`;
  return 'Hazard';
}

export function renderHistoryZone(
  hass: HomeAssistant,
  config: CardConfig,
  caps: RobotCapabilities,
  robotName: string,
  state: HistoryZoneState,
  isMetric: boolean
): string {
  if (config.show_history === false) return '';

  const n    = robotName;
  const days = config.history_days ?? 28;
  const unit = config.area_unit ?? 'auto';
  const useMetric = unit === 'm2' || (unit === 'auto' && isMetric);
  const { historyTab, hazards, mapSelectedRooms, suppressSubTabToggle, isMapContext } = state;

  // F11/F12: vacuum entity attributes — reflect the most recent mission.
  // last_cleaned_rooms is a live attribute; it is NOT per-mission historical data.
  const vacAttrs     = hass.states[`vacuum.${n}`]?.attributes ?? {};
  const regionIcons  = (vacAttrs.region_icons  ?? {}) as Record<string, string>;
  const lastRooms    = (vacAttrs.last_cleaned_rooms ?? []) as string[];
  const missionDest  = (vacAttrs.mission_destination ?? null) as string | null;

  // F12: sequence row only available for today's missions.
  // en-CA locale gives YYYY-MM-DD in all environments without toISOString() UTC drift.
  const todayDateStr = new Date().toLocaleDateString('en-CA');
  const isToday      = state.openDay === todayDateStr;

  // Summary bar (streak + completion rate)
  const streakEntity     = hass.states[`sensor.${n}_clean_streak`];
  const completionEntity = hass.states[`sensor.${n}_completion_rate_30d`];
  const streakVal        = streakEntity ? parseInt(streakEntity.state, 10) : 0;
  const completionVal    = completionEntity ? parseInt(completionEntity.state, 10) : NaN;

  let summaryHtml = '';
  const summaryParts: string[] = [];
  if (streakVal > 0) summaryParts.push(`🔥 ${streakVal}-day streak`);
  if (!isNaN(completionVal)) summaryParts.push(`${completionVal}% completion rate`);

  // F6a — Speed trend indicator (v2.1+). Corrected from spec: belongs in History zone,
  // not Status zone — it's a 14-day analytical signal, not a real-time operational one.
  // 'stable' is intentionally silent — no noise when things are normal.
  // SC1 (integration v2.7.0): migrated from sensor.*_cleaning_speed_trend
  // (deprecated, removed in v3.0) to the `trend` attribute on the consolidated
  // sensor.*_cleaning_performance. Attribute key confirmed against source.
  if (caps.hasCleaningSpeedTrend) {
    const perfEntity = hass.states[`sensor.${n}_cleaning_performance`];
    const trend = perfEntity?.attributes?.trend;
    if (trend === 'declining') summaryParts.push('<span class="rpc-trend-declining">↓ Speed declining</span>');
    else if (trend === 'improving') summaryParts.push('<span class="rpc-trend-improving">↑ Speed improving</span>');
    // 'stable': no indicator — normal state, no noise
  }

  if (summaryParts.length) {
    summaryHtml = `<div class="rpc-history-summary">${
      summaryParts.map((p, i) => i === 0 ? p : `<span class="rpc-summary-sep">·</span>${p}`).join('')
    }</div>`;
  }

  // F7 — Tab toggle (Calendar / Coverage): only when hasCoverageImage
  const tabToggleHtml = (caps.hasCoverageImage && !suppressSubTabToggle) ? `
    <div class="rpc-history-tabs">
      <button class="rpc-tab${historyTab === 'calendar' ? ' active' : ''}" data-history-tab="calendar">Calendar</button>
      <button class="rpc-tab${historyTab === 'coverage' ? ' active' : ''}" data-history-tab="coverage">Coverage</button>
    </div>` : '';

  // F7 — Coverage panel (replaces heatmap when tab='coverage')
  let coveragePanelHtml = '';
  if (caps.hasCoverageImage && historyTab === 'coverage') {
    const imageEntity = hass.states[`image.${n}_coverage_map`];
    const attrs       = imageEntity?.attributes ?? {};
    const xMin        = attrs['x_min_mm'] as number | undefined;
    const xMax        = attrs['x_max_mm'] as number | undefined;
    const yMin        = attrs['y_min_mm'] as number | undefined;
    const yMax        = attrs['y_max_mm'] as number | undefined;
    const entityPic   = attrs['entity_picture'] as string | undefined;
    const lastEnd     = attrs['last_mission_end'] as string | undefined;
    const hasExtent   = xMin != null && xMax != null && yMin != null && yMax != null;

    // All three pin sources renderable (Q_coord resolved: Q6+Q_new confirmed with v2.3.0)
    // robot_learned/keepout centroids use UMF space — UmfAligner provides pose transform.
    // TODO v2.0: keepout polygon outlines (centroid pins only here)
    const pinHtml = hasExtent
      ? hazards.map(h => {
          const pos  = mmToImagePct(h.x_mm, h.y_mm, xMin!, xMax!, yMin!, yMax!);
          const tip  = esc(buildPinTip(h));
          const icon = pinIcon(h.source);
          return `<div class="rpc-hazard-pin rpc-pin-${h.source}" style="left:${pos.left};top:${pos.top}" title="${tip}" aria-label="${tip}">${icon}</div>`;
        }).join('')
      : '';

    const noExtentNote = !hasExtent && entityPic
      ? `<div class="rpc-coverage-note">Spatial overlay unavailable — grid accumulating</div>`
      : '';

    const updatedLine = lastEnd
      ? `<div class="rpc-coverage-updated">Updated ${timeSince(lastEnd, hass.language)}</div>`
      : '';

    // Build legend — only show entries for pin sources that are present
    const hasPinStuck   = hazards.some(h => h.source === 'stuck_events');
    const hasPinRobot   = hazards.some(h => h.source === 'robot_learned');
    const hasPinKeeout  = hazards.some(h => h.source === 'keepout');
    const legendPins    = [
      hasPinStuck  ? '<span>📍</span> Stuck hotspot'      : '',
      hasPinRobot  ? '<span>🚧</span> Robot obstacle'      : '',
      hasPinKeeout ? '<span>🚫</span> Keep-out zone'       : '',
    ].filter(Boolean).join(' ');

    // v2.3.0 F22 — accepted threshold gap, not a bug: stuck_pattern()'s own
    // confidence threshold (8) is higher than hotspots()'s pin-eligibility
    // threshold (3), so a pin can exist (stuck_count 3–7) without ever
    // carrying a time pattern yet. One shared footnote rather than
    // annotating every such pin individually.
    const hasF22ThresholdGap = hazards.some(h =>
      h.source === 'stuck_events' && h.stuck_count != null
      && h.stuck_count >= 3 && h.stuck_count < 8
      && h.dominant_weekday == null);
    const f22FootnoteHtml = hasF22ThresholdGap
      ? `<div class="rpc-coverage-note">Time patterns need ≥8 stuck events at one spot</div>`
      : '';

    // v2.0 C7-ROOM-BOUNDS: room polygon overlays + tap-to-select.
    //
    // v2.3.0 CORRECTION — this block previously read `rooms` from
    // `attrs` (the image.*_coverage_map entity shown as entityPic above)
    // and positioned it via that entity's x_min_mm/x_max_mm bbox. Verified
    // against source: image.*_coverage_map (RoombaCoverageImage) has NO
    // rooms/calibration_points attribute at all — it's an unrelated
    // GridStore EMA-diagnostic heatmap. hasAlignment therefore likely
    // evaluated false for every installation; this overlay may never have
    // rendered. The correct source is a SEPARATE entity, image.*_map
    // (RoombaMapImage), read independently below — its own
    // `calibration_points` (3 pose-mm↔px anchor pairs, verified against
    // source: same _mm_to_px_fit the renderer itself uses) replace the
    // bbox-based transform, since image.*_coverage_map's bbox comes from
    // GridStore.bounding_box_mm() — an unrelated data source with no
    // guaranteed relationship to image.*_map's own render extent.
    //
    // OPEN VERIFICATION POINT (not yet field-confirmed): the picture shown
    // (`entityPic`, still image.*_coverage_map) and this overlay's source
    // (image.*_map) are two independently-rendered images. If their
    // effective framing/scale differs, this overlay will be visibly
    // offset from the picture beneath it. Hazard pins above are
    // deliberately left untouched (they already work, positioned via
    // image.*_coverage_map's own bbox) — only the overlay drawn here uses
    // the new transform. Revisit once a live installation confirms
    // whether the two images share compatible framing.
    let roomOverlayHtml = '';
    let zoneOverlayHtml = '';
    let doorMarkerHtml = '';
    let furnitureHtml = '';
    if (caps.hasAlignment) {
      const mapAttrs = hass.states[`image.${n}_map`]?.attributes ?? {};
      const rooms = (mapAttrs['rooms'] ?? {}) as Record<string, {
        outline: [number, number][]; name: string; room_id: string; icon: string; x: number; y: number;
      }>;
      const calPoints = mapAttrs['calibration_points'] as CalibrationPoint[] | undefined;
      const cal = Array.isArray(calPoints) ? buildCalibrationTransform(calPoints) : null;

      if (cal) {
        const polygons = Object.values(rooms).map(room => {
          if (!room.outline || room.outline.length < 3) return '';
          const pointsAttr = room.outline
            .map(([x, y]) => {
              const p = calibrationToImagePctNum(cal, x, y);
              return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
            })
            .join(' ');
          const selected = mapSelectedRooms?.has(room.name) ?? false;
          return `<polygon class="rpc-room-poly${selected ? ' rpc-room-poly--selected' : ''}"
            points="${pointsAttr}" data-room-poly="${esc(room.name)}" />`;
        }).join('');

        // v2.0.1: region_areas_m2 (integration v2.9.1) — lives on the
        // CloudSmartZoneSelect entity, same location as region_icons, NOT on
        // the image entity that supplies `rooms` above. This is a deliberate
        // cross-entity lookup: room geometry (outline/centroid/icon) comes
        // from the image entity's `rooms` dict, while the area annotation
        // comes from the select entity by room name — the two are joined
        // here, not at the integration level. Room name labels are drawn by
        // the card only (the integration stopped baking labels into the PNG
        // as of v2.7.3, specifically to avoid duplicate labels appearing
        // once the card started drawing its own) — this area annotation
        // follows that same card-side-only convention.
        //
        // Per-room: absent when the integration hasn't computed an area for
        // that specific room (e.g. partial cloud data). Whole-attribute
        // absent: local-only setup, integration < v2.9.1, an inactive floor,
        // or an EPHEMERAL robot with no CloudSmartZoneSelect entity at all.
        // All of these degrade to the name-only label exactly as before —
        // never an error, never a placeholder.
        const regionAreasM2 = (() => {
          const selectId = caps.hasSmartZones
            ? `select.${n}_smart_zone_select`
            : `select.${n}_zone_select`;
          const raw = hass.states[selectId]?.attributes?.['region_areas_m2'];
          return (raw && typeof raw === 'object' && !Array.isArray(raw))
            ? raw as Record<string, number>
            : {} as Record<string, number>;
        })();

        const labels = Object.values(rooms).map(room => {
          const pos    = calibrationToImagePct(cal, room.x, room.y);
          const emoji  = MDI_TO_EMOJI[room.icon] ?? '';
          const selected = mapSelectedRooms?.has(room.name) ?? false;
          const areaM2 = regionAreasM2[room.name];
          const areaSuffix = typeof areaM2 === 'number' && !isNaN(areaM2)
            ? ` / ${areaM2.toFixed(1)} m²`
            : '';
          return `<div class="rpc-room-label${selected ? ' rpc-room-label--selected' : ''}"
            style="left:${pos.left};top:${pos.top}" data-room-label="${esc(room.name)}">
            ${emoji ? `${emoji} ` : ''}${esc(room.name)}${esc(areaSuffix)}
          </div>`;
        }).join('');

        roomOverlayHtml = `
          <svg class="rpc-room-overlay" viewBox="0 0 100 100" preserveAspectRatio="none">
            ${polygons}
          </svg>
          ${labels}
        `;

        // v2.3.0 ZONE-OVERLAY — observed-obstacle circles + keepout polygons.
        // Same image.*_map entity, same aligned-mode gate, same calibration
        // transform as rooms above (all four attributes are pose-space mm
        // and withheld together outside aligned mode — verified against
        // source, so no separate gate check is needed here).
        if (caps.hasZoneOverlays) {
          const zones = (mapAttrs['zones'] ?? []) as (
            { type: 'observed'; x: number; y: number }
            | { type: 'keepout'; polygon: [number, number][] }
          )[];
          const zonePieces = zones.map(z => {
            if (z.type === 'observed') {
              const p = calibrationToImagePctNum(cal, z.x, z.y);
              return `<circle class="rpc-zone-observed" cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="2"><title>Robot-detected obstacle</title></circle>`;
            }
            if (z.type === 'keepout' && z.polygon.length >= 3) {
              const pts = z.polygon.map(([x, y]) => {
                const p = calibrationToImagePctNum(cal, x, y);
                return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
              }).join(' ');
              return `<polygon class="rpc-zone-keepout" points="${pts}"><title>Keep-out zone</title></polygon>`;
            }
            return '';
          }).join('');
          zoneOverlayHtml = zonePieces
            ? `<svg class="rpc-room-overlay" viewBox="0 0 100 100" preserveAspectRatio="none">${zonePieces}</svg>`
            : '';
        }

        // v2.3.0 ZONE-OVERLAY — door markers. Small dot + label tooltip.
        if (caps.hasDoorMarkers) {
          const markers = (mapAttrs['door_markers'] ?? []) as
            { id: string; cx: number; cy: number; label: string; mission_count: number }[];
          doorMarkerHtml = markers.map(m => {
            const pos = calibrationToImagePct(cal, m.cx, m.cy);
            const tip = esc(`${m.label} (seen ${m.mission_count}×)`);
            return `<div class="rpc-door-marker" style="left:${pos.left};top:${pos.top}" title="${tip}" aria-label="${tip}">🚪</div>`;
          }).join('');
        }

        // v2.3.0 F24 — furniture shadow candidates. Small shadow markers;
        // no per-candidate label (the underlying data carries no name/id,
        // just a location — verified against source).
        if (caps.hasFurnitureShadows) {
          const candidates = (mapAttrs['furniture_candidates'] ?? []) as { x_mm: number; y_mm: number }[];
          furnitureHtml = candidates.map(c => {
            const pos = calibrationToImagePct(cal, c.x_mm, c.y_mm);
            return `<div class="rpc-furniture-shadow" style="left:${pos.left};top:${pos.top}" title="Possible furniture change" aria-label="Possible furniture change"></div>`;
          }).join('');
        }
      }
    }

    coveragePanelHtml = entityPic ? `
      <div class="rpc-coverage-panel">
        <div class="rpc-coverage-image-wrap">
          <img class="rpc-coverage-img" src="${entityPic}" alt="Coverage map" />
          ${roomOverlayHtml}
          ${zoneOverlayHtml}
          ${doorMarkerHtml}
          ${furnitureHtml}
          ${pinHtml}
        </div>
        ${noExtentNote}
        <div class="rpc-coverage-legend">
          <span style="color:var(--rpc-green)">●</span> High coverage
          <span style="color:var(--rpc-grey-mid,#9ca3af)">●</span> Rarely cleaned
          ${legendPins}
        </div>
        ${f22FootnoteHtml}
        ${updatedLine}
      </div>` : `<div class="rpc-history-error">Coverage map unavailable</div>`;
  }

  // Heatmap area
  let heatmapHtml = '';
  if (state.loading && !state.data) {
    heatmapHtml = renderSkeletonHeatmap(Math.ceil(days / 7));
  } else if (state.error) {
    heatmapHtml = `<div class="rpc-history-error">${esc(state.error)}</div>`;
  } else if (state.data) {
    heatmapHtml = renderHeatmap(state.data, days, unit, hass.language, caps.hasDirtDensity);
    // Show partial message if API returned fewer calendar days than requested
    if (state.data.length < days) {
      heatmapHtml += `<div class="rpc-history-partial">Showing ${state.data.length} of ${days} days — full history builds over time</div>`;
    }
  }

  // Problem zone callout
  let problemHtml = '';
  if (caps.hasProblemZone) {
    const pzEntity    = hass.states[`sensor.${n}_problem_zone`];
    const stuckEntity = hass.states[`sensor.${n}_stuck_count_30d`];
    if (pzEntity && pzEntity.state !== 'unknown' && pzEntity.state !== 'unavailable') {
      const count = stuckEntity ? parseInt(stuckEntity.state, 10) : 0;
      if (count > 0) {
        problemHtml = `<div class="rpc-problem-zone">⚠ ${esc(pzEntity.state)} — stuck ${count}× in 30 days</div>`;
      }
    }
  }

  // Day detail popover
  let popoverHtml = '';
  if (state.openDay) {
    const date     = new Date(state.openDay + 'T00:00:00');
    const dateLabel = date.toLocaleDateString(hass.language, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    const missions  = state.dayMissions;
    const summary   = state.openDaySummary;

    let missionRows = '';

    if (missions === null) {
      missionRows = ''; // still loading (shouldn't happen)
    } else if (summary && summary.total === 0) {
      missionRows = '<div class="rpc-day-empty">No missions this day</div>';
    } else if (missions.length > 0) {
      // Real per-mission data from API
      missionRows = missions.map((m, index) => {
      // Found via screenshot review: this previously mapped any result
      // other than the literal string 'completed' to ✗ — including
      // 'stuck_and_resumed' ("Robot stuck but continued and finished" per
      // REST_API_CONTRACT.md). That's a genuine success the integration
      // itself counts toward DaySummary.completed (and therefore the
      // calendar cell's green colour and the day's "100% completion rate"
      // line) — so a day could show fully green while every individual
      // mission row inside it showed ✗, which is exactly the contradiction
      // spotted in a screenshot review. Group the same two values the
      // integration already groups for DaySummary.completed, rather than
      // a literal string-equality check against 'completed' alone.
      // v2.0.2: three-tier mission result classification, replacing the
      // v2.0.1 binary success/failure icon. User feedback: "stuck_and_resumed
      // ist aus cloud sicht completed, battery error kann auch aus cloud
      // sicht completed sein — in beiden fällen wurde die mission beendet."
      // The previous binary model conflated two different questions — "did
      // the mission end" and "was it a clean success" — into one ✓/✗ icon.
      // Three tiers per REST_API_CONTRACT.md's result enumeration:
      //   success ✓ — completed, stuck_and_resumed
      //   caution ⚠ — mission ended, but with an incident worth noting
      //               (cancelled, cancelled_by_user, error/error_* — e.g.
      //               error_battery — and unclassified 'unknown' results,
      //               treated cautiously rather than as a hard failure
      //               since their actual severity is unknown)
      //   failure ✗ — robot stuck and never recovered, or never started
      //               (stuck, stuck_and_abandoned, blocked_timeout)
      const tier = m.result === 'completed' || m.result === 'stuck_and_resumed'
        ? 'success'
        : m.result === 'stuck' || m.result === 'stuck_and_abandoned' || m.result === 'blocked_timeout'
        ? 'failure'
        : 'caution';
      const icon = tier === 'success' ? '✓' : tier === 'failure' ? '✗' : '⚠';
      const cls  = tier === 'success' ? 'rpc-day-ok' : tier === 'failure' ? 'rpc-day-err' : 'rpc-day-caution';
        const start = new Date(m.started_at).toLocaleTimeString(hass.language, { hour: '2-digit', minute: '2-digit', hour12: false });
        const area  = m.area_sqft !== null ? formatArea(m.area_sqft, useMetric) : '—';
        const zones = m.zones?.map(z => esc(z)).join(' · ') ?? '';
        // C2 — dirt events (opt-in, requires integration ≥ v2.0 with dirt_events in record)
        const dirtPart = config.show_dirt_events && m.dirt_events != null && m.dirt_events > 0
          ? `${m.dirt_events} dirt event${m.dirt_events !== 1 ? 's' : ''}`
          : '';
        const meta = [zones, dirtPart].filter(Boolean).join(' · ');
        // F1 spec — demand initiator badge: robot cleaned because floor was dirty
        const demandBadge = m.initiator === 'demand'
          ? `<span class="rpc-initiator-badge">demand</span>`
          : '';

        // F6b — WiFi signal display (v2.1+ cloud records with wifi_signal array).
        //
        // v2.0.1 bug fix: the 5-element histogram case (the data shape for
        // current integration versions — see wifiQualityFromHistogram()
        // docstring in heatmap.ts) has no real "minimum reading during the
        // mission" concept; it's a static signal-quality distribution, not
        // a time-ordered sequence. Display the weighted-mean quality %
        // instead, matching the integration's own wifi_health calculation.
        // The legacy variable-length time-series case (older integration
        // versions, per REST_API_CONTRACT.md's own 6-element example)
        // keeps the original "minimum reading" semantics unchanged.
        let wifiHtml = '';
        if (m.wifi_signal && m.wifi_signal.length > 0) {
          const isHistogram = m.wifi_signal.length === 5;
          const barHeights   = normalisedWifiPct(m.wifi_signal);
          const sparkSvg     = renderSparkline(barHeights, Math.min(...barHeights));

          if (isHistogram) {
            const quality = wifiQualityFromHistogram(m.wifi_signal);
            if (quality !== null) {
              wifiHtml = `<div class="rpc-day-wifi" aria-label="Wi-Fi signal quality: ${quality}% average during mission"><span aria-hidden="true">📶</span>${sparkSvg}<span>${quality}% avg</span></div>`;
            }
          } else {
            const minWifi = Math.min(...barHeights);
            wifiHtml = `<div class="rpc-day-wifi" aria-label="Wi-Fi signal: minimum ${minWifi}% during mission"><span aria-hidden="true">📶</span>${sparkSvg}<span>${minWifi}% min</span></div>`;
          }
        }

        // F12 — Cleaned rooms sequence (today's most recent mission only).
        // last_cleaned_rooms is a vacuum entity attribute — not per-mission REST data.
        // Sequence row attaches only to the last mission in today's list.
        let sequenceHtml = '';
        const isLastMissionToday = isToday && index === missions.length - 1;
        if (isLastMissionToday && lastRooms.length > 0) {
          const chips = lastRooms.map(name => {
            const mdi  = regionIcons[name];
            const icon = mdi ? (MDI_TO_EMOJI[mdi] ?? '') : '';
            return `<span class="rpc-trav-room">${icon ? icon + '\u00a0' : ''}${esc(name)}</span>`;
          }).join('<span class="rpc-trav-sep">→</span>');
          const destLine = missionDest
            ? `<div class="rpc-mission-dest-popover">→ Final: ${esc(missionDest)}</div>`
            : '';
          sequenceHtml = `<div class="rpc-traversal-row">${chips}</div>${destLine}`;
        }

        // F8 — Room coverage fractions (integration ≥ v2.2, UmfAligner v2.3 for higher accuracy)
        // room_coverage is Record<string, number> keyed by room display name, value 0.0–1.0
        let roomCoverageHtml = '';
        if (m.room_coverage && Object.keys(m.room_coverage).length > 0) {
          const chips = Object.entries(m.room_coverage)
            .map(([name, frac]) => {
              const pct = Math.round(frac * 100);
              const cls = pct >= 80 ? 'rpc-cov-green' : pct >= 60 ? 'rpc-cov-amber' : 'rpc-cov-red';
              return `<span class="${cls}">${esc(name)} ${pct}%</span>`;
            }).join(' · ');
          roomCoverageHtml = `<div class="rpc-room-coverage">${chips}</div>`;
        }
        // Alignment confidence footnote (v2.3+): shown only when < 0.85 threshold
        let alignmentNote = '';
        if (m.alignment_confidence != null && m.alignment_confidence < 0.85) {
          const confPct = Math.round(m.alignment_confidence * 100);
          alignmentNote = `<div class="rpc-alignment-note">* Coverage estimates (alignment confidence: ${confPct}%)</div>`;
        }

        // v2.2.0 F1 — "Why?" explanation (integration ≥ 3.2.0 ANOMALY-EXPLAIN).
        //
        // v2.3.0 CORRECTION: the source==='local' gate is REMOVED. It
        // existed because the explain endpoint resolved ids via
        // MissionStore.find_by_id() alone, which never matched cloud-only
        // rows' synthetic c_{ts} ids (minted in the API layer, never
        // written to the store) — a real 404-on-tap risk (R2-1, v2.2.0).
        // Verified against source: integration's EXPLAIN-CLOUD fix adds a
        // dedicated resolution path (ExplainMissionView now recognises the
        // "c_" prefix and resolves it against cloud_coordinator.raw_records
        // directly, handing the result to explain_mission() via a new
        // record_override parameter) — c_{ts} ids resolve correctly now,
        // same as local ids. Any still-unresolvable id (e.g. a mission
        // that's rolled out of the cloud history window) 404s exactly like
        // any other absent case and is already handled below via
        // open.error — no special-casing needed on the card side.
        //
        // NOTE: this does NOT apply to the Map button (MISSION-MAP, below)
        // — verified separately that _mission_map_payload()'s own record
        // resolution is unchanged (still `r.get("id") == record_id` only,
        // no cloud fallback) — that gate stays as-is.
        //
        // is_anomalous=false is itself a meaningful answer. Endpoint absence
        // (≤ 3.1.x) surfaces as a graceful error line only AFTER a tap — no
        // capability probe, one wasted tap on old integrations.
        let explainHtml = '';
        if (tier !== 'success') {
          const open = state.openExplain?.missionId === m.id ? state.openExplain : null;
          const btn = `<button class="rpc-explain-btn" data-explain="${esc(m.id)}" aria-expanded="${!!open}">Why?</button>`;
          let panel = '';
          if (open) {
            if (open.error) {
              panel = `<div class="rpc-explain-panel rpc-explain-panel--muted">Explanation not available for this mission.</div>`;
            } else if (open.data === null) {
              panel = `<div class="rpc-explain-panel rpc-explain-panel--muted">Analysing…</div>`;
            } else {
              panel = renderExplainPanel(open.data);
            }
          }
          explainHtml = `${btn}${panel}`;
        }

        // v2.2.0 F4 — path replay (integration MISSION-REPLAY). Gated on
        // n_mssn presence in the record. Integration 3.2.1 ships the field
        // in both unified converters (verified against source); ≤ 3.2.0
        // drops it, so the button simply doesn't render there. Local-source
        // rows carry null until backfill_from_cloud() enriches them — same
        // gate, honest "replay unavailable" until the data exists.
        let replayHtml = '';
        if (m.n_mssn != null) {
          const open = state.openReplay?.nMssn === m.n_mssn ? state.openReplay : null;
          const btn = `<button class="rpc-explain-btn" data-replay="${m.n_mssn}" aria-expanded="${!!open}">Route</button>`;
          let panel = '';
          if (open) {
            if (open.error) {
              panel = `<div class="rpc-replay-panel rpc-explain-panel--muted">Path not available for this mission.</div>`;
            } else if (open.data === null) {
              panel = `<div class="rpc-replay-panel rpc-explain-panel--muted">Loading…</div>`;
            } else {
              panel = renderReplayPanel(open.data, hass.language);
            }
          }
          replayHtml = `${btn}${panel}`;
        }

        // v2.3.0 MISSION-MAP — coverage replay (integration ≥ 3.3.0
        // MISSION-MAP). Gate mirrors Route's n_mssn != null check plus a
        // source==='local' rule — STILL NEEDED HERE even though Why?'s
        // equivalent gate was removed above: verified against source that
        // _mission_map_payload()'s own record resolution is a SEPARATE,
        // still-unfixed lookup (`r.get("id") == record_id` against
        // ms.records only — no cloud_coordinator fallback, unlike the
        // explain endpoint's EXPLAIN-CLOUD fix). Cloud-only synthetic
        // c_{ts} rows remain genuinely unresolvable for this endpoint
        // specifically; do not remove this gate without re-verifying
        // _mission_map_payload() against a future integration release.
        // n_mssn presence is reused as the SMART+cloud proxy signal — no
        // dedicated per-record field exists yet to confirm pmaps_info
        // ahead of the fetch; a 404 for a genuinely absent map (e.g.
        // unconfirmed i-series coverage layers) is treated as a real, calm
        // answer below, not an error.
        let mapHtml = '';
        if (m.source === 'local' && m.n_mssn != null) {
          const open = state.openMissionMap?.recordId === m.id ? state.openMissionMap : null;
          const btn = `<button class="rpc-explain-btn" data-map="${esc(m.id)}" aria-expanded="${!!open}">Map</button>`;
          let panel = '';
          if (open) {
            if (open.status === 'absent') {
              panel = `<div class="rpc-map-panel rpc-explain-panel--muted">No coverage map for this mission.</div>`;
            } else if (open.status === 'error') {
              panel = `<div class="rpc-map-panel rpc-explain-panel--muted">Couldn't load the map — try again.</div>`;
            } else if (open.data === null) {
              panel = `<div class="rpc-map-panel rpc-explain-panel--muted">Loading…</div>`;
            } else {
              panel = renderMissionMapPanel(open.data);
            }
          }
          mapHtml = `${btn}${panel}`;
        }

        return `
          <div class="rpc-day-mission">
            <span class="rpc-day-icon ${cls}">${icon}</span>
            <span class="rpc-day-time">${start}</span>
            <span class="rpc-day-dur">${m.duration_min} min</span>
            <span class="rpc-day-area">${area}</span>
            ${demandBadge}
            ${meta ? `<div class="rpc-day-zones">${meta}</div>` : ''}
            ${wifiHtml}
            ${sequenceHtml}
            ${roomCoverageHtml}
            ${alignmentNote}
            ${explainHtml}
            ${replayHtml}
            ${mapHtml}
          </div>`;
      }).join('');
    } else if (summary && summary.total > 0) {
      // API didn't return per-mission detail — show aggregate honestly
      const areaStr = summary.area_sqft !== null ? formatArea(summary.area_sqft, useMetric) : null;
      missionRows = `
        <div class="rpc-day-aggregate">
          <div>${summary.total} mission${summary.total > 1 ? 's' : ''} · ${esc(summary.result)}
            ${areaStr ? ` · ${areaStr} total` : ''}</div>
          <div class="rpc-day-no-detail">Per-mission detail not available</div>
        </div>`;
    }

    const missionCount = summary?.total ?? 0;
    popoverHtml = `
      <div class="rpc-popover rpc-day-popover">
        <div class="rpc-popover-header">
          <span>${esc(dateLabel)}</span>
          <button class="rpc-popover-close" data-close-day="true" aria-label="Close">×</button>
        </div>
        <div class="rpc-popover-divider"></div>
        ${missionCount > 0 && missions && missions.length > 0
          ? `<div class="rpc-day-count">${missionCount} mission${missionCount > 1 ? 's' : ''}</div>`
          : ''}
        ${missionRows}
      </div>
    `;
  }

  // C1 — Lifetime stats collapsed footer (cloud sensors, requires credentials)
  let lifetimeHtml = '';
  if (config.show_lifetime !== false) {
    // SC1 (integration v2.7.0): sensor.*_recent_area_30d and
    // sensor.*_recent_time_30d are deprecated, removed in v3.0. Both are
    // replaced by sensor.*_cleaning_analytics_30d — state is area (m²),
    // `time_h` attribute is time (hours).
    //
    // Bug fix incidental to this migration: the old recent_time_30d sensor's
    // native unit is MINUTES, but this code parsed it into a variable named
    // `hours` and displayed it with an "h" suffix below — a pre-existing
    // display bug (minutes shown as if they were hours). cleaning_analytics_30d's
    // `time_h` attribute is genuinely in hours, so the display is now correct
    // with no separate conversion needed.
    const lifetimeMissions = hass.states[`sensor.${n}_lifetime_missions`];
    const analyticsEntity  = hass.states[`sensor.${n}_cleaning_analytics_30d`];

    // Parse values individually — show the section if at least one is available.
    // Each span is only rendered when its value is a real number, so a missing
    // sensor (unknown/unavailable) just omits that one line rather than hiding
    // the entire Stats section.
    const missions = lifetimeMissions ? parseInt(lifetimeMissions.state, 10) : NaN;
    const hours    = (() => {
      const raw = analyticsEntity?.attributes?.time_h;
      return typeof raw === 'number' ? raw : NaN;
    })();
    // cleaning_analytics_30d state is m² (cloud API is metric) — pass raw value
    // and always format as m² regardless of user unit preference.
    const areaM2   = analyticsEntity ? parseFloat(analyticsEntity.state) : NaN;

    // v2.2.0 A2 — lifetime dirt-detection counters (integration ≥ 3.0,
    // i/s-series bbrun/runtimeStats fields). All three sensors are
    // entity_registry_enabled_default=False (diagnostic) — presence-gated
    // per the C5-ANOMALY precedent: renders only for users who enabled
    // them, and activates automatically should a future integration
    // options flow flip the defaults. These are LIFETIME counters
    // (TOTAL_INCREASING), which is why they live here in the Stats
    // footer and deliberately NOT in the per-mission day detail.
    const numState = (id: string): number => {
      const e = hass.states[id];
      if (!e || e.state === 'unknown' || e.state === 'unavailable') return NaN;
      return parseInt(e.state, 10);
    };
    const optical = numState(`sensor.${n}_optical_dirt_detections`);
    const piezo   = numState(`sensor.${n}_piezo_dirt_detections`);
    const scrubs  = numState(`sensor.${n}_scrubs_count`);

    const hasAny   = !isNaN(missions) || !isNaN(hours) || !isNaN(areaM2)
      || !isNaN(optical) || !isNaN(piezo) || !isNaN(scrubs);

    if (hasAny) {
      const dirtParts = [
        !isNaN(optical) ? `${optical.toLocaleString()} optical` : '',
        !isNaN(piezo)   ? `${piezo.toLocaleString()} piezo` : '',
        !isNaN(scrubs)  ? `${scrubs.toLocaleString()} scrub events` : '',
      ].filter(Boolean);
      const dirtLine = dirtParts.length
        ? `<div class="rpc-lifetime-stats rpc-lifetime-dirt">
            <span class="rpc-lifetime-arrow">→</span>
            <span>Dirt detect: ${dirtParts.join(' · ')}</span>
          </div>`
        : '';

      const expandedContent = state.lifetimeExpanded ? `
        <div class="rpc-lifetime-stats">
          <span class="rpc-lifetime-arrow">→</span>
          ${!isNaN(missions) ? `<span>${missions.toLocaleString()} missions</span>` : ''}
          ${!isNaN(areaM2)   ? `<span>${areaM2.toLocaleString()} m²</span>` : ''}
          ${!isNaN(hours)    ? `<span>${hours.toLocaleString()} h (30 d)</span>` : ''}
        </div>${dirtLine}` : '';

      lifetimeHtml = `
        <div class="rpc-lifetime-divider"></div>
        <button class="rpc-lifetime-toggle" data-lifetime-toggle aria-expanded="${state.lifetimeExpanded}">
          Stats ${state.lifetimeExpanded ? '▲' : '▼'}
        </button>
        ${expandedContent}
      `;
    }
  }

  return `
    <div class="rpc-zone rpc-zone6">
      ${!isMapContext ? `<div class="rpc-zone-header">LAST ${days} DAYS</div>` : ''}
      ${!isMapContext ? summaryHtml : ''}
      ${tabToggleHtml}
      <div class="rpc-heatmap-wrap" data-heatmap>
        ${historyTab === 'coverage' && caps.hasCoverageImage ? coveragePanelHtml : heatmapHtml}
      </div>
      ${problemHtml}
      ${popoverHtml}
      ${!isMapContext ? lifetimeHtml : ''}
    </div>
  `;
}
