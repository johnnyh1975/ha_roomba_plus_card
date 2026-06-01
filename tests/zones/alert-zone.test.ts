import { describe, it, expect } from 'vitest';
import { renderAlertZone } from '../../src/zones/alert-zone';
import { makeHass, defaultCaps, fullCaps, baseConfig, st } from '../helpers';

const n = 'roomba';

function render(states = {}, caps = defaultCaps, config = baseConfig) {
  return renderAlertZone(makeHass(states), config, caps, n);
}

describe('renderAlertZone()', () => {
  // ── Visibility ──────────────────────────────────
  it('returns empty string when no alerts (Zone 5 border bug guard)', () =>
    expect(render()).toBe(''));

  it('returns empty string when show_alerts: false even with error', () => {
    const states = { [`sensor.${n}_last_error_code`]: st('2', { description: 'Stuck', action: 'Move it' }) };
    expect(render(states, defaultCaps, { ...baseConfig, show_alerts: false })).toBe('');
  });

  // ── Priority 1 — error ──────────────────────────
  it('renders alert when error sensor state is non-zero', () => {
    const html = render({ [`sensor.${n}_last_error_code`]: st('2', { description: 'Brush stuck', action: 'Clear hair' }) });
    expect(html).toContain('Brush stuck');
    expect(html).toContain('Clear hair');
  });

  it('no alert when error sensor state is "0"', () =>
    expect(render({ [`sensor.${n}_last_error_code`]: st('0') })).toBe(''));

  it('no alert when error sensor state is empty string', () =>
    expect(render({ [`sensor.${n}_last_error_code`]: st('') })).toBe(''));

  it('escapes XSS in error description', () => {
    const html = render({ [`sensor.${n}_last_error_code`]: st('1', { description: '<img onerror=x>' }) });
    expect(html).not.toContain('<img');
    expect(html).toContain('&lt;img');
  });

  // ── Priority 2 — maintenance ────────────────────
  it('renders maintenance alert when binary sensor is on', () => {
    const html = render({ [`binary_sensor.${n}_maintenance_due`]: st('on') });
    expect(html).toContain('Maintenance due');
  });

  it('Wave A5: bin_full readiness → "Bin full — empty to continue"', () => {
    const html = render({
      [`binary_sensor.${n}_maintenance_due`]: st('on'),
      [`sensor.${n}_readiness`]:             st('bin_full'),
    });
    expect(html).toContain('Bin full — empty to continue');
    expect(html).not.toContain('Maintenance due');
  });

  it('Wave A5: generic readiness → "Robot not ready — check the app"', () => {
    const html = render({
      [`binary_sensor.${n}_maintenance_due`]: st('on'),
      [`sensor.${n}_readiness`]:             st('some_other_state'),
    });
    expect(html).toContain('Robot not ready');
  });

  it('Wave A5: readiness "Ready" → generic "Maintenance due"', () => {
    const html = render({
      [`binary_sensor.${n}_maintenance_due`]: st('on'),
      [`sensor.${n}_readiness`]:             st('Ready'),
    });
    expect(html).toContain('Maintenance due');
  });

  // ── Priority ordering ───────────────────────────
  it('error (P1) takes priority over maintenance (P2)', () => {
    const html = render({
      [`sensor.${n}_last_error_code`]:        st('2', { description: 'Error desc' }),
      [`binary_sensor.${n}_maintenance_due`]: st('on'),
    });
    expect(html).toContain('Error desc');
    expect(html).not.toContain('Maintenance due');
  });

  it('maintenance (P2) takes priority over filter wear (P3)', () => {
    const html = render({
      [`binary_sensor.${n}_maintenance_due`]:  st('on'),
      [`sensor.${n}_filter_wear_rate`]:        st('2.0'),
      [`sensor.${n}_filter_remaining_hours`]:  st('20', { threshold_hours: 200 }),
    }, fullCaps);
    expect(html).toContain('Maintenance due');
    expect(html).not.toContain('Filter wearing');
  });

  // ── Priority 3/4 — wear rates ───────────────────
  it('filter wear >1.5× baseline → alert', () => {
    const html = render({
      [`sensor.${n}_filter_wear_rate`]:       st('3.5'),  // 3.5 vs baseline 200/90 ≈ 2.22 → ratio 1.57
      [`sensor.${n}_filter_remaining_hours`]: st('50', { threshold_hours: 200 }),
    }, { ...defaultCaps, hasWearRate: true });
    expect(html).toContain('Filter wearing');
  });

  it('filter wear at 1.0× baseline → no alert', () => {
    const html = render({
      [`sensor.${n}_filter_wear_rate`]:       st('2.2'),  // ≈ baseline
      [`sensor.${n}_filter_remaining_hours`]: st('100', { threshold_hours: 200 }),
    }, { ...defaultCaps, hasWearRate: true });
    expect(html).toBe('');
  });

  it('brush wear >1.5× baseline → alert', () => {
    const html = render({
      [`sensor.${n}_brush_wear_rate`]:        st('3.5'),
      [`sensor.${n}_brush_remaining_hours`]:  st('50', { threshold_hours: 200 }),
    }, { ...defaultCaps, hasWearRate: true });
    expect(html).toContain('Brush wearing');
  });

  // ── Priority 5 — nav quality (Wave B4) ─────────
  it('Wave B4: nav quality < 60 → alert', () => {
    const html = render({ [`sensor.${n}_nav_quality`]: st('42') });
    expect(html).toContain('Navigation quality low (42/100)');
    expect(html).toContain('lighting');
  });

  it('Wave B4: nav quality >= 60 → no alert', () =>
    expect(render({ [`sensor.${n}_nav_quality`]: st('75') })).toBe(''));

  it('Wave B4: nav quality sensor absent → no alert', () =>
    expect(render()).toBe(''));

  it('wear alert (P3) takes priority over nav quality (P5)', () => {
    const html = render({
      [`sensor.${n}_filter_wear_rate`]:       st('3.5'),
      [`sensor.${n}_filter_remaining_hours`]: st('50', { threshold_hours: 200 }),
      [`sensor.${n}_nav_quality`]:            st('30'),
    }, { ...defaultCaps, hasWearRate: true });
    expect(html).toContain('Filter wearing');
    expect(html).not.toContain('Navigation quality');
  });
});
