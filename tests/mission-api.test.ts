import { describe, it, expect, vi } from 'vitest';
import { MissionApiClient } from '../src/mission-api';
import type { HomeAssistant, CardConfig } from '../src/types';

function makeHass(overrides?: Partial<HomeAssistant>): HomeAssistant {
  return {
    states: {},
    callService: vi.fn(),
    callWS: vi.fn().mockResolvedValue({ config_entry_id: 'entry-abc' }),
    fetchWithAuth: vi.fn().mockResolvedValue({ ok: true, json: async () => [] } as unknown as Response),
    language: 'en',
    config: { unit_system: { length: 'ft' } },
    ...overrides,
  };
}

const baseConfig: CardConfig = { entity: 'vacuum.roomba' };

describe('MissionApiClient — F3: entityId resolution', () => {
  it('uses config.entity when no explicit entityId passed', async () => {
    const hass = makeHass();
    const client = new MissionApiClient(hass, baseConfig);
    await client.fetchSummary(7);
    expect(hass.callWS).toHaveBeenCalledWith(
      expect.objectContaining({ entity_id: 'vacuum.roomba' })
    );
  });

  it('uses explicit entityId when provided (multi-robot)', async () => {
    const hass = makeHass();
    const client = new MissionApiClient(hass, baseConfig, 'vacuum.braava');
    await client.fetchSummary(7);
    expect(hass.callWS).toHaveBeenCalledWith(
      expect.objectContaining({ entity_id: 'vacuum.braava' })
    );
  });

  it('caches entryId — callWS called only once across multiple fetches', async () => {
    const hass = makeHass();
    const client = new MissionApiClient(hass, baseConfig);
    await client.fetchSummary(7);
    await client.fetchSummary(14);
    expect(hass.callWS).toHaveBeenCalledTimes(1);
  });
});

describe('MissionApiClient — F4: fetchRecords', () => {
  it('fetchRecords calls format=records endpoint', async () => {
    const hass = makeHass();
    const client = new MissionApiClient(hass, baseConfig);
    await client.fetchRecords(7);
    expect(hass.fetchWithAuth).toHaveBeenCalledWith(
      expect.stringContaining('format=records')
    );
  });

  it('fetchRecords returns empty array (not throws) on non-ok response', async () => {
    const hass = makeHass({
      fetchWithAuth: vi.fn().mockResolvedValue({ ok: false, status: 404 } as unknown as Response),
    });
    const client = new MissionApiClient(hass, baseConfig);
    const result = await client.fetchRecords(7);
    expect(result).toEqual([]);
  });

  it('fetchSummary calls format=summary endpoint', async () => {
    const hass = makeHass();
    const client = new MissionApiClient(hass, baseConfig);
    await client.fetchSummary(14);
    expect(hass.fetchWithAuth).toHaveBeenCalledWith(
      expect.stringContaining('format=summary')
    );
  });
});

describe('MissionApiClient.fetchHazards()', () => {
  it('calls format=hazards endpoint with entry_id', async () => {
    const hass = makeHass();
    const client = new MissionApiClient(hass, baseConfig);
    await client.fetchHazards();
    expect(hass.fetchWithAuth).toHaveBeenCalledWith(
      expect.stringContaining('format=hazards')
    );
    expect(hass.fetchWithAuth).toHaveBeenCalledWith(
      expect.stringContaining('entry-abc')
    );
  });

  it('returns empty array (not throws) on non-ok response', async () => {
    // Graceful degradation: pre-v2.2 integration returns 400 for unknown format
    const hass = makeHass({
      fetchWithAuth: vi.fn().mockResolvedValue({ ok: false, status: 400 } as unknown as Response),
    });
    const client = new MissionApiClient(hass, baseConfig);
    const result = await client.fetchHazards();
    expect(result).toEqual([]);
  });

  it('returns hazard records on successful response', async () => {
    const hazards = [
      { gx: 3, gy: 5, x_mm: 450, y_mm: 750, stuck_count: 4,
        room_name: 'Kitchen', bearing_deg: 45, distance_mm: 870, source: 'stuck_events' },
    ];
    const hass = makeHass({
      fetchWithAuth: vi.fn().mockResolvedValue({
        ok: true, json: async () => hazards,
      } as unknown as Response),
    });
    const client = new MissionApiClient(hass, baseConfig);
    const result = await client.fetchHazards();
    expect(result).toEqual(hazards);
  });
});

describe('fetchExplain (v2.2.0 F1)', () => {
  it('fetches the explain endpoint with encoded mission id', async () => {
    const explain = { mission_id: 'm 2', is_anomalous: false, anomaly_reason: null, robot_lifted: false, error_code: null, recommended_action: null };
    const hass = {
      callWS: vi.fn().mockResolvedValue({ config_entry_id: 'entry-abc' }),
      fetchWithAuth: vi.fn().mockResolvedValue({ ok: true, json: async () => explain } as unknown as Response),
    } as unknown as HomeAssistant;
    const client = new MissionApiClient(hass, baseConfig, 'vacuum.roomba');
    const result = await client.fetchExplain('m 2');
    expect(hass.fetchWithAuth).toHaveBeenCalledWith('/api/roomba_plus/entry-abc/mission/m%202/explain');
    expect(result).toEqual(explain);
  });

  it('returns null on 404 (endpoint absent on ≤ 3.1.x, or mission not found)', async () => {
    const hass = {
      callWS: vi.fn().mockResolvedValue({ config_entry_id: 'entry-abc' }),
      fetchWithAuth: vi.fn().mockResolvedValue({ ok: false, status: 404 } as unknown as Response),
    } as unknown as HomeAssistant;
    const client = new MissionApiClient(hass, baseConfig, 'vacuum.roomba');
    expect(await client.fetchExplain('m1')).toBeNull();
  });
});

describe('fetchPath (v2.2.0 F4)', () => {
  it('fetches the path endpoint by nMssn', async () => {
    const path = { nMssn: 425, path: [{ room: 'Kitchen', time: '2026-06-26T09:05:00+02:00' }] };
    const hass = {
      callWS: vi.fn().mockResolvedValue({ config_entry_id: 'entry-abc' }),
      fetchWithAuth: vi.fn().mockResolvedValue({ ok: true, json: async () => path } as unknown as Response),
    } as unknown as HomeAssistant;
    const client = new MissionApiClient(hass, baseConfig, 'vacuum.roomba');
    const result = await client.fetchPath(425);
    expect(hass.fetchWithAuth).toHaveBeenCalledWith('/api/roomba_plus/entry-abc/mission/425/path');
    expect(result).toEqual(path);
  });

  it('returns null on non-OK', async () => {
    const hass = {
      callWS: vi.fn().mockResolvedValue({ config_entry_id: 'entry-abc' }),
      fetchWithAuth: vi.fn().mockResolvedValue({ ok: false, status: 404 } as unknown as Response),
    } as unknown as HomeAssistant;
    const client = new MissionApiClient(hass, baseConfig, 'vacuum.roomba');
    expect(await client.fetchPath(999)).toBeNull();
  });
});

describe('fetchMissionMap (v2.3.0 MISSION-MAP)', () => {
  it('fetches the map.json endpoint with encoded record id and returns ok status', async () => {
    const payload = {
      record_id: 'm_1', mission_id: 'abc', nmssn: 42, pmap_id: 'p1', pmapv_id: 'v1',
      point_area_m: [0.1049, 0.1049], coverage_mm: [[100, 200]], rooms: { Kitchen: [[0, 0], [1000, 0], [1000, 1000]] },
    };
    const hass = {
      callWS: vi.fn().mockResolvedValue({ config_entry_id: 'entry-abc' }),
      fetchWithAuth: vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => payload } as unknown as Response),
    } as unknown as HomeAssistant;
    const client = new MissionApiClient(hass, baseConfig, 'vacuum.roomba');
    const result = await client.fetchMissionMap('m 1');
    expect(hass.fetchWithAuth).toHaveBeenCalledWith('/api/roomba_plus/entry-abc/missions/m%201/map.json');
    expect(result).toEqual({ status: 'ok', data: payload });
  });

  it('returns status "absent" on 404 (no coverage layer — honest absence, not an error)', async () => {
    const hass = {
      callWS: vi.fn().mockResolvedValue({ config_entry_id: 'entry-abc' }),
      fetchWithAuth: vi.fn().mockResolvedValue({ ok: false, status: 404 } as unknown as Response),
    } as unknown as HomeAssistant;
    const client = new MissionApiClient(hass, baseConfig, 'vacuum.roomba');
    expect(await client.fetchMissionMap('m1')).toEqual({ status: 'absent' });
  });

  it('returns status "error" on 409 (map/mission mismatch)', async () => {
    const hass = {
      callWS: vi.fn().mockResolvedValue({ config_entry_id: 'entry-abc' }),
      fetchWithAuth: vi.fn().mockResolvedValue({ ok: false, status: 409 } as unknown as Response),
    } as unknown as HomeAssistant;
    const client = new MissionApiClient(hass, baseConfig, 'vacuum.roomba');
    expect(await client.fetchMissionMap('m1')).toEqual({ status: 'error' });
  });

  it('returns status "error" on 502 (cloud transport failure)', async () => {
    const hass = {
      callWS: vi.fn().mockResolvedValue({ config_entry_id: 'entry-abc' }),
      fetchWithAuth: vi.fn().mockResolvedValue({ ok: false, status: 502 } as unknown as Response),
    } as unknown as HomeAssistant;
    const client = new MissionApiClient(hass, baseConfig, 'vacuum.roomba');
    expect(await client.fetchMissionMap('m1')).toEqual({ status: 'error' });
  });

  it('returns status "error" on a network exception (fetchWithAuth throws)', async () => {
    const hass = {
      callWS: vi.fn().mockResolvedValue({ config_entry_id: 'entry-abc' }),
      fetchWithAuth: vi.fn().mockRejectedValue(new Error('network down')),
    } as unknown as HomeAssistant;
    const client = new MissionApiClient(hass, baseConfig, 'vacuum.roomba');
    expect(await client.fetchMissionMap('m1')).toEqual({ status: 'error' });
  });

  it('returns status "error" when the response body is not valid JSON', async () => {
    const hass = {
      callWS: vi.fn().mockResolvedValue({ config_entry_id: 'entry-abc' }),
      fetchWithAuth: vi.fn().mockResolvedValue({
        ok: true, status: 200, json: async () => { throw new Error('bad json'); },
      } as unknown as Response),
    } as unknown as HomeAssistant;
    const client = new MissionApiClient(hass, baseConfig, 'vacuum.roomba');
    expect(await client.fetchMissionMap('m1')).toEqual({ status: 'error' });
  });
});
