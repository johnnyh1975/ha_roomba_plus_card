import { DaySummary } from './types.js';

// ── Heatmap cell colours (semantic — intentionally not theme-variable mapped)
// These are data-meaning colours, not brand colours. They must be consistent
// regardless of the active HA theme so users can parse the calendar at a glance.
const COLOURS: Record<string, string> = {
  completed: '#2d9c4f',
  stuck:     '#d97706',
  error:     '#dc2626',
  cancelled: '#9ca3af',
  none:      'var(--rpc-cell-empty, var(--rpc-grey-light, #e5e7eb))',
};

// ── Compact cell constants — fixed pixel geometry, no CSS scaling ────────────
// The SVG has explicit width/height attributes so it renders at exactly this
// size and never stretches to fill the card width. Width at 7 cols:
//   label_col + 7 × cellSize + 6 × cellGap = 20 + 7×24 + 6×2 = 20+168+12 = 200px
// v1.5.0: CELL 16→24, LABEL_COL 18→20, HEADER_H 16→18 for improved readability
// and touch target size (28×28px vs previous 18×18px). Week-start dates added
// to label column to justify the 20px reservation.
const CELL      = 24;   // px — visible cell square (was 16)
const CELL_GAP  = 2;    // px — gap between cells
const LABEL_COL = 20;   // px — left column for week-start day labels (was 18)
const HEADER_H  = 18;   // px — height of the day-header row (was 16)
const STEP      = CELL + CELL_GAP;

function svgW(cols = 7): number { return LABEL_COL + cols * STEP - CELL_GAP; }
function svgH(numWeeks: number): number { return HEADER_H + numWeeks * STEP - CELL_GAP + 4; }

function formatDate(date: Date, locale: string): string {
  return date.toLocaleDateString(locale, { month: 'short', day: 'numeric' });
}

/** Local-time ISO date (YYYY-MM-DD). Never use toISOString() — that's UTC and breaks for UTC+ users. */
function isoDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function renderHeatmap(
  summaries: DaySummary[],
  days: number,
  _areaUnit: 'auto' | 'sqft' | 'm2',
  locale = 'en-US',
  showDirtDensity = false,   // F16: modulate cell opacity by relative_to_baseline
): string {
  // Build date map
  const byDate = new Map<string, DaySummary>();
  for (const s of summaries) byDate.set(s.date, s);

  // Build grid: oldest top-left, today bottom-right, Mon-aligned
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - (days - 1));
  const dow = (startDate.getDay() + 6) % 7; // Mon=0
  startDate.setDate(startDate.getDate() - dow);

  const numWeeks = Math.ceil((days + dow) / 7);

  const cells: { date: Date; summary: DaySummary | null; col: number; row: number }[] = [];
  for (let week = 0; week < numWeeks; week++) {
    for (let d = 0; d < 7; d++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + week * 7 + d);
      if (date > today) continue;
      cells.push({ date, summary: byDate.get(isoDate(date)) ?? null, col: d, row: week });
    }
  }

  const W = svgW();
  const H = svgH(numWeeks);
  const dayLabels = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

  // SVG has explicit width/height — renders at natural size, no CSS stretching
  let svg = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" role="grid" aria-label="Cleaning history heatmap">`;

  // Day column headers — compact, centred into each column
  for (let d = 0; d < 7; d++) {
    const x = LABEL_COL + d * STEP + CELL / 2;
    svg += `<text x="${x}" y="13" text-anchor="middle" font-size="9" fill="var(--secondary-text-color, #9ca3af)" font-family="inherit">${dayLabels[d]}</text>`;
  }

  // Cells
  for (const cell of cells) {
    const x = LABEL_COL + cell.col * STEP;
    const y = HEADER_H + cell.row * STEP;
    const result = cell.summary?.result ?? 'none';
    const colour = COLOURS[result] ?? COLOURS.none;
    const total  = cell.summary?.total ?? 0;

    let label = formatDate(cell.date, locale);
    if (total === 0) label += ': no missions';
    else if (total === 1) label += `: 1 mission, ${result}`;
    else label += `: ${total} missions, ${result}`;

    // Week-start date label in LABEL_COL (day of month, right-aligned)
    if (cell.col === 0) {
      const dayNum = cell.date.getDate();
      svg += `<text x="${LABEL_COL - 3}" y="${y + CELL / 2 + 3}" text-anchor="end" font-size="9" fill="var(--secondary-text-color, #9ca3af)" font-family="inherit">${dayNum}</text>`;
    }

    // F16 — dirt density opacity modulation.
    // relative_to_baseline: 1.0 = normal, 2.0 = double dirt, 0.5 = cleaner than usual.
    // Opacity range 0.5–1.0: cells never fully invisible regardless of density.
    // null (no baseline yet) → no opacity attribute → renders at full opacity, same as before.
    let opacityAttr = '';
    if (showDirtDensity && cell.summary?.relative_to_baseline != null) {
      const ratio   = cell.summary.relative_to_baseline;
      const opacity = Math.min(1.0, Math.max(0.5, 0.5 + ratio / 4));
      opacityAttr   = ` opacity="${opacity.toFixed(2)}"`;
    }

    svg += `<g role="gridcell" aria-label="${label}" data-date="${isoDate(cell.date)}" data-result="${result}" data-total="${total}" style="cursor:pointer">`;
    // Invisible touch target (2px larger each side than cell — 28×28px touch area)
    svg += `<rect x="${x - 2}" y="${y - 2}" width="${CELL + 4}" height="${CELL + 4}" fill="transparent" rx="4"/>`;
    // Visible cell
    svg += `<rect x="${x}" y="${y}" width="${CELL}" height="${CELL}" fill="${colour}" rx="3"${opacityAttr}/>`;
    // Multi-mission dot indicators (up to 3 dots, bottom edge; scaled for 24px cell)
    if (total > 1) {
      const dots = Math.min(total, 3);
      for (let i = 0; i < dots; i++) {
        const dx = x + CELL - 4 - i * 5;
        const dy = y + CELL - 3;
        svg += `<circle cx="${dx}" cy="${dy}" r="2" fill="rgba(255,255,255,0.75)"/>`;
      }
    }
    svg += `</g>`;
  }

  svg += `</svg>`;
  return svg;
}

/**
 * F6b — Render a 7-bar WiFi signal sparkline as inline SVG.
 * @param readings  Array of wlBars values (0–4 scale from robot, or raw % values).
 *                  Renders up to 7 bars; if >7 values supplied, samples evenly.
 * @param minVal    Minimum value across the reading set (pre-computed for colour).
 * @returns         Inline SVG string, colour-coded by floor signal.
 */
/**
 * Normalise a wlBars reading array to percentage scale (0–100).
 *
 * The iRobot cloud API returns wlBars as a 5-element bucket histogram —
 * confirmed from Amendment 8d (CR3 debug, June 2026). Each index represents
 * a signal-strength bucket; values are percentages summing to ~100.
 * e.g. [0, 35, 65, 0, 0] = all readings in buckets 1 and 2.
 *
 * Format detection:
 *   length === 5  → histogram (pass through — values already 0–100%)
 *   length !== 5  → legacy scalar time-series (0–4 bar readings → ×25 to %)
 *
 * The legacy path is retained for backward compatibility with any pre-v2.2
 * integration records that stored raw 0–4 scalar values.
 */
export function normalisedWifiPct(values: number[]): number[] {
  if (!values || values.length === 0) return [];
  // 5-element histogram: values are already bucket percentages — pass through unchanged.
  // Minimum signal = index of first non-zero bucket × 25 (e.g. [0,35,65,0,0] → floor=25%).
  if (values.length === 5) return values;
  // Legacy time-series of 0–4 bar scalars: scale to percentage.
  const needsScale = values.every(v => v <= 4);
  return needsScale ? values.map(v => v * 25) : values;
}

/**
 * Convert dock-relative mm coordinates to image-relative percentage positions.
 * Used to place hazard pins on the coverage map image.
 *
 * @param xMm   Dock-relative x in mm (pose space)
 * @param yMm   Dock-relative y in mm (pose space)
 * @param xMin  Image spatial extent x_min_mm (from image entity attribute)
 * @param xMax  Image spatial extent x_max_mm
 * @param yMin  Image spatial extent y_min_mm
 * @param yMax  Image spatial extent y_max_mm
 * @returns     { left, top } CSS percentage strings for absolute positioning
 *
 * Note: y-axis is inverted — y increases downward in CSS but upward in pose space.
 */
export function mmToImagePct(
  xMm: number, yMm: number,
  xMin: number, xMax: number, yMin: number, yMax: number,
): { left: string; top: string } {
  const left = ((xMm - xMin) / (xMax - xMin) * 100).toFixed(1) + '%';
  const top  = ((yMax - yMm) / (yMax - yMin) * 100).toFixed(1) + '%'; // y-axis inverted
  return { left, top };
}

/**
 * Normalise a single wlBars sensor state value to percentage.
 * Same heuristic: ≤ 4 → multiply by 25; already % → pass through.
 */
export function normalisedWifiFloor(raw: number): number {
  return raw <= 4 ? raw * 25 : raw;
}

export function renderSparkline(readings: number[], minVal: number): string {
  if (!readings || readings.length === 0) return '';

  // Sample down to at most 7 bars; never pad with zeros (would look like bad readings)
  const N = 7;
  const bars: number[] = readings.length <= N
    ? [...readings]
    : Array.from({ length: N }, (_, i) =>
        readings[Math.round((i / (N - 1)) * (readings.length - 1))]);

  const maxVal = Math.max(...bars, 1);
  const count  = bars.length;
  const barW   = 6;
  const gap    = 2;
  const W      = count * barW + (count - 1) * gap;
  const H      = 16;

  // Colour by minimum signal: green ≥ 60, amber 40–59, red < 40
  const colour = minVal >= 60 ? 'var(--rpc-green)' : minVal >= 40 ? 'var(--rpc-amber)' : 'var(--rpc-red)';

  let rects = '';
  for (let i = 0; i < count; i++) {
    const x    = i * (barW + gap);
    const barH = Math.max(2, Math.round((bars[i] / maxVal) * H));
    const y    = H - barH;
    rects += `<rect x="${x}" y="${y}" width="${barW}" height="${barH}" fill="${colour}" rx="1"/>`;
  }

  return `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style="display:inline-block;vertical-align:middle;flex-shrink:0">${rects}</svg>`;
}

export function renderSkeletonHeatmap(numWeeks = 4): string {
  const W = svgW();
  const H = svgH(numWeeks);
  const dayLabels = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

  let svg = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">`;
  svg += `<style>@keyframes rpc-pulse{0%,100%{opacity:.35}50%{opacity:.7}}.rpc-skel{animation:rpc-pulse 1.5s ease-in-out infinite}</style>`;

  for (let d = 0; d < 7; d++) {
    const x = LABEL_COL + d * STEP + CELL / 2;
    svg += `<text x="${x}" y="13" text-anchor="middle" font-size="9" fill="var(--secondary-text-color,#9ca3af)" font-family="inherit">${dayLabels[d]}</text>`;
  }

  for (let row = 0; row < numWeeks; row++) {
    for (let col = 0; col < 7; col++) {
      const x = LABEL_COL + col * STEP;
      const y = HEADER_H + row * STEP;
      svg += `<rect x="${x}" y="${y}" width="${CELL}" height="${CELL}" fill="var(--rpc-grey-light, #e5e7eb)" rx="3" class="rpc-skel" style="animation-delay:${(row * 7 + col) * 30}ms"/>`;
    }
  }

  svg += `</svg>`;
  return svg;
}
