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
    isSendingClean: false,
    sendError: null,
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

  // v2.5.0 — "Start selected rooms" previously showed no sending-in-progress
  // state at all: runCleanSelected() tracks isSendingClean, a separate flag
  // from the generic loadingAction system every other header button uses,
  // and isSendingClean was never wired into header.ts.
  it('shows the spinner and hides the label when isSendingClean is true', () => {
    const html = render(
      { 'vacuum.roomba': st('docked') },
      { caps: { ...defaultCaps, hasSmartZones: true }, selectedRoomCount: 2, isSendingClean: true },
    );
    expect(html).toContain('rpc-btn-loading');
    expect(html).toContain('rpc-spinner');
    expect(html).not.toContain('Start 2 selected rooms');
  });

  it('disables the button while isSendingClean is true', () => {
    const html = render(
      { 'vacuum.roomba': st('docked') },
      { caps: { ...defaultCaps, hasSmartZones: true }, selectedRoomCount: 2, isSendingClean: true },
    );
    const btn = html.match(/<button[^>]*data-action="clean-selected"[^>]*>/)?.[0] ?? '';
    expect(btn).toContain('disabled');
  });

  it('no spinner and button enabled when isSendingClean is false', () => {
    const html = render(
      { 'vacuum.roomba': st('docked') },
      { caps: { ...defaultCaps, hasSmartZones: true }, selectedRoomCount: 2, isSendingClean: false },
    );
    expect(html).toContain('Start 2 selected rooms');
    expect(html).not.toContain('rpc-btn-loading');
    const btn = html.match(/<button[^>]*data-action="clean-selected"[^>]*>/)?.[0] ?? '';
    expect(btn).not.toContain('disabled');
  });

  it('isSendingClean does not affect an unrelated action\'s loading spinner (loadingAction stays independent)', () => {
    const html = render(
      { 'vacuum.roomba': st('cleaning') },
      { loadingAction: 'pause', isSendingClean: true },
    );
    // 'pause' should still show its own spinner via loadingAction, not
    // accidentally suppressed or double-spun by the unrelated flag.
    const btn = html.match(/<button[^>]*data-action="pause"[^>]*>[\s\S]*?<\/button>/)?.[0] ?? '';
    expect(btn).toContain('rpc-btn-loading');
  });

  // v2.5.0 — sendError previously reached only the ⚙ tab's own room-picker
  // (room-selector-zone.ts); a failed clean_room call while the user was
  // on any other tab showed nothing at all where they were looking.
  it('shows the send-error message in the header when sendError is set', () => {
    const html = render(
      { 'vacuum.roomba': st('docked') },
      { sendError: 'Start command may not have been received — check the iRobot app' },
    );
    expect(html).toContain('rpc-send-error');
    expect(html).toContain('Start command may not have been received');
  });

  it('no send-error element when sendError is null', () => {
    const html = render({ 'vacuum.roomba': st('docked') }, { sendError: null });
    expect(html).not.toContain('rpc-send-error');
  });

  it('escapes sendError content (defensive, matches room-selector-zone\'s own handling)', () => {
    const html = render(
      { 'vacuum.roomba': st('docked') },
      { sendError: '<script>alert(1)</script>' },
    );
    expect(html).not.toContain('<script>alert(1)</script>');
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

describe('renderHeader() — v2.2.0 recharge-aware duration line', () => {
  const capsProgress = { ...defaultCaps, hasMissionProgressSensor: true };

  it('shows total duration with charging share after a mid-mission recharge', () => {
    const html = render(
      {
        'vacuum.roomba': st('cleaning', {}),
        [`sensor.${n}_mission_progress`]: st('45', {
          current_room: 'Living room', mission_duration_min: 156, recharge_min: 42,
        }),
      },
      { caps: capsProgress },
    );
    expect(html).toContain('156 min (42 min charging)');
  });

  it('no duration line when recharge_min is 0 — normal missions stay unchanged', () => {
    const html = render(
      {
        'vacuum.roomba': st('cleaning', {}),
        [`sensor.${n}_mission_progress`]: st('45', {
          current_room: 'Living room', mission_duration_min: 38, recharge_min: 0,
        }),
      },
      { caps: capsProgress },
    );
    expect(html).not.toContain('min charging');
    expect(html).not.toContain('38 min');
  });

  it('no duration line when attributes absent (integration < 2.8.6)', () => {
    const html = render(
      {
        'vacuum.roomba': st('cleaning', {}),
        [`sensor.${n}_mission_progress`]: st('45', { current_room: 'Living room' }),
      },
      { caps: capsProgress },
    );
    expect(html).not.toContain('min charging');
  });
});

// v2.5.0 I18N — end-to-end proof that a non-English hass.language actually
// changes rendered header output, not just the dictionaries in isolation.
describe('renderHeader() — v2.5.0 I18N end-to-end', () => {
  it('renders German text when hass.language is de', () => {
    const html = renderHeader({
      hass: { ...makeHass({ 'vacuum.roomba': st('docked') }), language: 'de' },
      config: baseConfig,
      caps: defaultCaps,
      robotName: n,
      loadingAction: null,
      todayMissionCount: null,
      missionData: null,
      roomPickerOpen: false,
      selectedRoomCount: 0,
      isSendingClean: false,
      sendError: null,
    });
    expect(html).toContain('Angedockt'); // stateDocked
    expect(html).toContain('Vollständige Reinigung starten'); // startFullClean
    expect(html).not.toContain('Docked');
    expect(html).not.toContain('Start full clean');
  });

  it('falls back to English for an unsupported hass.language', () => {
    const html = renderHeader({
      hass: { ...makeHass({ 'vacuum.roomba': st('docked') }), language: 'sv' },
      config: baseConfig,
      caps: defaultCaps,
      robotName: n,
      loadingAction: null,
      todayMissionCount: null,
      missionData: null,
      roomPickerOpen: false,
      selectedRoomCount: 0,
      isSendingClean: false,
      sendError: null,
    });
    expect(html).toContain('Docked');
  });
});

// ── v2.5.0 F2 — phase slugs ──────────────────────────────────────────────────
// The phase sensor reports slugs since integration 4.1 (`emptying_bin`, not
// the raw MQTT `evac` the header compared against — that branch never fired).
describe('renderHeader() — v2.5.0 F2 phase slugs', () => {
  const caps = { ...defaultCaps, hasMissionPhase: true };

  it('emptying_bin → "Emptying bin" header state, no misleading actions', () => {
    for (const vac of ['returning', 'docked']) {
      const html = render({
        'vacuum.roomba': st(vac),
        [`sensor.${n}_phase`]: st('emptying_bin'),
      }, { caps });
      expect(html).toContain('Emptying bin');
      expect(html).not.toContain('data-action="return_home"');
      expect(html).not.toContain('data-action="start"');
    }
  });

  it('emptying_bin while the vacuum still reports cleaning keeps Pause', () => {
    const html = render({
      'vacuum.roomba': st('cleaning'),
      [`sensor.${n}_phase`]: st('emptying_bin'),
    }, { caps });
    expect(html).toContain('data-action="pause"');
  });

  it('negative control: the raw MQTT value `evac` is not a phase slug any more', () => {
    const html = render({
      'vacuum.roomba': st('docked'),
      [`sensor.${n}_phase`]: st('evac'),
    }, { caps });
    expect(html).not.toContain('Emptying bin');
  });

  it('charging_mid_mission → recharging state, without mission_active or ETA', () => {
    const html = render({
      'vacuum.roomba': st('docked'),
      [`sensor.${n}_phase`]: st('charging_mid_mission'),
    }, { caps });
    expect(html).toContain('Recharging — mission continues');
    expect(html).toContain('data-action="return_home"');   // cancel mission
  });

  it('charging_mid_mission while NOT docked does not claim recharging', () => {
    const html = render({
      'vacuum.roomba': st('returning'),
      [`sensor.${n}_phase`]: st('charging_mid_mission'),
    }, { caps });
    expect(html).not.toContain('Recharging');
  });

  it('no_contact → "No contact with robot" even when the vacuum still says docked', () => {
    const html = render({
      'vacuum.roomba': st('docked'),
      [`sensor.${n}_phase`]: st('no_contact'),
    }, { caps });
    expect(html).toContain('No contact with robot');
    expect(html).toContain('rpc-offline-state');
    expect(html).not.toContain('>Docked<');
  });

  it('not_responding → same offline state; an active error still wins', () => {
    expect(render({
      'vacuum.roomba': st('idle'),
      [`sensor.${n}_phase`]: st('not_responding'),
    }, { caps })).toContain('No contact with robot');
    expect(render({
      'vacuum.roomba': st('error'),
      [`sensor.${n}_phase`]: st('not_responding'),
    }, { caps })).not.toContain('No contact with robot');
  });

  it('station phases show the integration\'s own text (formatter), never the slug', () => {
    const hass = makeHass({
      'vacuum.roomba': st('docked'),
      [`sensor.${n}_phase`]: st('washing_pad'),
    });
    const plain = renderHeader({
      hass, config: baseConfig, caps, robotName: n, loadingAction: null,
      todayMissionCount: null, missionData: null, roomPickerOpen: false,
      selectedRoomCount: 0, isSendingClean: false, sendError: null,
    });
    expect(plain).toContain('Washing pad');   // humanised fallback
    expect(plain).not.toContain('washing_pad');
    hass.formatEntityState = (obj) => obj.state === 'washing_pad' ? 'Pad wird gewaschen' : obj.state;
    const localized = renderHeader({
      hass, config: baseConfig, caps, robotName: n, loadingAction: null,
      todayMissionCount: null, missionData: null, roomPickerOpen: false,
      selectedRoomCount: 0, isSendingClean: false, sendError: null,
    });
    expect(localized).toContain('Pad wird gewaschen');
  });
});

// ── v2.5.0 F4 — current room from device_tracker.{n}.room ────────────────────
describe('renderHeader() — v2.5.0 F4 current room', () => {
  const caps = { ...defaultCaps, hasPositionTracker: true };

  it('reads the `room` attribute of device_tracker.{n} (integration naming)', () => {
    const html = render({
      'vacuum.roomba': st('cleaning'),
      'device_tracker.roomba': st('Kitchen', { room: 'Kitchen' }),
    }, { caps });
    expect(html).toContain('rpc-current-room');
    expect(html).toContain('Kitchen');
  });

  it('a localized status label in the STATE is never shown as a room', () => {
    // 4.x states include "Stuck", "Dock busy" and es/fr/it/nl/pl/pt labels the
    // old sentinel list did not know; without a `room` attribute, nothing shows.
    const html = render({
      'vacuum.roomba': st('cleaning'),
      'device_tracker.roomba': st('Bloqué'),
    }, { caps });
    expect(html).not.toContain('rpc-current-room');
  });

  it('a null room attribute (room not resolved yet) shows nothing', () => {
    const html = render({
      'vacuum.roomba': st('cleaning'),
      'device_tracker.roomba': st('Cleaning', { room: null }),
    }, { caps });
    expect(html).not.toContain('rpc-current-room');
  });
});

// ── v2.5.0 — area sensors honour their unit (m² since integration 4.x) ──────
describe('renderHeader() — v2.5.0 area units', () => {
  const caps = { ...defaultCaps, hasArea: true, hasMissionActive: true };

  it('area_cleaned_today in m² is shown correctly on a metric install', () => {
    const hass = makeHass({
      'vacuum.roomba': st('cleaning'),
      [`binary_sensor.${n}_mission_active`]: st('on'),
      [`sensor.${n}_area_cleaned_today`]: st('20', { unit_of_measurement: 'm²' }),
    });
    hass.config = { unit_system: { length: 'km' } };
    const html = renderHeader({
      hass, config: baseConfig, caps, robotName: n, loadingAction: null,
      todayMissionCount: null, missionData: null, roomPickerOpen: false,
      selectedRoomCount: 0, isSendingClean: false, sendError: null,
    });
    expect(html).toContain('20 m² already today');
  });

  it('…and converted, rounded, on an imperial install', () => {
    const html = render({
      'vacuum.roomba': st('cleaning'),
      [`binary_sensor.${n}_mission_active`]: st('on'),
      [`sensor.${n}_area_cleaned_today`]: st('20', { unit_of_measurement: 'm²' }),
    }, { caps });
    expect(html).toContain('215 ft² already today');
  });
});

// ── v2.5.0 — last-cleaned room chips take icons from the zone select ─────────
describe('renderHeader() — v2.5.0 cleaned-room chip icons', () => {
  it('uses region_icons from the active cloud zone select', () => {
    const html = render({
      'vacuum.roomba': st('docked', { last_cleaned_rooms: ['Kitchen'] }),
      [`select.${n}_cloud_zone_p1`]: st('Kitchen', {
        options: ['Kitchen'], is_active_map: true, region_icons: { Kitchen: 'mdi:fridge' },
      }),
    }, { caps: { ...defaultCaps, hasCleanedRooms: true } });
    expect(html).toContain('rpc-cleaned-chip');
    expect(html).toMatch(/rpc-cleaned-chip">[^<]* Kitchen/);
  });
});
