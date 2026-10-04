import { HomeAssistant, CardConfig, RobotCapabilities } from '../types.js';
import { robot } from '../registry.js';
import { esc, formatState } from '../utils.js';
import { roomsRole } from '../robot-model.js';
import { mdiToEmoji, MDI_FALLBACK } from '../const.js';
import { t, resolveLang } from '../i18n/index.js';

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
 * Exported so the ⚙ Settings tab (header.ts / main card) can render it.
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

  const lang = resolveLang(hass.language);
  const n = robotName;
  const R = robot(hass, n);
  const edgeCleanEntity   = robot(hass, n).st('switch', 'edge_clean');
  const alwaysFinishEntity = robot(hass, n).st('switch', 'always_finish');
  // v2.5.0 F9: since integration 4.2.15 the carpet-boost select exists only
  // when the robot reports cap.carpetBoost == 1, and stale rows are removed.
  // A row left behind on an install whose robot had no capability block yet
  // stays `unavailable` forever — treated as absent, not as a dead control.
  const carpetBoostRaw     = robot(hass, n).st('select', 'carpet_boost_select');
  const carpetBoostEntity  = carpetBoostRaw && carpetBoostRaw.state !== 'unavailable' ? carpetBoostRaw : undefined;
  // v2.5.0 GENTLE-MODE (integration v3.4.3) — same simple on/off shape as
  // edge_clean/always_finish above, confirmed present across multiple i7
  // firmware generations; only appears for robots that actually report it.
  const gentleModeEntity   = robot(hass, n).st('switch', 'gentle_mode');
  if (!edgeCleanEntity && !alwaysFinishEntity && !carpetBoostEntity && !gentleModeEntity) return '';

  let panelHtml = '';
  if (settingsPanelOpen) {
    const edgeOn   = edgeCleanEntity?.state === 'on';
    const finishOn = alwaysFinishEntity?.state === 'on';
    const gentleOn = gentleModeEntity?.state === 'on';
    const carpetOptions: string[] = carpetBoostEntity
      ? (carpetBoostEntity.attributes.options as string[] ?? [])
      : [];

    panelHtml = `
      <div class="rpc-settings-panel">
        ${edgeCleanEntity ? `
          <div class="rpc-setting-item">
            <span class="rpc-setting-label">${t(lang, 'settings.edgeClean')}</span>
            <button class="rpc-setting-toggle${edgeOn ? ' rpc-setting-on' : ''}"
                    data-switch-entity="${esc(R.id('switch', 'edge_clean') ?? '')}"
                    aria-pressed="${edgeOn}">
              ${edgeOn ? '●' : '○'}
            </button>
          </div>` : ''}
        ${alwaysFinishEntity ? `
          <div class="rpc-setting-item">
            <span class="rpc-setting-label">${t(lang, 'settings.alwaysFinish')}</span>
            <button class="rpc-setting-toggle${finishOn ? ' rpc-setting-on' : ''}"
                    data-switch-entity="${esc(R.id('switch', 'always_finish') ?? '')}"
                    aria-pressed="${finishOn}">
              ${finishOn ? '●' : '○'}
            </button>
          </div>` : ''}
        ${gentleModeEntity ? `
          <div class="rpc-setting-item">
            <span class="rpc-setting-label">${t(lang, 'settings.gentleMode')}</span>
            <button class="rpc-setting-toggle${gentleOn ? ' rpc-setting-on' : ''}"
                    data-switch-entity="${esc(R.id('switch', 'gentle_mode') ?? '')}"
                    aria-pressed="${gentleOn}">
              ${gentleOn ? '●' : '○'}
            </button>
          </div>` : ''}
        ${carpetBoostEntity ? `
          <div class="rpc-setting-item">
            <span class="rpc-setting-label">${t(lang, 'settings.carpetBoost')}</span>
            <button class="rpc-setting-cycle"
                    data-cycle-entity="${esc(R.id('select', 'carpet_boost_select') ?? '')}"
                    data-cycle-options="${esc(JSON.stringify(carpetOptions))}"
                    data-cycle-current="${esc(carpetBoostEntity.state)}">
              ${esc(formatState(hass, (robot(hass, n).id('select', 'carpet_boost_select') ?? '')))} ▼
            </button>
          </div>` : ''}
      </div>
    `;
  }

  const divider = inStatusZone
    ? '<div class="rpc-settings-divider rpc-settings-divider--compact"></div>'
    : '<div class="rpc-settings-divider"></div>';
  const contextLabel = inStatusZone
    ? `<div class="rpc-zone-header rpc-controls-label">${t(lang, 'settings.controlsLabel')}</div>`
    : '';

  return `
    ${divider}
    ${contextLabel}
    <button class="rpc-settings-row" data-settings-toggle aria-expanded="${settingsPanelOpen}">
      <span class="rpc-settings-icon">⚙</span>
      <span class="rpc-settings-label">${t(lang, 'settings.settingsLabel')}</span>
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

  const lang = resolveLang(hass.language);
  const n = robotName;
  // v3.0 A2/B5: rooms from the robot model — Classic (smart_zone_select or
  // the active map's cloud select) and Prime (prime_zone_select) alike.
  // Rooms only: the selects also list zones, and clean_room refuses a zone
  // name (`room_name_is_a_zone`), so a zone chip could only ever fail.
  const rooms = roomsRole(hass, n);
  const options = rooms.rooms;
  if (!rooms.selectId || options.length === 0) return '';

  const repeatEntity = robot(hass, n).st('button', 'repeat_mission');
  const canRepeat    = !!repeatEntity && repeatEntity.state !== 'unavailable';
  const passesEntity = robot(hass, n).st('select', 'cleaning_passes');

  const isMop      = caps.isMop;
  const cleanLabel = isMop ? `▶ ${t(lang, 'roomSelector.mopSelected')}` : `▶ ${t(lang, 'roomSelector.cleanSelected')}`;
  const count      = selectedRooms.size;
  const spinnerSvg = `<svg class="rpc-spinner" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="3" stroke-dasharray="31 63"/></svg>`;

  // F5: region_icons — room name → MDI icon ("mdi:fridge"), Classic cloud only.
  const regionIcons = rooms.icons;
  const chip = (room: string): string => {
    const sel  = selectedRooms.has(room);
    const mdi  = regionIcons[room];
    const icon = mdi ? mdiToEmoji(mdi, MDI_FALLBACK) : '';
    const label = icon ? `${icon} ${esc(room)}` : esc(room);
    return `<button class="rpc-room-chip${sel ? ' rpc-room-chip--selected' : ''}"
      data-room="${esc(room)}" aria-pressed="${sel}">${label}</button>`;
  };

  // v3.0 B5: Prime homes with several maps (floors) — rooms grouped by
  // floor, the robot's floor first. One clean_room call cannot span floors;
  // the integration says so in words if tried (shown as sendError).
  const floorNames = Array.from(new Set(options.map(r => rooms.floors[r]).filter((f): f is string => !!f)));
  let chipsHtml: string;
  if (floorNames.length > 1) {
    floorNames.sort((a, b) => (a === rooms.robotFloor ? -1 : b === rooms.robotFloor ? 1 : a.localeCompare(b)));
    const unassigned = options.filter(r => !rooms.floors[r]);
    chipsHtml = floorNames.map(floor => `
      <div class="rpc-floor-group">
        <div class="rpc-floor-label">${esc(floor)}${floor === rooms.robotFloor ? ` · ${t(lang, 'roomSelector.robotHere')}` : ''}</div>
        <div class="rpc-chips-row">${options.filter(r => rooms.floors[r] === floor).map(chip).join('')}</div>
      </div>`).join('')
      + (unassigned.length ? `<div class="rpc-chips-row">${unassigned.map(chip).join('')}</div>` : '');
    chipsHtml = `${chipsHtml}${count > 0 ? `<span class="rpc-selected-count">${t(lang, 'roomSelector.selectedCount', { count })}</span>` : ''}`;
  } else {
    chipsHtml = `<div class="rpc-chips-row">
        ${options.map(chip).join('')}
        ${count > 0 ? `<span class="rpc-selected-count">${t(lang, 'roomSelector.selectedCount', { count })}</span>` : ''}
      </div>`;
  }

  let passesHtml = '';
  if (passesEntity) {
    const activeChip = passes;
    passesHtml = `
      <div class="rpc-passes-row">
        <span class="rpc-passes-label">${t(lang, 'roomSelector.passesLabel')}</span>
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
      <div class="rpc-zone-header">${t(lang, 'roomSelector.zoneHeader')}</div>
      ${chipsHtml}
      ${passesHtml}
      <div class="rpc-room-actions">
        <button class="rpc-btn rpc-btn-primary${count === 0 || isSending ? ' rpc-btn-disabled' : ''}"
                data-action="clean-selected"
                ${count === 0 || isSending ? 'disabled' : ''}
                aria-label="${cleanLabel}">
          ${isSending ? spinnerSvg + ' ' + t(lang, 'roomSelector.sending') : cleanLabel}
        </button>
        ${canRepeat ? `<button class="rpc-btn-text" data-action="repeat-last">↩ ${t(lang, 'roomSelector.repeatLast')}</button>` : ''}
      </div>
      ${sendError ? `<div class="rpc-send-error">${esc(sendError)}</div>` : ''}
      ${settingsHtml}
    </div>
  `;
}
