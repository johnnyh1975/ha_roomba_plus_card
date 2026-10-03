/**
 * version-check.ts — v2.5.0: the card's minimum versions, checked at runtime.
 *
 * Since 2.5.0 the card reads the integration's status SLUGS (readiness,
 * phase, Clean Base, mop pad — sent since integration 4.1.8) and its 4.x
 * entity layout (cloud zone selects, `max_hours`, `coverage_pct`, …). On an
 * older integration it does not break loudly — it shows wrong texts
 * ("Robot not ready: Ready"). HACS enforces only the Home Assistant minimum
 * (hacs.json); nothing enforced the integration minimum. So the card asks.
 *
 * - Home Assistant: `hass.config.version`.
 * - Integration: websocket `manifest/get` for `roomba_plus` — allowed for
 *   non-admin users too (no require_admin in HA core), returns the installed
 *   manifest including `version`.
 *
 * Quiet by design: anything unknown (no version, unparsable, request fails)
 * produces no notice — a false alarm would be worse than none.
 */
import { esc } from './utils.js';
import { t } from './i18n/index.js';

export const MIN_HA_VERSION = '2025.5.0';
export const MIN_INTEGRATION_VERSION = '4.2.0';

interface ParsedVersion { nums: number[]; pre: boolean }

/** "2025.5.0", "4.3.0b6", "2025.10.0.dev20251001", "4.2" → parsed, else null.
 *  A pre-release (b/rc/a/dev suffix) sorts before its release. */
export function parseVersion(v: unknown): ParsedVersion | null {
  if (typeof v !== 'string') return null;
  const m = v.trim().match(/^(\d+)\.(\d+)(?:\.(\d+))?(.*)$/);
  if (!m) return null;
  const rest = m[4] ?? '';
  return {
    nums: [Number(m[1]), Number(m[2]), Number(m[3] ?? 0)],
    pre: /^\.?(a|b|rc|dev)/i.test(rest),
  };
}

/** -1 / 0 / 1, or null when either side is unparsable. Pre-release suffixes
 *  are compared only as "before the release", not against each other. */
export function compareVersions(a: unknown, b: unknown): number | null {
  const pa = parseVersion(a);
  const pb = parseVersion(b);
  if (!pa || !pb) return null;
  for (let i = 0; i < 3; i++) {
    if (pa.nums[i] !== pb.nums[i]) return pa.nums[i] < pb.nums[i] ? -1 : 1;
  }
  if (pa.pre !== pb.pre) return pa.pre ? -1 : 1;
  return 0;
}

export interface VersionProblem {
  component: 'ha' | 'integration';
  have: string;
  need: string;
}

/** Components installed below the card's minimum. Unknown versions are not
 *  reported. */
export function checkMinimums(haVersion: unknown, integrationVersion: unknown): VersionProblem[] {
  const out: VersionProblem[] = [];
  if (compareVersions(haVersion, MIN_HA_VERSION) === -1) {
    out.push({ component: 'ha', have: String(haVersion), need: MIN_HA_VERSION });
  }
  if (compareVersions(integrationVersion, MIN_INTEGRATION_VERSION) === -1) {
    out.push({ component: 'integration', have: String(integrationVersion), need: MIN_INTEGRATION_VERSION });
  }
  return out;
}

/** "4.2.0" → "4.2" for display. */
function shortVersion(v: string): string {
  return v.replace(/^(\d+\.\d+)\.0$/, '$1');
}

/** Compact notice at the top of the card; '' when nothing is below minimum. */
export function renderVersionNotice(problems: VersionProblem[], lang: string): string {
  if (problems.length === 0) return '';
  const lines = problems.map(p => t(lang,
    p.component === 'ha' ? 'card.versionNoticeHa' : 'card.versionNoticeIntegration',
    { need: esc(shortVersion(p.need)), have: esc(p.have) }));
  return `<div class="rpc-version-notice" role="status">⚠ ${lines.join('<br>')}</div>`;
}

/** Minimal websocket surface this module needs. */
interface WsCaller { callWS(msg: Record<string, unknown>): Promise<unknown> }

let integrationVersionPromise: Promise<string | null> | null = null;

/**
 * Installed integration version via `manifest/get`, fetched once per page
 * load and shared by every card instance. null when unavailable.
 */
export function fetchIntegrationVersion(hass: WsCaller): Promise<string | null> {
  if (!integrationVersionPromise) {
    integrationVersionPromise = hass
      .callWS({ type: 'manifest/get', integration: 'roomba_plus' })
      .then(res => {
        const v = (res as { version?: unknown } | null)?.version;
        return typeof v === 'string' ? v : null;
      })
      .catch(() => null);
  }
  return integrationVersionPromise;
}

/** Test hook: forget the cached request. */
export function _resetIntegrationVersionCache(): void {
  integrationVersionPromise = null;
}
