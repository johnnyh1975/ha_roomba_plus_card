import { HomeAssistant, CardConfig, DaySummary, MissionRecord } from './types.js';

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

  private async resolveEntryId(): Promise<string> {
    if (this.entryId) return this.entryId;
    const result = await this.hass.callWS({
      type: 'config/entity_registry/get',
      entity_id: this.entityId,
    }) as { config_entry_id: string };
    this.entryId = result.config_entry_id;
    return this.entryId;
  }
}
