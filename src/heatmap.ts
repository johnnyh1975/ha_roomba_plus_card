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
//   label_col + 7 × cellSize + 6 × cellGap = 18 + 7×16 + 6×2 = 18+112+12 = 142px
const CELL      = 16;   // px — visible cell square
const CELL_GAP  = 2;    // px — gap between cells
const LABEL_COL = 18;   // px — left column reserved for day labels
const HEADER_H  = 16;   // px — height of the day-header row
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

export function renderHeatmap(summaries: DaySummary[], days: number, _areaUnit: 'auto' | 'sqft' | 'm2', locale = 'en-US'): string {
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

  // Day column headers — compact, right-aligned into each column
  for (let d = 0; d < 7; d++) {
    const x = LABEL_COL + d * STEP + CELL / 2;
    svg += `<text x="${x}" y="11" text-anchor="middle" font-size="8" fill="var(--secondary-text-color, #9ca3af)" font-family="inherit">${dayLabels[d]}</text>`;
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

    svg += `<g role="gridcell" aria-label="${label}" data-date="${isoDate(cell.date)}" data-result="${result}" data-total="${total}" style="cursor:pointer">`;
    // Invisible touch target (slightly larger than cell)
    svg += `<rect x="${x - 1}" y="${y - 1}" width="${CELL + 2}" height="${CELL + 2}" fill="transparent" rx="3"/>`;
    // Visible cell
    svg += `<rect x="${x}" y="${y}" width="${CELL}" height="${CELL}" fill="${colour}" rx="3"/>`;
    // Multi-mission dot indicators (up to 3 dots, bottom edge)
    if (total > 1) {
      const dots = Math.min(total, 3);
      for (let i = 0; i < dots; i++) {
        const dx = x + CELL - 3 - i * 4;
        const dy = y + CELL - 2.5;
        svg += `<circle cx="${dx}" cy="${dy}" r="1.5" fill="rgba(255,255,255,0.75)"/>`;
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
 * The iRobot cloud API returns wifi signal as wlBars: a 0–4 integer (like phone
 * signal bars). The integration stores this raw in wifi_signal and in the
 * recent_wifi_floor sensor (declared as PERCENTAGE but returning 0–4 — integration
 * bug). We detect the scale by checking whether any value exceeds 4; if not, we
 * multiply by 25 (0→0%, 1→25%, 2→50%, 3→75%, 4→100%).
 *
 * When the integration bug is eventually fixed and the values are already
 * percentages (any value > 4), we pass them through unchanged.
 */
export function normalisedWifiPct(values: number[]): number[] {
  if (!values || values.length === 0) return [];
  const needsScale = values.every(v => v <= 4);
  return needsScale ? values.map(v => v * 25) : values;
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
    svg += `<text x="${x}" y="11" text-anchor="middle" font-size="8" fill="var(--secondary-text-color,#9ca3af)" font-family="inherit">${dayLabels[d]}</text>`;
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
