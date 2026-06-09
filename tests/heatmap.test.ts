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
import { renderSparkline, normalisedWifiPct, normalisedWifiFloor, mmToImagePct } from '../src/heatmap';

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
  it('5-element histogram: passes through unchanged (values already bucket percentages)', () => {
    // Confirmed format from Amendment 8d: [0, 35, 65, 0, 0] = buckets 1+2 occupied
    // length===5 → histogram path → pass through, never multiply by 25
    expect(normalisedWifiPct([0, 35, 65, 0, 0])).toEqual([0, 35, 65, 0, 0]);
  });

  it('5-element histogram with all-zero input: passes through unchanged', () => {
    expect(normalisedWifiPct([0, 0, 0, 0, 0])).toEqual([0, 0, 0, 0, 0]);
  });

  it('legacy scalar time-series: multiplies by 25 when length != 5 and all values <= 4', () => {
    // 7-element reading array — old format, not a histogram
    expect(normalisedWifiPct([0, 1, 2, 3, 4, 3, 2])).toEqual([0, 25, 50, 75, 100, 75, 50]);
  });

  it('passes through unchanged when length != 5 and any value > 4 (already percentage)', () => {
    expect(normalisedWifiPct([60, 75, 80])).toEqual([60, 75, 80]);
  });

  it('returns empty array for empty input', () => {
    expect(normalisedWifiPct([])).toEqual([]);
  });
});

describe('mmToImagePct()', () => {
  it('maps centre of extent to 50%', () => {
    const result = mmToImagePct(0, 0, -1000, 1000, -1000, 1000);
    expect(result.left).toBe('50.0%');
    expect(result.top).toBe('50.0%');
  });

  it('maps xMm=xMin to left=0%', () => {
    const result = mmToImagePct(-1000, 0, -1000, 1000, -1000, 1000);
    expect(result.left).toBe('0.0%');
  });

  it('inverts y-axis: yMm=yMax maps to top=0% (top of image)', () => {
    // y increases upward in pose space but downward in CSS — yMax is top of image
    const result = mmToImagePct(0, 1000, -1000, 1000, -1000, 1000);
    expect(result.top).toBe('0.0%');
  });

  it('inverts y-axis: yMm=yMin maps to top=100% (bottom of image)', () => {
    const result = mmToImagePct(0, -1000, -1000, 1000, -1000, 1000);
    expect(result.top).toBe('100.0%');
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

// ── Fixed-size SVG regression (B4 fix) ───────────────────────────────────────
describe('renderHeatmap() — fixed-size SVG (no CSS scaling)', () => {
  it('SVG has explicit width and height attributes, not just viewBox', () => {
    const html = renderHeatmap([], 28, 'auto');
    // Must have width="NNN" height="NNN" attributes for natural-size rendering
    expect(html).toMatch(/width="\d+"/);
    expect(html).toMatch(/height="\d+"/);
  });

  it('SVG width is ≤ 210px — enlarged in v1.5 (200px at 7 cols × 24px cell)', () => {
    // v1.5.0: CELL 16→24, width 142px→200px. Upper bound guards against regression.
    const html = renderHeatmap([], 28, 'auto');
    const match = html.match(/width="(\d+)"/);
    expect(match).not.toBeNull();
    const w = parseInt(match![1], 10);
    expect(w).toBeLessThanOrEqual(210);
  });

  it('day labels use font-size ≤ 9 — not oversized on mobile', () => {
    const html = renderHeatmap([], 28, 'auto');
    const match = html.match(/font-size="(\d+)"/);
    expect(match).not.toBeNull();
    const fs = parseInt(match![1], 10);
    expect(fs).toBeLessThanOrEqual(9);
  });

  it('week-start date labels rendered in label column for col=0 cells', () => {
    // A date in any month — first cell of a row (col=0) should have a day-number text label
    const html = renderHeatmap([], 28, 'auto');
    // text-anchor="end" appears on week-start labels (right-aligned in LABEL_COL)
    expect(html).toContain('text-anchor="end"');
  });
});

describe('renderSkeletonHeatmap() — fixed-size SVG', () => {
  it('SVG has explicit width and height attributes', () => {
    const html = renderSkeletonHeatmap(4);
    expect(html).toMatch(/width="\d+"/);
    expect(html).toMatch(/height="\d+"/);
  });
});

// ── F16: Dirt density opacity modulation ─────────────────────────────────────
describe('renderHeatmap() — F16 dirt density opacity', () => {
  const day = (date: string, opts: Partial<import('../../src/types').DaySummary> = {}) => ({
    date, total: 1, completed: 1, stuck: 0, area_sqft: 100, result: 'completed' as const, ...opts,
  });

  it('cell renders without opacity attribute when showDirtDensity false (default)', () => {
    const html = renderHeatmap([day('2026-06-01', { relative_to_baseline: 2.0 })], 7, 'auto');
    // No opacity attribute should appear when flag is off
    expect(html).not.toContain('opacity=');
  });

  it('cell has opacity < 1.0 when relative_to_baseline < 1.0 (cleaner than usual)', () => {
    const html = renderHeatmap([day('2026-06-01', { relative_to_baseline: 0.5 })], 7, 'auto', 'en-US', true);
    expect(html).toContain('opacity="');
    // 0.5 + 0.5/4 = 0.625 → clamped to 0.63
    const match = html.match(/opacity="([\d.]+)"/);
    expect(match).not.toBeNull();
    expect(parseFloat(match![1])).toBeLessThan(1.0);
  });

  it('cell opacity at max 1.0 when relative_to_baseline is high', () => {
    const html = renderHeatmap([day('2026-06-01', { relative_to_baseline: 4.0 })], 7, 'auto', 'en-US', true);
    const match = html.match(/opacity="([\d.]+)"/);
    expect(match).not.toBeNull();
    expect(parseFloat(match![1])).toBe(1.0);
  });

  it('cell opacity clamped to minimum 0.5 when relative_to_baseline is 0', () => {
    const html = renderHeatmap([day('2026-06-01', { relative_to_baseline: 0 })], 7, 'auto', 'en-US', true);
    const match = html.match(/opacity="([\d.]+)"/);
    expect(match).not.toBeNull();
    expect(parseFloat(match![1])).toBe(0.5);
  });

  it('opacity attribute absent when relative_to_baseline is null', () => {
    const html = renderHeatmap([day('2026-06-01', { relative_to_baseline: null })], 7, 'auto', 'en-US', true);
    expect(html).not.toContain('opacity=');
  });
});
