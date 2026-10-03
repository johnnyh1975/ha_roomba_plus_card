/** v2.5.0 — minimum versions checked at runtime (version-check.ts). */
import { describe, it, expect, beforeEach } from 'vitest';
import {
  parseVersion, compareVersions, checkMinimums, renderVersionNotice,
  fetchIntegrationVersion, _resetIntegrationVersionCache,
  MIN_HA_VERSION, MIN_INTEGRATION_VERSION,
} from '../src/version-check';

describe('minimums', () => {
  it('are HA 2025.5 and integration 4.2', () => {
    expect(MIN_HA_VERSION).toBe('2025.5.0');
    expect(MIN_INTEGRATION_VERSION).toBe('4.2.0');
  });
});

describe('parseVersion() / compareVersions()', () => {
  it('parses release, beta, dev and two-part versions', () => {
    expect(parseVersion('2025.5.0')).toEqual({ nums: [2025, 5, 0], pre: false });
    expect(parseVersion('4.3.0b6')).toEqual({ nums: [4, 3, 0], pre: true });
    expect(parseVersion('2025.10.0.dev20251001')).toEqual({ nums: [2025, 10, 0], pre: true });
    expect(parseVersion('4.2')).toEqual({ nums: [4, 2, 0], pre: false });
  });
  it('rejects garbage', () => {
    expect(parseVersion('unknown')).toBeNull();
    expect(parseVersion(undefined)).toBeNull();
    expect(compareVersions('x', '1.0.0')).toBeNull();
  });
  it('compares numerically, not as strings (2025.10 > 2025.5)', () =>
    expect(compareVersions('2025.10.0', '2025.5.0')).toBe(1));
  it('a pre-release sorts before its release, after the previous one', () => {
    expect(compareVersions('4.2.0b1', '4.2.0')).toBe(-1);
    expect(compareVersions('4.3.0b6', '4.2.0')).toBe(1);
    expect(compareVersions('4.2.18', '4.2.18')).toBe(0);
  });
});

describe('checkMinimums()', () => {
  it('nothing to report on supported versions (4.2.18 / 4.3.0b6, HA 2025.5+)', () => {
    expect(checkMinimums('2025.5.0', '4.2.18')).toEqual([]);
    expect(checkMinimums('2025.10.1', '4.3.0b6')).toEqual([]);
  });
  it('reports an old integration (the #17-class breakage)', () =>
    expect(checkMinimums('2025.9.0', '4.1.7')).toEqual([
      { component: 'integration', have: '4.1.7', need: '4.2.0' },
    ]));
  it('reports an old Home Assistant', () =>
    expect(checkMinimums('2025.4.3', '4.2.18')).toEqual([
      { component: 'ha', have: '2025.4.3', need: '2025.5.0' },
    ]));
  it('stays quiet when a version is unknown (no false alarm)', () =>
    expect(checkMinimums(undefined, null)).toEqual([]));
});

describe('renderVersionNotice()', () => {
  it('empty when nothing is below minimum', () => expect(renderVersionNotice([], 'en')).toBe(''));
  it('names the needed and installed versions, localized', () => {
    const p = [{ component: 'integration' as const, have: '4.1.7', need: '4.2.0' }];
    expect(renderVersionNotice(p, 'en')).toContain('Roomba+ integration 4.2 or newer (installed: 4.1.7)');
    expect(renderVersionNotice(p, 'de')).toContain('Roomba+-Integration 4.2 oder neuer (installiert: 4.1.7)');
  });
  it('escapes the reported version', () => {
    const p = [{ component: 'ha' as const, have: '<b>x', need: '2025.5.0' }];
    expect(renderVersionNotice(p, 'en')).toContain('&lt;b&gt;x');
  });
});

describe('fetchIntegrationVersion()', () => {
  beforeEach(() => _resetIntegrationVersionCache());

  it('asks manifest/get for roomba_plus once and shares the answer', async () => {
    const calls: unknown[] = [];
    const hass = { callWS: async (m: Record<string, unknown>) => { calls.push(m); return { version: '4.2.18' }; } };
    expect(await fetchIntegrationVersion(hass)).toBe('4.2.18');
    expect(await fetchIntegrationVersion(hass)).toBe('4.2.18');
    expect(calls).toEqual([{ type: 'manifest/get', integration: 'roomba_plus' }]);
  });

  it('a failing request yields null (quiet)', async () => {
    const hass = { callWS: async () => { throw new Error('not found'); } };
    expect(await fetchIntegrationVersion(hass)).toBeNull();
  });
});
