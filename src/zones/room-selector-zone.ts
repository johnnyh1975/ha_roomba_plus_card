import { HomeAssistant, CardConfig, RobotCapabilities } from '../types.js';
import { esc } from '../utils.js';
import { MDI_TO_EMOJI, MDI_FALLBACK } from '../const.js';

export interface RoomSelectorProps {
  hass: HomeAssistant;
  config: CardConfig;
  caps: RobotCapabilities;
  robotName: string;
  selectedRooms: Set<string>;
  passes: string;
  isSending: boolean;
  sendError: string | null;
  /** B3: whether the settings panel is expanded */
  settingsPanelOpen: boolean;
  /** v2.0: when false, suppresses the embedded settings panel — used by the
   *  ⚙ tab, which renders renderSettingsPanel() separately so it isn't lost
   *  on robots without zone capability (hasZones gates this entire function
   *  before it would otherwise reach the settings panel). Defaults to true
   *  to preserve pre-v2.0 callers' behaviour unchanged. */
  includeSettingsPanel?: boolean;
}

/** Maps display chip labels → integration select option strings */
const CHIP_TO_OPTION: Record<string, string> = {
  'Auto': 'Auto',
  '×1':   'One pass',
  '×2':   'Two passes',
};

/** Maps integration select state → display chip labels */
const OPTION_TO_CHIP: Record<string, string> = {
  'Auto':       'Auto',
  'One pass':   '×1',
  'Two passes': '×2',
};

export { CHIP_TO_OPTION, OPTION_TO_CHIP };

/**
 * F3b: Render the settings panel (edge clean, always finish, carpet boost).
 * Exported so status-zone can render it when show_rooms:false + show_settings:true.
 * Returns '' when no settings entities exist or show_settings is explicitly false.
 */
export function renderSettingsPanel(
  hass: HomeAssistant,
  config: CardConfig,
  robotName: string,
  settingsPanelOpen: boolean,
  /** When true, renders inside Status zone: adds "CONTROLS" label, compact divider */
  inStatusZone = false,
): string {
  if (config.show_settings === false) return '';

  const n = robotName;
  const edgeCleanEntity   = hass.states[`switch.${n}_edge_clean`];
  const alwaysFinishEntity = hass.states[`switch.${n}_always_finish`];
  const carpetBoostEntity  = hass.states[`select.${n}_carpet_boost_select`];
  if (!edgeCleanEntity && !alwaysFinishEntity && !carpetBoostEntity) return '';

  let panelHtml = '';
  if (settingsPanelOpen) {
    const edgeOn   = edgeCleanEntity?.state === 'on';
    const finishOn = alwaysFinishEntity?.state === 'on';
    const carpetOptions: string[] = carpetBoostEntity
      ? (carpetBoostEntity.attributes.options as string[] ?? [])
      : [];

    panelHtml = `
      <div class="rpc-settings-panel">
        ${edgeCleanEntity ? `
          <div class="rpc-setting-item">
            <span class="rpc-setting-label">Edge clean</span>
            <button class="rpc-setting-toggle${edgeOn ? ' rpc-setting-on' : ''}"
                    data-switch-entity="switch.${n}_edge_clean"
                    aria-pressed="${edgeOn}">
              ${edgeOn ? '●' : '○'}
            </button>
          </div>` : ''}
        ${alwaysFinishEntity ? `
          <div class="rpc-setting-item">
            <span class="rpc-setting-label">Always finish</span>
            <button class="rpc-setting-toggle${finishOn ? ' rpc-setting-on' : ''}"
                    data-switch-entity="switch.${n}_always_finish"
                    aria-pressed="${finishOn}">
              ${finishOn ? '●' : '○'}
            </button>
          </div>` : ''}
        ${carpetBoostEntity ? `
          <div class="rpc-setting-item">
            <span class="rpc-setting-label">Carpet boost</span>
            <button class="rpc-setting-cycle"
                    data-cycle-entity="select.${n}_carpet_boost_select"
                    data-cycle-options="${esc(JSON.stringify(carpetOptions))}"
                    data-cycle-current="${esc(carpetBoostEntity.state)}">
              ${esc(carpetBoostEntity.state)} ▼
            </button>
          </div>` : ''}
      </div>
    `;
  }

  const divider = inStatusZone
    ? '<div class="rpc-settings-divider rpc-settings-divider--compact"></div>'
    : '<div class="rpc-settings-divider"></div>';
  const contextLabel = inStatusZone
    ? '<div class="rpc-zone-header rpc-controls-label">CONTROLS</div>'
    : '';

  return `
    ${divider}
    ${contextLabel}
    <button class="rpc-settings-row" data-settings-toggle aria-expanded="${settingsPanelOpen}">
      <span class="rpc-settings-icon">⚙</span>
      <span class="rpc-settings-label">Settings</span>
      <span class="rpc-settings-arrow">${settingsPanelOpen ? '▲' : '▼'}</span>
    </button>
    ${panelHtml}
  `;
}

export function renderRoomSelectorZone(props: RoomSelectorProps): string {
  const { hass, config, caps, robotName, selectedRooms, passes,
          isSending, sendError, settingsPanelOpen, includeSettingsPanel = true } = props;

  // v2.0.2 bug fix (confirmed against integration source): this entire
  // multi-select + "Clean selected rooms" flow calls roomba_plus.clean_room
  // (via the clean-selected action), which hard-fails with a
  // ServiceValidationError for any robot where map_capability != SMART:
  //   "{entity_id} does not support Smart Map room cleaning. Only i7, s9,
  //    and j-series robots support this action."
  // caps.hasZones is true whenever EITHER smart_zone_select (SMART) OR
  // zone_select (EPHEMERAL) exists — gating on it let this multi-select UI
  // render for EPHEMERAL robots using zone_select's real, valid options,
  // promising a targeted clean that would then throw on tap. EPHEMERAL's
  // actual zone-cleaning model is select.*_zone_select + a separate
  // ZoneCleanButton (single zone at a time, no multi-select, no ordering) —
  // a genuinely different interaction this function doesn't implement.
  // Gate strictly on hasSmartZones until that EPHEMERAL flow is built as
  // its own widget.
  if (!caps.hasSmartZones) return '';
  if (config.show_rooms === false) return '';

  const n = robotName;
  const selector = hass.states[`select.${n}_smart_zone_select`];
  if (!selector) return '';

  const options: string[] = (selector.attributes.options as string[]) ?? [];
  if (options.length === 0) return '';

  const repeatEntity = hass.states[`button.${n}_repeat_mission`];
  const canRepeat    = !!repeatEntity && repeatEntity.state !== 'unavailable';
  const passesEntity = hass.states[`select.${n}_cleaning_passes`];

  const isMop      = caps.isMop;
  const cleanLabel = isMop ? '▶ Mop selected rooms' : '▶ Clean selected rooms';
  const count      = selectedRooms.size;
  const spinnerSvg = `<svg class="rpc-spinner" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="3" stroke-dasharray="31 63"/></svg>`;

  // F5: region_icons attribute — maps room name → MDI icon name (no "mdi:" prefix)
  const regionIcons = (() => {
    const selectId = caps.hasSmartZones
      ? `select.${robotName}_smart_zone_select`
      : `select.${robotName}_zone_select`;
    const raw = hass.states[selectId]?.attributes?.['region_icons'];
    return (raw && typeof raw === 'object' && !Array.isArray(raw))
      ? raw as Record<string, string>
      : {} as Record<string, string>;
  })();

  const chipsHtml = options.map(room => {
    const sel  = selectedRooms.has(room);
    const mdi  = regionIcons[room];
    const icon = mdi ? (MDI_TO_EMOJI[mdi] ?? MDI_FALLBACK) : '';
    const label = icon ? `${icon} ${esc(room)}` : esc(room);
    return `<button class="rpc-room-chip${sel ? ' rpc-room-chip--selected' : ''}"
      data-room="${esc(room)}" aria-pressed="${sel}">${label}</button>`;
  }).join('');

  let passesHtml = '';
  if (passesEntity) {
    const activeChip = passes;
    passesHtml = `
      <div class="rpc-passes-row">
        <span class="rpc-passes-label">Passes:</span>
        ${['Auto', '×1', '×2'].map(p =>
          `<button class="rpc-pass-chip${activeChip === p ? ' rpc-pass-chip--selected' : ''}"
            data-pass="${p}"
            data-pass-option="${esc(CHIP_TO_OPTION[p] ?? p)}">${p}</button>`
        ).join('')}
      </div>
    `;
  }

  // ── B3: Settings panel — delegate to shared helper ──
  // Repeat-last moves to Status zone when show_rooms:false, so only render it here
  // when the rooms zone is visible.
  // v2.0: suppressed when the ⚙ tab is rendering this section separately
  // (includeSettingsPanel: false) to avoid duplicating the panel and to
  // ensure it still renders for robots without zone capability.
  const settingsHtml = includeSettingsPanel
    ? renderSettingsPanel(hass, config, robotName, settingsPanelOpen)
    : '';

  return `
    <div class="rpc-zone rpc-zone2">
      <div class="rpc-zone-header">ROOMS</div>
      <div class="rpc-chips-row">
        ${chipsHtml}
        ${count > 0 ? `<span class="rpc-selected-count">${count} selected</span>` : ''}
      </div>
      ${passesHtml}
      <div class="rpc-room-actions">
        <button class="rpc-btn rpc-btn-primary${count === 0 || isSending ? ' rpc-btn-disabled' : ''}"
                data-action="clean-selected"
                ${count === 0 || isSending ? 'disabled' : ''}
                aria-label="${cleanLabel}">
          ${isSending ? spinnerSvg + ' Sending…' : cleanLabel}
        </button>
        ${canRepeat ? `<button class="rpc-btn-text" data-action="repeat-last">↩ Repeat last</button>` : ''}
      </div>
      ${sendError ? `<div class="rpc-send-error">${esc(sendError)}</div>` : ''}
      ${settingsHtml}
    </div>
  `;
}
