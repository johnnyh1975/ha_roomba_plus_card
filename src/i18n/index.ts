/**
 * v2.5.0 I18N — card-side translation infrastructure.
 *
 * NOT the same mechanism as the integration's translations/*.json — that's
 * Home Assistant's backend entity/config-flow i18n system, tied to
 * `_attr_translation_key` and config-flow steps, which a Lovelace card has
 * no access to at all (cards are pure frontend JS with no entity
 * registration or config flow of their own). This is a parallel,
 * card-specific system achieving the same user-facing goal — the same 8
 * locales as the integration (de/en/es/fr/it/nl/pl/pt) — using `hass.language`
 * (already available on every render call) to pick a dictionary.
 *
 * English is the canonical key set and the fallback for any locale/key not
 * found — every other locale file is typed against it (`Record<Key, Entry>`),
 * so a missing key is a compile-time error, not a silent blank string at
 * runtime.
 *
 * Pluralization: two forms only (`one` / `other`), matching what this
 * codebase's own hardcoded ternaries already did everywhere (`room` vs
 * `rooms`) before this migration. This is a deliberate simplification, not
 * full CLDR plural-rule support — languages with more than two grammatical
 * plural forms (e.g. Polish's few/many split) do not get a fully correct
 * treatment here. Documented as a known limitation rather than silently
 * assumed correct.
 */
import { en } from './en.js';
import { de } from './de.js';
import { es } from './es.js';
import { fr } from './fr.js';
import { it } from './it.js';
import { nl } from './nl.js';
import { pl } from './pl.js';
import { pt } from './pt.js';

export type TranslationKey = keyof typeof en;
export type TranslationEntry = string | { one: string; other: string };
export type TranslationDict = Record<TranslationKey, TranslationEntry>;

const DICTIONARIES: Record<string, TranslationDict> = { en, de, es, fr, it, nl, pl, pt };

/** Reduce an HA language tag ("de-DE", "pt-BR", "en-US") to the base
 *  2-letter code this dictionary set keys on. Falls back to 'en' for
 *  anything not in DICTIONARIES (e.g. HA locales this card hasn't been
 *  translated for yet — sv, da, etc.) rather than throwing or blanking. */
export function resolveLang(hassLanguage: string | undefined | null): string {
  const base = (hassLanguage ?? 'en').split('-')[0].toLowerCase();
  return DICTIONARIES[base] ? base : 'en';
}

/**
 * Translate `key` for `lang`, with optional interpolation vars.
 *
 * `vars.count`, when present and the dictionary entry is a {one, other}
 * pluralized pair, selects the form (count === 1 → one, else → other) —
 * and is also available for `{count}` interpolation in the string itself,
 * same as any other var.
 *
 * A key missing from the requested locale falls back to English; a key
 * missing from English too (shouldn't happen — en is canonical) falls
 * back to the raw key string itself, so a real gap is visibly wrong
 * (a stray "header.pause" in the UI) rather than a blank space that's
 * easy to miss in review.
 */
export function t(
  lang: string,
  key: TranslationKey,
  vars?: Record<string, string | number>,
): string {
  const dict = DICTIONARIES[lang] ?? DICTIONARIES.en;
  const entry: TranslationEntry | undefined = dict[key] ?? DICTIONARIES.en[key];
  if (entry === undefined) return String(key);

  let str: string;
  if (typeof entry === 'string') {
    str = entry;
  } else {
    const count = typeof vars?.count === 'number' ? vars.count : 0;
    str = count === 1 ? entry.one : entry.other;
  }

  if (vars) {
    for (const k of Object.keys(vars)) {
      str = str.split(`{${k}}`).join(String(vars[k]));
    }
  }
  return str;
}

export { en, de, es, fr, it, nl, pl, pt };

/**
 * v2.5.0 I18N — per-locale weekday abbreviations for history-zone.ts's F22
 * "usually Mon ~9am" pattern tooltip. Kept outside the string-keyed t()
 * system (arrays don't fit its string-return contract) — a small, deliberate
 * exception. Index 0 = Monday, matching the integration's own
 * datetime.weekday() convention (verified against source), NOT JS
 * Date.getDay()'s 0=Sunday.
 *
 * Known limitation: the "~9am"/"~9pm" hour suffix itself stays in English
 * 12-hour convention in every locale — a full locale-correct time
 * formatter (24h in most of Europe) was out of scope for this pass.
 */
export const WEEKDAY_LABELS: Record<string, string[]> = {
  en: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  de: ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'],
  es: ['lun', 'mar', 'mié', 'jue', 'vie', 'sáb', 'dom'],
  fr: ['lun', 'mar', 'mer', 'jeu', 'ven', 'sam', 'dim'],
  it: ['lun', 'mar', 'mer', 'gio', 'ven', 'sab', 'dom'],
  nl: ['ma', 'di', 'wo', 'do', 'vr', 'za', 'zo'],
  pl: ['pon', 'wt', 'śr', 'czw', 'pt', 'sob', 'niedz'],
  pt: ['seg', 'ter', 'qua', 'qui', 'sex', 'sáb', 'dom'],
};

/**
 * v2.5.0 I18N — 2-letter weekday abbreviations for heatmap.ts's calendar
 * grid column headers (a much tighter space constraint than the F22 tooltip
 * above, hence a separate, shorter set rather than truncating the other
 * one at render time and hoping it stays legible).
 */
export const WEEKDAY_LABELS_SHORT: Record<string, string[]> = {
  en: ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'],
  de: ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'],
  es: ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'],
  fr: ['Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa', 'Di'],
  it: ['Lu', 'Ma', 'Me', 'Gi', 'Ve', 'Sa', 'Do'],
  nl: ['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo'],
  pl: ['Po', 'Wt', 'Śr', 'Cz', 'Pt', 'So', 'Ni'],
  pt: ['Se', 'Te', 'Qa', 'Qi', 'Sx', 'Sá', 'Do'],
};
