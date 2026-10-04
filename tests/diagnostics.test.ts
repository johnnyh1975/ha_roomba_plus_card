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
    expect(d.rows.find(r => r.role === 'Readiness')).toEqual({ role: 'Readiness', id: 'sensor.i7_readiness', via: 'key' });
    expect(d.rows.find(r => r.role === 'Battery')?.via).toBe('suffix');
    expect(d.rows.some(r => r.role === 'Start check')).toBe(false);
    expect(d.derived).toContainEqual(['Favourites', '1']);
  });
  it('Prime: Prime roles, aliases shown as such, missing shown as missing', () => {
    const d = diagnosticsData(primeCombo(), 'combo', null);
    expect(d.generation).toBe('prime');
    expect(d.rows.find(r => r.role === 'Firmware')?.via).toBe('alias');
    expect(d.rows.find(r => r.role === 'Dock status')).toEqual({ role: 'Dock status', id: null, via: 'missing' });
    expect(d.rows.some(r => r.role === 'Last error')).toBe(false);
    expect(d.derived.find(([k]) => k === 'Parts')).toBeTruthy();
  });
  it('without a registry: states source', () => {
    const d = diagnosticsData(makeHass({ 'vacuum.r': st('docked'), 'sensor.r_phase': st('charge') }), 'r', null);
    expect(d.source).toBe('states');
    expect(d.rows.find(r => r.role === 'Phase')?.id).toBe('sensor.r_phase');
  });
});

describe('diagnosticsMarkdown', () => {
  const md = diagnosticsMarkdown(diagnosticsData(primeCombo(), 'combo', '4.3.0b7'));
  it('versions, robot line, table', () => {
    expect(md).toContain('roomba_plus 4.3.0b7');
    expect(md).toContain('`vacuum.combo` · prime · entities found via entity registry');
    expect(md).toContain('| Phase | `sensor.combo_prime_phase` | key |');
    expect(md).toContain('| Dock status | — | missing |');
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
