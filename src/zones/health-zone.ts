import { HomeAssistant, CardConfig, RobotCapabilities } from '../types.js';
import { esc } from '../utils.js';

interface Bar {
  key: string;
  label: string;
  sensorId: string;
  thresholdAttr: string | null;
  type: 'consumable' | 'tank' | 'battery' | 'cleanbase';
  wearSensorId?: string;
  resetService?: string;
  lastReplacedId?: string;
  /** When set, use this percentage directly — bypasses entity lookup */
  rawPct?: number;
}

export interface HealthZoneState {
  openPopover: string | null;
  resetting: string | null;
  resetError: string | null;
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

function timeSince(iso: string): string {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (days === 0) return 'today';
  if (days === 1) return 'yesterday';
  return `${days} days ago`;
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
  if (caps.hasPad && hass.states[`sensor.${n}_mop_pad_remaining_hours`]) {
    bars.push({
      key: 'pad', label: 'Pad',
      sensorId:     `sensor.${n}_mop_pad_remaining_hours`,
      thresholdAttr: 'threshold_hours',
      type: 'consumable',
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
    hass.states[`sensor.${n}_battery_level`] ? `sensor.${n}_battery_level` :
    hass.states[`sensor.${n}_battery`]       ? `sensor.${n}_battery`       : null;
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

  if (bars.length === 0) return '';

  const barsHtml = bars.map(bar => renderBar(bar, hass, n, state)).join('');

  // Wave A4 — Braava pad type + intensity row
  let mopConfigHtml = '';
  if (caps.isMop) {
    const padType   = hass.states[`sensor.${n}_mop_pad`];
    const mopBehav  = hass.states[`sensor.${n}_mop_behavior`];
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
      ${barsHtml}
      ${mopConfigHtml}
    </div>
  `;
}

function renderBar(bar: Bar, hass: HomeAssistant, n: string, state: HealthZoneState): string {
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
        <span>${d.toLocaleDateString()} (${timeSince(lastReplacedEntity.state)})</span>
      </div>`;
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
      ${threshold ? `<div class="rpc-popover-row"><span>Threshold</span><span>${threshold} h</span></div>` : ''}
      ${threshold ? `<div class="rpc-popover-row"><span>Remaining</span><span>${Math.round(remaining)} h (${barPct}%)</span></div>` : ''}
      <div class="rpc-popover-bar-track">
        <div class="rpc-popover-bar-fill" style="width:${barPct}%;background:${colour}"></div>
      </div>
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
