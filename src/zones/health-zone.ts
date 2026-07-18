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
  /** A1 (v2.1.0): navigation health detail expanded. Session-only. */
  navDetailsExpanded: boolean;
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

  // v2.2.0 F2 (PLAIN-STATUS, integration ≥ 3.1.0) — the integration derives
  // a plain-language status_text/recommendation from the score breakdown's
  // weakest signal, ALREADY LOCALISED server-side (7 languages, keyed off
  // HA's configured language). The card displays, never interprets —
  // presence-based gating, absent attrs on ≤ 3.0.x simply render nothing.
  const statusText = entity.attributes?.status_text as string | undefined;
  const recommendation = entity.attributes?.recommendation as string | null | undefined;
  const plainStatusHtml = statusText
    ? `<div class="rpc-health-plain-status">${esc(statusText)}${
        recommendation ? `<div class="rpc-health-recommendation">${esc(recommendation)}</div>` : ''
      }</div>`
    : '';

  return `
    <div class="rpc-health-score" aria-label="Robot health ${score} out of 100, ${band}">
      <span class="rpc-health-score-label">ROBOT HEALTH</span>
      <span class="rpc-health-score-value" style="color:${colour}">${score}</span>
      <span class="rpc-health-score-band" style="color:${colour}">● ${band}</span>
      ${renderHealthTrend(hass, n)}
    </div>
    ${plainStatusHtml}
    <button class="rpc-health-details-toggle" data-health-details-toggle aria-expanded="${expanded}">
      ${expanded ? 'Hide details ▲' : 'Show details ▼'}
    </button>
  `;
}

// ── v2.2.0 F3 — health score trend (integration ≥ 3.2.0, L10) ────────────────
//
// sensor.*_health_score_trend classifies the recent trend against the robot's
// OWN learned baseline (self-calibration, same philosophy as L9-BATTERY):
// state is 'improving' | 'stable' | 'declining', or unknown while the 44-day
// baseline is still building. The v3.2.0 UX fix exposes `days_until_ready`
// precisely so the learning period is visible instead of a silent blank —
// this renders that countdown. Calibration-state invariant applies: unknown
// state is NEVER shown as zero or as an error.
//
// Scope note: layout_change_detected's missions_until_first_ready countdown
// was deliberately NOT given an always-visible line here — a permanent
// "learning…" row for a feature most users never triggered is noise. Layout
// change surfaces as an alert when it actually fires (alert-zone.ts).
function renderHealthTrend(hass: HomeAssistant, n: string): string {
  const trend = hass.states[`sensor.${n}_health_score_trend`];
  if (!trend) return '';

  if (trend.state === 'improving' || trend.state === 'stable' || trend.state === 'declining') {
    const map = {
      improving: { icon: '↗', colour: 'var(--rpc-green, #4ade80)', label: 'improving' },
      stable:    { icon: '→', colour: 'var(--secondary-text-color)', label: 'stable' },
      declining: { icon: '↘', colour: '#d97706', label: 'declining' },
    } as const;
    const t = map[trend.state];
    return `<span class="rpc-health-trend" style="color:${t.colour}" aria-label="Health trend: ${t.label}">${t.icon} ${t.label}</span>`;
  }

  // Calibrating — show the countdown the integration exposes for exactly
  // this purpose. days_until_ready is the TREND baseline's readiness (44-day
  // horizon), distinct from the score's own calibration; only rendered here,
  // attached to the trend, never mixed into the score's calibrating text.
  const daysLeft = trend.attributes?.days_until_ready;
  if (typeof daysLeft === 'number' && daysLeft > 0) {
    return `<span class="rpc-health-trend rpc-health-trend--calibrating">trend in ~${daysLeft}d</span>`;
  }
  return '';
}

// ── v2.0 C5-ANOMALY — mission anomaly banner ─────────────────────────────────
//
// Activated against integration 3.0.0: a dedicated sensor
// `sensor.*_consecutive_mission_anomalies` exposes MissionStore's internal
// `consecutive_anomalous` count as its STATE (a MEASUREMENT number), not as an
// attribute on last_mission_result (the old, never-shipped shape this code
// previously assumed).
//
// Threshold is ≥3, per the integration author's explicit intent ("two
// consecutive anomalies can be coincidence; three are a pattern").
//
// Caveat: the sensor is entity_registry_enabled_default=False — disabled until
// the user enables it. When disabled the entity is absent and this returns ''
// (no banner), which is the correct graceful behaviour.
function renderAnomalyBanner(hass: HomeAssistant, n: string): string {
  const entity = hass.states[`sensor.${n}_consecutive_mission_anomalies`];
  if (!entity) return '';
  const consecutive = Number(entity.state);
  if (!Number.isFinite(consecutive) || consecutive < 3) return '';

  return `
    <div class="rpc-anomaly-banner" role="alert">
      ⚠ Last ${consecutive} missions were anomalous — check brushes and filter
    </div>
  `;
}

// ── A1 (v2.1.0) — Navigation health detail ───────────────────────────────────
//
// Verified against integration 3.0.0. All five nav_* sensors are DIAGNOSTIC and
// disabled-by-default, so this whole element is absent unless the user enables
// them (gated on caps.hasNavStats = nav_panics OR nav_landmark_quality present).
//
// Design (signed off): the nav_quality score gets the same 0-100 ampel as the
// robot health score (it shares the 80/60 thresholds). The contributing factors
// — panics, landmark quality, good landmarks — are shown as honest labelled raw
// values, NOT graded ampels, because the good/bad thresholds for aMtrack etc.
// are not reliably known. nav_orientations is deliberately omitted (a counter
// with no actionable user interpretation). Collapsed by default.
function renderNavHealth(
  hass: HomeAssistant,
  caps: RobotCapabilities,
  n: string,
  expanded: boolean,
): string {
  if (!caps.hasNavStats) return '';

  const numOrNull = (key: string): number | null => {
    const e = hass.states[`sensor.${n}_${key}`];
    if (!e || e.state === 'unknown' || e.state === 'unavailable') return null;
    const v = Number(e.state);
    return Number.isFinite(v) ? v : null;
  };

  const score     = numOrNull('nav_quality');
  const panics    = numOrNull('nav_panics');
  const landmarkQ = numOrNull('nav_landmark_quality');
  const goodLmks  = numOrNull('nav_good_landmarks');

  // If nothing resolved (all unavailable), render nothing.
  if (score === null && panics === null && landmarkQ === null && goodLmks === null) return '';

  const scoreHtml = score !== null
    ? `<span class="rpc-nav-score-value" style="color:${healthScoreColour(score)}">${Math.round(score)}</span><span class="rpc-nav-score-max">/100</span>`
    : `<span class="rpc-nav-score-value rpc-nav-score--na">—</span>`;

  const factors: string[] = [];
  if (panics !== null) {
    factors.push(`<div class="rpc-nav-factor" title="How often navigation failed and the robot had to recover">
        <span class="rpc-nav-factor-label">Panic events</span>
        <span class="rpc-nav-factor-value">${panics}</span>
      </div>`);
  }
  if (landmarkQ !== null) {
    factors.push(`<div class="rpc-nav-factor" title="Match-tracking quality of visual landmarks (higher is better)">
        <span class="rpc-nav-factor-label">Landmark quality</span>
        <span class="rpc-nav-factor-value">${landmarkQ}</span>
      </div>`);
  }
  if (goodLmks !== null) {
    factors.push(`<div class="rpc-nav-factor" title="Number of reliable visual landmarks the robot is tracking">
        <span class="rpc-nav-factor-label">Good landmarks</span>
        <span class="rpc-nav-factor-value">${goodLmks}</span>
      </div>`);
  }

  return `
    <div class="rpc-nav-health">
      <div class="rpc-nav-header">
        <span class="rpc-nav-label">NAVIGATION</span>
        <span class="rpc-nav-score">${scoreHtml}</span>
        <button class="rpc-nav-toggle" data-nav-details-toggle aria-expanded="${expanded}">
          ${expanded ? 'Hide ▲' : 'Details ▼'}
        </button>
      </div>
      ${expanded && factors.length > 0 ? `<div class="rpc-nav-factors">${factors.join('')}</div>` : ''}
    </div>
  `;
}
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

// ── v2.2.0 A3 — dock health rollup (Clean Base / charging dock) ──────────────
//
// Four sensors, mixed gating: dock_tank_level is enabled by default
// (filter_fn: dock.tankLvl present — Clean Base with water tank only);
// dock_knockoffs / dock_charge_aborts / dock_contact_chatters are
// entity_registry_enabled_default=False diagnostics (bbchg counters,
// integration DOCK-HEALTH v2.8.0). Presence-gated per C5 precedent — the
// section renders whatever subset exists, and renders nothing at all
// (including for the 980, which has no Clean Base) when none do.
function renderDockHealth(hass: HomeAssistant, n: string): string {
  const read = (id: string): number | null => {
    const e = hass.states[id];
    if (!e || e.state === 'unknown' || e.state === 'unavailable') return null;
    const v = parseFloat(e.state);
    return isNaN(v) ? null : v;
  };
  const tank      = read(`sensor.${n}_dock_tank_level`);
  const knockoffs = read(`sensor.${n}_dock_knockoffs`);
  const aborts    = read(`sensor.${n}_dock_charge_aborts`);
  const chatters  = read(`sensor.${n}_dock_contact_chatters`);

  if (tank === null && knockoffs === null && aborts === null && chatters === null) return '';

  const tankHtml = tank !== null
    ? `<div class="rpc-dock-tank">Tank level ${Math.round(tank)}%</div>`
    : '';
  const counterParts = [
    knockoffs !== null ? `${knockoffs.toLocaleString()} knockoffs` : '',
    aborts    !== null ? `${aborts.toLocaleString()} charge aborts` : '',
    chatters  !== null ? `${chatters.toLocaleString()} contact chatters` : '',
  ].filter(Boolean);
  const countersHtml = counterParts.length
    ? `<div class="rpc-dock-counters">${counterParts.join(' · ')} <span class="rpc-dock-lifetime-note">(lifetime)</span></div>`
    : '';

  return `
    <div class="rpc-health-divider"></div>
    <div class="rpc-dock-health">
      <div class="rpc-dock-label">DOCK</div>
      ${tankHtml}
      ${countersHtml}
    </div>
  `;
}

// ── v2.3.0 — Rooms-Overdue widget (integration v3.3.0 ROOM-SCHED) ────────────
//
// Reads sensor.*_rooms_overdue directly (state = overdue count, attributes
// carry the per-room merged rule result — see MissionStore.rooms_overdue_merged
// in the integration). Zero overdue is a real, calm answer ("All rooms in
// rhythm") and is shown, not hidden — distinct from DOCK's "render nothing"
// rule, which is for genuinely absent data, not a meaningful zero value.
// v1 deliberately does not surface the configured/learned source distinction
// per room (adds visual noise for a difference most users won't act on
// differently) — revisit if field feedback wants it.
//
// v2.4.0 additions to the same block/entity (bundled together deliberately —
// same widget, same release item, precedent set by v2.3.0's Rooms-Overdue +
// Overdue-Clean pairing): the full suggested_interval_days dict (previously
// only its daily_suggested subset was surfaced) and a second trigger button
// for roomba_plus.auto_clean_dirty_rooms (SMART-ORDER) — a different signal
// (dirt index) than Clean overdue's rooms_overdue, hence its own button
// rather than folding into the existing one.
function renderRoomsOverdue(hass: HomeAssistant, caps: RobotCapabilities, n: string, state: HealthZoneState): string {
  if (!caps.hasRoomsOverdue) return '';

  const entity = hass.states[`sensor.${n}_rooms_overdue`];
  if (!entity) return '';
  // Bug-hunt round 1: an unavailable/unknown sensor must not read as "0
  // overdue" — HA clears attributes on unavailable entities, and this
  // function has no way to distinguish that from a genuine empty
  // overdue_rooms list without this explicit check. Matches the
  // established unavailable/unknown guard pattern used throughout this
  // file (renderDockHealth, maintenance calendar, health score).
  if (entity.state === 'unknown' || entity.state === 'unavailable') return '';

  const attrs = entity.attributes ?? {};
  const rooms = (attrs['rooms'] ?? {}) as Record<string, {
    days_since_last: number; expected_interval_days: number | null;
    source: string; status: string; overdue_factor: number | null;
  }>;
  const overdueRooms = Array.isArray(attrs['overdue_rooms']) ? attrs['overdue_rooms'] as string[] : [];
  const dailySuggested = Array.isArray(attrs['daily_suggested']) ? attrs['daily_suggested'] as string[] : [];

  let bodyHtml: string;
  if (overdueRooms.length === 0) {
    bodyHtml = `<div class="rpc-rooms-overdue-row rpc-rooms-overdue-row--muted">All rooms in rhythm</div>`;
  } else {
    // overdue_rooms arrives pre-sorted worst-first (overdue_factor desc) —
    // rendered in that order as-is, not re-sorted here.
    bodyHtml = overdueRooms.map(name => {
      const info = rooms[name];
      if (!info) return '';   // defensive: name in overdue_rooms but missing from rooms dict
      const days = Math.round(info.days_since_last);
      const expected = info.expected_interval_days != null ? Math.round(info.expected_interval_days) : null;
      const expectedStr = expected != null ? ` (expected ~${expected}d)` : '';
      return `<div class="rpc-rooms-overdue-row">${esc(name)} — ${days}d since last clean${expectedStr}</div>`;
    }).join('');
  }

  const dailyHtml = dailySuggested.length > 0
    ? `<div class="rpc-rooms-overdue-daily">${dailySuggested.map(esc).join(', ')} could use daily cleaning</div>`
    : '';

  // v2.4.0 — Suggested cleaning intervals (RobotProfileStore DIRT-VEL).
  // suggested_interval_days is present only once the integration has
  // enough dirt-velocity data per room — absent/empty otherwise, same
  // gate daily_suggested already assumes; was previously read only for
  // that daily_suggested subset, the full per-room dict was unused.
  // Sorted ascending (shortest suggested interval — the most actionable
  // room — first), since unlike overdue_rooms this dict carries no
  // ordering guarantee from the integration. Defensive: a malformed/
  // non-finite value is skipped rather than rendered as "every NaNd"
  // (same guard-against-malformed-cloud-data discipline used throughout
  // this project, e.g. calibration.ts's anchor-point validation).
  const suggestedIntervals = (attrs['suggested_interval_days'] ?? {}) as Record<string, unknown>;
  const suggestedEntries = Object.entries(suggestedIntervals)
    .filter((entry): entry is [string, number] => typeof entry[1] === 'number' && isFinite(entry[1]))
    .sort((a, b) => a[1] - b[1]);
  const suggestedHtml = suggestedEntries.length > 0
    ? `<div class="rpc-rooms-suggested">${suggestedEntries.map(([name, days]) =>
        `<div class="rpc-rooms-suggested-row">${esc(name)}: suggested every ${days.toFixed(1)}d</div>`
      ).join('')}</div>`
    : '';

  // v2.3.0 — "Clean overdue" trigger. Reuses the existing generic
  // data-reset/data-service mechanism (dispatchClick's 'reset' case) rather
  // than adding a bespoke click case: that handler already calls any
  // roomba_plus.* service with entity_id: activeRobot and tracks
  // loading/error by a string key. Hidden entirely when nothing is
  // overdue — the service itself no-ops safely, but showing an action
  // button for "nothing to do" is poor UX, not a safety concern.
  const isCleaning = state.resetting === 'overdue-clean';
  const cleanBtnHtml = overdueRooms.length > 0 ? `
    <button class="rpc-btn rpc-btn-secondary rpc-rooms-overdue-btn${isCleaning ? ' rpc-btn-loading' : ''}"
            data-reset="overdue-clean" data-service="clean_overdue_rooms"
            ${isCleaning ? 'disabled' : ''}>
      ${isCleaning ? '<svg class="rpc-spinner" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="3" stroke-dasharray="31 63"/></svg>' : 'Clean overdue'}
    </button>
    ${state.resetError === 'overdue-clean' ? `<div class="rpc-send-error">Couldn't start — try again</div>` : ''}
  ` : '';

  // v2.4.0 — "Auto-clean dirty rooms" trigger (integration's SMART-ORDER
  // service, the sibling of clean_overdue_rooms — same entity_id +
  // optional max_rooms schema, same generic data-reset/data-service
  // plumbing). Deliberately NOT gated on any "is something dirty" signal
  // the way Clean overdue is on overdueRooms.length: no per-room dirt-
  // index attribute is exposed to the card, and unlike
  // clean_overdue_rooms (a true no-op when nothing qualifies — verified
  // against source), auto_clean_dirty_rooms always starts a mission — a
  // whole-house clean when no room passes the dirt-index trust gate.
  // "Hide when it would no-op" therefore doesn't apply here; always shown
  // once the ROOMS block itself renders (same hasRoomsOverdue tier gate).
  // Own distinct reset key so the two buttons' loading/error states never
  // collide.
  const isAutoCleaningDirty = state.resetting === 'auto-clean-dirty';
  const autoCleanDirtyBtnHtml = `
    <button class="rpc-btn rpc-btn-secondary rpc-rooms-overdue-btn${isAutoCleaningDirty ? ' rpc-btn-loading' : ''}"
            data-reset="auto-clean-dirty" data-service="auto_clean_dirty_rooms"
            ${isAutoCleaningDirty ? 'disabled' : ''}>
      ${isAutoCleaningDirty ? '<svg class="rpc-spinner" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="3" stroke-dasharray="31 63"/></svg>' : 'Auto-clean dirty rooms'}
    </button>
    ${state.resetError === 'auto-clean-dirty' ? `<div class="rpc-send-error">Couldn't start — try again</div>` : ''}
  `;

  return `
    <div class="rpc-health-divider"></div>
    <div class="rpc-rooms-overdue">
      <div class="rpc-dock-label">ROOMS</div>
      ${bodyHtml}
      ${dailyHtml}
      ${suggestedHtml}
      ${cleanBtnHtml}
      ${autoCleanDirtyBtnHtml}
    </div>
  `;
}

// ── v2.3.0 — Dirt/sensor correlation widget (integration v3.3.0 CROSS-CORR) ──
//
// Reads sensor.*_dirt_weather_correlation directly. State is the strongest
// passing Pearson r (|r| > 0.3, n >= 30) or unknown/null below that. The
// integration supplies no interpretive prose for this sensor (unlike F2's
// plain-language health status) — only raw r/n per configured entity — so
// the card shows the numbers as-is rather than inventing directional
// language ("collects more dirt when X is high") it can't fully justify
// from a bare correlation coefficient alone. That framing is deliberately
// left to the integration's own Repair Issue, a separate HA-native surface.
function renderDirtCorrelation(hass: HomeAssistant, caps: RobotCapabilities, n: string): string {
  if (!caps.hasDirtCorrelation) return '';

  const entity = hass.states[`sensor.${n}_dirt_weather_correlation`];
  if (!entity) return '';
  // Bug-hunt round 1 (self-correction): unlike rooms_overdue, this
  // sensor's native_value legitimately returns None — HA state "unknown"
  // — whenever nothing passes the correlation threshold yet. That's the
  // NORMAL, expected "still collecting data" case this function's
  // progress display exists for, not a broken/unavailable entity. Only
  // 'unavailable' (verified against source: RoombaDirtCorrelationSensor
  // always returns a real int/float or None, never anything HA would
  // report as unavailable except a genuinely dead entity) means hide.
  if (entity.state === 'unavailable') return '';

  const attrs = entity.attributes ?? {};
  const byEntity = (attrs['by_entity'] ?? {}) as Record<string, { r: number | null; n: number }>;
  const strongestEntity = (attrs['strongest_entity'] ?? null) as string | null;

  const friendlyName = (eid: string): string =>
    (hass.states[eid]?.attributes?.friendly_name as string | undefined) ?? eid;

  let bodyHtml: string;
  const strongestInfo = strongestEntity ? byEntity[strongestEntity] : undefined;
  if (strongestEntity && strongestInfo?.r != null) {
    bodyHtml = `<div class="rpc-dirt-corr-row">Strongest link: ${esc(friendlyName(strongestEntity))} (r = ${strongestInfo.r.toFixed(2)})</div>`;
  } else {
    const entries = Object.entries(byEntity);
    if (entries.length === 0) {
      bodyHtml = `<div class="rpc-dirt-corr-row rpc-dirt-corr-row--muted">Collecting data…</div>`;
    } else {
      // v3.3.0 CROSS-CORR — _CORR_MIN_SAMPLES threshold (verified against
      // source): correlation is only computed from 30 samples onwards;
      // below that, show progress toward it rather than nothing.
      bodyHtml = entries.map(([eid, info]) => {
        const nCount = typeof info?.n === 'number' ? info.n : 0;
        return `<div class="rpc-dirt-corr-row rpc-dirt-corr-row--muted">${esc(friendlyName(eid))}: ${nCount}/30 missions</div>`;
      }).join('');
    }
  }

  return `
    <div class="rpc-health-divider"></div>
    <div class="rpc-dirt-corr">
      <div class="rpc-dock-label">DIRT CORRELATION</div>
      ${bodyHtml}
    </div>
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

  // A1 (v2.1.0): navigation health detail — independent of bars/score, like the
  // anomaly banner. Must be accounted for in the empty-tab guard below.
  const navHealthHtml = renderNavHealth(hass, caps, n, state.navDetailsExpanded);

  // v2.0: do NOT early-return when bars are empty — the health score (C1),
  // maintenance calendar (C2), and anomaly banner (C5) are independent of
  // the consumable bars and must still render if any is present, even on a
  // robot with zero filter/brush/battery sensors detected.
  // v2.2.0 B1 — resolved-error info line. The persistent
  // sensor.*_last_error_code keeps its value after an error is cleared (by
  // design, paired with last_error_at). The Health tab's alert banner is now
  // gated on the vacuum entity's ACTIVE error (alert-zone.ts); a resolved
  // error renders here as a single muted line instead, so the history stays
  // visible without alarm styling.
  let lastErrorHtml = '';
  {
    const vacuumEntity = hass.states[`vacuum.${n}`];
    const activeError  = !!vacuumEntity
      && (vacuumEntity.state === 'error' || !!vacuumEntity.attributes?.error_code);
    const errSensor = hass.states[`sensor.${n}_last_error_code`];
    if (!activeError
        && errSensor
        && errSensor.state !== '0'
        && errSensor.state !== ''
        && errSensor.state !== 'unknown'
        && errSensor.state !== 'unavailable') {
      const label = esc((errSensor.attributes.label as string) ?? `Error ${errSensor.state}`);
      const atState = hass.states[`sensor.${n}_last_error_at`]?.state;
      const ago = (atState && atState !== 'unknown' && atState !== 'unavailable')
        ? timeSince(atState, hass.language)
        : '';
      lastErrorHtml = `
        <div class="rpc-last-error-info">Last error: ${label}${ago ? ` · ${esc(ago)} (resolved)` : ' (resolved)'}</div>
      `;
    }
  }
  // v2.0.2 bug fix: this guard already accounted for the health score,
  // maintenance calendar, and anomaly banner (v2.0 additions, fixed
  // earlier) but never accounted for the battery retention bar or
  // coverage percentage bar — both independent sections computed further
  // below, unrelated to the `bars` array. A robot with only one of those
  // two (no consumable bars, no health score, no maintenance calendar, no
  // anomaly) would see an entirely empty Health tab despite having real
  // content to show. Found while adding a "Mark as replaced" button to
  // the retention bar and writing a minimal test fixture for it — the
  // fixture exposed that retention-only data already produced an empty
  // render even before today's changes.
  // v2.2.0 A3 — computed before the guard: a dock section alone is real content.
  const dockHealthHtml = renderDockHealth(hass, n);
  // v2.3.0 — same reasoning: rooms-overdue alone is real content too.
  const roomsOverdueHtml = renderRoomsOverdue(hass, caps, n, state);
  // v2.3.0 — same reasoning: dirt-correlation alone is real content too.
  const dirtCorrelationHtml = renderDirtCorrelation(hass, caps, n);

  // v2.2.0 B1: lastErrorHtml added — a resolved-error line is real content.
  // v2.2.0 A3: dockHealthHtml likewise.
  if (bars.length === 0 && !caps.hasRobotHealthScore && !caps.hasMaintenanceCalendar
      && !anomalyHtml && !navHealthHtml && !caps.hasBatteryRetention && !caps.hasCoveragePct
      && !lastErrorHtml && !dockHealthHtml && !roomsOverdueHtml && !dirtCorrelationHtml) return '';

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
        const isResetting = state.resetting === 'retention';
        const spinnerSvg = `<svg class="rpc-spinner" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="3" stroke-dasharray="31 63"/></svg>`;
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
            <button class="rpc-btn rpc-btn-secondary${isResetting ? ' rpc-btn-loading' : ''}"
                    data-reset="retention" data-service="reset_battery"
                    ${isResetting ? 'disabled' : ''}>
              ${isResetting ? spinnerSvg : 'Mark as replaced'}
            </button>
            ${state.resetError === 'retention' ? `<div class="rpc-send-error">Reset failed — try again</div>` : ''}
          </div>` : '';

        // v2.0.2 bug fix (UX report): this row previously omitted the
        // rpc-bar-hours placeholder that Filter/Brush always include
        // (their "Xh" remaining text), so its flex-1 track expanded wider
        // than theirs and the percentage column landed in a different
        // horizontal position — even though the percentage itself was
        // correctly computed. An empty span with the same class reserves
        // the identical 30px slot regardless of content, aligning the
        // track width and percent column with every other bar in this tab.
        retentionBarHtml = `
          <div class="rpc-bar-row" data-bar="retention" role="button" aria-expanded="${isOpen}" tabindex="0"
               aria-label="Bat. Health — ${retPct}%">
            <span class="rpc-bar-label">Bat. Health</span>
            <div class="rpc-bar-track"><div class="rpc-bar-fill" style="width:${retPct}%;background:${colour}"></div></div>
            <span class="rpc-bar-pct" style="color:${colour}">${retPct}%</span>
            <span class="rpc-bar-hours"></span>
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
              <div class="rpc-bar-track"><div class="rpc-bar-fill" style="width:${covPct}%;background:${colour}"></div></div>
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
      ${lastErrorHtml}
      ${renderHealthScore(hass, caps, n, state.healthDetailsExpanded)}
      ${caps.hasRobotHealthScore && !state.healthDetailsExpanded ? '' : `
        ${barsHtml}
        ${retentionHtml}
        ${energyHtml}
        ${mopConfigHtml}
        ${dockHealthHtml}
        ${roomsOverdueHtml}
        ${dirtCorrelationHtml}
      `}
      ${renderMaintenanceCalendar(hass, caps, n, state)}
      ${navHealthHtml}
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
