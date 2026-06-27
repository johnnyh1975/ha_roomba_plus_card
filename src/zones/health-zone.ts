import { HomeAssistant, CardConfig, RobotCapabilities } from '../types.js';
import { esc, timeSince } from '../utils.js';

interface Bar {
  key: string;
  label: string;
  sensorId: string;
  thresholdAttr: string | null;
  type: 'consumable' | 'tank' | 'battery' | 'cleanbase';
  wearSensorId?: string;
  resetService?: string;
  lastReplacedId?: string;
  /** Display unit for remaining value in popover. Defaults to 'h'. */
  unit?: string;
  /** When set, use this percentage directly — bypasses entity lookup */
  rawPct?: number;
}

export interface HealthZoneState {
  openPopover: string | null;
  resetting: string | null;
  resetError: string | null;
  /** True once the user has seen the wear-arrow legend — shown only once per session */
  legendShown: boolean;
  /** v2.0 C1-HEALTH: component bars collapsed by default, user can expand.
   *  Session-only — resets between sessions, not persisted. */
  healthDetailsExpanded: boolean;
  /** v2.0 C2-MAINT: which maintenance calendar row's info popover is open. */
  openMaintPopover: string | null;
}

function pct(remaining: number, threshold: number): number {
  return Math.min(100, Math.max(0, Math.round((remaining / threshold) * 100)));
}

function barColour(p: number, type: string): string {
  if (type === 'battery') {
    if (p > 20) return 'var(--rpc-green)';
    if (p > 10) return 'var(--rpc-amber)';
    return 'var(--rpc-red)';
  }
  if (type === 'tank') {
    if (p > 40) return 'var(--rpc-green)';
    if (p > 20) return 'var(--rpc-amber)';
    return 'var(--rpc-red)';
  }
  // consumable
  if (p > 50) return 'var(--rpc-green)';
  if (p > 10) return 'var(--rpc-amber)';
  return 'var(--rpc-red)';
}

function trendArrow(wearRate: number, threshold: number): string {
  const baseline = threshold / 90;
  if (!baseline) return '';
  const ratio = wearRate / baseline;
  if (ratio > 1.2) return '↑';
  if (ratio < 0.8) return '↓';
  return '→';
}


/** Convert Clean Base sensor state to "~N uses remaining" display */
function cleanBaseDisplay(state: string): string {
  const n = parseInt(state, 10);
  if (!isNaN(n) && n >= 0) return `~${n} use${n !== 1 ? 's' : ''} remaining`;
  // Text states from integration (Full, Empty, etc.)
  if (state === 'Empty') return 'Bag full — replace soon';
  if (state === 'Full')  return 'Bag has capacity';
  return esc(state);
}

// ── v2.0 C1-HEALTH — robot health score ──────────────────────────────────────
//
// sensor.*_robot_health_score (L8). Entity key corrected against v2.8.6
// source — earlier plan drafts referenced the wrong key (robot_health).
// Distinct from the unrelated sensor.*_integration_health (INTEG-HEALTH),
// which has its own internal healthy/degraded/critical band system used for
// a different HA event; robot_health_score has NO native band of its own —
// the colour triage below is a card-side design decision only.
//
// Calibration state pattern: native_value returns None (renders as HA
// `unknown`) when fewer than 20 missions exist in the last 30 days, or
// fewer than 3 of the 5 component signals are available. This is the
// canonical "Calibrating…" placeholder pattern for the card — never zero,
// never an error state.
function healthScoreColour(score: number): string {
  if (score >= 80) return 'var(--rpc-green)';
  if (score >= 60) return 'var(--rpc-amber)';
  return 'var(--rpc-red)';
}

function healthScoreBand(score: number): string {
  if (score >= 80) return 'GOOD';
  if (score >= 60) return 'FAIR';
  return 'NEEDS ATTENTION';
}

function renderHealthScore(
  hass: HomeAssistant,
  caps: RobotCapabilities,
  n: string,
  expanded: boolean,
): string {
  if (!caps.hasRobotHealthScore) return '';

  const entity = hass.states[`sensor.${n}_robot_health_score`];
  if (!entity) return '';

  const isCalibrating = entity.state === 'unknown' || entity.state === 'unavailable';
  if (isCalibrating) {
    return `
      <div class="rpc-health-score rpc-health-score--calibrating">
        <span class="rpc-health-score-label">ROBOT HEALTH</span>
        <span class="rpc-health-score-calibrating">Calibrating… (needs more mission history)</span>
      </div>
      <button class="rpc-health-details-toggle" data-health-details-toggle aria-expanded="${expanded}">
        ${expanded ? 'Hide details ▲' : 'Show details ▼'}
      </button>
    `;
  }

  const score = Math.round(parseFloat(entity.state));
  if (isNaN(score)) return '';
  const colour = healthScoreColour(score);
  const band   = healthScoreBand(score);

  return `
    <div class="rpc-health-score" aria-label="Robot health ${score} out of 100, ${band}">
      <span class="rpc-health-score-label">ROBOT HEALTH</span>
      <span class="rpc-health-score-value" style="color:${colour}">${score}</span>
      <span class="rpc-health-score-band" style="color:${colour}">● ${band}</span>
    </div>
    <button class="rpc-health-details-toggle" data-health-details-toggle aria-expanded="${expanded}">
      ${expanded ? 'Hide details ▲' : 'Show details ▼'}
    </button>
  `;
}

// ── v2.0 C5-ANOMALY — mission anomaly banner ─────────────────────────────────
//
// CONFIRMED INTEGRATION GAP (v2.8.6 source audit): last_mission_result has
// NO extra_state_attributes at all — neither `anomalous` nor
// `consecutive_anomalous` is exposed on any sensor. MissionStore's
// consecutive_anomalous property exists only internally, consumed
// exclusively by robot_health_score's own Signal 4 computation. This
// feature is BLOCKED until the integration adds these attributes (L3-FIX,
// flagged for integration v3.0). The function below is written against
// the planned shape so it activates automatically once the attributes
// ship — it does not need to be revisited, only the integration does.
function renderAnomalyBanner(hass: HomeAssistant, n: string): string {
  const entity = hass.states[`sensor.${n}_last_mission_result`];
  const consecutive = entity?.attributes?.consecutive_anomalous;
  if (typeof consecutive !== 'number' || consecutive < 2) return '';

  return `
    <div class="rpc-anomaly-banner" role="alert">
      ⚠ Last ${consecutive} missions were anomalous — check brushes and filter
    </div>
  `;
}

// ── v2.0 C2-MAINT — maintenance calendar ─────────────────────────────────────
//
// Three TIMESTAMP sensors from IA74-MAINT (integration v2.7.0).
// "Never recorded" when a sensor is unavailable (no reset_* service call
// yet) — distinct from the entity being entirely absent (which is handled
// by hasMaintenanceCalendar gating the whole section).
function renderMaintenanceCalendar(
  hass: HomeAssistant,
  caps: RobotCapabilities,
  n: string,
  state: HealthZoneState,
): string {
  if (!caps.hasMaintenanceCalendar) return '';

  const rows: { key: string; label: string; entityId: string; service: string }[] = [
    { key: 'wheel',   label: 'Wheels',   entityId: `sensor.${n}_wheel_last_cleaned`,   service: 'roomba_plus.reset_wheel_cleaning' },
    { key: 'contact', label: 'Contacts', entityId: `sensor.${n}_contact_last_cleaned`, service: 'roomba_plus.reset_contact_cleaning' },
    { key: 'bin',     label: 'Bin',      entityId: `sensor.${n}_bin_last_cleaned`,     service: 'roomba_plus.reset_bin_cleaning' },
  ].filter(r => !!hass.states[r.entityId]);

  if (rows.length === 0) return '';

  const rowsHtml = rows.map(r => {
    const entity = hass.states[r.entityId];
    const isOpen = state.openMaintPopover === r.key;
    const recorded = entity.state !== 'unavailable' && entity.state !== 'unknown';
    const displayVal = recorded
      ? `Cleaned ${timeSince(entity.state, hass.language)}`
      : 'Never recorded';

    return `
      <div class="rpc-maint-row" data-maint="${r.key}" role="button" aria-expanded="${isOpen}" tabindex="0"
           aria-label="${r.label} — ${displayVal}">
        <span class="rpc-maint-label">${r.label}</span>
        <span class="rpc-maint-val">${displayVal}</span>
      </div>
      ${isOpen ? `
        <div class="rpc-popover">
          <div class="rpc-popover-header">
            <span>${r.label}</span>
            <button class="rpc-popover-close" data-close-maint="${r.key}" aria-label="Close">×</button>
          </div>
          <div class="rpc-popover-divider"></div>
          <div class="rpc-popover-sub">Reset via Developer Tools → Services:</div>
          <div class="rpc-maint-service">${r.service}</div>
        </div>
      ` : ''}
    `;
  }).join('');

  return `
    <div class="rpc-maint-divider"></div>
    <div class="rpc-maint-header">Other maintenance</div>
    ${rowsHtml}
  `;
}

export function renderHealthZone(
  hass: HomeAssistant,
  config: CardConfig,
  caps: RobotCapabilities,
  robotName: string,
  state: HealthZoneState
): string {
  if (config.show_health === false) return '';

  const n = robotName;
  const bars: Bar[] = [];

  // Filter — all robots
  if (hass.states[`sensor.${n}_filter_remaining_hours`]) {
    bars.push({
      key: 'filter', label: 'Filter',
      sensorId:     `sensor.${n}_filter_remaining_hours`,
      thresholdAttr: 'threshold_hours',
      type: 'consumable',
      wearSensorId:  caps.hasWearRate ? `sensor.${n}_filter_wear_rate` : undefined,
      resetService:  'reset_filter',
      lastReplacedId:`sensor.${n}_filter_last_replaced`,
    });
  }

  // Brush — vacuums only
  if (caps.hasBrush && hass.states[`sensor.${n}_brush_remaining_hours`]) {
    bars.push({
      key: 'brush', label: 'Brush',
      sensorId:     `sensor.${n}_brush_remaining_hours`,
      thresholdAttr: 'threshold_hours',
      type: 'consumable',
      wearSensorId:  caps.hasWearRate ? `sensor.${n}_brush_wear_rate` : undefined,
      resetService:  'reset_brush',
      lastReplacedId:`sensor.${n}_brush_last_replaced`,
    });
  }

  // Pad — Braava only
  if (caps.hasPad && hass.states[`sensor.${n}_pad_days_until_due`]) {
    bars.push({
      key: 'pad', label: 'Pad',
      sensorId:      `sensor.${n}_pad_days_until_due`,
      thresholdAttr: 'threshold_days',
      type: 'consumable',
      unit: 'd',
      wearSensorId:  caps.hasWearRate ? `sensor.${n}_pad_wear_rate` : undefined,
      resetService:  'reset_pad',
      lastReplacedId:`sensor.${n}_pad_last_replaced`,
    });
  }

  // Tank — Braava only
  if (caps.hasWater && hass.states[`sensor.${n}_mop_tank_level`]) {
    bars.push({
      key: 'tank', label: 'Tank',
      sensorId:     `sensor.${n}_mop_tank_level`,
      thresholdAttr: null,
      type: 'tank',
    });
  }

  // Battery — dedicated sensor preferred, vacuum attribute fallback
  const batSensorId =
    hass.states[`sensor.${n}_battery`] ? `sensor.${n}_battery` : null;
  const vacBatPct = !batSensorId
    ? (hass.states[`vacuum.${n}`]?.attributes?.battery_level as number | undefined)
    : undefined;

  if (batSensorId || vacBatPct !== undefined) {
    bars.push({
      key: 'battery', label: 'Battery',
      sensorId:     batSensorId ?? '',
      thresholdAttr: null,
      type: 'battery',
      rawPct: vacBatPct,
    });
  }

  // Clean Base — s9+ only
  if (caps.hasCleanBase && hass.states[`sensor.${n}_clean_base_status`]) {
    bars.push({
      key: 'cleanbase', label: 'Clean Base',
      sensorId:     `sensor.${n}_clean_base_status`,
      thresholdAttr: null,
      type: 'cleanbase',
    });
  }

  // v2.0: do NOT early-return when bars are empty — the health score (C1)
  // and maintenance calendar (C2) are independent of the consumable bars
  // and must still render if either capability is present, even on a robot
  // with zero filter/brush/battery sensors detected.
  // v2.0: compute anomaly banner early so its presence is accounted for in
  // the early-return guard below — it's independent of bars/score/maintenance.
  const anomalyHtml = renderAnomalyBanner(hass, n);

  // v2.0: do NOT early-return when bars are empty — the health score (C1),
  // maintenance calendar (C2), and anomaly banner (C5) are independent of
  // the consumable bars and must still render if any is present, even on a
  // robot with zero filter/brush/battery sensors detected.
  if (bars.length === 0 && !caps.hasRobotHealthScore && !caps.hasMaintenanceCalendar && !anomalyHtml) return '';

  const barsHtml = bars.map(bar => renderBar(bar, hass, n, state)).join('');

  // F6a — Battery capacity retention bar (v2.1+, no reset button — it's a health indicator)
  // Separated from the consumable/battery bars above by a thin divider.
  // Separator is only emitted if at least one of the two new bars actually renders.
  let retentionBarHtml = '';
  if (caps.hasBatteryRetention) {
    const retEntity = hass.states[`sensor.${n}_battery_capacity_retention`];
    if (retEntity && retEntity.state !== 'unavailable' && retEntity.state !== 'unknown') {
      const retPct = Math.round(parseFloat(retEntity.state));
      if (!isNaN(retPct)) {
        const colour = retPct > 85 ? 'var(--rpc-green)' : retPct > 70 ? 'var(--rpc-amber)' : 'var(--rpc-red)';
        const cyclesEntity = hass.states[`sensor.${n}_battery_cycles`];
        const cyclesVal    = cyclesEntity ? parseInt(cyclesEntity.state, 10) : NaN;
        const cycleText    = !isNaN(cyclesVal) ? `${cyclesVal} charge cycle${cyclesVal !== 1 ? 's' : ''}` : '';

        let eolHtml = '';
        if (caps.hasBatteryEol) {
          const eolEntity = hass.states[`sensor.${n}_estimated_battery_eol`];
          if (eolEntity && eolEntity.state !== 'unavailable' && eolEntity.state !== 'unknown') {
            const eolDays = parseInt(eolEntity.state, 10);
            if (!isNaN(eolDays)) {
              eolHtml = eolDays > 0
                ? `<div class="rpc-retention-eol">Battery life: ~${eolDays} days remaining</div>`
                : `<div class="rpc-retention-eol rpc-retention-eol--warn">Consider replacing — battery at end of life</div>`;
            }
          }
        }

        const isOpen = state.openPopover === 'retention';
        const popover = isOpen ? `
          <div class="rpc-popover">
            <div class="rpc-popover-header">
              <span>Battery Health</span>
              <button class="rpc-popover-close" data-close="retention" aria-label="Close">×</button>
            </div>
            <div class="rpc-popover-divider"></div>
            <div class="rpc-popover-body">
              <div>${retPct}% of original capacity</div>
              ${cycleText ? `<div class="rpc-popover-sub">${cycleText}</div>` : ''}
              ${eolHtml}
            </div>
          </div>` : '';

        retentionBarHtml = `
          <div class="rpc-bar-row" data-bar="retention" role="button" aria-expanded="${isOpen}" tabindex="0"
               aria-label="Bat. Health — ${retPct}%">
            <span class="rpc-bar-label">Bat. Health</span>
            <span class="rpc-bar-track"><span class="rpc-bar-fill" style="width:${retPct}%;background:${colour}"></span></span>
            <span class="rpc-bar-pct" style="color:${colour}">${retPct}%</span>
          </div>
          ${popover}`;
      }
    }
  }

  // F6a — Coverage percentage bar (v2.1+)
  let coverageBarHtml = '';
  if (caps.hasCoveragePct) {
    const covEntity = hass.states[`sensor.${n}_recent_coverage_pct`];
    if (covEntity && covEntity.state !== 'unavailable' && covEntity.state !== 'unknown') {
      const missionCountEntity = hass.states[`sensor.${n}_missions_last_30d`];
      const missionCount       = missionCountEntity ? parseInt(missionCountEntity.state, 10) : NaN;
      if (isNaN(missionCount) || missionCount < 10) {
        coverageBarHtml = `
          <div class="rpc-bar-row rpc-bar-row--static">
            <span class="rpc-bar-label">Coverage</span>
            <span class="rpc-coverage-building">Building history…</span>
          </div>`;
      } else {
        const covPct = Math.min(100, Math.round(parseFloat(covEntity.state)));
        if (!isNaN(covPct)) {
          const colour  = covPct >= 85 ? 'var(--rpc-green)' : covPct >= 65 ? 'var(--rpc-amber)' : 'var(--rpc-red)';
          const isOpen  = state.openPopover === 'coverage';
          const missionText = !isNaN(missionCount)
            ? `Based on ${missionCount} mission${missionCount !== 1 ? 's' : ''} in the last 30 days.`
            : '';
          const popover = isOpen ? `
            <div class="rpc-popover">
              <div class="rpc-popover-header">
                <span>Floor Coverage</span>
                <button class="rpc-popover-close" data-close="coverage" aria-label="Close">×</button>
              </div>
              <div class="rpc-popover-divider"></div>
              <div class="rpc-popover-body">
                <div>${covPct}% of floor area covered on the last mission.</div>
                ${missionText ? `<div class="rpc-popover-sub">${missionText}</div>` : ''}
                <div class="rpc-popover-sub">Low coverage may indicate obstacles, map drift, or a missed room.</div>
              </div>
            </div>` : '';
          coverageBarHtml = `
            <div class="rpc-bar-row" data-bar="coverage" role="button" aria-expanded="${isOpen}" tabindex="0"
                 aria-label="Coverage ${covPct}% last mission">
              <span class="rpc-bar-label">Coverage</span>
              <span class="rpc-bar-track"><span class="rpc-bar-fill" style="width:${covPct}%;background:${colour}"></span></span>
              <span class="rpc-bar-pct" style="color:${colour}">${covPct}%</span>
              <span class="rpc-bar-hours">last mission</span>
            </div>
            ${popover}`;
        }
      }
    }
  }

  // Only emit the separator when at least one new bar rendered
  const retentionHtml = (retentionBarHtml || coverageBarHtml)
    ? `<div class="rpc-health-battery-sep"></div>${retentionBarHtml}${coverageBarHtml}`
    : '';

  // F14 — Lifetime energy consumption (integration v2.4 F12e)
  let energyHtml = '';
  if (caps.hasEnergyConsumption) {
    const energyEntity = hass.states[`sensor.${n}_total_energy_consumed`];
    if (energyEntity && energyEntity.state !== 'unavailable' && energyEntity.state !== 'unknown') {
      const kwh = parseFloat(energyEntity.state);
      if (!isNaN(kwh)) {
        const cyclesEntity = hass.states[`sensor.${n}_battery_cycles`];
        const cyclesVal    = cyclesEntity ? parseInt(cyclesEntity.state, 10) : NaN;
        const isOpen = state.openPopover === 'energy';
        const popover = isOpen ? `
          <div class="rpc-popover">
            <div class="rpc-popover-header">
              <span>Energy</span>
              <button class="rpc-popover-close" data-close="energy" aria-label="Close">×</button>
            </div>
            <div class="rpc-popover-divider"></div>
            <div class="rpc-popover-body">
              <div>~${kwh.toFixed(1)} kWh used${!isNaN(cyclesVal) ? ` over ${cyclesVal} charge cycles` : ''}</div>
              <div class="rpc-popover-sub">Estimated from battery capacity and cycle count.</div>
              <div class="rpc-popover-sub">Connect to the HA Energy dashboard for home-wide monitoring.</div>
            </div>
          </div>` : '';
        energyHtml = `
          <div class="rpc-bar-row" data-bar="energy" role="button" aria-expanded="${isOpen}" tabindex="0"
               aria-label="Lifetime energy ~${kwh.toFixed(1)} kWh">
            <span class="rpc-bar-label">Energy</span>
            <span class="rpc-energy-val">~${kwh.toFixed(1)} kWh lifetime</span>
          </div>
          ${popover}`;
      }
    }
  }

  // Wave A4 — Braava pad type + intensity row
  let mopConfigHtml = '';
  if (caps.isMop) {
    const padType   = hass.states[`sensor.${n}_mop_pad`];
    const mopBehav  = caps.hasMopBehavior ? hass.states[`sensor.${n}_mop_behavior`] : null;
    const parts: string[] = [];
    if (padType  && padType.state  !== 'unknown' && padType.state  !== 'unavailable') parts.push(esc(padType.state));
    if (mopBehav && mopBehav.state !== 'unknown' && mopBehav.state !== 'unavailable') parts.push(`${esc(mopBehav.state)} intensity`);
    if (parts.length) {
      mopConfigHtml = `
        <div class="rpc-health-divider"></div>
        <div class="rpc-mop-config">${parts.join(' · ')}</div>
      `;
    }
  }

  return `
    <div class="rpc-zone rpc-zone3">
      <div class="rpc-zone-header">HEALTH</div>
      ${anomalyHtml}
      ${renderHealthScore(hass, caps, n, state.healthDetailsExpanded)}
      ${caps.hasRobotHealthScore && !state.healthDetailsExpanded ? '' : `
        ${barsHtml}
        ${retentionHtml}
        ${energyHtml}
        ${mopConfigHtml}
      `}
      ${renderMaintenanceCalendar(hass, caps, n, state)}
    </div>
  `;
}

function renderBar(bar: Bar, hass: HomeAssistant, _n: string, state: HealthZoneState): string {
  const isOpen = state.openPopover === bar.key;

  // Clean Base — text-only row
  if (bar.type === 'cleanbase') {
    const entity = hass.states[bar.sensorId];
    if (!entity) return '';
    return `
      <div class="rpc-bar-row" data-bar="${bar.key}" role="button" aria-expanded="${isOpen}" tabindex="0"
           aria-label="${bar.label}">
        <span class="rpc-bar-label">${bar.label}</span>
        <span class="rpc-bar-cleanbase-state">${cleanBaseDisplay(entity.state)}</span>
      </div>
      ${isOpen ? renderCleanBasePopover(bar.label, entity.state) : ''}
    `;
  }

  // Determine percentage
  let barPct   = 0;
  let displayVal  = '';
  let displayRight = '';
  let threshold: number | null = null;

  if (bar.rawPct !== undefined) {
    // Battery from vacuum attribute
    barPct     = Math.min(100, Math.max(0, bar.rawPct));
    displayVal = `${Math.round(barPct)}%`;
  } else {
    const entity = hass.states[bar.sensorId];
    if (!entity) return '';
    const raw = parseFloat(entity.state);
    if (isNaN(raw)) return '';

    if (bar.type === 'tank' || bar.type === 'battery') {
      barPct     = Math.min(100, Math.max(0, raw));
      displayVal = `${Math.round(barPct)}%`;
    } else {
      // consumable — needs threshold
      threshold  = bar.thresholdAttr ? (entity.attributes[bar.thresholdAttr] as number) : null;
      if (!threshold) return '';
      barPct       = pct(raw, threshold);
      displayVal   = `${barPct}%`;
      displayRight = `${Math.round(raw)}h`;
    }
  }

  const colour = barColour(barPct, bar.type);

  let arrow = '';
  if (bar.wearSensorId && threshold) {
    const wearEntity = hass.states[bar.wearSensorId];
    if (wearEntity && wearEntity.state !== 'unknown' && wearEntity.state !== 'unavailable') {
      arrow = trendArrow(parseFloat(wearEntity.state), threshold);
    }
  }

  // For the popover, we need an entity-like object regardless of source.
  // When rawPct is used (vacuum attribute fallback), synthesise a minimal state object.
  const entity = bar.rawPct !== undefined
    ? { state: String(Math.round(bar.rawPct)), attributes: {} as Record<string, unknown> }
    : hass.states[bar.sensorId];

  return `
    <div class="rpc-bar-row" data-bar="${bar.key}" role="button" aria-expanded="${isOpen}" tabindex="0"
         aria-label="${bar.label} — ${displayVal}">
      <span class="rpc-bar-label">${bar.label}</span>
      <div class="rpc-bar-track">
        <div class="rpc-bar-fill" style="width:${barPct}%;background:${colour}"></div>
      </div>
      <span class="rpc-bar-pct" style="color:${colour}">${displayVal}</span>
      ${displayRight ? `<span class="rpc-bar-hours">${displayRight}</span>` : ''}
      ${arrow ? `<span class="rpc-bar-arrow" style="color:${colour}">${arrow}</span>` : ''}
    </div>
    ${isOpen && entity ? renderConsumablePopover(bar, entity, threshold, hass, state) : ''}
  `;
}

function renderConsumablePopover(
  bar: Bar,
  entity: { state: string; attributes: Record<string, unknown> },
  threshold: number | null,
  hass: HomeAssistant,
  state: HealthZoneState
): string {
  const remaining = parseFloat(entity.state);
  const barPct    = threshold ? pct(remaining, threshold) : Math.min(100, Math.max(0, remaining));
  const colour    = barColour(barPct, bar.type);
  const isResetting = state.resetting === bar.key;

  const lastReplacedEntity = bar.lastReplacedId ? hass.states[bar.lastReplacedId] : null;
  let lastReplacedHtml = '';
  if (lastReplacedEntity
      && lastReplacedEntity.state !== 'unavailable'
      && lastReplacedEntity.state !== 'unknown') {
    const d = new Date(lastReplacedEntity.state);
    lastReplacedHtml = `
      <div class="rpc-popover-row">
        <span>Last replaced</span>
        <span>${d.toLocaleDateString(hass.language)} (${timeSince(lastReplacedEntity.state, hass.language)})</span>
      </div>`;
  }

  // Wear legend — shown once per session in the first popover that has a wear arrow
  let wearLegendHtml = '';
  if (bar.wearSensorId && !state.legendShown) {
    const wearEntity = hass.states[bar.wearSensorId];
    if (wearEntity && wearEntity.state !== 'unknown' && wearEntity.state !== 'unavailable') {
      wearLegendHtml = `
        <div class="rpc-wear-legend" data-wear-legend>
          <span class="rpc-wear-legend-title">Wear trend</span>
          <span>↑ wearing faster than normal</span>
          <span>→ wearing at normal rate</span>
          <span>↓ wearing slower than normal</span>
        </div>`;
    }
  }

  const spinnerSvg = `<svg class="rpc-spinner" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="3" stroke-dasharray="31 63"/></svg>`;

  return `
    <div class="rpc-popover">
      <div class="rpc-popover-header">
        <span>${esc(bar.label)}</span>
        <button class="rpc-popover-close" data-close="${bar.key}" aria-label="Close">×</button>
      </div>
      <div class="rpc-popover-divider"></div>
      ${lastReplacedHtml}
      ${threshold ? `<div class="rpc-popover-row"><span>Threshold</span><span>${threshold} ${bar.unit ?? 'h'}</span></div>` : ''}
      ${threshold ? `<div class="rpc-popover-row"><span>Remaining</span><span>${Math.round(remaining)} ${bar.unit ?? 'h'} (${barPct}%)</span></div>` : ''}
      <div class="rpc-popover-bar-track">
        <div class="rpc-popover-bar-fill" style="width:${barPct}%;background:${colour}"></div>
      </div>
      ${wearLegendHtml}
      ${bar.resetService ? `
        <button class="rpc-btn rpc-btn-secondary${isResetting ? ' rpc-btn-loading' : ''}"
                data-reset="${bar.key}" data-service="${bar.resetService}"
                ${isResetting ? 'disabled' : ''}>
          ${isResetting ? spinnerSvg : 'Mark as replaced'}
        </button>
        ${state.resetError === bar.key ? `<div class="rpc-send-error">Reset failed — try again</div>` : ''}
      ` : ''}
    </div>
  `;
}

function renderCleanBasePopover(label: string, rawState: string): string {
  return `
    <div class="rpc-popover">
      <div class="rpc-popover-header">
        <span>${esc(label)}</span>
        <button class="rpc-popover-close" data-close="cleanbase" aria-label="Close">×</button>
      </div>
      <div class="rpc-popover-divider"></div>
      <div class="rpc-popover-row"><span>Status</span><span>${cleanBaseDisplay(rawState)}</span></div>
      <div class="rpc-popover-row"><span>Function</span><span>Auto-empties bin after missions</span></div>
    </div>
  `;
}
