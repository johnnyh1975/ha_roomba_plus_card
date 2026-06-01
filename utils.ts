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
    // Fallback for environments without Intl.RelativeTimeFormat
    if (min < 1)  return 'just now';
    if (min < 60) return `${min}m ago`;
    const h = Math.floor(min / 60);
    if (h < 24)   return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  }
}
