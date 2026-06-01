import { HomeAssistant, CardConfig, RobotCapabilities, DaySummary } from '../types.js';
import { esc, timeSince } from '../utils.js';
import { renderSettingsPanel } from './room-selector-zone.js';

type VacuumState = 'cleaning' | 'paused' | 'returning' | 'docked' | 'idle' | 'error' | 'unavailable';

export interface StatusZoneProps {
  hass: HomeAssistant;
  config: CardConfig;
  caps: RobotCapabilities;
  robotName: string;
  loadingAction: string | null;
  /** Today's DaySummary from history data, for Wave A3 context line */
  todayMissionCount: number | null;
  /**
   * F1: Full history data for "Last cleaned X ago" display when docked.
   * null when history not yet loaded or show_history: false.
   */
  missionData: DaySummary[] | null;
  /** F3b: settings panel expanded state — passed when show_rooms:false so settings render here */
  settingsPanelOpen: boolean;
}

function st(hass: HomeAssistant, entityId: string): string {
  return hass.states[entityId]?.state ?? 'unavailable';
}

function formatArea(sqft: number, unit: 'auto' | 'sqft' | 'm2', isMetric: boolean): string {
  const useMetric = unit === 'm2' || (unit === 'auto' && isMetric);
  if (useMetric) return `${Math.round(sqft * 0.0929)} m²`;
  return `${sqft} ft²`;
}

/**
 * F1: Returns a human-readable "X ago" string for the most recent completed mission.
 * Scans missionData from most-recent backward; returns null if no data yet.
 */
function lastCleanedAgo(missionData: DaySummary[] | null, locale: string): string | null {
  if (!missionData) return null;
  for (let i = missionData.length - 1; i >= 0; i--) {
    const day = missionData[i];
    if (day.missions && day.missions.length > 0) {
      for (let j = day.missions.length - 1; j >= 0; j--) {
        const m = day.missions[j];
        if (m.result === 'completed') return timeSince(m.started_at, locale);
      }
    } else if (day.completed > 0) {
      return timeSince(day.date + 'T12:00:00Z', locale);
    }
  }
  return null;
}

function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] ?? s[v] ?? s[0]);
}

export function renderStatusZone(props: StatusZoneProps): string {
  const { hass, config, caps, robotName, loadingAction, todayMissionCount, settingsPanelOpen } = props;
  const entityId = config.entity;
  const vacState = (st(hass, entityId)) as VacuumState;
  const attrs = hass.states[entityId]?.attributes ?? {};
  const isMetric = hass.config?.unit_system?.length === 'm';
  const unit = config.area_unit ?? 'auto';
  const unavailable = vacState === 'unavailable';
  const anyLoading = loadingAction !== null;

  const n = robotName;

  // Sensors
  const errorSensor        = `sensor.${n}_last_error_code`;
  const errorZoneSensor    = `sensor.${n}_last_error_zone`;
  const rechargeTimeSensor = `sensor.${n}_mission_recharge_time`;  // pre-1.9 fallback only
  const avgDurationSensor  = `sensor.${n}_missions_last_30d`;
  const avgAreaSensor      = `sensor.${n}_average_area_30d`;
  const areaCleanedToday   = `sensor.${n}_area_cleaned_today`;

  const elapsedMin     = (attrs.mission_elapsed_min as number | null) ?? null;
  const missionArea    = (attrs.mission_area_sqft as number | null) ?? null;
  const avgDurRaw      = parseFloat(st(hass, avgDurationSensor));
  const estimatedTotal = isNaN(avgDurRaw) || avgDurRaw <= 0 ? 45 : avgDurRaw;
  const avgArea        = parseFloat(st(hass, avgAreaSensor));

  // Robot identity
  const isMop      = caps.isMop;
  const robotIcon  = isMop ? '🧹' : '🤖';
  const friendlyName = esc((attrs.friendly_name as string) ?? entityId);

  // ── Mission phase (v1.9+) ──
  // These give precise state that the vacuum entity alone cannot convey.
  const missionPhase      = hass.states[`sensor.${n}_mission_phase`]?.state ?? '';
  const missionActiveRaw  = hass.states[`binary_sensor.${n}_mission_active`]?.state ?? '';
  const isMissionActive   = missionActiveRaw === 'on';
  const hasMissionActive  = caps.hasMissionActive;

  // ── Recharge ETA (independent of detection method) ──
  // mission_expire_time gives the resumption time regardless of whether we detected
  // the recharge via mission_active (v1.9+) or the recharge/expire pair (pre-1.9).
  const expireRaw  = hass.states[`sensor.${n}_mission_expire_time`]?.state ?? '';
  const expireDate = expireRaw && expireRaw !== 'unavailable' && expireRaw !== 'unknown'
    ? new Date(expireRaw) : null;
  const hasETA     = !!expireDate && !isNaN(expireDate.getTime()) && expireDate > new Date();
  const resumeMin  = hasETA ? Math.max(1, Math.round((expireDate!.getTime() - Date.now()) / 60000)) : null;

  // ── Recharging mid-mission detection ──
  // v1.9+: binary_sensor.mission_active = on while vacuum is docked → mid-mission recharge.
  // Pre-1.9 fallback: recharge/expire sensor pair.
  let isRecharging = false;
  if (hasMissionActive) {
    isRecharging = vacState === 'docked' && isMissionActive;
  } else {
    const rechargeState = st(hass, rechargeTimeSensor);
    const rechargeValid = rechargeState !== 'unavailable' && rechargeState !== 'unknown'
                       && expireRaw      !== 'unavailable' && expireRaw      !== 'unknown';
    isRecharging = vacState === 'docked' && rechargeValid && hasETA;
  }

  // ── State label ──
  let stateDot = '';
  let stateLabel = '';
  let extraClass = '';

  // Evac (Clean Base emptying) — phase takes precedence over vacuum state
  if (missionPhase === 'evac') {
    stateDot   = '⬆';
    stateLabel = 'Emptying bin';
  } else if (isRecharging) {
    stateDot   = '⚡';
    stateLabel = resumeMin !== null
      ? `Recharging — resuming in ~${resumeMin} min`
      : 'Recharging — mission continues';
  } else {
    switch (vacState) {
      case 'cleaning':    stateDot = '●'; stateLabel = isMop ? 'Mopping'         : 'Cleaning';          break;
      case 'paused':      stateDot = '⏸'; stateLabel = 'Paused';                                        break;
      case 'returning':   stateDot = '↩'; stateLabel = 'Returning to dock';                             break;
      case 'docked':      stateDot = '✓'; stateLabel = 'Docked';                                        break;
      case 'idle':        stateDot = '○'; stateLabel = 'Idle';                                          break;
      case 'error':       stateDot = '⚠'; stateLabel = 'Error'; extraClass = 'rpc-error-state';        break;
      case 'unavailable': stateDot = '—'; stateLabel = 'Unavailable';                                   break;
    }
  }

  // ── Error details (Zone 1 inline) ──
  let errorHtml = '';
  if (vacState === 'error') {
    const errEntity = hass.states[errorSensor];
    if (errEntity && errEntity.state !== '0' && errEntity.state !== '' && errEntity.state !== 'unavailable') {
      const desc   = esc((errEntity.attributes.description as string) ?? 'Unknown error');
      const action = esc((errEntity.attributes.action   as string) ?? '');
      const zone   = st(hass, errorZoneSensor);
      const hasZone = zone && zone !== 'unknown' && zone !== 'unavailable';
      stateLabel = `Error ${esc(errEntity.state)} — ${desc}`;
      errorHtml  = `
        ${action ? `<div class="rpc-error-action">${action}</div>` : ''}
        ${hasZone ? `<div class="rpc-error-zone">Zone: ${esc(zone)}</div>` : ''}
      `;
    } else {
      stateLabel = 'Robot error — check the iRobot app';
    }
  }

  // ── Wave A3: area-today context line ──
  // Show during any active mission state: cleaning, paused, or mid-mission recharge.
  let areaTodayHtml = '';
  const missionInProgress = hasMissionActive
    ? isMissionActive
    : (vacState === 'cleaning' || isRecharging);
  if (missionInProgress && caps.hasArea) {
    const todayAreaRaw = parseFloat(st(hass, areaCleanedToday));
    if (!isNaN(todayAreaRaw) && todayAreaRaw > 0) {
      const areaStr = formatArea(todayAreaRaw, unit, isMetric);
      // Heatmap data shows COMPLETED missions; current mission is +1
      const currentMission = todayMissionCount !== null ? todayMissionCount + 1 : null;
      const missionCtx = currentMission !== null && currentMission > 1
        ? ` · ${esc(ordinal(currentMission))} mission`
        : '';
      areaTodayHtml = `<div class="rpc-area-today">${areaStr} already today${missionCtx}</div>`;
    }
  }

  // ── Progress bar ──
  let progressHtml = '';
  if (vacState === 'cleaning' && elapsedMin !== null) {
    const pct = Math.min((elapsedMin / estimatedTotal) * 100, 95);
    progressHtml = `<div class="rpc-progress-track"><div class="rpc-progress-fill" style="width:${pct}%"></div></div>`;
  }

  // ── In-mission metrics ──
  let metricsHtml = '';
  if (vacState === 'cleaning') {
    const parts: string[] = [];

    if (elapsedMin !== null) {
      const remaining = Math.max(0, Math.round(estimatedTotal - elapsedMin));
      parts.push(`<div class="rpc-metric"><span class="rpc-metric-val">~${remaining} min</span><span class="rpc-metric-lbl">Remaining</span></div>`);
    }

    if (caps.hasArea && missionArea !== null) {
      parts.push(`<div class="rpc-metric"><span class="rpc-metric-val">${formatArea(missionArea, unit, isMetric)}</span><span class="rpc-metric-lbl">Cleaned</span></div>`);

      if (!isNaN(avgArea) && avgArea > 0) {
        const missionCount30 = parseFloat(st(hass, `sensor.${n}_mission_count_30d`));
        if (!isNaN(missionCount30) && missionCount30 >= 5) {
          const delta  = Math.round(((missionArea - avgArea) / avgArea) * 100);
          const sign   = delta >= 0 ? '▲' : '▼';
          const cls    = delta >= 0 ? 'rpc-delta-up' : 'rpc-delta-down';
          parts.push(`<div class="rpc-metric"><span class="rpc-metric-val ${cls}">${sign} ${Math.abs(delta)}%</span><span class="rpc-metric-lbl">vs usual</span></div>`);
        }
      }
    }

    if (parts.length) metricsHtml = `<div class="rpc-metrics-row">${parts.join('')}</div>`;
  }

  // ── Docked: last cleaned hint from mission history (F1) ──
  let dockedHtml = '';
  if (vacState === 'docked' && !isRecharging) {
    // Prefer history data (accurate started_at) over entity last_changed (less precise)
    const lastCleaned = lastCleanedAgo(props.missionData, hass.language);
    if (lastCleaned) {
      dockedHtml = `<div class="rpc-docked-since">Last cleaned: ${lastCleaned}</div>`;
    } else {
      const lastChanged = hass.states[entityId]?.last_changed;
      if (lastChanged) dockedHtml = `<div class="rpc-docked-since">Last mission: ${timeSince(lastChanged, hass.language)}</div>`;
    }

    // F1: Demand-blocked indicator — floor needs cleaning but robot can't run yet
    if (caps.hasDemandBlocked) {
      const demandBlockedId = `binary_sensor.${robotName}_demand_clean_blocked`;
      if (hass.states[demandBlockedId]?.state === 'on') {
        dockedHtml += `<div class="rpc-demand-blocked">🧹 Floor needs cleaning — waiting for home to be empty</div>`;
      }
    }
  }

  // ── Quick action buttons ──
  const spinnerSvg = `<svg class="rpc-spinner" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="3" stroke-dasharray="31 63"/></svg>`;

  const btn = (action: string, label: string, display: string): string => {
    const isLoading  = loadingAction === action;
    const isDisabled = unavailable || anyLoading;
    return `<button class="rpc-btn${isLoading ? ' rpc-btn-loading' : ''}"
      data-action="${action}"
      ${isDisabled ? 'disabled' : ''}
      aria-label="${label}">
      ${isLoading ? spinnerSvg : display}
    </button>`;
  };

  let buttons = '';
  if (vacState === 'cleaning' || missionPhase === 'evac') {
    buttons = btn('pause', 'Pause', '⏸ Pause') + btn('return_home', 'Return home', '↩ Return home');
  } else if (vacState === 'paused') {
    buttons = btn('resume', 'Resume', '▶ Resume') + btn('return_home', 'Return home', '↩ Return home');
  } else if (isRecharging) {
    // Mid-mission recharge: mission is still live — offer pause/cancel, not Start
    buttons = btn('return_home', 'Cancel mission', '✕ Cancel mission');
  } else if (vacState !== 'returning' && !unavailable) {
    buttons = btn('start', 'Start', '▶ Start') + btn('locate', 'Locate', '⊙ Locate');
  }

  // F3b: when show_rooms:false, repeat-last joins the action button row; settings renders below
  const showRooms = config.show_rooms !== false;
  if (!showRooms) {
    const repeatEntity = hass.states[`button.${robotName}_repeat_mission`];
    const canRepeat    = !!repeatEntity && repeatEntity.state !== 'unavailable';
    if (canRepeat) {
      buttons += `<button class="rpc-btn-text" data-action="repeat-last">↩ Repeat last</button>`;
    }
  }

  const relocatedSettings = !showRooms
    ? renderSettingsPanel(hass, config, robotName, settingsPanelOpen, true)
    : '';

  return `
    <div class="rpc-zone rpc-zone1${extraClass ? ' ' + extraClass : ''}">
      <div class="rpc-robot-identity">
        <span class="rpc-robot-icon">${robotIcon}</span>
        <span class="rpc-robot-name">${friendlyName}</span>
      </div>
      <div class="rpc-state-row">
        <span class="rpc-state-dot rpc-state-${vacState}">${stateDot}</span>
        <span class="rpc-state-label">${stateLabel}</span>
      </div>
      ${areaTodayHtml}
      ${errorHtml}
      ${progressHtml}
      ${metricsHtml}
      ${dockedHtml}
      ${buttons ? `<div class="rpc-actions">${buttons}</div>` : ''}
      ${relocatedSettings}
    </div>
  `;
}
