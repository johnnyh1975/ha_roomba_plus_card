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
