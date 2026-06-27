import { describe, it, expect } from 'vitest';
import { availableTabs, defaultTab, healthTabHasBadge, historyTabHasBadge, renderTabBar } from '../src/tabs';
import { makeHass, defaultCaps, baseConfig, st } from './helpers';

describe('availableTabs()', () => {
  it('includes Map tab for standalone robot with hasCoverageImage', () => {
    const tabs = availableTabs(baseConfig, { ...defaultCaps, hasCoverageImage: true });
    expect(tabs.map(t => t.id)).toContain('map');
  });

  it('omits Map tab for standalone robot without hasCoverageImage (NONE tier)', () => {
    const tabs = availableTabs(baseConfig, defaultCaps);
    expect(tabs.map(t => t.id)).not.toContain('map');
  });

  it('omits Map tab in companion mode even when hasCoverageImage is true', () => {
    const tabs = availableTabs({ ...baseConfig, mode: 'companion' }, { ...defaultCaps, hasCoverageImage: true });
    expect(tabs.map(t => t.id)).not.toContain('map');
  });

  it('always includes History, Health, and Settings tabs', () => {
    const tabs = availableTabs(baseConfig, defaultCaps);
    const ids = tabs.map(t => t.id);
    expect(ids).toContain('history');
    expect(ids).toContain('health');
    expect(ids).toContain('settings');
  });
});

describe('defaultTab()', () => {
  it('defaults to map for standalone robot with hasCoverageImage', () => {
    expect(defaultTab(baseConfig, { ...defaultCaps, hasCoverageImage: true })).toBe('map');
  });

  it('defaults to history for standalone robot without hasCoverageImage', () => {
    expect(defaultTab(baseConfig, defaultCaps)).toBe('history');
  });

  it('defaults to history in companion mode even with hasCoverageImage', () => {
    expect(defaultTab({ ...baseConfig, mode: 'companion' }, { ...defaultCaps, hasCoverageImage: true })).toBe('history');
  });

  it('honours config.default_tab override', () => {
    expect(defaultTab({ ...baseConfig, default_tab: 'health' }, { ...defaultCaps, hasCoverageImage: true })).toBe('health');
  });
});

describe('healthTabHasBadge()', () => {
  const n = 'roomba';

  it('false when robot_health_score is healthy (>= 60)', () => {
    const hass = makeHass({ [`sensor.${n}_robot_health_score`]: st('82') });
    expect(healthTabHasBadge(hass, { ...defaultCaps, hasRobotHealthScore: true }, n)).toBe(false);
  });

  it('true when robot_health_score < 60', () => {
    const hass = makeHass({ [`sensor.${n}_robot_health_score`]: st('45') });
    expect(healthTabHasBadge(hass, { ...defaultCaps, hasRobotHealthScore: true }, n)).toBe(true);
  });

  it('false when robot_health_score is calibrating (unknown)', () => {
    const hass = makeHass({ [`sensor.${n}_robot_health_score`]: st('unknown') });
    expect(healthTabHasBadge(hass, { ...defaultCaps, hasRobotHealthScore: true }, n)).toBe(false);
  });

  it('true when a maintenance sensor is more than 90 days old', () => {
    const old = new Date(Date.now() - 95 * 86400000).toISOString();
    const hass = makeHass({ [`sensor.${n}_wheel_last_cleaned`]: st(old) });
    expect(healthTabHasBadge(hass, { ...defaultCaps, hasMaintenanceCalendar: true }, n)).toBe(true);
  });

  it('false when maintenance sensors are recent', () => {
    const recent = new Date(Date.now() - 5 * 86400000).toISOString();
    const hass = makeHass({ [`sensor.${n}_wheel_last_cleaned`]: st(recent) });
    expect(healthTabHasBadge(hass, { ...defaultCaps, hasMaintenanceCalendar: true }, n)).toBe(false);
  });

  it('false when neither capability is present', () => {
    const hass = makeHass();
    expect(healthTabHasBadge(hass, defaultCaps, n)).toBe(false);
  });

  // ── v2.0: alert category integration (shared source of truth with alert-zone.ts) ──
  it('true when consecutive_clean_skips alert is active (category: health)', () => {
    const hass = makeHass({ [`sensor.${n}_consecutive_clean_skips`]: st('2') });
    expect(healthTabHasBadge(hass, { ...defaultCaps, hasConsecutiveSkips: true }, n)).toBe(true);
  });

  it('true when navigation quality alert is active (category: health)', () => {
    const hass = makeHass({ [`sensor.${n}_nav_quality`]: st('45') });
    expect(healthTabHasBadge(hass, defaultCaps, n)).toBe(true);
  });

  it('false when no score/maintenance/alert condition is active', () => {
    const hass = makeHass({ [`sensor.${n}_nav_quality`]: st('85') });
    expect(healthTabHasBadge(hass, defaultCaps, n)).toBe(false);
  });
});

describe('historyTabHasBadge()', () => {
  const n = 'roomba';

  it('true when the wifi floor alert is active (weakest_bucket_observed < 2)', () => {
    const hass = makeHass({ [`sensor.${n}_wifi_health`]: st('72', { weakest_bucket_observed: 1 }) });
    expect(historyTabHasBadge(hass, { ...defaultCaps, hasWifiFloor: true }, n)).toBe(true);
  });

  it('false when wifi signal is fine', () => {
    const hass = makeHass({ [`sensor.${n}_wifi_health`]: st('88', { weakest_bucket_observed: 3 }) });
    expect(historyTabHasBadge(hass, { ...defaultCaps, hasWifiFloor: true }, n)).toBe(false);
  });

  it('false when hasWifiFloor is false', () => {
    const hass = makeHass({ [`sensor.${n}_wifi_health`]: st('72', { weakest_bucket_observed: 1 }) });
    expect(historyTabHasBadge(hass, defaultCaps, n)).toBe(false);
  });

  it('does not fire for health-category alerts (e.g. maintenance due)', () => {
    const hass = makeHass({ [`binary_sensor.${n}_maintenance_due`]: st('on') });
    expect(historyTabHasBadge(hass, defaultCaps, n)).toBe(false);
  });
});

describe('renderTabBar()', () => {
  const tabs = availableTabs(baseConfig, { ...defaultCaps, hasCoverageImage: true });

  it('marks the active tab with rpc-tab-btn--active', () => {
    const html = renderTabBar(tabs, 'history');
    const historyBtn = html.match(/<button[^>]*data-tab="history"[^>]*>/)?.[0] ?? '';
    expect(historyBtn).toContain('rpc-tab-btn--active');
  });

  it('does not mark inactive tabs as active', () => {
    const html = renderTabBar(tabs, 'history');
    const mapBtn = html.match(/<button[^>]*data-tab="map"[^>]*>/)?.[0] ?? '';
    expect(mapBtn).not.toContain('rpc-tab-btn--active');
  });

  it('renders a badge dot when requested', () => {
    const html = renderTabBar(tabs, 'history', { health: true });
    expect(html).toContain('rpc-tab-badge');
  });

  it('omits badge when not requested', () => {
    const html = renderTabBar(tabs, 'history', { health: false });
    expect(html).not.toContain('rpc-tab-badge');
  });
});
