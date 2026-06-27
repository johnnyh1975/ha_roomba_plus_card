import { HomeAssistant, CardConfig, RobotCapabilities, DaySummary, MissionRecord, HazardRecord } from '../types.js';
import { renderHeatmap, renderSkeletonHeatmap, renderSparkline, normalisedWifiPct, mmToImagePct, mmToImagePctNum } from '../heatmap.js';
import { esc, timeSince } from '../utils.js';
import { MDI_TO_EMOJI } from '../const.js';

export interface HistoryZoneState {
  data: DaySummary[] | null;
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

/** Build a tooltip string for a hazard pin */
function buildPinTip(h: HazardRecord): string {
  const room = h.room_name ? ` · ${h.room_name}` : '';
  if (h.source === 'stuck_events')
    return `Stuck hotspot${h.stuck_count ? ` (${h.stuck_count}×)` : ''}${room}`;
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
  const { historyTab, hazards, mapSelectedRooms } = state;

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
  const tabToggleHtml = caps.hasCoverageImage ? `
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

    // v2.0 C7-ROOM-BOUNDS: room polygon overlays + tap-to-select.
    // Gated on caps.hasAlignment — non-empty `rooms` dict on the image
    // entity. Coordinates are pose-space mm (confirmed against integration
    // source — NOT image pixels), so they need the same xMin/xMax/yMin/yMax
    // spatial-extent transform already used for hazard pins above.
    let roomOverlayHtml = '';
    if (hasExtent && caps.hasAlignment) {
      const rooms = (attrs['rooms'] ?? {}) as Record<string, {
        outline: [number, number][]; name: string; room_id: string; icon: string; x: number; y: number;
      }>;

      const polygons = Object.values(rooms).map(room => {
        if (!room.outline || room.outline.length < 3) return '';
        const pointsAttr = room.outline
          .map(([x, y]) => {
            const p = mmToImagePctNum(x, y, xMin!, xMax!, yMin!, yMax!);
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
        const pos    = mmToImagePct(room.x, room.y, xMin!, xMax!, yMin!, yMax!);
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
    }

    coveragePanelHtml = entityPic ? `
      <div class="rpc-coverage-panel">
        <div class="rpc-coverage-image-wrap">
          <img class="rpc-coverage-img" src="${entityPic}" alt="Coverage map" />
          ${roomOverlayHtml}
          ${pinHtml}
        </div>
        ${noExtentNote}
        <div class="rpc-coverage-legend">
          <span style="color:var(--rpc-green)">●</span> High coverage
          <span style="color:var(--rpc-grey-mid,#9ca3af)">●</span> Rarely cleaned
          ${legendPins}
        </div>
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
        const icon  = m.result === 'completed' ? '✓' : '✗';
        const cls   = m.result === 'completed' ? 'rpc-day-ok' : 'rpc-day-err';
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

        // F6b — WiFi sparkline (v2.1+ cloud records with wifi_signal array).
        // Normalise wlBars (0–4 int) → percentage before rendering.
        let wifiHtml = '';
        if (m.wifi_signal && m.wifi_signal.length > 0) {
          const pctReadings = normalisedWifiPct(m.wifi_signal);
          const minWifi     = Math.min(...pctReadings);
          const sparkSvg    = renderSparkline(pctReadings, minWifi);
          wifiHtml = `<div class="rpc-day-wifi" aria-label="Wi-Fi signal: minimum ${minWifi}% during mission"><span aria-hidden="true">📶</span>${sparkSvg}<span>${minWifi}% min</span></div>`;
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
    const hasAny   = !isNaN(missions) || !isNaN(hours) || !isNaN(areaM2);

    if (hasAny) {
      const expandedContent = state.lifetimeExpanded ? `
        <div class="rpc-lifetime-stats">
          <span class="rpc-lifetime-arrow">→</span>
          ${!isNaN(missions) ? `<span>${missions.toLocaleString()} missions</span>` : ''}
          ${!isNaN(areaM2)   ? `<span>${areaM2.toLocaleString()} m²</span>` : ''}
          ${!isNaN(hours)    ? `<span>${hours.toLocaleString()} h (30 d)</span>` : ''}
        </div>` : '';

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
      <div class="rpc-zone-header">LAST ${days} DAYS</div>
      ${summaryHtml}
      ${tabToggleHtml}
      <div class="rpc-heatmap-wrap" data-heatmap>
        ${historyTab === 'coverage' && caps.hasCoverageImage ? coveragePanelHtml : heatmapHtml}
      </div>
      ${problemHtml}
      ${popoverHtml}
      ${lifetimeHtml}
    </div>
  `;
}
