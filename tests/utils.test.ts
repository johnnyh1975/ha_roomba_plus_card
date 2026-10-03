import { describe, it, expect } from 'vitest';
import { esc } from '../src/utils';

describe('esc()', () => {
  it('escapes &', () => expect(esc('a & b')).toBe('a &amp; b'));
  it('escapes <', () => expect(esc('<script>')).toBe('&lt;script&gt;'));
  it('escapes >', () => expect(esc('a > b')).toBe('a &gt; b'));
  it('escapes double quotes', () => expect(esc('"hello"')).toBe('&quot;hello&quot;'));
  it("escapes single quotes", () => expect(esc("it's")).toBe('it&#39;s'));
  it('handles null', () => expect(esc(null)).toBe(''));
  it('handles undefined', () => expect(esc(undefined)).toBe(''));
  it('handles numbers', () => expect(esc(42)).toBe('42'));
  it('leaves plain strings unchanged', () => expect(esc('hello world')).toBe('hello world'));
  it('escapes multiple characters in one string', () =>
    expect(esc('<b class="x">a & b</b>')).toBe('&lt;b class=&quot;x&quot;&gt;a &amp; b&lt;/b&gt;'));
});

// ── timeSince ─────────────────────────────────────────────────────────────────
import { timeSince } from '../src/utils';

describe('timeSince()', () => {
  it('returns locale-aware "just now" for <1 min', () => {
    const iso = new Date(Date.now() - 30000).toISOString();
    expect(timeSince(iso, 'en')).toMatch(/now|minute/i);
  });

  it('returns minutes ago for recent time', () => {
    const iso = new Date(Date.now() - 5 * 60000).toISOString();
    expect(timeSince(iso, 'en')).toMatch(/5 minutes ago/);
  });

  it('returns hours ago for same-day time', () => {
    const iso = new Date(Date.now() - 2 * 3600000).toISOString();
    expect(timeSince(iso, 'en')).toMatch(/2 hours ago/);
  });

  it('returns days ago for older time', () => {
    const iso = new Date(Date.now() - 3 * 86400000).toISOString();
    expect(timeSince(iso, 'en')).toMatch(/3 days ago/);
  });

  it('respects locale — German', () => {
    const iso = new Date(Date.now() - 2 * 3600000).toISOString();
    expect(timeSince(iso, 'de')).toMatch(/vor 2 Stunden/);
  });

  it('falls back gracefully for unrecognised locale', () => {
    const iso = new Date(Date.now() - 10 * 60000).toISOString();
    // Should not throw — returns a string
    expect(typeof timeSince(iso, 'xx-INVALID')).toBe('string');
  });
});

// ── v2.5.0 P3 — formatting through HA ───────────────────────────────────────
import { humanizeSlug, formatState, areaSqftFromEntity, isMetricSystem } from '../src/utils';
import { makeHass, st } from './helpers';

describe('humanizeSlug()', () => {
  it('turns a slug into readable text', () => expect(humanizeSlug('bag_full')).toBe('Bag full'));
  it('leaves an empty string empty', () => expect(humanizeSlug('')).toBe(''));
});

describe('formatState()', () => {
  it('uses hass.formatEntityState when HA provides it', () => {
    const hass = makeHass({ 'sensor.x_readiness': st('lid_open') });
    hass.formatEntityState = () => 'Deckel offen';
    expect(formatState(hass, 'sensor.x_readiness')).toBe('Deckel offen');
  });
  it('passes an explicit state through to HA', () => {
    const hass = makeHass({ 'sensor.x_readiness': st('ready') });
    hass.formatEntityState = (_o, s) => `F(${s})`;
    expect(formatState(hass, 'sensor.x_readiness', 'bin_full')).toBe('F(bin_full)');
  });
  it('falls back to the humanised slug without a formatter, or when it throws', () => {
    const hass = makeHass({ 'sensor.x_phase': st('washing_pad') });
    expect(formatState(hass, 'sensor.x_phase')).toBe('Washing pad');
    hass.formatEntityState = () => { throw new Error('boom'); };
    expect(formatState(hass, 'sensor.x_phase')).toBe('Washing pad');
  });
  it('missing entity → humanised explicit state, or empty', () => {
    expect(formatState(makeHass(), 'sensor.none', 'bag_full')).toBe('Bag full');
    expect(formatState(makeHass(), 'sensor.none')).toBe('');
  });
});

describe('areaSqftFromEntity()', () => {
  it('converts m² (integration ≥ 4.x) to ft²', () =>
    expect(areaSqftFromEntity(st('10', { unit_of_measurement: 'm²' }))).toBeCloseTo(107.64, 1));
  it('keeps ft² as is', () =>
    expect(areaSqftFromEntity(st('100', { unit_of_measurement: 'ft²' }))).toBe(100));
  it('no unit → pre-4.x assumption (ft²)', () => expect(areaSqftFromEntity(st('42'))).toBe(42));
  it('non-numeric / missing → NaN', () => {
    expect(areaSqftFromEntity(st('unknown'))).toBeNaN();
    expect(areaSqftFromEntity(undefined)).toBeNaN();
  });
});

describe('isMetricSystem()', () => {
  const withLength = (length: string) => { const h = makeHass(); h.config = { unit_system: { length } }; return h; };
  it('HA metric reports "km"', () => expect(isMetricSystem(withLength('km'))).toBe(true));
  it('HA US customary reports "mi"', () => expect(isMetricSystem(withLength('mi'))).toBe(false));
  it('"m" is accepted as metric too', () => expect(isMetricSystem(withLength('m'))).toBe(true));
});
