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
  it('docked: shows Start full clean only (no Rooms… without hasZones)', () => {
    const html = render({ 'vacuum.roomba': st('docked') });
    expect(html).toContain('Start full clean');
    const btnCount = (html.match(/<button class="rpc-btn/g) || []).length;
    expect(btnCount).toBeLessThanOrEqual(2);
  });

  it('docked + hasZones: shows Start and Rooms… (2 buttons)', () => {
    const html = render({ 'vacuum.roomba': st('docked') }, { caps: { ...defaultCaps, hasZones: true } });
    expect(html).toContain('Start full clean');
    expect(html).toContain('Rooms…');
  });

  it('docked + companion mode: Rooms… hidden even with hasZones', () => {
    const html = render(
      { 'vacuum.roomba': st('docked') },
      { config: { ...baseConfig, mode: 'companion' }, caps: { ...defaultCaps, hasZones: true } },
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
      { caps: { ...defaultCaps, hasZones: true }, selectedRoomCount: 2 },
    );
    expect(html).toContain('Start 2 selected rooms');
    expect(html).not.toContain('Rooms…');
    expect(html).not.toContain('Start full clean');
  });

  it('singular "1 selected room" for count of 1', () => {
    const html = render(
      { 'vacuum.roomba': st('docked') },
      { caps: { ...defaultCaps, hasZones: true }, selectedRoomCount: 1 },
    );
    expect(html).toContain('Start 1 selected room');
    expect(html).not.toContain('Start 1 selected rooms');
  });

  it('falls back to Start full clean + Rooms… when selectedRoomCount is 0', () => {
    const html = render(
      { 'vacuum.roomba': st('docked') },
      { caps: { ...defaultCaps, hasZones: true }, selectedRoomCount: 0 },
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
