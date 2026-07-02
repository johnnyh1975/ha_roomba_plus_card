/**
 * B3 (v2.1.0) — delegated click/keydown resolver tests.
 *
 * The test environment is `node` (no jsdom), and the resolver's only DOM
 * dependency is Element.closest(selector). We provide a minimal fake element
 * whose closest() matches against a declared set of selectors that the element
 * "carries" (itself or via ancestors). This keeps the suite pure, matching the
 * repo's no-jsdom philosophy, while exercising the real priority logic.
 */
import { describe, it, expect } from 'vitest';
import {
  resolveClick,
  resolveKeydownTarget,
  CLICK_PRIORITY,
  KEYDOWN_PRIORITY,
} from '../src/actions-resolver';

/**
 * Build a fake Element whose closest(sel) returns a stub element if `sel` is in
 * `matches`, else null. The returned stub also carries an optional dataset.
 */
function fakeEl(matches: string[], dataset: Record<string, string> = {}): Element {
  const stub = {
    dataset,
    getAttribute: (name: string) => dataset[camel(name)] ?? null,
  } as unknown as Element;
  return {
    closest: (sel: string) => (matches.includes(sel) ? stub : null),
  } as unknown as Element;
}

function camel(attr: string): string {
  // data-cycle-options → cycleOptions ; data-date → date
  return attr.replace(/^data-/, '').replace(/-([a-z])/g, (_, c) => c.toUpperCase());
}

describe('resolveClick — basic matching', () => {
  it('returns null for null target', () => {
    expect(resolveClick(null)).toBeNull();
  });

  it('returns null when no selector matches', () => {
    expect(resolveClick(fakeEl([]))).toBeNull();
  });

  it('matches a single data-action target', () => {
    const hit = resolveClick(fakeEl(['[data-action]']));
    expect(hit?.key).toBe('action');
  });

  it('maps every selector in the priority table to its key', () => {
    for (const [selector, key] of CLICK_PRIORITY) {
      const hit = resolveClick(fakeEl([selector]));
      expect(hit?.key, `selector ${selector}`).toBe(key);
    }
  });
});

describe('resolveClick — priority ordering', () => {
  it('data-action wins over data-room when both match', () => {
    // An element that closest-matches multiple selectors: first in table wins.
    const hit = resolveClick(fakeEl(['[data-room]', '[data-action]']));
    expect(hit?.key).toBe('action');
  });

  it('data-bar wins over data-tab when both match', () => {
    const hit = resolveClick(fakeEl(['[data-tab]', '[data-bar]']));
    expect(hit?.key).toBe('bar');
  });

  it('room-poly and room-label both resolve to room-overlay', () => {
    expect(resolveClick(fakeEl(['[data-room-poly]']))?.key).toBe('room-overlay');
    expect(resolveClick(fakeEl(['[data-room-label]']))?.key).toBe('room-overlay');
  });

  it('heatmap cell (data-date) resolves to heatmap-cell', () => {
    expect(resolveClick(fakeEl(['[data-date]']))?.key).toBe('heatmap-cell');
  });

  it('close buttons resolve independently of their popover rows', () => {
    expect(resolveClick(fakeEl(['[data-close]']))?.key).toBe('close');
    expect(resolveClick(fakeEl(['[data-close-maint]']))?.key).toBe('close-maint');
    expect(resolveClick(fakeEl(['[data-close-day]']))?.key).toBe('close-day');
  });
});

describe('resolveClick — element carried through', () => {
  it('returns the matched element so the handler can read its dataset', () => {
    const hit = resolveClick(fakeEl(['[data-action]'], { action: 'start' }));
    expect((hit?.el as HTMLElement).dataset.action).toBe('start');
  });
});

describe('resolveKeydownTarget — only roving-focus rows', () => {
  it('matches data-bar', () => {
    expect(resolveKeydownTarget(fakeEl(['[data-bar]']))?.key).toBe('bar');
  });

  it('matches data-maint', () => {
    expect(resolveKeydownTarget(fakeEl(['[data-maint]']))?.key).toBe('maint');
  });

  it('does not match data-action (not keyboard-activatable here)', () => {
    expect(resolveKeydownTarget(fakeEl(['[data-action]']))).toBeNull();
  });

  it('returns null for null target', () => {
    expect(resolveKeydownTarget(null)).toBeNull();
  });

  it('every keydown selector maps to its key', () => {
    for (const [selector, key] of KEYDOWN_PRIORITY) {
      expect(resolveKeydownTarget(fakeEl([selector]))?.key).toBe(key);
    }
  });
});

describe('priority table integrity', () => {
  it('has no duplicate selectors in the click priority table', () => {
    const selectors = CLICK_PRIORITY.map(([s]) => s);
    expect(new Set(selectors).size).toBe(selectors.length);
  });

  it('keydown selectors are a subset of click selectors', () => {
    const clickSelectors = new Set(CLICK_PRIORITY.map(([s]) => s));
    for (const [s] of KEYDOWN_PRIORITY) {
      expect(clickSelectors.has(s)).toBe(true);
    }
  });
});
