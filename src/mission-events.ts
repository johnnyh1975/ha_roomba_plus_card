/**
 * mission-events.ts — A5 (v2.1.0)
 *
 * Pure decision rule for whether a roomba_plus_mission_completed event should
 * trigger a history reload for the robot a card instance is showing. Extracted
 * so the multi-robot filtering logic is unit-testable without a WS connection
 * or custom-element harness.
 *
 * The integration's event payload carries `entry_id` (the completing robot's
 * config entry). A card knows its own resolved entry_id. Rule:
 *
 *   - both known and equal      → reload (it's us)
 *   - both known and different  → skip   (another robot completed)
 *   - our entry_id unknown      → reload (conservative: single-robot installs
 *                                  are the common case; a stale list is worse
 *                                  than one extra fetch)
 *   - event entry_id missing    → reload (can't disambiguate; reload)
 */
export function shouldReloadForEvent(
  myEntryId: string | null | undefined,
  eventEntryId: string | null | undefined,
): boolean {
  if (myEntryId && eventEntryId && myEntryId !== eventEntryId) return false;
  return true;
}
