/**
 * header.ts — v2.0 persistent header.
 *
 * Replaces the old Status zone's role as a stacked zone with an always-
 * visible header shown above the tab bar regardless of active tab.
 *
 * Design principle (v2.0 plan): never show a static row of all possible
 * buttons. Render only the buttons that are meaningful for the current
 * robot state — maximum two, except Paused which gets three. Verbs are
 * always explicit ("Return home", not "Home").
 *
 * F11 (mission_destination) and C3-PROGRESS (mission_progress sensor) are
 * merged into a single spatial line here, rather than rendered as two
 * separate lines as the original incremental plan would have produced.
 */
import { HomeAssistant, CardConfig, RobotCapabilities, DaySummary } from './types.js';
import { esc, timeSince } from './utils.js';
import { MDI_TO_EMOJI } from './const.js';

type VacuumState = 'cleaning' | 'paused' | 'returning' | 'docked' | 'idle' | 'error' | 'unavailable';

export interface HeaderProps {
  hass: HomeAssistant;
  config: CardConfig;
  caps: RobotCapabilities;
  robotName: string;
  loadingAction: string | null;
  todayMissionCount: number | null;
  missionData: DaySummary[] | null;
  /** v2.0: whether the inline room picker (header "Rooms…" expansion) is open */
  roomPickerOpen: boolean;
  /** v2.0 C7-ROOM-BOUNDS: count of rooms currently selected via the header
   *  chip picker or Map tab tap-to-select. When > 0 while docked, the
   *  header button swaps from "Start full clean" / "Rooms…" to a single
   *  "Start selected rooms" action. */
  selectedRoomCount: number;
}

function st(hass: HomeAssistant, entityId: string): string {
  return hass.states[entityId]?.state ?? 'unavailable';
}

function formatArea(sqft: number, unit: 'auto' | 'sqft' | 'm2', isMetric: boolean): string {
  const useMetric = unit === 'm2' || (unit === 'auto' && isMetric);
  if (useMetric) return `${Math.round(sqft * 0.0929)} m²`;
  return `${sqft} ft²`;
}

/** F1: "X ago" for the most recent completed mission. */
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

export function renderHeader(props: HeaderProps): string {
  const { hass, config, caps, robotName, loadingAction, todayMissionCount, roomPickerOpen, selectedRoomCount } = props;
  const entityId = config.entity;
  const vacState = (st(hass, entityId)) as VacuumState;
  const attrs = hass.states[entityId]?.attributes ?? {};
  const isMetric = hass.config?.unit_system?.length === 'm';
  const unit = config.area_unit ?? 'auto';
  const unavailable = vacState === 'unavailable';
  const anyLoading = loadingAction !== null;
  const n = robotName;

  const errorSensor        = `sensor.${n}_last_error_code`;
  const errorZoneSensor    = `sensor.${n}_last_error_zone`;
  const rechargeTimeSensor = `sensor.${n}_mission_recharge_time`;
  const avgDurationSensor  = `sensor.${n}_average_mission_time`;
  const areaCleanedToday   = `sensor.${n}_area_cleaned_today`;

  const elapsedMin     = (attrs.mission_elapsed_min as number | null) ?? null;
  const missionArea    = (attrs.mission_area_sqft as number | null) ?? null;
  const avgDurRaw      = parseFloat(st(hass, avgDurationSensor));
  const estimatedTotal = isNaN(avgDurRaw) || avgDurRaw <= 0 ? 45 : avgDurRaw;

  const isMop      = caps.isMop;
  const robotIcon  = isMop ? '🧹' : '🤖';
  const friendlyName = esc((attrs.friendly_name as string) ?? entityId);

  const missionPhase      = hass.states[`sensor.${n}_phase`]?.state ?? '';
  const missionActiveRaw  = hass.states[`binary_sensor.${n}_mission_active`]?.state ?? '';
  const isMissionActive   = missionActiveRaw === 'on';
  const hasMissionActive  = caps.hasMissionActive;

  const expireRaw  = hass.states[`sensor.${n}_mission_expire_time`]?.state ?? '';
  const expireDate = expireRaw && expireRaw !== 'unavailable' && expireRaw !== 'unknown'
    ? new Date(expireRaw) : null;
  const hasETA     = !!expireDate && !isNaN(expireDate.getTime()) && expireDate > new Date();
  const resumeMin  = hasETA ? Math.max(1, Math.round((expireDate!.getTime() - Date.now()) / 60000)) : null;

  let isRecharging = false;
  if (hasMissionActive) {
    isRecharging = vacState === 'docked' && isMissionActive;
  } else {
    const rechargeState = st(hass, rechargeTimeSensor);
    const rechargeValid = rechargeState !== 'unavailable' && rechargeState !== 'unknown'
                       && expireRaw      !== 'unavailable' && expireRaw      !== 'unknown';
    isRecharging = vacState === 'docked' && rechargeValid && hasETA;
  }

  // ── v2.0 mid-mission recharge line (mission_duration_min / recharge_min) ──
  // New attributes on mission_progress (v2.8.6). When mid-recharge, show
  // elapsed recharge time inline rather than letting the percentage stall
  // silently — the header opportunity flagged in the v2.0 plan.
  let rechargeLineHtml = '';
  if (isRecharging && caps.hasMissionProgressSensor) {
    const mp = hass.states[`sensor.${n}_mission_progress`];
    const rechargeMin = mp?.attributes?.recharge_min;
    if (typeof rechargeMin === 'number') {
      rechargeLineHtml = `<div class="rpc-recharge-line">⚡ Recharging · ${Math.round(rechargeMin)} min</div>`;
    }
  }

  // ── State label ──
  let stateDot = '';
  let stateLabel = '';
  let extraClass = '';

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

  // ── Error details ──
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

  // ── Area-today context line ──
  let areaTodayHtml = '';
  const missionInProgress = hasMissionActive
    ? isMissionActive
    : (vacState === 'cleaning' || isRecharging);
  if (missionInProgress && caps.hasArea) {
    const todayAreaRaw = parseFloat(st(hass, areaCleanedToday));
    if (!isNaN(todayAreaRaw) && todayAreaRaw > 0) {
      const areaStr = formatArea(todayAreaRaw, unit, isMetric);
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

  // ── v2.0: unified spatial line — merges F11 mission_destination and
  // C3-PROGRESS mission_progress into one line instead of two. When the
  // mission_progress sensor is present, it drives the line (current room +
  // percentage); mission_destination (final room) is NOT duplicated here —
  // it belongs in the ⚙ tab's mission panel per the v2.0 plan. When the
  // sensor is absent (EPHEMERAL, no cloud, pre-2.6.0 integration), fall back
  // to the old destination-only line.
  let spatialLineHtml = '';
  if (vacState === 'cleaning') {
    if (caps.hasMissionProgressSensor) {
      const mp = hass.states[`sensor.${n}_mission_progress`];
      const currentRoom = mp?.attributes?.current_room as string | undefined;
      const progressPct = mp && mp.state !== 'unavailable' && mp.state !== 'unknown'
        ? parseFloat(mp.state) : NaN;
      if (currentRoom || !isNaN(progressPct)) {
        const parts: string[] = [];
        if (currentRoom) parts.push(esc(currentRoom));
        if (!isNaN(progressPct)) parts.push(`${Math.round(progressPct)}%`);
        spatialLineHtml = `<div class="rpc-spatial-line">${parts.join(' · ')}</div>`;
      }
    } else {
      const missionDest = attrs.mission_destination as string | undefined;
      if (missionDest) {
        spatialLineHtml = `<div class="rpc-spatial-line">→ Targeting: ${esc(missionDest)}</div>`;
      }
    }
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

      const recentAreaRaw    = parseFloat(st(hass, `sensor.${n}_cleaning_analytics_30d`));
      const missionCount30   = parseFloat(st(hass, `sensor.${n}_missions_last_30d`));
      const avgArea = (!isNaN(recentAreaRaw) && !isNaN(missionCount30) && missionCount30 >= 5)
        ? recentAreaRaw / missionCount30
        : NaN;

      if (!isNaN(avgArea) && avgArea > 0) {
        const delta  = Math.round(((missionArea - avgArea) / avgArea) * 100);
        const sign   = delta >= 0 ? '▲' : '▼';
        const cls    = delta >= 0 ? 'rpc-delta-up' : 'rpc-delta-down';
        parts.push(`<div class="rpc-metric"><span class="rpc-metric-val ${cls}">${sign} ${Math.abs(delta)}%</span><span class="rpc-metric-lbl">vs usual</span></div>`);
      }
    }

    if (parts.length) metricsHtml = `<div class="rpc-metrics-row">${parts.join('')}</div>`;
  }

  // ── Docked: last cleaned hint ──
  let dockedHtml = '';
  if (vacState === 'docked' && !isRecharging) {
    const lastCleaned = lastCleanedAgo(props.missionData, hass.language);
    if (lastCleaned) {
      dockedHtml = `<div class="rpc-docked-since">Last cleaned: ${lastCleaned}</div>`;
    } else {
      const lastChanged = hass.states[entityId]?.last_changed;
      if (lastChanged) dockedHtml = `<div class="rpc-docked-since">Last mission: ${timeSince(lastChanged, hass.language)}</div>`;
    }
  }

  // ── Demand cleaning blocked ──
  let demandHtml = '';
  if (caps.hasDemandBlocked) {
    if (hass.states[`binary_sensor.${n}_demand_clean_blocked`]?.state === 'on') {
      demandHtml = `<div class="rpc-demand-blocked">🧹 Floor needs cleaning — waiting for home to be empty</div>`;
    }
  }

  // ── Last cleaned rooms chip row ──
  let cleanedRoomsHtml = '';
  if (caps.hasCleanedRooms && (vacState === 'docked' || vacState === 'idle') && !isRecharging) {
    const rooms      = attrs.last_cleaned_rooms as string[] | undefined;
    const regionIcons = attrs.region_icons as Record<string, string> | undefined;
    if (rooms && rooms.length > 0) {
      const chips = rooms.map(name => {
        const mdi  = regionIcons?.[name];
        const icon = mdi ? (MDI_TO_EMOJI[mdi] ?? '') : '';
        return `<span class="rpc-cleaned-chip">${icon ? icon + '\u00a0' : ''}${esc(name)}</span>`;
      }).join('');
      cleanedRoomsHtml = `<div class="rpc-cleaned-rooms">${chips}</div>`;
    }
  }

  // ── v2.0: state-contextual buttons — max 2 (3 for Paused) ──
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
  // Demand-blocked + docked: "Start anyway" is the only meaningful action —
  // a plain "Start" alongside the blocked banner reads as contradictory.
  const demandBlocked = caps.hasDemandBlocked
    && hass.states[`binary_sensor.${n}_demand_clean_blocked`]?.state === 'on';

  if (vacState === 'cleaning' || missionPhase === 'evac') {
    buttons = btn('pause', 'Pause', '⏸ Pause') + btn('return_home', 'Return home', '🏠 Return home');
  } else if (vacState === 'paused') {
    buttons = btn('resume', 'Resume', '▶ Resume')
            + btn('return_home', 'Return home', '🏠 Return home')
            + btn('stop', 'Stop', '⏹ Stop');
  } else if (vacState === 'error') {
    buttons = btn('return_home', 'Return home', '🏠 Return home') + btn('retry', 'Retry', '🔄 Retry');
  } else if (isRecharging) {
    buttons = btn('return_home', 'Cancel mission', '✕ Cancel mission');
  } else if (vacState !== 'returning' && !unavailable) {
    if (selectedRoomCount > 0) {
      // v2.0 C7-ROOM-BOUNDS: selection active (via header chip picker or
      // Map tab tap-to-select) — single action replaces Start + Rooms….
      buttons = btn('clean-selected', 'Start selected rooms', `▶ Start ${selectedRoomCount} selected room${selectedRoomCount !== 1 ? 's' : ''}`);
    } else {
      const startLabel = demandBlocked ? '▶ Start anyway' : '▶ Start full clean';
      buttons = btn('start', 'Start full clean', startLabel);
      // "Rooms…" is hidden in companion mode — XVMC owns room selection there.
      // v2.0.2 bug fix: this button opens the multi-select chip picker that
      // calls roomba_plus.clean_room — hard-blocked for non-SMART robots
      // (see room-selector-zone.ts for the full explanation). Was gated on
      // caps.hasZones, which is also true for EPHEMERAL's zone_select
      // entity even though that tier's zone-cleaning model is select +
      // a separate button, not multi-select + clean_room.
      if (config.mode !== 'companion' && caps.hasSmartZones) {
        buttons += `<button class="rpc-btn" data-action="toggle-room-picker" aria-expanded="${roomPickerOpen}">
          🗺 Rooms…
        </button>`;
      }
    }
  }

  return `
    <div class="rpc-header${extraClass ? ' ' + extraClass : ''}">
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
      ${spatialLineHtml}
      ${rechargeLineHtml}
      ${metricsHtml}
      ${dockedHtml}
      ${demandHtml}
      ${cleanedRoomsHtml}
      ${buttons ? `<div class="rpc-actions">${buttons}</div>` : ''}
    </div>
  `;
}
