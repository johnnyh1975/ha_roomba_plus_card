/**
 * favorites.ts — A3 (v2.1.0)
 *
 * Renders one tappable button per favourite routine. Favourite entities are
 * `button.{robotName}_fav_{id}` (Classic) or `button.{robotName}_favorite_{id}`
 * (Prime / V4 robots, integration ≥ 4.0 — v2.5.0) where `{id}` is an
 * arbitrary per-user iRobot routine identifier. They are stateless: tapping presses the button
 * (button.press), there is no meaningful state to display, which is why the
 * individual entities are intentionally NOT in relevantEntityIds() — the row
 * never needs to re-render on state change (documented in the version plan).
 *
 * Pure function (no DOM, no `this`) so it is unit-testable in the node test
 * environment. The card wires taps via the delegated [data-fav-entity]
 * handler.
 */
import { HomeAssistant, CardConfig } from './types.js';
import { esc } from './utils.js';
import { t, resolveLang } from './i18n/index.js';

/** Collect favourite button entity IDs for a robot, sorted for stable order. */
export function favoriteEntityIds(hass: HomeAssistant, robotName: string): string[] {
  const prefixes = favoritePrefixes(robotName);
  return Object.keys(hass.states)
    .filter((id) => prefixes.some((p) => id.startsWith(p)))
    .sort();
}

/** Classic `_fav_` and Prime `_favorite_` button prefixes (v2.5.0). */
function favoritePrefixes(robotName: string): string[] {
  return [`button.${robotName}_fav_`, `button.${robotName}_favorite_`];
}

/** Human label for a favourite button: friendly_name attr, else derived from id.
 *
 * With has_entity_name=True the integration's friendly_name is
 * "{Device name} {favourite name}" (e.g. "Roomba 980 Monday Morning"). We strip
 * the leading device-name prefix — taken from the vacuum entity's own
 * friendly_name — so the chip shows just "Monday Morning". Falls back to a
 * title-cased slug from the entity_id when no friendly_name is present. */
export function favoriteLabel(hass: HomeAssistant, entityId: string, robotName: string): string {
  const friendly = (hass.states[entityId]?.attributes?.friendly_name as string | undefined)?.trim();
  if (friendly) {
    // Device-name prefix = the vacuum entity's friendly_name, if available.
    const deviceName = (hass.states[`vacuum.${robotName}`]?.attributes?.friendly_name as string | undefined)?.trim();
    if (deviceName && friendly.startsWith(deviceName + ' ')) {
      return friendly.slice(deviceName.length + 1);
    }
    return friendly;
  }
  // Fallback: turn button.roomba_fav_quick_kitchen → "Quick Kitchen"
  const prefix = favoritePrefixes(robotName).find((p) => entityId.startsWith(p)) ?? '';
  const slug = entityId.slice(prefix.length);
  return slug
    .split('_')
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(' ');
}

/**
 * Render the favourites row. Returns '' when no favourites exist, so the
 * caller can include it unconditionally. `config` reserved for future
 * per-favourite filtering; unused today.
 */
export function renderFavorites(hass: HomeAssistant, _config: CardConfig, robotName: string): string {
  const ids = favoriteEntityIds(hass, robotName);
  if (ids.length === 0) return '';

  const buttons = ids
    .map((id) => {
      const label = esc(favoriteLabel(hass, id, robotName));
      return `<button class="rpc-fav-btn" data-fav-entity="${esc(id)}" aria-label="${label}">★ ${label}</button>`;
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
