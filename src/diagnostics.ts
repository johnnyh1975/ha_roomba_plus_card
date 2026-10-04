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

/** [role label, domain, translation_key, generation it applies to] */
export const DIAG_ROLES: ReadonlyArray<readonly [string, string, string, Gen]> = [
  ['Battery', 'sensor', 'battery', 'both'],
  ['Phase', 'sensor', 'phase', 'both'],
  ['Readiness', 'sensor', 'readiness', 'both'],
  ['Error', 'sensor', 'error', 'both'],
  ['Last error', 'sensor', 'last_error_code', 'classic'],
  ['Mission active', 'binary_sensor', 'mission_active', 'classic'],
  ['Mission progress', 'sensor', 'mission_progress', 'both'],
  ['Position', 'device_tracker', 'position', 'both'],
  ['Start check', 'binary_sensor', 'prime_start_blocked', 'prime'],
  ['Connected', 'binary_sensor', 'connected', 'both'],
  ['Cloud connected', 'binary_sensor', 'cloud_connected', 'classic'],
  ['Cloud link', 'sensor', 'prime_connection_health', 'prime'],
  ['Rooms select (Prime)', 'select', 'prime_zone_select', 'prime'],
  ['Floor select', 'select', 'prime_map', 'prime'],
  ['Rooms map', 'image', 'rooms_map', 'both'],
  ['Coverage map', 'image', 'coverage_map', 'classic'],
  ['Rooms overdue', 'sensor', 'rooms_overdue', 'both'],
  ['Schedule', 'calendar', 'schedule', 'both'],
  ['Firmware', 'sensor', 'firmware_version', 'both'],
  ['Maintenance due', 'binary_sensor', 'maintenance_due', 'classic'],
  ['Filter', 'sensor', 'filter_remaining_hours', 'classic'],
  ['Cleaning mode', 'sensor', 'prime_cleaning_mode', 'prime'],
  ['Dock status', 'sensor', 'prime_dock_status', 'prime'],
  ['Empty bin', 'button', 'evac', 'both'],
];

export interface DiagRow { role: string; id: string | null; via: string }

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
  /** Derived roles: counts and the Map tab's source. */
  derived: Array<[string, string]>;
}

export function diagnosticsData(hass: HomeAssistant, n: string, integrationVersion: string | null): DiagData {
  const R: RobotEntities = robot(hass, n);
  const gen = R.generation;
  const rows: DiagRow[] = DIAG_ROLES
    .filter(([, , , g]) => g === 'both' || gen === 'unknown' || g === gen)
    .map(([role, domain, key]) => {
      let l = R.lookup(domain, key);
      if (!l.id && domain === 'sensor' && key === 'battery') {
        const dc = R.byDeviceClass('sensor', 'battery');
        if (dc) l = { via: 'device_class', id: dc };
      }
      return { role, id: l.id, via: l.via };
    });
  const rooms = roomsRole(hass, n, R);
  const cloudSelects = R.ids('select', 'cloud_smart_zone_select');
  const derived: Array<[string, string]> = [
    ['Rooms (cleanable)', `${rooms.rooms.length}${rooms.selectId ? ` · ${rooms.selectId}` : ''}`],
    ['Favourites', String(favoriteList(hass, n).length)],
    ['Map tab', roomsMapUsable(hass, n) ? 'rooms map' : (R.st('image', 'coverage_map') ? 'coverage map' : 'none')],
  ];
  if (gen !== 'prime') derived.splice(1, 0, ['Cloud map selects', String(cloudSelects.length)]);
  if (gen === 'prime') derived.push(['Parts', String(primePartsRole(hass, n, R).length)]);
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
    ...d.rows.map(r => `| ${r.role} | ${r.id ? `\`${r.id}\`` : '—'} | ${r.via} |`),
    '',
    ...d.derived.map(([k, v]) => `- ${k}: ${v}`),
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
  const rows = d.rows.map(r => `<tr class="${r.id ? '' : 'rpc-diag-missing'}">
      <td>${esc(r.role)}</td><td>${r.id ? `<code>${esc(r.id)}</code>` : '—'}</td><td>${esc(viaLabel(r.via))}</td></tr>`).join('');
  return `
    <div class="rpc-settings-divider"></div>
    ${toggle}
    <div class="rpc-diag">
      <div class="rpc-diag-head">
        ${esc(t(lang, 'diag.versions', { card: d.cardVersion, ha: d.haVersion ?? '?', integration: d.integrationVersion ?? '?' }))}<br>
        <code>${esc(d.vacuumId)}</code> · ${esc(d.generation)} · ${esc(d.source === 'registry' ? t(lang, 'diag.sourceRegistry') : t(lang, 'diag.sourceStates'))} · ${d.entityCount}
      </div>
      <table class="rpc-diag-table"><tbody>${rows}</tbody></table>
      <div class="rpc-diag-derived">${d.derived.map(([k, v]) => `${esc(k)}: ${esc(v)}`).join(' · ')}</div>
      <button class="rpc-btn rpc-btn-secondary" data-diag-copy>${copied ? '✓ ' + t(lang, 'diag.copied') : t(lang, 'diag.copy')}</button>
    </div>
  `;
}
