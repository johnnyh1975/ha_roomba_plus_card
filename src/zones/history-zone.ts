import { HomeAssistant, CardConfig, RobotCapabilities, DaySummary, MissionRecord, HazardRecord, MissionExplain, MissionPath, MissionMapPayload } from '../types.js';
import { robot } from '../registry.js';
import { renderHeatmap, renderSkeletonHeatmap, renderSparkline, normalisedWifiPct, wifiQualityFromHistogram, coverageExtentFromAttrs, coverageToImagePct, coverageToImagePctNum, coverageFrameStyles } from '../heatmap.js';
import { renderMissionMapSvg } from '../mission-map.js';
import { esc, timeSince, areaSqftFromEntity } from '../utils.js';
import { mapImageId, zoneSelectMapAttr } from '../entity-ids.js';
import { mdiToEmoji } from '../const.js';
import { t, resolveLang, WEEKDAY_LABELS } from '../i18n/index.js';

// ── v2.2.0 F1 — anomaly explanation display ──────────────────────────────────
//
// anomaly_reason machine keys → translation keys. Keys mirror the
// integration's MissionStore._ANOMALY_RECOMMENDATIONS. Unknown future keys
// degrade to the raw key with underscores replaced — displayed, not hidden,
// so a new integration-side reason is never silently dropped (and never
// silently untranslated either — an unrecognised key just isn't in this
// map, same fallback either way).
const EXPLAIN_REASON_KEYS: Record<string, string> = {
  obstacle_or_blockage: 'history.explainReasonObstacle',
  excessive_recharge:   'history.explainReasonRecharge',
  dirt_spike:           'history.explainReasonDirt',
  incomplete_coverage:  'history.explainReasonIncomplete',
};

function explainReasonLabel(reason: string, lang: string): string {
  const key = EXPLAIN_REASON_KEYS[reason];
  return key ? t(lang, key as Parameters<typeof t>[1]) : reason.replace(/_/g, ' ');
}

export function renderExplainPanel(data: MissionExplain, lang = 'en'): string {
  if (!data.is_anomalous) {
    return `<div class="rpc-explain-panel rpc-explain-panel--muted">${t(lang, 'history.explainNothingUnusual')}</div>`;
  }
  const reason = data.anomaly_reason ? explainReasonLabel(data.anomaly_reason, lang) : t(lang, 'history.explainAnomalousMission');
  // v2.5.0 F12: `pick_events` (integration ≥ 4.x) — the counter it reads
  // (bbrun.nPicks) moves around dock contact and was found NOT to mean the
  // robot was lifted, so the integration renamed it and kept `robot_lifted`
  // only as an alias. Read the new key, fall back to the alias, and say what
  // was measured rather than what was guessed.
  const picks = data.pick_events ?? data.robot_lifted ?? false;
  const lifted = picks ? `<div class="rpc-explain-lifted">${t(lang, 'history.explainPickEvents')}</div>` : '';
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
export function renderReplayPanel(data: MissionPath, locale: string, lang = 'en'): string {
  if (!data.path.length) {
    return `<div class="rpc-replay-panel rpc-explain-panel--muted">${t(lang, 'history.replayNoPath')}</div>`;
  }
  const steps = data.path.map(step => {
    const time = new Date(step.time).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit', hour12: false });
    return `<span class="rpc-replay-step"><span class="rpc-replay-time">${time}</span> ${esc(step.room)}</span>`;
  }).join('<span class="rpc-trav-sep">→</span>');
  return `<div class="rpc-replay-panel">${steps}</div>`;
}

// ── v2.3.0 MISSION-MAP — coverage replay display ─────────────────────────────
// v2.4.0 MISSION-MAP-ROTATE-PARITY: rotate passed through from
// config.mission_map_rotate, defaulting to 0 (no rotation) when unset.
export function renderMissionMapPanel(data: MissionMapPayload, rotate: 0 | 90 | 180 | 270 = 0, lang = 'en'): string {
  return renderMissionMapSvg(data, rotate, lang);
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
  /** v3.0 A5: the map column of a wide card — the History panel beside it
   *  already shows the day popover and the problem-zone callout. */
  suppressDetails?: boolean;
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
  // v2.5.0: rounded — m² sensors arrive converted (areaSqftFromEntity).
  return `${Math.round(sqft)} ft²`;
}

/** Return emoji icon for a hazard pin by source type */
export function pinIcon(source: string): string {
  if (source === 'robot_learned') return '🚧';
  if (source === 'keepout')       return '🚫';
  return '📍'; // stuck_events (default)
}

// v2.3.0 F22 — dominant_weekday follows Python's datetime.weekday() convention
// (0=Monday ... 6=Sunday), verified against integration source (image.py's
// stuck_wh computation) — deliberately NOT the JS Date.getDay() convention
// (0=Sunday). Getting this backwards would silently show every pattern one
// day off.
function formatF22Hour(hour: number): string {
  const period = hour < 12 ? 'am' : 'pm';
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${h12}${period}`;
}

/** v2.3.0 F22 — "usually Mon ~9am" when both fields are present; '' otherwise
 *  (robot_learned/keepout pins always carry null here — uniform schema, not
 *  an error; stuck_events pins with stuck_count 3–7 also carry null, the
 *  accepted threshold gap vs. stuck_pattern()'s own 8-count minimum). */
function formatF22Pattern(h: HazardRecord, lang: string): string {
  if (h.dominant_weekday == null || h.dominant_hour == null) return '';
  const labels = WEEKDAY_LABELS[lang] ?? WEEKDAY_LABELS.en;
  const day = labels[h.dominant_weekday] ?? '';
  return day ? ` · ${t(lang, 'history.pinUsuallyPattern', { day, hour: formatF22Hour(h.dominant_hour) })}` : '';
}

/** Build a tooltip string for a hazard pin */
export function buildPinTip(h: HazardRecord, lang: string): string {
  const room = h.room_name ? ` · ${h.room_name}` : '';
  if (h.source === 'stuck_events')
    return `${t(lang, 'history.pinStuckHotspot')}${h.stuck_count ? ` (${h.stuck_count}×)` : ''}${room}${formatF22Pattern(h, lang)}`;
  if (h.source === 'robot_learned') return `${t(lang, 'history.pinRobotObstacle')}${room}`;
  if (h.source === 'keepout')       return `${t(lang, 'history.pinKeepoutZone')}${room}`;
  return t(lang, 'history.pinHazard');
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
  const lang = resolveLang(hass.language);
  const days = config.history_days ?? 28;
  const unit = config.area_unit ?? 'auto';
  const useMetric = unit === 'm2' || (unit === 'auto' && isMetric);
  const { historyTab, hazards, mapSelectedRooms, suppressSubTabToggle, isMapContext } = state;

  // F11/F12: vacuum entity attributes — reflect the most recent mission.
  // last_cleaned_rooms is a live attribute; it is NOT per-mission historical data.
  const vacAttrs     = hass.states[robot(hass, n).vacuumId]?.attributes ?? {};
  // v2.5.0: region_icons lives on the zone select (entity-ids.ts), never on
  // the vacuum — the room chips here never had icons before.
  const regionIcons  = zoneSelectMapAttr<string>(hass, n, 'region_icons');
  const lastRooms    = (vacAttrs.last_cleaned_rooms ?? []) as string[];
  const missionDest  = (vacAttrs.mission_destination ?? null) as string | null;

  // F12: sequence row only available for today's missions.
  // en-CA locale gives YYYY-MM-DD in all environments without toISOString() UTC drift.
  const todayDateStr = new Date().toLocaleDateString('en-CA');
  const isToday      = state.openDay === todayDateStr;

  // Summary bar (streak + completion rate)
  const streakEntity     = robot(hass, n).st('sensor', 'clean_streak');
  const completionEntity = robot(hass, n).st('sensor', 'completion_rate_30d');
  const streakVal        = streakEntity ? parseInt(streakEntity.state, 10) : 0;
  const completionVal    = completionEntity ? parseInt(completionEntity.state, 10) : NaN;

  let summaryHtml = '';
  const summaryParts: string[] = [];
  if (streakVal > 0) summaryParts.push(`🔥 ${t(lang, 'history.streak', { count: streakVal })}`);
  if (!isNaN(completionVal)) summaryParts.push(t(lang, 'history.completionRate', { pct: completionVal }));

  // F6a — Speed trend indicator (v2.1+). Corrected from spec: belongs in History zone,
  // not Status zone — it's a 14-day analytical signal, not a real-time operational one.
  // 'stable' is intentionally silent — no noise when things are normal.
  // SC1 (integration v2.7.0): migrated from sensor.*_cleaning_speed_trend
  // (deprecated, removed in v3.0) to the `trend` attribute on the consolidated
  // sensor.*_cleaning_performance. Attribute key confirmed against source.
  if (caps.hasCleaningSpeedTrend) {
    const perfEntity = robot(hass, n).st('sensor', 'cleaning_performance');
    const trend = perfEntity?.attributes?.trend;
    if (trend === 'declining') summaryParts.push(`<span class="rpc-trend-declining">↓ ${t(lang, 'history.speedDeclining')}</span>`);
    else if (trend === 'improving') summaryParts.push(`<span class="rpc-trend-improving">↑ ${t(lang, 'history.speedImproving')}</span>`);
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
      <button class="rpc-tab${historyTab === 'calendar' ? ' active' : ''}" data-history-tab="calendar">${t(lang, 'history.tabCalendar')}</button>
      <button class="rpc-tab${historyTab === 'coverage' ? ' active' : ''}" data-history-tab="coverage">${t(lang, 'history.tabCoverage')}</button>
    </div>` : '';

  // F7 — Coverage panel (replaces heatmap when tab='coverage')
  let coveragePanelHtml = '';
  if (caps.hasCoverageImage && historyTab === 'coverage') {
    const imageEntity = robot(hass, n).st('image', 'coverage_map');
    const attrs       = imageEntity?.attributes ?? {};
    const entityPic   = attrs['entity_picture'] as string | undefined;
    const lastEnd     = attrs['last_mission_end'] as string | undefined;
    // v2.5.0 F11: the picture's exact frame (heatmap.ts coverageToImagePct).
    const extent      = coverageExtentFromAttrs(attrs);
    const hasExtent   = extent !== null;
    // v2.5.0 F11 (#20): crop to the grid's content box, capped by viewport.
    const frame       = coverageFrameStyles(extent);

    // v2.5.0 F11: only pins in pose space can be placed on this picture
    // (GridStore cells, dock-relative mm). Integration ≥ 4.2.19 says which
    // frame each pin is in (`space`): obstacles and keep-outs from the cloud
    // map are converted once the map is aligned (`pose`), else stay in map
    // units (`umf`). Older integrations send no `space`; there only
    // `stuck_events` are pose space — the others were always in map units
    // and landed in the wrong place.
    //
    // Where the zone overlay is drawn (image.*_map `zones`), it already
    // shows the same obstacles and keep-outs, so their pins are left out
    // rather than drawn twice.
    const zoneOverlayDrawn = caps.hasAlignment && caps.hasZoneOverlays && hasExtent;
    const posePins = hazards.filter(h => {
      const space = h.space ?? (h.source === 'stuck_events' ? 'pose' : 'umf');
      if (space !== 'pose') return false;
      return h.source === 'stuck_events' || !zoneOverlayDrawn;
    });
    const pinHtml = hasExtent
      ? posePins.map(h => {
          const pos  = coverageToImagePct(extent!, h.x_mm, h.y_mm);
          const tip  = esc(buildPinTip(h, lang));
          const icon = pinIcon(h.source);
          return `<div class="rpc-hazard-pin rpc-pin-${h.source}" style="left:${pos.left};top:${pos.top}" title="${tip}" aria-label="${tip}">${icon}</div>`;
        }).join('')
      : '';

    const noExtentNote = !hasExtent && entityPic
      ? `<div class="rpc-coverage-note">${t(lang, 'history.spatialOverlayUnavailable')}</div>`
      : '';

    const updatedLine = lastEnd
      ? `<div class="rpc-coverage-updated">${t(lang, 'history.updated', { time: timeSince(lastEnd, hass.language) })}</div>`
      : '';

    // Build legend — only show entries for what the picture actually shows:
    // pins (emoji) or, for obstacles/keep-outs, the zone overlay (swatches).
    const hasPinStuck   = hasExtent && posePins.some(h => h.source === 'stuck_events');
    const pinRobot      = hasExtent && posePins.some(h => h.source === 'robot_learned');
    const pinKeepout    = hasExtent && posePins.some(h => h.source === 'keepout');
    const zoneTypes     = new Set((zoneOverlayDrawn
      ? ((hass.states[mapImageId(hass, n) ?? '']?.attributes?.['zones'] ?? []) as { type?: string }[])
      : []).map(z => z?.type));
    const legendPins    = [
      hasPinStuck  ? `<span>📍</span> ${t(lang, 'history.pinStuckHotspot')}` : '',
      pinRobot     ? `<span>🚧</span> ${t(lang, 'history.legendRobotObstacle')}` : '',
      pinKeepout   ? `<span>🚫</span> ${t(lang, 'history.pinKeepoutZone')}` : '',
      // Swatches in the overlay's own styling (amber dot / dashed red area).
      zoneTypes.has('observed') ? `<span class="rpc-legend-swatch rpc-legend-observed"></span> ${t(lang, 'history.legendRobotObstacle')}` : '',
      zoneTypes.has('keepout')  ? `<span class="rpc-legend-swatch rpc-legend-keepout"></span> ${t(lang, 'history.pinKeepoutZone')}` : '',
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
      ? `<div class="rpc-coverage-note">${t(lang, 'history.f22Footnote')}</div>`
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
    //
    // v2.5.0 F11 — RESOLVED: the two pictures do NOT share a frame
    // (image.*_map is a 600 px render with its own fit; the coverage map is
    // GridStore's square heatmap), so calibration_points could not place
    // anything on this picture. Both data sets are in the robot's pose-space
    // millimetres, though, so the overlay now uses the coverage picture's
    // own exact transform — the same one the hazard pins use. calibration.ts
    // stays for 3.0.0, where the Map tab moves onto image.*_rooms_map.
    if (caps.hasAlignment && extent) {
      const mapId = mapImageId(hass, n);
      const mapAttrs = (mapId ? hass.states[mapId]?.attributes : undefined) ?? {};
      const rooms = (mapAttrs['rooms'] ?? {}) as Record<string, {
        outline: [number, number][]; name: string; room_id: string; icon: string; x: number; y: number;
      }>;
      const toPctNum = (x: number, y: number) => coverageToImagePctNum(extent, x, y);
      const toPct    = (x: number, y: number) => coverageToImagePct(extent, x, y);
      // Rooms the robot never visited lie outside the grid's extent. SVG
      // polygons clip at the picture edge on their own; absolutely
      // positioned labels and markers would spill past it, so they are
      // dropped when their anchor falls outside the picture.
      const inFrame  = (x: number, y: number) => {
        const p = toPctNum(x, y);
        return p.x >= 0 && p.x <= 100 && p.y >= 0 && p.y <= 100;
      };

      {
        const polygons = Object.values(rooms).map(room => {
          if (!room.outline || room.outline.length < 3) return '';
          const pointsAttr = room.outline
            .map(([x, y]) => {
              const p = toPctNum(x, y);
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
        // v2.5.0 F3: from the resolved zone select (cloud_zone_* with cloud).
        const regionAreasM2 = zoneSelectMapAttr<number>(hass, n, 'region_areas_m2');

        // v2.4.0 ROOM-ACCESS — per-room accessibility score as a label
        // tooltip (title attribute), same lightweight approach as door
        // markers' hover tooltip below. Sourced from a SEPARATE sensor
        // entity (sensor.*_room_accessibility_scores), not image.*_map —
        // gated by hasRoomAccess (same underlying umf_aligner condition as
        // hasAlignment itself, verified against source).
        //
        // Defensive shape check: unlike rooms_overdue's `rooms` sub-key,
        // this sensor's extra_state_attributes has NO wrapper key (verified
        // against source) — HA also merges its own state_class/
        // friendly_name/etc. into that same flat attributes dict, so only
        // entries actually shaped like {score: number, ...} are treated as
        // room entries here, not every key present.
        const accessTips = roomAccessTips(hass, caps, n, lang);

        const labels = Object.values(rooms).filter(room => inFrame(room.x, room.y)).map(room => {
          const pos    = toPct(room.x, room.y);
          const emoji  = mdiToEmoji(room.icon);
          const selected = mapSelectedRooms?.has(room.name) ?? false;
          const areaM2 = regionAreasM2[room.name];
          const areaSuffix = typeof areaM2 === 'number' && !isNaN(areaM2)
            ? ` / ${areaM2.toFixed(1)} m²`
            : '';
          const accessTip = accessTips[room.name] ?? '';
          const tipAttr = accessTip ? ` title="${esc(accessTip)}" aria-label="${esc(accessTip)}"` : '';
          return `<div class="rpc-room-label${selected ? ' rpc-room-label--selected' : ''}"
            style="left:${pos.left};top:${pos.top}" data-room-label="${esc(room.name)}"${tipAttr}>
            ${emoji ? `${emoji} ` : ''}${esc(room.name)}${esc(areaSuffix)}
          </div>`;
        }).join('');

        // v2.5.0: no rooms (map entity absent or not aligned) → no empty
        // overlay layer; previously implied by the missing calibration.
        roomOverlayHtml = Object.keys(rooms).length === 0 ? '' : `
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
              const p = toPctNum(z.x, z.y);
              return `<circle class="rpc-zone-observed" cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="2"><title>${t(lang, 'history.pinRobotObstacle')}</title></circle>`;
            }
            if (z.type === 'keepout' && z.polygon.length >= 3) {
              const pts = z.polygon.map(([x, y]) => {
                const p = toPctNum(x, y);
                return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
              }).join(' ');
              return `<polygon class="rpc-zone-keepout" points="${pts}"><title>${t(lang, 'history.pinKeepoutZone')}</title></polygon>`;
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
          doorMarkerHtml = markers.filter(m => inFrame(m.cx, m.cy)).map(m => {
            const pos = toPct(m.cx, m.cy);
            const tip = esc(t(lang, 'history.doorMarkerSeen', { label: m.label, count: m.mission_count }));
            return `<div class="rpc-door-marker" style="left:${pos.left};top:${pos.top}" title="${tip}" aria-label="${tip}">🚪</div>`;
          }).join('');
        }

        // v2.3.0 F24 — furniture shadow candidates. Small shadow markers;
        // no per-candidate label (the underlying data carries no name/id,
        // just a location — verified against source).
        if (caps.hasFurnitureShadows) {
          const candidates = (mapAttrs['furniture_candidates'] ?? []) as { x_mm: number; y_mm: number }[];
          furnitureHtml = candidates.filter(c => inFrame(c.x_mm, c.y_mm)).map(c => {
            const pos = toPct(c.x_mm, c.y_mm);
            const tip = esc(t(lang, 'history.possibleFurnitureChange'));
            return `<div class="rpc-furniture-shadow" style="left:${pos.left};top:${pos.top}" title="${tip}" aria-label="${tip}"></div>`;
          }).join('');
        }
      }
    }

    coveragePanelHtml = entityPic ? `
      <div class="rpc-coverage-panel">
        <div class="rpc-coverage-image-wrap" style="${frame.wrap}">
          <img class="rpc-coverage-img" style="${frame.img}" src="${entityPic}" alt="${t(lang, 'history.coverageMapAlt')}" />
          ${roomOverlayHtml}
          ${zoneOverlayHtml}
          ${doorMarkerHtml}
          ${furnitureHtml}
          ${pinHtml}
        </div>
        ${noExtentNote}
        <div class="rpc-coverage-legend">
          <span style="color:#2f6bff">●</span> ${t(lang, 'history.highCoverage')}
          <span style="color:var(--rpc-grey-mid,#9ca3af)">●</span> ${t(lang, 'history.rarelyCleaned')}
          ${legendPins}
        </div>
        ${f22FootnoteHtml}
        ${updatedLine}
      </div>` : `<div class="rpc-history-error">${t(lang, 'history.coverageMapUnavailable')}</div>`;
  }

  // Heatmap area
  let heatmapHtml = '';
  if (state.loading && !state.data) {
    heatmapHtml = renderSkeletonHeatmap(Math.ceil(days / 7), lang);
  } else if (state.error) {
    heatmapHtml = `<div class="rpc-history-error">${esc(state.error)}</div>`;
  } else if (state.data) {
    heatmapHtml = renderHeatmap(state.data, days, unit, hass.language, caps.hasDirtDensity, lang);
    // Show partial message if API returned fewer calendar days than requested
    if (state.data.length < days) {
      heatmapHtml += `<div class="rpc-history-partial">${t(lang, 'history.partialDays', { shown: state.data.length, days })}</div>`;
    }
  }

  // Problem zone callout
  let problemHtml = '';
  if (caps.hasProblemZone) {
    const pzEntity    = robot(hass, n).st('sensor', 'problem_zone');
    const stuckEntity = robot(hass, n).st('sensor', 'stuck_count_30d');
    if (pzEntity && pzEntity.state !== 'unknown' && pzEntity.state !== 'unavailable') {
      const count = stuckEntity ? parseInt(stuckEntity.state, 10) : 0;
      if (count > 0) {
        problemHtml = `<div class="rpc-problem-zone">⚠ ${t(lang, 'history.problemZone', { zone: esc(pzEntity.state), count })}</div>`;
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
      missionRows = `<div class="rpc-day-empty">${t(lang, 'history.noMissionsThisDay')}</div>`;
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
          ? t(lang, 'history.dirtEvents', { count: m.dirt_events })
          : '';
        const meta = [zones, dirtPart].filter(Boolean).join(' · ');
        // F1 spec — demand initiator badge: robot cleaned because floor was dirty
        const demandBadge = m.initiator === 'demand'
          ? `<span class="rpc-initiator-badge">${t(lang, 'history.demandBadge')}</span>`
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
              wifiHtml = `<div class="rpc-day-wifi" aria-label="${t(lang, 'history.wifiQualityLabel', { pct: quality })}"><span aria-hidden="true">📶</span>${sparkSvg}<span>${t(lang, 'history.wifiAvg', { pct: quality })}</span></div>`;
            }
          } else {
            const minWifi = Math.min(...barHeights);
            wifiHtml = `<div class="rpc-day-wifi" aria-label="${t(lang, 'history.wifiMinLabel', { pct: minWifi })}"><span aria-hidden="true">📶</span>${sparkSvg}<span>${t(lang, 'history.wifiMin', { pct: minWifi })}</span></div>`;
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
            const icon = mdiToEmoji(mdi);
            return `<span class="rpc-trav-room">${icon ? icon + '\u00a0' : ''}${esc(name)}</span>`;
          }).join('<span class="rpc-trav-sep">→</span>');
          const destLine = missionDest
            ? `<div class="rpc-mission-dest-popover">${t(lang, 'history.finalDest', { dest: esc(missionDest) })}</div>`
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
          alignmentNote = `<div class="rpc-alignment-note">${t(lang, 'history.alignmentNote', { pct: confPct })}</div>`;
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
          const btn = `<button class="rpc-explain-btn" data-explain="${esc(m.id)}" aria-expanded="${!!open}">${t(lang, 'history.whyButton')}</button>`;
          let panel = '';
          if (open) {
            if (open.error) {
              panel = `<div class="rpc-explain-panel rpc-explain-panel--muted">${t(lang, 'history.explainNotAvailable')}</div>`;
            } else if (open.data === null) {
              panel = `<div class="rpc-explain-panel rpc-explain-panel--muted">${t(lang, 'history.analysing')}</div>`;
            } else {
              panel = renderExplainPanel(open.data, lang);
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
          const btn = `<button class="rpc-explain-btn" data-replay="${m.n_mssn}" aria-expanded="${!!open}">${t(lang, 'history.routeButton')}</button>`;
          let panel = '';
          if (open) {
            if (open.error) {
              panel = `<div class="rpc-replay-panel rpc-explain-panel--muted">${t(lang, 'history.pathNotAvailable')}</div>`;
            } else if (open.data === null) {
              panel = `<div class="rpc-replay-panel rpc-explain-panel--muted">${t(lang, 'history.loading')}</div>`;
            } else {
              panel = renderReplayPanel(open.data, hass.language, lang);
            }
          }
          replayHtml = `${btn}${panel}`;
        }

        // v2.3.0 MISSION-MAP — coverage replay (integration ≥ 3.3.0
        // MISSION-MAP).
        //
        // v2.4.0 CORRECTION: the source==='local' gate is REMOVED. It
        // existed because _mission_map_payload()'s own record resolution
        // was a separate, still-unfixed lookup (`r.get("id") ==
        // record_id` against ms.records only) — the same R2-1-class gap
        // Why?'s EXPLAIN-CLOUD fix closed elsewhere, but never applied
        // here (verified against source at v3.4.2 time — still open).
        // Verified against the v3.4.2 MISSION-MAP-CLOUD-ROWS fix: a new
        // _resolve_cloud_mission_map_record() helper (mirrors
        // _resolve_cloud_explain_record() exactly — same startTime-then-
        // timestamp precedence) now resolves c_{ts} ids against
        // cloud_coordinator.raw_records before _mission_map_payload()
        // falls through to its local-only lookup. c_{ts} ids resolve
        // correctly now, same as local ids.
        //
        // n_mssn presence remains the SMART+cloud proxy signal — no
        // dedicated per-record field exists yet to confirm pmaps_info
        // ahead of the fetch; a 404 for a genuinely absent map (e.g. an
        // EPHEMERAL-tier cloud row with no pmaps_info, or unconfirmed
        // i-series coverage layers) is treated as a real, calm answer
        // below via open.status === 'absent' — not an error, and not a
        // new failure mode introduced by this unlock.
        let mapHtml = '';
        if (m.n_mssn != null) {
          const open = state.openMissionMap?.recordId === m.id ? state.openMissionMap : null;
          const btn = `<button class="rpc-explain-btn" data-map="${esc(m.id)}" aria-expanded="${!!open}">${t(lang, 'history.mapButton')}</button>`;
          let panel = '';
          if (open) {
            if (open.status === 'absent') {
              panel = `<div class="rpc-map-panel rpc-explain-panel--muted">${t(lang, 'history.noCoverageMap')}</div>`;
            } else if (open.status === 'error') {
              panel = `<div class="rpc-map-panel rpc-explain-panel--muted">${t(lang, 'history.couldntLoadMap')}</div>`;
            } else if (open.data === null) {
              panel = `<div class="rpc-map-panel rpc-explain-panel--muted">${t(lang, 'history.loading')}</div>`;
            } else {
              panel = renderMissionMapPanel(open.data, config.mission_map_rotate ?? 0, lang);
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
          <div>${t(lang, 'history.aggregateMissionCount', { count: summary.total })} · ${esc(summary.result)}
            ${areaStr ? t(lang, 'history.aggregateAreaTotal', { area: areaStr }) : ''}</div>
          <div class="rpc-day-no-detail">${t(lang, 'history.noPerMissionDetail')}</div>
        </div>`;
    }

    const missionCount = summary?.total ?? 0;
    popoverHtml = `
      <div class="rpc-popover rpc-day-popover">
        <div class="rpc-popover-header">
          <span>${esc(dateLabel)}</span>
          <button class="rpc-popover-close" data-close-day="true" aria-label="${t(lang, 'history.close')}">×</button>
        </div>
        <div class="rpc-popover-divider"></div>
        ${missionCount > 0 && missions && missions.length > 0
          ? `<div class="rpc-day-count">${t(lang, 'history.aggregateMissionCount', { count: missionCount })}</div>`
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
    const lifetimeMissions = robot(hass, n).st('sensor', 'lifetime_missions');
    const analyticsEntity  = robot(hass, n).st('sensor', 'cleaning_analytics_30d');

    // Parse values individually — show the section if at least one is available.
    // Each span is only rendered when its value is a real number, so a missing
    // sensor (unknown/unavailable) just omits that one line rather than hiding
    // the entire Stats section.
    const missions = lifetimeMissions ? parseInt(lifetimeMissions.state, 10) : NaN;
    const hours    = (() => {
      const raw = analyticsEntity?.attributes?.time_h;
      return typeof raw === 'number' ? raw : NaN;
    })();
    // v2.5.0: honour the sensor's unit (m², or ft² if HA converted it) and
    // show it in the user's unit like every other area in the card.
    const areaSqft = areaSqftFromEntity(analyticsEntity);

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
    const optical = numState((robot(hass, n).id('sensor', 'optical_dirt_detections') ?? ''));
    const piezo   = numState((robot(hass, n).id('sensor', 'piezo_dirt_detections') ?? ''));
    const scrubs  = numState((robot(hass, n).id('sensor', 'scrubs_count') ?? ''));

    const hasAny   = !isNaN(missions) || !isNaN(hours) || !isNaN(areaSqft)
      || !isNaN(optical) || !isNaN(piezo) || !isNaN(scrubs);

    if (hasAny) {
      const dirtParts = [
        !isNaN(optical) ? t(lang, 'history.dirtOptical', { count: optical.toLocaleString() }) : '',
        !isNaN(piezo)   ? t(lang, 'history.dirtPiezo', { count: piezo.toLocaleString() }) : '',
        !isNaN(scrubs)  ? t(lang, 'history.dirtScrubEvents', { count: scrubs.toLocaleString() }) : '',
      ].filter(Boolean);
      const dirtLine = dirtParts.length
        ? `<div class="rpc-lifetime-stats rpc-lifetime-dirt">
            <span class="rpc-lifetime-arrow">→</span>
            <span>${t(lang, 'history.dirtDetectLabel', { parts: dirtParts.join(' · ') })}</span>
          </div>`
        : '';

      const expandedContent = state.lifetimeExpanded ? `
        <div class="rpc-lifetime-stats">
          <span class="rpc-lifetime-arrow">→</span>
          ${!isNaN(missions) ? `<span>${t(lang, 'history.lifetimeMissions', { count: missions.toLocaleString() })}</span>` : ''}
          ${!isNaN(areaSqft) ? `<span>${formatArea(areaSqft, useMetric)}</span>` : ''}
          ${!isNaN(hours)    ? `<span>${t(lang, 'history.lifetimeHours', { hours: hours.toLocaleString() })}</span>` : ''}
        </div>${dirtLine}` : '';

      lifetimeHtml = `
        <div class="rpc-lifetime-divider"></div>
        <button class="rpc-lifetime-toggle" data-lifetime-toggle aria-expanded="${state.lifetimeExpanded}">
          ${t(lang, 'history.statsToggle')} ${state.lifetimeExpanded ? '▲' : '▼'}
        </button>
        ${expandedContent}
      `;
    }
  }

  return `
    <div class="rpc-zone rpc-zone6">
      ${!isMapContext ? `<div class="rpc-zone-header">${t(lang, 'history.zoneHeaderDays', { days })}</div>` : ''}
      ${!isMapContext ? summaryHtml : ''}
      ${tabToggleHtml}
      <div class="rpc-heatmap-wrap" data-heatmap>
        ${historyTab === 'coverage' && caps.hasCoverageImage ? coveragePanelHtml : heatmapHtml}
      </div>
      ${state.suppressDetails ? '' : problemHtml}
      ${state.suppressDetails ? '' : popoverHtml}
      ${!isMapContext ? lifetimeHtml : ''}
    </div>
  `;
}

/**
 * v2.4.0 ROOM-ACCESS — per-room accessibility score as a label tooltip,
 * from sensor.*_room_accessibility_scores (registered only with the UMF
 * aligner). Its attributes have NO wrapper key — HA merges its own
 * state_class/friendly_name into the same flat dict — so only entries
 * shaped like {score: number, ...} count as rooms. The three known
 * limiting_factor codes get short labels; an unknown future code is shown
 * as-is rather than hidden. v3.0: shared by the coverage view and the
 * rooms-map Map tab (map-zone.ts).
 */
export function roomAccessTips(hass: HomeAssistant, caps: RobotCapabilities, n: string, lang: string): Record<string, string> {
  const out: Record<string, string> = {};
  if (!caps.hasRoomAccess) return out;
  const raw = (robot(hass, n).st('sensor', 'room_accessibility_scores')?.attributes ?? {}) as Record<string, unknown>;
  const label = (factor: string | null | undefined): string => {
    if (factor == null) return '';
    switch (factor) {
      case 'obstacle_density': return t(lang, 'history.limitingFactorObstacle');
      case 'narrow_passages':  return t(lang, 'history.limitingFactorNarrow');
      case 'coverage_gap':     return t(lang, 'history.limitingFactorCoverage');
      default:                 return factor;
    }
  };
  for (const [name, val] of Object.entries(raw)) {
    if (!val || typeof val !== 'object') continue;
    const v = val as { score?: unknown; limiting_factor?: string | null };
    if (typeof v.score !== 'number') continue;
    const f = label(v.limiting_factor);
    out[name] = `${t(lang, 'history.accessTip', { name, score: Math.round(v.score) })}${f ? t(lang, 'history.limitedBySuffix', { factor: f }) : ''}`;
  }
  return out;
}
