import { describe, it, expect } from 'vitest';
import { renderStatusZone, StatusZoneProps } from '../../src/zones/status-zone';
import { makeHass, defaultCaps, fullCaps, baseConfig, st } from '../helpers';

const n = 'roomba';

function props(
  vacState: string,
  extra: Partial<StatusZoneProps> = {},
  extraStates: Record<string, ReturnType<typeof st>> = {},
): StatusZoneProps {
  return {
    hass: makeHass({ 'vacuum.roomba': st(vacState, { friendly_name: 'Roomba i7+' }), ...extraStates }),
    config: baseConfig,
    caps: defaultCaps,
    robotName: n,
    loadingAction: null,
    todayMissionCount: null,
    missionData: null,
    ...extra,
  };
}

describe('renderStatusZone() — state labels', () => {
  it('cleaning → "Cleaning" label', () =>
    expect(renderStatusZone(props('cleaning'))).toContain('Cleaning'));

  it('paused → "Paused" label', () =>
    expect(renderStatusZone(props('paused'))).toContain('Paused'));

  it('returning → "Returning to dock"', () =>
    expect(renderStatusZone(props('returning'))).toContain('Returning to dock'));

  it('docked → "Docked"', () =>
    expect(renderStatusZone(props('docked'))).toContain('Docked'));

  it('idle → "Idle"', () =>
    expect(renderStatusZone(props('idle'))).toContain('Idle'));

  it('unavailable → "Unavailable"', () =>
    expect(renderStatusZone(props('unavailable'))).toContain('Unavailable'));

  it('isMop=true → "Mopping" instead of "Cleaning"', () => {
    const p = props('cleaning', { caps: { ...defaultCaps, isMop: true } });
    const html = renderStatusZone(p);
    expect(html).toContain('Mopping');
    expect(html).not.toContain('Cleaning');
  });

  it('friendly_name shown as robot identity', () =>
    expect(renderStatusZone(props('docked'))).toContain('Roomba i7+'));
});

describe('renderStatusZone() — error state', () => {
  it('error with sensor → shows description', () => {
    const p = props('error', {}, {
      [`sensor.${n}_last_error_code`]: st('2', { description: 'Main brush stuck', action: 'Clear debris' }),
    });
    const html = renderStatusZone(p);
    expect(html).toContain('Main brush stuck');
    expect(html).toContain('Clear debris');
  });

  it('error without sensor → generic message', () =>
    expect(renderStatusZone(props('error'))).toContain('check the iRobot app'));

  it('error adds red border class', () => {
    const html = renderStatusZone(props('error'));
    expect(html).toContain('rpc-error-state');
  });

  it('error state with error zone shown', () => {
    const p = props('error', {}, {
      [`sensor.${n}_last_error_code`]: st('2', { description: 'Stuck' }),
      [`sensor.${n}_last_error_zone`]: st('Kitchen'),
    });
    expect(renderStatusZone(p)).toContain('Kitchen');
  });

  it('error zone not shown when state is unknown', () => {
    const p = props('error', {}, {
      [`sensor.${n}_last_error_code`]: st('2', { description: 'Stuck' }),
      [`sensor.${n}_last_error_zone`]: st('unknown'),
    });
    expect(renderStatusZone(p)).not.toContain('Zone:');
  });
});

describe('renderStatusZone() — v1.9 states', () => {
  it('evac mission_phase → "Emptying bin"', () => {
    const p = props('cleaning', { caps: { ...defaultCaps, hasMissionPhase: true } }, {
      [`sensor.${n}_mission_phase`]: st('evac'),
    });
    expect(renderStatusZone(p)).toContain('Emptying bin');
  });

  it('mid-mission recharge with mission_active + expire time → countdown', () => {
    const expire = new Date(Date.now() + 8 * 60 * 1000).toISOString();
    const p = props('docked', { caps: { ...defaultCaps, hasMissionActive: true } }, {
      [`binary_sensor.${n}_mission_active`]:  st('on'),
      [`sensor.${n}_mission_expire_time`]:    st(expire),
    });
    const html = renderStatusZone(p);
    expect(html).toContain('Recharging');
    expect(html).toContain('min');
  });

  it('mid-mission recharge without expire time → generic message', () => {
    const p = props('docked', { caps: { ...defaultCaps, hasMissionActive: true } }, {
      [`binary_sensor.${n}_mission_active`]: st('on'),
    });
    expect(renderStatusZone(p)).toContain('mission continues');
  });

  it('docked + mission_active=off → normal Docked state', () => {
    const p = props('docked', { caps: { ...defaultCaps, hasMissionActive: true } }, {
      [`binary_sensor.${n}_mission_active`]: st('off'),
    });
    const html = renderStatusZone(p);
    expect(html).toContain('Docked');
    expect(html).not.toContain('Recharging');
  });
});

describe('renderStatusZone() — Wave A3 area-today', () => {
  it('area-today line shown during cleaning when sensor valid', () => {
    const p = props('cleaning', { caps: { ...defaultCaps, hasArea: true }, todayMissionCount: 0 }, {
      [`sensor.${n}_area_cleaned_today`]: st('412'),
    });
    expect(renderStatusZone(p)).toContain('already today');
  });

  it('area-today hidden when caps.hasArea false', () => {
    const p = props('cleaning', { caps: { ...defaultCaps, hasArea: false }, todayMissionCount: 0 }, {
      [`sensor.${n}_area_cleaned_today`]: st('412'),
    });
    expect(renderStatusZone(p)).not.toContain('already today');
  });

  it('area-today hidden during docked state', () => {
    const p = props('docked', { caps: { ...defaultCaps, hasArea: true }, todayMissionCount: 0 }, {
      [`sensor.${n}_area_cleaned_today`]: st('412'),
    });
    expect(renderStatusZone(p)).not.toContain('already today');
  });

  it('2nd mission ordinal shown when todayMissionCount=1', () => {
    const p = props('cleaning', { caps: { ...defaultCaps, hasArea: true }, todayMissionCount: 1 }, {
      [`sensor.${n}_area_cleaned_today`]: st('200'),
    });
    expect(renderStatusZone(p)).toContain('2nd mission');
  });

  it('3rd mission ordinal shown when todayMissionCount=2', () => {
    const p = props('cleaning', { caps: { ...defaultCaps, hasArea: true }, todayMissionCount: 2 }, {
      [`sensor.${n}_area_cleaned_today`]: st('200'),
    });
    expect(renderStatusZone(p)).toContain('3rd mission');
  });

  it('no ordinal shown when todayMissionCount=0 (first mission)', () => {
    const p = props('cleaning', { caps: { ...defaultCaps, hasArea: true }, todayMissionCount: 0 }, {
      [`sensor.${n}_area_cleaned_today`]: st('200'),
    });
    const html = renderStatusZone(p);
    expect(html).toContain('already today');
    expect(html).not.toContain('mission'); // no ordinal for first
  });
});

describe('renderStatusZone() — quick action buttons', () => {
  it('cleaning → Pause + Return home buttons', () => {
    const html = renderStatusZone(props('cleaning'));
    expect(html).toContain('Pause');
    expect(html).toContain('Return home');
    expect(html).not.toContain('▶ Start');
  });

  it('paused → Resume + Return home buttons', () => {
    const html = renderStatusZone(props('paused'));
    expect(html).toContain('Resume');
    expect(html).toContain('Return home');
  });

  it('docked → Start + Locate buttons', () => {
    const html = renderStatusZone(props('docked'));
    expect(html).toContain('▶ Start');
    expect(html).toContain('Locate');
  });

  it('returning → no action buttons', () => {
    const html = renderStatusZone(props('returning'));
    expect(html).not.toContain('data-action');
  });

  it('loading action → all buttons disabled', () => {
    const html = renderStatusZone(props('docked', { loadingAction: 'start' }));
    expect(html).toContain('disabled');
  });

  it('mid-mission recharge → Cancel mission button', () => {
    const expire = new Date(Date.now() + 8 * 60 * 1000).toISOString();
    const p = props('docked', { caps: { ...defaultCaps, hasMissionActive: true } }, {
      [`binary_sensor.${n}_mission_active`]: st('on'),
      [`sensor.${n}_mission_expire_time`]:   st(expire),
    });
    expect(renderStatusZone(p)).toContain('Cancel mission');
  });
});

describe('renderStatusZone() — progress bar', () => {
  it('progress bar rendered during cleaning with elapsed time', () => {
    const p = props('cleaning', {}, {
      'vacuum.roomba': st('cleaning', {
        friendly_name: 'Roomba',
        mission_elapsed_min: 15,
      }),
    });
    expect(renderStatusZone(p)).toContain('rpc-progress-fill');
  });

  it('no progress bar when not cleaning', () =>
    expect(renderStatusZone(props('docked'))).not.toContain('rpc-progress-fill'));
});

describe('renderStatusZone() — F1 last cleaned display', () => {
  const missionData = [
    {
      date: '2025-05-14', total: 1, completed: 1, stuck: 0, area_sqft: 412, result: 'completed' as const,
      missions: [{
        id: 'm1', started_at: '2025-05-14T07:14:00Z', ended_at: null,
        duration_min: 37, run_min: null, area_sqft: 412, result: 'completed',
        initiator: 'schedule', zones: ['Kitchen'], error_code: null,
        recharges: null, evacuations: null, dirt_events: null, wifi_signal: null, source: 'local' as const,
      }],
    },
  ];

  it('shows "Last cleaned:" when docked with missionData', () => {
    const html = renderStatusZone(props('docked', { missionData }));
    expect(html).toContain('Last cleaned:');
  });

  it('falls back to "Last mission:" when missionData is null', () => {
    const html = renderStatusZone(props('docked', { missionData: null }));
    // Fallback uses entity last_changed — shows "Last mission:" text
    expect(html).toContain('Last mission:');
  });

  it('"Last cleaned" not shown when cleaning (only when docked)', () => {
    const html = renderStatusZone(props('cleaning', { missionData }));
    expect(html).not.toContain('Last cleaned:');
    expect(html).not.toContain('Last mission:');
  });
});

describe('renderStatusZone() — F1 demand-blocked indicator', () => {
  it('demand-blocked shown when hasDemandBlocked and sensor is on', () => {
    const html = renderStatusZone(props(
      'docked',
      { caps: { ...defaultCaps, hasDemandBlocked: true }, missionData: null },
      { [`binary_sensor.${n}_demand_clean_blocked`]: st('on') },
    ));
    expect(html).toContain('rpc-demand-blocked');
    expect(html).toContain('waiting for home to be empty');
  });

  it('demand-blocked hidden when sensor is off', () => {
    const html = renderStatusZone(props(
      'docked',
      { caps: { ...defaultCaps, hasDemandBlocked: true }, missionData: null },
      { [`binary_sensor.${n}_demand_clean_blocked`]: st('off') },
    ));
    expect(html).not.toContain('rpc-demand-blocked');
  });

  it('demand-blocked hidden when cap is false (entity absent)', () => {
    const html = renderStatusZone(props(
      'docked',
      { caps: { ...defaultCaps, hasDemandBlocked: false }, missionData: null },
      { [`binary_sensor.${n}_demand_clean_blocked`]: st('on') },
    ));
    expect(html).not.toContain('rpc-demand-blocked');
  });

  it('demand-blocked not shown when cleaning (only when docked)', () => {
    const html = renderStatusZone(props(
      'cleaning',
      { caps: { ...defaultCaps, hasDemandBlocked: true }, missionData: null },
      { [`binary_sensor.${n}_demand_clean_blocked`]: st('on') },
    ));
    expect(html).not.toContain('rpc-demand-blocked');
  });
});
