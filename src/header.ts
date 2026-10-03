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
import { esc, timeSince, formatState, areaSqftFromEntity, isMetricSystem } from './utils.js';
import { PHASE, STATION_PHASES, OFFLINE_PHASES } from './slugs.js';
import { trackerId, zoneSelectMapAttr } from './entity-ids.js';
import { mdiToEmoji } from './const.js';
import { t, resolveLang } from './i18n/index.js';

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
  /** v2.1.0: entity ID of the currently displayed robot. In multi-robot mode
   *  this differs from config.entity; the header must read state from the
   *  active robot, not the configured default. Optional for back-compat —
   *  falls back to config.entity when not supplied. */
  activeRobot?: string;
  /** v2.5.0: whether "Start selected rooms" is currently in flight.
   *  Deliberately a SEPARATE flag from loadingAction — runCleanSelected()
   *  already tracked this state (isSendingClean) for the ⚙ tab's own
   *  room-targeting button (room-selector-zone.ts), but the header's
   *  "Start selected rooms" button (rendered via the generic btn() helper,
   *  which only checks loadingAction) never received it, so it silently
   *  showed no sending-in-progress state at all. */
  isSendingClean: boolean;
  /** v2.5.0: error message from a failed/timed-out clean_room call (same
   *  source runCleanSelected() already sets for the ⚙ tab's own button —
   *  same bug class as isSendingClean above: never reached the header, so
   *  a failure while the user was on any OTHER tab showed nothing at all
   *  where they were actually looking. */
  sendError: string | null;
}

function st(hass: HomeAssistant, entityId: string): string {
  return hass.states[entityId]?.state ?? 'unavailable';
}

function formatArea(sqft: number, unit: 'auto' | 'sqft' | 'm2', isMetric: boolean): string {
  const useMetric = unit === 'm2' || (unit === 'auto' && isMetric);
  if (useMetric) return `${Math.round(sqft * 0.0929)} m²`;
  // v2.5.0: rounded — a sensor reported in m² arrives here converted
  // (areaSqftFromEntity) and would otherwise print 12 decimals.
  return `${Math.round(sqft)} ft²`;
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
  const { hass, config, caps, robotName, loadingAction, todayMissionCount, roomPickerOpen, selectedRoomCount, isSendingClean, sendError } = props;
  const lang = resolveLang(hass.language);
  // v2.1.0 B1-class fix: read state from the active robot, not config.entity
  // (which is always the first/default robot in multi-robot mode).
  const entityId = props.activeRobot ?? config.entity;
  const vacState = (st(hass, entityId)) as VacuumState;
  const attrs = hass.states[entityId]?.attributes ?? {};
  const isMetric = isMetricSystem(hass);
  const unit = config.area_unit ?? 'auto';
  const unavailable = vacState === 'unavailable';
  // v2.5.0: includes isSendingClean so "Start selected rooms" (and any
  // other header button, though only one renders per state) is disabled
  // for the duration of the clean_room service call, not just visually
  // spinning — matches the ⚙ tab's own room-targeting button, which
  // already disables on `isSending`.
  const anyLoading = loadingAction !== null || isSendingClean;
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
  // v2.5.0 F2: the phase sensor reports slugs (integration ≥ 4.1). The
  // header still owns its own wording for its core states; station work
  // (pad wash/dry, tank refill) is shown in the INTEGRATION's text (P3).
  const isOfflinePhase  = OFFLINE_PHASES.has(missionPhase);
  const isStationPhase  = STATION_PHASES.has(missionPhase);
  const isEmptyingBin   = missionPhase === PHASE.EMPTYING_BIN;
  const missionActiveRaw  = hass.states[`binary_sensor.${n}_mission_active`]?.state ?? '';
  const isMissionActive   = missionActiveRaw === 'on';
  const hasMissionActive  = caps.hasMissionActive;

  const expireRaw  = hass.states[`sensor.${n}_mission_expire_time`]?.state ?? '';
  const expireDate = expireRaw && expireRaw !== 'unavailable' && expireRaw !== 'unknown'
    ? new Date(expireRaw) : null;
  const hasETA     = !!expireDate && !isNaN(expireDate.getTime()) && expireDate > new Date();
  const resumeMin  = hasETA ? Math.max(1, Math.round((expireDate!.getTime() - Date.now()) / 60000)) : null;

  let isRecharging = false;
  if (missionPhase === PHASE.CHARGING_MID_MISSION && vacState === 'docked') {
    // v2.5.0 F2: the integration says so directly since 4.x — no inference.
    isRecharging = true;
  } else if (hasMissionActive) {
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
      rechargeLineHtml = `<div class="rpc-recharge-line">⚡ ${t(lang, 'header.rechargeLine', { min: Math.round(rechargeMin) })}</div>`;
    }
  }

  // ── State label ──
  let stateDot = '';
  let stateLabel = '';
  let extraClass = '';

  if (isOfflinePhase && vacState !== 'unavailable' && vacState !== 'error') {
    // v2.5.0 F2: the integration has heard nothing from the robot (an hour
    // of silence → `no_contact`). The vacuum entity may still show its last
    // state; saying "Docked" about a robot nobody has heard from is the
    // field report this phase exists for.
    stateDot   = '—';
    stateLabel = t(lang, 'header.stateNoContact');
    extraClass = 'rpc-offline-state';
  } else if (isEmptyingBin) {
    stateDot   = '⬆';
    stateLabel = t(lang, 'header.stateEmptyingBin');
  } else if (isStationPhase && vacState !== 'cleaning' && vacState !== 'error') {
    stateDot   = '⟳';
    stateLabel = esc(formatState(hass, `sensor.${n}_phase`));
  } else if (isRecharging) {
    stateDot   = '⚡';
    stateLabel = resumeMin !== null
      ? t(lang, 'header.stateRechargingResuming', { min: resumeMin })
      : t(lang, 'header.stateRechargingContinues');
  } else {
    switch (vacState) {
      case 'cleaning':    stateDot = '●'; stateLabel = isMop ? t(lang, 'header.stateMopping') : t(lang, 'header.stateCleaning'); break;
      case 'paused':      stateDot = '⏸'; stateLabel = t(lang, 'header.statePaused');                                        break;
      case 'returning':   stateDot = '↩'; stateLabel = t(lang, 'header.stateReturning');                                     break;
      case 'docked':      stateDot = '✓'; stateLabel = t(lang, 'header.stateDocked');                                        break;
      case 'idle':        stateDot = '○'; stateLabel = t(lang, 'header.stateIdle');                                          break;
      case 'error':       stateDot = '⚠'; stateLabel = t(lang, 'header.stateError'); extraClass = 'rpc-error-state';        break;
      case 'unavailable': stateDot = '—'; stateLabel = t(lang, 'header.stateUnavailable');                                   break;
    }
  }

  // ── Error details ──
  let errorHtml = '';
  if (vacState === 'error') {
    const errEntity = hass.states[errorSensor];
    if (errEntity && errEntity.state !== '0' && errEntity.state !== '' && errEntity.state !== 'unavailable') {
      const desc   = esc((errEntity.attributes.description as string) ?? t(lang, 'header.unknownError'));
      const action = esc((errEntity.attributes.action   as string) ?? '');
      const zone   = st(hass, errorZoneSensor);
      const hasZone = zone && zone !== 'unknown' && zone !== 'unavailable';
      stateLabel = t(lang, 'header.errorLabel', { code: esc(errEntity.state), desc });
      errorHtml  = `
        ${action ? `<div class="rpc-error-action">${action}</div>` : ''}
        ${hasZone ? `<div class="rpc-error-zone">${t(lang, 'header.errorZone', { zone: esc(zone) })}</div>` : ''}
      `;
    } else {
      stateLabel = t(lang, 'header.robotErrorCheckApp');
    }
  }

  // ── Area-today context line ──
  let areaTodayHtml = '';
  const missionInProgress = hasMissionActive
    ? isMissionActive
    : (vacState === 'cleaning' || isRecharging);
  if (missionInProgress && caps.hasArea) {
    // v2.5.0: honour the sensor's unit (m² since integration 4.x).
    const todayAreaRaw = areaSqftFromEntity(hass.states[areaCleanedToday]);
    if (!isNaN(todayAreaRaw) && todayAreaRaw > 0) {
      const areaStr = formatArea(todayAreaRaw, unit, isMetric);
      const currentMission = todayMissionCount !== null ? todayMissionCount + 1 : null;
      const missionCtx = currentMission !== null && currentMission > 1
        ? ` · ${t(lang, 'header.missionOrdinalSuffix', { ordinal: esc(ordinal(currentMission)) })}`
        : '';
      areaTodayHtml = `<div class="rpc-area-today">${t(lang, 'header.areaAlreadyToday', { area: areaStr, missionCtx })}</div>`;
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
        // v2.2.0 — recharge-aware duration (mission_duration_min/recharge_min,
        // integration ≥ 2.8.6; flagged as a header opportunity in the v2.0
        // plan, deliberately deferred then). Only shown when recharge_min > 0:
        // a 156-minute mission reads very differently once it's visible that
        // 42 of those minutes were charging, not struggling. Total duration is
        // shown WITH its charging share, never as bare wall-clock alone —
        // the pair is the honest number; either alone misleads.
        const durationMin = mp?.attributes?.mission_duration_min;
        const rechargeMin = mp?.attributes?.recharge_min;
        if (typeof durationMin === 'number' && typeof rechargeMin === 'number' && rechargeMin > 0) {
          parts.push(t(lang, 'header.durationWithRecharge', { duration: Math.round(durationMin), recharge: Math.round(rechargeMin) }));
        }
        spatialLineHtml = `<div class="rpc-spatial-line">${parts.join(' · ')}</div>`;
      }
    } else {
      const missionDest = attrs.mission_destination as string | undefined;
      if (missionDest) {
        spatialLineHtml = `<div class="rpc-spatial-line">→ ${t(lang, 'header.targeting', { room: esc(missionDest) })}</div>`;
      }
    }
  }

  // ── In-mission metrics ──
  let metricsHtml = '';
  if (vacState === 'cleaning') {
    const parts: string[] = [];

    if (elapsedMin !== null) {
      const remaining = Math.max(0, Math.round(estimatedTotal - elapsedMin));
      parts.push(`<div class="rpc-metric"><span class="rpc-metric-val">~${remaining} min</span><span class="rpc-metric-lbl">${t(lang, 'header.metricRemaining')}</span></div>`);
    }

    if (caps.hasArea && missionArea !== null) {
      parts.push(`<div class="rpc-metric"><span class="rpc-metric-val">${formatArea(missionArea, unit, isMetric)}</span><span class="rpc-metric-lbl">${t(lang, 'header.metricCleaned')}</span></div>`);

      // v2.5.0: analytics area is m² (cloud) — compare like with like.
      const recentAreaRaw    = areaSqftFromEntity(hass.states[`sensor.${n}_cleaning_analytics_30d`]);
      const missionCount30   = parseFloat(st(hass, `sensor.${n}_missions_last_30d`));
      const avgArea = (!isNaN(recentAreaRaw) && !isNaN(missionCount30) && missionCount30 >= 5)
        ? recentAreaRaw / missionCount30
        : NaN;

      if (!isNaN(avgArea) && avgArea > 0) {
        const delta  = Math.round(((missionArea - avgArea) / avgArea) * 100);
        const sign   = delta >= 0 ? '▲' : '▼';
        const cls    = delta >= 0 ? 'rpc-delta-up' : 'rpc-delta-down';
        parts.push(`<div class="rpc-metric"><span class="rpc-metric-val ${cls}">${sign} ${Math.abs(delta)}%</span><span class="rpc-metric-lbl">${t(lang, 'header.metricVsUsual')}</span></div>`);
      }
    }

    if (parts.length) metricsHtml = `<div class="rpc-metrics-row">${parts.join('')}</div>`;
  }

  // ── Docked: last cleaned hint ──
  let dockedHtml = '';
  if (vacState === 'docked' && !isRecharging) {
    const lastCleaned = lastCleanedAgo(props.missionData, hass.language);
    if (lastCleaned) {
      dockedHtml = `<div class="rpc-docked-since">${t(lang, 'header.lastCleaned', { time: lastCleaned })}</div>`;
    } else {
      const lastChanged = hass.states[entityId]?.last_changed;
      if (lastChanged) dockedHtml = `<div class="rpc-docked-since">${t(lang, 'header.lastMission', { time: timeSince(lastChanged, hass.language) })}</div>`;
    }
  }

  // ── Demand cleaning blocked ──
  let demandHtml = '';
  if (caps.hasDemandBlocked) {
    if (hass.states[`binary_sensor.${n}_demand_clean_blocked`]?.state === 'on') {
      demandHtml = `<div class="rpc-demand-blocked">🧹 ${t(lang, 'header.demandBlocked')}</div>`;
    }
  }

  // ── Last cleaned rooms chip row ──
  let cleanedRoomsHtml = '';
  if (caps.hasCleanedRooms && (vacState === 'docked' || vacState === 'idle') && !isRecharging) {
    const rooms      = attrs.last_cleaned_rooms as string[] | undefined;
    // v2.5.0: region_icons lives on the zone select, never on the vacuum
    // (the vacuum attribute read here never existed — icons never showed).
    const regionIcons = zoneSelectMapAttr<string>(hass, n, 'region_icons');
    if (rooms && rooms.length > 0) {
      const chips = rooms.map(name => {
        const mdi  = regionIcons[name];
        const icon = mdiToEmoji(mdi);
        return `<span class="rpc-cleaned-chip">${icon ? icon + '\u00a0' : ''}${esc(name)}</span>`;
      }).join('');
      cleanedRoomsHtml = `<div class="rpc-cleaned-rooms">${chips}</div>`;
    }
  }

  // ── v2.1.0 A1 — connectivity indicator ──────────────────────────────────
  // Visible only when degraded: cloud disconnected OR MQTT stale. Invisible in
  // the normal connected state (no chrome for the happy path).
  // Verified against integration v3.0.0: both are binary_sensors.
  //   binary_sensor.*_cloud_connected — ON = connected (CONNECTIVITY class)
  //   binary_sensor.*_mqtt_stale       — ON = stale/problem (PROBLEM class)
  let connectivityHtml = '';
  if (caps.hasConnectivity) {
    const cloudConnected = hass.states[`binary_sensor.${n}_cloud_connected`]?.state;
    const mqttStale      = hass.states[`binary_sensor.${n}_mqtt_stale`]?.state;
    const cloudDown = cloudConnected === 'off';
    const mqttDown  = mqttStale === 'on';
    if (cloudDown || mqttDown) {
      const label = mqttDown ? t(lang, 'header.connectivityRobotOffline') : t(lang, 'header.connectivityCloudOffline');
      connectivityHtml = `<span class="rpc-connectivity rpc-connectivity-degraded" title="${esc(label)}">☁ ${esc(label)}</span>`;
    }
  }

  // ── v2.1.0 A2 — firmware badge ──────────────────────────────────────────
  // Shown briefly after a firmware change: the integration exposes the version
  // string; we surface it for 24h after the entity's last_changed, then hide.
  let firmwareHtml = '';
  if (caps.hasFirmware) {
    const fw = hass.states[`sensor.${n}_firmware_version`];
    const ver = fw?.state;
    if (ver && ver !== 'unavailable' && ver !== 'unknown') {
      const changed = fw?.last_changed ? new Date(fw.last_changed).getTime() : 0;
      const within24h = changed > 0 && (Date.now() - changed) < 24 * 60 * 60 * 1000;
      if (within24h) {
        firmwareHtml = `<span class="rpc-firmware-badge" title="${t(lang, 'header.firmwareUpdatedTitle')}">⬆ FW ${esc(ver)}</span>`;
      }
    }
  }

  // ── v2.1.0 A4 — current-room line (active mission) ───────────────────────
  // Verified against integration v3.0.0: the room is the device_tracker's
  // STATE (location_name), not an attribute. The state is always non-null —
  // it returns a localized "Docked" label (en: "Docked", de: "Angedockt")
  // when not cleaning and a localized active-fallback label (en: "Cleaning",
  // de: "Unterwegs") when cleaning but the room is unknown. We render only a
  // real room name, filtering those four sentinel labels.
  //
  // On SMART robots this delegates to the SAME resolver as mission_progress's
  // current_room, which spatialLineHtml already shows — so we suppress A4 when
  // the spatial line already rendered a room, to avoid a duplicate line.
  //
  // v2.5.0 F4: the tracker is device_tracker.{n} (entity-ids.ts), and the
  // room is read from its structured `room` attribute — present only while
  // a mission runs and a room is resolved — instead of filtering display
  // labels out of the state. The state is a localized display string with
  // labels in 8 languages ("Docked", "Angedockt", "Stuck", "Dock busy", …);
  // a sentinel list could never keep up, and a missed label was shown as a
  // room name. The state is used only as a last resort for a user-renamed
  // `_position` tracker on integrations that predate the attribute.
  let currentRoomHtml = '';
  const A4_SENTINELS = new Set(['Docked', 'Angedockt', 'Cleaning', 'Unterwegs', 'unknown', 'unavailable']);
  const spatialAlreadyShowsRoom = spatialLineHtml !== '';
  const tracker = trackerId(hass, n);
  if (caps.hasPositionTracker && tracker && !spatialAlreadyShowsRoom &&
      (vacState === 'cleaning' || (hasMissionActive && isMissionActive))) {
    const tState = hass.states[tracker];
    const attrRoom = tState?.attributes?.room;
    let room: string | null = null;
    if (typeof attrRoom === 'string' && attrRoom.trim() !== '') {
      room = attrRoom;
    } else if (attrRoom === undefined && tracker.endsWith('_position')) {
      const legacy = tState?.state;
      room = legacy && !A4_SENTINELS.has(legacy) ? legacy : null;
    }
    if (room) {
      currentRoomHtml = `<div class="rpc-current-room">📍 ${esc(room)}</div>`;
    }
  }

  const spinnerSvg = `<svg class="rpc-spinner" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="3" stroke-dasharray="31 63"/></svg>`;

  const btn = (action: string, label: string, display: string): string => {
    // v2.5.0: "clean-selected" tracks its own sending state (isSendingClean)
    // separately from the generic loadingAction system every other button
    // here uses — runCleanSelected() never set loadingAction, so this
    // button silently never showed a spinner until this was wired in.
    const isLoading  = loadingAction === action || (action === 'clean-selected' && isSendingClean);
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

  if (vacState === 'cleaning') {
    buttons = btn('pause', t(lang, 'header.pause'), `⏸ ${t(lang, 'header.pause')}`) + btn('return_home', t(lang, 'header.returnHome'), `🏠 ${t(lang, 'header.returnHome')}`);
  } else if (vacState === 'paused') {
    buttons = btn('resume', t(lang, 'header.resume'), `▶ ${t(lang, 'header.resume')}`)
            + btn('return_home', t(lang, 'header.returnHome'), `🏠 ${t(lang, 'header.returnHome')}`)
            + btn('stop', t(lang, 'header.stop'), `⏹ ${t(lang, 'header.stop')}`);
  } else if (vacState === 'error') {
    buttons = btn('return_home', t(lang, 'header.returnHome'), `🏠 ${t(lang, 'header.returnHome')}`) + btn('retry', t(lang, 'header.retry'), `🔄 ${t(lang, 'header.retry')}`);
  } else if (isEmptyingBin) {
    // v2.5.0 F2: the dock is emptying the bin (10–20 s, robot on the dock;
    // the vacuum entity reports `returning`). No action is meaningful in
    // that window — "Return home" to a docked robot, or "Start" mid-evac,
    // would both mislead. The pre-2.5.0 branch here (pause/return) never
    // ran: it compared against the raw `evac`.
  } else if (isRecharging) {
    buttons = btn('return_home', t(lang, 'header.cancelMission'), `✕ ${t(lang, 'header.cancelMission')}`);
  } else if (vacState !== 'returning' && !unavailable) {
    if (selectedRoomCount > 0) {
      // v2.0 C7-ROOM-BOUNDS: selection active (via header chip picker or
      // Map tab tap-to-select) — single action replaces Start + Rooms….
      const label = t(lang, 'header.startSelectedRooms', { count: selectedRoomCount });
      buttons = btn('clean-selected', t(lang, 'header.startSelectedRoomsLabel'), `▶ ${label}`);
    } else {
      const startLabel = demandBlocked ? `▶ ${t(lang, 'header.startAnyway')}` : `▶ ${t(lang, 'header.startFullClean')}`;
      buttons = btn('start', t(lang, 'header.startFullClean'), startLabel);
      // "Rooms…" is hidden in companion mode — XVMC owns room selection there.
      // v2.0.2 bug fix: this button opens the multi-select chip picker that
      // calls roomba_plus.clean_room — hard-blocked for non-SMART robots
      // (see room-selector-zone.ts for the full explanation). Was gated on
      // caps.hasZones, which is also true for EPHEMERAL's zone_select
      // entity even though that tier's zone-cleaning model is select +
      // a separate button, not multi-select + clean_room.
      if (config.mode !== 'companion' && caps.hasSmartZones) {
        buttons += `<button class="rpc-btn" data-action="toggle-room-picker" aria-expanded="${roomPickerOpen}">
          🗺 ${t(lang, 'header.roomsEllipsis')}
        </button>`;
      }
    }
  }

  return `
    <div class="rpc-header${extraClass ? ' ' + extraClass : ''}">
      <div class="rpc-robot-identity">
        <span class="rpc-robot-icon">${robotIcon}</span>
        <span class="rpc-robot-name">${friendlyName}</span>
        ${firmwareHtml}
        ${connectivityHtml}
      </div>
      <div class="rpc-state-row">
        <span class="rpc-state-dot rpc-state-${vacState}">${stateDot}</span>
        <span class="rpc-state-label">${stateLabel}</span>
      </div>
      ${areaTodayHtml}
      ${errorHtml}
      ${progressHtml}
      ${spatialLineHtml}
      ${currentRoomHtml}
      ${rechargeLineHtml}
      ${metricsHtml}
      ${dockedHtml}
      ${demandHtml}
      ${cleanedRoomsHtml}
      ${buttons ? `<div class="rpc-actions">${buttons}</div>` : ''}
      ${sendError ? `<div class="rpc-send-error">${esc(sendError)}</div>` : ''}
    </div>
  `;
}
