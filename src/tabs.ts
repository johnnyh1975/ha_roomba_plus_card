/**
 * tabs.ts — v2.0 tab bar.
 *
 * Tab set depends on capability tier and mode:
 *   - Standalone with a rooms map (v3.0, both generations) or a coverage
 *     map (hasRoomsMap || hasCoverageImage):             Map, History, Care, ⚙
 *   - Standalone, NONE (no hasCoverageImage):                    History, Health, ⚙
 *   - Companion (any tier):                                      History, Health, ⚙
 *
 * Map tab is the default for standalone SMART/EPHEMERAL robots; History is
 * the default otherwise. Override via config.default_tab.
 */
import { robot } from './registry.js';
import { CardConfig, RobotCapabilities, HomeAssistant } from './types.js';
import { hasAlertForTab } from './zones/alert-zone.js';
import { t } from './i18n/index.js';
import { roomsOverdueId } from './entity-ids.js';

export type TabId = 'map' | 'history' | 'health' | 'settings';

export interface TabDef {
  id: TabId;
  icon: string;
  label: string;
}

/** Resolved list of tabs for the current config + capability tier. */
export function availableTabs(config: CardConfig, caps: RobotCapabilities, lang = 'en'): TabDef[] {
  const tabs: TabDef[] = [];
  const showMap = config.mode !== 'companion' && (caps.hasRoomsMap || caps.hasCoverageImage);
  if (showMap) tabs.push({ id: 'map', icon: '🗺', label: t(lang, 'tabs.map') });
  tabs.push({ id: 'history', icon: '📅', label: t(lang, 'tabs.history') });
  // v3.0 E6: "Care" (Pflege) — parts, station, robot health; id stays 'health'
  // so existing `default_tab: health` configs keep working.
  tabs.push({ id: 'health', icon: '🧰', label: t(lang, 'tabs.health') });
  tabs.push({ id: 'settings', icon: '⚙', label: '' });
  return tabs;
}

/** Default active tab for first render, honouring config.default_tab override. */
export function defaultTab(config: CardConfig, caps: RobotCapabilities): TabId {
  if (config.default_tab) return config.default_tab;
  const showMap = config.mode !== 'companion' && (caps.hasRoomsMap || caps.hasCoverageImage);
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
    const entity = robot(hass, n).st('sensor', 'robot_health_score');
    if (entity && entity.state !== 'unknown' && entity.state !== 'unavailable') {
      const score = parseFloat(entity.state);
      if (!isNaN(score) && score < 60) return true;
    }
  }

  if (caps.hasMaintenanceCalendar) {
    const ids = [(robot(hass, n).id('sensor', 'wheel_last_cleaned') ?? ''), (robot(hass, n).id('sensor', 'contact_last_cleaned') ?? ''), (robot(hass, n).id('sensor', 'bin_last_cleaned') ?? '')];
    const now = Date.now();
    for (const id of ids) {
      const entity = hass.states[id];
      if (!entity || entity.state === 'unavailable' || entity.state === 'unknown') continue;
      const ts = new Date(entity.state).getTime();
      if (!isNaN(ts) && (now - ts) / 86400000 > 90) return true;
    }
  }

  // v2.3.0 — Rooms-Overdue: same "needs attention" badge philosophy as the
  // health-score/maintenance checks above.
  if (caps.hasRoomsOverdue) {
    const entity = hass.states[roomsOverdueId(hass, n) ?? ''];
    if (entity && entity.state !== 'unknown' && entity.state !== 'unavailable') {
      const count = parseFloat(entity.state);
      if (!isNaN(count) && count > 0) return true;
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
