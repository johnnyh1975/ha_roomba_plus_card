import { HomeAssistant, CardConfig, RobotCapabilities, HouseholdSummary, HouseholdRobotSummary } from '../types.js';
import { esc } from '../utils.js';
import { t, resolveLang } from '../i18n/index.js';

/**
 * v2.5.0 — Household view loading skeleton.
 *
 * Mirrors renderSkeletonHeatmap()'s pulse-animation approach (heatmap.ts) —
 * same pattern, different shape (a couple of placeholder robot rows rather
 * than a calendar grid), for the same reason: switching to "📊 Household
 * summary" previously showed only the "← Back" chip until the fetch
 * resolved, with a blank area below it in between. Two rows is a generic
 * placeholder count, not tied to the real number of configured robots
 * (unknown until the fetch actually completes).
 */
export function renderHouseholdSkeleton(hass: HomeAssistant): string {
  const lang = resolveLang(hass.language);
  const rows = [0, 1].map(i => `
    <div class="rpc-household-robot rpc-household-skel-row" style="animation-delay:${i * 150}ms">
      <span class="rpc-skel-bar rpc-skel-bar--name"></span>
      <span class="rpc-skel-bar rpc-skel-bar--pct"></span>
      <span class="rpc-skel-bar rpc-skel-bar--meta"></span>
    </div>`).join('');
  return `
    <div class="rpc-zone rpc-zone7">
      <div class="rpc-zone-header">${t(lang, 'household.zoneHeader')}</div>
      ${rows}
    </div>`;
}

/**
 * F17 — Household summary panel (integration ≥ v2.3 F10b).
 * Renders when config.entities has 2+ robots AND data is non-null.
 * Fetch is skipped entirely on single-robot configs — data will always be null there.
 */
export function renderHouseholdZone(
  hass: HomeAssistant,
  config: CardConfig,
  _caps: RobotCapabilities,
  data: HouseholdSummary | null,
  isMetric: boolean,
): string {
  if ((config.entities?.length ?? 0) < 2 || !data) return '';

  const lang = resolveLang(hass.language);
  const unit       = config.area_unit ?? 'auto';
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

  // v2.5.0 FLEET-1 (integration ≥ 3.4.3) — per-robot attention reasons.
  // needs_attention is computed server-side as (maintenance_due OR
  // health_trend === 'declining') — verified against source; the card
  // mirrors that same pair of reasons in the tooltip rather than
  // inventing its own framing. battery_capacity_retention_pct is NOT
  // part of that computation (informational only, no defined "low"
  // threshold at the card level), so it's shown as a plain meta number
  // below, not folded into the attention reasoning.
  function attentionReasons(r: HouseholdRobotSummary): string {
    const reasons: string[] = [];
    if (r.maintenance_due) reasons.push(t(lang, 'household.maintenanceDue'));
    if (r.health_trend === 'declining') reasons.push(t(lang, 'household.healthTrendDeclining'));
    return reasons.length > 0 ? reasons.join('; ') : t(lang, 'household.needsAttention');
  }

  // Per-robot rows
  const robotRows = data.robots.map(r => {
    const pct   = Math.round(r.completion_pct);
    const area  = fmtArea(r.area_sqft);
    const battery = typeof r.battery_capacity_retention_pct === 'number'
      ? t(lang, 'household.batteryPct', { pct: Math.round(r.battery_capacity_retention_pct) })
      : '';
    const meta  = [
      t(lang, 'household.missionCount', { count: r.missions }),
      area,
      battery,
    ].filter(Boolean).join(' · ');
    const attentionTip = r.needs_attention ? esc(attentionReasons(r)) : '';
    const attentionBadge = r.needs_attention
      ? ` <span class="rpc-household-attention" title="${attentionTip}" aria-label="${attentionTip}">⚠</span>`
      : '';
    return `
      <div class="rpc-household-robot">
        <span class="rpc-household-name">${esc(r.name)}${attentionBadge}</span>
        <span class="${pctCls(pct)}">${pct}%</span>
        <span class="rpc-household-meta">${meta}</span>
      </div>`;
  }).join('');

  // v2.5.0 FLEET-1 — fleet-wide summary line, same "calm real answer, not
  // hidden" philosophy already used for the Rooms-Overdue widget's "All
  // rooms in rhythm": zero robots needing attention is a genuine, positive
  // answer worth stating, not just an absence of a warning. Absent
  // entirely (not even the "healthy" line) on integrations < 3.4.3, since
  // fleet_health itself is absent there — degrades to the pre-v2.5.0
  // panel with no fleet-health line at all, per invariant 1.
  let fleetHealthHtml = '';
  if (data.fleet_health) {
    const { robot_count, robots_needing_attention } = data.fleet_health;
    fleetHealthHtml = robots_needing_attention.length === 0
      ? `<div class="rpc-household-fleet-health rpc-household-fleet-ok">${t(lang, 'household.allHealthy', { count: robot_count })}</div>`
      : `<div class="rpc-household-fleet-health rpc-household-fleet-warn">${t(lang, 'household.needAttentionList', { count: robots_needing_attention.length, total: robot_count, names: robots_needing_attention.map(esc).join(', ') })}</div>`;
  }

  // Floor grouping — only when multiple floors present
  let floorHtml = '';
  if (data.floors && data.floors.length > 1) {
    const rows = data.floors.map(f => {
      const area = fmtArea(f.area_sqft);
      const meta = [
        t(lang, 'household.missionCount', { count: f.missions }),
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
    t(lang, 'household.missionCount', { count: total.missions }),
    totalArea,
  ].filter(Boolean).join(' · ');

  return `
    <div class="rpc-zone rpc-zone7">
      <div class="rpc-zone-header">${t(lang, 'household.zoneHeaderWithDays', { days: data.period_days })}</div>
      ${fleetHealthHtml}
      ${robotRows}
      ${floorHtml}
      <div class="rpc-household-divider"></div>
      <div class="rpc-household-robot rpc-household-combined">
        <span class="rpc-household-name">${t(lang, 'household.combined')}</span>
        <span class="${pctCls(totalPct)}">${totalPct}%</span>
        <span class="rpc-household-meta">${totalMeta}</span>
      </div>
    </div>`;
}
