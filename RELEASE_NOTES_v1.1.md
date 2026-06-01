# v1.1 — Wave B + Wave C

Completes the full feature set defined in the companion spec. All Wave B and Wave C additions are included; nothing is deferred.

## Requirements

- `roomba_plus` integration ≥ **1.9.0**
- Home Assistant ≥ **2024.1**
- Upgrading from v0.1-beta: no config changes required. New features are auto-detected from entity presence.

---

## What's new

### Presence analytics (Wave B1)

A summary line appears below the presence dots once L6 (Presence-Aware Scheduling) has been running for at least a week:

```
● Alice away  ● Bob home
7 opportunities this week · 71% utilised
```

Sourced from `sensor.*_presence_clean_opportunities_7d` and `sensor.*_presence_clean_utilisation_7d`. Hidden automatically when either sensor is absent or in `unknown` state — which is the default for the first few days after enabling presence scheduling. No config required.

---

### Next likely clean window (Wave B2)

A second time row in the Schedule & Presence zone, below the fixed schedule:

```
Next scheduled     Tue 09:00
Next likely window Wed ~11:00
```

Derived from `sensor.*_next_likely_clean_window`. The `~` prefix signals that this is a heuristic estimate based on historical away patterns, not a committed time. Hidden until at least 3 presence windows have been recorded (typically 3–5 days after enabling presence scheduling).

---

### Cleaning settings panel (Wave B3)

A collapsed **⚙ Settings** row at the bottom of the Rooms zone. Tap to expand:

```
[ Kitchen ] [ Hallway ]
Passes: [ Auto ] [ ×1 ] [ ×2 ]
[ Clean selected ▶ ]   [ ↩ Repeat last ]
──────────────────────────────────────────
⚙ Settings ▼
  Edge clean  ○    Always finish  ○    Carpet boost  Auto ▼
```

Each setting calls its integration entity directly — no intermediate state. The entire row is hidden if none of the three entities exist on your robot. Individual settings are hidden if their entity doesn't exist. Carpet boost cycles through available options on each tap.

**Entity sources:**
- `switch.*_edge_clean` → on/off toggle
- `switch.*_always_finish` → on/off toggle  
- `select.*_carpet_boost_mode` → cycles through options

Robot-dependent: edge clean exists on most vacuums, carpet boost on carpet-capable models, always finish only with a Clean Base.

---

### Navigation quality alert (Wave B4)

A new entry in the alert priority queue (below wear-rate warnings). Fires when `sensor.*_nav_quality` drops below 60:

```
⚠️ Navigation quality low (42/100)
   Check lighting or move obstacles in the cleaning area.
```

Clears automatically when quality recovers. Hidden entirely on robots without VSLAM (600-series, most 900-series). No config required.

---

### Lifetime stats row (Wave C1)

A collapsed **Lifetime ▼** footer at the bottom of the history zone, sourced from the iRobot cloud (requires cloud credentials configured in the integration):

```
🔥 14-day streak · 92% completion rate
⚠ Bedroom — stuck 3× in 30 days
────────────────────────────────
Lifetime ▼
→ 847 missions · 2,341 m² · 1,247 h
```

Tap to expand. Hidden when any of the three cloud sensors are absent. Shown by default; set `show_lifetime: false` to suppress.

> **Note:** The iRobot cloud API exposes a true lifetime counter for mission count, but area and time are aggregated from the most recent ~30 days of history rather than a true lifetime total. This is an API limitation, not a card limitation. The integration annotates these sensors accordingly.

---

### Dirt detection in day detail (Wave C2)

When enabled, shows a dirt event count per mission in the day detail popover:

```
✓  07:14  37 min  412 ft²
   Kitchen · Hallway · 3 dirt events
```

**Requires `roomba_plus` ≥ v2.0** (adds `nScrubs` to mission records). Opt-in via config — defaults to `false` to prevent every mission showing "0 dirt events" on older integration versions:

```yaml
show_dirt_events: true
```

---

## iRobot mission state (v1.9.0 integration update)

This release also incorporates v1.9.0 integration entities that were not available at v0.1-beta launch:

**`binary_sensor.*_mission_active`** — distinguishes "docked mid-mission to recharge" from "mission complete". The card now:
- Shows **⚡ Recharging — resuming in ~N min** (with countdown from `sensor.*_mission_expire_time`) instead of a generic Docked state
- Shows the area-cleaned-today context line during mid-mission recharge, not just during active cleaning
- Offers a **✕ Cancel mission** button when docked mid-mission
- Refreshes history only on true mission completion (`mission_active: on → off`), not on every dock event

**`sensor.*_mission_phase`** — the `evac` phase (Clean Base emptying) now renders as **⬆ Emptying bin** instead of being indistinguishable from Cleaning.

Both entities are used when present; the card falls back to the previous detection method (recharge/expire sensor pair) on integration versions < 1.9.0.

---

## Config additions

Two new optional keys:

```yaml
type: custom:roomba-plus-card
entity: vacuum.your_roomba
show_lifetime: true        # Wave C1 (default: true, hidden when cloud sensors absent)
show_dirt_events: false    # Wave C2 (default: false — requires integration ≥ v2.0)
```

All other config keys from v0.1-beta are unchanged.

---

## Bug fixes

- **Double separator in day detail** — dirt events and zone names were joined with `· ·` instead of `·` when both were present. Zone-only rows (no dirt) showed a leading `·`.
- **Invalid Date in likely window** — a sensor state that isn't a valid timestamp no longer renders as "Invalid Date ~Invalid Date". The row is silently hidden.
- **NaN in presence analytics** — a sensor in error state with a non-numeric value no longer renders as "NaN opportunities this week". The row is silently hidden until valid data arrives.

---

## Known limitations

These carry over from v0.1-beta and remain unresolved:

**No visual diff rendering** — the card rebuilds its full DOM on every Home Assistant state update. Open popovers re-trigger their entry animation when any unrelated entity changes. Architectural fix deferred to a future release.

**Per-mission detail in day popover** — requires `roomba_plus` ≥ 1.8.0 to return `missions[]` in the history API response. The card shows "Per-mission detail not available" on older builds rather than fabricating data.
