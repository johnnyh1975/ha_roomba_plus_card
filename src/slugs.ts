/**
 * slugs.ts — v2.5.0 F15: every integration state value the card COMPARES
 * against, in one place.
 *
 * Why this file exists: issue #17. The card compared sensor.*_readiness
 * against 'Ready' while the integration (since 4.1.8) reports the slug
 * `ready` — so every ready robot read as "not ready". Nothing turned red,
 * because the card's own test fixture used 'Ready' too. The same class of
 * break hid `evac` → `emptying_bin` and 'Empty' → `empty`.
 *
 * Rule (Plan v3 invariant 2): the card compares only against slugs listed
 * here and displays through hass.formatEntityState (utils.ts formatState).
 * tests/slugs.test.ts checks every value below against the state keys of
 * the integration's translations/en.json (checked-in extract,
 * tests/fixtures/integration-states.json, refreshed by
 * scripts/update_contract.py). A slug the integration drops or renames
 * turns that test red instead of turning a card feature silently off.
 */

/** sensor.*_readiness (translation_key `readiness`). */
export const READINESS = {
  READY: 'ready',
  /** "None" — the integration's own no-state value; treated like ready. */
  NONE: 'none',
  BIN_FULL: 'bin_full',
} as const;

/** sensor.*_phase (translation_key `phase`). */
export const PHASE = {
  EMPTYING_BIN: 'emptying_bin',
  CHARGING_MID_MISSION: 'charging_mid_mission',
  NO_CONTACT: 'no_contact',
  NOT_RESPONDING: 'not_responding',
  WASHING_PAD: 'washing_pad',
  DRYING_PAD: 'drying_pad',
  REFILLING_TANK: 'refilling_tank',
} as const;

/** Phases during which the dock — not the robot — is busy. The header shows
 *  the integration's own text for them (P3), so only membership matters. */
export const STATION_PHASES: ReadonlySet<string> = new Set([
  PHASE.WASHING_PAD, PHASE.DRYING_PAD, PHASE.REFILLING_TANK,
]);

/** Phases meaning "the integration has lost the robot" — offline state. */
export const OFFLINE_PHASES: ReadonlySet<string> = new Set([
  PHASE.NO_CONTACT, PHASE.NOT_RESPONDING,
]);

/** sensor.*_clean_base_status (translation_key `clean_base_status`).
 *  Only the values the card colours or explains; display text comes from
 *  the integration. */
export const CLEAN_BASE = {
  READY: 'ready',
  EMPTY: 'empty',
  BAG_FULL: 'bag_full',
  BAG_MISSING: 'bag_missing',
  CLOGGED: 'clogged',
} as const;

/** Clean Base states that need the user — shown as a warning. */
export const CLEAN_BASE_PROBLEMS: ReadonlySet<string> = new Set([
  CLEAN_BASE.BAG_FULL, CLEAN_BASE.BAG_MISSING, CLEAN_BASE.CLOGGED,
  'sealing_problem', 'ir_comms_problem', 'bin_full_sensors_not_cleared',
]);

/** sensor.*_health_score_trend / cleaning_speed_trend. */
export const TREND = {
  IMPROVING: 'improving',
  STABLE: 'stable',
  DECLINING: 'declining',
} as const;

/**
 * The contract the card relies on, as {translation_key: slugs[]}, grouped by
 * entity platform. Exported for tests/slugs.test.ts — keep it in step with
 * every comparison in src/ (the test also greps the source for stray
 * quoted readiness/phase literals).
 */
export const CARD_SLUG_CONTRACT: Record<string, Record<string, readonly string[]>> = {
  sensor: {
    readiness: Object.values(READINESS),
    phase: Object.values(PHASE),
    clean_base_status: [...Object.values(CLEAN_BASE), ...CLEAN_BASE_PROBLEMS],
    health_score_trend: Object.values(TREND),
  },
};
