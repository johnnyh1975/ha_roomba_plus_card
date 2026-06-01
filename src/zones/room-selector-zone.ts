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

export function renderRoomSelectorZone(props: RoomSelectorProps): string {
  const { hass, config, caps, robotName, selectedRooms, passes,
          isSending, sendError, settingsPanelOpen } = props;

  if (!caps.hasZones) return '';
  if (config.show_rooms === false) return '';

  const n = robotName;
  const smartSelect = hass.states[`select.${n}_smart_zone_select`];
  const zoneSelect  = hass.states[`select.${n}_zone_select`];
  const selector    = smartSelect ?? zoneSelect;
  if (!selector) return '';

  const options: string[] = (selector.attributes.options as string[]) ?? [];
  if (options.length === 0) return '';

  const repeatEntity = hass.states[`button.${n}_repeat_mission`];
  const canRepeat    = !!repeatEntity && repeatEntity.state !== 'unavailable';
  const passesEntity = hass.states[`select.${n}_cleaning_passes`];

  // B3 — settings panel entities
  const edgeCleanEntity   = hass.states[`switch.${n}_edge_clean`];
  const alwaysFinishEntity= hass.states[`switch.${n}_always_finish`];
  const carpetBoostEntity = hass.states[`select.${n}_carpet_boost_mode`];
  const hasSettings       = !!(edgeCleanEntity || alwaysFinishEntity || carpetBoostEntity);

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

  // ── B3: Settings panel ──
  let settingsHtml = '';
  if (hasSettings) {
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
                      data-cycle-entity="select.${n}_carpet_boost_mode"
                      data-cycle-options="${esc(JSON.stringify(carpetOptions))}"
                      data-cycle-current="${esc(carpetBoostEntity.state)}">
                ${esc(carpetBoostEntity.state)} ▼
              </button>
            </div>` : ''}
        </div>
      `;
    }

    settingsHtml = `
      <div class="rpc-settings-divider"></div>
      <button class="rpc-settings-row" data-settings-toggle aria-expanded="${settingsPanelOpen}">
        <span class="rpc-settings-icon">⚙</span>
        <span class="rpc-settings-label">Settings</span>
        <span class="rpc-settings-arrow">${settingsPanelOpen ? '▲' : '▼'}</span>
      </button>
      ${panelHtml}
    `;
  }

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
