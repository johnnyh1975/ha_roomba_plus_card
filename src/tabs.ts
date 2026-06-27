/**
 * tabs.ts — v2.0 tab bar.
 *
 * Tab set depends on capability tier and mode:
 *   - Standalone, SMART or EPHEMERAL (hasCoverageImage): Map, History, Health, ⚙
 *   - Standalone, NONE (no hasCoverageImage):                    History, Health, ⚙
 *   - Companion (any tier):                                      History, Health, ⚙
 *
 * Map tab is the default for standalone SMART/EPHEMERAL robots; History is
 * the default otherwise. Override via config.default_tab.
 */
import { CardConfig, RobotCapabilities, HomeAssistant } from './types.js';
import { hasAlertForTab } from './zones/alert-zone.js';

export type TabId = 'map' | 'history' | 'health' | 'settings';

export interface TabDef {
  id: TabId;
  icon: string;
  label: string;
}

/** Resolved list of tabs for the current config + capability tier. */
export function availableTabs(config: CardConfig, caps: RobotCapabilities): TabDef[] {
  const tabs: TabDef[] = [];
  const showMap = config.mode !== 'companion' && caps.hasCoverageImage;
  if (showMap) tabs.push({ id: 'map', icon: '🗺', label: 'Map' });
  tabs.push({ id: 'history', icon: '📅', label: 'History' });
  tabs.push({ id: 'health', icon: '❤', label: 'Health' });
  tabs.push({ id: 'settings', icon: '⚙', label: '' });
  return tabs;
}

/** Default active tab for first render, honouring config.default_tab override. */
export function defaultTab(config: CardConfig, caps: RobotCapabilities): TabId {
  if (config.default_tab) return config.default_tab;
  const showMap = config.mode !== 'companion' && caps.hasCoverageImage;
  return showMap ? 'map' : 'history';
}

/**
 * Whether the Health tab should show its attention badge. Fires on:
 * robot_health_score < 60, any maintenance calendar sensor more than 90
 * days old, or any active alert tagged category: 'health' (maintenance due,
 * filter/brush wear rate, navigation quality, consecutive clean skips —
 * see alert-zone.ts collectAlerts() for the shared source of truth on
 * those thresholds, so this never drifts out of sync with the Health tab's
 * own alert banner).
 */
export function healthTabHasBadge(
  hass: HomeAssistant,
  caps: RobotCapabilities,
  robotName: string,
): boolean {
  const n = robotName;

  if (caps.hasRobotHealthScore) {
    const entity = hass.states[`sensor.${n}_robot_health_score`];
    if (entity && entity.state !== 'unknown' && entity.state !== 'unavailable') {
      const score = parseFloat(entity.state);
      if (!isNaN(score) && score < 60) return true;
    }
  }

  if (caps.hasMaintenanceCalendar) {
    const ids = [`sensor.${n}_wheel_last_cleaned`, `sensor.${n}_contact_last_cleaned`, `sensor.${n}_bin_last_cleaned`];
    const now = Date.now();
    for (const id of ids) {
      const entity = hass.states[id];
      if (!entity || entity.state === 'unavailable' || entity.state === 'unknown') continue;
      const ts = new Date(entity.state).getTime();
      if (!isNaN(ts) && (now - ts) / 86400000 > 90) return true;
    }
  }

  if (hasAlertForTab(hass, caps, robotName, 'health')) return true;

  return false;
}

/**
 * Whether the History tab should show its attention badge. v2.0: currently
 * fires only on the WiFi floor alert (the v2.0 plan's explicit example —
 * "a WiFi floor problem gets a badge on History"), via the same shared
 * collectAlerts() source of truth alert-zone.ts uses for its banner text.
 */
export function historyTabHasBadge(
  hass: HomeAssistant,
  caps: RobotCapabilities,
  robotName: string,
): boolean {
  return hasAlertForTab(hass, caps, robotName, 'history');
}

export function renderTabBar(tabs: TabDef[], active: TabId, badges: Partial<Record<TabId, boolean>> = {}): string {
  return `
    <div class="rpc-tab-bar" role="tablist">
      ${tabs.map(t => `
        <button class="rpc-tab-btn${t.id === active ? ' rpc-tab-btn--active' : ''}"
                role="tab" aria-selected="${t.id === active}"
                data-tab="${t.id}">
          <span class="rpc-tab-icon">${t.icon}</span>${t.label ? `<span class="rpc-tab-label">${t.label}</span>` : ''}
          ${badges[t.id] ? '<span class="rpc-tab-badge"></span>' : ''}
        </button>
      `).join('')}
    </div>
  `;
}
