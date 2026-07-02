/**
 * action-plan.ts — R3 (refactor)
 *
 * Pure classification of a header/control action string into one of a few
 * shapes the imperative shell knows how to execute. Extracted from
 * handleAction so the dispatch decisions — which action maps to which
 * domain/service, which is a local-UI toggle, which needs the pulse timing —
 * are unit-testable without the DOM/custom element.
 *
 * The actual side effects (callService, timers, render, loading/error flags)
 * stay on the class in named run* methods. This module decides WHAT; the shell
 * does it.
 */

export type ActionPlan =
  | { kind: 'clean-selected' }
  | { kind: 'repeat-last' }
  | { kind: 'toggle-room-picker' }
  | { kind: 'vacuum'; domain: string; service: string; action: string; pulse: boolean }
  | { kind: 'noop' };

/**
 * Vacuum domain service map. Verbatim from the original handleAction actionMap.
 * - resume/retry both map to vacuum.start (iRobot treats start-from-error as
 *   resume/retry).
 * - stop is the Paused state's third button.
 */
export const VACUUM_ACTION_MAP: Record<string, [domain: string, service: string]> = {
  start:       ['vacuum', 'start'],
  pause:       ['vacuum', 'pause'],
  resume:      ['vacuum', 'start'],
  return_home: ['vacuum', 'return_to_base'],
  locate:      ['vacuum', 'locate'],
  stop:        ['vacuum', 'stop'],
  retry:       ['vacuum', 'start'],
};

/** Classify an action string. Unknown actions → noop (matches original early return). */
export function planAction(action: string): ActionPlan {
  if (action === 'clean-selected')     return { kind: 'clean-selected' };
  if (action === 'repeat-last')        return { kind: 'repeat-last' };
  if (action === 'toggle-room-picker') return { kind: 'toggle-room-picker' };

  const mapping = VACUUM_ACTION_MAP[action];
  if (!mapping) return { kind: 'noop' };
  const [domain, service] = mapping;
  // locate gets a fixed 2s "pulse" reset; all other vacuum actions use the
  // 5s safety-net timer + immediate reset on resolve.
  return { kind: 'vacuum', domain, service, action, pulse: action === 'locate' };
}

/**
 * Resolve which cleaning-passes option to send before a selected-rooms clean.
 * Returns null to skip (Auto, or no passes entity present). Pure mirror of the
 * original inline logic.
 */
export function passesOption(
  passes: string,
  hasPassesEntity: boolean,
  chipToOption: Record<string, string>,
): string | null {
  if (passes === 'Auto') return null;
  if (!hasPassesEntity) return null;
  return chipToOption[passes] ?? passes;
}
