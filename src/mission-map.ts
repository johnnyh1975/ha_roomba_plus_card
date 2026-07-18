import { MissionMapPayload } from './types.js';
import { esc } from './utils.js';

/**
 * v2.3.0 MISSION-MAP — client-side coverage replay for one finished mission.
 *
 * Renders integration ≥ 3.3.0's `map.json` payload as an SVG: room outlines
 * as backdrop, coverage points on top. Deliberately a from-scratch fit —
 * NOT the live coverage image's transform. `coverage_mm` and this payload's
 * own `rooms` field are both in raw UMF-space mm (verified against
 * MissionMapJsonView source: it reads aligner.room_polygons_umf directly,
 * with no umf_to_pose() applied) — a different space from the live
 * image.*_map entity's pose-space `rooms` attribute. Mixing the
 * two would silently misplace everything, so this module takes only this
 * payload as input and computes its own bounding box/scale — no aligner
 * state, no dependency on card-side room-overlay code.
 *
 * Mirrors the integration's own render_mission_map_png() (same fit-to-box +
 * y-flip logic, reimplemented in TS) so card output stays visually
 * consistent with the map.png fallback anyone gets even without the card.
 */

const SVG_SIZE = 280;      // px — square viewBox, fits inline in the day-detail panel
const MARGIN   = 12;       // px
const MIN_CONTENT_MM = 1000; // guard against degenerate/near-zero extents

export interface MissionMapGeometry {
  /** Precomputed pixel positions for each coverage point, same order as input. */
  points: { x: number; y: number; r: number }[];
  /** Precomputed pixel polygons, one per room, in {name, path} pairs. */
  rooms: { name: string; points: string }[];
  /** True when there was nothing to draw (empty coverage AND empty rooms). */
  empty: boolean;
}

/**
 * Pure geometry builder — bbox, fit-to-box scale, y-flip, dot radius from
 * the real robot footprint (point_area_m[0]), all independent of SVG string
 * assembly so this is unit-testable without parsing markup.
 */
export function buildMissionMapGeometry(payload: MissionMapPayload): MissionMapGeometry {
  const coverage = Array.isArray(payload.coverage_mm) ? payload.coverage_mm : [];
  const roomEntries = payload.rooms && typeof payload.rooms === 'object' ? Object.entries(payload.rooms) : [];

  const xs: number[] = [];
  const ys: number[] = [];
  for (const p of coverage) {
    if (!Array.isArray(p) || p.length < 2) continue;
    const [x, y] = p;
    if (typeof x !== 'number' || typeof y !== 'number' || !isFinite(x) || !isFinite(y)) continue;
    xs.push(x); ys.push(y);
  }
  for (const [, poly] of roomEntries) {
    if (!Array.isArray(poly)) continue;
    for (const v of poly) {
      if (!Array.isArray(v) || v.length < 2) continue;
      const [x, y] = v;
      if (typeof x !== 'number' || typeof y !== 'number' || !isFinite(x) || !isFinite(y)) continue;
      xs.push(x); ys.push(y);
    }
  }

  if (xs.length === 0) {
    return { points: [], rooms: [], empty: true };
  }

  const minX = Math.min(...xs), maxX = Math.max(...xs);
  const minY = Math.min(...ys), maxY = Math.max(...ys);
  const contentW = Math.max(maxX - minX, MIN_CONTENT_MM);
  const contentH = Math.max(maxY - minY, MIN_CONTENT_MM);
  const avail = SVG_SIZE - 2 * MARGIN;
  const scale = avail / Math.max(contentW, contentH);

  // y flipped: UMF y grows up, SVG y grows down — matches the integration's
  // own render_mission_map_png() convention exactly.
  const toPx = (x: number, y: number): [number, number] => [
    MARGIN + (x - minX) * scale,
    SVG_SIZE - MARGIN - (y - minY) * scale,
  ];

  // Coverage dot radius from the real robot footprint (point_area_m is
  // [w_m, h_m] of one coverage point, in metres) — floor of 2px for
  // visibility on very zoomed-out missions. Malformed/absent point_area_m
  // falls back to a fixed cosmetic size rather than throwing (mirrors the
  // integration's own bug-hunt-round-3 guard for the same field).
  let sideMm = 100;
  const pa0 = payload.point_area_m?.[0];
  if (typeof pa0 === 'number' && isFinite(pa0) && pa0 > 0) {
    sideMm = pa0 * 1000;
  }
  const radius = Math.max(2, (sideMm * scale) / 2);

  const points = coverage
    .filter((p): p is [number, number] =>
      Array.isArray(p) && p.length >= 2 &&
      typeof p[0] === 'number' && typeof p[1] === 'number' &&
      isFinite(p[0]) && isFinite(p[1]))
    .map(([x, y]) => {
      const [px, py] = toPx(x, y);
      return { x: px, y: py, r: radius };
    });

  const rooms = roomEntries
    .map(([name, poly]) => {
      if (!Array.isArray(poly) || poly.length < 3) return null;
      const validPoly = poly.filter((v): v is [number, number] =>
        Array.isArray(v) && v.length >= 2 &&
        typeof v[0] === 'number' && typeof v[1] === 'number' &&
        isFinite(v[0]) && isFinite(v[1]));
      if (validPoly.length < 3) return null;
      const pathStr = validPoly.map(([x, y]) => toPx(x, y).join(',')).join(' ');
      return { name, points: pathStr };
    })
    .filter((r): r is { name: string; points: string } => r !== null);

  return { points, rooms, empty: points.length === 0 && rooms.length === 0 };
}

/**
 * Assemble the geometry into an inline SVG string. Pure — no DOM access.
 *
 * v2.4.0 MISSION-MAP-ROTATE-PARITY: optional `rotate` (0/90/180/270,
 * clockwise) mirrors the integration's own `?rotate=` query param on
 * `.../map.png` (integration ≥ 3.4.1) — same user-facing intent (their
 * dashboard's orientation doesn't match the robot's Smart Map orientation),
 * but a much simpler mechanism here: the integration rotates the finished
 * *raster* image as a whole (PIL transpose, verified against source —
 * applied after all drawing, not a coordinate-space transform before it),
 * whereas this SVG only needs a single group-level `transform="rotate(...)"`
 * around the viewBox centre — lossless, and no change to
 * buildMissionMapGeometry()'s point/polygon math at all.
 */
export function renderMissionMapSvg(payload: MissionMapPayload, rotate: 0 | 90 | 180 | 270 = 0): string {
  const geo = buildMissionMapGeometry(payload);
  if (geo.empty) {
    return `<div class="rpc-map-panel rpc-explain-panel--muted">No coverage data to draw for this mission.</div>`;
  }
  const roomPolys = geo.rooms
    .map(r => `<polygon class="rpc-map-room" points="${esc(r.points)}"><title>${esc(r.name)}</title></polygon>`)
    .join('');
  const dots = geo.points
    .map(p => `<circle class="rpc-map-dot" cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${p.r.toFixed(1)}"/>`)
    .join('');
  const center = SVG_SIZE / 2;
  const content = `${roomPolys}${dots}`;
  const rotated = rotate !== 0
    ? `<g transform="rotate(${rotate} ${center} ${center})">${content}</g>`
    : content;
  return `
    <div class="rpc-map-panel">
      <svg class="rpc-map-svg" viewBox="0 0 ${SVG_SIZE} ${SVG_SIZE}" width="${SVG_SIZE}" height="${SVG_SIZE}" role="img" aria-label="Mission coverage map">
        ${rotated}
      </svg>
    </div>`;
}
