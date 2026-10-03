import { HomeAssistant, CardConfig, RobotCapabilities } from '../types.js';
import { normalisedWifiFloor } from '../heatmap.js';
import { esc, formatState } from '../utils.js';
import { READINESS } from '../slugs.js';
import { consumableReferenceHours } from './health-zone.js';
import { t, resolveLang } from '../i18n/index.js';

/**
 * v2.0: each alert is tagged with the tab whose badge it should surface on,
 * per the plan's example ("A WiFi floor problem gets a badge on History.
 * A maintenance alert gets a badge on Health."). Priority 1 (live error) is
 * tagged 'none' — it's already surfaced continuously via the persistent
 * header's Error state, so a duplicate tab badge would be redundant noise.
 */
export type AlertCategory = 'history' | 'health' | 'none';

interface Alert {
  priority: number;
  text: string;
  subtext?: string;
  category: AlertCategory;
}

/**
 * v2.0: collects every currently-active alert condition, tagged by category.
 * Exported (not just used internally by renderAlertZone) so the tab bar can
 * derive badge state from the exact same thresholds — avoiding a second,
 * separately-maintained copy of "ratio > 1.5" / "nav_quality < 60" style
 * conditions drifting out of sync with the banner logic. This is the same
 * principle the integration itself applies to mission_progress
 * (single source of truth for elapsed/estimate calculations).
 */
export function collectAlerts(
  hass: HomeAssistant,
  caps: RobotCapabilities,
  robotName: string,
): Alert[] {
  const n = robotName;
  const lang = resolveLang(hass.language);
  const alerts: Alert[] = [];

  // Priority 1 — error. Tagged 'none': already live in the persistent header.
  //
  // v2.2.0 B1: gate on the vacuum entity's ACTIVE error, not on
  // sensor.*_last_error_code alone. That sensor is deliberately persistent
  // ("last error" — it keeps its value after the error is resolved, paired
  // with last_error_at). The integration's vacuum entity only carries the
  // `error_code` attribute while an error is live (vacuum.py: attribute is
  // set from roombapy's current error_code and disappears on resolution),
  // and its state is 'error' when the activity mapping reports one. Field
  // report: a brush-jam banner stayed on the Health tab for a week after
  // the jam was physically cleared. The resolved error now renders as a
  // muted informational line in the Health zone instead (see health-zone.ts).
  const vacuumEntity = hass.states[`vacuum.${n}`];
  const activeError  = !!vacuumEntity
    && (vacuumEntity.state === 'error' || !!vacuumEntity.attributes?.error_code);
  const errorSensor = hass.states[`sensor.${n}_last_error_code`];
  if (activeError
      && errorSensor
      && errorSensor.state !== '0'
      && errorSensor.state !== ''
      && errorSensor.state !== 'unknown'
      && errorSensor.state !== 'unavailable') {
    const label  = esc((errorSensor.attributes.label       as string) ?? t(lang, 'alert.errorFallback', { code: errorSensor.state }));
    const desc   = esc((errorSensor.attributes.description as string) ?? '');
    const action = esc((errorSensor.attributes.action      as string) ?? '');
    const subtext = [desc, action].filter(Boolean).join(' ') || undefined;
    alerts.push({ priority: 1, text: t(lang, 'alert.errorPrefixed', { label }), subtext, category: 'none' });
  } else if (activeError) {
    // Active error but last_error_code unusable (sensor lagging behind the
    // live MQTT state, or entity disabled) — fall back to the vacuum
    // entity's own error attributes so an active error is never silent.
    // With neither message nor code (state 'error' from an unknown-phase
    // mapping), use the header's generic wording instead of "Error: Error".
    const code = vacuumEntity!.attributes?.error_code;
    const msg  = vacuumEntity!.attributes?.error as string | undefined;
    const text = msg ? t(lang, 'alert.errorPrefixed', { label: esc(msg) })
      : code != null ? t(lang, 'alert.errorPrefixed', { label: t(lang, 'alert.errorFallback', { code: esc(String(code)) }) })
      : t(lang, 'header.robotErrorCheckApp');
    alerts.push({ priority: 1, text, category: 'none' });
  }

  // Priority 2 — maintenance due (Wave A A5: readiness-specific text). Health.
  const maintenanceSensor = hass.states[`binary_sensor.${n}_maintenance_due`];
  if (maintenanceSensor && maintenanceSensor.state === 'on') {
    // v2.5.0 F1 (#17): readiness is a SLUG since integration 4.1.8 —
    // `ready`, `bin_full`, `lid_open`, … or `not_ready_<n>` for a state the
    // integration cannot name yet. The old comparison against 'Ready' never
    // matched, so every ready robot with maintenance due read "Robot not
    // ready — check the app". Compared against slugs (slugs.ts, guarded by
    // tests/slugs.test.ts); the reason is shown in the integration's own
    // words via HA's formatter.
    const readinessId = `sensor.${n}_readiness`;
    const readiness = hass.states[readinessId]?.state ?? '';
    let alertText = t(lang, 'alert.maintenanceDue');
    if (readiness === READINESS.BIN_FULL) {
      alertText = t(lang, 'alert.binFull');
    } else if (readiness
               && readiness !== READINESS.READY
               && readiness !== READINESS.NONE
               && readiness !== 'unknown'
               && readiness !== 'unavailable') {
      alertText = t(lang, 'alert.notReadyReason', { reason: esc(formatState(hass, readinessId)) });
    }
    alerts.push({ priority: 2, text: alertText, category: 'health' });
  }

  // Priority 3/4 — filter/brush wear rate (L4). Health.
  if (caps.hasWearRate) {
    const filterWear = hass.states[`sensor.${n}_filter_wear_rate`];
    const filterThr  = hass.states[`sensor.${n}_filter_remaining_hours`];
    if (filterWear && filterWear.state !== 'unknown' && filterWear.state !== 'unavailable' && filterThr) {
      // v2.5.0 F7: same reference life the Health bar uses (max_hours first).
      const thr     = consumableReferenceHours(filterThr);
      const ratio   = thr ? parseFloat(filterWear.state) / (thr / 90) : NaN;
      if (ratio > 1.5) {
        alerts.push({ priority: 3, text: t(lang, 'alert.filterWearing', { ratio: ratio.toFixed(1) }), subtext: t(lang, 'alert.filterWearingSub'), category: 'health' });
      }
    }

    const brushWear = hass.states[`sensor.${n}_brush_wear_rate`];
    const brushThr  = hass.states[`sensor.${n}_brush_remaining_hours`];
    if (brushWear && brushWear.state !== 'unknown' && brushWear.state !== 'unavailable' && brushThr) {
      const thr   = consumableReferenceHours(brushThr);
      const ratio = thr ? parseFloat(brushWear.state) / (thr / 90) : NaN;
      if (ratio > 1.5) {
        alerts.push({ priority: 4, text: t(lang, 'alert.brushWearing', { ratio: ratio.toFixed(1) }), subtext: t(lang, 'alert.brushWearingSub'), category: 'health' });
      }
    }
  }

  // Priority 5 — navigation quality (Wave B4, v1.9+ robots with VSLAM). Health
  // — grouped with performance/anomaly signals already in the v2.0 Health tab
  // (speed trend, robot health score) rather than Map, despite its spatial
  // origin, for consistency with where other performance signals live.
  const navQualityEntity = hass.states[`sensor.${n}_nav_quality`];
  if (navQualityEntity
      && navQualityEntity.state !== 'unknown'
      && navQualityEntity.state !== 'unavailable') {
    const navQuality = parseInt(navQualityEntity.state, 10);
    if (!isNaN(navQuality) && navQuality < 60) {
      alerts.push({
        priority: 5,
        text:    t(lang, 'alert.navQualityLow', { nav: navQuality }),
        subtext: t(lang, 'alert.navQualityLowSub'),
        category: 'health',
      });
    }
  }

  // Priority 6 — consecutive clean skips (F6a, v2.1+). Health.
  if (caps.hasConsecutiveSkips) {
    const skipsEntity = hass.states[`sensor.${n}_consecutive_clean_skips`];
    if (skipsEntity && skipsEntity.state !== 'unknown' && skipsEntity.state !== 'unavailable') {
      const count = parseInt(skipsEntity.state, 10);
      if (!isNaN(count) && count > 0) {
        const text = t(lang, 'alert.consecutiveSkips', { count });
        alerts.push({
          priority: 6,
          text,
          subtext: t(lang, 'alert.consecutiveSkipsSub'),
          category: 'health',
        });
      }
    }
  }

  // Priority 7 — WiFi floor alert (F6a, v2.1+). History — per the v2.0 plan's
  // explicit example for this exact alert.
  //
  // WIFI_FLOOR_MIGRATION (SC1, integration v2.7.0): sensor.*_recent_wifi_floor
  // is deprecated; sensor.*_wifi_health is NOT a like-for-like replacement —
  // its state is a weighted AVERAGE quality %, a different statistic from the
  // old "floor" value. The old sensor was also independently confirmed buggy:
  // despite being declared as a percentage, its value_fn actually returned a
  // raw 0–4 signal-bucket index (which is exactly why normalisedWifiFloor()
  // below has always treated any value ≤4 as a bucket, not a real percentage —
  // that workaround was compensating for this very integration bug).
  //
  // Decision: preserve this alert's actual intent ("was there a dead zone
  // during the last mission") rather than silently swapping in the average.
  // wifi_health's `weakest_bucket_observed` attribute (0–4 int, correctly NOT
  // labelled as a percentage) is the genuine successor to the old floor
  // concept. Read the attribute, not the entity state.
  if (caps.hasWifiFloor) {
    const wifiEntity = hass.states[`sensor.${n}_wifi_health`];
    const rawBucket   = wifiEntity?.attributes?.weakest_bucket_observed;
    if (wifiEntity && typeof rawBucket === 'number' && !isNaN(rawBucket)) {
      // rawBucket is always 0–4 by construction (see migration note above);
      // normalisedWifiFloor's raw<=4 branch always applies here, kept for
      // continuity with the existing display formatting.
      const wifiPct = normalisedWifiFloor(rawBucket);
      if (wifiPct < 50) {
        alerts.push({
          priority: 7,
          text:    t(lang, 'alert.wifiDrop', { pct: wifiPct }),
          subtext: t(lang, 'alert.wifiDropSub'),
          category: 'history',
        });
      }
    }
  }

  // Priority 8 — layout change detected (v2.2.0, integration ≥ 3.2.0). Health.
  // binary_sensor.*_layout_change_detected (device_class: problem, enabled by
  // default) fires when per-cell coverage history diverges from the robot's
  // own learned layout. Lowest priority: informative, not actionable damage.
  // Presence-based gating — entity absent on ≤ 3.1.x, no cap flag needed.
  const layoutEntity = hass.states[`binary_sensor.${n}_layout_change_detected`];
  if (layoutEntity && layoutEntity.state === 'on') {
    alerts.push({
      priority: 8,
      text:    t(lang, 'alert.layoutChanged'),
      subtext: t(lang, 'alert.layoutChangedSub'),
      category: 'health',
    });
  }

  return alerts;
}

/**
 * v2.0: whether any currently-active alert is tagged for the given tab.
 * Used by the tab bar to render the attention badge — independent of which
 * single alert is currently shown as the Health tab banner text below.
 */
export function hasAlertForTab(
  hass: HomeAssistant,
  caps: RobotCapabilities,
  robotName: string,
  tab: 'history' | 'health',
): boolean {
  return collectAlerts(hass, caps, robotName).some(a => a.category === tab);
}

/**
 * Returns non-empty HTML string when an alert is active, empty string when clear.
 * Caller is responsible for the 100ms collapse debounce (see root card).
 */
export function renderAlertZone(
  hass: HomeAssistant,
  config: CardConfig,
  caps: RobotCapabilities,
  robotName: string
): string {
  if (config.show_alerts === false) return '';

  const alerts = collectAlerts(hass, caps, robotName);

  // Return '' (not a hidden div) so the Zone 5 empty-state causes zero DOM impact.
  // A hidden-but-present div would trigger the .rpc-zone + .rpc-zone border rule on Zone 6.
  if (alerts.length === 0) return '';

  const top = alerts.sort((a, b) => a.priority - b.priority)[0];

  return `
    <div class="rpc-zone rpc-zone5">
      <div class="rpc-alert-box" role="alert">
        <span class="rpc-alert-icon" aria-hidden="true">⚠️</span>
        <div class="rpc-alert-content">
          <div class="rpc-alert-text">${top.text}</div>
          ${top.subtext ? `<div class="rpc-alert-sub">${top.subtext}</div>` : ''}
        </div>
      </div>
    </div>
  `;
}
