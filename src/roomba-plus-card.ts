/**
 * roomba-plus-card — HACS Lovelace card for the roomba_plus integration
 * Spec: roomba_plus_card_spec.md + roomba_plus_card_wave_features.md (Wave A)
 */

import { CardConfig, HomeAssistant, DaySummary, MissionRecord, HazardRecord, HouseholdSummary } from './types.js';
import { detectCapabilities } from './capabilities.js';
import { MissionApiClient } from './mission-api.js';
import { timeSince } from './utils.js';
import { renderRoomSelectorZone, renderSettingsPanel } from './zones/room-selector-zone.js';
import { renderHealthZone }       from './zones/health-zone.js';
import { renderScheduleZone }     from './zones/schedule-zone.js';
import { renderAlertZone }        from './zones/alert-zone.js';
import { renderHistoryZone }      from './zones/history-zone.js';
import { renderHouseholdZone }    from './zones/household-zone.js';
import { CHIP_TO_OPTION, OPTION_TO_CHIP } from './zones/room-selector-zone.js';
import { renderHeader } from './header.js';
import { availableTabs, defaultTab, healthTabHasBadge, historyTabHasBadge, renderTabBar, TabId } from './tabs.js';

// ──────────────────────────────────────────────
// CSS
// ──────────────────────────────────────────────

const STYLES = `
  :host {
    display: block;
    font-family: inherit;
    /* Semantic colours — cascade from HA theme when available, fall back to
       accessible defaults that match the standard HA colour palette.
       --state-active-color / --warning-color / --error-color are defined by
       every HA theme including Bubble Card themes and the default theme.      */
    /* B1 fix (v2.0): fixed constant, not var(--state-active-color, ...).
       Themes like Casa5/Bubble Card redefine --state-active-color in ways
       that can render this token amber-ish, breaking the green/amber/red
       health-bar invariant. Health colour semantics must never depend on
       a theme variable that wasn't designed for this purpose. */
    --rpc-green:      #4ade80;
    --rpc-amber:      var(--warning-color,         #d97706);
    --rpc-red:        var(--error-color,           #db4437);
    --rpc-blue:       var(--primary-color,         #2563eb);
    --rpc-grey-light: var(--divider-color,         #e5e7eb);
    --rpc-grey-mid:   var(--disabled-text-color,   #9ca3af);
    /* Heatmap empty-cell colour follows the card's secondary surface */
    --rpc-cell-empty: var(--secondary-background-color, #e5e7eb);
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
    box-shadow: var(--ha-card-box-shadow, none);
  }

  /* ─── Zones ─── */
  .rpc-zone { padding: 12px 0; }
  .rpc-zone + .rpc-zone { border-top: 1px solid var(--divider-color, rgba(0,0,0,.08)); }

  .rpc-zone-header {
    font-size: 0.7rem; font-weight: 600; text-transform: uppercase;
    letter-spacing: 0.06em; color: var(--secondary-text-color, #9ca3af);
    margin-bottom: 8px;
  }

  /* ─── v2.0 Persistent header (was Zone 1 — Status) ─── */
  .rpc-header { padding: 0 0 12px; border-bottom: 1px solid var(--divider-color, rgba(0,0,0,.08)); margin-bottom: 4px; }
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
  .rpc-robot-selector { margin-bottom: 10px; }
  .rpc-robot-select { width: 100%; background: var(--card-background-color); color: var(--primary-text-color); border: 1px solid var(--divider-color); border-radius: 6px; padding: 6px 8px; font-size: 0.9rem; cursor: pointer; }
  .rpc-docked-since { font-size: 0.8rem; color: var(--secondary-text-color); margin-top: 4px; }
  .rpc-demand-blocked { font-size: 0.8rem; color: var(--rpc-amber); margin-top: 4px; }

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

  /* Wear legend */
  .rpc-wear-legend {
    display: flex; flex-direction: column; gap: 3px;
    background: var(--secondary-background-color, #f3f4f6);
    border-radius: 6px; padding: 8px 10px; margin: 8px 0;
    font-size: 0.78rem; color: var(--secondary-text-color);
  }
  .rpc-wear-legend-title {
    font-weight: 600; color: var(--primary-text-color);
    margin-bottom: 2px; font-size: 0.8rem;
  }

  /* Wave A4 — Mop config row */
  .rpc-health-divider { height: 1px; background: var(--divider-color, rgba(0,0,0,.08)); margin: 6px 0; }
  .rpc-mop-config { font-size: 0.82rem; color: var(--secondary-text-color); padding: 4px 2px; }

  /* F3b — compact divider + CONTROLS label when settings relocate to Status zone */
  .rpc-settings-divider--compact { margin: 8px 0 4px; }
  .rpc-controls-label { margin-top: 4px; margin-bottom: 4px; }

  /* v1.3 — static bar rows (no popover / click interaction) */
  .rpc-bar-row--static { cursor: default; }
  .rpc-bar-row--static:hover { background: transparent; }

  /* v2.0 C1-HEALTH — robot health score */
  .rpc-health-score {
    display: flex; align-items: baseline; gap: 10px;
    padding: 8px 2px 4px;
  }
  .rpc-health-score--calibrating { align-items: center; }
  .rpc-health-score-label {
    font-size: 0.7rem; font-weight: 600; text-transform: uppercase;
    letter-spacing: 0.05em; color: var(--secondary-text-color, #9ca3af);
  }
  .rpc-health-score-value { font-size: 1.6rem; font-weight: 700; line-height: 1; }
  .rpc-health-score-band  { font-size: 0.75rem; font-weight: 600; }
  .rpc-health-score-calibrating {
    font-size: 0.82rem; color: var(--secondary-text-color, #9ca3af); font-style: italic;
  }
  .rpc-health-details-toggle {
    background: none; border: none; cursor: pointer; padding: 2px 2px 8px;
    font-size: 0.78rem; color: var(--primary-color, #2563eb);
    font-family: inherit;
  }

  /* v2.0 C5-ANOMALY — mission anomaly banner */
  .rpc-anomaly-banner {
    background: color-mix(in srgb, var(--rpc-amber) 12%, transparent);
    border-left: 3px solid var(--rpc-amber);
    border-radius: 4px;
    padding: 8px 10px;
    font-size: 0.82rem;
    margin-bottom: 6px;
  }

  /* v2.0 C2-MAINT — maintenance calendar */
  .rpc-maint-divider { height: 1px; background: var(--divider-color, rgba(0,0,0,.08)); margin: 8px 0 6px; }
  .rpc-maint-header {
    font-size: 0.7rem; font-weight: 600; text-transform: uppercase;
    letter-spacing: 0.05em; color: var(--secondary-text-color, #9ca3af);
    margin-bottom: 4px;
  }
  .rpc-maint-row {
    display: flex; align-items: center; justify-content: space-between;
    min-height: 36px; cursor: pointer; padding: 2px 2px;
  }
  .rpc-maint-row:hover { background: var(--secondary-background-color, rgba(0,0,0,.04)); }
  .rpc-maint-label { font-size: 0.82rem; }
  .rpc-maint-val   { font-size: 0.82rem; color: var(--secondary-text-color, #9ca3af); }
  .rpc-maint-service {
    font-family: monospace; font-size: 0.78rem; background: var(--secondary-background-color, rgba(0,0,0,.05));
    padding: 4px 6px; border-radius: 4px; margin-top: 2px; word-break: break-all;
  }

  /* v2.0 — ⚙ tab maintenance service links */
  .rpc-maint-link-row {
    display: flex; align-items: center; justify-content: space-between;
    padding: 4px 2px 0; font-size: 0.8rem;
  }
  .rpc-maint-link-label   { color: var(--primary-text-color); }
  .rpc-maint-link-service {
    font-family: monospace; font-size: 0.72rem; color: var(--secondary-text-color, #9ca3af);
  }
  /* v2.0.1: per-row "last reset" line, mirroring the Health tab's
     maintenance calendar rows so all four rows (wheel/contact/bin/battery)
     show consistent recency information instead of only three of them. */
  .rpc-maint-link-lastreset {
    font-size: 0.72rem; color: var(--secondary-text-color, #9ca3af);
    padding: 0 2px 8px;
  }
  .rpc-maint-link-hint {
    font-size: 0.72rem; color: var(--secondary-text-color, #9ca3af);
    margin-top: 4px; font-style: italic;
  }

  /* v1.3 — coverage "Building history…" skeleton text */
  .rpc-coverage-building {
    flex: 1; font-size: 0.8rem; color: var(--secondary-text-color);
    font-style: italic;
  }

  /* v1.3 — battery health group separator */
  .rpc-health-battery-sep { height: 1px; background: var(--divider-color, rgba(0,0,0,.06)); margin: 4px 0; }

  /* v1.3 — retention popover body + sub-line */
  .rpc-popover-body { padding: 4px 0; font-size: 0.85rem; display: flex; flex-direction: column; gap: 6px; }
  .rpc-popover-sub  { font-size: 0.78rem; color: var(--secondary-text-color); }

  /* v1.3 — battery EOL lines inside retention popover */
  .rpc-retention-eol      { font-size: 0.82rem; color: var(--secondary-text-color); }
  .rpc-retention-eol--warn { color: var(--rpc-red); font-weight: 500; }

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
  .rpc-day-ok      { color: var(--rpc-green); }
  .rpc-day-caution { color: var(--rpc-amber); }
  .rpc-day-err     { color: var(--rpc-red); }
  .rpc-day-time  { font-weight: 500; }
  .rpc-day-dur, .rpc-day-area { color: var(--secondary-text-color); }
  .rpc-day-zones { width: 100%; padding-left: 20px; color: var(--secondary-text-color); font-size: 0.78rem; }
  .rpc-day-aggregate { font-size: 0.82rem; }
  .rpc-day-no-detail { font-size: 0.75rem; color: var(--secondary-text-color); margin-top: 4px; }
  /* F1: demand initiator badge — robot cleaned because floor was dirty */
  .rpc-initiator-badge {
    font-size: 0.68rem; font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase;
    color: var(--rpc-blue); background: color-mix(in srgb, var(--rpc-blue) 12%, transparent);
    border: 1px solid color-mix(in srgb, var(--rpc-blue) 25%, transparent);
    border-radius: 4px; padding: 1px 5px; vertical-align: middle; white-space: nowrap;
    flex-shrink: 0;
  }
  /* v1.3 — WiFi sparkline row in day popover */
  .rpc-day-wifi {
    width: 100%; padding-left: 20px; display: flex; align-items: center; gap: 6px;
    font-size: 0.78rem; color: var(--secondary-text-color); margin-top: 2px;
  }

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

  /* ─── Wave B/C additions ─── */

  /* B1 — Presence analytics */
  .rpc-schedule-times { display: flex; flex-direction: column; gap: 4px; }
  .rpc-next-clean--likely .rpc-schedule-time { color: var(--secondary-text-color); }
  .rpc-schedule-time--approx { font-style: italic; }
  .rpc-presence-analytics {
    font-size: 0.78rem; color: var(--secondary-text-color);
    margin-top: 6px; padding: 4px 2px;
  }

  /* B3 — Settings panel */
  .rpc-settings-divider { height: 1px; background: var(--divider-color, rgba(0,0,0,.08)); margin: 10px 0 0; }
  .rpc-settings-row {
    display: flex; align-items: center; gap: 6px; width: 100%;
    background: none; border: none; cursor: pointer; font-family: inherit;
    font-size: 0.8rem; color: var(--secondary-text-color);
    padding: 8px 2px; text-align: left;
  }
  .rpc-settings-row:hover { color: var(--primary-text-color); }
  .rpc-settings-icon { font-size: 0.9rem; }
  .rpc-settings-label { flex: 1; }
  .rpc-settings-arrow { font-size: 0.7rem; }

  .rpc-settings-panel {
    display: flex; flex-wrap: wrap; gap: 6px 16px;
    padding: 8px 2px 4px; animation: rpc-expand 0.15s ease-out;
  }
  .rpc-setting-item { display: flex; align-items: center; gap: 6px; }
  .rpc-setting-label { font-size: 0.8rem; color: var(--secondary-text-color); }
  .rpc-setting-toggle {
    background: none; border: none; cursor: pointer; font-size: 0.9rem;
    color: var(--secondary-text-color); font-family: inherit; padding: 2px 4px;
    border-radius: 4px; transition: color 0.12s;
  }
  .rpc-setting-toggle:hover { color: var(--primary-text-color); }
  .rpc-setting-on { color: var(--rpc-green) !important; }
  .rpc-setting-cycle {
    background: var(--secondary-background-color, #f3f4f6);
    border: 1px solid var(--divider-color, rgba(0,0,0,.15));
    border-radius: 6px; padding: 3px 8px; font-size: 0.78rem;
    cursor: pointer; font-family: inherit; color: var(--primary-text-color);
  }
  .rpc-setting-cycle:hover { opacity: 0.8; }

  /* C1 — Lifetime stats */
  .rpc-lifetime-divider { height: 1px; background: var(--divider-color, rgba(0,0,0,.08)); margin: 10px 0 0; }
  .rpc-lifetime-toggle {
    background: none; border: none; cursor: pointer; font-family: inherit;
    font-size: 0.78rem; color: var(--secondary-text-color);
    padding: 8px 2px; width: 100%; text-align: left;
  }
  .rpc-lifetime-toggle:hover { color: var(--primary-text-color); }
  .rpc-lifetime-stats {
    display: flex; gap: 12px; flex-wrap: wrap;
    font-size: 0.82rem; color: var(--secondary-text-color);
    padding: 2px 2px 6px; animation: rpc-expand 0.15s ease-out;
  }
  .rpc-lifetime-arrow { color: var(--secondary-text-color); }
  .rpc-lifetime-stats span { white-space: nowrap; }
  .rpc-history-summary {
    display: flex; flex-wrap: wrap; align-items: center; gap: 4px 0;
    font-size: 0.82rem; color: var(--secondary-text-color); margin-bottom: 8px;
  }
  .rpc-summary-sep { margin: 0 5px; opacity: 0.5; }
  /* v1.3 — speed trend colour tokens in history summary bar */
  .rpc-trend-declining { color: var(--rpc-amber); font-weight: 500; }
  .rpc-trend-improving { color: var(--rpc-green); font-weight: 500; }
  /* v2.0: heatmap promoted to full-width Map/History tabs — SVG now scales
   * responsively instead of rendering at fixed natural size. The svg's own
   * width/height attributes (200×NNN at the current 24px CELL constant in
   * heatmap.ts) become the intrinsic aspect-ratio source for the viewBox;
   * CSS width/height here override layout sizing without touching the
   * coordinate system inside the SVG, so heatmap.ts and its fixed-geometry
   * tests are unaffected by this purely presentational change.
   * clamp(min, container-driven, max): min ≈ 7 cols × 8px cells (smallest
   * touch-safe size per the v2.0 plan); max = current 200px / 24px cells
   * (the pre-v2.0 fixed size) so wide desktop columns don't render an
   * oversized calendar. */
  .rpc-heatmap-wrap { overflow: hidden; }
  .rpc-heatmap-wrap svg {
    display: block;
    width: clamp(88px, 100%, 200px);
    height: auto;
  }
  .rpc-history-error   { font-size: 0.82rem; color: var(--secondary-text-color); padding: 8px 0; }
  .rpc-history-partial { font-size: 0.75rem; color: var(--secondary-text-color); margin-top: 6px; }
  .rpc-problem-zone    { font-size: 0.8rem; color: var(--rpc-amber); margin-top: 8px; }

  /* ── v1.5 — History tab toggle (Calendar / Coverage) ─────────────────────── */
  .rpc-history-tabs { display: flex; gap: 6px; margin-bottom: 8px; }
  .rpc-tab {
    padding: 3px 12px; border-radius: 12px;
    border: 1px solid var(--divider-color, rgba(0,0,0,.2));
    background: transparent; color: var(--secondary-text-color);
    font-size: 0.78rem; cursor: pointer; font-family: inherit;
    transition: background 0.12s, color 0.12s;
  }
  .rpc-tab.active { background: var(--rpc-blue); color: #fff; border-color: transparent; }

  /* ── v1.5 — Coverage heatmap panel ──────────────────────────────────────── */
  .rpc-coverage-panel { margin-top: 8px; }
  .rpc-coverage-image-wrap { position: relative; }
  .rpc-coverage-img { width: 100%; display: block; border-radius: 8px; }
  .rpc-hazard-pin {
    position: absolute; transform: translate(-50%, -100%);
    cursor: pointer; font-size: 1rem; line-height: 1;
    touch-action: manipulation;
  }
  /* Source-specific opacity: stuck hotspots fullweight, others slightly muted */
  .rpc-pin-robot_learned { opacity: 0.85; }
  .rpc-pin-keepout        { opacity: 0.80; }
  .rpc-coverage-legend {
    display: flex; flex-wrap: wrap; gap: 10px;
    font-size: 0.75rem; color: var(--secondary-text-color); margin-top: 6px;
  }
  .rpc-coverage-updated { font-size: 0.72rem; color: var(--secondary-text-color); margin-top: 4px; }
  .rpc-coverage-note    { font-size: 0.72rem; color: var(--secondary-text-color); margin-top: 4px; font-style: italic; }

  /* ── v2.0 C7-ROOM-BOUNDS — room polygon overlay + tap-to-select ────────── */
  .rpc-room-overlay {
    position: absolute; top: 0; left: 0; width: 100%; height: 100%;
    pointer-events: none; /* polygons opt back in individually below */
  }
  .rpc-room-poly {
    fill: var(--primary-color, #2563eb); fill-opacity: 0.08;
    stroke: var(--primary-color, #2563eb); stroke-opacity: 0.35; stroke-width: 0.4;
    cursor: pointer; pointer-events: auto;
  }
  .rpc-room-poly:hover       { fill-opacity: 0.16; stroke-opacity: 0.6; }
  .rpc-room-poly--selected   { fill-opacity: 0.28; stroke-opacity: 0.9; stroke-width: 0.6; }
  .rpc-room-label {
    position: absolute; transform: translate(-50%, -50%);
    font-size: 0.7rem; padding: 1px 5px; border-radius: 8px;
    background: var(--card-background-color, #fff); color: var(--primary-text-color);
    box-shadow: 0 1px 2px rgba(0,0,0,.15);
    cursor: pointer; white-space: nowrap; pointer-events: auto;
  }
  .rpc-room-label--selected {
    background: var(--primary-color, #2563eb); color: #fff;
  }

  /* ── v1.5 — F8 room coverage chips in day popover ───────────────────────── */
  .rpc-room-coverage {
    width: 100%; padding-left: 20px;
    display: flex; flex-wrap: wrap; gap: 5px;
    font-size: 0.75rem; margin-top: 3px;
  }
  .rpc-cov-green { color: var(--rpc-green); }
  .rpc-cov-amber { color: var(--rpc-amber); }
  .rpc-cov-red   { color: var(--rpc-red);   }
  .rpc-alignment-note {
    width: 100%; padding-left: 20px;
    font-size: 0.70rem; color: var(--secondary-text-color); margin-top: 2px;
  }

  /* ── v1.6 — Status zone: destination + cleaned rooms + demand ─────────────── */
  .rpc-mission-dest   { font-size: 0.80rem; color: var(--secondary-text-color); margin-top: 4px; padding-left: 2px; }
  .rpc-cleaned-rooms  { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 6px; font-size: 0.80rem; }
  .rpc-cleaned-chip   { background: var(--secondary-background-color, #f3f4f6); border-radius: 10px; padding: 2px 8px; }
  .rpc-demand-blocked { font-size: 0.80rem; color: var(--rpc-amber); margin-top: 6px; padding-left: 2px; }

  /* ── v2.0 — header: unified spatial line (F11 + C3-PROGRESS merge), recharge line ── */
  .rpc-spatial-line  { font-size: 0.80rem; color: var(--secondary-text-color); margin-top: 4px; padding-left: 2px; }
  .rpc-recharge-line { font-size: 0.80rem; color: var(--rpc-amber); margin-top: 4px; padding-left: 2px; }

  /* ── v2.0 — tab bar ─────────────────────────────────────────────────────── */
  .rpc-tab-bar {
    display: flex; gap: 2px; margin: 6px 0 4px;
    border-bottom: 1px solid var(--divider-color, rgba(0,0,0,.08));
  }
  .rpc-tab-btn {
    flex: 1; display: flex; align-items: center; justify-content: center; gap: 5px;
    background: none; border: none; cursor: pointer; font-family: inherit;
    padding: 8px 4px; font-size: 0.78rem; color: var(--secondary-text-color, #9ca3af);
    position: relative; border-bottom: 2px solid transparent;
  }
  .rpc-tab-btn--active {
    color: var(--primary-text-color); border-bottom-color: var(--primary-color, #2563eb);
    font-weight: 600;
  }
  .rpc-tab-icon  { font-size: 0.95rem; }
  .rpc-tab-label { white-space: nowrap; }
  .rpc-tab-badge {
    position: absolute; top: 4px; right: 18%;
    width: 7px; height: 7px; border-radius: 50%; background: var(--rpc-amber);
  }
  .rpc-tab-panel { padding-top: 4px; }

  /* ── v1.6 — History zone: traversal row ─────────────────────────────────── */
  .rpc-traversal-row  { width: 100%; padding-left: 20px; display: flex; flex-wrap: wrap; align-items: center; gap: 3px; font-size: 0.75rem; margin-top: 3px; color: var(--secondary-text-color); }
  .rpc-trav-room      { white-space: nowrap; }
  .rpc-trav-sep       { color: var(--secondary-text-color); font-size: 0.70rem; }
  .rpc-mission-dest-popover { width: 100%; padding-left: 20px; font-size: 0.75rem; color: var(--secondary-text-color); margin-top: 2px; }

  /* ── v1.6 — Health zone: energy row ─────────────────────────────────────── */
  .rpc-energy-val     { font-size: 0.82rem; color: var(--secondary-text-color); margin-left: auto; }

  /* ── v1.6 — Schedule zone: optimal window ───────────────────────────────── */
  .rpc-next-clean--optimal .rpc-schedule-time { color: var(--primary-text-color); }
  .rpc-optimal-star   { font-size: 0.70rem; color: var(--rpc-blue); margin-left: 4px; vertical-align: super; }

  /* ── v1.6 — Household zone ──────────────────────────────────────────────── */
  .rpc-zone7            { }
  .rpc-household-robot  { display: flex; align-items: baseline; gap: 8px; padding: 4px 0; font-size: 0.82rem; }
  .rpc-household-name   { font-weight: 500; min-width: 80px; }
  .rpc-household-meta   { font-size: 0.75rem; color: var(--secondary-text-color); margin-left: auto; }
  .rpc-household-combined { border-top: 1px solid var(--divider-color, rgba(0,0,0,.08)); padding-top: 6px; margin-top: 2px; }
  .rpc-household-divider  { height: 1px; background: var(--divider-color, rgba(0,0,0,.08)); margin: 4px 0; }
  .rpc-household-floors   { margin-bottom: 4px; }
  .rpc-household-floor    { display: flex; align-items: baseline; gap: 8px; font-size: 0.75rem; color: var(--secondary-text-color); padding: 2px 0; }
  .rpc-household-floor-label { font-weight: 500; }
  /* v2.0 — household view "← Back" chip */
  .rpc-household-back {
    background: none; border: none; cursor: pointer; font-family: inherit;
    color: var(--primary-color, #2563eb); font-size: 0.8rem; padding: 4px 2px 10px;
  }
`;

// ──────────────────────────────────────────────
// Card
// ──────────────────────────────────────────────

class RoombaPlusCard extends HTMLElement {
  private config!: CardConfig;
  private _hass!: HomeAssistant;
  private root!: ShadowRoot;
  private robotName = '';
  /** F3: entity ID of the currently displayed robot (may differ from config.entity in multi-robot mode) */
  private activeRobot = '';
  // v2.0 — tab architecture
  private activeTab: TabId | null = null;   // null until first render picks the default
  private roomPickerOpen = false;
  /** v2.0: robot selector dropdown also offers a "Household summary" view
   *  that replaces the header + tabs entirely with the combined multi-robot
   *  summary. Independent of activeRobot — does not reset on robot switch. */
  private viewMode: 'robot' | 'household' = 'robot';

  // Zone 2
  private selectedRooms = new Set<string>();
  private passes = 'Auto';
  private passSettingInFlight = false;   // guards passes sync during select_option round-trip
  private isSendingClean = false;
  private sendError: string | null = null;
  private settingsPanelOpen = false;     // B3: settings panel expanded state

  // Zone 1 quick actions
  private loadingAction: string | null = null;
  private locateTimer: ReturnType<typeof setTimeout> | null = null;
  private actionResetTimer: ReturnType<typeof setTimeout> | null = null;
  private cleanTimeoutTimer: ReturnType<typeof setTimeout> | null = null;

  // Zone 3 health popovers
  private openPopover: string | null = null;
  private resetting: string | null = null;
  private resetError: string | null = null;
  private legendShown = false;   // wear arrow legend shown once per session
  // v2.0 C1-HEALTH / C2-MAINT
  private healthDetailsExpanded = false;
  private openMaintPopover: string | null = null;

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
  /** Tier 2 cap detection: first record from format=records after loadHistory */
  private firstRecord: import('./types.js').MissionRecord | null = null;
  /** Tier 2 cap detection: first summary from format=summary after loadHistory */
  private firstSummary: import('./types.js').DaySummary | null = null;
  private historyLoading = false;
  private historyError: string | null = null;
  private openDay: string | null = null;
  private dayMissions: MissionRecord[] | null = null;
  private openDaySummary: DaySummary | null = null;
  private lifetimeExpanded = false;      // C1: lifetime stats footer expanded
  private hazards: HazardRecord[] = [];  // F7: coverage map hazard pins (fetched with history)
  private historyTab: 'calendar' | 'coverage' = 'calendar'; // F7: active tab in history zone
  private householdData: HouseholdSummary | null = null;     // F17: household summary (multi-robot only)
  private apiClient: MissionApiClient | null = null;
  private prevVacuumState  = '';
  private prevMissionActive = '';   // tracks binary_sensor.*_mission_active across updates

  // Tap-outside close
  private readonly handleOutsideClick = (e: Event): void => {
    const path = e.composedPath();
    if (!path.includes(this)) {
      let changed = false;
      if (this.openPopover !== null) { this.openPopover = null; changed = true; }
      if (this.openMaintPopover !== null) { this.openMaintPopover = null; changed = true; }
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
    // Support both single-entity and multi-entity config
    const entityList = config.entities && config.entities.length > 0
      ? config.entities
      : [config.entity];
    if (!entityList[0]) throw new Error('roomba-plus-card: entity is required');

    // On first call or when active robot no longer in entity list, pick first
    const prevActive  = this.activeRobot;
    const nextDefault = entityList.includes(prevActive) ? prevActive : entityList[0];
    const entityChanged = nextDefault !== prevActive;

    this.config    = config;
    this.activeRobot = nextDefault;
    this.robotName   = nextDefault.replace('vacuum.', '');

    if (entityChanged) {
      this.resetRobotState();
    }

    this.root.innerHTML = `<style>${STYLES}</style><div class="rpc-card" style="padding:16px;color:var(--secondary-text-color,#9ca3af);font-size:.85rem">Loading…</div>`;
  }

  set hass(hass: HomeAssistant) {
    // Compute relevance BEFORE updating reference so we can diff old vs new
    const relevant = this.relevantEntityIds();
    const changed = !this._hass || relevant.some(id =>
      hass.states[id]?.state       !== this._hass.states[id]?.state ||
      hass.states[id]?.last_changed !== this._hass.states[id]?.last_changed
    );

    // Always update the hass reference — mission detection and apiClient need current data
    const prev = this._hass;
    this._hass = hass;

    // Sync passes chip to entity state — but never overwrite an optimistic update in-flight
    const passesEntity = hass.states[`select.${this.robotName}_cleaning_passes`];
    if (passesEntity && !this.isSendingClean && !this.passSettingInFlight) {
      this.passes = OPTION_TO_CHIP[passesEntity.state] ?? 'Auto';
    }

    // History refresh on mission completion.
    // v1.9+: use binary_sensor.*_mission_active (on→off = mission truly finished, not just docked mid-mission).
    // Pre-1.9 fallback: cleaning→docked vacuum state transition (may fire spuriously on mid-mission recharge).
    const missionActiveId    = `binary_sensor.${this.robotName}_mission_active`;
    const missionActiveState = hass.states[missionActiveId]?.state ?? '';

    if (missionActiveState) {
      if (this.prevMissionActive === 'on' && missionActiveState === 'off') {
        this.loadHistory();
      }
      this.prevMissionActive = missionActiveState;
    } else {
      const vacState = hass.states[this.config.entity]?.state ?? '';
      if (this.prevVacuumState === 'cleaning' && vacState === 'docked') {
        this.loadHistory();
      }
      this.prevVacuumState = vacState;
    }

    // Initial history load
    if (this.apiClient === null) {
      if (this.config.show_history !== false) {
        this.apiClient = new MissionApiClient(hass, this.config, this.activeRobot);
        this.loadHistory();
      }
    } else {
      this.apiClient.updateHass(hass);
    }

    // Render guard: skip full re-render when no relevant entity changed.
    // Always render on first call (prev is undefined) or when a relevant entity changed.
    if (!prev || changed) {
      this.render();
    }
  }

  /** Entity IDs that drive card rendering. Changes outside this set are ignored.
   * B1 fix: uses this.activeRobot (not this.config.entity) so multi-robot mode
   * correctly watches the currently displayed robot's entities.
   */
  private relevantEntityIds(): string[] {
    const n = this.robotName;
    // Use activeRobot as the vacuum entity — in multi-robot mode this differs
    // from config.entity (which is always the first/default robot).
    return [
      this.activeRobot,
      `sensor.${n}_last_error_code`,
      `sensor.${n}_last_error_zone`,          // B2: needed for error zone display
      `sensor.${n}_phase`,
      `binary_sensor.${n}_mission_active`,
      `binary_sensor.${n}_maintenance_due`,
      `sensor.${n}_readiness`,                // B2: needed for A5 alert text
      `binary_sensor.${n}_schedule_hold_active`,
      `sensor.${n}_next_clean`,
      `sensor.${n}_filter_remaining_hours`,
      `sensor.${n}_brush_remaining_hours`,
      `sensor.${n}_mop_pad`,                  // B2: Braava pad consumable
      `sensor.${n}_mop_tank_level`,           // B2: Braava tank level
      `sensor.${n}_mop_behavior`,             // B2: Braava mop behavior
      `sensor.${n}_clean_base_status`,
      `sensor.${n}_nav_quality`,
      `sensor.${n}_next_likely_clean_window`,
      `sensor.${n}_presence_clean_opportunities_7d`,
      `sensor.${n}_presence_clean_utilisation_7d`,
      `sensor.${n}_cleaning_passes`,
      `select.${n}_cleaning_passes`,
      `select.${n}_smart_zone_select`,
      `select.${n}_zone_select`,
      `sensor.${n}_clean_streak`,
      `sensor.${n}_completion_rate_30d`,
      `sensor.${n}_lifetime_missions`,
      // SC1 (integration v2.7.0): sensor.*_recent_area_30d and
      // sensor.*_recent_time_30d are deprecated (removed in v3.0) and no
      // longer tracked. Both area (state) and time (time_h attribute) now
      // come from this single consolidated sensor.
      `sensor.${n}_cleaning_analytics_30d`,
      // v1.3 — performance & health sensors
      `sensor.${n}_battery_capacity_retention`,
      `sensor.${n}_estimated_battery_eol`,     // B2: EOL shown in popover
      // SC1 (integration v2.7.0): sensor.*_recent_wifi_floor deprecated
      // (removed in v3.0) — replaced by sensor.*_wifi_health. Note this is
      // not a like-for-like metric swap; see alert-zone.ts WIFI_FLOOR_MIGRATION.
      `sensor.${n}_wifi_health`,
      `sensor.${n}_recent_coverage_pct`,
      `sensor.${n}_missions_last_30d`,          // gates coverage bar skeleton
      `sensor.${n}_average_mission_time`,       // A1: progress bar duration estimate
      // SC1 (integration v2.7.0): sensor.*_cleaning_speed_trend deprecated
      // (removed in v3.0) — trend now read from `trend` attribute on
      // sensor.*_cleaning_performance (tracked above is unnecessary since
      // it's the same entity already needed for hasCleaningSpeedTrend detection
      // — listed explicitly here for clarity since cleaning_performance wasn't
      // otherwise in this list before this migration).
      `sensor.${n}_cleaning_performance`,
      `binary_sensor.${n}_consecutive_clean_skips`,
      // Status zone live metrics
      `sensor.${n}_area_cleaned_today`,         // B2: Wave A3 area-today line
      `sensor.${n}_mission_expire_time`,        // B2: recharge ETA countdown
      // cleaning_analytics_30d and missions_last_30d already tracked above — A4 vs-usual delta uses both
      // v2.2+
      `image.${n}_coverage_map`,               // B2: hasCoverageImage detection

      // v2.0.1 bug fix: these v2.0 entities were never added to the render
      // guard when their features were built — an update to any of them
      // alone (e.g. robot_health_score recalculating, or
      // battery_last_replaced changing after a reset_battery call) would
      // sit in this._hass unrendered until some unrelated tracked entity
      // happened to change and trigger a re-render that incidentally
      // picked up the fresher data. Found while fixing a missing
      // last-reset display on the Battery baseline maintenance row —
      // checked the whole v2.0 entity surface for the same gap rather than
      // only adding the one entity that prompted the check.
      `sensor.${n}_robot_health_score`,         // C1-HEALTH
      `sensor.${n}_wheel_last_cleaned`,         // C2-MAINT
      `sensor.${n}_contact_last_cleaned`,       // C2-MAINT
      `sensor.${n}_bin_last_cleaned`,           // C2-MAINT
      `sensor.${n}_battery_last_replaced`,      // C2-MAINT (battery row)
      `sensor.${n}_mission_progress`,           // C3-PROGRESS
      `sensor.${n}_last_mission_result`,        // C5-ANOMALY (inactive pending integration L3-FIX, tracked for when it activates)
      `select.${n}_carpet_boost_select`,        // Settings panel
      `switch.${n}_edge_clean`,                 // Settings panel
      `switch.${n}_always_finish`,              // Settings panel
      `binary_sensor.${n}_demand_clean_blocked`, // Header demand-blocked line
      // Pre-existing gap, not v2.0-specific, fixed alongside the above
      // since it was found during the same audit:
      `sensor.${n}_optimal_clean_window`,       // F15 (⚙ tab schedule)

      // F3b — robot selector helper (when configured)
      ...(this.config.robot_selector_helper ? [this.config.robot_selector_helper] : []),
    ];
  }

  /** F3: Resolved list of robot entity IDs (entities[] takes precedence over entity). */
  private entityList(): string[] {
    return this.config.entities && this.config.entities.length > 0
      ? this.config.entities
      : [this.config.entity];
  }

  /** F3: Reset all per-robot state — called when switching active robot. */
  private resetRobotState(): void {
    this.apiClient         = null;
    this.missionData       = null;
    this.firstRecord       = null;
    this.firstSummary      = null;
    this.historyLoading    = false;
    this.historyError      = null;
    this.selectedRooms     = new Set();
    this.passes            = 'Auto';
    this.passSettingInFlight = false;
    this.openPopover       = null;
    this.legendShown       = false;
    this.healthDetailsExpanded = false;
    this.openMaintPopover  = null;
    this.activeTab          = null;   // re-pick default for the new robot's capability tier
    this.roomPickerOpen     = false;
    this.openDay           = null;
    this.dayMissions       = null;
    this.openDaySummary    = null;
    this.settingsPanelOpen = false;
    this.lifetimeExpanded  = false;
    this.hazards           = [];              // F7: clear pins on robot switch
    this.historyTab        = 'calendar';      // F7: reset to default tab
    this.householdData     = null;            // F17: clear household data on robot switch
    this.prevVacuumState   = '';
    this.prevMissionActive = '';
    this.alertsVisible     = false;
    this.lastAlertHtml     = '';
    [this.locateTimer, this.actionResetTimer, this.cleanTimeoutTimer,
     this.holdTooltipTimer, this.alertCollapseTimer].forEach(t => { if (t !== null) clearTimeout(t); });
  }

  /** F3: Switch active robot, reset state, trigger history reload, write helper. */
  private async switchRobot(entityId: string): Promise<void> {
    if (entityId === this.activeRobot) return;
    this.activeRobot = entityId;
    this.robotName   = entityId.replace('vacuum.', '');
    this.resetRobotState();
    if (this.config.show_history !== false && this._hass) {
      this.apiClient = new MissionApiClient(this._hass, this.config, entityId);
      this.loadHistory();
    }
    this.render();

    // F3b: write robot_selector_helper so conditional xiaomi cards can follow
    const helper = this.config.robot_selector_helper;
    if (helper && this._hass.states[helper]) {
      const domain  = helper.split('.')[0];
      const service = domain === 'input_select' ? 'select_option' : 'set_value';
      const data    = domain === 'input_select'
        ? { entity_id: helper, option: entityId }
        : { entity_id: helper, value: entityId };
      try {
        await this._hass.callService(domain, service, data);
      } catch (err) {
        // Non-fatal — helper write failure must never break robot switching.
        // Log so developers can diagnose mismatched helper type or permissions.
        console.warn('roomba-plus-card: robot_selector_helper write failed', err);
      }
    }
  }

  private async loadHistory() {
    if (!this.apiClient || this.historyLoading) return;  // guard concurrent calls
    // Capture the robot this load is for — bail in finally if the user switched away
    const targetRobot = this.activeRobot;
    this.historyLoading = true;
    this.historyError   = null;
    this.render();
    try {
      const days = this.config.history_days ?? 28;
      const summary = await this.apiClient.fetchSummary(days);

      // F4: attempt format=records; merge per-mission detail into summary days
      const records = await this.apiClient.fetchRecords(days);
      if (records.length > 0) {
        const byDate = new Map<string, typeof records>();
        for (const r of records) {
          const date = r.started_at.slice(0, 10);
          if (!byDate.has(date)) byDate.set(date, []);
          byDate.get(date)!.push(r);
        }
        for (const day of summary) {
          const dayRecords = byDate.get(day.date);
          if (dayRecords) {
            day.missions = dayRecords.sort((a, b) =>
              a.started_at.localeCompare(b.started_at));
          }
        }
      }

      // F7: fetch hazard pins — returns [] gracefully on integration < v2.2 or no data
      const hazards = await this.apiClient.fetchHazards();

      // F17: fetch household summary — multi-robot configs only; global endpoint
      const householdData = (this.config.entities?.length ?? 0) >= 2
        ? await this.apiClient.fetchHousehold(days)
        : null;

      this.missionData  = summary;
      // Tier 2 cap detection: use the MOST RECENT record/summary — oldest may be
      // local-only (no wifi_signal, no room_coverage) even when recent ones are cloud.
      this.firstRecord  = records.length > 0 ? records[records.length - 1] : null;
      this.firstSummary = summary.length > 0 ? summary[summary.length - 1] : null;
      this.hazards      = hazards;
      this.householdData = householdData;
    } catch (e: unknown) {
      const status = (e as Error).message;
      this.historyError = status === '404'
        ? 'History requires Roomba+ v1.8 or later'
        : 'History temporarily unavailable';
    } finally {
      // If the user switched robots while this fetch was in flight, discard the results
      // entirely — writing to this.missionData would corrupt the newly active robot's state.
      if (this.activeRobot !== targetRobot) return;
      this.historyLoading = false;
      this.render();
    }
  }

  private render() {
    if (!this.config || !this._hass) return;

    const caps     = detectCapabilities(this._hass, this.robotName, this.config, this.firstRecord, this.firstSummary);
    const isMetric = this._hass.config?.unit_system?.length === 'm';

    // Wave A3 — today's mission count for status line context (local date, not UTC)
    const _td = new Date();
    const todayIso = `${_td.getFullYear()}-${String(_td.getMonth()+1).padStart(2,'0')}-${String(_td.getDate()).padStart(2,'0')}`;
    const todaySummary = this.missionData?.find(d => d.date === todayIso) ?? null;
    const todayMissionCount = todaySummary?.total ?? null;

    // v2.0: pick the default tab on first render / after a robot switch reset it to null.
    if (this.activeTab === null) {
      this.activeTab = defaultTab(this.config, caps);
    }
    const tabs = availableTabs(this.config, caps);
    // Guard: if config/caps changed such that the previously active tab no
    // longer exists (e.g. switched to a NONE-tier robot — no Map tab), fall
    // back to the resolved default rather than rendering an empty tab panel.
    if (!tabs.some(t => t.id === this.activeTab)) {
      this.activeTab = defaultTab(this.config, caps);
    }

    // Alerts (v1.x Alert zone) relocate into the Health tab in v2.0 rather
    // than occupying their own always-visible zone — most existing alerts
    // (wifi floor, consecutive skips) are health/performance signals. This
    // is a partial implementation of the v2.0 "alerts become tab badges"
    // design: the alert TEXT still renders as a banner (debounced as
    // before), but it now lives inside the Health tab instead of a
    // dedicated top-level zone. A full per-alert-type badge split across
    // tabs is not yet implemented.
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

    const headerHtml = renderHeader({
      hass: this._hass, config: this.config, caps,
      robotName: this.robotName, loadingAction: this.loadingAction,
      todayMissionCount,
      missionData: this.missionData,
      roomPickerOpen: this.roomPickerOpen,
      selectedRoomCount: this.selectedRooms.size,
    });

    // v2.0: inline room picker — expands below the header when toggled via
    // the "Rooms…" button. Reuses the existing chip-based room selector;
    // a literal tap-to-select-on-map flow (per the full v2.0 Map tab spec)
    // is not yet implemented — this is the chip-list fallback for all tiers.
    const roomPickerHtml = this.roomPickerOpen
      ? renderRoomSelectorZone({
          hass: this._hass, config: this.config, caps,
          robotName: this.robotName,
          selectedRooms: this.selectedRooms, passes: this.passes,
          isSending: this.isSendingClean, sendError: this.sendError,
          settingsPanelOpen: false,
        })
      : '';

    const badges = {
      health:  healthTabHasBadge(this._hass, caps, this.robotName),
      history: historyTabHasBadge(this._hass, caps, this.robotName),
    };
    const tabBarHtml = renderTabBar(tabs, this.activeTab, badges);

    let tabContentHtml = '';
    switch (this.activeTab) {
      case 'map':
        // Promotes the existing F7 coverage heatmap + hazard pins to a
        // first-class tab by forcing historyTab to 'coverage'. C7-ROOM-BOUNDS
        // room polygon overlays render when caps.hasAlignment. Tap-to-select
        // shares this.selectedRooms with the header "Rooms…" chip picker —
        // selecting via map or via chips is the same pending selection.
        //
        // suppressSubTabToggle: true — fixed after screenshot review found
        // the internal Calendar/Coverage pill toggle rendering inside this
        // tab, which is wrong: this tab IS the coverage view at the
        // top-level tab bar already. Without suppression, tapping
        // "Calendar" here silently swapped the Map tab's content to the
        // calendar heatmap with no way back except switching tabs and back.
        tabContentHtml = renderHistoryZone(this._hass, this.config, caps, this.robotName,
          { data: this.missionData, loading: this.historyLoading, error: this.historyError,
            openDay: this.openDay, dayMissions: this.dayMissions, openDaySummary: this.openDaySummary,
            lifetimeExpanded: this.lifetimeExpanded,
            historyTab: 'coverage', hazards: this.hazards,
            mapSelectedRooms: this.selectedRooms,
            suppressSubTabToggle: true,
            isMapContext: true },
          isMetric);
        break;
      case 'history':
        tabContentHtml = renderHistoryZone(this._hass, this.config, caps, this.robotName,
          { data: this.missionData, loading: this.historyLoading, error: this.historyError,
            openDay: this.openDay, dayMissions: this.dayMissions, openDaySummary: this.openDaySummary,
            lifetimeExpanded: this.lifetimeExpanded,
            // Companion mode keeps the Calendar/Coverage sub-tab toggle —
            // it's the only mode where this History tab needs to reach the
            // coverage view, since no separate Map tab exists there.
            // Standalone mode forces 'calendar' AND suppresses the toggle,
            // since Coverage already has its own top-level Map tab.
            historyTab: this.config.mode === 'companion' ? this.historyTab : 'calendar',
            hazards: this.hazards,
            suppressSubTabToggle: this.config.mode !== 'companion' },
          isMetric);
        break;
      case 'health':
        tabContentHtml = `
          ${alertZoneHtml}
          ${renderHealthZone(this._hass, this.config, caps, this.robotName,
            { openPopover: this.openPopover, resetting: this.resetting, resetError: this.resetError, legendShown: this.legendShown,
              healthDetailsExpanded: this.healthDetailsExpanded, openMaintPopover: this.openMaintPopover })}
        `;
        break;
      case 'settings':
        tabContentHtml = `
          ${renderScheduleZone(this._hass, this.config, caps, this.robotName,
            { holdTooltipVisible: this.holdTooltipVisible, holdToggling: this.holdToggling })}
          <div class="rpc-settings-divider"></div>
          ${renderSettingsPanel(this._hass, this.config, this.robotName, this.settingsPanelOpen)}
          ${this.config.mode !== 'companion'
            ? renderRoomSelectorZone({
                hass: this._hass, config: this.config, caps,
                robotName: this.robotName,
                selectedRooms: this.selectedRooms, passes: this.passes,
                isSending: this.isSendingClean, sendError: this.sendError,
                settingsPanelOpen: this.settingsPanelOpen,
                // v2.0: settings panel already rendered directly above —
                // independent of hasZones so it isn't lost on robots with
                // no zone capability. Suppress the embedded copy here.
                includeSettingsPanel: false,
              })
            : ''}
          ${this.renderMaintenanceLinks(caps)}
        `;
        break;
    }

    // v2.0: household view replaces header + tabs entirely rather than
    // appending the household zone as a permanent footer below every tab —
    // it's a distinct view the robot selector switches into, not a status
    // strip that's always present.
    const bodyHtml = this.viewMode === 'household'
      ? `
        <button class="rpc-household-back" data-household-back>← Back</button>
        ${renderHouseholdZone(this._hass, this.config, caps, this.householdData, isMetric)}
      `
      : `
        ${headerHtml}
        ${roomPickerHtml}
        ${tabBarHtml}
        <div class="rpc-tab-panel">
          ${tabContentHtml}
        </div>
      `;

    const html = `
      <style>${STYLES}</style>
      <div class="rpc-card">
        ${this.renderRobotSelectorBar()}
        ${bodyHtml}
      </div>
    `;

    this.root.innerHTML = html;
    this.attachEventListeners();
  }

  /**
   * v2.0 ⚙ tab — maintenance service links. Displayed as secondary action
   * rows with the service call name, since these are HA services (not REST
   * API calls the card can invoke directly) — the card surfaces the
   * service name for Developer Tools rather than wiring a button to it.
   *
   * Only includes services confirmed against integration source:
   * reset_wheel_cleaning / reset_contact_cleaning / reset_bin_cleaning
   * (IA74-MAINT, v2.7.0) and reset_battery. A "reset robot profile" service
   * was referenced in an earlier card plan draft but its existence was
   * never confirmed against source — deliberately omitted here rather than
   * guessing at a service name.
   *
   * v2.0.1 bug fix (user-reported, traced to source rather than guessed
   * at): `sensor.*_battery_last_replaced` exists in the integration as a
   * TIMESTAMP sensor — the exact same IA74-MAINT pattern as
   * wheel/contact/bin_last_cleaned, just for the battery baseline reset.
   * The Battery baseline row only showed the service name with no "last
   * reset" date, while the other three rows already had one — an
   * inconsistency the card introduced by missing this sensor when the
   * maintenance links section was first built. Now every row shows the
   * same "Reset X ago" / "Never recorded" treatment.
   */
  private renderMaintenanceLinks(caps: import('./types.js').RobotCapabilities): string {
    if (!caps.hasMaintenanceCalendar && !this._hass.states[`sensor.${this.robotName}_battery_capacity_retention`]) return '';

    const n = this.robotName;
    const rows: { label: string; service: string; tsEntityId: string }[] = [];
    if (this._hass.states[`sensor.${n}_wheel_last_cleaned`])
      rows.push({ label: 'Wheel cleaning',   service: 'roomba_plus.reset_wheel_cleaning',   tsEntityId: `sensor.${n}_wheel_last_cleaned` });
    if (this._hass.states[`sensor.${n}_contact_last_cleaned`])
      rows.push({ label: 'Contact cleaning', service: 'roomba_plus.reset_contact_cleaning', tsEntityId: `sensor.${n}_contact_last_cleaned` });
    if (this._hass.states[`sensor.${n}_bin_last_cleaned`])
      rows.push({ label: 'Bin cleaning',     service: 'roomba_plus.reset_bin_cleaning',     tsEntityId: `sensor.${n}_bin_last_cleaned` });
    if (this._hass.states[`sensor.${n}_battery_capacity_retention`])
      rows.push({ label: 'Battery baseline', service: 'roomba_plus.reset_battery',          tsEntityId: `sensor.${n}_battery_last_replaced` });

    if (rows.length === 0) return '';

    return `
      <div class="rpc-settings-divider"></div>
      <div class="rpc-zone-header">MAINTENANCE</div>
      ${rows.map(r => {
        const tsEntity = this._hass.states[r.tsEntityId];
        const recorded = !!tsEntity && tsEntity.state !== 'unavailable' && tsEntity.state !== 'unknown';
        const lastReset = recorded
          ? `Reset ${timeSince(tsEntity!.state, this._hass.language)}`
          : 'Never recorded';
        return `
          <div class="rpc-maint-link-row">
            <span class="rpc-maint-link-label">${r.label}</span>
            <span class="rpc-maint-link-service">${r.service}</span>
          </div>
          <div class="rpc-maint-link-lastreset">${lastReset}</div>
        `;
      }).join('')}
      <div class="rpc-maint-link-hint">Trigger via Developer Tools → Services</div>
    `;
  }

  /** F3: Renders the robot selector dropdown bar when entities[] has 2+ entries.
   *  v2.0: also offers a "📊 Household summary" option that switches the
   *  whole card into the combined household view (renderRobotSelectorBar
   *  itself stays visible in that mode so the user can switch back). */
  private renderRobotSelectorBar(): string {
    const list = this.entityList();
    if (list.length < 2) return '';
    const options = list.map(id => {
      const name = this._hass.states[id]?.attributes?.['friendly_name'] as string ?? id;
      const sel  = this.viewMode === 'robot' && id === this.activeRobot ? ' selected' : '';
      return `<option value="${id}"${sel}>${name}</option>`;
    }).join('');
    const householdSel = this.viewMode === 'household' ? ' selected' : '';
    return `
      <div class="rpc-robot-selector">
        <select class="rpc-robot-select" data-robot-select>
          <optgroup label="My robots">${options}</optgroup>
          <optgroup label="View">
            <option value="__household__"${householdSel}>📊 Household summary</option>
          </optgroup>
        </select>
      </div>`;
  }


  private attachEventListeners() {
    const card = this.root.querySelector('.rpc-card')!;

    // Quick actions (Zone 1) + clean/repeat (Zone 2)
    // F3: Robot selector dropdown
    const robotSelect = card.querySelector<HTMLSelectElement>('[data-robot-select]');
    if (robotSelect) {
      robotSelect.addEventListener('change', (e) => {
        e.stopPropagation();
        const value = (e.target as HTMLSelectElement).value;
        if (value === '__household__') {
          this.viewMode = 'household';
          this.render();
        } else {
          this.viewMode = 'robot';
          this.switchRobot(value);
        }
      });
    }

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

    // Health bar rows — toggle popover; mark wear legend seen on first open
    card.querySelectorAll<HTMLElement>('[data-bar]').forEach(row => {
      const toggle = (e: Event) => {
        e.stopPropagation();
        const key = row.dataset.bar!;
        this.openPopover = this.openPopover === key ? null : key;
        this.resetError  = null;
        this.render();
        if (!this.legendShown && this.root.querySelector('[data-wear-legend]')) {
          this.legendShown = true;
        }
      };
      row.addEventListener('click', toggle);
      row.addEventListener('keydown', (e: KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(e); }
      });
    });

    // v2.0 — tab bar switching
    card.querySelectorAll<HTMLButtonElement>('[data-tab]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const tab = btn.dataset.tab as TabId;
        if (tab !== this.activeTab) {
          this.activeTab = tab;
          this.render();
        }
      });
    });

    // v2.0 — household view "← Back" returns to the active robot's view
    const householdBack = card.querySelector<HTMLButtonElement>('[data-household-back]');
    if (householdBack) {
      householdBack.addEventListener('click', (e) => {
        e.stopPropagation();
        this.viewMode = 'robot';
        this.render();
      });
    }

    // v2.0 C7-ROOM-BOUNDS — tap-to-select on Map tab room overlays.
    // Shares this.selectedRooms with the header chip picker.
    card.querySelectorAll<SVGPolygonElement | HTMLElement>('[data-room-poly], [data-room-label]').forEach(el => {
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        const room = (el as HTMLElement).dataset.roomPoly ?? (el as HTMLElement).dataset.roomLabel;
        if (!room) return;
        if (this.selectedRooms.has(room)) this.selectedRooms.delete(room);
        else this.selectedRooms.add(room);
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

    // v2.0 C1-HEALTH — score details expand/collapse toggle
    card.querySelectorAll<HTMLButtonElement>('[data-health-details-toggle]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.healthDetailsExpanded = !this.healthDetailsExpanded;
        this.render();
      });
    });

    // v2.0 C2-MAINT — maintenance calendar rows toggle their own popover
    card.querySelectorAll<HTMLElement>('[data-maint]').forEach(row => {
      const toggle = (e: Event) => {
        e.stopPropagation();
        const key = row.dataset.maint!;
        this.openMaintPopover = this.openMaintPopover === key ? null : key;
        this.render();
      };
      row.addEventListener('click', toggle);
      row.addEventListener('keydown', (e: KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(e); }
      });
    });
    card.querySelectorAll<HTMLButtonElement>('[data-close-maint]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.openMaintPopover = null;
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

    // B3 — Settings panel toggle
    card.querySelectorAll<HTMLElement>('[data-settings-toggle]').forEach(el => {
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        this.settingsPanelOpen = !this.settingsPanelOpen;
        this.render();
      });
    });

    // B3 — Switch toggles (edge_clean, always_finish)
    card.querySelectorAll<HTMLButtonElement>('[data-switch-entity]').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const entityId = btn.dataset.switchEntity!;
        const isOn     = this._hass.states[entityId]?.state === 'on';
        try {
          await this._hass.callService('switch', isOn ? 'turn_off' : 'turn_on', { entity_id: entityId });
        } catch { /* non-fatal */ }
      });
    });

    // B3 — Carpet boost cycle button
    card.querySelectorAll<HTMLButtonElement>('[data-cycle-entity]').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const entityId = btn.dataset.cycleEntity!;
        const options  = JSON.parse(btn.dataset.cycleOptions ?? '[]') as string[];
        const current  = btn.dataset.cycleCurrent ?? '';
        const idx      = options.indexOf(current);
        const next     = options.length > 0 ? options[(idx + 1) % options.length] : null;
        if (next) {
          try {
            await this._hass.callService('select', 'select_option', { entity_id: entityId, option: next });
          } catch { /* non-fatal */ }
        }
      });
    });

    // C1 — Lifetime stats expand/collapse
    card.querySelectorAll<HTMLElement>('[data-lifetime-toggle]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.lifetimeExpanded = !this.lifetimeExpanded;
        this.render();
      });
    });

    // F7 — History zone tab toggle (Calendar / Coverage)
    card.querySelectorAll<HTMLElement>('[data-history-tab]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.historyTab = (btn as HTMLElement).dataset.historyTab as 'calendar' | 'coverage';
        // Close day popover on tab switch — tabs and popover are mutually exclusive
        // (the popover renders below the heatmap wrap; on the coverage tab it would
        // appear below the image with no visual connection to its source cell)
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

    // ── v2.0: header "Rooms…" toggle — local UI state, no service call ──
    if (action === 'toggle-room-picker') {
      this.roomPickerOpen = !this.roomPickerOpen;
      this.render();
      return;
    }

    // ── Vacuum service actions ──
    const actionMap: Record<string, [string, string]> = {
      start:       ['vacuum', 'start'],
      pause:       ['vacuum', 'pause'],
      resume:      ['vacuum', 'start'],
      return_home: ['vacuum', 'return_to_base'],
      locate:      ['vacuum', 'locate'],
      // v2.0: Paused state's third button. HA's vacuum domain has no
      // distinct "stop" verb separate from return_to_base for most
      // integrations — stop_cleaning / return_to_base both halt motion.
      // roomba_plus uses the standard vacuum.stop service.
      stop:        ['vacuum', 'stop'],
      // v2.0: Error state's second button — re-attempts the vacuum's last
      // commanded action via vacuum.start, which iRobot's API treats as
      // "resume/retry" when called from an error state.
      retry:       ['vacuum', 'start'],
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
    const caps = detectCapabilities(this._hass, this.robotName, this.config, this.firstRecord, this.firstSummary);
    let size = 4;
    if (caps.hasSmartZones && this.config.show_rooms !== false) size += 3;
    if (this.config.show_health   !== false) size += 2;
    if (this.config.show_schedule !== false) size += 2;
    if (this.config.show_history  !== false) size += 4;
    return size;
  }

  /**
   * Built-in form editor — lets HA render a config UI without a custom editor element.
   * Covers the most commonly changed options; advanced options remain YAML-only.
   */
  static getConfigForm() {
    return {
      schema: [
        {
          name: 'entity',
          label: 'Robot vacuum',
          required: true,
          selector: { entity: { domain: 'vacuum' } },
        },
        {
          name: 'entities',
          label: 'Multiple robots (overrides single robot above)',
          selector: { entity: { domain: 'vacuum', multiple: true } },
        },
        {
          name: 'area_unit',
          label: 'Area unit',
          selector: { select: { options: ['auto', 'sqft', 'm2'], mode: 'dropdown' } },
        },
        {
          name: 'history_days',
          label: 'History window',
          selector: {
            select: {
              options: [
                { value: 7,  label: '7 days'  },
                { value: 14, label: '14 days' },
                { value: 28, label: '28 days' },
              ],
              mode: 'dropdown',
            },
          },
        },
        {
          name: 'presence_entities',
          label: 'Presence sensors (person.* entities)',
          selector: { entity: { domain: 'person', multiple: true } },
        },
        { name: 'show_rooms',       label: 'Show room selector zone',         selector: { boolean: {} } },
        { name: 'show_settings',    label: 'Show settings panel',             selector: { boolean: {} } },
        { name: 'show_health',      label: 'Show health zone',                selector: { boolean: {} } },
        { name: 'show_schedule',    label: 'Show schedule & presence zone',   selector: { boolean: {} } },
        { name: 'show_alerts',      label: 'Show alerts zone',                selector: { boolean: {} } },
        { name: 'show_history',     label: 'Show history zone',               selector: { boolean: {} } },
        { name: 'show_lifetime',    label: 'Show lifetime stats',             selector: { boolean: {} } },
        { name: 'show_dirt_events', label: 'Show dirt events in day detail',  selector: { boolean: {} } },
        {
          name: 'robot_selector_helper',
          label: 'Robot selector helper (input_text or input_select — for xiaomi card sync)',
          selector: { entity: { domain: ['input_text', 'input_select'] } },
        },
      ],
    };
  }

  static getStubConfig() { return { entity: 'vacuum.roomba' }; }
}

if (typeof customElements !== 'undefined') {
  customElements.define('roomba-plus-card', RoombaPlusCard);
}

if (typeof window !== 'undefined') {
  (window as unknown as Record<string, unknown[]>).customCards ??= [];
  (window as unknown as Record<string, unknown[]>).customCards.push({
    type:             'roomba-plus-card',
    name:             'Roomba+ Card',
    description:      'Full-featured card for the roomba_plus integration',
    preview:          true,
    documentationURL: 'https://github.com/johnnyh1975/ha_roomba_plus_card',
  });
}
