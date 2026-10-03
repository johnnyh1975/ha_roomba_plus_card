import type { HomeAssistant, HAState } from './types.js';
import { t, resolveLang } from './i18n/index.js';

/** HTML-escape a string before inserting into innerHTML */
export function esc(s: unknown): string {
  return String(s ?? '').replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] ?? c)
  );
}

/**
 * Return a locale-aware relative time string: "2 hours ago", "vor 3 Tagen", "il y a 2 heures".
 * Uses Intl.RelativeTimeFormat (available in all ES2020+ environments).
 * Falls back to compact numeric format if the locale is unrecognised.
 *
 * @param isoStr  ISO 8601 date string of the past event
 * @param locale  BCP47 locale tag — pass hass.language (e.g. 'en', 'de', 'fr', 'nl')
 */
export function timeSince(isoStr: string, locale = 'en'): string {
  const diff = Date.now() - new Date(isoStr).getTime();
  const min  = Math.floor(diff / 60000);
  try {
    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
    if (min < 1)  return rtf.format(0, 'minute');
    if (min < 60) return rtf.format(-min, 'minute');
    const h = Math.floor(min / 60);
    if (h < 24)   return rtf.format(-h, 'hour');
    const d = Math.floor(h / 24);
    if (d < 30)   return rtf.format(-d, 'day');
    return rtf.format(-Math.floor(d / 30), 'month');
  } catch {
    // Fallback for environments without Intl.RelativeTimeFormat — should
    // essentially never fire in a real browser (ES2020+ has universal
    // support), kept translated anyway per this project's own "even rare
    // fallback paths stay correct" discipline rather than leaving a
    // silent English leak in the one code path that's hardest to notice
    // in manual testing (since it practically never runs).
    const lang = resolveLang(locale);
    if (min < 1)  return t(lang, 'utils.justNow');
    if (min < 60) return t(lang, 'utils.minutesAgo', { n: min });
    const h = Math.floor(min / 60);
    if (h < 24)   return t(lang, 'utils.hoursAgo', { n: h });
    return t(lang, 'utils.daysAgo', { n: Math.floor(h / 24) });
  }
}

// ── v2.5.0 P3 — "the integration speaks, the card shows" ───────────────────
//
// Since integration 4.1.x every enum sensor reports a SLUG as its state
// (`ready`, `emptying_bin`, `reusable_wet`, `bag_full`) and ships the display
// text for it in eight languages through its translation files. The card
// used to compare against and print English display strings ('Ready',
// 'Empty', 'evac') — every one of them stopped matching (#17). The card now
// compares only against slugs (see slugs.ts) and DISPLAYS through Home
// Assistant's own formatter, so the text is the integration's, in the
// user's language, maintained where the slug is defined.

/** Turn a slug into readable text: `bag_full` → "Bag full". Last-resort
 *  fallback only — used when hass.formatEntityState is unavailable (test
 *  harnesses, HA < 2024.1) or throws. */
export function humanizeSlug(slug: string): string {
  const s = String(slug ?? '').replace(/_/g, ' ').trim();
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

/** Display text for an entity's state, via HA's formatter when present.
 *  NOT escaped — callers pass the result through esc() like any other text. */
export function formatState(hass: HomeAssistant, entityId: string, state?: string): string {
  const obj = hass.states[entityId];
  const raw = state ?? obj?.state ?? '';
  if (obj && typeof hass.formatEntityState === 'function') {
    try {
      const out = hass.formatEntityState(obj, state);
      if (typeof out === 'string' && out !== '') return out;
    } catch { /* fall through to the humanised slug */ }
  }
  return humanizeSlug(raw);
}

/** Area sensor state normalised to ft² (the unit the card's area formatter
 *  takes), honouring the entity's own unit_of_measurement. Integration ≥ 4.x
 *  reports area sensors in m² (device_class AREA) and HA may convert them for
 *  the user; the card used to read the bare number as ft² regardless.
 *  Returns NaN when the state is not a number. A missing unit keeps the
 *  pre-4.x assumption (ft²). */
export function areaSqftFromEntity(entity: HAState | undefined): number {
  if (!entity) return NaN;
  const v = parseFloat(entity.state);
  if (isNaN(v)) return NaN;
  const unit = String(entity.attributes?.unit_of_measurement ?? '');
  if (unit === 'm²' || unit === 'm2') return v / 0.09290304;
  return v;
}

/** Whether HA runs a metric unit system. v2.5.0: HA reports the length
 *  unit of its unit system — "km" (metric) or "mi" (US customary). The card
 *  compared against "m", which HA never sends, so every metric install saw
 *  areas in ft² unless `area_unit: m2` was set by hand. */
export function isMetricSystem(hass: HomeAssistant): boolean {
  const length = hass.config?.unit_system?.length;
  return length === 'km' || length === 'm';
}
