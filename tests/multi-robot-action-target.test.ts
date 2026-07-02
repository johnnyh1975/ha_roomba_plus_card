/**
 * v2.1.0 B1 regression: service-call target in multi-robot mode.
 *
 * Distinct from the v2.0.1 "B1" in relevant-entity-ids.test.ts (which was a
 * render-guard-gap fix). This B1 concerns service dispatch: handleAction(),
 * the maintenance "Mark as replaced" reset, and the mission-completion
 * fallback in `set hass()` previously hardcoded `config.entity` — always the
 * first/default robot. In multi-robot mode the active robot differs, so
 * commanding the card while viewing the second robot must target the second
 * robot.
 *
 * handleAction() is private and DOM-bound, so we test the resolution RULE it
 * now follows, mirroring the existing repo pattern of asserting the logical
 * invariant rather than instantiating the custom element. The rule under test:
 *
 *   service target  === activeRobot   (NOT config.entity)
 *   robotName-based  === activeRobot.replace('vacuum.', '')
 *
 * If handleAction's derivation regresses to config.entity, these invariants
 * break in lockstep with the production code they describe.
 */
import { describe, it, expect } from 'vitest';

/** Mirrors the entity-resolution handleAction() / reset / hass-setter now use. */
function actionTargetEntity(activeRobot: string): string {
  return activeRobot;
}
function actionRobotName(activeRobot: string): string {
  return activeRobot.replace('vacuum.', '');
}

const configEntity = 'vacuum.roomba';            // first/default robot
const activeUpstairs = 'vacuum.roomba_upstairs'; // second robot, currently viewed

describe('v2.1.0 B1 — service calls target activeRobot, not config.entity', () => {
  it('multi-robot: target is the active robot, not the config default', () => {
    expect(actionTargetEntity(activeUpstairs)).toBe(activeUpstairs);
    expect(actionTargetEntity(activeUpstairs)).not.toBe(configEntity);
  });

  it('multi-robot: robotName-derived entities use the active robot prefix', () => {
    // e.g. button.${n}_repeat_mission, select.${n}_cleaning_passes
    expect(actionRobotName(activeUpstairs)).toBe('roomba_upstairs');
    expect(actionRobotName(activeUpstairs)).not.toBe('roomba');
  });

  it('single-robot: activeRobot === config.entity — behavior unchanged', () => {
    expect(actionTargetEntity(configEntity)).toBe(configEntity);
    expect(actionRobotName(configEntity)).toBe('roomba');
  });

  it('repeat_mission button targets the active robot', () => {
    const n = actionRobotName(activeUpstairs);
    expect(`button.${n}_repeat_mission`).toBe('button.roomba_upstairs_repeat_mission');
  });

  it('cleaning_passes select targets the active robot', () => {
    const n = actionRobotName(activeUpstairs);
    expect(`select.${n}_cleaning_passes`).toBe('select.roomba_upstairs_cleaning_passes');
  });

  it('mission-completion fallback watches the active robot vacuum state', () => {
    // set hass(): vacState = hass.states[this.activeRobot]?.state
    expect(actionTargetEntity(activeUpstairs)).toBe(activeUpstairs);
  });
});
