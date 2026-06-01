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
