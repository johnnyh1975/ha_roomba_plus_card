import { HomeAssistant, CardConfig, RobotCapabilities, HouseholdSummary } from '../types.js';
import { esc } from '../utils.js';

/**
 * F17 — Household summary panel (integration ≥ v2.3 F10b).
 * Renders when config.entities has 2+ robots AND data is non-null.
 * Fetch is skipped entirely on single-robot configs — data will always be null there.
 */
export function renderHouseholdZone(
  _hass: HomeAssistant,
  config: CardConfig,
  _caps: RobotCapabilities,
  data: HouseholdSummary | null,
  isMetric: boolean,
): string {
  if ((config.entities?.length ?? 0) < 2 || !data) return '';

  const unit       = (config as Record<string, unknown>).area_unit as string ?? 'auto';
  const useMetric  = unit === 'm2' || (unit === 'auto' && isMetric);

  function fmtArea(sqft: number | null): string {
    if (sqft == null) return '';
    return useMetric
      ? `${Math.round(sqft * 0.0929)} m²`
      : `${Math.round(sqft)} ft²`;
  }

  function pctCls(pct: number): string {
    return pct >= 90 ? 'rpc-cov-green' : pct >= 70 ? 'rpc-cov-amber' : 'rpc-cov-red';
  }

  // Per-robot rows
  const robotRows = data.robots.map(r => {
    const pct   = Math.round(r.completion_pct);
    const area  = fmtArea(r.area_sqft);
    const meta  = [
      `${r.missions} mission${r.missions !== 1 ? 's' : ''}`,
      area,
    ].filter(Boolean).join(' · ');
    return `
      <div class="rpc-household-robot">
        <span class="rpc-household-name">${esc(r.name)}</span>
        <span class="${pctCls(pct)}">${pct}%</span>
        <span class="rpc-household-meta">${meta}</span>
      </div>`;
  }).join('');

  // Floor grouping — only when multiple floors present
  let floorHtml = '';
  if (data.floors && data.floors.length > 1) {
    const rows = data.floors.map(f => {
      const area = fmtArea(f.area_sqft);
      const meta = [
        `${f.missions} mission${f.missions !== 1 ? 's' : ''}`,
        area,
      ].filter(Boolean).join(' · ');
      return `
        <div class="rpc-household-floor">
          <span class="rpc-household-floor-label">${esc(f.label)}</span>
          <span class="rpc-household-meta">${meta}</span>
        </div>`;
    }).join('');
    floorHtml = `<div class="rpc-household-floors">${rows}</div>`;
  }

  // Combined total row
  const total    = data.total;
  const totalPct = Math.round(total.completion_pct);
  const totalArea = fmtArea(total.area_sqft);
  const totalMeta = [
    `${total.missions} mission${total.missions !== 1 ? 's' : ''}`,
    totalArea,
  ].filter(Boolean).join(' · ');

  return `
    <div class="rpc-zone rpc-zone7">
      <div class="rpc-zone-header">HOUSEHOLD — LAST ${data.period_days} DAYS</div>
      ${robotRows}
      ${floorHtml}
      <div class="rpc-household-divider"></div>
      <div class="rpc-household-robot rpc-household-combined">
        <span class="rpc-household-name">Combined</span>
        <span class="${pctCls(totalPct)}">${totalPct}%</span>
        <span class="rpc-household-meta">${totalMeta}</span>
      </div>
    </div>`;
}
