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
