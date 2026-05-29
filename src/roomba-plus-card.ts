/**
 * roomba-plus-card — HACS Lovelace card for the roomba_plus integration
 * Spec: roomba_plus_card_spec.md + roomba_plus_card_wave_features.md (Wave A)
 */

import { CardConfig, HomeAssistant, RobotCapabilities, DaySummary, MissionRecord } from './types.js';
import { MissionApiClient } from './mission-api.js';
import { renderStatusZone }       from './zones/status-zone.js';
import { renderRoomSelectorZone } from './zones/room-selector-zone.js';
import { renderHealthZone }       from './zones/health-zone.js';
import { renderScheduleZone }     from './zones/schedule-zone.js';
import { renderAlertZone }        from './zones/alert-zone.js';
import { renderHistoryZone }      from './zones/history-zone.js';
import { CHIP_TO_OPTION, OPTION_TO_CHIP } from './zones/room-selector-zone.js';

// ──────────────────────────────────────────────
// Capability detection
// ──────────────────────────────────────────────

function detectCapabilities(hass: HomeAssistant, name: string): RobotCapabilities {
  const e = (key: string) => !!hass.states[`sensor.${name}_${key}`];
  const s = (key: string) => !!hass.states[`select.${name}_${key}`];
  const hasPad   = e('mop_pad');
  const hasBrush = e('brush_remaining_hours');
  return {
    hasArea:        e('area_cleaned_today'),
    hasBrush,
    hasPad,
    hasWater:       e('mop_tank_level'),
    hasCleanBase:   e('clean_base_status'),
    hasZones:       s('smart_zone_select') || s('zone_select'),
    hasSmartZones:  s('smart_zone_select'),
    hasProblemZone: e('problem_zone'),
    hasLifetimeArea:e('lifetime_area'),
    hasWearRate:    e('filter_wear_rate'),
    isMop:          hasPad && !hasBrush,
  };
}

// ──────────────────────────────────────────────
// CSS
// ──────────────────────────────────────────────

const STYLES = `
  :host {
    display: block;
    font-family: inherit;
    --rpc-green:          #2d9c4f;
    --rpc-amber:          #d97706;
    --rpc-red:            #dc2626;
    --rpc-blue:           #2563eb;
    --rpc-grey-light:     #e5e7eb;
    --rpc-grey-mid:       #9ca3af;
    --rpc-card-padding:   16px;
    --rpc-bar-height:     6px;
    --rpc-bar-row-height: 44px;
    --rpc-bar-radius:     3px;
    --rpc-dot-size:       8px;
    --rpc-cell-size:      20px;
    --rpc-cell-touch:     24px;
    --rpc-cell-gap:       3px;
  }

  .rpc-card {
    background: var(--ha-card-background, var(--card-background-color, #fff));
    border-radius: var(--ha-card-border-radius, 12px);
    padding: var(--rpc-card-padding);
    color: var(--primary-text-color);
    box-shadow: var(--ha-card-box-shadow, 0 2px 6px rgba(0,0,0,.1));
  }

  /* ─── Zones ─── */
  .rpc-zone { padding: 12px 0; }
  .rpc-zone + .rpc-zone { border-top: 1px solid var(--divider-color, rgba(0,0,0,.08)); }

  .rpc-zone-header {
    font-size: 0.7rem; font-weight: 600; text-transform: uppercase;
    letter-spacing: 0.06em; color: var(--secondary-text-color, #9ca3af);
    margin-bottom: 8px;
  }

  /* ─── Zone 1 — Status ─── */
  .rpc-robot-identity { display: flex; align-items: center; gap: 6px; margin-bottom: 8px; }
  .rpc-robot-icon { font-size: 1.1rem; }
  .rpc-robot-name { font-size: 0.9rem; font-weight: 600; color: var(--secondary-text-color, #9ca3af); }

  .rpc-state-row { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; }
  .rpc-state-dot { font-size: 1.1rem; line-height: 1; }
  .rpc-state-dot.rpc-state-cleaning {
    color: var(--rpc-green);
    animation: rpc-blink 1.4s ease-in-out infinite;
  }
  .rpc-state-dot.rpc-state-error     { color: var(--rpc-red); }
  .rpc-state-dot.rpc-state-docked    { color: var(--rpc-green); }
  .rpc-state-dot.rpc-state-returning { color: var(--rpc-amber); }
  @keyframes rpc-blink { 0%,100%{opacity:1} 50%{opacity:.4} }

  .rpc-state-label { font-size: 1rem; font-weight: 500; }
  .rpc-error-state { border-left: 3px solid var(--rpc-red); padding-left: 10px; }
  .rpc-error-action, .rpc-error-zone {
    font-size: 0.8rem; color: var(--secondary-text-color);
    margin-top: 2px; margin-left: 28px;
  }

  /* Wave A3 — area-today */
  .rpc-area-today {
    font-size: 0.8rem; color: var(--secondary-text-color);
    margin: 2px 0 4px 28px;
  }

  /* Progress bar */
  .rpc-progress-track {
    height: 4px; background: var(--rpc-grey-light);
    border-radius: 2px; margin: 8px 0; overflow: hidden;
  }
  .rpc-progress-fill {
    height: 100%; background: var(--rpc-green);
    border-radius: 2px; transition: width 1s ease;
  }

  /* Metrics */
  .rpc-metrics-row { display: flex; gap: 20px; margin: 8px 0; }
  .rpc-metric { display: flex; flex-direction: column; gap: 2px; }
  .rpc-metric-val { font-size: 1.15rem; font-weight: 600; }
  .rpc-metric-lbl { font-size: 0.7rem; color: var(--secondary-text-color); text-transform: uppercase; letter-spacing: .04em; }
  .rpc-delta-up   { color: var(--rpc-green); }
  .rpc-delta-down { color: var(--rpc-amber); }
  .rpc-docked-since { font-size: 0.8rem; color: var(--secondary-text-color); margin-top: 4px; }

  /* Action buttons */
  .rpc-actions { display: flex; gap: 8px; margin-top: 10px; flex-wrap: wrap; }
  .rpc-btn {
    display: inline-flex; align-items: center; justify-content: center; gap: 6px;
    padding: 8px 14px; border-radius: 8px; border: none;
    font-size: 0.85rem; font-weight: 500; cursor: pointer;
    transition: opacity 0.15s; background: var(--primary-color, #2563eb); color: #fff;
    min-height: 36px; font-family: inherit;
  }
  .rpc-btn:hover:not(:disabled) { opacity: 0.85; }
  .rpc-btn:disabled, .rpc-btn-disabled { opacity: 0.45; cursor: default; }
  .rpc-btn-loading { opacity: 0.7; cursor: wait; }
  .rpc-btn-primary { width: 100%; padding: 10px; font-size: 0.9rem; }
  .rpc-btn-secondary {
    background: transparent; border: 1px solid var(--divider-color, rgba(0,0,0,.15));
    color: var(--primary-text-color); width: 100%; margin-top: 10px;
  }
  .rpc-btn-text {
    background: none; border: none; color: var(--secondary-text-color);
    font-size: 0.8rem; cursor: pointer; padding: 4px 6px; font-family: inherit;
    margin-top: 4px; align-self: flex-end;
  }
  .rpc-btn-text:hover { color: var(--primary-text-color); }
  .rpc-send-error { font-size: 0.78rem; color: var(--rpc-red); margin-top: 6px; }

  /* Spinner */
  .rpc-spinner {
    width: 16px; height: 16px; flex-shrink: 0;
    animation: rpc-spin 0.8s linear infinite;
  }
  .rpc-spinner-sm { width: 12px; height: 12px; }
  @keyframes rpc-spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }

  /* ─── Zone 2 — Room Selector ─── */
  .rpc-chips-row { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; margin-bottom: 8px; }
  .rpc-room-chip {
    padding: 5px 12px; border-radius: 20px;
    border: 1.5px solid var(--primary-color, #2563eb);
    background: transparent; color: var(--primary-color, #2563eb);
    font-size: 0.82rem; cursor: pointer; font-family: inherit;
    transition: background 0.12s, color 0.12s;
  }
  .rpc-room-chip--selected { background: var(--primary-color, #2563eb); color: #fff; }
  .rpc-selected-count { font-size: 0.78rem; color: var(--secondary-text-color); margin-left: auto; }
  .rpc-passes-row { display: flex; align-items: center; gap: 6px; margin-bottom: 8px; }
  .rpc-passes-label { font-size: 0.8rem; color: var(--secondary-text-color); margin-right: 4px; }
  .rpc-pass-chip {
    padding: 3px 10px; border-radius: 12px;
    border: 1px solid var(--divider-color, rgba(0,0,0,.2));
    background: transparent; color: var(--primary-text-color);
    font-size: 0.78rem; cursor: pointer; font-family: inherit; transition: background 0.12s;
  }
  .rpc-pass-chip--selected { background: var(--secondary-background-color, #f3f4f6); font-weight: 600; }
  .rpc-room-actions { display: flex; flex-direction: column; gap: 4px; }

  /* ─── Zone 3 — Health ─── */
  .rpc-bar-row {
    display: flex; align-items: center; min-height: var(--rpc-bar-row-height);
    gap: 8px; cursor: pointer; border-radius: 6px; padding: 0 2px;
    transition: background 0.12s;
  }
  .rpc-bar-row:hover { background: var(--secondary-background-color, rgba(0,0,0,.04)); }
  .rpc-bar-label { font-size: 0.82rem; color: var(--secondary-text-color); min-width: 65px; flex-shrink: 0; }
  .rpc-bar-track { flex: 1; height: var(--rpc-bar-height); background: var(--rpc-grey-light); border-radius: var(--rpc-bar-radius); overflow: hidden; }
  .rpc-bar-fill  { height: 100%; border-radius: var(--rpc-bar-radius); transition: width 0.4s ease; }
  .rpc-bar-pct   { font-size: 0.8rem; font-weight: 600; min-width: 36px; text-align: right; flex-shrink: 0; }
  .rpc-bar-hours { font-size: 0.78rem; color: var(--secondary-text-color); min-width: 30px; flex-shrink: 0; }
  .rpc-bar-arrow { font-size: 0.78rem; font-weight: 600; flex-shrink: 0; }
  .rpc-bar-cleanbase-state { font-size: 0.82rem; color: var(--secondary-text-color); flex: 1; }

  /* Wave A4 — Mop config row */
  .rpc-health-divider { height: 1px; background: var(--divider-color, rgba(0,0,0,.08)); margin: 6px 0; }
  .rpc-mop-config { font-size: 0.82rem; color: var(--secondary-text-color); padding: 4px 2px; }

  /* ─── Popovers ─── */
  .rpc-popover {
    background: var(--secondary-background-color, #f9fafb);
    border: 1px solid var(--divider-color, rgba(0,0,0,.1));
    border-radius: 8px; padding: 12px; margin: 4px 0 6px;
    animation: rpc-expand 0.15s ease-out;
  }
  @keyframes rpc-expand { from{opacity:0;transform:translateY(-4px)} to{opacity:1;transform:translateY(0)} }
  .rpc-popover-header {
    display: flex; justify-content: space-between; align-items: center;
    font-weight: 600; font-size: 0.88rem; margin-bottom: 8px;
  }
  .rpc-popover-close {
    background: none; border: none; font-size: 1.1rem; cursor: pointer;
    color: var(--secondary-text-color); line-height: 1; padding: 0 4px; font-family: inherit;
  }
  .rpc-popover-divider { height: 1px; background: var(--divider-color, rgba(0,0,0,.1)); margin: 8px -12px; }
  .rpc-popover-row {
    display: flex; justify-content: space-between;
    font-size: 0.82rem; color: var(--secondary-text-color); margin-bottom: 6px;
  }
  .rpc-popover-row span:last-child { color: var(--primary-text-color); font-weight: 500; }
  .rpc-popover-bar-track { height: 8px; background: var(--rpc-grey-light); border-radius: 4px; overflow: hidden; margin: 8px 0; }
  .rpc-popover-bar-fill  { height: 100%; border-radius: 4px; }

  /* Day popover */
  .rpc-day-count   { font-size: 0.82rem; color: var(--secondary-text-color); margin-bottom: 8px; }
  .rpc-day-empty   { font-size: 0.82rem; color: var(--secondary-text-color); }
  .rpc-day-mission { display: flex; align-items: baseline; gap: 8px; font-size: 0.82rem; margin-bottom: 6px; flex-wrap: wrap; }
  .rpc-day-icon  { font-weight: 700; flex-shrink: 0; }
  .rpc-day-ok    { color: var(--rpc-green); }
  .rpc-day-err   { color: var(--rpc-red); }
  .rpc-day-time  { font-weight: 500; }
  .rpc-day-dur, .rpc-day-area { color: var(--secondary-text-color); }
  .rpc-day-zones { width: 100%; padding-left: 20px; color: var(--secondary-text-color); font-size: 0.78rem; }
  .rpc-day-aggregate { font-size: 0.82rem; }
  .rpc-day-no-detail { font-size: 0.75rem; color: var(--secondary-text-color); margin-top: 4px; }

  /* ─── Zone 4 — Schedule ─── */
  .rpc-schedule-row { display: flex; align-items: flex-start; justify-content: space-between; gap: 8px; margin-bottom: 6px; }
  .rpc-next-clean { display: flex; flex-direction: column; gap: 2px; }
  .rpc-schedule-label { font-size: 0.75rem; color: var(--secondary-text-color); }
  .rpc-schedule-time  { font-size: 0.9rem; font-weight: 600; }
  .rpc-hold-badge {
    padding: 4px 10px; border-radius: 12px; font-size: 0.78rem; font-weight: 500;
    border: none; cursor: pointer; font-family: inherit;
    display: inline-flex; align-items: center; gap: 4px;
    transition: opacity 0.15s; white-space: nowrap;
  }
  .rpc-hold-badge:hover { opacity: 0.8; }
  .rpc-badge-green { background: rgba(45,156,79,.15);  color: var(--rpc-green); }
  .rpc-badge-amber { background: rgba(217,119,6,.15);  color: var(--rpc-amber); }
  .rpc-badge-blue  { background: rgba(37,99,235,.15);  color: var(--rpc-blue); }
  .rpc-hold-tooltip {
    font-size: 0.78rem; color: var(--secondary-text-color);
    background: var(--secondary-background-color, #f3f4f6);
    border-radius: 6px; padding: 6px 10px; margin-top: 4px;
    animation: rpc-expand 0.15s ease-out;
  }
  .rpc-presence-row { display: flex; gap: 16px; flex-wrap: wrap; }
  .rpc-presence-dot { display: flex; align-items: center; gap: 5px; font-size: 0.82rem; }
  .rpc-dot { display: inline-block; width: var(--rpc-dot-size); height: var(--rpc-dot-size); border-radius: 50%; flex-shrink: 0; }
  .rpc-dot-green { background: var(--rpc-green); }
  .rpc-dot-amber { background: var(--rpc-amber); }
  .rpc-presence-label { color: var(--secondary-text-color); }

  /* ─── Zone 5 — Alerts ─── */
  .rpc-zone5 { animation: rpc-expand 0.2s ease-out; }
  .rpc-alert-box {
    display: flex; gap: 10px; align-items: flex-start;
    background: rgba(220,38,38,.07); border: 1px solid rgba(220,38,38,.2);
    border-radius: 8px; padding: 10px 12px;
  }
  .rpc-alert-icon    { font-size: 1rem; flex-shrink: 0; line-height: 1.4; }
  .rpc-alert-text    { font-size: 0.85rem; font-weight: 500; }
  .rpc-alert-sub     { font-size: 0.78rem; color: var(--secondary-text-color); margin-top: 2px; }

  /* ─── Zone 6 — History ─── */
  .rpc-history-summary { font-size: 0.82rem; color: var(--secondary-text-color); margin-bottom: 8px; }
  .rpc-heatmap-wrap { overflow: hidden; }
  .rpc-heatmap-wrap svg { width: 100%; height: auto; display: block; }
  .rpc-history-error   { font-size: 0.82rem; color: var(--secondary-text-color); padding: 8px 0; }
  .rpc-history-partial { font-size: 0.75rem; color: var(--secondary-text-color); margin-top: 6px; }
  .rpc-problem-zone    { font-size: 0.8rem; color: var(--rpc-amber); margin-top: 8px; }
`;

// ──────────────────────────────────────────────
// Card
// ──────────────────────────────────────────────

class RoombaPlusCard extends HTMLElement {
  private config!: CardConfig;
  private _hass!: HomeAssistant;
  private root!: ShadowRoot;
  private robotName = '';

  // Zone 2
  private selectedRooms = new Set<string>();
  private passes = 'Auto';
  private passSettingInFlight = false;   // guards passes sync during select_option round-trip
  private isSendingClean = false;
  private sendError: string | null = null;

  // Zone 1 quick actions
  private loadingAction: string | null = null;
  private locateTimer: ReturnType<typeof setTimeout> | null = null;
  private actionResetTimer: ReturnType<typeof setTimeout> | null = null;
  private cleanTimeoutTimer: ReturnType<typeof setTimeout> | null = null;

  // Zone 3 health popovers
  private openPopover: string | null = null;
  private resetting: string | null = null;
  private resetError: string | null = null;

  // Zone 4 schedule
  private holdTooltipVisible = false;
  private holdToggling = false;
  private holdTooltipTimer: ReturnType<typeof setTimeout> | null = null;

  // Zone 5 alerts — 100ms collapse debounce
  private alertsVisible = false;
  private lastAlertHtml = '';
  private alertCollapseTimer: ReturnType<typeof setTimeout> | null = null;

  // Zone 6 history
  private missionData: DaySummary[] | null = null;
  private historyLoading = false;
  private historyError: string | null = null;
  private openDay: string | null = null;
  private dayMissions: MissionRecord[] | null = null;
  private openDaySummary: DaySummary | null = null;
  private apiClient: MissionApiClient | null = null;
  private prevVacuumState = '';

  // Tap-outside close
  private readonly handleOutsideClick = (e: Event): void => {
    const path = e.composedPath();
    if (!path.includes(this)) {
      let changed = false;
      if (this.openPopover !== null) { this.openPopover = null; changed = true; }
      if (this.openDay !== null)     { this.openDay = null; this.dayMissions = null; this.openDaySummary = null; changed = true; }
      if (changed) this.render();
    }
  };

  constructor() {
    super();
    this.root = this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    document.addEventListener('click', this.handleOutsideClick);
  }

  disconnectedCallback() {
    document.removeEventListener('click', this.handleOutsideClick);
    // Clear all pending timers
    [this.locateTimer, this.actionResetTimer, this.cleanTimeoutTimer,
     this.holdTooltipTimer, this.alertCollapseTimer].forEach(t => { if (t !== null) clearTimeout(t); });
  }

  setConfig(config: CardConfig) {
    if (!config.entity) throw new Error('roomba-plus-card: entity is required');

    const entityChanged = this.config?.entity !== config.entity;
    this.config    = config;
    this.robotName = config.entity.replace('vacuum.', '');

    if (entityChanged) {
      // Full state reset — stale data from previous robot must not leak through
      this.apiClient       = null;
      this.missionData     = null;
      this.historyLoading  = false;
      this.historyError    = null;
      this.selectedRooms   = new Set();
      this.passes          = 'Auto';
      this.passSettingInFlight = false;
      this.openPopover     = null;
      this.openDay         = null;
      this.dayMissions     = null;
      this.openDaySummary  = null;
      this.prevVacuumState = '';
      this.alertsVisible   = false;
      this.lastAlertHtml   = '';
      [this.locateTimer, this.actionResetTimer, this.cleanTimeoutTimer,
       this.holdTooltipTimer, this.alertCollapseTimer].forEach(t => { if (t !== null) clearTimeout(t); });
    }

    this.root.innerHTML = `<style>${STYLES}</style><div class="rpc-card" style="padding:16px;color:var(--secondary-text-color,#9ca3af);font-size:.85rem">Loading…</div>`;
  }

  set hass(hass: HomeAssistant) {
    this._hass = hass;

    // Sync passes chip to entity state — but never overwrite an optimistic update in-flight
    const passesEntity = hass.states[`select.${this.robotName}_cleaning_passes`];
    if (passesEntity && !this.isSendingClean && !this.passSettingInFlight) {
      this.passes = OPTION_TO_CHIP[passesEntity.state] ?? 'Auto';
    }

    // History refresh on mission complete
    const vacState = hass.states[this.config.entity]?.state ?? '';
    if (this.prevVacuumState === 'cleaning' && vacState === 'docked') {
      this.loadHistory();
    }
    this.prevVacuumState = vacState;

    // Initial history load
    if (this.apiClient === null) {
      if (this.config.show_history !== false) {
        this.apiClient = new MissionApiClient(hass, this.config);
        this.loadHistory();
      }
    } else {
      this.apiClient.updateHass(hass);
    }

    this.render();
  }

  private async loadHistory() {
    if (!this.apiClient || this.historyLoading) return;  // guard concurrent calls
    this.historyLoading = true;
    this.historyError   = null;
    this.render();
    try {
      const days = this.config.history_days ?? 28;
      this.missionData = await this.apiClient.fetch(days);
    } catch (e: unknown) {
      const status = (e as Error).message;
      this.historyError = status === '404'
        ? 'History requires Roomba+ v1.8 or later'
        : 'History temporarily unavailable';
    } finally {
      this.historyLoading = false;
      this.render();
    }
  }

  private render() {
    if (!this.config || !this._hass) return;

    const caps     = detectCapabilities(this._hass, this.robotName);
    const isMetric = this._hass.config?.unit_system?.length === 'm';

    // Wave A3 — today's mission count for status line context (local date, not UTC)
    const _td = new Date();
    const todayIso = `${_td.getFullYear()}-${String(_td.getMonth()+1).padStart(2,'0')}-${String(_td.getDate()).padStart(2,'0')}`;
    const todaySummary = this.missionData?.find(d => d.date === todayIso) ?? null;
    const todayMissionCount = todaySummary?.total ?? null;

    // Zone 5 alert debounce: render fresh, manage visibility
    const freshAlert = renderAlertZone(this._hass, this.config, caps, this.robotName);
    let alertZoneHtml = freshAlert;
    if (freshAlert) {
      if (this.alertCollapseTimer !== null) { clearTimeout(this.alertCollapseTimer); this.alertCollapseTimer = null; }
      this.alertsVisible = true;
      this.lastAlertHtml = freshAlert;
    } else if (this.alertsVisible) {
      if (this.alertCollapseTimer === null) {
        this.alertCollapseTimer = setTimeout(() => {
          this.alertsVisible      = false;
          this.alertCollapseTimer = null;
          this.render();
        }, 100);
      }
      alertZoneHtml = this.lastAlertHtml; // keep showing during debounce window
    }

    const html = `
      <style>${STYLES}</style>
      <div class="rpc-card">
        ${renderStatusZone({
          hass: this._hass, config: this.config, caps,
          robotName: this.robotName, loadingAction: this.loadingAction,
          todayMissionCount,
        })}
        ${renderRoomSelectorZone({
          hass: this._hass, config: this.config, caps,
          robotName: this.robotName,
          selectedRooms: this.selectedRooms, passes: this.passes,
          isSending: this.isSendingClean, sendError: this.sendError,
        })}
        ${renderHealthZone(this._hass, this.config, caps, this.robotName,
          { openPopover: this.openPopover, resetting: this.resetting, resetError: this.resetError })}
        ${renderScheduleZone(this._hass, this.config, caps, this.robotName,
          { holdTooltipVisible: this.holdTooltipVisible, holdToggling: this.holdToggling })}
        ${alertZoneHtml}
        ${renderHistoryZone(this._hass, this.config, caps, this.robotName,
          { data: this.missionData, loading: this.historyLoading, error: this.historyError,
            openDay: this.openDay, dayMissions: this.dayMissions, openDaySummary: this.openDaySummary },
          isMetric)}
      </div>
    `;

    this.root.innerHTML = html;
    this.attachEventListeners();
  }

  private attachEventListeners() {
    const card = this.root.querySelector('.rpc-card')!;

    // Quick actions (Zone 1) + clean/repeat (Zone 2)
    card.querySelectorAll<HTMLButtonElement>('[data-action]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation(); // prevent tap-outside handler from firing
        this.handleAction(btn.dataset.action!);
      });
    });

    // Room chips
    card.querySelectorAll<HTMLButtonElement>('[data-room]').forEach(chip => {
      chip.addEventListener('click', (e) => {
        e.stopPropagation();
        const room = chip.dataset.room!;
        this.selectedRooms.has(room) ? this.selectedRooms.delete(room) : this.selectedRooms.add(room);
        this.render();
      });
    });

    // Pass chips — update local state + call select.select_option immediately
    card.querySelectorAll<HTMLButtonElement>('[data-pass]').forEach(chip => {
      chip.addEventListener('click', async (e) => {
        e.stopPropagation();
        const chipLabel = chip.dataset.pass!;
        const option    = chip.dataset.passOption!;
        this.passes = chipLabel;
        this.render();
        const selectId = `select.${this.robotName}_cleaning_passes`;
        if (this._hass.states[selectId]) {
          this.passSettingInFlight = true;
          try {
            await this._hass.callService('select', 'select_option', { entity_id: selectId, option });
          } catch { /* non-fatal */ } finally {
            this.passSettingInFlight = false;
          }
        }
      });
    });

    // Health bar rows — toggle popover
    card.querySelectorAll<HTMLElement>('[data-bar]').forEach(row => {
      row.addEventListener('click', (e) => {
        e.stopPropagation();
        const key = row.dataset.bar!;
        this.openPopover = this.openPopover === key ? null : key;
        this.resetError  = null;
        this.render();
      });
    });

    // Popover × close buttons
    card.querySelectorAll<HTMLButtonElement>('[data-close]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.openPopover = null;
        this.render();
      });
    });

    // "Mark as replaced" reset buttons
    card.querySelectorAll<HTMLButtonElement>('[data-reset]').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const key     = btn.dataset.reset!;
        const service = btn.dataset.service!;
        this.resetting  = key;
        this.resetError = null;
        this.render();
        try {
          await this._hass.callService('roomba_plus', service, { entity_id: this.config.entity });
          await new Promise(r => setTimeout(r, 800)); // brief delay so sensor state refreshes
          this.openPopover = null;
        } catch {
          this.resetError = key;
        } finally {
          this.resetting = null;
          this.render();
        }
      });
    });

    // Hold badge
    card.querySelectorAll<HTMLButtonElement>('[data-hold-action]').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        if (btn.dataset.holdAction === 'tooltip') {
          this.holdTooltipVisible = true;
          this.render();
          if (this.holdTooltipTimer !== null) clearTimeout(this.holdTooltipTimer);
          this.holdTooltipTimer = setTimeout(() => {
            this.holdTooltipVisible = false;
            this.holdTooltipTimer   = null;
            this.render();
          }, 3000);
        } else {
          const switchId = `switch.${this.robotName}_schedule_hold`;
          const isOn     = this._hass.states[switchId]?.state === 'on';
          this.holdToggling = true;
          this.render();
          try {
            await this._hass.callService('switch', isOn ? 'turn_off' : 'turn_on', { entity_id: switchId });
          } finally {
            this.holdToggling = false;
            this.render();
          }
        }
      });
    });

    // Heatmap cell click (event delegation on the SVG container)
    const heatmapWrap = card.querySelector('[data-heatmap]');
    if (heatmapWrap) {
      heatmapWrap.addEventListener('click', (e) => {
        e.stopPropagation();
        const cell = (e.target as Element).closest('[data-date]') as SVGElement | null;
        if (!cell) return;
        const date = cell.getAttribute('data-date')!;
        if (this.openDay === date) {
          this.openDay = null; this.dayMissions = null; this.openDaySummary = null;
        } else {
          this.openDay         = date;
          this.openDaySummary  = this.missionData?.find(d => d.date === date) ?? null;
          this.dayMissions     = this.buildDayMissions(date);
        }
        this.render();
      });
    }

    // Day popover × close
    card.querySelectorAll<HTMLButtonElement>('[data-close-day]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.openDay = null; this.dayMissions = null; this.openDaySummary = null;
        this.render();
      });
    });
  }

  /** Derive per-mission records for the day detail popover */
  private buildDayMissions(date: string): MissionRecord[] {
    const summary = this.missionData?.find(d => d.date === date);
    if (!summary || summary.total === 0) return [];
    // Use real per-mission data if the API returned it
    if (summary.missions && summary.missions.length > 0) return summary.missions;
    // API didn't return per-mission detail — return empty; history-zone will show aggregate
    return [];
  }

  private async handleAction(action: string) {
    const { entity } = this.config;
    const n = this.robotName;

    // ── Clean selected rooms ──
    if (action === 'clean-selected') {
      this.isSendingClean = true;
      this.sendError      = null;
      this.render();

      const rooms = Array.from(this.selectedRooms);

      // Safety 8s timeout
      this.cleanTimeoutTimer = setTimeout(() => {
        this.isSendingClean    = false;
        this.sendError         = 'Start command may not have been received — check the iRobot app';
        this.cleanTimeoutTimer = null;
        this.render();
      }, 8000);

      try {
        // Set cleaning passes via select entity first (spec: "Tapping calls select.select_option")
        const passesId = `select.${n}_cleaning_passes`;
        if (this.passes !== 'Auto' && this._hass.states[passesId]) {
          await this._hass.callService('select', 'select_option', {
            entity_id: passesId,
            option: CHIP_TO_OPTION[this.passes] ?? this.passes,
          });
        }
        await this._hass.callService('roomba_plus', 'clean_room', {
          entity_id: entity,
          room_name: rooms,
          ordered:   false,
        });
        clearTimeout(this.cleanTimeoutTimer!);
        this.cleanTimeoutTimer = null;
        this.selectedRooms.clear();
        this.isSendingClean = false;
      } catch {
        if (this.cleanTimeoutTimer !== null) { clearTimeout(this.cleanTimeoutTimer); this.cleanTimeoutTimer = null; }
        this.isSendingClean = false;
        this.sendError      = 'Start command may not have been received — check the iRobot app';
      }
      this.render();
      return;
    }

    // ── Repeat last ──
    if (action === 'repeat-last') {
      try {
        await this._hass.callService('button', 'press', { entity_id: `button.${n}_repeat_mission` });
      } catch { /* silent */ }
      return;
    }

    // ── Vacuum service actions ──
    const actionMap: Record<string, [string, string]> = {
      start:       ['vacuum', 'start'],
      pause:       ['vacuum', 'pause'],
      resume:      ['vacuum', 'start'],
      return_home: ['vacuum', 'return_to_base'],
      locate:      ['vacuum', 'locate'],
    };

    const mapping = actionMap[action];
    if (!mapping) return;
    const [domain, service] = mapping;

    this.loadingAction = action;
    this.render();

    if (action === 'locate') {
      // Locate: pulse for exactly 2 seconds regardless of service call timing
      this.locateTimer = setTimeout(() => {
        this.loadingAction = null;
        this.locateTimer   = null;
        this.render();
      }, 2000);
      try {
        await this._hass.callService(domain, service, { entity_id: entity });
      } catch { /* beep is the confirmation — no error shown */ }
      return; // locateTimer will reset state at 2s
    }

    // Other actions: 5s safety reset; Zone 1 state change is the real confirmation
    this.actionResetTimer = setTimeout(() => {
      this.loadingAction    = null;
      this.actionResetTimer = null;
      this.render();
    }, 5000);

    try {
      await this._hass.callService(domain, service, { entity_id: entity });
    } finally {
      // Reset immediately after service call resolves; the 5s timer is a safety net
      if (this.actionResetTimer !== null) { clearTimeout(this.actionResetTimer); this.actionResetTimer = null; }
      this.loadingAction = null;
      this.render();
    }
  }

  getCardSize(): number {
    if (!this.config || !this._hass) return 10;
    const caps = detectCapabilities(this._hass, this.robotName);
    let size = 4;
    if (caps.hasZones && this.config.show_rooms  !== false) size += 3;
    if (this.config.show_health   !== false) size += 2;
    if (this.config.show_schedule !== false) size += 2;
    if (this.config.show_history  !== false) size += 4;
    return size;
  }

  static getConfigElement() { return document.createElement('roomba-plus-card-editor'); }
  static getStubConfig()    { return { entity: 'vacuum.roomba' }; }
}

customElements.define('roomba-plus-card', RoombaPlusCard);

(window as unknown as Record<string, unknown[]>).customCards ??= [];
(window as unknown as Record<string, unknown[]>).customCards.push({
  type:             'roomba-plus-card',
  name:             'Roomba+ Card',
  description:      'Full-featured card for the roomba_plus integration',
  preview:          true,
  documentationURL: 'https://github.com/your-org/roomba-plus-card',
});
