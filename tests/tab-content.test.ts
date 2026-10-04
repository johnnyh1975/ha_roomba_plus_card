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
    openExplain: null, openReplay: null, openMissionMap: null,
    lifetimeExpanded: false, historyTab: 'calendar', hazards: [],
    selectedRooms: new Set<string>(), hiddenMapLayers: new Set(),
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

// ── v3.0 C — Map tab routing ─────────────────────────────────────────────
import { classicI7 } from './fixtures/robots';
describe('renderTabContent — v3.0 map routing', () => {
  const cal = [
    { vacuum: { x: 0, y: 0 }, map: { x: 0, y: 600 } },
    { vacuum: { x: 1000, y: 0 }, map: { x: 600, y: 600 } },
    { vacuum: { x: 1000, y: 1000 }, map: { x: 600, y: 0 } },
  ];
  const hass = classicI7([['image.i7_rooms_map', 'rooms_map', 'idle', {
    entity_picture: '/rooms', calibration_points: cal, alignment_pending: false,
    rooms: { Kitchen: { outline: [[0, 0], [1000, 0], [1000, 1000]], name: 'Kitchen', x: 600, y: 300 } } }]]);
  it('rooms map present → map zone', () => {
    const html = renderTabContent('map', ctx({ hass, robotName: 'i7', caps: { ...fullCaps, hasRoomsMap: true } }));
    expect(html).toContain('rpc-map-zone');
  });
  it('no rooms map → the coverage view as before', () => {
    const html = renderTabContent('map', ctx({ hass, robotName: 'i7', caps: { ...fullCaps, hasRoomsMap: false } }));
    expect(html).not.toContain('rpc-map-zone');
  });
});

describe('renderTabContent — v3.0 bug hunt 2', () => {
  const cal = [
    { vacuum: { x: 0, y: 0 }, map: { x: 0, y: 600 } },
    { vacuum: { x: 1000, y: 0 }, map: { x: 600, y: 600 } },
    { vacuum: { x: 1000, y: 1000 }, map: { x: 600, y: 0 } },
  ];
  const mk = (aligned: boolean) => classicI7([
    ['image.i7_rooms_map', 'rooms_map', 'idle', {
      entity_picture: '/rooms', calibration_points: cal, alignment_pending: !aligned,
      rooms: { Kitchen: { outline: [[0, 0], [1000, 0], [1000, 1000]], name: 'Kitchen', x: 600, y: 300 } } }],
    ['image.i7_coverage_map', 'coverage_map', 'idle', { entity_picture: '/cov.png' }],
  ]);
  const caps = { ...fullCaps, hasRoomsMap: true, hasCoverageImage: true };
  it('Classic not yet aligned: rooms map AND the coverage view (no loss vs 2.5)', () => {
    const html = renderTabContent('map', ctx({ hass: mk(false), robotName: 'i7', caps }));
    expect(html).toContain('rpc-map-zone');
    expect(html).toContain('/cov.png');
  });
  it('aligned: rooms map only (coverage is a layer on it)', () => {
    const html = renderTabContent('map', ctx({ hass: mk(true), robotName: 'i7', caps }));
    expect(html).toContain('rpc-map-zone');
    expect(html).not.toContain('rpc-zone6');
  });
  it('map column of a wide card: no day popover (the History panel has it)', () => {
    const hass = classicI7([['image.i7_coverage_map', 'coverage_map', 'idle', { entity_picture: '/cov.png' }]]);
    const base = { hass, robotName: 'i7', caps: { ...fullCaps, hasRoomsMap: false, hasCoverageImage: true },
      openDay: '2026-10-01', openDaySummary: { date: '2026-10-01', total: 0, completed: 0 } as never, dayMissions: [] };
    expect(renderTabContent('map', ctx({ ...base, mapColumn: true }))).not.toContain('rpc-day');
    expect(renderTabContent('map', ctx(base))).toContain('rpc-day'); // negative control
  });
});
