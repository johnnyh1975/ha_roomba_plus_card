import { describe, it, expect } from 'vitest';
import { renderHouseholdZone, renderHouseholdSkeleton } from '../../src/zones/household-zone';
import { makeHass, defaultCaps, baseConfig } from '../helpers';
import type { HouseholdSummary } from '../../src/types';

const multiConfig = { ...baseConfig, entities: ['vacuum.roomba1', 'vacuum.roomba2'] };

const sampleData: HouseholdSummary = {
  period_days: 28,
  total: { missions: 9, completed: 8, completion_pct: 88.9, area_sqft: 2100 },
  robots: [
    { entry_id: 'abc', name: 'Downstairs', floor: 'Ground Floor', missions: 5, completed: 5, completion_pct: 100, area_sqft: 1240 },
    { entry_id: 'def', name: 'Upstairs',   floor: 'First Floor',  missions: 4, completed: 3, completion_pct: 75,  area_sqft: 860  },
  ],
  floors: [
    { label: 'Ground Floor', missions: 5, completed: 5, area_sqft: 1240 },
    { label: 'First Floor',  missions: 4, completed: 3, area_sqft: 860  },
  ],
};

describe('renderHouseholdZone() — visibility gates', () => {
  it('returns empty string when fewer than 2 robots configured', () => {
    expect(renderHouseholdZone(makeHass(), baseConfig, defaultCaps, sampleData, false)).toBe('');
  });

  it('returns empty string when data is null', () => {
    expect(renderHouseholdZone(makeHass(), multiConfig, defaultCaps, null, false)).toBe('');
  });
});

describe('renderHouseholdZone() — content', () => {
  const html = renderHouseholdZone(makeHass(), multiConfig, defaultCaps, sampleData, false);

  it('renders robot rows with name and completion percentage', () => {
    expect(html).toContain('Downstairs');
    expect(html).toContain('Upstairs');
    expect(html).toContain('100%');
    expect(html).toContain('75%');
  });

  it('renders mission count in robot row metadata', () => {
    expect(html).toContain('5 missions');
    expect(html).toContain('4 missions');
  });

  it('combined row always rendered when data present', () => {
    expect(html).toContain('rpc-household-combined');
    expect(html).toContain('Combined');
    expect(html).toContain('89%');   // Math.round(88.9)
  });

  it('floor section rendered when floors array has multiple entries', () => {
    expect(html).toContain('rpc-household-floors');
    expect(html).toContain('Ground Floor');
    expect(html).toContain('First Floor');
  });

  it('floor section absent when floors array has single entry', () => {
    const singleFloor: HouseholdSummary = {
      ...sampleData,
      floors: [{ label: 'Ground Floor', missions: 9, completed: 8, area_sqft: 2100 }],
    };
    const h = renderHouseholdZone(makeHass(), multiConfig, defaultCaps, singleFloor, false);
    expect(h).not.toContain('rpc-household-floors');
  });

  it('floor section absent when floors property absent', () => {
    const noFloors: HouseholdSummary = { ...sampleData, floors: undefined };
    const h = renderHouseholdZone(makeHass(), multiConfig, defaultCaps, noFloors, false);
    expect(h).not.toContain('rpc-household-floors');
  });

  it('area converts to m² when isMetric true', () => {
    const h = renderHouseholdZone(makeHass(), multiConfig, defaultCaps, sampleData, true);
    expect(h).toContain('m²');
    expect(h).not.toContain('ft²');
  });

  it('completion percentage colour-coded: green ≥90, amber 70–89, red <70', () => {
    // Downstairs=100% → green, Upstairs=75% → amber
    expect(html).toContain('rpc-cov-green');
    expect(html).toContain('rpc-cov-amber');
  });
});

// v2.5.0 FLEET-1 (integration ≥ 3.4.3) — fleet-health rollup
describe('renderHouseholdZone() — v2.5.0 FLEET-1 fleet-health rollup', () => {
  it('no fleet-health line at all when fleet_health is absent (integration < 3.4.3)', () => {
    const html = renderHouseholdZone(makeHass(), multiConfig, defaultCaps, sampleData, false);
    expect(html).not.toContain('rpc-household-fleet-health');
  });

  it('"all healthy" line, same calm-answer philosophy as Rooms-Overdue, when nothing needs attention', () => {
    const data: HouseholdSummary = {
      ...sampleData,
      fleet_health: { robot_count: 2, robots_needing_attention: [] },
    };
    const html = renderHouseholdZone(makeHass(), multiConfig, defaultCaps, data, false);
    expect(html).toContain('rpc-household-fleet-ok');
    expect(html).toContain('All 2 robots healthy');
  });

  it('singular "1 robot healthy" for a single-robot fleet_health count', () => {
    const data: HouseholdSummary = {
      ...sampleData,
      fleet_health: { robot_count: 1, robots_needing_attention: [] },
    };
    const html = renderHouseholdZone(makeHass(), multiConfig, defaultCaps, data, false);
    expect(html).toContain('All 1 robot healthy');
    expect(html).not.toContain('All 1 robots healthy');
  });

  it('"N need attention" line listing names when robots_needing_attention is non-empty', () => {
    const data: HouseholdSummary = {
      ...sampleData,
      fleet_health: { robot_count: 2, robots_needing_attention: ['Upstairs'] },
    };
    const html = renderHouseholdZone(makeHass(), multiConfig, defaultCaps, data, false);
    expect(html).toContain('rpc-household-fleet-warn');
    expect(html).toContain('1 of 2 need attention: Upstairs');
  });

  it('escapes robot names in the "need attention" list (defensive)', () => {
    const data: HouseholdSummary = {
      ...sampleData,
      fleet_health: { robot_count: 1, robots_needing_attention: ['<script>alert(1)</script>'] },
    };
    const html = renderHouseholdZone(makeHass(), multiConfig, defaultCaps, data, false);
    expect(html).not.toContain('<script>alert(1)</script>');
  });

  it('per-robot ⚠ badge with a tooltip citing maintenance_due', () => {
    const data: HouseholdSummary = {
      ...sampleData,
      robots: [
        { ...sampleData.robots[0], maintenance_due: true, needs_attention: true },
        sampleData.robots[1],
      ],
    };
    const html = renderHouseholdZone(makeHass(), multiConfig, defaultCaps, data, false);
    expect(html).toContain('rpc-household-attention');
    expect(html).toContain('title="maintenance due"');
  });

  it('per-robot ⚠ badge tooltip cites health trend declining, and both reasons joined when both apply', () => {
    const data: HouseholdSummary = {
      ...sampleData,
      robots: [
        { ...sampleData.robots[0], health_trend: 'declining', needs_attention: true },
        { ...sampleData.robots[1], maintenance_due: true, health_trend: 'declining', needs_attention: true },
      ],
    };
    const html = renderHouseholdZone(makeHass(), multiConfig, defaultCaps, data, false);
    expect(html).toContain('title="health trend declining"');
    expect(html).toContain('title="maintenance due; health trend declining"');
  });

  it('no ⚠ badge when needs_attention is false or absent', () => {
    const html = renderHouseholdZone(makeHass(), multiConfig, defaultCaps, sampleData, false);
    expect(html).not.toContain('rpc-household-attention');
  });

  it('shows battery retention in robot meta when present', () => {
    const data: HouseholdSummary = {
      ...sampleData,
      robots: [
        { ...sampleData.robots[0], battery_capacity_retention_pct: 87.4 },
        sampleData.robots[1],
      ],
    };
    const html = renderHouseholdZone(makeHass(), multiConfig, defaultCaps, data, false);
    expect(html).toContain('87% battery');
  });

  it('no battery meta text when battery_capacity_retention_pct is absent', () => {
    const html = renderHouseholdZone(makeHass(), multiConfig, defaultCaps, sampleData, false);
    expect(html).not.toContain('battery');
  });
});

// v2.5.0 — household view loading skeleton
describe('renderHouseholdSkeleton()', () => {
  it('renders a zone with pulsing placeholder rows, no real data required', () => {
    const html = renderHouseholdSkeleton(makeHass());
    expect(html).toContain('rpc-zone7');
    expect(html).toContain('rpc-household-skel-row');
    expect(html).toContain('rpc-skel-bar');
  });

  it('renders more than one placeholder row', () => {
    const html = renderHouseholdSkeleton(makeHass());
    const rowCount = (html.match(/rpc-household-skel-row/g) || []).length;
    expect(rowCount).toBeGreaterThanOrEqual(2);
  });

  it('does not contain any real robot content (pure placeholder, no data leakage)', () => {
    const html = renderHouseholdSkeleton(makeHass());
    expect(html).not.toContain('Downstairs');
    expect(html).not.toContain('%');
  });
});
