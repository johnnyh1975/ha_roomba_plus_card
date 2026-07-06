/**
 * v2.3.0 — mm→percentage transform derived from `calibration_points`
 * (3 pose-space-mm ↔ pixel anchor pairs), NOT from a bounding box.
 *
 * Why this exists: `image.*_coverage_map`'s x_min_mm/x_max_mm/y_min_mm/
 * y_max_mm bbox comes from GridStore.bounding_box_mm() — an independent
 * data source from the live map's own MapRenderer extent. Reusing that
 * bbox to position `image.*_map`'s rooms/zones/door_markers/furniture
 * data would risk a silent spatial mismatch (verified against source:
 * the two bboxes have no guaranteed relationship). `calibration_points`
 * sidesteps this entirely — it's produced by UmfAligner.calibration_points()
 * using the SAME mm→px function the renderer itself uses
 * (MapRenderer._mm_to_px_fit), so a transform derived from it always
 * matches image.*_map's actual rendered pixels exactly, no bbox needed.
 *
 * Canvas is a fixed 600×600 square (RendererConfig.size_px, verified
 * against source) — the same constant XVMC assumes for these points.
 */
export const CALIBRATION_CANVAS_PX = 600;

export interface CalibrationPoint {
  vacuum: { x: number; y: number };
  map: { x: number; y: number };
}

/** Derived affine transform: mm → px, one independent scale/offset pair
 *  per axis (matches MapRenderer._mm_to_px_fit: shared magnitude scale
 *  with a y-flip in practice, but derived generally here rather than
 *  assumed, so it stays correct even if that ever changes). */
export interface CalibrationTransform {
  toPx(xMm: number, yMm: number): { x: number; y: number };
}

/**
 * Build a transform from 3 calibration points. Anchors are constructed
 * integration-side as (minX,minY), (maxX,minY), (maxX,maxY) — point 0→1
 * share Y (pure X-axis sample), point 1→2 share X (pure Y-axis sample).
 * Solved directly from those pairs rather than a general least-squares
 * fit — simpler, and exact for the axis-aligned scale+translate+y-flip
 * transform `_mm_to_px_fit` actually produces.
 *
 * Returns null when fewer than 3 points are given, or degenerate (a
 * home with zero mm extent on either axis — no real installation, but
 * guarded rather than dividing by zero).
 */
export function buildCalibrationTransform(points: CalibrationPoint[]): CalibrationTransform | null {
  if (!Array.isArray(points) || points.length < 3) return null;
  const [p0, p1, p2] = points;
  if (!p0?.vacuum || !p0?.map || !p1?.vacuum || !p1?.map || !p2?.vacuum || !p2?.map) return null;

  // Bug-hunt round 1: existence checks above don't guarantee the values
  // are actually numbers — malformed integration data (a stray null/NaN/
  // string in one coordinate) would otherwise silently produce NaN
  // scale/offset values here, then NaN pixel positions everywhere the
  // transform is used, rendering a garbled overlay instead of cleanly
  // showing none. Validate all 6 coordinates are finite numbers upfront.
  const allCoords = [
    p0.vacuum.x, p0.vacuum.y, p0.map.x, p0.map.y,
    p1.vacuum.x, p1.vacuum.y, p1.map.x, p1.map.y,
    p2.vacuum.x, p2.vacuum.y, p2.map.x, p2.map.y,
  ];
  if (!allCoords.every(v => typeof v === 'number' && Number.isFinite(v))) return null;

  const dxMm = p1.vacuum.x - p0.vacuum.x;
  const dyMm = p2.vacuum.y - p1.vacuum.y;
  if (dxMm === 0 || dyMm === 0) return null;

  const scaleX = (p1.map.x - p0.map.x) / dxMm;
  const offsetX = p0.map.x - scaleX * p0.vacuum.x;
  const scaleY = (p2.map.y - p1.map.y) / dyMm;
  const offsetY = p1.map.y - scaleY * p1.vacuum.y;

  return {
    toPx(xMm: number, yMm: number) {
      return { x: scaleX * xMm + offsetX, y: scaleY * yMm + offsetY };
    },
  };
}

/** CSS-percentage variant, matching mmToImagePct's {left, top} string shape. */
export function calibrationToImagePct(
  cal: CalibrationTransform, xMm: number, yMm: number,
): { left: string; top: string } {
  const { x, y } = cal.toPx(xMm, yMm);
  return {
    left: (x / CALIBRATION_CANVAS_PX * 100).toFixed(1) + '%',
    top:  (y / CALIBRATION_CANVAS_PX * 100).toFixed(1) + '%',
  };
}

/** Numeric-percentage variant, matching mmToImagePctNum's {x, y} shape
 *  (for SVG polygon point lists, which need raw numbers). */
export function calibrationToImagePctNum(
  cal: CalibrationTransform, xMm: number, yMm: number,
): { x: number; y: number } {
  const { x, y } = cal.toPx(xMm, yMm);
  return { x: x / CALIBRATION_CANVAS_PX * 100, y: y / CALIBRATION_CANVAS_PX * 100 };
}
