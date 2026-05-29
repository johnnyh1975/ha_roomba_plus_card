import { HomeAssistant, CardConfig, RobotCapabilities } from '../types.js';
import { esc } from '../utils.js';

export interface RoomSelectorProps {
  hass: HomeAssistant;
  config: CardConfig;
  caps: RobotCapabilities;
  robotName: string;
  selectedRooms: Set<string>;
  passes: string;
  isSending: boolean;
  sendError: string | null;
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
  const { hass, config, caps, robotName, selectedRooms, passes, isSending, sendError } = props;

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

  const isMop      = caps.isMop;
  const cleanLabel = isMop ? '▶ Mop selected rooms' : '▶ Clean selected rooms';
  const count      = selectedRooms.size;

  const spinnerSvg = `<svg class="rpc-spinner" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="3" stroke-dasharray="31 63"/></svg>`;

  const chipsHtml = options.map(room => {
    const sel = selectedRooms.has(room);
    return `<button class="rpc-room-chip${sel ? ' rpc-room-chip--selected' : ''}"
      data-room="${esc(room)}" aria-pressed="${sel}">${esc(room)}</button>`;
  }).join('');

  let passesHtml = '';
  if (passesEntity) {
    // Sync displayed selection to entity state when entity has updated
    const entityChip = OPTION_TO_CHIP[passesEntity.state] ?? 'Auto';
    // Local `passes` is optimistic; if they match, show local; entity is source of truth on init
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
    </div>
  `;
}
