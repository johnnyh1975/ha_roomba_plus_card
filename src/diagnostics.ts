/**
 * diagnostics.ts — v3.0 A4: card diagnostics (⚙ tab).
 *
 * The main view stays quiet about what is missing (Plan v3 P4); this panel
 * says, per role, which entity the card uses and how it found it — by its
 * translation_key, through a Classic/Prime alias, by the documented
 * fallback suffix, or not at all. "Copy for issue" puts the same as
 * Markdown on the clipboard, so a support question starts with the facts
 * instead of three rounds of "which entities do you have?".
 *
 * Only entity ids, versions and found/missing are included — no states, no
 * attributes, no location.
 *
 * A missing role shows for which robots the integration creates it at all
 * (Plan v3 P4: "the reason it is absent"): on a 980 without Smart Map,
 * "Mission progress — only with Smart Map robot and iRobot account" is
 * expected, while "Readiness — missing" is a real gap.
 */
import type { HomeAssistant } from './types.js';
import { robot, RobotEntities } from './registry.js';
import { roomsRole } from './robot-model.js';
import { favoriteList } from './favorites.js';
import { primePartsRole } from './robot-model.js';
import { roomsMapUsable } from './zones/map-zone.js';
import { esc } from './utils.js';
import { CARD_VERSION } from './const.js';
import { t } from './i18n/index.js';

type Gen = 'classic' | 'prime' | 'both';

/** Why a role can be absent although nothing is wrong: the integration
 *  creates the entity only for some robots (gates in sensor.py, image.py,
 *  button.py of integration 4.2.20). Shown next to "missing", so a 980
 *  without Smart Map does not read as broken. */
export type Need = 'smartCloud' | 'roomsMap' | 'autoEmpty' | 'cloud' | 'station';

export interface DiagRole {
  id: string;
  /** English name — for the Markdown (issues are in English). */
  label: string;
  domain: string;
  key: string;
  gen: Gen;
  needClassic?: Need;
  needPrime?: Need;
}

export const DIAG_ROLES: ReadonlyArray<DiagRole> = [
  { id: 'battery', label: 'Battery', domain: 'sensor', key: 'battery', gen: 'both' },
  { id: 'phase', label: 'Phase', domain: 'sensor', key: 'phase', gen: 'both' },
  { id: 'readiness', label: 'Readiness', domain: 'sensor', key: 'readiness', gen: 'both' },
  { id: 'error', label: 'Error', domain: 'sensor', key: 'error', gen: 'both' },
  { id: 'lastError', label: 'Last error', domain: 'sensor', key: 'last_error_code', gen: 'classic' },
  { id: 'missionActive', label: 'Mission active', domain: 'binary_sensor', key: 'mission_active', gen: 'classic' },
  // sensor.py:578 — SMART + cloud + mission timer store.
  { id: 'missionProgress', label: 'Mission progress', domain: 'sensor', key: 'mission_progress', gen: 'both', needClassic: 'smartCloud' },
  { id: 'position', label: 'Position', domain: 'device_tracker', key: 'position', gen: 'both' },
  { id: 'startCheck', label: 'Start check', domain: 'binary_sensor', key: 'prime_start_blocked', gen: 'prime' },
  { id: 'connected', label: 'Connected', domain: 'binary_sensor', key: 'connected', gen: 'both' },
  { id: 'cloudConnected', label: 'Cloud connected', domain: 'binary_sensor', key: 'cloud_connected', gen: 'classic', needClassic: 'cloud' },
  { id: 'cloudLink', label: 'Cloud link', domain: 'sensor', key: 'prime_connection_health', gen: 'prime' },
  { id: 'roomsSelect', label: 'Rooms select (Prime)', domain: 'select', key: 'prime_zone_select', gen: 'prime' },
  { id: 'floorSelect', label: 'Floor select', domain: 'select', key: 'prime_map', gen: 'prime' },
  // image.py:262 — SMART, or EPHEMERAL (900 series) with the UMF aligner.
  { id: 'roomsMap', label: 'Rooms map', domain: 'image', key: 'rooms_map', gen: 'both', needClassic: 'roomsMap' },
  { id: 'coverageMap', label: 'Coverage map', domain: 'image', key: 'coverage_map', gen: 'classic' },
  // sensor.py:561 — SMART + cloud.
  { id: 'roomsOverdue', label: 'Rooms overdue', domain: 'sensor', key: 'rooms_overdue', gen: 'both', needClassic: 'smartCloud' },
  { id: 'schedule', label: 'Schedule', domain: 'calendar', key: 'schedule', gen: 'both' },
  { id: 'firmware', label: 'Firmware', domain: 'sensor', key: 'firmware_version', gen: 'both' },
  { id: 'maintenanceDue', label: 'Maintenance due', domain: 'binary_sensor', key: 'maintenance_due', gen: 'classic' },
  { id: 'filter', label: 'Filter', domain: 'sensor', key: 'filter_remaining_hours', gen: 'classic' },
  { id: 'cleaningMode', label: 'Cleaning mode', domain: 'sensor', key: 'prime_cleaning_mode', gen: 'prime' },
  { id: 'dockStatus', label: 'Dock status', domain: 'sensor', key: 'prime_dock_status', gen: 'prime', needPrime: 'station' },
  // button.py — Clean Base only; Prime: dock with auto-empty.
  { id: 'emptyBin', label: 'Empty bin', domain: 'button', key: 'evac', gen: 'both', needClassic: 'autoEmpty', needPrime: 'autoEmpty' },
];

export interface DiagRow {
  id: string;
  role: string;
  entityId: string | null;
  via: string;
  /** For a missing entity: the robots the integration creates it for. */
  need: Need | null;
}

export type DerivedId = 'roomsCleanable' | 'cloudSelects' | 'favourites' | 'mapTab' | 'parts';
const DERIVED_LABEL: Record<DerivedId, string> = {
  roomsCleanable: 'Rooms (cleanable)', cloudSelects: 'Cloud map selects', favourites: 'Favourites',
  mapTab: 'Map tab', parts: 'Parts',
};
export type MapTabSource = 'roomsMap' | 'coverageMap' | 'none';
const MAP_TAB_LABEL: Record<MapTabSource, string> = { roomsMap: 'rooms map', coverageMap: 'coverage map', none: 'none' };
const NEED_LABEL: Record<Need, string> = {
  smartCloud: 'Smart Map robot with iRobot account',
  roomsMap: 'Smart Map robot, or 900 series with a matched cloud map',
  autoEmpty: 'dock with auto-empty',
  cloud: 'iRobot account configured',
  station: 'Prime dock',
};

export interface DiagData {
  cardVersion: string;
  haVersion: string | null;
  integrationVersion: string | null;
  vacuumId: string;
  generation: string;
  source: string;
  deviceId: string | null;
  entityCount: number;
  rows: DiagRow[];
  /** Derived roles: counts and the Map tab's source. `value` is a number
   *  as text, or a MapTabSource for `mapTab`; `extra` an entity id. */
  derived: Array<{ id: DerivedId; value: string; extra?: string }>;
}

export function diagnosticsData(hass: HomeAssistant, n: string, integrationVersion: string | null): DiagData {
  const R: RobotEntities = robot(hass, n);
  const gen = R.generation;
  const rows: DiagRow[] = DIAG_ROLES
    .filter(r => r.gen === 'both' || gen === 'unknown' || r.gen === gen)
    .map(r => {
      let l = R.lookup(r.domain, r.key);
      if (!l.id && r.domain === 'sensor' && r.key === 'battery') {
        const dc = R.byDeviceClass('sensor', 'battery');
        if (dc) l = { via: 'device_class', id: dc };
      }
      const need = l.id ? null : ((gen === 'prime' ? r.needPrime : r.needClassic) ?? null);
      return { id: r.id, role: r.label, entityId: l.id, via: l.via, need };
    });
  const rooms = roomsRole(hass, n, R);
  const mapTab: MapTabSource = roomsMapUsable(hass, n) ? 'roomsMap' : (R.st('image', 'coverage_map') ? 'coverageMap' : 'none');
  const derived: DiagData['derived'] = [
    { id: 'roomsCleanable', value: String(rooms.rooms.length), extra: rooms.selectId ?? undefined },
  ];
  if (gen !== 'prime') derived.push({ id: 'cloudSelects', value: String(R.ids('select', 'cloud_smart_zone_select').length) });
  derived.push({ id: 'favourites', value: String(favoriteList(hass, n).length) });
  derived.push({ id: 'mapTab', value: mapTab });
  if (gen === 'prime') derived.push({ id: 'parts', value: String(primePartsRole(hass, n, R).length) });
  return {
    cardVersion: CARD_VERSION,
    haVersion: typeof hass.config?.version === 'string' ? hass.config.version : null,
    integrationVersion,
    vacuumId: R.vacuumId,
    generation: gen,
    source: R.index.source,
    deviceId: R.index.deviceId,
    entityCount: R.index.entityIds.length,
    rows,
    derived,
  };
}

/** Markdown for an issue report. */
export function diagnosticsMarkdown(d: DiagData): string {
  const lines = [
    '### Roomba+ card diagnostics',
    '',
    `- Card ${d.cardVersion} · Home Assistant ${d.haVersion ?? '?'} · roomba_plus ${d.integrationVersion ?? '?'}`,
    `- Robot \`${d.vacuumId}\` · ${d.generation} · entities found via ${d.source === 'registry' ? 'entity registry' : 'entity ids (no registry)'} · ${d.entityCount} entities`,
    '',
    '| Role | Entity | Found via |',
    '|---|---|---|',
    ...d.rows.map(r => `| ${r.role} | ${r.entityId ? `\`${r.entityId}\`` : '—'} | ${r.via}${r.need ? ` (only: ${NEED_LABEL[r.need]})` : ''} |`),
    '',
    ...d.derived.map(x => `- ${DERIVED_LABEL[x.id]}: ${x.id === 'mapTab' ? MAP_TAB_LABEL[x.value as MapTabSource] : x.value}${x.extra ? ` · ${x.extra}` : ''}`),
  ];
  return lines.join('\n');
}

export function renderDiagnostics(d: DiagData | null, open: boolean, copied: boolean, lang: string): string {
  const toggle = `<button class="rpc-settings-row" data-diag-toggle aria-expanded="${open}">
      <span class="rpc-settings-icon">🩺</span>
      <span class="rpc-settings-label">${t(lang, 'diag.title')}</span>
      <span class="rpc-settings-arrow">${open ? '▲' : '▼'}</span>
    </button>`;
  if (!open || !d) return `<div class="rpc-settings-divider"></div>${toggle}`;
  const viaLabel = (via: string) => t(lang, `diag.via_${via}` as Parameters<typeof t>[1]);
  type K = Parameters<typeof t>[1];
  const rows = d.rows.map(r => `<tr class="${r.entityId ? '' : 'rpc-diag-missing'}">
      <td>${esc(t(lang, `diag.role_${r.id}` as K))}</td>
      <td>${r.entityId ? `<code>${esc(r.entityId)}</code>`
        : (r.need ? `<span class="rpc-diag-need">${esc(t(lang, 'diag.onlyFor', { what: t(lang, `diag.need_${r.need}` as K) }))}</span>` : '—')}</td>
      <td>${esc(viaLabel(r.via))}</td></tr>`).join('');
  const derivedText = d.derived.map(x => {
    const v = x.id === 'mapTab' ? t(lang, `diag.mapTab_${x.value}` as K) : x.value;
    return `${esc(t(lang, `diag.derived_${x.id}` as K))}: ${esc(v)}${x.extra ? ` <code>${esc(x.extra)}</code>` : ''}`;
  }).join(' · ');
  return `
    <div class="rpc-settings-divider"></div>
    ${toggle}
    <div class="rpc-diag">
      <div class="rpc-diag-head">
        ${esc(t(lang, 'diag.versions', { card: d.cardVersion, ha: d.haVersion ?? '?', integration: d.integrationVersion ?? '?' }))}<br>
        <code>${esc(d.vacuumId)}</code> · ${esc(d.generation)} · ${esc(d.source === 'registry' ? t(lang, 'diag.sourceRegistry') : t(lang, 'diag.sourceStates'))} · ${d.entityCount}
      </div>
      <table class="rpc-diag-table"><tbody>${rows}</tbody></table>
      <div class="rpc-diag-derived">${derivedText}</div>
      <button class="rpc-btn rpc-btn-secondary" data-diag-copy>${copied ? '✓ ' + t(lang, 'diag.copied') : t(lang, 'diag.copy')}</button>
    </div>
  `;
}
