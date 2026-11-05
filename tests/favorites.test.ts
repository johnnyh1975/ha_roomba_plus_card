/**
 * A3 (v2.1.0) — favourites rendering.
 */
import { describe, it, expect } from 'vitest';
import { renderFavorites, favoriteEntityIds, favoriteLabel } from '../src/favorites';
import { makeHass, baseConfig, st } from './helpers';

const n = 'roomba';

describe('favoriteEntityIds', () => {
  it('collects and sorts fav button entities', () => {
    const hass = makeHass({
      'button.roomba_fav_quick_kitchen': st('idle'),
      'button.roomba_fav_deep_clean': st('idle'),
      'sensor.roomba_phase': st('charge'),
      'button.roomba_repeat_mission': st('idle'),
    });
    expect(favoriteEntityIds(hass, n)).toEqual([
      'button.roomba_fav_deep_clean',
      'button.roomba_fav_quick_kitchen',
    ]);
  });

  it('returns empty when no favourites', () => {
    const hass = makeHass({ 'vacuum.roomba': st('docked') });
    expect(favoriteEntityIds(hass, n)).toEqual([]);
  });

  it('does not match another robot\'s favourites', () => {
    const hass = makeHass({
      'button.roomba_fav_a': st('idle'),
      'button.braava_fav_b': st('idle'),
    });
    expect(favoriteEntityIds(hass, n)).toEqual(['button.roomba_fav_a']);
  });
});

describe('favoriteLabel', () => {
  it('uses friendly_name when present', () => {
    const hass = makeHass({
      'button.roomba_fav_x': { ...st('idle'), attributes: { friendly_name: 'Deep Clean' } },
    });
    expect(favoriteLabel(hass, 'button.roomba_fav_x', n)).toBe('Deep Clean');
  });

  it('strips the device-name prefix from friendly_name', () => {
    const hass = makeHass({
      'vacuum.roomba': { ...st('docked'), attributes: { friendly_name: 'Roomba 980' } },
      'button.roomba_fav_x': { ...st('idle'), attributes: { friendly_name: 'Roomba 980 Monday Morning' } },
    });
    expect(favoriteLabel(hass, 'button.roomba_fav_x', n)).toBe('Monday Morning');
  });

  it('keeps full friendly_name when it does not start with the device name', () => {
    const hass = makeHass({
      'vacuum.roomba': { ...st('docked'), attributes: { friendly_name: 'Roomba 980' } },
      'button.roomba_fav_x': { ...st('idle'), attributes: { friendly_name: 'Quick Kitchen' } },
    });
    expect(favoriteLabel(hass, 'button.roomba_fav_x', n)).toBe('Quick Kitchen');
  });

  it('derives a title-cased label from the id when no friendly_name', () => {
    const hass = makeHass({ 'button.roomba_fav_quick_kitchen': st('idle') });
    expect(favoriteLabel(hass, 'button.roomba_fav_quick_kitchen', n)).toBe('Quick Kitchen');
  });
});

describe('renderFavorites', () => {
  it('returns empty string when no favourites', () => {
    const hass = makeHass({ 'vacuum.roomba': st('docked') });
    expect(renderFavorites(hass, baseConfig, n)).toBe('');
  });

  it('renders one button per favourite with data-fav-entity', () => {
    const hass = makeHass({
      'button.roomba_fav_a': { ...st('idle'), attributes: { friendly_name: 'Alpha' } },
      'button.roomba_fav_b': { ...st('idle'), attributes: { friendly_name: 'Beta' } },
    });
    const html = renderFavorites(hass, baseConfig, n);
    expect(html).toContain('data-fav-entity="button.roomba_fav_a"');
    expect(html).toContain('data-fav-entity="button.roomba_fav_b"');
    expect(html).toContain('Alpha');
    expect(html).toContain('Beta');
    expect((html.match(/rpc-fav-btn/g) || []).length).toBe(2);
  });

  it('escapes labels', () => {
    const hass = makeHass({
      'button.roomba_fav_x': { ...st('idle'), attributes: { friendly_name: '<script>' } },
    });
    const html = renderFavorites(hass, baseConfig, n);
    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;script&gt;');
  });
});

// ── v2.5.0 — Prime / V4 favourites are button.{n}_favorite_<id> ─────────────
describe('favourites — v2.5.0 Prime naming', () => {
  it('finds Classic _fav_ and Prime _favorite_ buttons, not other buttons', () => {
    const hass = makeHass({
      [`button.${n}_fav_1`]: st('unknown'),
      [`button.${n}_favorite_abc`]: st('unknown'),
      [`button.${n}_repeat_mission`]: st('unknown'),
    });
    expect(favoriteEntityIds(hass, n)).toEqual([`button.${n}_fav_1`, `button.${n}_favorite_abc`]);
  });

  it('label fallback strips the Prime prefix too', () => {
    const hass = makeHass({ [`button.${n}_favorite_quick_kitchen`]: st('unknown') });
    expect(favoriteLabel(hass, `button.${n}_favorite_quick_kitchen`, n)).toBe('Quick Kitchen');
  });
});

// ── Field report @Geo26160 (i7+, FR): firmware-internal routine shown as a favourite ──
import { favoriteList, isInternalFavoriteName } from '../src/favorites';
describe('favourites — internal routines are not offered', () => {
  const INTERNAL = '_mission_init_config_BB8583969BD64A96B6F9E6834852B45F';
  it('name check', () => {
    expect(isInternalFavoriteName(INTERNAL)).toBe(true);
    expect(isInternalFavoriteName('Expert')).toBe(false);
  });
  it('vacuum attribute (Classic path of the integration does not filter them)', () => {
    const hass = makeHass({ 'vacuum.i7': st('docked', { friendly_name: 'Roomba i7+',
      favorites: [{ id: 'a', name: INTERNAL }, { id: 'b', name: 'Expert' }, { id: 'c', name: 'Aspirer partout' }] }) });
    expect(favoriteList(hass, 'i7').map(f => f.name)).toEqual(['Expert', 'Aspirer partout']);
  });
  it('button fallback (no attribute): same filter on the label', () => {
    const hass = makeHass({
      'vacuum.i7': st('docked', { friendly_name: 'Roomba i7+' }),
      'button.i7_fav_a': st('unknown', { friendly_name: `Roomba i7+ ${INTERNAL}` }),
      'button.i7_fav_b': st('unknown', { friendly_name: 'Roomba i7+ Expert' }),
    });
    expect(favoriteList(hass, 'i7').map(f => f.name)).toEqual(['Expert']);
  });
  it('negative control: without the filter the internal one would be first', () => {
    const hass = makeHass({ 'vacuum.i7': st('docked', { favorites: [{ id: 'a', name: INTERNAL }] }) });
    expect(favoriteList(hass, 'i7')).toEqual([]);
    expect((hass.states['vacuum.i7'].attributes.favorites as unknown[]).length).toBe(1);
  });
});
