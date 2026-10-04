/**
 * F5: MDI icon name → emoji mapping for room chip icons.
 * Keys are the bare MDI name (no "mdi:" prefix). NOTE (v2.5.0): the
 * integration sends the FULL name ("mdi:fridge") in region_icons and in
 * image.*_map rooms[].icon, so a direct MDI_TO_EMOJI[icon] lookup never
 * matched and room icons never appeared — look up through mdiToEmoji().
 * Fallback: 📍 for any unmapped icon.
 */
export const MDI_TO_EMOJI: Record<string, string> = {
  // Rooms
  'sofa':                   '🛋️',
  'bed':                    '🛏️',
  'bed-double':             '🛏️',
  'silverware-fork-knife':  '🍽️',
  'stove':                  '🍳',
  'microwave':              '📦',
  'fridge':                 '🧊',
  'toilet':                 '🚽',
  'shower':                 '🚿',
  'bathtub':                '🛁',
  'desk':                   '🖥️',
  'chair-rolling':          '💺',
  'television':             '📺',
  'bookshelf':              '📚',
  'wardrobe':               '👔',
  // Areas
  'home':                   '🏠',
  'garage':                 '🚗',
  'door':                   '🚪',
  'stairs':                 '🪜',
  'balcony':                '🌅',
  'pool':                   '🏊',
  // Utility
  'washing-machine':        '🫧',
  'hanger':                 '🧹',
  'baby-carriage':          '🍼',
  'dog':                    '🐕',
  'cat':                    '🐈',
  // Generic fallbacks
  'floor-plan':             '📐',
  'map-marker':             '📍',
  'star':                   '⭐',
  'heart':                  '❤️',
  'office-building':        '🏢',
  'school':                 '🏫',
  // v2.5.0 — every icon in the integration's REGION_TYPE_ICONS (const.py)
  // that was missing above, so each iRobot room type gets an emoji.
  'bed-king':               '🛏️',
  'sofa-single':            '🛋️',
  'door-open':              '🚪',
  'archive':                '📦',
  'asterisk':               '📍',
  'home-floor-b':           '🏠',
  'landslide':              '🧱',
  'shoe-print':             '👟',
  'sun-angle':              '☀️',
  'teddy-bear':             '🧸',
  'toolbox':                '🧰',
};

/** Emoji for an MDI icon name, with or without the "mdi:" prefix. */
export function mdiToEmoji(icon: unknown, fallback = ''): string {
  if (typeof icon !== 'string' || icon === '') return fallback;
  const bare = icon.startsWith('mdi:') ? icon.slice(4) : icon;
  return MDI_TO_EMOJI[bare] ?? fallback;
}

export const MDI_FALLBACK = '📍';

/** v3.0 A4: the card's own version (card diagnostics). Kept equal to
 *  package.json "version" by tests/const.test.ts. */
export const CARD_VERSION = '3.0.0';
