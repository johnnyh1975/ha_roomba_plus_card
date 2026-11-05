/** v3.0 A4 — diagnostics.ts: role → entity → how it was found. */
import { describe, it, expect } from 'vitest';
import { diagnosticsData, diagnosticsMarkdown, renderDiagnostics } from '../src/diagnostics';
import { classicI7, primeCombo } from './fixtures/robots';
import { makeHass, st } from './helpers';

describe('diagnosticsData', () => {
  it('Classic: registry source, Classic roles, found by key / suffix', () => {
    const d = diagnosticsData(classicI7(), 'i7', '4.2.19');
    expect(d.source).toBe('registry');
    expect(d.generation).toBe('classic');
    expect(d.rows.find(r => r.role === 'Readiness')).toMatchObject({ entityId: 'sensor.i7_readiness', via: 'key', need: null });
    expect(d.rows.find(r => r.role === 'Battery')?.via).toBe('suffix');
    expect(d.rows.some(r => r.role === 'Start check')).toBe(false);
    expect(d.derived).toContainEqual({ id: 'favourites', value: '1' });
  });
  it('Prime: Prime roles, aliases shown as such, missing shown as missing', () => {
    const d = diagnosticsData(primeCombo(), 'combo', null);
    expect(d.generation).toBe('prime');
    expect(d.rows.find(r => r.role === 'Firmware')?.via).toBe('alias');
    expect(d.rows.find(r => r.role === 'Dock status')).toMatchObject({ entityId: null, via: 'missing', need: 'station' });
    expect(d.rows.some(r => r.role === 'Last error')).toBe(false);
    expect(d.derived.find(x => x.id === 'parts')).toBeTruthy();
  });
  it('without a registry: states source', () => {
    const d = diagnosticsData(makeHass({ 'vacuum.r': st('docked'), 'sensor.r_phase': st('charge') }), 'r', null);
    expect(d.source).toBe('states');
    expect(d.rows.find(r => r.role === 'Phase')?.entityId).toBe('sensor.r_phase');
  });
});

describe('diagnosticsMarkdown', () => {
  const md = diagnosticsMarkdown(diagnosticsData(primeCombo(), 'combo', '4.3.0b7'));
  it('versions, robot line, table', () => {
    expect(md).toContain('roomba_plus 4.3.0b7');
    expect(md).toContain('`vacuum.combo` · prime · entities found via entity registry');
    expect(md).toContain('| Phase | `sensor.combo_prime_phase` | key |');
    expect(md).toContain('| Dock status | — | missing (only: Prime dock) |');
  });
  it('carries no states or attributes (privacy)', () => {
    expect(md).not.toContain('docked');
    expect(md).not.toContain('After dinner');
  });
});

describe('renderDiagnostics', () => {
  it('closed: only the toggle', () => {
    const h = renderDiagnostics(null, false, false, 'en');
    expect(h).toContain('data-diag-toggle');
    expect(h).not.toContain('data-diag-copy');
  });
  it('open: table and copy button, missing rows muted', () => {
    const h = renderDiagnostics(diagnosticsData(primeCombo(), 'combo', null), true, false, 'en');
    expect(h).toContain('data-diag-copy');
    expect(h).toContain('rpc-diag-missing');
    expect(h).toContain('Copy for issue');
  });
});

// ── Field report (980, integration 4.3.0b8): missing ≠ broken ───────────
import { DIAG_ROLES } from '../src/diagnostics';
import { t } from '../src/i18n';
describe('diagnostics — why a role is missing', () => {
  // A 980: no Smart Map, no aligner, no Clean Base; cloud configured.
  const hass = makeHass({ 'vacuum.og': st('docked'), 'sensor.og_phase': st('charging'),
    'binary_sensor.og_cloud_connected': st('on'), 'image.og_coverage_map': st('idle') });
  const d = diagnosticsData(hass, 'og', '4.3.0b8');
  const row = (role: string) => d.rows.find(r => r.role === role)!;
  it('gated roles say for which robots the integration creates them', () => {
    expect(row('Mission progress').need).toBe('smartCloud');
    expect(row('Rooms map').need).toBe('roomsMap');
    expect(row('Rooms overdue').need).toBe('smartCloud');
    expect(row('Empty bin').need).toBe('autoEmpty');
  });
  it('a role every robot has carries no reason when missing (it is a real gap)', () =>
    expect(row('Readiness')).toMatchObject({ entityId: null, need: null }));
  it('found roles carry no reason', () => expect(row('Cloud connected').need).toBeNull());
  it('UI in German: role names, reasons and summary translated, Markdown stays English', () => {
    const html = renderDiagnostics(d, true, false, 'de');
    expect(html).toContain('Reinigungsfortschritt');
    expect(html).toContain('nur bei Smart-Map-Roboter mit iRobot-Konto');
    expect(html).toContain('Kartentab: Abdeckungskarte');
    expect(html).not.toContain('Mission progress');
    const md = diagnosticsMarkdown(d);
    expect(md).toContain('| Mission progress | — | missing (only: Smart Map robot with iRobot account) |');
    expect(md).toContain('- Map tab: coverage map');
  });
  it('every role, summary item, reason and map source has a text in all 8 languages', () => {
    const keys = [
      ...DIAG_ROLES.map(r => `diag.role_${r.id}`),
      ...['roomsCleanable', 'cloudSelects', 'favourites', 'mapTab', 'parts'].map(x => `diag.derived_${x}`),
      ...['smartCloud', 'roomsMap', 'autoEmpty', 'cloud', 'station'].map(x => `diag.need_${x}`),
      ...['roomsMap', 'coverageMap', 'none'].map(x => `diag.mapTab_${x}`),
    ];
    for (const lang of ['en', 'de', 'es', 'fr', 'it', 'nl', 'pl', 'pt']) for (const k of keys) {
      expect(t(lang, k as never), `${lang} ${k}`).not.toBe(k);
    }
  });
});
