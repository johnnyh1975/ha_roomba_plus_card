/**
 * R1 — renderTabContent dispatch tests.
 *
 * Verifies each tab id routes to the right zone composition, without
 * re-testing the zones themselves (they have their own suites). Assertions key
 * on distinguishing markers: which injected strings appear, and tab-specific
 * structure.
 */
import { describe, it, expect } from 'vitest';
import { renderTabContent, TabContentContext } from '../src/tab-content';
import { makeHass, fullCaps, baseConfig, st } from './helpers';

const n = 'roomba';

function ctx(overrides: Partial<TabContentContext> = {}): TabContentContext {
  return {
    hass: makeHass({ 'vacuum.roomba': st('docked') }),
    config: { ...baseConfig },
    caps: fullCaps,
    robotName: n,
    isMetric: false,
    missionData: null, historyLoading: false, historyError: null,
    openDay: null, dayMissions: null, openDaySummary: null,
    lifetimeExpanded: false, historyTab: 'calendar', hazards: [],
    selectedRooms: new Set<string>(),
    openPopover: null, resetting: null, resetError: null,
    legendShown: false, healthDetailsExpanded: false, openMaintPopover: null, navDetailsExpanded: false,
    holdTooltipVisible: false, holdToggling: false, settingsPanelOpen: false,
    isSendingClean: false, sendError: null, passes: 'Auto',
    maintenanceLinksHtml: '<!--MAINT-LINKS-->',
    alertZoneHtml: '<!--ALERT-ZONE-->',
    ...overrides,
  };
}

describe('renderTabContent — dispatch', () => {
  it('returns empty string for null tab', () => {
    expect(renderTabContent(null, ctx())).toBe('');
  });

  it('returns empty string for an unknown tab', () => {
    expect(renderTabContent('nope' as any, ctx())).toBe('');
  });

  it('health tab includes the injected alert zone', () => {
    const html = renderTabContent('health', ctx());
    expect(html).toContain('<!--ALERT-ZONE-->');
  });

  it('settings tab includes the injected maintenance links', () => {
    const html = renderTabContent('settings', ctx());
    expect(html).toContain('<!--MAINT-LINKS-->');
  });

  it('settings tab includes the settings divider', () => {
    const html = renderTabContent('settings', ctx());
    expect(html).toContain('rpc-settings-divider');
  });

  it('map and history tabs do not leak the alert zone', () => {
    expect(renderTabContent('map', ctx())).not.toContain('<!--ALERT-ZONE-->');
    expect(renderTabContent('history', ctx())).not.toContain('<!--ALERT-ZONE-->');
  });

  it('map tab produces content (coverage context)', () => {
    const html = renderTabContent('map', ctx());
    expect(html.length).toBeGreaterThan(0);
  });
});

describe('renderTabContent — companion vs standalone history', () => {
  // Provide a zone select entity so the standalone room selector actually
  // renders (it returns '' without one, regardless of caps).
  const withZoneSelect = () => makeHass({
    'vacuum.roomba': st('docked'),
    'select.roomba_smart_zone_select': { ...st('Kitchen'), attributes: { options: ['Kitchen', 'Hall'] } },
  });

  it('standalone settings renders the room selector; companion suppresses it', () => {
    const standalone = renderTabContent('settings', ctx({
      hass: withZoneSelect(), config: { ...baseConfig, mode: 'standalone' },
    }));
    const companion = renderTabContent('settings', ctx({
      hass: withZoneSelect(), config: { ...baseConfig, mode: 'companion' },
    }));
    // Standalone composes more than companion (the room-selector block).
    expect(standalone.length).toBeGreaterThan(companion.length);
  });
});
