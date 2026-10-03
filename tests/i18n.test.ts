import { describe, it, expect } from 'vitest';
import { t, resolveLang, en, de, es, fr, it as itLang, nl, pl, pt } from '../src/i18n/index';

describe('resolveLang()', () => {
  it('resolves a plain 2-letter code directly', () => {
    expect(resolveLang('de')).toBe('de');
  });

  it('reduces a full HA locale tag to its base language', () => {
    expect(resolveLang('de-DE')).toBe('de');
    expect(resolveLang('pt-BR')).toBe('pt');
    expect(resolveLang('en-US')).toBe('en');
  });

  it('is case-insensitive', () => {
    expect(resolveLang('DE-de')).toBe('de');
  });

  it('falls back to en for a language this card has no dictionary for', () => {
    expect(resolveLang('sv')).toBe('en');
    expect(resolveLang('da-DK')).toBe('en');
  });

  it('falls back to en for null/undefined', () => {
    expect(resolveLang(undefined)).toBe('en');
    expect(resolveLang(null as unknown as undefined)).toBe('en');
  });
});

describe('t()', () => {
  it('returns the plain English string for a simple key', () => {
    expect(t('en', 'header.pause')).toBe('Pause');
  });

  it('returns the correct translation for a non-English locale', () => {
    expect(t('de', 'header.pause')).toBe('Pause'); // coincidentally identical in German
    expect(t('de', 'header.stateCleaning')).toBe('Reinigt');
    expect(t('fr', 'header.stateCleaning')).toBe('Nettoyage');
  });

  it('interpolates a single variable', () => {
    expect(t('en', 'header.errorZone', { zone: 'Kitchen' })).toBe('Zone: Kitchen');
  });

  it('interpolates multiple variables', () => {
    expect(t('en', 'header.errorLabel', { code: '5', desc: 'Stuck' })).toBe('Error 5 — Stuck');
  });

  it('falls back to English when the requested locale has no dictionary', () => {
    expect(t('sv', 'header.pause')).toBe('Pause');
  });

  it('selects the "one" form for count === 1 on a pluralized entry', () => {
    expect(t('en', 'header.startSelectedRooms', { count: 1 })).toBe('Start 1 selected room');
  });

  it('selects the "other" form for count !== 1 on a pluralized entry', () => {
    expect(t('en', 'header.startSelectedRooms', { count: 2 })).toBe('Start 2 selected rooms');
    expect(t('en', 'header.startSelectedRooms', { count: 0 })).toBe('Start 0 selected rooms');
  });

  it('interpolates {count} itself inside a pluralized string', () => {
    expect(t('de', 'header.startSelectedRooms', { count: 3 })).toBe('3 ausgewählte Räume starten');
  });

  it('returns the raw key string when the key is missing from every dictionary (defensive, visibly wrong rather than blank)', () => {
    expect(t('en', 'this.key.does.not.exist' as Parameters<typeof t>[1])).toBe('this.key.does.not.exist');
  });
});

describe('all 8 locale dictionaries carry exactly the English key set', () => {
  const enKeys = Object.keys(en).sort();
  const locales: [string, Record<string, unknown>][] = [
    ['de', de], ['es', es], ['fr', fr], ['it', itLang], ['nl', nl], ['pl', pl], ['pt', pt],
  ];

  it.each(locales)('%s has no missing keys vs. en', (_name, dict) => {
    const missing = enKeys.filter((k) => !(k in dict));
    expect(missing).toEqual([]);
  });

  it.each(locales)('%s has no extra keys vs. en', (_name, dict) => {
    const extra = Object.keys(dict).filter((k) => !(k in en));
    expect(extra).toEqual([]);
  });
});
