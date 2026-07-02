/**
 * click-reducers.ts — R2 (refactor)
 *
 * Pure state-transition logic for the click cases that only flip local UI
 * state (no service call, no async). Extracted from dispatchClick so the
 * toggle/popover behaviour — including the sibling-field resets that are easy
 * to get wrong — is unit-testable without a DOM or the custom element.
 *
 * Each reducer takes the relevant current state slice + a payload and returns a
 * patch (Partial slice) of what changes. The imperative shell applies the patch
 * and calls render(). Cases that call services (action, pass, reset,
 * hold-action, switch-entity, cycle-entity, fav-entity) stay in the shell and
 * are NOT represented here.
 *
 * Two cases keep a foot in the shell because they need data the reducer can't
 * compute purely:
 *   - 'bar' legend flip needs a DOM query (`[data-wear-legend]` present?);
 *     the shell passes the boolean in via `wearLegendPresent`.
 *   - 'heatmap-cell' needs the day's summary + per-mission records; the shell
 *     computes those and passes them in via the payload.
 */

/** The subset of card state these reducers read and write. */
export interface ClickState {
  selectedRooms: Set<string>;
  activeTab: string | null;
  viewMode: 'robot' | 'household';
  openPopover: string | null;
  resetError: string | null;
  legendShown: boolean;
  healthDetailsExpanded: boolean;
  navDetailsExpanded: boolean;
  openMaintPopover: string | null;
  settingsPanelOpen: boolean;
  lifetimeExpanded: boolean;
  historyTab: 'calendar' | 'coverage';
  openDay: string | null;
  dayMissions: unknown | null;
  openDaySummary: unknown | null;
}

export type ClickPatch = Partial<ClickState>;

/** Pure reducer keys — the click cases that are state-only flips. */
export type PureClickKey =
  | 'room' | 'tab' | 'household-back' | 'room-overlay' | 'close'
  | 'health-details-toggle' | 'nav-details-toggle' | 'maint' | 'close-maint' | 'close-day'
  | 'settings-toggle' | 'lifetime-toggle' | 'history-tab' | 'bar' | 'heatmap-cell';

/** Is this click key handled by a pure reducer (vs. an effectful shell case)? */
export function isPureClickKey(key: string): key is PureClickKey {
  return PURE_KEYS.has(key);
}
const PURE_KEYS = new Set<string>([
  'room', 'tab', 'household-back', 'room-overlay', 'close',
  'health-details-toggle', 'nav-details-toggle', 'maint', 'close-maint', 'close-day',
  'settings-toggle', 'lifetime-toggle', 'history-tab', 'bar', 'heatmap-cell',
]);

export interface ClickPayload {
  room?: string;          // room / room-overlay
  tab?: string;           // tab
  bar?: string;           // bar
  maint?: string;         // maint
  historyTab?: 'calendar' | 'coverage';
  // heatmap-cell: the date tapped + shell-computed summary/missions for it
  date?: string;
  daySummaryForDate?: unknown | null;
  dayMissionsForDate?: unknown | null;
}

/**
 * Compute the state patch for a pure click key. `mutateSet` note: `selectedRooms`
 * is a Set and is mutated in place by the 'room'/'room-overlay' cases to match
 * the original behaviour exactly (the same Set instance is shared with the
 * header chip picker and Map tap-select); the patch then re-references it so the
 * shell's apply step is uniform.
 */
export function clickReducer(key: PureClickKey, state: ClickState, payload: ClickPayload = {}): ClickPatch {
  switch (key) {
    case 'room': {
      const room = payload.room!;
      if (state.selectedRooms.has(room)) state.selectedRooms.delete(room);
      else state.selectedRooms.add(room);
      return { selectedRooms: state.selectedRooms };
    }

    case 'room-overlay': {
      const room = payload.room;
      if (!room) return {};
      if (state.selectedRooms.has(room)) state.selectedRooms.delete(room);
      else state.selectedRooms.add(room);
      return { selectedRooms: state.selectedRooms };
    }

    case 'tab': {
      const tab = payload.tab ?? null;
      if (tab === state.activeTab) return {};
      return { activeTab: tab };
    }

    case 'household-back':
      return { viewMode: 'robot' };

    case 'close':
      return { openPopover: null };

    case 'health-details-toggle':
      return { healthDetailsExpanded: !state.healthDetailsExpanded };

    case 'nav-details-toggle':
      return { navDetailsExpanded: !state.navDetailsExpanded };

    case 'maint': {
      const k = payload.maint!;
      return { openMaintPopover: state.openMaintPopover === k ? null : k };
    }

    case 'close-maint':
      return { openMaintPopover: null };

    case 'close-day':
      return { openDay: null, dayMissions: null, openDaySummary: null };

    case 'settings-toggle':
      return { settingsPanelOpen: !state.settingsPanelOpen };

    case 'lifetime-toggle':
      return { lifetimeExpanded: !state.lifetimeExpanded };

    case 'history-tab':
      // Switching the history sub-tab closes any open day popover — they're
      // mutually exclusive.
      return {
        historyTab: payload.historyTab as 'calendar' | 'coverage',
        openDay: null, dayMissions: null, openDaySummary: null,
      };

    case 'bar': {
      // Popover toggle + resetError clear. The legend-shown flip is handled by
      // the shell AFTER render (it needs the freshly-drawn DOM), so it is
      // deliberately NOT part of this pure patch.
      const k = payload.bar!;
      return {
        openPopover: state.openPopover === k ? null : k,
        resetError: null,
      };
    }

    case 'heatmap-cell': {
      const date = payload.date!;
      if (state.openDay === date) {
        return { openDay: null, dayMissions: null, openDaySummary: null };
      }
      return {
        openDay: date,
        openDaySummary: payload.daySummaryForDate ?? null,
        dayMissions: payload.dayMissionsForDate ?? null,
      };
    }
  }
}
