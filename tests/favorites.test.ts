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
