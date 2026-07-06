import { HomeAssistant, CardConfig, DaySummary, MissionRecord, HazardRecord, HouseholdSummary, MissionExplain, MissionPath, MissionMapResult } from './types.js';

export class MissionApiClient {
  private entryId: string | null = null;
  /** The vacuum entity ID this client resolves against (F3: may differ from config.entity) */
  private readonly entityId: string;

  /**
   * @param entityId  Explicit vacuum entity ID to resolve entry_id for.
   *                  Defaults to config.entity for single-robot backward compat.
   */
  constructor(private hass: HomeAssistant, config: CardConfig, entityId?: string) {
    this.entityId = entityId ?? config.entity;
  }

  /** Update the hass reference without discarding cached entryId */
  updateHass(hass: HomeAssistant): void {
    this.hass = hass;
  }

  /** Fetch format=summary — used for heatmap calendar and history zone */
  async fetchSummary(days: number): Promise<DaySummary[]> {
    const entryId = await this.resolveEntryId();
    const url = `/api/roomba_plus/${entryId}/mission_history?format=summary&days=${days}`;
    const resp = await this.hass.fetchWithAuth(url);
    if (!resp.ok) throw new Error(`${resp.status}`);
    return resp.json();
  }

  /**
   * F4: Fetch format=records — per-mission detail with cloud fields.
   * Returns empty array (not throws) when endpoint unavailable.
   */
  async fetchRecords(days: number): Promise<MissionRecord[]> {
    const entryId = await this.resolveEntryId();
    const url = `/api/roomba_plus/${entryId}/mission_history?format=records&days=${days}`;
    const resp = await this.hass.fetchWithAuth(url);
    if (!resp.ok) return [];
    return resp.json();
  }

  /**
   * v2.2.0 F1: Fetch the plain-language anomaly explanation for one mission
   * (integration ≥ 3.2.0 ANOMALY-EXPLAIN). Returns null on any non-OK
   * response — 404 covers both "endpoint doesn't exist yet" (≤ 3.1.x) and
   * "mission not found"; the card renders the same graceful fallback for
   * both rather than distinguishing cases it can't act on differently.
   */
  async fetchExplain(missionId: string): Promise<MissionExplain | null> {
    const entryId = await this.resolveEntryId();
    const url = `/api/roomba_plus/${entryId}/mission/${encodeURIComponent(missionId)}/explain`;
    const resp = await this.hass.fetchWithAuth(url);
    if (!resp.ok) return null;
    return resp.json();
  }

  /**
   * v2.2.0 F4: Fetch the room-granular path timeline for one mission
   * (integration ≥ 3.2.0 MISSION-REPLAY). Keyed by nMssn, not record id.
   * Returns null on any non-OK response.
   */
  async fetchPath(nMssn: number): Promise<MissionPath | null> {
    const entryId = await this.resolveEntryId();
    const url = `/api/roomba_plus/${entryId}/mission/${nMssn}/path`;
    const resp = await this.hass.fetchWithAuth(url);
    if (!resp.ok) return null;
    return resp.json();
  }

  /**
   * v2.3.0 MISSION-MAP: fetch per-mission coverage data (integration ≥ 3.3.0
   * MISSION-MAP). Three-way result, unlike fetchExplain/fetchPath's
   * null-on-any-non-OK: the integration's 404 ("no coverage layer for this
   * mission" — known-open lewis/i-series case) is a real, calm answer and
   * must read differently from a 409 (map/mission mismatch — integration
   * refuses to serve the wrong map) or 502 (cloud transport failure). Both
   * 409 and 502, and any other non-OK/parse failure, collapse to 'error' —
   * the card has nothing more specific to say about either to the user.
   */
  async fetchMissionMap(recordId: string): Promise<MissionMapResult> {
    const entryId = await this.resolveEntryId();
    const url = `/api/roomba_plus/${entryId}/missions/${encodeURIComponent(recordId)}/map.json`;
    let resp: Response;
    try {
      resp = await this.hass.fetchWithAuth(url);
    } catch {
      return { status: 'error' };
    }
    if (resp.status === 404) return { status: 'absent' };
    if (!resp.ok) return { status: 'error' };
    try {
      const data = await resp.json();
      return { status: 'ok', data };
    } catch {
      return { status: 'error' };
    }
  }

  /** v2.1.0 A5: public accessor for the resolved config_entry_id, used by the   *  card to filter roomba_plus_mission_completed events to this robot. */
  async getEntryId(): Promise<string> {
    return this.resolveEntryId();
  }

  private async resolveEntryId(): Promise<string> {
    if (this.entryId) return this.entryId;
    const result = await this.hass.callWS({
      type: 'config/entity_registry/get',
      entity_id: this.entityId,
    }) as { config_entry_id: string };
    this.entryId = result.config_entry_id;
    return this.entryId;
  }

  /**
   * Fetch hazard pins for the active robot (integration ≥ v2.2.0).
   * Returns [] on any non-200 response — graceful degradation for older
   * integrations (pre-v2.2 returns 400 for unknown format), network errors,
   * or robots with no GridStore data yet accumulated.
   */
  async fetchHazards(): Promise<HazardRecord[]> {
    const entryId = await this.resolveEntryId();
    const url = `/api/roomba_plus/${entryId}/mission_history?format=hazards`;
    const resp = await this.hass.fetchWithAuth(url);
    if (!resp.ok) return [];
    return resp.json();
  }

  /**
   * Fetch household summary — global endpoint, no entry_id (integration ≥ v2.3 F10b).
   * Returns null on non-200: graceful degradation for single-robot installs,
   * integration < v2.3, or network errors.
   */
  async fetchHousehold(days: number): Promise<HouseholdSummary | null> {
    const url = `/api/roomba_plus/household?days=${days}`;
    const resp = await this.hass.fetchWithAuth(url);
    if (!resp.ok) return null;
    return resp.json();
  }
}
