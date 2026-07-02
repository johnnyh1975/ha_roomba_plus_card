/**
 * R2 — click-reducers tests.
 *
 * Focuses on the sibling-field resets and toggle semantics that were the
 * regression risk when extracting these from dispatchClick.
 */
import { describe, it, expect } from 'vitest';
import { clickReducer, isPureClickKey, ClickState } from '../src/click-reducers';

function baseState(over: Partial<ClickState> = {}): ClickState {
  return {
    selectedRooms: new Set<string>(),
    activeTab: 'map',
    viewMode: 'robot',
    openPopover: null,
    resetError: null,
    legendShown: false,
    healthDetailsExpanded: false,
    navDetailsExpanded: false,
    openMaintPopover: null,
    settingsPanelOpen: false,
    lifetimeExpanded: false,
    historyTab: 'calendar',
    openDay: null,
    dayMissions: null,
    openDaySummary: null,
    ...over,
  };
}

describe('isPureClickKey', () => {
  it('recognises pure keys', () => {
    expect(isPureClickKey('tab')).toBe(true);
    expect(isPureClickKey('bar')).toBe(true);
    expect(isPureClickKey('heatmap-cell')).toBe(true);
  });
  it('rejects effectful keys', () => {
    for (const k of ['action', 'pass', 'reset', 'hold-action', 'switch-entity', 'cycle-entity', 'fav-entity']) {
      expect(isPureClickKey(k)).toBe(false);
    }
  });
});

describe('room / room-overlay toggle', () => {
  it('adds an unselected room', () => {
    const s = baseState();
    const patch = clickReducer('room', s, { room: 'Kitchen' });
    expect(patch.selectedRooms!.has('Kitchen')).toBe(true);
  });
  it('removes a selected room', () => {
    const s = baseState({ selectedRooms: new Set(['Kitchen']) });
    clickReducer('room', s, { room: 'Kitchen' });
    expect(s.selectedRooms.has('Kitchen')).toBe(false);
  });
  it('room-overlay with no room is a no-op', () => {
    const s = baseState();
    expect(clickReducer('room-overlay', s, {})).toEqual({});
  });
});

describe('tab', () => {
  it('switches to a new tab', () => {
    expect(clickReducer('tab', baseState({ activeTab: 'map' }), { tab: 'health' }))
      .toEqual({ activeTab: 'health' });
  });
  it('is a no-op when tapping the active tab', () => {
    expect(clickReducer('tab', baseState({ activeTab: 'map' }), { tab: 'map' })).toEqual({});
  });
});

describe('popover toggles', () => {
  it('bar opens a popover and always clears resetError', () => {
    const patch = clickReducer('bar', baseState({ openPopover: null, resetError: 'filter' }), { bar: 'filter' });
    expect(patch.openPopover).toBe('filter');
    expect(patch.resetError).toBeNull();
  });
  it('bar closes the popover when tapping the same key', () => {
    const patch = clickReducer('bar', baseState({ openPopover: 'filter' }), { bar: 'filter' });
    expect(patch.openPopover).toBeNull();
  });
  it('bar patch never contains legendShown (shell handles it post-render)', () => {
    const patch = clickReducer('bar', baseState(), { bar: 'filter' });
    expect('legendShown' in patch).toBe(false);
  });
  it('maint toggles its own popover', () => {
    expect(clickReducer('maint', baseState({ openMaintPopover: null }), { maint: 'brush' }).openMaintPopover).toBe('brush');
    expect(clickReducer('maint', baseState({ openMaintPopover: 'brush' }), { maint: 'brush' }).openMaintPopover).toBeNull();
  });
  it('close clears openPopover', () => {
    expect(clickReducer('close', baseState({ openPopover: 'filter' })).openPopover).toBeNull();
  });
  it('close-maint clears openMaintPopover', () => {
    expect(clickReducer('close-maint', baseState({ openMaintPopover: 'brush' })).openMaintPopover).toBeNull();
  });
});

describe('simple boolean toggles', () => {
  it('health-details-toggle flips', () => {
    expect(clickReducer('health-details-toggle', baseState({ healthDetailsExpanded: false })).healthDetailsExpanded).toBe(true);
    expect(clickReducer('health-details-toggle', baseState({ healthDetailsExpanded: true })).healthDetailsExpanded).toBe(false);
  });
  it('settings-toggle flips', () => {
    expect(clickReducer('settings-toggle', baseState({ settingsPanelOpen: false })).settingsPanelOpen).toBe(true);
  });
  it('nav-details-toggle flips', () => {
    expect(clickReducer('nav-details-toggle', baseState({ navDetailsExpanded: false })).navDetailsExpanded).toBe(true);
    expect(clickReducer('nav-details-toggle', baseState({ navDetailsExpanded: true })).navDetailsExpanded).toBe(false);
  });
  it('lifetime-toggle flips', () => {
    expect(clickReducer('lifetime-toggle', baseState({ lifetimeExpanded: true })).lifetimeExpanded).toBe(false);
  });
  it('household-back returns to robot view', () => {
    expect(clickReducer('household-back', baseState({ viewMode: 'household' })).viewMode).toBe('robot');
  });
});

describe('history-tab closes the day popover', () => {
  it('switches sub-tab AND clears open day state', () => {
    const s = baseState({ historyTab: 'calendar', openDay: '2026-06-01', dayMissions: [{}], openDaySummary: {} });
    const patch = clickReducer('history-tab', s, { historyTab: 'coverage' });
    expect(patch.historyTab).toBe('coverage');
    expect(patch.openDay).toBeNull();
    expect(patch.dayMissions).toBeNull();
    expect(patch.openDaySummary).toBeNull();
  });
});

describe('heatmap-cell', () => {
  it('opens a day with shell-provided summary + missions', () => {
    const s = baseState({ openDay: null });
    const patch = clickReducer('heatmap-cell', s, {
      date: '2026-06-01', daySummaryForDate: { total: 3 }, dayMissionsForDate: [{}, {}],
    });
    expect(patch.openDay).toBe('2026-06-01');
    expect(patch.openDaySummary).toEqual({ total: 3 });
    expect(patch.dayMissions).toEqual([{}, {}]);
  });
  it('closes the day when tapping the already-open date', () => {
    const s = baseState({ openDay: '2026-06-01' });
    const patch = clickReducer('heatmap-cell', s, { date: '2026-06-01' });
    expect(patch.openDay).toBeNull();
    expect(patch.dayMissions).toBeNull();
    expect(patch.openDaySummary).toBeNull();
  });
});

describe('close-day', () => {
  it('clears all day-popover state', () => {
    const patch = clickReducer('close-day', baseState({ openDay: '2026-06-01', dayMissions: [{}], openDaySummary: {} }));
    expect(patch).toEqual({ openDay: null, dayMissions: null, openDaySummary: null });
  });
});
