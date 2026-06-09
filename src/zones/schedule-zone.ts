import { HomeAssistant, CardConfig, RobotCapabilities } from '../types.js';
import { esc } from '../utils.js';

export interface ScheduleZoneState {
  holdTooltipVisible: boolean;
  holdToggling: boolean;
}

function formatNextClean(stateStr: string, locale: string): string {
  if (!stateStr || stateStr === 'unavailable' || stateStr === 'unknown') return 'No schedule set';
  try {
    const d = new Date(stateStr);
    return d.toLocaleDateString(locale, { weekday: 'short' }) + ' '
         + d.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit', hour12: false });
  } catch {
    return esc(stateStr);
  }
}

/** B2 — format a likely clean window timestamp as "Wed ~11:00" */
function formatLikelyWindow(stateStr: string, locale: string): string {
  if (!stateStr || stateStr === 'unavailable' || stateStr === 'unknown') return '';
  try {
    const d = new Date(stateStr);
    if (isNaN(d.getTime())) return '';   // Invalid Date — don't render "Invalid Date ~Invalid Date"
    const day  = d.toLocaleDateString(locale, { weekday: 'short' });
    const time = d.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit', hour12: false });
    return `${day} ~${time}`;
  } catch {
    return '';
  }
}

export function renderScheduleZone(
  hass: HomeAssistant,
  config: CardConfig,
  caps: RobotCapabilities,
  robotName: string,
  state: ScheduleZoneState
): string {
  if (config.show_schedule === false) return '';

  const n = robotName;
  const nextCleanEntity = hass.states[`sensor.${n}_next_clean`];
  const holdEntity      = hass.states[`binary_sensor.${n}_schedule_hold_active`];

  // B1/B2 sensors — presence scheduling (L6, v1.8+)
  const opportunitiesEntity = hass.states[`sensor.${n}_presence_clean_opportunities_7d`];
  const utilisationEntity   = hass.states[`sensor.${n}_presence_clean_utilisation_7d`];
  const likelyWindowEntity  = hass.states[`sensor.${n}_next_likely_clean_window`];

  const hasPresenceAnalytics = !!opportunitiesEntity && !!utilisationEntity
    && opportunitiesEntity.state !== 'unknown' && opportunitiesEntity.state !== 'unavailable'
    && utilisationEntity.state   !== 'unknown' && utilisationEntity.state   !== 'unavailable';

  const hasLikelyWindow = !!likelyWindowEntity
    && likelyWindowEntity.state !== 'unknown'
    && likelyWindowEntity.state !== 'unavailable';

  // Zone is absent only when there's nothing at all to show
  if (!nextCleanEntity && !holdEntity && !hasPresenceAnalytics && !hasLikelyWindow
      && !caps.hasOptimalWindow) return '';

  // ── Schedule hold badge ──
  let holdHtml = '';
  if (holdEntity) {
    const isHeld   = holdEntity.state === 'on';
    const source   = holdEntity.attributes.source as string;
    const presence = source === 'presence_manager';

    let badgeClass = 'rpc-badge-green';
    let badgeText  = 'Schedule active';
    let badgeIcon  = '';
    if (isHeld) {
      if (presence) { badgeClass = 'rpc-badge-blue';  badgeText = 'Away hold';   badgeIcon = '🏃'; }
      else          { badgeClass = 'rpc-badge-amber'; badgeText = 'Hold active'; badgeIcon = '🔒'; }
    }

    const spinnerSvg = `<svg class="rpc-spinner rpc-spinner-sm" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="3" stroke-dasharray="31 63"/></svg>`;
    holdHtml = `
      <button class="rpc-hold-badge ${badgeClass}"
              data-hold-action="${presence ? 'tooltip' : 'toggle'}"
              aria-label="${esc(badgeText)}">
        ${state.holdToggling ? spinnerSvg : `${badgeIcon} ${badgeText}`}
      </button>
      ${state.holdTooltipVisible ? `
        <div class="rpc-hold-tooltip" role="status">
          Schedule managed by presence automation — controlled automatically
        </div>` : ''}
    `;
  }

  // ── B2: Next likely clean window ──
  let likelyWindowHtml = '';
  if (hasLikelyWindow) {
    const formatted = formatLikelyWindow(likelyWindowEntity!.state, hass.language);
    if (formatted) {
      likelyWindowHtml = `
        <div class="rpc-next-clean rpc-next-clean--likely">
          <span class="rpc-schedule-label">Next likely window</span>
          <span class="rpc-schedule-time rpc-schedule-time--approx">${formatted}</span>
        </div>
      `;
    }
  }

  // ── F15: Optimal clean window (integration v2.4 F12a) ──
  // Analytically derived from cleaning history — marked with ★ to distinguish
  // from the presence-derived likely window.
  let optimalWindowHtml = '';
  if (caps.hasOptimalWindow) {
    const optEntity = hass.states[`sensor.${n}_optimal_clean_window`];
    if (optEntity && optEntity.state !== 'unavailable' && optEntity.state !== 'unknown') {
      const formatted = formatNextClean(optEntity.state, hass.language);
      if (formatted && formatted !== 'No schedule set') {
        optimalWindowHtml = `
          <div class="rpc-next-clean rpc-next-clean--optimal">
            <span class="rpc-schedule-label">Optimal window</span>
            <span class="rpc-schedule-time">
              ${formatted}
              <span class="rpc-optimal-star" title="Analytically derived from cleaning history">★</span>
            </span>
          </div>`;
      }
    }
  }

  // ── Presence dots ──
  let presenceHtml = '';
  const presenceEntities = config.presence_entities ?? [];
  if (presenceEntities.length > 0) {
    const dots = presenceEntities.map(entityId => {
      const person = hass.states[entityId];
      if (!person) return '';
      const isHome = person.state === 'home';
      const raw    = (person.attributes.friendly_name as string) ?? entityId;
      const name   = esc(raw.split(' ')[0]);
      const dotCls = isHome ? 'rpc-dot-amber' : 'rpc-dot-green';
      return `<span class="rpc-presence-dot">
        <span class="rpc-dot ${dotCls}" aria-hidden="true"></span>
        ${name}
        <span class="rpc-presence-label">${isHome ? 'home' : 'away'}</span>
      </span>`;
    }).join('');
    if (dots) presenceHtml = `<div class="rpc-presence-row">${dots}</div>`;
  }

  // ── B1: Presence analytics ──
  let analyticsHtml = '';
  if (hasPresenceAnalytics) {
    const opps = parseInt(opportunitiesEntity!.state, 10);
    const util = parseInt(utilisationEntity!.state, 10);
    if (!isNaN(opps) && !isNaN(util)) {
      // Show cleans vs opportunities rather than a percentage that can exceed 100%.
      // "3 cleans · 2 opportunities" is unambiguous; >100% utilisation
      // (cleaning more often than there were away windows) just shows naturally.
      const cleans = utilisationEntity!.attributes.cleans_7d as number | undefined;
      const cleanCount = cleans != null ? cleans : Math.round(opps * util / 100);
      const oppsStr  = `${opps} opportunit${opps !== 1 ? 'ies' : 'y'} this week`;
      const cleansStr = `${cleanCount} clean${cleanCount !== 1 ? 's' : ''}`;
      analyticsHtml = `
        <div class="rpc-presence-analytics" aria-label="Presence cleaning analytics">
          ${cleansStr} · ${oppsStr}
        </div>
      `;
    }
  }

  return `
    <div class="rpc-zone rpc-zone4">
      <div class="rpc-zone-header">SCHEDULE &amp; PRESENCE</div>
      <div class="rpc-schedule-row">
        <div class="rpc-schedule-times">
          ${nextCleanEntity ? `
            <div class="rpc-next-clean">
              <span class="rpc-schedule-label">Next scheduled</span>
              <span class="rpc-schedule-time">${formatNextClean(nextCleanEntity.state, hass.language)}</span>
            </div>` : ''}
          ${likelyWindowHtml}
          ${optimalWindowHtml}
        </div>
        ${holdHtml}
      </div>
      ${presenceHtml}
      ${analyticsHtml}
    </div>
  `;
}
