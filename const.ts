/**
 * F5: MDI icon name → emoji mapping for room chip icons.
 * Keys are the bare MDI name (no "mdi:" prefix) as stored in region_icons attribute.
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
};

export const MDI_FALLBACK = '📍';
