import { describe, it, expect } from 'vitest';
import { renderHeader } from '../src/header';
import { makeHass, defaultCaps, baseConfig, st } from './helpers';

const n = 'roomba';

function render(states: Record<string, ReturnType<typeof st>> = {}, overrides: Partial<Parameters<typeof renderHeader>[0]> = {}) {
  return renderHeader({
    hass: makeHass(states),
    config: baseConfig,
    caps: defaultCaps,
    robotName: n,
    loadingAction: null,
    todayMissionCount: null,
    missionData: null,
    roomPickerOpen: false,
    selectedRoomCount: 0,
    ...overrides,
  });
}

describe('renderHeader() — state-contextual buttons (v2.0: max 2, 3 for paused)', () => {
  it('docked: shows Start full clean only (no Rooms… without hasSmartZones)', () => {
    const html = render({ 'vacuum.roomba': st('docked') });
    expect(html).toContain('Start full clean');
    const btnCount = (html.match(/<button class="rpc-btn/g) || []).length;
    expect(btnCount).toBeLessThanOrEqual(2);
  });

  it('docked + hasSmartZones: shows Start and Rooms… (2 buttons)', () => {
    const html = render({ 'vacuum.roomba': st('docked') }, { caps: { ...defaultCaps, hasSmartZones: true } });
    expect(html).toContain('Start full clean');
    expect(html).toContain('Rooms…');
  });

  // v2.0.2 bug fix: roomba_plus.clean_room throws a ServiceValidationError
  // for any robot where map_capability != SMART. hasZones is true for
  // EITHER smart_zone_select (SMART) OR zone_select (EPHEMERAL) — gating
  // this button on hasZones let it appear for EPHEMERAL robots, promising
  // a targeted clean that would then fail on tap.
  it('docked + hasZones true via EPHEMERAL zone_select but hasSmartZones false: Rooms… hidden', () => {
    const html = render(
      { 'vacuum.roomba': st('docked') },
      { caps: { ...defaultCaps, hasZones: true, hasSmartZones: false } },
    );
    expect(html).not.toContain('Rooms…');
  });

  it('docked + companion mode: Rooms… hidden even with hasSmartZones', () => {
    const html = render(
      { 'vacuum.roomba': st('docked') },
      { config: { ...baseConfig, mode: 'companion' }, caps: { ...defaultCaps, hasSmartZones: true } },
    );
    expect(html).not.toContain('Rooms…');
  });

  it('cleaning: shows Pause and Return home (2 buttons)', () => {
    const html = render({ 'vacuum.roomba': st('cleaning') });
    expect(html).toContain('Pause');
    expect(html).toContain('Return home');
    expect(html).not.toContain('Start full clean');
  });

  it('paused: shows Resume, Return home, Stop (3 buttons)', () => {
    const html = render({ 'vacuum.roomba': st('paused') });
    expect(html).toContain('Resume');
    expect(html).toContain('Return home');
    expect(html).toContain('Stop');
  });

  it('error: shows Return home and Retry (2 buttons)', () => {
    const html = render({ 'vacuum.roomba': st('error') });
    expect(html).toContain('Return home');
    expect(html).toContain('Retry');
  });

  it('demand-blocked + docked: shows "Start anyway" not plain "Start"', () => {
    const html = render(
      { 'vacuum.roomba': st('docked'), [`binary_sensor.${n}_demand_clean_blocked`]: st('on') },
      { caps: { ...defaultCaps, hasDemandBlocked: true } },
    );
    expect(html).toContain('▶ Start anyway');
    // aria-label intentionally stays the generic "Start full clean" for
    // consistent accessibility naming across variants — only the visible
    // button text changes when demand-blocked.
    expect(html).not.toContain('▶ Start full clean');
  });
});

// ── v2.0 C7-ROOM-BOUNDS: header button swap when a selection is active ──────
describe('renderHeader() — v2.0 selected-room button swap', () => {
  it('shows "Start N selected rooms" and hides Rooms… when selectedRoomCount > 0', () => {
    const html = render(
      { 'vacuum.roomba': st('docked') },
      { caps: { ...defaultCaps, hasSmartZones: true }, selectedRoomCount: 2 },
    );
    expect(html).toContain('Start 2 selected rooms');
    expect(html).not.toContain('Rooms…');
    expect(html).not.toContain('Start full clean');
  });

  it('singular "1 selected room" for count of 1', () => {
    const html = render(
      { 'vacuum.roomba': st('docked') },
      { caps: { ...defaultCaps, hasSmartZones: true }, selectedRoomCount: 1 },
    );
    expect(html).toContain('Start 1 selected room');
    expect(html).not.toContain('Start 1 selected rooms');
  });

  it('falls back to Start full clean + Rooms… when selectedRoomCount is 0', () => {
    const html = render(
      { 'vacuum.roomba': st('docked') },
      { caps: { ...defaultCaps, hasSmartZones: true }, selectedRoomCount: 0 },
    );
    expect(html).toContain('Start full clean');
    expect(html).toContain('Rooms…');
  });
});

describe('renderHeader() — v2.0 unified spatial line (F11 + C3-PROGRESS merge)', () => {
  it('falls back to mission_destination line when hasMissionProgressSensor is false', () => {
    const html = render({
      'vacuum.roomba': st('cleaning', { mission_destination: 'Kitchen' }),
    });
    expect(html).toContain('rpc-spatial-line');
    expect(html).toContain('→ Targeting: Kitchen');
  });

  it('uses mission_progress sensor (room + %) when hasMissionProgressSensor is true', () => {
    const html = render(
      {
        'vacuum.roomba': st('cleaning', { mission_destination: 'Walk-in Closet' }),
        [`sensor.${n}_mission_progress`]: st('67', { current_room: 'Hallway' }),
      },
      { caps: { ...defaultCaps, hasMissionProgressSensor: true } },
    );
    expect(html).toContain('Hallway');
    expect(html).toContain('67%');
    // The merged line should NOT also show the old destination-only line —
    // there should be exactly one rpc-spatial-line, not two competing lines.
    const matches = html.match(/rpc-spatial-line/g) ?? [];
    expect(matches.length).toBe(1);
    expect(html).not.toContain('Targeting: Walk-in Closet');
  });

  it('no spatial line when neither current_room nor progress % is available', () => {
    const html = render(
      { 'vacuum.roomba': st('cleaning') },
      { caps: { ...defaultCaps, hasMissionProgressSensor: true } },
    );
    expect(html).not.toContain('rpc-spatial-line');
  });
});

describe('renderHeader() — v2.0 recharge-aware line', () => {
  it('shows recharge line with minutes when mid-mission recharging', () => {
    const future = new Date(Date.now() + 10 * 60000).toISOString();
    const html = render(
      {
        'vacuum.roomba': st('docked'),
        [`binary_sensor.${n}_mission_active`]: st('on'),
        [`sensor.${n}_mission_expire_time`]: st(future),
        [`sensor.${n}_mission_progress`]: st('40', { recharge_min: 3 }),
      },
      { caps: { ...defaultCaps, hasMissionActive: true, hasMissionProgressSensor: true } },
    );
    expect(html).toContain('rpc-recharge-line');
    expect(html).toContain('3 min');
  });

  it('no recharge line when not recharging', () => {
    const html = render(
      { 'vacuum.roomba': st('cleaning') },
      { caps: { ...defaultCaps, hasMissionProgressSensor: true } },
    );
    expect(html).not.toContain('rpc-recharge-line');
  });
});

// ── v2.1.0 A1 — connectivity indicator ──────────────────────────────────────
describe('renderHeader() — A1 connectivity indicator', () => {
  const caps = { ...defaultCaps, hasConnectivity: true };

  it('hidden when cloud connected and MQTT fresh', () => {
    const html = render({
      'vacuum.roomba': st('docked'),
      'binary_sensor.roomba_cloud_connected': st('on'),
      'binary_sensor.roomba_mqtt_stale': st('off'),
    }, { caps });
    expect(html).not.toContain('rpc-connectivity-degraded');
  });

  it('shows Cloud offline when cloud disconnected', () => {
    const html = render({
      'vacuum.roomba': st('docked'),
      'binary_sensor.roomba_cloud_connected': st('off'),
      'binary_sensor.roomba_mqtt_stale': st('off'),
    }, { caps });
    expect(html).toContain('rpc-connectivity-degraded');
    expect(html).toContain('Cloud offline');
  });

  it('shows Robot offline when MQTT stale (takes priority over cloud label)', () => {
    const html = render({
      'vacuum.roomba': st('docked'),
      'binary_sensor.roomba_cloud_connected': st('off'),
      'binary_sensor.roomba_mqtt_stale': st('on'),
    }, { caps });
    expect(html).toContain('Robot offline');
  });

  it('absent entirely when hasConnectivity is false', () => {
    const html = render({
      'vacuum.roomba': st('docked'),
      'binary_sensor.roomba_cloud_connected': st('off'),
    }, { caps: defaultCaps });
    expect(html).not.toContain('rpc-connectivity');
  });
});

// ── v2.1.0 A2 — firmware badge ───────────────────────────────────────────────
describe('renderHeader() — A2 firmware badge', () => {
  const caps = { ...defaultCaps, hasFirmware: true };

  it('shows badge when firmware changed within 24h', () => {
    const recent = new Date(Date.now() - 60 * 60 * 1000).toISOString(); // 1h ago
    const fw = { ...st('22.52.10'), last_changed: recent };
    const html = render({
      'vacuum.roomba': st('docked'),
      'sensor.roomba_firmware_version': fw,
    }, { caps });
    expect(html).toContain('rpc-firmware-badge');
    expect(html).toContain('22.52.10');
  });

  it('hides badge when firmware change older than 24h', () => {
    const old = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
    const fw = { ...st('22.52.10'), last_changed: old };
    const html = render({
      'vacuum.roomba': st('docked'),
      'sensor.roomba_firmware_version': fw,
    }, { caps });
    expect(html).not.toContain('rpc-firmware-badge');
  });

  it('hides badge when version unavailable', () => {
    const fw = { ...st('unavailable'), last_changed: new Date().toISOString() };
    const html = render({
      'vacuum.roomba': st('docked'),
      'sensor.roomba_firmware_version': fw,
    }, { caps });
    expect(html).not.toContain('rpc-firmware-badge');
  });
});

// ── v2.1.0 A4 — current-room line ────────────────────────────────────────────
describe('renderHeader() — A4 current-room line', () => {
  // hasPositionTracker on, mission-progress sensor OFF so spatialLine doesn't
  // pre-empt A4 (on SMART the two share a resolver; A4 suppresses when spatial
  // already shows a room).
  const caps = { ...defaultCaps, hasPositionTracker: true };

  it('shows room name (device_tracker state) during cleaning', () => {
    const html = render({
      'vacuum.roomba': st('cleaning'),
      'device_tracker.roomba_position': st('Kitchen'),
    }, { caps });
    expect(html).toContain('rpc-current-room');
    expect(html).toContain('Kitchen');
  });

  it('hidden when docked (no active mission)', () => {
    const html = render({
      'vacuum.roomba': st('docked'),
      'device_tracker.roomba_position': st('Docked'),
    }, { caps });
    expect(html).not.toContain('rpc-current-room');
  });

  it('hidden when state is the localized Docked sentinel', () => {
    const html = render({
      'vacuum.roomba': st('cleaning'),
      'device_tracker.roomba_position': st('Docked'),
    }, { caps });
    expect(html).not.toContain('rpc-current-room');
  });

  it('hidden when state is the active-fallback sentinel (Cleaning/Unterwegs)', () => {
    const htmlEn = render({
      'vacuum.roomba': st('cleaning'),
      'device_tracker.roomba_position': st('Cleaning'),
    }, { caps });
    expect(htmlEn).not.toContain('rpc-current-room');
    const htmlDe = render({
      'vacuum.roomba': st('cleaning'),
      'device_tracker.roomba_position': st('Unterwegs'),
    }, { caps });
    expect(htmlDe).not.toContain('rpc-current-room');
  });

  it('suppressed when spatial line already shows the room (SMART)', () => {
    const smartCaps = { ...caps, hasMissionProgressSensor: true };
    const mp = { ...st('42'), attributes: { current_room: 'Kitchen' } };
    const html = render({
      'vacuum.roomba': st('cleaning'),
      'sensor.roomba_mission_progress': mp,
      'device_tracker.roomba_position': st('Kitchen'),
    }, { caps: smartCaps });
    // Spatial line shows Kitchen; A4 must not add a duplicate current-room line.
    expect(html).not.toContain('rpc-current-room');
  });

  it('absent when hasPositionTracker false', () => {
    const html = render({
      'vacuum.roomba': st('cleaning'),
      'device_tracker.roomba_position': st('Kitchen'),
    }, { caps: defaultCaps });
    expect(html).not.toContain('rpc-current-room');
  });
});

// ── v2.1.0 — header reads active robot, not config.entity ────────────────────
describe('renderHeader() — multi-robot active entity', () => {
  it('reads state from activeRobot when provided', () => {
    const html = render(
      {
        'vacuum.roomba': st('docked'),
        'vacuum.roomba_upstairs': st('cleaning'),
      },
      { activeRobot: 'vacuum.roomba_upstairs', robotName: 'roomba_upstairs' },
    );
    // Active robot is cleaning → Pause button present; if it read config.entity
    // (docked) it would show Start instead.
    expect(html).toContain('Pause');
    expect(html).not.toContain('Start full clean');
  });
});
