import { describe, it, expect } from 'vitest';
import { renderHouseholdZone } from '../../src/zones/household-zone';
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
