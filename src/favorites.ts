/**
 * favorites.ts — favourite routines (A3 v2.1.0; v3.0 B4).
 *
 * v3.0: the source is the vacuum's `favorites` attribute — `[{id, name}]`
 * on BOTH generations (Classic from the cloud's /user/favorites, filtered
 * to this robot and to non-hidden favourites; Prime from its own list) —
 * started with `roomba_plus.run_favorite` (Classic needs the iRobot
 * account, as the buttons always did). This replaces searching for button
 * entities, whose ids differ per generation (`fav_{id}` without a
 * translation_key on Classic, `favorite_{id}` with `prime_favorite` on
 * Prime) and which a hidden favourite or a renamed id could make vanish.
 *
 * Fallback for integrations that predate the attribute: the buttons, by
 * family key (Prime) or by suffix (Classic, no key), pressed with
 * button.press — the v2.1–2.5 behaviour.
 *
 * Pure functions (no DOM) so they are unit-testable; the card wires taps via
 * the delegated [data-fav-id] / [data-fav-entity] handlers.
 */
import { HomeAssistant, CardConfig } from './types.js';
import { robot } from './registry.js';
import { esc } from './utils.js';
import { t, resolveLang } from './i18n/index.js';

export interface FavoriteItem {
  name: string;
  /** Present when started via roomba_plus.run_favorite. */
  favoriteId?: string;
  /** Present when started by pressing a favourite button (fallback). */
  entityId?: string;
}

/** Favourite buttons of this robot (fallback path), sorted. */
export function favoriteEntityIds(hass: HomeAssistant, robotName: string): string[] {
  const r = robot(hass, robotName);
  return [...new Set([
    ...r.ids('button', 'prime_favorite'),
    ...r.idsWithSuffixPrefix('button', 'fav_'),
    ...r.idsWithSuffixPrefix('button', 'favorite_'),
  ])].sort();
}

/** Human label for a favourite button: friendly_name minus the device-name
 *  prefix, else a title-cased slug from the entity id. */
export function favoriteLabel(hass: HomeAssistant, entityId: string, robotName: string): string {
  const friendly = (hass.states[entityId]?.attributes?.friendly_name as string | undefined)?.trim();
  if (friendly) {
    const deviceName = (hass.states[robot(hass, robotName).vacuumId]?.attributes?.friendly_name as string | undefined)?.trim();
    if (deviceName && friendly.startsWith(deviceName + ' ')) {
      return friendly.slice(deviceName.length + 1);
    }
    return friendly;
  }
  const object = entityId.slice(entityId.indexOf('.') + 1);
  const slug = object.slice(robotName.length + 1).replace(/^(fav|favorite)_/, '');
  return slug
    .split('_')
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(' ');
}

/** The robot's favourites: from the vacuum attribute when present, else the
 *  button entities. */
export function favoriteList(hass: HomeAssistant, robotName: string): FavoriteItem[] {
  const vac = hass.states[robot(hass, robotName).vacuumId];
  const attr = vac?.attributes?.favorites;
  if (Array.isArray(attr)) {
    return attr
      .filter((f): f is { id: unknown; name?: unknown } => !!f && typeof f === 'object' && 'id' in f)
      .map(f => ({ favoriteId: String(f.id), name: String(f.name ?? '').trim() || String(f.id) }))
      .filter(f => f.favoriteId !== '');
  }
  return favoriteEntityIds(hass, robotName).map(id => ({ entityId: id, name: favoriteLabel(hass, id, robotName) }));
}

/**
 * Render the favourites row. Returns '' when no favourites exist, so the
 * caller can include it unconditionally.
 */
export function renderFavorites(hass: HomeAssistant, _config: CardConfig, robotName: string): string {
  const items = favoriteList(hass, robotName);
  if (items.length === 0) return '';

  const buttons = items
    .map((f) => {
      const label = esc(f.name);
      const target = f.favoriteId !== undefined
        ? `data-fav-id="${esc(f.favoriteId)}"`
        : `data-fav-entity="${esc(f.entityId ?? '')}"`;
      return `<button class="rpc-fav-btn" ${target} aria-label="${label}">★ ${label}</button>`;
    })
    .join('');

  return `
    <div class="rpc-settings-divider"></div>
    <div class="rpc-fav-section">
      <div class="rpc-fav-label">${t(resolveLang(hass.language), 'favorites.label')}</div>
      <div class="rpc-fav-row">${buttons}</div>
    </div>
  `;
}
