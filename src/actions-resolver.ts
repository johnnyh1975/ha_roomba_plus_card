/**
 * B3 (v2.1.0) — pure click-target resolver for delegated event handling.
 *
 * The card delegates all clicks to one listener on the persistent ShadowRoot.
 * That listener walks up from the clicked element to find the first matching
 * data-target, in PRIORITY ORDER, and returns an opaque action key plus the
 * matched element. Keeping this resolution pure makes the dispatch table
 * unit-testable without a DOM/custom-element harness (the card class itself
 * has no render tests).
 *
 * The priority list mirrors the original per-element handler order. Targets
 * live in disjoint subtrees except where noted in B3_DELEGATION_PLAN.md;
 * first-match-wins via closest() is correct for all real nestings.
 */

/** Action keys, one per interactive target type. */
export type ClickActionKey =
  | 'action'
  | 'room'
  | 'pass'
  | 'bar'
  | 'tab'
  | 'household-back'
  | 'room-overlay'
  | 'close'
  | 'health-details-toggle'  | 'maint'
  | 'nav-details-toggle'
  | 'close-maint'
  | 'reset'
  | 'hold-action'
  | 'heatmap-cell'
  | 'close-day'
  | 'settings-toggle'
  | 'switch-entity'
  | 'cycle-entity'
  | 'lifetime-toggle'
  | 'history-tab'
  | 'fav-entity';

/**
 * Priority-ordered selector → key table. The FIRST selector that the clicked
 * element (or an ancestor) matches wins. Order matches the legacy handler
 * registration order so behaviour is preserved.
 */
export const CLICK_PRIORITY: ReadonlyArray<readonly [string, ClickActionKey]> = [
  ['[data-action]', 'action'],
  ['[data-room]', 'room'],
  ['[data-pass]', 'pass'],
  ['[data-bar]', 'bar'],
  ['[data-tab]', 'tab'],
  ['[data-household-back]', 'household-back'],
  ['[data-room-poly]', 'room-overlay'],
  ['[data-room-label]', 'room-overlay'],
  ['[data-close]', 'close'],
  ['[data-health-details-toggle]', 'health-details-toggle'],
  ['[data-nav-details-toggle]', 'nav-details-toggle'],
  ['[data-maint]', 'maint'],
  ['[data-close-maint]', 'close-maint'],
  ['[data-reset]', 'reset'],
  ['[data-hold-action]', 'hold-action'],
  ['[data-date]', 'heatmap-cell'],
  ['[data-close-day]', 'close-day'],
  ['[data-settings-toggle]', 'settings-toggle'],
  ['[data-switch-entity]', 'switch-entity'],
  ['[data-cycle-entity]', 'cycle-entity'],
  ['[data-lifetime-toggle]', 'lifetime-toggle'],
  ['[data-history-tab]', 'history-tab'],
  ['[data-fav-entity]', 'fav-entity'],
];

export interface ResolvedClick {
  key: ClickActionKey;
  el: Element;
}

/**
 * Walk the priority list; return the first {key, el} whose selector the target
 * or an ancestor matches. `el` is the matched ancestor (the element carrying
 * the data attribute), not necessarily the click target.
 *
 * `start.closest` is the only DOM dependency; pass any Element. Returns null
 * when the click hit no interactive target (empty card chrome).
 */
export function resolveClick(start: Element | null): ResolvedClick | null {
  if (!start) return null;
  for (const [selector, key] of CLICK_PRIORITY) {
    const el = start.closest(selector);
    if (el) return { key, el };
  }
  return null;
}

/** Keydown-activatable roving-focus rows (Enter/Space → same as click). */
export const KEYDOWN_PRIORITY: ReadonlyArray<readonly [string, ClickActionKey]> = [
  ['[data-bar]', 'bar'],
  ['[data-maint]', 'maint'],
];

export function resolveKeydownTarget(start: Element | null): ResolvedClick | null {
  if (!start) return null;
  for (const [selector, key] of KEYDOWN_PRIORITY) {
    const el = start.closest(selector);
    if (el) return { key, el };
  }
  return null;
}
