# v0.1-beta — Initial release

First public beta of the Roomba+ Card, a full-featured Lovelace card for the [`roomba_plus`](https://github.com/johnnyh1975/roomba_plus) Home Assistant integration.

## Requirements

- `roomba_plus` integration ≥ **1.8.0**
- Home Assistant ≥ **2024.1**

---

## What's in this release

### Six display zones

**Status** — Live robot state with a blinking dot during cleaning, animated estimated-progress bar, area cleaned and time remaining during missions, and a ▲/▼ delta against your 30-day average (shown once you have 5+ missions of history). Quick-action buttons — Start, Pause, Resume, Return home, Locate — with per-button loading spinners and a 5-second safety reset if the state change never arrives. Locate pulses for exactly 2 seconds. Recharge-and-resume mid-mission state is shown when the robot docks to recharge before continuing.

**Rooms** — Tap-to-select room chips drawn from your smart map or zone list. Chips support multi-select; a count badge shows how many rooms are queued. Passes selector (Auto / ×1 / ×2) sits above the action button and syncs to the `select.*_cleaning_passes` entity. "Repeat last" shortcut appears when the integration has a previous command to replay.

**Health** — Consumable bars for Filter, Brush (vacuums), Pad and Tank (Braava), Battery, and Clean Base. Bars are colour-coded green → amber → red against their integration thresholds. Wear trend arrows (↑ normal / → fast / ↓ slow) appear when the L4 wear-rate sensors are present. Tap any bar for an inline detail popover showing last-replaced date, remaining hours, and a "Mark as replaced" button that calls the integration's reset service. Battery reads from a dedicated sensor when available, falling back to the vacuum entity's `battery_level` attribute so it always shows.

**Schedule & Presence** — Next scheduled clean time. Schedule hold badge with three states: active (green), manually held (amber, tap to toggle), and presence-managed (blue, tap for explanation). Presence dots show home/away status for each person listed in `presence_entities`.

**Alerts** — Zone is absent when the robot is healthy; it expands with an animation when something needs attention. Priority queue: errors → bin full / not ready → filter wear → brush wear. Error alerts include the human-readable description and suggested action from the integration. "Bin full — empty to continue" and "Robot not ready — check the app" replace the generic "Maintenance due" text (Wave A readiness refinement). Alert zone has a 100ms collapse debounce to prevent flicker if state briefly bounces.

**History** — 28-day (configurable: 7 / 14 / 28) heatmap calendar. Green = completed, amber = stuck, red = error, grey = no mission. Streak and 30-day completion rate summary bar above the grid. Problem zone callout when one room has caused repeated stuck events. Tap any day cell to open a mission detail popover; shows per-mission start time, duration, area, and zones when the API provides them, or honest aggregate data when it doesn't. History refreshes automatically when a mission completes.

### Automatic robot detection

The card detects capabilities from entity presence — no `robot_model` config key needed. 600-series robots hide the area metrics and room selector. Braava shows the pad/tank bars and mop config row instead of the brush bar. s9+ shows the Clean Base bar. All detection is silent and graceful: unrecognised entities produce no errors, they simply don't render their zone.

---

## Wave A additions (shipped in v0.1)

Per the companion spec, these features were confirmed for the initial release:

- **Repeat last mission button** — one-tap shortcut alongside "Clean selected"
- **Cleaning passes selector** — Auto / ×1 / ×2, synced bidirectionally with the `select.*_cleaning_passes` entity
- **Area cleaned today** (900+ / i / s / j / Braava) — second line during active missions: "412 ft² already today · 2nd mission"
- **Readiness-specific alert text** — specific reason instead of generic "Maintenance due"

Wave B (presence analytics, next likely window, settings panel, nav quality alert) and Wave C (lifetime stats row, dirt detection in day detail) are planned for future releases.

---

## Known limitations

**No visual diff rendering** — the card rebuilds its full DOM on every Home Assistant state update. Open popovers re-run their entry animation when any unrelated entity changes. This is a known architectural constraint of the string-template renderer and will be addressed in a future release.

**Per-mission detail in day popover** — the day detail popover shows actual per-mission start times, durations, and zones only when `roomba_plus` returns `missions[]` in the history API response. Older integration builds return aggregate data only; the card shows "Per-mission detail not available" in that case rather than fabricating values.

**History requires an active API connection** — the heatmap fetches from `/api/roomba_plus/{entry_id}/mission_history`. If the integration's API endpoint returns 404 (pre-1.8 installs), the zone shows a clear error message rather than silently failing.

---

## Installation

**HACS (recommended)**

1. HACS → Frontend → ⋮ → Custom repositories
2. Add this repo URL · Category: **Lovelace**
3. Download → reload browser

**Manual**

Copy `roomba-plus-card.js` to `config/www/`, then add the resource:

```yaml
url: /local/roomba-plus-card.js
type: module
```

**Minimum config**

```yaml
type: custom:roomba-plus-card
entity: vacuum.your_roomba
```

**Full config**

```yaml
type: custom:roomba-plus-card
entity: vacuum.your_roomba
history_days: 28        # 7 | 14 | 28
area_unit: auto         # auto | sqft | m2
show_health: true
show_schedule: true
show_alerts: true
show_history: true
show_rooms: true
presence_entities:
  - person.alice
  - person.bob
```

---

## Bug reports

Please include your `roomba_plus` integration version, HA version, and robot model. Screenshots of the card alongside the browser console are helpful for rendering issues.
