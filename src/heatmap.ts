import { DaySummary } from './types.js';

const COLOURS: Record<string, string> = {
  completed: '#2d9c4f',
  stuck:     '#d97706',
  error:     '#dc2626',
  cancelled: '#9ca3af',
  none:      '#e5e7eb',
};

function formatDate(date: Date, locale: string): string {
  return date.toLocaleDateString(locale, { month: 'short', day: 'numeric' });
}

/** Local-time ISO date (YYYY-MM-DD). Never use toISOString() — that's UTC and breaks for UTC+ users. */
function isoDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function renderHeatmap(summaries: DaySummary[], days: number, _areaUnit: 'auto' | 'sqft' | 'm2', locale = 'en-US'): string {
  const cellSize = 20;
  const cellGap = 3;
  const cellTouch = 24;
  const headerH = 18;
  const cellStep = cellSize + cellGap;

  // Build date map
  const byDate = new Map<string, DaySummary>();
  for (const s of summaries) byDate.set(s.date, s);

  // Build 4-week grid, oldest top-left, today bottom-right
  const today = new Date();
  const cells: { date: Date; summary: DaySummary | null; col: number; row: number }[] = [];

  // Find start: go back `days` days, then back to Monday of that week
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - (days - 1));
  const dow = (startDate.getDay() + 6) % 7; // Mon=0
  startDate.setDate(startDate.getDate() - dow);

  const numWeeks = Math.ceil((days + dow) / 7);

  for (let week = 0; week < numWeeks; week++) {
    for (let d = 0; d < 7; d++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + week * 7 + d);
      if (date > today) continue;
      const iso = isoDate(date);
      cells.push({
        date,
        summary: byDate.get(iso) ?? null,
        col: d,
        row: week,
      });
    }
  }

  const W = 7 * cellStep - cellGap;
  const H = headerH + numWeeks * cellStep - cellGap + 4;

  const dayLabels = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

  let svg = `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" role="grid" aria-label="Cleaning history heatmap">`;

  // Day headers
  for (let d = 0; d < 7; d++) {
    const x = d * cellStep + cellSize / 2;
    svg += `<text x="${x}" y="12" text-anchor="middle" font-size="9" fill="var(--rpc-text-secondary, #9ca3af)" font-family="inherit">${dayLabels[d]}</text>`;
  }

  // Cells
  for (const cell of cells) {
    const x = cell.col * cellStep;
    const y = headerH + cell.row * cellStep;
    const summary = cell.summary;
    const result = summary?.result ?? 'none';
    const colour = COLOURS[result] ?? COLOURS.none;
    const total = summary?.total ?? 0;

    let label = formatDate(cell.date, locale);
    if (total === 0) label += ': no missions';
    else if (total === 1) label += `: 1 mission, ${result}`;
    else label += `: ${total} missions, ${result}`;

    svg += `<g role="gridcell" aria-label="${label}" data-date="${isoDate(cell.date)}" data-result="${result}" data-total="${total}" style="cursor:pointer">`;
    // Invisible touch target
    svg += `<rect x="${x - 2}" y="${y - 2}" width="${cellTouch}" height="${cellTouch}" fill="transparent" rx="3"/>`;
    // Visible cell
    svg += `<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" fill="${colour}" rx="3"/>`;

    // Multi-mission dot indicators (up to 3 dots bottom-right)
    if (total > 1) {
      const dots = Math.min(total, 3);
      for (let i = 0; i < dots; i++) {
        const dx = x + cellSize - 4 - i * 5;
        const dy = y + cellSize - 3;
        svg += `<circle cx="${dx}" cy="${dy}" r="1.5" fill="rgba(255,255,255,0.8)"/>`;
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
 * @returns         Inline SVG string, 56×16px, colour-coded by floor signal.
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
  const cellSize = 20;
  const cellGap = 3;
  const headerH = 18;
  const cellStep = cellSize + cellGap;
  const W = 7 * cellStep - cellGap;
  const H = headerH + numWeeks * cellStep - cellGap + 4;
  const dayLabels = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

  let svg = `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">`;
  svg += `<style>@keyframes rpc-pulse{0%,100%{opacity:.4}50%{opacity:.8}}.rpc-skel{animation:rpc-pulse 1.5s ease-in-out infinite}</style>`;

  for (let d = 0; d < 7; d++) {
    const x = d * cellStep + cellSize / 2;
    svg += `<text x="${x}" y="12" text-anchor="middle" font-size="9" fill="var(--rpc-text-secondary,#9ca3af)" font-family="inherit">${dayLabels[d]}</text>`;
  }

  for (let row = 0; row < numWeeks; row++) {
    for (let col = 0; col < 7; col++) {
      const x = col * cellStep;
      const y = headerH + row * cellStep;
      svg += `<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" fill="#e5e7eb" rx="3" class="rpc-skel" style="animation-delay:${(row * 7 + col) * 30}ms"/>`;
    }
  }

  svg += `</svg>`;
  return svg;
}
