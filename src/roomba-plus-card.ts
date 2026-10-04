/**
 * roomba-plus-card — HACS Lovelace card for the roomba_plus integration
 * Spec: roomba_plus_card_spec.md + roomba_plus_card_wave_features.md (Wave A)
 */

import { robot } from './registry.js';
import { CardConfig, HomeAssistant, DaySummary, MissionRecord, HazardRecord, HouseholdSummary, MissionExplain, MissionPath, MissionMapPayload } from './types.js';
import { detectCapabilities } from './capabilities.js';
import { MissionApiClient } from './mission-api.js';
import { timeSince, isMetricSystem, esc } from './utils.js';
import { renderRoomSelectorZone } from './zones/room-selector-zone.js';
import { renderAlertZone }        from './zones/alert-zone.js';
import { renderHouseholdZone, renderHouseholdSkeleton } from './zones/household-zone.js';
import { CHIP_TO_OPTION, OPTION_TO_CHIP } from './zones/room-selector-zone.js';
import { renderHeader } from './header.js';
import { availableTabs, defaultTab, healthTabHasBadge, historyTabHasBadge, renderTabBar, TabId } from './tabs.js';
import { resolveClick, resolveKeydownTarget, ClickActionKey } from './actions-resolver.js';
import { buildConfigFormSchema, stubConfig } from './config-form.js';
import { shouldReloadForEvent } from './mission-events.js';
import { renderTabContent, TabContentContext } from './tab-content.js';
import { isWideCard } from './layout.js';
import type { MapLayer } from './zones/map-zone.js';
import { diagnosticsData, diagnosticsMarkdown, renderDiagnostics } from './diagnostics.js';
import { isPureClickKey, clickReducer, ClickState, ClickPayload } from './click-reducers.js';
import { t, resolveLang } from './i18n/index.js';
import { planAction } from './action-plan.js';
import { relevantEntityIds, anyEntityChanged } from './relevant-entity-ids.js';
import { checkMinimums, fetchIntegrationVersion, renderVersionNotice, VersionProblem } from './version-check.js';

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
    container-type: inline-size; container-name: rpc;
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
  .rpc-offline-state { border-left: 3px solid var(--rpc-grey-mid, #9ca3af); padding-left: 10px; }
  .rpc-error-action, .rpc-error-zone {
    font-size: 0.8rem; color: var(--secondary-text-color);
    margin-top: 2px; margin-left: 28px;
  }
  /* v3.0 B2/B3 — Prime error words, start check, remaining mode */
  .rpc-error-desc, .rpc-error-modes {
    font-size: 0.8rem; color: var(--secondary-text-color);
    margin-top: 2px; margin-left: 28px;
  }
  .rpc-error-title, .rpc-start-blocked { font-size: 0.85rem; color: var(--rpc-amber); margin-top: 4px; }

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
  .rpc-version-notice {
    font-size: 0.78rem; line-height: 1.35; color: var(--primary-text-color);
    background: rgba(217, 119, 6, 0.12); border-left: 3px solid var(--rpc-amber);
    border-radius: 6px; padding: 6px 10px; margin-bottom: 10px;
  }

  /* Spinner */
  .rpc-spinner {
    width: 16px; height: 16px; flex-shrink: 0;
    animation: rpc-spin 0.8s linear infinite;
  }
  .rpc-spinner-sm { width: 12px; height: 12px; }
  @keyframes rpc-spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }

  /* ─── Zone 2 — Room Selector ─── */
  .rpc-chips-row { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; margin-bottom: 8px; }
  /* v3.0 B5 — Prime rooms grouped by floor */
  .rpc-floor-label { font-size: 0.72rem; color: var(--secondary-text-color); text-transform: uppercase; letter-spacing: .04em; margin: 4px 0; }
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
  .rpc-bar-cleanbase-state--warn { color: var(--rpc-amber); font-weight: 500; }
  .rpc-bar-days { font-size: 0.82rem; font-weight: 500; flex: 1; }

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
  /* A1 — navigation health detail */
  .rpc-nav-health { margin-top: 10px; padding-top: 10px; border-top: 1px solid var(--divider-color, rgba(0,0,0,.08)); }
  .rpc-nav-header { display: flex; align-items: center; gap: 8px; }
  .rpc-nav-label { font-size: 0.72rem; font-weight: 600; letter-spacing: 0.04em; color: var(--secondary-text-color); }
  .rpc-nav-score { display: flex; align-items: baseline; gap: 1px; }
  .rpc-nav-score-value { font-size: 1.1rem; font-weight: 700; line-height: 1; }
  .rpc-nav-score-max { font-size: 0.7rem; color: var(--secondary-text-color); }
  .rpc-nav-score--na { color: var(--secondary-text-color); }
  .rpc-nav-toggle {
    margin-left: auto; font-size: 0.72rem; background: none; border: none;
    color: var(--primary-color); cursor: pointer; padding: 2px 4px;
  }
  .rpc-nav-factors { display: flex; flex-direction: column; gap: 4px; margin-top: 8px; }
  .rpc-nav-factor { display: flex; justify-content: space-between; font-size: 0.8rem; }
  .rpc-nav-factor-label { color: var(--secondary-text-color); }
  .rpc-nav-factor-value { font-weight: 600; font-variant-numeric: tabular-nums; }
  .rpc-health-score-band  { font-size: 0.75rem; font-weight: 600; }
  /* v2.2.0 F2/F3 — plain status + trend */
  .rpc-health-trend { font-size: 0.75rem; font-weight: 600; margin-left: 8px; }
  .rpc-health-trend--calibrating { color: var(--secondary-text-color); font-weight: 400; font-style: italic; }
  .rpc-health-plain-status { font-size: 0.82rem; margin: 2px 0 6px; }
  .rpc-health-recommendation { font-size: 0.78rem; color: var(--secondary-text-color); margin-top: 1px; }
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
  /* v2.2.0 F1 — Why? explanation */
  .rpc-explain-btn { background: none; border: 1px solid var(--divider-color, #e5e7eb); border-radius: 10px;
    color: var(--secondary-text-color); font-size: 0.72rem; padding: 1px 8px; cursor: pointer; }
  .rpc-explain-btn:hover { border-color: var(--primary-color); color: var(--primary-color); }
  .rpc-explain-panel { width: 100%; margin: 4px 0 4px 20px; padding: 6px 10px; font-size: 0.78rem;
    background: var(--rpc-panel-bg, rgba(0,0,0,.03)); border-radius: 8px; }
  .rpc-explain-panel--muted { color: var(--secondary-text-color); }
  .rpc-explain-reason { font-weight: 600; }
  .rpc-explain-lifted { color: var(--secondary-text-color); margin-top: 2px; }
  .rpc-explain-rec { color: var(--secondary-text-color); margin-top: 2px; }
  /* v2.2.0 F4 — path replay */
  .rpc-replay-panel { width: 100%; margin: 4px 0 4px 20px; padding: 6px 10px; font-size: 0.78rem;
    background: var(--rpc-panel-bg, rgba(0,0,0,.03)); border-radius: 8px; line-height: 1.7; }
  .rpc-replay-step { white-space: nowrap; }
  .rpc-replay-time { color: var(--secondary-text-color); font-variant-numeric: tabular-nums; margin-right: 3px; }
  /* v2.3.0 MISSION-MAP — coverage replay. Button reuses .rpc-explain-btn styling
     (same visual family as Why?/Route) via a shared class on the element. */
  .rpc-map-panel { width: 100%; margin: 4px 0 4px 20px; padding: 6px 10px; font-size: 0.78rem;
    background: var(--rpc-panel-bg, rgba(0,0,0,.03)); border-radius: 8px; }
  .rpc-map-svg { display: block; background: var(--rpc-map-bg, #fafafa); border-radius: 6px; }
  .rpc-map-room { fill: none; stroke: var(--divider-color, #d1d5db); stroke-width: 1.5; }
  .rpc-map-dot { fill: var(--rpc-map-dot-colour, #2d9c4f); fill-opacity: 0.55; stroke: none; }
  /* v2.2.0 A2/A3 */
  .rpc-lifetime-dirt { margin-top: 2px; }
  .rpc-dock-health { font-size: 0.82rem; }
  /* v3.0 — Prime station and parts */
  .rpc-dock-line { font-size: 0.82rem; margin-top: 2px; }
  .rpc-dock-line--warn { color: var(--rpc-amber); }
  .rpc-dock-actions { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 6px; }
  .rpc-dock-actions .rpc-btn { width: auto; flex: 0 0 auto; margin: 0; padding: 5px 12px; font-size: 0.8rem; }
  .rpc-part-value { font-size: 0.78rem; color: var(--secondary-text-color); min-width: 72px; text-align: right; white-space: nowrap; }
  .rpc-dock-label { font-size: 0.7rem; font-weight: 700; letter-spacing: .06em; color: var(--secondary-text-color); margin-bottom: 2px; }
  .rpc-dock-tank { margin-bottom: 2px; }
  .rpc-dock-counters { color: var(--secondary-text-color); font-size: 0.78rem; }
  .rpc-dock-lifetime-note { opacity: .7; }
  /* v2.3.0 — Rooms-Overdue widget */
  .rpc-rooms-overdue { font-size: 0.82rem; }
  .rpc-rooms-overdue-row { margin-bottom: 2px; }
  .rpc-rooms-overdue-row--muted { color: var(--secondary-text-color); }
  .rpc-rooms-overdue-daily { color: var(--secondary-text-color); font-size: 0.78rem; margin-top: 2px; }
  /* v2.3.0 — Dirt correlation widget */
  .rpc-dirt-corr { font-size: 0.82rem; }
  .rpc-dirt-corr-row { margin-bottom: 2px; }
  .rpc-dirt-corr-row--muted { color: var(--secondary-text-color); font-size: 0.78rem; }
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
  /* v2.2.0 B1 — resolved-error info line: informational, deliberately unalarming */
  .rpc-last-error-info { font-size: 0.78rem; color: var(--secondary-text-color); margin: 4px 0 8px; }

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
  /* A3 — Favourites row */
  .rpc-fav-section { margin-top: 8px; }
  .rpc-fav-label {
    font-size: 0.72rem; font-weight: 600; text-transform: uppercase;
    letter-spacing: 0.04em; color: var(--secondary-text-color); margin: 6px 0 6px;
  }
  .rpc-fav-row { display: flex; flex-wrap: wrap; gap: 6px; }
  .rpc-fav-btn {
    font-size: 0.8rem; padding: 6px 12px; border-radius: 16px;
    border: 1px solid var(--divider-color, rgba(0,0,0,.12));
    background: var(--card-background-color, #fff);
    color: var(--primary-text-color); cursor: pointer;
  }
  .rpc-fav-btn:hover { border-color: var(--primary-color); color: var(--primary-color); }
  .rpc-fav-btn:active { transform: scale(0.97); }
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
  /* v2.5.0 F11 (#20): the wrapper is the grid's content box — aspect ratio
     and a 70vh height cap come inline from coverageFrameStyles() — so a wide
     desktop column no longer scales the map past the screen, and the
     transparent part of the square picture is cropped. Every overlay (pins,
     rooms, zones) is positioned in % of this same box. */
  .rpc-coverage-image-wrap {
    position: relative; margin: 0 auto; overflow: hidden; border-radius: 8px;
  }
  .rpc-coverage-img { display: block; max-width: none; }
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
  /* v3.0 C — Map tab on the rooms map */
  .rpc-map-wrap { position: relative; overflow: hidden; margin: 0 auto; border-radius: 8px; background: #1e1e1e; }
  .rpc-map-base { display: block; }
  .rpc-map-coverage { position: absolute; opacity: 0.75; pointer-events: none; mix-blend-mode: screen; }
  .rpc-room-poly--static { cursor: default; fill-opacity: 0.04; }
  .rpc-room-label--static { cursor: default; opacity: 0.85; }
  .rpc-map-robot {
    position: absolute; width: 12px; height: 12px; transform: translate(-50%, -50%);
    border-radius: 50%; background: var(--primary-color, #2563eb); border: 2px solid #fff;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, .3); pointer-events: none;
  }
  /* v3.0 A5 — wide card: map column | header + tabs */
  .rpc-two-col { display: grid; grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr); gap: 20px; align-items: start; }
  .rpc-col-map { position: sticky; top: 0; }
  /* narrow card: full-width action buttons */
  @container rpc (max-width: 340px) {
    .rpc-actions .rpc-btn { flex: 1 1 100%; }
    .rpc-metrics-row { gap: 12px; }
  }
  /* v3.0 A4 — card diagnostics */
  .rpc-diag { font-size: 0.78rem; margin: 6px 0 4px; }
  .rpc-diag-head { color: var(--secondary-text-color); margin-bottom: 6px; line-height: 1.5; }
  .rpc-diag-table { width: 100%; border-collapse: collapse; margin-bottom: 6px; }
  .rpc-diag-table td { padding: 2px 4px; border-bottom: 1px solid var(--divider-color); vertical-align: top; }
  .rpc-diag-table td:first-child, .rpc-diag-table td:last-child { white-space: nowrap; }
  .rpc-diag-table code { font-size: 0.72rem; overflow-wrap: anywhere; }
  .rpc-diag-missing td { color: var(--secondary-text-color); }
  .rpc-diag-derived { color: var(--secondary-text-color); margin-bottom: 8px; }
  .rpc-map-layers { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
  .rpc-map-floor { margin-bottom: 8px; }
  .rpc-room-label--selected {
    background: var(--primary-color, #2563eb); color: #fff;
  }
  /* v2.3.0 ZONE-OVERLAY / F24 */
  .rpc-legend-swatch { display: inline-block; width: 10px; height: 10px; vertical-align: middle; }
  .rpc-legend-observed { border-radius: 50%; background: var(--rpc-amber, #d97706); opacity: 0.6; }
  .rpc-legend-keepout {
    background: rgba(220, 38, 38, 0.12); border: 1px dashed var(--rpc-red, #dc2626);
  }
  .rpc-zone-observed {
    fill: var(--rpc-amber, #d97706); fill-opacity: 0.5; stroke: none;
  }
  .rpc-zone-keepout {
    fill: var(--rpc-red, #dc2626); fill-opacity: 0.12;
    stroke: var(--rpc-red, #dc2626); stroke-opacity: 0.6; stroke-width: 0.4;
    stroke-dasharray: 2 1;
  }
  .rpc-door-marker {
    position: absolute; transform: translate(-50%, -50%);
    font-size: 0.85rem; pointer-events: none;
  }
  .rpc-furniture-shadow {
    position: absolute; transform: translate(-50%, -50%);
    width: 10px; height: 10px; border-radius: 2px;
    background: var(--secondary-text-color); opacity: 0.35;
    pointer-events: none;
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
  /* v2.1.0 A4 — current-room line */
  .rpc-current-room  { font-size: 0.80rem; color: var(--secondary-text-color); margin-top: 4px; padding-left: 2px; }
  /* v2.1.0 A1 — connectivity indicator (only rendered when degraded) */
  .rpc-connectivity-degraded {
    font-size: 0.68rem; font-weight: 600; color: var(--rpc-amber);
    border: 1px solid var(--rpc-amber); border-radius: 4px;
    padding: 1px 5px; margin-left: 6px; white-space: nowrap;
  }
  /* v2.1.0 A2 — firmware badge (24h after a firmware change) */
  .rpc-firmware-badge {
    font-size: 0.68rem; font-weight: 600;
    color: var(--rpc-green, #4caf50);
    border: 1px solid var(--rpc-green, #4caf50); border-radius: 4px;
    padding: 1px 5px; margin-left: 6px; white-space: nowrap;
  }

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
  /* v2.5.0 FLEET-1 — fleet-health rollup line + per-robot attention badge */
  .rpc-household-fleet-health { font-size: 0.78rem; padding: 2px 0 6px; font-weight: 500; }
  .rpc-household-fleet-ok     { color: var(--rpc-green); }
  .rpc-household-fleet-warn   { color: var(--rpc-amber); }
  .rpc-household-attention    { color: var(--rpc-amber); cursor: default; }
  /* v2.5.0 — household view loading skeleton, same pulse timing as
     renderSkeletonHeatmap()'s .rpc-skel (heatmap.ts), reimplemented here
     for plain HTML bars rather than SVG rects. */
  @keyframes rpc-skel-pulse { 0%,100% { opacity: .35 } 50% { opacity: .7 } }
  .rpc-household-skel-row { animation: rpc-skel-pulse 1.5s ease-in-out infinite; }
  .rpc-skel-bar { display: inline-block; height: 10px; border-radius: 3px; background: var(--rpc-grey-light, #e5e7eb); }
  .rpc-skel-bar--name { width: 70px; }
  .rpc-skel-bar--pct  { width: 28px; margin-left: 8px; }
  .rpc-skel-bar--meta { width: 90px; margin-left: auto; }
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
  // v2.1.0 A5 — mission-completed event subscription
  private missionEventUnsub: (() => Promise<void>) | null = null;
  private missionEventSubscribing = false;
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
  private navDetailsExpanded = false;  // A1 (v2.1.0): navigation health detail expanded
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
  private openExplain: { missionId: string; data: MissionExplain | null; error?: boolean } | null = null; // v2.2.0 F1
  private openReplay: { nMssn: number; data: MissionPath | null; error?: boolean } | null = null;         // v2.2.0 F4
  // v2.3.0 MISSION-MAP — status undefined while loading; 'absent' = honest
  // 404 (no coverage map for this mission); 'error' = 409/502/network.
  private openMissionMap: { recordId: string; data: MissionMapPayload | null; status?: 'absent' | 'error' } | null = null;
  private lifetimeExpanded = false;      // C1: lifetime stats footer expanded
  /** v3.0 C: Map tab layers switched off this session. */
  private hiddenMapLayers = new Set<MapLayer>();
  private hazards: HazardRecord[] = [];  // F7: coverage map hazard pins (fetched with history)
  private historyTab: 'calendar' | 'coverage' = 'calendar'; // F7: active tab in history zone
  private householdData: HouseholdSummary | null = null;     // F17: household summary (multi-robot only)
  private apiClient: MissionApiClient | null = null;
  /** v2.5.0: components below the card's minimum (version-check.ts). */
  private versionProblems: VersionProblem[] = [];
  /** v3.0 A4: for the card diagnostics. */
  private integrationVersion: string | null = null;
  private diagOpen = false;
  private diagCopied = false;
  private versionCheckStarted = false;
  private prevVacuumState  = '';
  private prevMissionActive = '';   // tracks binary_sensor.*_mission_active across updates

  // Tap-outside close
  private readonly handleOutsideClick = (e: Event): void => {
    const path = e.composedPath();
    if (!path.includes(this)) {
      let changed = false;
      if (this.openPopover !== null) { this.openPopover = null; changed = true; }
      if (this.openMaintPopover !== null) { this.openMaintPopover = null; changed = true; }
      if (this.openDay !== null)     { this.openDay = null; this.dayMissions = null; this.openDaySummary = null; this.openExplain = null; this.openReplay = null; this.openMissionMap = null; changed = true; }
      if (changed) this.render();
    }
  };

  /** v3.0 A5: card width ≥ WIDE_PX — map column beside the content. */
  private wide = false;
  /** v3.0: last markup written, to skip identical re-renders. */
  private lastHtml = '';
  private resizeObserver: ResizeObserver | null = null;

  constructor() {
    super();
    this.root = this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    document.addEventListener('click', this.handleOutsideClick);
    // B3 (v2.1.0): delegated listeners on the persistent ShadowRoot. Registered
    // once here; they survive every innerHTML rebuild of .rpc-card, so render()
    // no longer re-attaches per-element handlers.
    this.root.addEventListener('click', this.handleDelegatedClick);
    this.root.addEventListener('change', this.handleDelegatedChange);
    this.root.addEventListener('keydown', this.handleDelegatedKeydown);
    // v3.0 A5: two columns on a wide card. Observed, not a media query —
    // the card's own width counts (a sections dashboard column, a panel
    // view), not the window's.
    if (typeof ResizeObserver !== 'undefined' && !this.resizeObserver) {
      this.resizeObserver = new ResizeObserver(entries => {
        const w = entries[0]?.contentRect?.width ?? 0;
        const wide = isWideCard(w, this.wide);
        if (wide !== this.wide) {
          this.wide = wide;
          if (this._hass && this.config) this.render();
        }
      });
      this.resizeObserver.observe(this);
    }
  }

  disconnectedCallback() {
    document.removeEventListener('click', this.handleOutsideClick);
    this.root.removeEventListener('click', this.handleDelegatedClick);
    this.root.removeEventListener('change', this.handleDelegatedChange);
    this.root.removeEventListener('keydown', this.handleDelegatedKeydown);
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;
    // v2.1.0 A5: tear down the mission-completed subscription
    if (this.missionEventUnsub) {
      this.missionEventUnsub().catch(() => { /* ignore teardown errors */ });
      this.missionEventUnsub = null;
    }
    this.missionEventSubscribing = false;
    this.clearAllTimers();
  }

  /** B7 (v2.1.0): single source of truth for timer cleanup. Both
   *  disconnectedCallback and the robot-switch reset call this, so a newly
   *  added timer only needs to be listed here once — no risk of one call site
   *  being forgotten. Named fields are retained (several are read back
   *  individually elsewhere); this only de-duplicates teardown. */
  private clearAllTimers(): void {
    [this.locateTimer, this.actionResetTimer, this.cleanTimeoutTimer,
     this.holdTooltipTimer, this.alertCollapseTimer].forEach(t => { if (t !== null) clearTimeout(t); });
    this.locateTimer = this.actionResetTimer = this.cleanTimeoutTimer = null;
    this.holdTooltipTimer = this.alertCollapseTimer = null;
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

    this.lastHtml = '';
    this.root.innerHTML = `<style>${STYLES}</style><div class="rpc-card" style="padding:16px;color:var(--secondary-text-color,#9ca3af);font-size:.85rem">Loading…</div>`;
    // v3.0: a config edit with hass already set renders right away — it
    // used to wait for the next watched entity change, showing "Loading…".
    if (this._hass) this.render();
  }

  set hass(hass: HomeAssistant) {
    // Compute relevance BEFORE updating reference so we can diff old vs new
    // v2.5.0: some ids are resolved from what exists (entity-ids.ts), so the
    // watch list is taken from BOTH snapshots — an entity that just appeared
    // (or vanished) counts as a change.
    const relevant = Array.from(new Set([
      ...relevantEntityIds(this._hass, this.robotName, this.activeRobot, this.config.robot_selector_helper),
      ...relevantEntityIds(hass, this.robotName, this.activeRobot, this.config.robot_selector_helper),
    ]));
    // v3.0: last_updated too — it moves on an attribute-only change
    // (last_changed does not), and 3.0 reads attributes that change without
    // the state: the vacuum's favourites, cleaning mode and dock activity,
    // the Prime room select's floors, the start check's reason.
    const changed = !this._hass || anyEntityChanged(this._hass, hass, relevant);

    // Always update the hass reference — mission detection and apiClient need current data
    const prev = this._hass;
    this._hass = hass;

    // Sync passes chip to entity state — but never overwrite an optimistic update in-flight
    const passesEntity = robot(hass, this.robotName).st('select', 'cleaning_passes');
    if (passesEntity && !this.isSendingClean && !this.passSettingInFlight) {
      this.passes = OPTION_TO_CHIP[passesEntity.state] ?? 'Auto';
    }

    // History refresh on mission completion.
    // v1.9+: use binary_sensor.*_mission_active (on→off = mission truly finished, not just docked mid-mission).
    // Pre-1.9 fallback: cleaning→docked vacuum state transition (may fire spuriously on mid-mission recharge).
    const missionActiveId    = (robot(this._hass, this.robotName).id('binary_sensor', 'mission_active') ?? '');
    const missionActiveState = hass.states[missionActiveId]?.state ?? '';

    if (missionActiveState) {
      if (this.prevMissionActive === 'on' && missionActiveState === 'off') {
        this.loadHistory();
      }
      this.prevMissionActive = missionActiveState;
    } else {
      const vacState = hass.states[this.activeRobot]?.state ?? '';
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

    // v2.1.0 A5: subscribe to roomba_plus_mission_completed for prompt history
    // reload. Lazy (first hass with a connection), idempotent, multi-robot-safe.
    this.maybeSubscribeMissionEvents();

    // v2.5.0: minimum versions (HA 2025.5, integration 4.2) — once per card.
    this.maybeCheckVersions();

    // Render guard: skip full re-render when no relevant entity changed.
    // Always render on first call (prev is undefined) or when a relevant entity changed.
    if (!prev || changed) {
      this.render();
    }
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
    this.openExplain       = null;
    this.openReplay        = null;
    this.openMissionMap    = null;
    this.settingsPanelOpen = false;
    this.lifetimeExpanded  = false;
    this.hazards           = [];              // F7: clear pins on robot switch
    this.historyTab        = 'calendar';      // F7: reset to default tab
    this.householdData     = null;            // F17: clear household data on robot switch
    this.prevVacuumState   = '';
    this.prevMissionActive = '';
    this.alertsVisible     = false;
    this.lastAlertHtml     = '';
    this.clearAllTimers();
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

  /**
   * v2.1.0 A5 — subscribe to the integration's roomba_plus_mission_completed
   * event so history reloads promptly at mission end, instead of relying solely
   * on the binary_sensor.*_mission_active on→off transition (which only fires
   * if the card happens to be rendered and processing hass updates at that
   * instant). The state-transition trigger remains as a fallback and for
   * environments without a WS connection.
   *
   * - Lazy: runs on the first hass that exposes a connection.
   * - Idempotent: a subscribing flag + unsub handle prevent double-subscribe.
   * - Multi-robot-safe: filters events by entry_id against this robot's own
   *   resolved config_entry_id, so one robot's completion never reloads
   *   another's history.
   */
  /** v2.5.0: compare HA and integration with the card's minimums once; a
   *  notice appears at the top of the card only when something is below. */
  private maybeCheckVersions(): void {
    if (this.versionCheckStarted || !this._hass || typeof this._hass.callWS !== 'function') return;
    this.versionCheckStarted = true;
    const haVersion = this._hass.config?.version;
    fetchIntegrationVersion(this._hass).then(integrationVersion => {
      this.integrationVersion = integrationVersion;
      const problems = checkMinimums(haVersion, integrationVersion);
      if (problems.length > 0) {
        this.versionProblems = problems;
        this.render();
      }
    });
  }

  private maybeSubscribeMissionEvents(): void {
    if (this.missionEventUnsub || this.missionEventSubscribing) return;
    const conn = this._hass?.connection;
    if (!conn || !this.apiClient) return;

    this.missionEventSubscribing = true;
    conn.subscribeMessage<{ data?: { entry_id?: string } }>(
      (msg) => { this.onMissionCompletedEvent(msg?.data?.entry_id); },
      { type: 'subscribe_events', event_type: 'roomba_plus_mission_completed' },
    ).then((unsub) => {
      this.missionEventUnsub = unsub;
      this.missionEventSubscribing = false;
    }).catch(() => {
      // Subscription failed (old HA, permissions) — fall back to the
      // mission_active transition trigger silently.
      this.missionEventSubscribing = false;
    });
  }

  /** Handle a roomba_plus_mission_completed event; reload only when it belongs
   *  to the robot this card is currently showing. */
  private async onMissionCompletedEvent(entryId?: string): Promise<void> {
    if (!this.apiClient) return;
    // Resolve our own entry_id (cached after first call) and compare.
    let myEntryId: string | null = null;
    try {
      myEntryId = await this.apiClient.getEntryId();
    } catch {
      myEntryId = null;
    }
    if (shouldReloadForEvent(myEntryId, entryId)) {
      this.loadHistory();
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
      const lang = resolveLang(this._hass.language);
      // v2.5.0 F10: a 404 no longer means "integration older than v1.8" —
      // every supported integration has these routes. It means they are not
      // registered for this robot: integration ≤ 4.2.18 registers them only
      // in the Classic setup path, so a Prime-only install has none.
      this.historyError = status === '404'
        ? t(lang, 'card.historyNotAvailable')
        : t(lang, 'card.historyUnavailable');
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
    const isMetric = isMetricSystem(this._hass);

    // Wave A3 — today's mission count for status line context (local date, not UTC)
    const _td = new Date();
    const todayIso = `${_td.getFullYear()}-${String(_td.getMonth()+1).padStart(2,'0')}-${String(_td.getDate()).padStart(2,'0')}`;
    const todaySummary = this.missionData?.find(d => d.date === todayIso) ?? null;
    const todayMissionCount = todaySummary?.total ?? null;

    // v2.0: pick the default tab on first render / after a robot switch reset it to null.
    if (this.activeTab === null) {
      this.activeTab = defaultTab(this.config, caps);
    }
    const tabs = availableTabs(this.config, caps, resolveLang(this._hass.language));
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
      activeRobot: this.activeRobot,
      isSendingClean: this.isSendingClean,
      sendError: this.sendError,
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
    // v3.0 A5: a wide card (≥ 700 px, measured by the ResizeObserver set up
    // in connectedCallback) shows the map in its own column next to the
    // header and tabs; the Map tab leaves the tab bar then. activeTab is
    // kept, so narrowing the card again returns to the map if it was open.
    const twoCol   = this.wide && this.viewMode !== 'household' && tabs.some(tb => tb.id === 'map');
    const barTabs  = twoCol ? tabs.filter(tb => tb.id !== 'map') : tabs;
    const panelTab: TabId | null = twoCol && this.activeTab === 'map' ? (barTabs[0]?.id ?? null) : this.activeTab;
    const tabBarHtml = renderTabBar(barTabs, panelTab, badges);

    const tabCtx: TabContentContext = {
      hass: this._hass, config: this.config, caps, robotName: this.robotName, isMetric,
      missionData: this.missionData, historyLoading: this.historyLoading, historyError: this.historyError,
      openDay: this.openDay, dayMissions: this.dayMissions, openDaySummary: this.openDaySummary,
      openExplain: this.openExplain, openReplay: this.openReplay, openMissionMap: this.openMissionMap,
      lifetimeExpanded: this.lifetimeExpanded, historyTab: this.historyTab, hazards: this.hazards,
      selectedRooms: this.selectedRooms, hiddenMapLayers: this.hiddenMapLayers,
      openPopover: this.openPopover, resetting: this.resetting, resetError: this.resetError,
      legendShown: this.legendShown, healthDetailsExpanded: this.healthDetailsExpanded,
      openMaintPopover: this.openMaintPopover, navDetailsExpanded: this.navDetailsExpanded,
      holdTooltipVisible: this.holdTooltipVisible, holdToggling: this.holdToggling,
      settingsPanelOpen: this.settingsPanelOpen, isSendingClean: this.isSendingClean,
      sendError: this.sendError, passes: this.passes,
      maintenanceLinksHtml: this.renderMaintenanceLinks(caps),
      diagnosticsHtml: panelTab === 'settings'
        ? renderDiagnostics(this.diagOpen ? diagnosticsData(this._hass, this.robotName, this.integrationVersion) : null,
            this.diagOpen, this.diagCopied, resolveLang(this._hass.language))
        : '',
      alertZoneHtml,
    };
    const tabContentHtml = renderTabContent(panelTab, tabCtx);
    const mapColumnHtml  = twoCol ? renderTabContent('map', { ...tabCtx, mapColumn: true }) : '';

    // v2.0: household view replaces header + tabs entirely rather than
    // appending the household zone as a permanent footer below every tab —
    // it's a distinct view the robot selector switches into, not a status
    // strip that's always present.
    // v2.5.0: historyLoading already covers the household fetch (it runs
    // inside the same loadHistory() call, same flag) — reused here rather
    // than adding a second loading flag. Previously, switching into this
    // view before the fetch resolved showed only the "← Back" chip with a
    // blank area below it; now shows a pulsing skeleton matching the
    // History tab's own renderSkeletonHeatmap() pattern. If the fetch
    // finishes and householdData is still null (e.g. integration too old
    // for this endpoint), the view intentionally goes back to rendering
    // nothing beyond "← Back" — same graceful degradation as before, not
    // a new error message: a 404 from an old integration isn't a failure
    // to alarm about, just a feature this version doesn't have.
    const householdBodyHtml = this.viewMode === 'household' && this.historyLoading && !this.householdData
      ? renderHouseholdSkeleton(this._hass)
      : renderHouseholdZone(this._hass, this.config, caps, this.householdData, isMetric);

    const bodyHtml = this.viewMode === 'household'
      ? `
        <button class="rpc-household-back" data-household-back>← Back</button>
        ${householdBodyHtml}
      `
      : twoCol
      ? `
        <div class="rpc-two-col">
          <div class="rpc-col-map">${mapColumnHtml}</div>
          <div class="rpc-col-main">
            ${headerHtml}
            ${roomPickerHtml}
            ${tabBarHtml}
            <div class="rpc-tab-panel">
              ${tabContentHtml}
            </div>
          </div>
        </div>
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
        ${renderVersionNotice(this.versionProblems, resolveLang(this._hass.language))}
        ${bodyHtml}
      </div>
    `;

    // v3.0: unchanged output → leave the DOM alone. The render guard now
    // also reacts to attribute-only changes (a tracker pose every few
    // seconds), and rebuilding identical markup would close an open
    // <select>, drop keyboard focus and restart animations each time.
    if (html === this.lastHtml) return;
    this.lastHtml = html;
    this.root.innerHTML = html;
    // B3 (v2.1.0): no per-render listener re-attach — delegated handlers on
    // this.root (registered in connectedCallback) cover all interactions.
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
    if (!caps.hasMaintenanceCalendar && !robot(this._hass, this.robotName).st('sensor', 'battery_capacity_retention')) return '';

    const lang = resolveLang(this._hass.language);
    const n = this.robotName;
    const rows: { label: string; service: string; tsEntityId: string }[] = [];
    if (robot(this._hass, n).st('sensor', 'wheel_last_cleaned'))
      rows.push({ label: t(lang, 'card.maintWheelCleaning'),   service: 'roomba_plus.reset_wheel_cleaning',   tsEntityId: (robot(this._hass, n).id('sensor', 'wheel_last_cleaned') ?? '') });
    if (robot(this._hass, n).st('sensor', 'contact_last_cleaned'))
      rows.push({ label: t(lang, 'card.maintContactCleaning'), service: 'roomba_plus.reset_contact_cleaning', tsEntityId: (robot(this._hass, n).id('sensor', 'contact_last_cleaned') ?? '') });
    if (robot(this._hass, n).st('sensor', 'bin_last_cleaned'))
      rows.push({ label: t(lang, 'card.maintBinCleaning'),     service: 'roomba_plus.reset_bin_cleaning',     tsEntityId: (robot(this._hass, n).id('sensor', 'bin_last_cleaned') ?? '') });
    if (robot(this._hass, n).st('sensor', 'battery_capacity_retention'))
      rows.push({ label: t(lang, 'card.maintBatteryBaseline'), service: 'roomba_plus.reset_battery',          tsEntityId: (robot(this._hass, n).id('sensor', 'battery_last_replaced') ?? '') });

    if (rows.length === 0) return '';

    return `
      <div class="rpc-settings-divider"></div>
      <div class="rpc-zone-header">${t(lang, 'card.maintenanceLabel')}</div>
      ${rows.map(r => {
        const tsEntity = this._hass.states[r.tsEntityId];
        const recorded = !!tsEntity && tsEntity.state !== 'unavailable' && tsEntity.state !== 'unknown';
        const lastReset = recorded
          ? t(lang, 'card.resetTime', { time: timeSince(tsEntity!.state, this._hass.language) })
          : t(lang, 'health.maintNeverRecorded');
        return `
          <div class="rpc-maint-link-row">
            <span class="rpc-maint-link-label">${r.label}</span>
            <span class="rpc-maint-link-service">${r.service}</span>
          </div>
          <div class="rpc-maint-link-lastreset">${lastReset}</div>
        `;
      }).join('')}
      <div class="rpc-maint-link-hint">${t(lang, 'card.triggerViaDevTools')}</div>
    `;
  }

  /** F3: Renders the robot selector dropdown bar when entities[] has 2+ entries.
   *  v2.0: also offers a "📊 Household summary" option that switches the
   *  whole card into the combined household view (renderRobotSelectorBar
   *  itself stays visible in that mode so the user can switch back). */
  private renderRobotSelectorBar(): string {
    const list = this.entityList();
    if (list.length < 2) return '';
    const lang = resolveLang(this._hass.language);
    const options = list.map(id => {
      const name = this._hass.states[id]?.attributes?.['friendly_name'] as string ?? id;
      const sel  = this.viewMode === 'robot' && id === this.activeRobot ? ' selected' : '';
      return `<option value="${esc(id)}"${sel}>${esc(name)}</option>`;
    }).join('');
    const householdSel = this.viewMode === 'household' ? ' selected' : '';
    return `
      <div class="rpc-robot-selector">
        <select class="rpc-robot-select" data-robot-select>
          <optgroup label="${t(lang, 'card.myRobots')}">${options}</optgroup>
          <optgroup label="${t(lang, 'card.viewLabel')}">
            <option value="__household__"${householdSel}>${t(lang, 'card.householdSummary')}</option>
          </optgroup>
        </select>
      </div>`;
  }


  // ─────────────────────────────────────────────────────────────────────────
  // B3 (v2.1.0) — Delegated event handling.
  //
  // Three listeners on this.root (registered once in connectedCallback) replace
  // the former ~22 per-element listener groups that were re-attached on every
  // render. resolveClick()/resolveKeydownTarget() (pure, unit-tested in
  // tests/delegation.test.ts) map a clicked element to an action key; the
  // switch below carries the original handler bodies verbatim.
  //
  // Outside-click closing is handled separately by handleOutsideClick on
  // document, which uses composedPath().includes(this) — it does not depend on
  // propagation being stopped, so the per-handler stopPropagation calls are no
  // longer needed. One stopPropagation at the top guards against nested
  // re-dispatch within the shadow root.
  // ─────────────────────────────────────────────────────────────────────────

  private readonly handleDelegatedClick = (e: Event): void => {
    const target = e.target as Element | null;
    const hit = resolveClick(target);
    if (!hit) return;
    e.stopPropagation();
    this.dispatchClick(hit.key, hit.el);
  };

  private readonly handleDelegatedChange = (e: Event): void => {
    const el = (e.target as Element | null)?.closest('[data-robot-select]') as HTMLSelectElement | null;
    if (!el) return;
    e.stopPropagation();
    const value = el.value;
    if (value === '__household__') {
      this.viewMode = 'household';
      this.render();
    } else {
      this.viewMode = 'robot';
      this.switchRobot(value);
    }
  };

  private readonly handleDelegatedKeydown = (e: Event): void => {
    const ke = e as KeyboardEvent;
    if (ke.key !== 'Enter' && ke.key !== ' ') return;
    const hit = resolveKeydownTarget(e.target as Element | null);
    if (!hit) return;
    e.preventDefault();
    e.stopPropagation();
    this.dispatchClick(hit.key, hit.el);
  };

  /** Run the action body for a resolved click/keydown target. */
  private dispatchClick(key: ClickActionKey, el: Element): void {
    const ds = (el as HTMLElement).dataset;

    // R2: pure UI-state cases go through the tested reducer; the shell computes
    // the two impure inputs (wear-legend presence, day summary/missions) and
    // applies the returned patch, then renders once.
    if (isPureClickKey(key)) {
      const payload: ClickPayload = {
        room: ds.room ?? ds.roomPoly ?? ds.roomLabel,
        tab: ds.tab,
        bar: ds.bar,
        maint: ds.maint,
        historyTab: ds.historyTab as 'calendar' | 'coverage' | undefined,
      };
      if (key === 'heatmap-cell') {
        const date = (el as HTMLElement).getAttribute('data-date')!;
        payload.date = date;
        if (this.openDay !== date) {
          payload.daySummaryForDate = this.missionData?.find(d => d.date === date) ?? null;
          payload.dayMissionsForDate = this.buildDayMissions(date);
        }
      }
      const patch = clickReducer(key, this as unknown as ClickState, payload);
      Object.assign(this, patch);
      this.render();
      // 'bar' legend-shown is decided AFTER render, against the freshly-drawn
      // DOM — the legend element only exists once the popover is open. Matches
      // the original dispatchClick timing (render → then query → then flip).
      if (key === 'bar' && !this.legendShown && this.root.querySelector('[data-wear-legend]')) {
        this.legendShown = true;
      }
      return;
    }

    // Effectful cases — service calls / async — stay imperative.
    switch (key) {
      case 'action':
        this.handleAction(ds.action!);
        return;

      case 'pass': {
        const chipLabel = ds.pass!;
        const option    = ds.passOption!;
        this.passes = chipLabel;
        this.render();
        const selectId = (robot(this._hass, this.robotName).id('select', 'cleaning_passes') ?? '');
        if (this._hass.states[selectId]) {
          this.passSettingInFlight = true;
          this._hass.callService('select', 'select_option', { entity_id: selectId, option })
            .catch(() => { /* non-fatal */ })
            .finally(() => { this.passSettingInFlight = false; });
        }
        return;
      }

      case 'reset': {
        const key     = ds.reset!;
        const service = ds.service!;
        this.resetting  = key;
        this.resetError = null;
        this.render();
        (async () => {
          try {
            await this._hass.callService('roomba_plus', service, { entity_id: this.activeRobot });
            await new Promise(r => setTimeout(r, 800)); // brief delay so sensor state refreshes
            // Bug-hunt round 1: only close the popover THIS reset action
            // lives inside (retention/bar resets share their key with
            // their own popover's openPopover value by construction) —
            // not any unrelated popover that happens to be open elsewhere.
            // Without this check, a reset button living inline (no
            // popover of its own, e.g. v2.3.0's "Clean overdue") would
            // unconditionally close whatever unrelated popover was open
            // on the same tab.
            if (this.openPopover === key) this.openPopover = null;
          } catch {
            this.resetError = key;
          } finally {
            this.resetting = null;
            this.render();
          }
        })();
        return;
      }

      case 'hold-action': {
        if (ds.holdAction === 'tooltip') {
          this.holdTooltipVisible = true;
          this.render();
          if (this.holdTooltipTimer !== null) clearTimeout(this.holdTooltipTimer);
          this.holdTooltipTimer = setTimeout(() => {
            this.holdTooltipVisible = false;
            this.holdTooltipTimer   = null;
            this.render();
          }, 3000);
        } else {
          const switchId = (robot(this._hass, this.robotName).id('switch', 'schedule_hold') ?? '');
          const isOn     = this._hass.states[switchId]?.state === 'on';
          this.holdToggling = true;
          this.render();
          this._hass.callService('switch', isOn ? 'turn_off' : 'turn_on', { entity_id: switchId })
            .catch(() => { /* non-fatal */ })
            .finally(() => { this.holdToggling = false; this.render(); });
        }
        return;
      }

      case 'switch-entity': {
        const entityId = ds.switchEntity!;
        const isOn     = this._hass.states[entityId]?.state === 'on';
        this._hass.callService('switch', isOn ? 'turn_off' : 'turn_on', { entity_id: entityId })
          .catch(() => { /* non-fatal */ });
        return;
      }

      case 'cycle-entity': {
        const entityId = ds.cycleEntity!;
        // B6 (v2.1.0): defensive parse — malformed data-cycle-options must not
        // throw the whole handler.
        let options: string[] = [];
        try {
          options = JSON.parse(ds.cycleOptions ?? '[]') as string[];
        } catch {
          options = [];
        }
        const current  = ds.cycleCurrent ?? '';
        const idx      = options.indexOf(current);
        const next     = options.length > 0 ? options[(idx + 1) % options.length] : null;
        if (next) {
          this._hass.callService('select', 'select_option', { entity_id: entityId, option: next })
            .catch(() => { /* non-fatal */ });
        }
        return;
      }

      case 'fav-id': {
        // v3.0 B4: favourites from the vacuum's `favorites` attribute, both
        // generations, started through the integration's service.
        const favoriteId = ds.favId!;
        this._hass.callService('roomba_plus', 'run_favorite', {
          entity_id: this.activeRobot, favorite_id: favoriteId,
        }).catch((e: unknown) => this.showServiceError(e));
        return;
      }

      case 'diag-toggle':
        this.diagOpen = !this.diagOpen;
        this.diagCopied = false;
        this.render();
        return;

      case 'diag-copy': {
        // v3.0 A4: Markdown for an issue. Clipboard needs a secure context
        // (https or localhost); without it the text is selected in a dialog
        // so it can be copied by hand.
        const md = diagnosticsMarkdown(diagnosticsData(this._hass, this.robotName, this.integrationVersion));
        const done = () => { this.diagCopied = true; this.render(); };
        const clip = (navigator as Navigator | undefined)?.clipboard;
        if (clip?.writeText) clip.writeText(md).then(done, () => window.prompt('', md));
        else window.prompt('', md);
        return;
      }

      case 'map-layer': {
        // v3.0 C: switch a Map tab layer on/off (session only).
        const layer = ds.mapLayer as MapLayer;
        if (this.hiddenMapLayers.has(layer)) this.hiddenMapLayers.delete(layer);
        else this.hiddenMapLayers.add(layer);
        this.render();
        return;
      }

      case 'press-entity': {
        // v3.0: station actions (Prime empty bin / wash pad) — button.press.
        this._hass.callService('button', 'press', { entity_id: ds.pressEntity! })
          .catch((e: unknown) => this.showServiceError(e));
        return;
      }

      case 'fav-entity': {
        // A3 (v2.1.0): favourite routines — stateless button.press. No local
        // state to flip; fire-and-forget with non-fatal error handling.
        const entityId = ds.favEntity!;
        this._hass.callService('button', 'press', { entity_id: entityId })
          .catch(() => { /* non-fatal */ });
        return;
      }

      case 'replay': {
        // v2.2.0 F4 — same toggle/stale-guard pattern as 'explain'.
        const nMssn = parseInt((el as HTMLElement).getAttribute('data-replay')!, 10);
        if (this.openReplay?.nMssn === nMssn) {
          this.openReplay = null;
          this.render();
          return;
        }
        if (!this.apiClient) {  // R2: same forever-loading guard as 'explain'
          this.openReplay = { nMssn, data: null, error: true };
          this.render();
          return;
        }
        this.openReplay = { nMssn, data: null };
        this.render();
        this.apiClient.fetchPath(nMssn)
          .then(data => {
            if (this.openReplay?.nMssn !== nMssn) return; // stale
            this.openReplay = data === null
              ? { nMssn, data: null, error: true }
              : { nMssn, data };
            this.render();
          })
          .catch(() => {
            if (this.openReplay?.nMssn !== nMssn) return; // stale
            this.openReplay = { nMssn, data: null, error: true };
            this.render();
          });
        return;
      }

      case 'map': {
        // v2.3.0 MISSION-MAP — inline coverage replay. Same toggle/stale-guard
        // pattern as 'explain'/'replay', but the fetch result is three-way
        // (ok/absent/error) rather than boolean-error — 'absent' (404) is a
        // real, calm answer ("no coverage map for this mission" — the
        // known-open lewis/i-series case), not a failure state.
        const recordId = (el as HTMLElement).getAttribute('data-map')!;
        if (this.openMissionMap?.recordId === recordId) {
          this.openMissionMap = null;
          this.render();
          return;
        }
        if (!this.apiClient) {  // R2: same forever-loading guard as 'explain'/'replay'
          this.openMissionMap = { recordId, data: null, status: 'error' };
          this.render();
          return;
        }
        this.openMissionMap = { recordId, data: null };
        this.render();
        this.apiClient.fetchMissionMap(recordId)
          .then(result => {
            if (this.openMissionMap?.recordId !== recordId) return; // stale
            this.openMissionMap = result.status === 'ok'
              ? { recordId, data: result.data }
              : { recordId, data: null, status: result.status };
            this.render();
          })
          .catch(() => {
            if (this.openMissionMap?.recordId !== recordId) return; // stale
            this.openMissionMap = { recordId, data: null, status: 'error' };
            this.render();
          });
        return;
      }

      case 'explain': {
        // v2.2.0 F1 — inline "Why?" explanation. Toggle-off when the same
        // mission's panel is already open; otherwise show the loading panel
        // immediately, then patch in the fetched result. A stale response
        // (user tapped a different mission, or closed the popover, before
        // the fetch resolved) is dropped by re-checking the open missionId.
        const missionId = (el as HTMLElement).getAttribute('data-explain')!;
        if (this.openExplain?.missionId === missionId) {
          this.openExplain = null;
          this.render();
          return;
        }
        // R2: without an apiClient the optional-chained fetch would never
        // resolve and the panel would show "Analysing…" forever.
        if (!this.apiClient) {
          this.openExplain = { missionId, data: null, error: true };
          this.render();
          return;
        }
        this.openExplain = { missionId, data: null };
        this.render();
        this.apiClient.fetchExplain(missionId)
          .then(data => {
            if (this.openExplain?.missionId !== missionId) return; // stale
            this.openExplain = data === null
              ? { missionId, data: null, error: true }
              : { missionId, data };
            this.render();
          })
          .catch(() => {
            if (this.openExplain?.missionId !== missionId) return; // stale
            this.openExplain = { missionId, data: null, error: true };
            this.render();
          });
        return;
      }
    }
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
    // R3: pure classification → named imperative runner. Bodies below are the
    // verbatim original handleAction branches.
    const plan = planAction(action);
    switch (plan.kind) {
      case 'toggle-room-picker':
        // header "Rooms…" toggle — local UI state, no service call
        this.roomPickerOpen = !this.roomPickerOpen;
        this.render();
        return;
      case 'clean-selected': return this.runCleanSelected();
      case 'repeat-last':    return this.runRepeatLast();
      case 'vacuum':         return this.runVacuumAction(plan.domain, plan.service, plan.action, plan.pulse);
      case 'noop':           return;
    }
  }

  /** v3.0: a refused favourite or station action says why (the
   *  integration's translated reason — robot offline, favourite not found)
   *  in the header's error line instead of nothing. */
  private showServiceError(e: unknown): void {
    const msg = (e as { message?: unknown } | null)?.message;
    const text = typeof msg === 'string' && msg.trim() !== ''
      ? msg : t(resolveLang(this._hass.language), 'card.sendCommandUnclear');
    this.sendError = text;
    this.render();
    // Not for ever: gone after a while unless something replaced it.
    setTimeout(() => { if (this.sendError === text) { this.sendError = null; this.render(); } }, 10000);
  }

  /** Clean the currently selected rooms (verbatim from original handleAction). */
  private async runCleanSelected(): Promise<void> {
    const entity = this.activeRobot;
    const n = this.robotName;
    const lang = resolveLang(this._hass.language);

    this.isSendingClean = true;
    this.sendError      = null;
    this.render();

    const rooms = Array.from(this.selectedRooms);

    // Safety 8s timeout
    this.cleanTimeoutTimer = setTimeout(() => {
      this.isSendingClean    = false;
      this.sendError         = t(lang, 'card.sendCommandUnclear');
      this.cleanTimeoutTimer = null;
      this.render();
    }, 8000);

    try {
      // Set cleaning passes via select entity first (spec: "Tapping calls select.select_option")
      const passesId = (robot(this._hass, n).id('select', 'cleaning_passes') ?? '');
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
    } catch (e: unknown) {
      if (this.cleanTimeoutTimer !== null) { clearTimeout(this.cleanTimeoutTimer); this.cleanTimeoutTimer = null; }
      this.isSendingClean = false;
      // v2.5.0: show the integration's own (translated) reason when HA sent
      // one — "Unknown room(s): …" is actionable, "unclear" is not.
      const msg = (e as { message?: unknown } | null)?.message;
      this.sendError      = typeof msg === 'string' && msg.trim() !== ''
        ? msg
        : t(lang, 'card.sendCommandUnclear');
    }
    this.render();
  }

  /** Repeat the last mission (verbatim from original handleAction). */
  private async runRepeatLast(): Promise<void> {
    const n = this.robotName;
    try {
      await this._hass.callService('button', 'press', { entity_id: (robot(this._hass, n).id('button', 'repeat_mission') ?? '') });
    } catch { /* silent */ }
  }

  /** Run a vacuum-domain action with the original loading/timer discipline. */
  private async runVacuumAction(domain: string, service: string, action: string, pulse: boolean): Promise<void> {
    const entity = this.activeRobot;

    this.loadingAction = action;
    this.render();

    if (pulse) {
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
    // B4 (v2.1.0): schema lives in ./config-form.ts (pure, unit-tested).
    return { schema: buildConfigFormSchema() };
  }

  static getStubConfig(hass?: HomeAssistant) { return stubConfig(hass); }

  /** v3.0 A5: sections dashboards — full width by default, never narrower
   *  than half; height follows the content. */
  getGridOptions(): { columns: number; min_columns: number } {
    return { columns: 12, min_columns: 6 };
  }
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
