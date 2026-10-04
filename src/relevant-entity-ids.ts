/**
 * relevant-entity-ids.ts — the render guard's watch list.
 *
 * `set hass()` re-renders only when one of these entities changes state or
 * last_changed.
 *
 * v3.0 (Plan v3 invariant 4): the list is no longer hand-maintained. It is
 * every entity of the robot — the registry index of registry.ts (same device,
 * platform roomba_plus), or, without a registry, every entity carrying the
 * robot's id prefix. Up to 2.5 the list named ~100 ids one by one, and each
 * feature that read an entity had to remember to add it here; several did
 * not (v2.0.1, v2.5.0 found gaps). A new entity is now watched the moment
 * the integration creates it.
 *
 * B1 fix (kept): uses the ACTIVE robot (not config.entity) so multi-robot
 * mode watches the currently displayed robot's entities.
 */
import type { HomeAssistant } from './types.js';
import { robotIndex } from './registry.js';

export function relevantEntityIds(
  hass: HomeAssistant | undefined,
  _n: string,
  activeRobot: string,
  robotSelectorHelper?: string,
): string[] {
  const ids = [
    activeRobot,
    ...(hass ? robotIndex(hass, activeRobot).entityIds : []),
    // F3b — robot selector helper (when configured)
    ...(robotSelectorHelper ? [robotSelectorHelper] : []),
  ];
  return Array.from(new Set(ids));
}

/** Whether any watched entity changed between two hass snapshots.
 *  v3.0: `last_updated` too — it moves on an attribute-only change
 *  (`last_changed` does not), and 3.0 reads attributes that change without
 *  the state: the vacuum's favourites, cleaning mode and dock activity, the
 *  Prime room select's floors, the start check's reason. */
export function anyEntityChanged(prev: HomeAssistant, next: HomeAssistant, ids: string[]): boolean {
  return ids.some(id => {
    const a = prev.states[id], b = next.states[id];
    return a?.state !== b?.state || a?.last_changed !== b?.last_changed || a?.last_updated !== b?.last_updated;
  });
}
