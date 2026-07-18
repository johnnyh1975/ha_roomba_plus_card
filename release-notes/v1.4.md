# v1.4.0 — Sensor Bug Fixes & Hardening

Fixes seven silent entity mismatches and one wrong-platform reference that
have been present since v1.3.0. No new features. No config changes required.

All fixes are card-side only — integration v2.1.4 is the minimum and no new
entities are added or expected. Features relying on integration v2.2 entities
(`binary_sensor.*_mission_active`, `select.*_carpet_boost_mode`,
`sensor.*_recent_area_30d` / `sensor.*_recent_time_30d` stable entity IDs)
are addressed in v1.5.0 once integration v2.2 ships.

---

## Bug fixes

### A1 — Progress bar used mission count instead of average duration (critical)

`sensor.*_missions_last_30d` was being read as the expected mission duration in
minutes. Because that sensor returns a **count** (e.g. `12`), the progress bar
treated "12 missions" as "12 minutes" — filling to 100% within the first 12
minutes of every mission and producing a nonsensical "~−3 min remaining" display
immediately after.

**Fix:** Changed to `sensor.*_average_mission_time` (unit: minutes). The 45-minute
fallback applies only when the sensor is genuinely absent.

### A2 — Mission phase entity key was wrong — evac label and phase-specific buttons never fired

`hasMissionPhase` checked `sensor.*_mission_phase`, but the integration sensor
has `translation_key = "phase"`, giving entity ID `sensor.*_phase`. Because the
entity was never found, `hasMissionPhase` was always `false` on every install.
Consequences:

- The **"Emptying bin"** label during Clean Base evacuation was never shown —
  the card displayed "Cleaning" instead.
- The evac-specific button set (Pause / Return home) was never activated during
  evacuation.
- The stopping label and any other phase-conditional display were silently inactive.

**Fix:** Changed capability check to `e('phase')` and entity read to
`sensor.${n}_phase` everywhere.

### A3 — Consecutive clean skips alert never fired (wrong platform)

The F6a "Robot blocked from cleaning N times" alert has never triggered for any
user since v1.3.0 shipped. Three compounding bugs:

1. `hasConsecutiveSkips` used `b('consecutive_clean_skips')` — looking for a
   `binary_sensor`, but the integration entity is `sensor.*_consecutive_clean_skips`
   (numeric). The capability flag was always `false`.
2. Even if the entity had been found, the alert code read `.state === 'on'` —
   which is never true for a numeric sensor whose state is an integer string.
3. The count was read from `.attributes.skip_count` — this attribute does not
   exist. The count IS the sensor state.

**Fix:** Changed to `e('consecutive_clean_skips')`, reads `sensor.*`, checks
`parseInt(state) > 0`, and uses the parsed integer directly as the count.

### A4 — vs-usual area delta never displayed (two non-existent entities)

The "▲ 12% vs usual" in-mission area delta has never displayed for any user.
Two compounding bugs:

1. `sensor.*_average_area_30d` does not exist in the integration. `avgArea` was
   always `NaN`, silently suppressing the delta.
2. The `>= 5 mission` minimum-sample gate read `sensor.*_mission_count_30d`,
   which also does not exist. Both sensors referenced here were never in the
   integration.

**Fix:** The average is now computed inline from two sensors that do exist:
`recent_area_30d ÷ missions_last_30d`. The `>= 5` gate uses the same
`missions_last_30d` read. Both source sensors were already tracked in
`relevantEntityIds()` for other purposes — no new entity subscriptions needed.

### A5 — Battery cycle count never shown in health popover (wrong key)

`sensor.*_charge_cycles` was read for the cycle count line in the battery
health popover. The integration sensor key is `battery_cycles`. The cycle
count was absent from the popover on every install.

**Fix:** Changed to `sensor.*_battery_cycles`.

### A6 — Braava pad consumable bar never rendered (non-existent entity)

`sensor.*_mop_pad_remaining_hours` does not exist. The bar condition checked for
this entity, so `hasPad` was true (correctly detected from `sensor.*_mop_pad`)
but the bar never rendered because the underlying entity was absent.
Additionally, `sensor.*_mop_pad` returns a pad type label string — not hours —
so even the correct entity check would have produced the wrong data type.

**Fix:** Changed to `sensor.*_pad_days_until_due` with `threshold_days`
attribute (matching the brush and filter pattern). The popover unit label
now shows `d` (days) instead of `h`. The `Bar` interface gains an optional
`unit` field (defaults to `'h'`) to support this.

### A7 — Battery entity lookup had a dead first check (latent)

The battery bar tried `sensor.*_battery_level` first, then `sensor.*_battery`.
`sensor.*_battery_level` does not exist — the first check always missed and
wasted a `hass.states` lookup on every render. The bar still rendered
correctly via the second check.

**Fix:** Removed the dead first check. The lookup is now a single step to
`sensor.*_battery`.

---

## Housekeeping

### H1 — Version string corrected

`package.json` still reported `"1.3.0"` despite v1.3.1 having shipped. Fixed
to `"1.4.0"`.

### H2 — Speculative capability flags removed

`hasDemandBlocked` (`binary_sensor.*_demand_clean_blocked`) and
`hasEnergyConsumption` (`sensor.*_total_energy_consumed`) were present in the
type surface and capability detection but have no backing entities until
integration v2.4. Removed from `RobotCapabilities`, `capabilities.ts`, and all
tests. Both flags and their rendering code will be re-added in v2.1.0 when
integration v2.4 ships.

### H3 — Null-guards for v2.2+ fields in day detail popover

`MissionRecord` already declares `room_coverage?` and `alignment_confidence?`
(integration v2.2+ additions). Added `void` guards in the mission row render
path so these fields produce no accidental output when they start arriving from
the API before v2.0 implements the rendering code (F8).

### H4 — `DaySummary` type extended for v2.4 fields

Added `dirt_density?: number | null` and `relative_to_baseline?: number | null`
to the `DaySummary` interface. No rendering code — prevents TypeScript errors
when integration v2.4 starts returning these fields in `format=summary` before
card v2.1 renders them.

### H5 — `HazardRecord` interface added

Added `HazardRecord` to `types.ts` matching the `format=hazards` REST API
contract. Types only — no fetch or render code. Ready for F7 (coverage heatmap
tab with hazard pin overlay) in v1.5.0.

### H6 — `fetchHazards()` stub added to `MissionApiClient`

`fetchHazards(): Promise<HazardRecord[]>` added, returning `[]`. Keeps the
method surface stable so v1.5.0 can wire the real endpoint without touching
`mission-api.ts` again.

---

## Test suite

| | v1.3.3 | v1.4.0 |
|---|---|---|
| Test files | 11 | 11 |
| Tests | 291 | **298** |

Net change: +7. Eight tests removed (four speculative cap tests removed with
H2, four demand-blocked display tests removed with H2); fifteen new tests
added across A1–A6, H3, and H6.

Notable additions:
- A1: progress bar uses `average_mission_time`; 45-min fallback when absent
- A2: evac label fires from `sensor.*_phase`; regression guard on stale `*_mission_phase` key
- A3: skips alert fires from numeric sensor; singular/plural grammar; no alert at `"0"`
- A4: vs-usual delta `▲`/`▼` with correct 30d average; suppressed below 5-mission threshold
- A5: `battery_cycles` populates popover; stale `charge_cycles` does not
- A6: pad bar renders from `pad_days_until_due`; stale `mop_pad_remaining_hours` suppressed
- H3: `room_coverage` / `alignment_confidence` fields in records do not cause errors
- H6: `fetchHazards()` returns `[]`

---

## Upgrade notes

No config changes required. Upgrading from any v1.3.x release is safe —
drop-in replacement.

Users on `roomba_plus` integration < v2.1.0 will see the same behaviour as
before for all cloud-sensor features (battery retention, coverage bar, WiFi
sparkline). The bug fixes (A1–A7) apply to all integration versions.

The Braava pad bar (A6) requires integration v2.1.4+. The fix uses
`sensor.*_pad_days_until_due` which was added in that release.
