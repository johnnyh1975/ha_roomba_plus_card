import { describe, it, expect, vi, beforeEach } from 'vitest';
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
