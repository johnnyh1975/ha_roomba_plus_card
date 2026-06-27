import { describe, it, expect } from 'vitest';
import { renderRoomSelectorZone, RoomSelectorProps } from '../../src/zones/room-selector-zone';
import { makeHass, defaultCaps, fullCaps, baseConfig, st } from '../helpers';
import type { RobotCapabilities } from '../../src/types';

const n = 'roomba';

function props(
  caps: Partial<RobotCapabilities> = {},
  states: Record<string, ReturnType<typeof st>> = {},
  overrides: Partial<RoomSelectorProps> = {},
): RoomSelectorProps {
  return {
    hass: makeHass(states),
    config: baseConfig,
    caps: { ...defaultCaps, ...caps },
    robotName: n,
    selectedRooms: new Set(),
    passes: 'Auto',
    isSending: false,
    sendError: null,
    settingsPanelOpen: false,
    ...overrides,
  };
}

describe('renderRoomSelectorZone() — visibility', () => {
  it('returns empty string when !caps.hasZones', () =>
    expect(renderRoomSelectorZone(props())).toBe(''));

  it('returns empty string when show_rooms: false', () => {
    const p = props({ hasZones: true }, {}, { config: { ...baseConfig, show_rooms: false } });
    expect(renderRoomSelectorZone(p)).toBe('');
  });

  it('returns empty string when selector entity missing', () =>
    expect(renderRoomSelectorZone(props({ hasZones: true }))).toBe(''));

  it('returns empty string when options array is empty', () => {
    const p = props(
      { hasZones: true },
      { [`select.${n}_zone_select`]: st('none', { options: [] }) },
    );
    expect(renderRoomSelectorZone(p)).toBe('');
  });
});

describe('renderRoomSelectorZone() — room chips', () => {
  const zoneStates = {
    [`select.${n}_smart_zone_select`]: st('Kitchen', { options: ['Kitchen', 'Hallway', 'Bedroom'] }),
  };

  it('renders a chip for each option', () => {
    const p = props({ hasZones: true, hasSmartZones: true }, zoneStates);
    const html = renderRoomSelectorZone(p);
    expect(html).toContain('Kitchen');
    expect(html).toContain('Hallway');
    expect(html).toContain('Bedroom');
  });

  it('selected room has --selected class', () => {
    const p = props({ hasZones: true, hasSmartZones: true }, zoneStates, {
      selectedRooms: new Set(['Kitchen']),
    });
    expect(renderRoomSelectorZone(p)).toContain('rpc-room-chip--selected');
  });

  it('unselected room does not have --selected class', () => {
    const p = props({ hasZones: true, hasSmartZones: true }, zoneStates);
    const html = renderRoomSelectorZone(p);
    expect(html).not.toContain('rpc-room-chip--selected');
  });

  it('selected count badge shown when rooms selected', () => {
    const p = props({ hasZones: true, hasSmartZones: true }, zoneStates, {
      selectedRooms: new Set(['Kitchen', 'Hallway']),
    });
    expect(renderRoomSelectorZone(p)).toContain('2 selected');
  });

  it('escapes room names with special chars', () => {
    const p = props({ hasZones: true }, {
      [`select.${n}_zone_select`]: st('Living', { options: ['Living & Dining'] }),
    });
    const html = renderRoomSelectorZone(p);
    expect(html).toContain('Living &amp; Dining');
    expect(html).not.toContain('Living & Dining');
  });
});

describe('renderRoomSelectorZone() — passes selector (Wave A2)', () => {
  const states = {
    [`select.${n}_zone_select`]:      st('K', { options: ['K'] }),
    [`select.${n}_cleaning_passes`]:  st('Auto', { options: ['Auto', 'One pass', 'Two passes'] }),
  };

  it('passes row shown when entity exists', () => {
    const p = props({ hasZones: true }, states);
    expect(renderRoomSelectorZone(p)).toContain('Passes:');
  });

  it('active chip matches passes state', () => {
    const p = props({ hasZones: true }, states, { passes: '×2' });
    const html = renderRoomSelectorZone(p);
    expect(html).toContain('rpc-pass-chip--selected');
  });

  it('passes row hidden when entity absent', () => {
    const p = props({ hasZones: true }, { [`select.${n}_zone_select`]: st('K', { options: ['K'] }) });
    expect(renderRoomSelectorZone(p)).not.toContain('Passes:');
  });
});

describe('renderRoomSelectorZone() — repeat last (Wave A1)', () => {
  const base = { [`select.${n}_zone_select`]: st('K', { options: ['K'] }) };

  it('repeat button shown when entity available', () => {
    const p = props({ hasZones: true }, {
      ...base,
      [`button.${n}_repeat_mission`]: st('unknown'),
    });
    expect(renderRoomSelectorZone(p)).toContain('Repeat last');
  });

  it('repeat button hidden when entity unavailable', () => {
    const p = props({ hasZones: true }, {
      ...base,
      [`button.${n}_repeat_mission`]: st('unavailable'),
    });
    expect(renderRoomSelectorZone(p)).not.toContain('Repeat last');
  });

  it('repeat button hidden when entity missing', () => {
    const p = props({ hasZones: true }, base);
    expect(renderRoomSelectorZone(p)).not.toContain('Repeat last');
  });
});

describe('renderRoomSelectorZone() — Wave B3 settings panel', () => {
  const base = { [`select.${n}_zone_select`]: st('K', { options: ['K'] }) };

  it('settings row hidden when no setting entities', () => {
    const p = props({ hasZones: true }, base);
    expect(renderRoomSelectorZone(p)).not.toContain('rpc-settings-row');
  });

  it('settings row shown when edge_clean entity exists', () => {
    const p = props({ hasZones: true }, {
      ...base,
      [`switch.${n}_edge_clean`]: st('on'),
    });
    expect(renderRoomSelectorZone(p)).toContain('rpc-settings-row');
    expect(renderRoomSelectorZone(p)).toContain('Settings');
  });

  it('settings panel hidden when settingsPanelOpen=false', () => {
    const p = props({ hasZones: true }, {
      ...base,
      [`switch.${n}_edge_clean`]: st('on'),
    });
    expect(renderRoomSelectorZone(p)).not.toContain('rpc-settings-panel');
  });

  it('settings panel shown when settingsPanelOpen=true', () => {
    const p = props({ hasZones: true }, {
      ...base,
      [`switch.${n}_edge_clean`]: st('on'),
    }, { settingsPanelOpen: true });
    expect(renderRoomSelectorZone(p)).toContain('rpc-settings-panel');
  });

  it('edge clean ● when on', () => {
    const p = props({ hasZones: true }, {
      ...base,
      [`switch.${n}_edge_clean`]: st('on'),
    }, { settingsPanelOpen: true });
    const html = renderRoomSelectorZone(p);
    expect(html).toContain('rpc-setting-on');
    expect(html).toContain('●');
  });

  it('edge clean ○ when off', () => {
    const p = props({ hasZones: true }, {
      ...base,
      [`switch.${n}_edge_clean`]: st('off'),
    }, { settingsPanelOpen: true });
    const html = renderRoomSelectorZone(p);
    expect(html).not.toContain('rpc-setting-on');
    expect(html).toContain('○');
  });

  it('carpet boost cycle button shows current value', () => {
    const p = props({ hasZones: true }, {
      ...base,
      [`select.${n}_carpet_boost_select`]: st('Boost', { options: ['Auto', 'Boost', 'Off'] }),
    }, { settingsPanelOpen: true });
    const html = renderRoomSelectorZone(p);
    expect(html).toContain('Boost ▼');
    expect(html).toContain('data-cycle-entity');
  });

  it('always_finish entity hidden when absent from panel', () => {
    const p = props({ hasZones: true }, {
      ...base,
      [`switch.${n}_edge_clean`]: st('on'),
    }, { settingsPanelOpen: true });
    expect(renderRoomSelectorZone(p)).not.toContain('Always finish');
  });
});

describe('renderRoomSelectorZone() — F5 room chip icons', () => {
  const smartStates = {
    'select.roomba_smart_zone_select': {
      entity_id: 'select.roomba_smart_zone_select',
      state: 'Kitchen',
      attributes: {
        options: ['Kitchen', 'Bedroom', 'Unknown Room'],
        region_icons: { Kitchen: 'silverware-fork-knife', Bedroom: 'bed' },
      },
      last_changed: '2025-05-14T10:00:00Z',
      last_updated: '2025-05-14T10:00:00Z',
    },
  };

  it('renders emoji icon from MDI_TO_EMOJI for mapped icon', () => {
    const html = renderRoomSelectorZone({
      hass: makeHass(smartStates),
      config: baseConfig,
      caps: { ...fullCaps, hasSmartZones: true },
      robotName: 'roomba',
      selectedRooms: new Set(),
      passes: 'Auto',
      isSending: false, sendError: null,
      settingsPanelOpen: false,
    });
    expect(html).toContain('🍽️ Kitchen');
    expect(html).toContain('🛏️ Bedroom');
  });

  it('renders fallback 📍 for unknown MDI icon', () => {
    const states = {
      'select.roomba_smart_zone_select': {
        ...smartStates['select.roomba_smart_zone_select'],
        attributes: {
          options: ['Office'],
          region_icons: { Office: 'totally-unknown-icon' },
        },
      },
    };
    const html = renderRoomSelectorZone({
      hass: makeHass(states),
      config: baseConfig,
      caps: { ...fullCaps, hasSmartZones: true },
      robotName: 'roomba',
      selectedRooms: new Set(),
      passes: 'Auto',
      isSending: false, sendError: null,
      settingsPanelOpen: false,
    });
    expect(html).toContain('📍 Office');
  });

  it('renders room name only (no icon) when region_icons absent', () => {
    const states = {
      'select.roomba_smart_zone_select': {
        entity_id: 'select.roomba_smart_zone_select',
        state: 'Kitchen',
        attributes: { options: ['Kitchen'] },
        last_changed: '2025-05-14T10:00:00Z',
        last_updated: '2025-05-14T10:00:00Z',
      },
    };
    const html = renderRoomSelectorZone({
      hass: makeHass(states),
      config: baseConfig,
      caps: { ...fullCaps, hasSmartZones: true },
      robotName: 'roomba',
      selectedRooms: new Set(),
      passes: 'Auto',
      isSending: false, sendError: null,
      settingsPanelOpen: false,
    });
    expect(html).toContain('>Kitchen<');
    expect(html).not.toContain('📍');
  });
});

// ── F3b: show_settings gate + renderSettingsPanel export ─────────────────────
import { renderSettingsPanel } from '../../src/zones/room-selector-zone';

describe('renderSettingsPanel()', () => {
  const n = 'roomba';
  const cfg = baseConfig;

  it('returns empty string when show_settings:false', () => {
    const hass = makeHass({ [`switch.${n}_edge_clean`]: st('on') });
    expect(renderSettingsPanel(hass, { ...cfg, show_settings: false }, n, false)).toBe('');
  });

  it('returns empty string when no settings entities present', () => {
    expect(renderSettingsPanel(makeHass(), cfg, n, false)).toBe('');
  });

  it('renders toggle row when edge_clean entity present', () => {
    const hass = makeHass({ [`switch.${n}_edge_clean`]: st('on') });
    const html = renderSettingsPanel(hass, cfg, n, true);
    expect(html).toContain('Edge clean');
    expect(html).toContain('data-switch-entity');
  });

  it('renders carpet boost cycle button when entity present', () => {
    const hass = makeHass({
      [`select.${n}_carpet_boost_select`]: st('Auto', { options: ['Auto', 'Eco', 'Performance'] }),
    });
    const html = renderSettingsPanel(hass, cfg, n, true);
    expect(html).toContain('Carpet boost');
    expect(html).toContain('data-cycle-entity');
  });

  it('panel collapsed when settingsPanelOpen is false', () => {
    const hass = makeHass({ [`switch.${n}_edge_clean`]: st('on') });
    const html = renderSettingsPanel(hass, cfg, n, false);
    expect(html).toContain('data-settings-toggle');
    expect(html).not.toContain('rpc-settings-panel');
  });
});

describe('renderRoomSelectorZone() — show_settings gate', () => {
  it('hides settings when show_settings:false', () => {
    const html = renderRoomSelectorZone(props(
      { hasZones: true, hasSmartZones: true },
      { [`select.${n}_smart_zone_select`]: st('Kitchen', { options: ['Kitchen'] }),
        [`switch.${n}_edge_clean`]: st('on') },
      { config: { ...baseConfig, show_settings: false } },
    ));
    expect(html).not.toContain('data-settings-toggle');
  });
});

// ── v2.0: includeSettingsPanel flag (Settings tab decoupling) ───────────────
describe('renderRoomSelectorZone() — v2.0 includeSettingsPanel', () => {
  it('embeds the settings panel by default (includeSettingsPanel omitted)', () => {
    const html = renderRoomSelectorZone(props(
      { hasZones: true, hasSmartZones: true },
      { [`select.${n}_smart_zone_select`]: st('Kitchen', { options: ['Kitchen'] }),
        [`switch.${n}_edge_clean`]: st('on') },
    ));
    expect(html).toContain('data-settings-toggle');
  });

  it('suppresses the embedded settings panel when includeSettingsPanel: false', () => {
    const html = renderRoomSelectorZone(props(
      { hasZones: true, hasSmartZones: true },
      { [`select.${n}_smart_zone_select`]: st('Kitchen', { options: ['Kitchen'] }),
        [`switch.${n}_edge_clean`]: st('on') },
      { includeSettingsPanel: false },
    ));
    expect(html).not.toContain('data-settings-toggle');
    // Room chips themselves must still render — only the settings panel is suppressed
    expect(html).toContain('rpc-room-chip');
  });
});
