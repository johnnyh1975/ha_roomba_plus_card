import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHeatmap, renderSkeletonHeatmap } from '../src/heatmap';
import type { DaySummary } from '../src/types';

describe('renderSkeletonHeatmap()', () => {
  it('returns an SVG string', () =>
    expect(renderSkeletonHeatmap(4)).toContain('<svg'));

  it('contains skeleton pulse animation', () =>
    expect(renderSkeletonHeatmap(4)).toContain('rpc-pulse'));

  it('renders day headers', () => {
    const html = renderSkeletonHeatmap(4);
    expect(html).toContain('Mo');
    expect(html).toContain('Su');
  });
});

describe('renderHeatmap()', () => {
  const emptySummaries: DaySummary[] = [];

  it('returns an SVG string for empty data', () =>
    expect(renderHeatmap(emptySummaries, 28, 'auto')).toContain('<svg'));

  it('renders day headers (Mo through Su)', () => {
    const html = renderHeatmap(emptySummaries, 28, 'auto');
    ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].forEach(day =>
      expect(html).toContain(day));
  });

  it('completed mission cell has green colour', () => {
    const today = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const dateStr = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
    const summaries: DaySummary[] = [
      { date: dateStr, total: 1, completed: 1, stuck: 0, area_sqft: 200, result: 'completed' },
    ];
    expect(renderHeatmap(summaries, 28, 'auto')).toContain('#2d9c4f');
  });

  it('stuck mission cell has amber colour', () => {
    const today = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const dateStr = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
    const summaries: DaySummary[] = [
      { date: dateStr, total: 1, completed: 0, stuck: 1, area_sqft: null, result: 'stuck' },
    ];
    expect(renderHeatmap(summaries, 28, 'auto')).toContain('#d97706');
  });

  it('multi-mission day shows dot indicators', () => {
    const today = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const dateStr = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
    const summaries: DaySummary[] = [
      { date: dateStr, total: 3, completed: 3, stuck: 0, area_sqft: 600, result: 'completed' },
    ];
    // Multi-mission dot circles are rendered
    expect(renderHeatmap(summaries, 28, 'auto')).toContain('<circle');
  });

  it('isoDate uses local date not UTC (regression: timezone bug)', () => {
    // Inject a "today" whose UTC date would be yesterday if we used toISOString()
    // We do this by creating a date at 1am in UTC+14 (Kiribati)
    // Instead, verify the cell data-date matches what new Date() gives locally
    const today = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const expectedLocal = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
    const html = renderHeatmap([], 28, 'auto');
    expect(html).toContain(`data-date="${expectedLocal}"`);
  });
});

// ── v1.3 F6b: renderSparkline ─────────────────────────────────────────────────
import { renderSparkline, normalisedWifiPct, normalisedWifiFloor } from '../src/heatmap';

describe('renderSparkline()', () => {
  it('returns an SVG element with 7 bars for 7 readings', () => {
    const svg = renderSparkline([65, 70, 68, 55, 42, 60, 63], 42);
    expect(svg).toContain('<svg');
    const rectCount = (svg.match(/<rect/g) ?? []).length;
    expect(rectCount).toBe(7);
  });

  it('renders only actual bars for sparse data — no zero-padding', () => {
    // 1 reading → 1 bar, not 7 bars with 6 leading zeros
    const svg = renderSparkline([85], 85);
    const rectCount = (svg.match(/<rect/g) ?? []).length;
    expect(rectCount).toBe(1);
  });

  it('renders 3 bars for 3 readings', () => {
    const svg = renderSparkline([60, 75, 50], 50);
    const rectCount = (svg.match(/<rect/g) ?? []).length;
    expect(rectCount).toBe(3);
  });

  it('colours green when min >= 60', () => {
    const svg = renderSparkline([65, 70, 75, 80, 60, 72, 68], 60);
    expect(svg).toContain('var(--rpc-green)');
  });

  it('colours amber when min is 40–59', () => {
    const svg = renderSparkline([65, 70, 68, 55, 45, 60, 63], 45);
    expect(svg).toContain('var(--rpc-amber)');
  });

  it('colours red when min < 40', () => {
    const svg = renderSparkline([65, 70, 35, 55, 42, 60, 63], 35);
    expect(svg).toContain('var(--rpc-red)');
  });

  it('returns empty string for empty readings array', () => {
    expect(renderSparkline([], 0)).toBe('');
  });
});

describe('normalisedWifiPct()', () => {
  it('multiplies by 25 when all values <= 4 (wlBars scale)', () => {
    expect(normalisedWifiPct([0, 1, 2, 3, 4])).toEqual([0, 25, 50, 75, 100]);
  });

  it('passes through unchanged when any value > 4 (already percentage)', () => {
    expect(normalisedWifiPct([60, 75, 80])).toEqual([60, 75, 80]);
  });

  it('returns empty array for empty input', () => {
    expect(normalisedWifiPct([])).toEqual([]);
  });
});

describe('normalisedWifiFloor()', () => {
  it('multiplies by 25 for wlBars value <= 4', () => {
    expect(normalisedWifiFloor(1)).toBe(25);
    expect(normalisedWifiFloor(2)).toBe(50);
    expect(normalisedWifiFloor(0)).toBe(0);
    expect(normalisedWifiFloor(4)).toBe(100);
  });

  it('passes through unchanged for value > 4 (already percentage)', () => {
    expect(normalisedWifiFloor(38)).toBe(38);
    expect(normalisedWifiFloor(75)).toBe(75);
  });
});
