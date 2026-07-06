import { describe, it, expect } from 'vitest';
import { buildCalibrationTransform, calibrationToImagePct, calibrationToImagePctNum, CALIBRATION_CANVAS_PX } from '../src/calibration';

// Matches the integration's own anchor construction: (minX,minY), (maxX,minY),
// (maxX,maxY) — point0→1 share Y (X-axis sample), point1→2 share X (Y-axis
// sample). scale = 0.3 px/mm, verified by hand below.
const points = [
  { vacuum: { x: -1000, y: -800 }, map: { x: 0, y: 480 } },
  { vacuum: { x: 1000, y: -800 }, map: { x: 600, y: 480 } },
  { vacuum: { x: 1000, y: 800 }, map: { x: 600, y: 0 } },
];

describe('buildCalibrationTransform', () => {
  it('returns null with fewer than 3 points', () => {
    expect(buildCalibrationTransform([])).toBeNull();
    expect(buildCalibrationTransform([points[0], points[1]])).toBeNull();
  });

  it('returns null when a point is malformed', () => {
    expect(buildCalibrationTransform([points[0], points[1], { vacuum: { x: 1, y: 1 } } as any])).toBeNull();
  });

  it('returns null on degenerate input (zero mm extent on an axis)', () => {
    const degenerate = [
      { vacuum: { x: 0, y: -800 }, map: { x: 0, y: 480 } },
      { vacuum: { x: 0, y: -800 }, map: { x: 600, y: 480 } }, // same vacuum.x as point0
      { vacuum: { x: 1000, y: 800 }, map: { x: 600, y: 0 } },
    ];
    expect(buildCalibrationTransform(degenerate)).toBeNull();
  });

  // ── Bug-hunt round 1: existence checks alone don't guarantee the
  // coordinate values are actual finite numbers. ──
  it('returns null when a coordinate is NaN', () => {
    const bad = [
      { vacuum: { x: NaN, y: -800 }, map: { x: 0, y: 480 } },
      points[1], points[2],
    ];
    expect(buildCalibrationTransform(bad)).toBeNull();
  });

  it('returns null when a coordinate is a non-numeric value smuggled through untyped input', () => {
    const bad = [
      { vacuum: { x: 'not-a-number' as unknown as number, y: -800 }, map: { x: 0, y: 480 } },
      points[1], points[2],
    ];
    expect(buildCalibrationTransform(bad)).toBeNull();
  });

  it('returns null when a coordinate is null', () => {
    const bad = [
      { vacuum: { x: null as unknown as number, y: -800 }, map: { x: 0, y: 480 } },
      points[1], points[2],
    ];
    expect(buildCalibrationTransform(bad)).toBeNull();
  });

  it('derives the dock origin (0,0) correctly from the fixture anchors', () => {
    const cal = buildCalibrationTransform(points)!;
    expect(cal).not.toBeNull();
    // px_x = 0.3*x_mm + 300 ; px_y = -0.3*y_mm + 240 (derived by hand from the fixture)
    const p = cal.toPx(0, 0);
    expect(p.x).toBeCloseTo(300, 5);
    expect(p.y).toBeCloseTo(240, 5);
  });

  it('reproduces all three input anchors exactly', () => {
    const cal = buildCalibrationTransform(points)!;
    for (const pt of points) {
      const p = cal.toPx(pt.vacuum.x, pt.vacuum.y);
      expect(p.x).toBeCloseTo(pt.map.x, 5);
      expect(p.y).toBeCloseTo(pt.map.y, 5);
    }
  });

  it('uses only the first 3 points when more are given', () => {
    const extra = [...points, { vacuum: { x: 9999, y: 9999 }, map: { x: 9999, y: 9999 } }];
    const cal = buildCalibrationTransform(extra)!;
    const p = cal.toPx(0, 0);
    expect(p.x).toBeCloseTo(300, 5);
    expect(p.y).toBeCloseTo(240, 5);
  });
});

describe('calibrationToImagePct / calibrationToImagePctNum', () => {
  const cal = buildCalibrationTransform(points)!;

  it('converts to CSS percentage strings relative to the 600px canvas', () => {
    const pct = calibrationToImagePct(cal, 0, 0);
    expect(pct.left).toBe((300 / CALIBRATION_CANVAS_PX * 100).toFixed(1) + '%');
    expect(pct.top).toBe((240 / CALIBRATION_CANVAS_PX * 100).toFixed(1) + '%');
  });

  it('converts to numeric percentages for SVG point lists', () => {
    const pct = calibrationToImagePctNum(cal, 0, 0);
    expect(pct.x).toBeCloseTo(300 / CALIBRATION_CANVAS_PX * 100, 5);
    expect(pct.y).toBeCloseTo(240 / CALIBRATION_CANVAS_PX * 100, 5);
  });
});
