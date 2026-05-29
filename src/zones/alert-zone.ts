import { HomeAssistant, CardConfig, RobotCapabilities } from '../types.js';
import { esc } from '../utils.js';

interface Alert {
  priority: number;
  text: string;
  subtext?: string;
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

  const n = robotName;
  const alerts: Alert[] = [];

  // Priority 1 — error
  const errorSensor = hass.states[`sensor.${n}_last_error_code`];
  if (errorSensor
      && errorSensor.state !== '0'
      && errorSensor.state !== ''
      && errorSensor.state !== 'unavailable') {
    const desc   = esc((errorSensor.attributes.description as string) ?? 'Robot error');
    const action = esc((errorSensor.attributes.action as string) ?? '');
    alerts.push({ priority: 1, text: `Error: ${desc}`, subtext: action || undefined });
  }

  // Priority 2 — maintenance due (Wave A A5: readiness-specific text)
  const maintenanceSensor = hass.states[`binary_sensor.${n}_maintenance_due`];
  if (maintenanceSensor && maintenanceSensor.state === 'on') {
    const readiness = hass.states[`sensor.${n}_readiness`]?.state ?? '';
    let alertText = 'Maintenance due';
    if (readiness === 'bin_full' || readiness === 'Bin Full') {
      alertText = 'Bin full — empty to continue';
    } else if (readiness && readiness !== 'Ready' && readiness !== 'unknown' && readiness !== 'unavailable') {
      alertText = 'Robot not ready — check the app';
    }
    alerts.push({ priority: 2, text: alertText });
  }

  // Priority 3 — filter wear rate (L4)
  if (caps.hasWearRate) {
    const filterWear = hass.states[`sensor.${n}_filter_wear_rate`];
    const filterThr  = hass.states[`sensor.${n}_filter_remaining_hours`];
    if (filterWear && filterWear.state !== 'unknown' && filterWear.state !== 'unavailable' && filterThr) {
      const thr     = filterThr.attributes.threshold_hours as number;
      const ratio   = parseFloat(filterWear.state) / (thr / 90);
      if (ratio > 1.5) {
        alerts.push({ priority: 3, text: `Filter wearing ${ratio.toFixed(1)}× faster than normal`, subtext: 'Check for dust or debris buildup.' });
      }
    }

    // Priority 4 — brush wear rate (L4)
    const brushWear = hass.states[`sensor.${n}_brush_wear_rate`];
    const brushThr  = hass.states[`sensor.${n}_brush_remaining_hours`];
    if (brushWear && brushWear.state !== 'unknown' && brushWear.state !== 'unavailable' && brushThr) {
      const thr   = brushThr.attributes.threshold_hours as number;
      const ratio = parseFloat(brushWear.state) / (thr / 90);
      if (ratio > 1.5) {
        alerts.push({ priority: 4, text: `Brush wearing ${ratio.toFixed(1)}× faster than normal`, subtext: 'Check for hair tangles.' });
      }
    }
  }

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
