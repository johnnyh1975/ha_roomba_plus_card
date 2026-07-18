import { describe, it, expect } from 'vitest';
import { buildMissionMapGeometry, renderMissionMapSvg } from '../src/mission-map';
import type { MissionMapPayload } from '../src/types';

function basePayload(over: Partial<MissionMapPayload> = {}): MissionMapPayload {
  return {
    record_id: 'm_1', mission_id: 'abc', nmssn: 42, pmap_id: 'p1', pmapv_id: 'v1',
    point_area_m: [0.1049, 0.1049],
    coverage_mm: [[0, 0], [1000, 0], [1000, 1000]],
    rooms: { Kitchen: [[0, 0], [2000, 0], [2000, 2000], [0, 2000]] },
    ...over,
  };
}

describe('buildMissionMapGeometry — bbox, scale, y-flip', () => {
  it('produces one point per coverage entry and one room polygon', () => {
    const geo = buildMissionMapGeometry(basePayload());
    expect(geo.empty).toBe(false);
    expect(geo.points).toHaveLength(3);
    expect(geo.rooms).toHaveLength(1);
    expect(geo.rooms[0].name).toBe('Kitchen');
  });

  it('y-flips: a higher UMF y (grows up) must map to a smaller SVG y (grows down)', () => {
    const geo = buildMissionMapGeometry(basePayload({
      coverage_mm: [[0, 0], [0, 2000]],
      rooms: {},
    }));
    const [lowY, highY] = geo.points;
    // UMF y=0 is "lower" in real space, y=2000 is "higher" — SVG must invert.
    expect(lowY.y).toBeGreaterThan(highY.y);
  });

  it('derives dot radius from point_area_m (real footprint, not fixed cosmetic size)', () => {
    const small = buildMissionMapGeometry(basePayload({ point_area_m: [0.05, 0.05] }));
    const large = buildMissionMapGeometry(basePayload({ point_area_m: [0.3, 0.3] }));
    expect(large.points[0].r).toBeGreaterThan(small.points[0].r);
  });

  it('falls back to a fixed cosmetic radius on malformed point_area_m (bug-hunt-round-3 style guard)', () => {
    const geo = buildMissionMapGeometry(basePayload({ point_area_m: ['garbage' as unknown as number] }));
    expect(geo.points[0].r).toBeGreaterThanOrEqual(2);
    expect(Number.isFinite(geo.points[0].r)).toBe(true);
  });

  it('falls back to a fixed cosmetic radius on empty point_area_m', () => {
    const geo = buildMissionMapGeometry(basePayload({ point_area_m: [] }));
    expect(Number.isFinite(geo.points[0].r)).toBe(true);
    expect(geo.points[0].r).toBeGreaterThanOrEqual(2);
  });

  it('reports empty when coverage_mm and rooms are both empty', () => {
    const geo = buildMissionMapGeometry(basePayload({ coverage_mm: [], rooms: {} }));
    expect(geo.empty).toBe(true);
    expect(geo.points).toHaveLength(0);
    expect(geo.rooms).toHaveLength(0);
  });

  it('handles a single coverage point without divide-by-zero (degenerate bbox guard)', () => {
    const geo = buildMissionMapGeometry(basePayload({ coverage_mm: [[500, 500]], rooms: {} }));
    expect(geo.empty).toBe(false);
    expect(geo.points).toHaveLength(1);
    expect(Number.isFinite(geo.points[0].x)).toBe(true);
    expect(Number.isFinite(geo.points[0].y)).toBe(true);
  });

  it('skips malformed individual coverage points instead of throwing', () => {
    const geo = buildMissionMapGeometry(basePayload({
      coverage_mm: [[100, 100], ['bad', 200] as unknown as [number, number], [300, 300]],
      rooms: {},
    }));
    expect(geo.points).toHaveLength(2);
  });

  it('drops a room polygon with fewer than 3 valid vertices', () => {
    const geo = buildMissionMapGeometry(basePayload({
      coverage_mm: [],
      rooms: { TooSmall: [[0, 0], [100, 100]] },
    }));
    expect(geo.rooms).toHaveLength(0);
  });

  it('room bounding box alone (no coverage) still produces a valid scale', () => {
    const geo = buildMissionMapGeometry(basePayload({ coverage_mm: [] }));
    expect(geo.empty).toBe(false);
    expect(geo.rooms).toHaveLength(1);
  });
});

describe('renderMissionMapSvg', () => {
  it('renders an SVG with room polygons and coverage dots', () => {
    const html = renderMissionMapSvg(basePayload());
    expect(html).toContain('<svg');
    expect(html).toContain('rpc-map-room');
    expect(html).toContain('rpc-map-dot');
  });

  it('escapes room names in the polygon title', () => {
    const html = renderMissionMapSvg(basePayload({ rooms: { '<script>alert(1)</script>': [[0, 0], [100, 0], [100, 100]] } }));
    expect(html).not.toContain('<script>alert(1)</script>');
  });

  it('renders a calm empty message instead of an empty SVG when there is nothing to draw', () => {
    const html = renderMissionMapSvg(basePayload({ coverage_mm: [], rooms: {} }));
    expect(html).not.toContain('<svg');
    expect(html).toContain('No coverage data');
  });

  // v2.4.0 MISSION-MAP-ROTATE-PARITY
  describe('rotate parameter', () => {
    it('adds no rotate transform when rotate is omitted (default)', () => {
      const html = renderMissionMapSvg(basePayload());
      expect(html).not.toContain('rotate(');
    });

    it('adds no rotate transform when rotate is explicitly 0', () => {
      const html = renderMissionMapSvg(basePayload(), 0);
      expect(html).not.toContain('rotate(');
    });

    it.each([90, 180, 270] as const)('wraps content in a %d° rotate transform around the SVG centre', (deg) => {
      const html = renderMissionMapSvg(basePayload(), deg);
      expect(html).toContain(`transform="rotate(${deg} 140 140)"`);
    });

    it('still contains the same room/dot markup regardless of rotation (geometry itself is untouched)', () => {
      const unrotated = renderMissionMapSvg(basePayload());
      const rotated = renderMissionMapSvg(basePayload(), 90);
      expect(rotated).toContain('rpc-map-room');
      expect(rotated).toContain('rpc-map-dot');
      // Same inner content, just wrapped in an extra <g> — the polygon
      // points/circle coordinates themselves are identical either way,
      // since rotation is a pure SVG-level transform, not a coordinate
      // recomputation (buildMissionMapGeometry never sees `rotate`).
      const dotMatch = unrotated.match(/<circle[^>]*\/>/);
      expect(rotated).toContain(dotMatch![0]);
    });

    it('an empty-mission message is unaffected by rotate (nothing to wrap)', () => {
      const html = renderMissionMapSvg(basePayload({ coverage_mm: [], rooms: {} }), 90);
      expect(html).toContain('No coverage data');
      expect(html).not.toContain('rotate(');
    });
  });
});
