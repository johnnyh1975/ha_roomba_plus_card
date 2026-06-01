import { HomeAssistant, CardConfig, RobotCapabilities, DaySummary, MissionRecord } from '../types.js';
import { renderHeatmap, renderSkeletonHeatmap, renderSparkline, normalisedWifiPct } from '../heatmap.js';
import { esc } from '../utils.js';

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
}

function formatArea(sqft: number, useMetric: boolean): string {
  if (useMetric) return `${Math.round(sqft * 0.0929)} m²`;
  return `${sqft} ft²`;
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
  if (caps.hasCleaningSpeedTrend) {
    const trendEntity = hass.states[`sensor.${n}_cleaning_speed_trend`];
    const trend = trendEntity?.state;
    if (trend === 'declining') summaryParts.push('<span class="rpc-trend-declining">↓ Speed declining</span>');
    else if (trend === 'improving') summaryParts.push('<span class="rpc-trend-improving">↑ Speed improving</span>');
    // 'stable': no indicator — normal state, no noise
  }

  if (summaryParts.length) {
    summaryHtml = `<div class="rpc-history-summary">${
      summaryParts.map((p, i) => i === 0 ? p : `<span class="rpc-summary-sep">·</span>${p}`).join('')
    }</div>`;
  }

  // Heatmap area
  let heatmapHtml = '';
  if (state.loading && !state.data) {
    heatmapHtml = renderSkeletonHeatmap(Math.ceil(days / 7));
  } else if (state.error) {
    heatmapHtml = `<div class="rpc-history-error">${esc(state.error)}</div>`;
  } else if (state.data) {
    heatmapHtml = renderHeatmap(state.data, days, unit, hass.language);
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
      missionRows = missions.map(m => {
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

        // F6b — WiFi sparkline (v2.1+ cloud records with wifi_signal array).
        // Normalise wlBars (0–4 int) → percentage before rendering.
        let wifiHtml = '';
        if (m.wifi_signal && m.wifi_signal.length > 0) {
          const pctReadings = normalisedWifiPct(m.wifi_signal);
          const minWifi     = Math.min(...pctReadings);
          const sparkSvg    = renderSparkline(pctReadings, minWifi);
          wifiHtml = `<div class="rpc-day-wifi" aria-label="Wi-Fi signal: minimum ${minWifi}% during mission"><span aria-hidden="true">📶</span>${sparkSvg}<span>${minWifi}% min</span></div>`;
        }

        return `
          <div class="rpc-day-mission">
            <span class="rpc-day-icon ${cls}">${icon}</span>
            <span class="rpc-day-time">${start}</span>
            <span class="rpc-day-dur">${m.duration_min} min</span>
            <span class="rpc-day-area">${area}</span>
            ${meta ? `<div class="rpc-day-zones">${meta}</div>` : ''}
            ${wifiHtml}
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
    const lifetimeMissions = hass.states[`sensor.${n}_lifetime_missions`];
    const lifetimeArea     = hass.states[`sensor.${n}_lifetime_area`];
    const lifetimeTime     = hass.states[`sensor.${n}_lifetime_time`];

    if (lifetimeMissions && lifetimeArea && lifetimeTime) {
      const missions = parseInt(lifetimeMissions.state, 10);
      const hours    = parseInt(lifetimeTime.state, 10);
      const areaSqft = parseFloat(lifetimeArea.state);
      const areaStr  = !isNaN(areaSqft) ? formatArea(areaSqft, useMetric) : null;

      const expandedContent = state.lifetimeExpanded ? `
        <div class="rpc-lifetime-stats">
          <span class="rpc-lifetime-arrow">→</span>
          ${!isNaN(missions) ? `<span>${missions.toLocaleString()} missions</span>` : ''}
          ${areaStr ? `<span>${areaStr}</span>` : ''}
          ${!isNaN(hours) ? `<span>${hours.toLocaleString()} h</span>` : ''}
        </div>` : '';

      lifetimeHtml = `
        <div class="rpc-lifetime-divider"></div>
        <button class="rpc-lifetime-toggle" data-lifetime-toggle aria-expanded="${state.lifetimeExpanded}">
          Lifetime ${state.lifetimeExpanded ? '▲' : '▼'}
        </button>
        ${expandedContent}
      `;
    }
  }

  return `
    <div class="rpc-zone rpc-zone6">
      <div class="rpc-zone-header">LAST ${days} DAYS</div>
      ${summaryHtml}
      <div class="rpc-heatmap-wrap" data-heatmap>
        ${heatmapHtml}
      </div>
      ${problemHtml}
      ${popoverHtml}
      ${lifetimeHtml}
    </div>
  `;
}
