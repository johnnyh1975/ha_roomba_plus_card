import { HomeAssistant, CardConfig, DaySummary } from './types.js';

export class MissionApiClient {
  private entryId: string | null = null;

  constructor(private hass: HomeAssistant, private config: CardConfig) {}

  /** Update the hass reference without discarding cached entryId */
  updateHass(hass: HomeAssistant): void {
    this.hass = hass;
  }

  async fetch(days: number): Promise<DaySummary[]> {
    const entryId = await this.resolveEntryId();
    const url = `/api/roomba_plus/${entryId}/mission_history?days=${days}`;
    const resp = await this.hass.fetchWithAuth(url);
    if (!resp.ok) throw new Error(`${resp.status}`);
    return resp.json();
  }

  private async resolveEntryId(): Promise<string> {
    if (this.entryId) return this.entryId;
    const result = await this.hass.callWS({
      type: 'config/entity_registry/get',
      entity_id: this.config.entity,
    }) as { config_entry_id: string };
    this.entryId = result.config_entry_id;
    return this.entryId;
  }
}
