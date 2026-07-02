/**
 * tab-content.ts — R1 (refactor)
 *
 * Pure composition of each tab's HTML, extracted verbatim from render()'s
 * `switch (this.activeTab)`. No effects, no timers, no `this` — a context
 * object carries the 26 state fields the switch read. The two class-method
 * dependencies (maintenance links, alert zone) are passed in already-rendered
 * as strings, keeping this function pure and unit-testable.
 *
 * This also creates the seam the planned A1–A3 sensor features (navigation
 * health, dirt detection, dock health) slot into, instead of growing render().
 */
import { CardConfig, HomeAssistant, DaySummary, MissionRecord, HazardRecord, RobotCapabilities } from './types.js';
import { TabId } from './tabs.js';
import { renderHistoryZone } from './zones/history-zone.js';
import { renderHealthZone } from './zones/health-zone.js';
import { renderScheduleZone } from './zones/schedule-zone.js';
import { renderRoomSelectorZone, renderSettingsPanel } from './zones/room-selector-zone.js';
import { renderFavorites } from './favorites.js';

export interface TabContentContext {
  hass: HomeAssistant;
  config: CardConfig;
  caps: RobotCapabilities;
  robotName: string;
  isMetric: boolean;

  // history / map state
  missionData: DaySummary[] | null;
  historyLoading: boolean;
  historyError: string | null;
  openDay: string | null;
  dayMissions: MissionRecord[] | null;
  openDaySummary: DaySummary | null;
  lifetimeExpanded: boolean;
  historyTab: 'calendar' | 'coverage';
  hazards: HazardRecord[];
  selectedRooms: Set<string>;

  // health state
  openPopover: string | null;
  resetting: string | null;
  resetError: string | null;
  legendShown: boolean;
  healthDetailsExpanded: boolean;
  openMaintPopover: string | null;
  navDetailsExpanded: boolean;

  // settings state
  holdTooltipVisible: boolean;
  holdToggling: boolean;
  settingsPanelOpen: boolean;
  isSendingClean: boolean;
  sendError: string | null;
  passes: string;

  // injected pre-rendered strings (depend on class internals)
  maintenanceLinksHtml: string;
  alertZoneHtml: string;
}

/**
 * Compose the HTML for the given tab. Returns '' for an unknown/null tab.
 * Verbatim relocation of render()'s tab switch — behaviour identical.
 */
export function renderTabContent(tab: TabId | null, ctx: TabContentContext): string {
  const { hass, config, caps, robotName, isMetric } = ctx;

  switch (tab) {
    case 'map':
      // Promotes the existing F7 coverage heatmap + hazard pins to a
      // first-class tab by forcing historyTab to 'coverage'. C7-ROOM-BOUNDS
      // room polygon overlays render when caps.hasAlignment. Tap-to-select
      // shares selectedRooms with the header "Rooms…" chip picker.
      // suppressSubTabToggle: true — this tab IS the coverage view at the
      // top-level tab bar already.
      return renderHistoryZone(hass, config, caps, robotName,
        { data: ctx.missionData, loading: ctx.historyLoading, error: ctx.historyError,
          openDay: ctx.openDay, dayMissions: ctx.dayMissions, openDaySummary: ctx.openDaySummary,
          lifetimeExpanded: ctx.lifetimeExpanded,
          historyTab: 'coverage', hazards: ctx.hazards,
          mapSelectedRooms: ctx.selectedRooms,
          suppressSubTabToggle: true,
          isMapContext: true },
        isMetric);

    case 'history':
      return renderHistoryZone(hass, config, caps, robotName,
        { data: ctx.missionData, loading: ctx.historyLoading, error: ctx.historyError,
          openDay: ctx.openDay, dayMissions: ctx.dayMissions, openDaySummary: ctx.openDaySummary,
          lifetimeExpanded: ctx.lifetimeExpanded,
          // Companion mode keeps the Calendar/Coverage sub-tab toggle — it's the
          // only mode where this History tab needs to reach the coverage view,
          // since no separate Map tab exists there. Standalone forces 'calendar'
          // AND suppresses the toggle, since Coverage has its own Map tab.
          historyTab: config.mode === 'companion' ? ctx.historyTab : 'calendar',
          hazards: ctx.hazards,
          suppressSubTabToggle: config.mode !== 'companion' },
        isMetric);

    case 'health':
      return `
          ${ctx.alertZoneHtml}
          ${renderHealthZone(hass, config, caps, robotName,
            { openPopover: ctx.openPopover, resetting: ctx.resetting, resetError: ctx.resetError, legendShown: ctx.legendShown,
              healthDetailsExpanded: ctx.healthDetailsExpanded, openMaintPopover: ctx.openMaintPopover,
              navDetailsExpanded: ctx.navDetailsExpanded })}
        `;

    case 'settings':
      return `
          ${renderScheduleZone(hass, config, caps, robotName,
            { holdTooltipVisible: ctx.holdTooltipVisible, holdToggling: ctx.holdToggling })}
          <div class="rpc-settings-divider"></div>
          ${renderSettingsPanel(hass, config, robotName, ctx.settingsPanelOpen)}
          ${config.mode !== 'companion'
            ? renderRoomSelectorZone({
                hass, config, caps,
                robotName,
                selectedRooms: ctx.selectedRooms, passes: ctx.passes,
                isSending: ctx.isSendingClean, sendError: ctx.sendError,
                settingsPanelOpen: ctx.settingsPanelOpen,
                // settings panel already rendered directly above — independent
                // of hasZones so it isn't lost on robots with no zone
                // capability. Suppress the embedded copy here.
                includeSettingsPanel: false,
              })
            : ''}
          ${ctx.maintenanceLinksHtml}
          ${renderFavorites(hass, config, robotName)}
        `;

    default:
      return '';
  }
}
