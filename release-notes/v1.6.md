# v1.6.0 — Room, Scheduling & Energy Intelligence

Surfaces the integration v2.3 and v2.4 features in a single release. Both
integration gates were cleared simultaneously — combining them keeps the user
experience cohesive and reduces HACS update friction.

**Requires:** `roomba_plus` ≥ 2.4.0 · Home Assistant ≥ 2024.1

---

## F11 — Mission destination & cleaned rooms in Status zone

**During a clean:** When the robot is executing a room-targeted mission, the
current target room appears below the progress bar:

```
████░░░░░░  ~23 min remaining
→ Targeting: Walk-in Closet
```

Sourced from the `mission_destination` attribute on the vacuum entity (integration
v2.3 CR4). Absent for whole-home missions and when the robot is paused or
mid-mission recharging.

**After docking:** The rooms cleaned in completion order appear as a chip row
below the "Last cleaned" line:

```
Last cleaned: 14 hours ago
🛁 Bathroom · 🚪 Hallway · 🍳 Kitchen · 🛏 Bedroom · 👗 Walk-in Closet
```

Sourced from the `last_cleaned_rooms` attribute (integration v2.3 CR4). Room
icons resolved via `region_icons` attribute using the existing MDI→emoji map.
Empty array (whole-home clean) hides the row.

---

## F12 — Cleaned rooms sequence in today's day detail popover

When tapping today in the history heatmap, the last mission's room sequence
is shown above the coverage chips:

```
✓  07:14  37 min  412 ft²
   🛁 Bathroom → 🚪 Hallway → 🍳 Kitchen → 🛏 Bedroom
   Kitchen 75% · Hallway 60% · Bathroom 58%
```

When `mission_destination` is present, a "→ Final: X" line follows the sequence.

**Limitation:** The sequence is only available for today's most recent mission.
This is an integration constraint — `last_cleaned_rooms` is a live vacuum
entity attribute, not per-mission historical data. Historical missions show
room coverage chips (F8) without the sequence. Per-mission sequence history
would require `format=records` to carry traversal data — a future integration
addition.

---

## F13 — Demand cleaning indicator in Status zone

When `binary_sensor.*_demand_clean_blocked` is `on` (floor is dirty but the
home is occupied), an amber indicator appears below the docked state:

```
● Docked
🧹 Floor needs cleaning — waiting for home to be empty
Last cleaned: 2 days ago
```

The `[demand]` badge in the day detail popover (shipped in v1.3.3) is now
meaningful — missions with `initiator === "demand"` appear in history records
from integration v2.4.

New capability flag: `hasDemandBlocked`.

---

## F14 — Lifetime energy display in Health zone

When `sensor.*_total_energy_consumed` is present (integration v2.4 F12e), a
lifetime energy row appears below the battery retention bar:

```
Energy    ~42.3 kWh lifetime
```

Tapping opens a popover with charge cycle context and an Energy dashboard
suggestion. No colour coding — informational only.

New capability flag: `hasEnergyConsumption` (re-added from v1.4 where it was
removed as speculative).

---

## F15 — Optimal clean window in Schedule zone

When `sensor.*_optimal_clean_window` is present (integration v2.4 F12a), an
analytically-derived window line appears in the Schedule zone:

```
Next scheduled      Tue 09:00
Next likely window  Wed ~11:00
Optimal window      Thu 10:30 ★
```

The `★` distinguishes the statistical optimal from the presence-derived
likely window. The zone renders even when the scheduled and likely window
sensors are absent (optimal window alone is sufficient).

New capability flag: `hasOptimalWindow`.

---

## F16 — Dirt density encoding in heatmap

When `relative_to_baseline` is present in `DaySummary` records (integration
v2.4 F12b, `format=summary`), heatmap cell opacity varies proportionally:

- `relative_to_baseline = 1.0` → full opacity (normal day)
- `relative_to_baseline = 2.0` → full opacity (double the usual dirt)
- `relative_to_baseline = 0.5` → reduced opacity (cleaner than usual)

Opacity is clamped to a minimum of 0.5 so no cell becomes invisible. The
semantic result colour (green/amber/red) is unchanged — density modulates
intensity independently of the pass/fail result. Absent for the first 30 days
while the baseline accumulates (cells render at full opacity as before).

---

## F17 — Household panel

When `config.entities` contains 2+ robots and the integration exposes the
household endpoint (integration v2.3 F10b), a Household zone renders below
the History zone:

```
HOUSEHOLD — LAST 28 DAYS

  Downstairs    100%   5 missions · 1,240 ft²
  Upstairs       75%   4 missions · 860 ft²

  ─────────────────────────────────
  Combined       89%   9 missions · 2,100 ft²
```

When floor labels are configured, robots are grouped by floor. The panel is
fully absent on single-robot installs — the endpoint is not fetched.

---

## Test suite

| | v1.5.0 | v1.6.0 |
|---|---|---|
| Test files | 11 | **12** |
| Tests | 326 | **367** |

Net change: +41. New test file: `tests/zones/household-zone.test.ts` (+10).

---

## Upgrade notes

Requires `roomba_plus` ≥ 2.4.0. Users on earlier integration versions continue
to work — all new features degrade gracefully when their backing entities or
API fields are absent.

No configuration changes required. Drop-in replacement from any v1.5.x release.

For multi-robot installs: the household panel appears automatically once the
integration is updated and a successful fetch returns data. No config changes needed.
