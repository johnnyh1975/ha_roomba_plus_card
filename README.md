# Roomba+ Card

[![HACS](https://img.shields.io/badge/HACS-Custom-orange.svg)](https://github.com/hacs/integration)
[![Version](https://img.shields.io/badge/version-1.6-blue.svg)](https://github.com/johnnyh1975/ha_roomba_plus_card/releases)
[![HACS installs](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=johnnyh1975&repository=ha_roomba_plus_card&category=dashboard)

The companion Lovelace card for the [`roomba_plus`](https://github.com/johnnyh1975/roomba_plus) Home Assistant integration. One card surfaces everything about your Roomba or Braava — current status, room selector, consumable health, scheduling, alerts, and 28-day cleaning history.

> **Requires:** `roomba_plus` integration ≥ 2.4.0 · Home Assistant ≥ 2024.1

Works with all iRobot models: 600-series, 900/980, i/s/j-series, and Braava m6. The card detects your robot's capabilities automatically — nothing to configure per model.

---

## Installation

### Via HACS (recommended)

1. Open **HACS → Frontend → ⋮ → Custom repositories**
2. Add `https://github.com/johnnyh1975/ha_roomba_plus_card` · Category: **Dashboard**
3. Click **Download** and reload the browser

### Manual

Copy `dist/roomba-plus-card.js` to `config/www/roomba-plus-card.js`, then add to **Settings → Dashboards → Resources**:

```yaml
url: /local/roomba-plus-card.js
type: module
```

---

## Quick start

Minimum config — paste this into your dashboard YAML editor:

```yaml
type: custom:roomba-plus-card
entity: vacuum.your_roomba
```

That's it. The card auto-discovers all companion sensors and adapts to your robot.

---

## What the card shows

**Status** — Live state with context: cleaning with area and time remaining, mid-mission recharge with resumption countdown, error with description and recovery hint. During a room-targeted clean: the current target room. After docking: which rooms were cleaned and how long ago. Quick actions: Start, Pause, Resume, Return home, Locate.

**Rooms** — Tap room chips to target specific areas. Set pass count (Auto / ×1 / ×2). Repeat last mission in one tap. Settings panel for edge clean, always finish, and carpet boost mode.

**Health** — Colour-coded bars for filter, brush, battery, tank, and Clean Base. Tap any bar to see exact hours remaining, last replacement date, and a one-tap reset. Wear trend arrows show whether each consumable is wearing faster or slower than normal. Battery health (capacity retention, charge cycles, estimated end-of-life) and floor coverage bars when supported.

**Schedule & Presence** — Next scheduled clean, presence-derived likely window, and analytically-derived optimal window (★). Hold badge shows whether the schedule is paused manually or by presence automation. Presence dots per person. Weekly clean opportunities vs utilisation.

**Alerts** — Collapsed when the robot is healthy. Surfaces the highest-priority issue: errors, bin full, filter/brush wear, navigation degradation, missed cleaning windows.

**History** — 28-day calendar heatmap. Switch to a coverage heatmap tab on supported robots (i/s/j-series with pose data). Tap any day for per-mission detail: duration, area, room coverage fractions, WiFi signal quality, and — for today's most recent mission — the room sequence. Streak, completion rate, and lifetime stats in a collapsible footer.

**Household** *(2+ robots)* — Combined completion rate and area across all robots for the last 28 days, with per-robot and per-floor breakdowns.

---

## Multiple robots

Add an `entities:` list to switch between robots with a dropdown:

```yaml
type: custom:roomba-plus-card
entities:
  - vacuum.roomba_downstairs
  - vacuum.roomba_upstairs
```

The card remembers the last active robot between sessions.

---

## All configuration options

```yaml
type: custom:roomba-plus-card

# Robot(s) — use entity: for one robot, entities: for multiple
entity: vacuum.roomba_i7
# entities:
#   - vacuum.roomba_downstairs
#   - vacuum.roomba_upstairs

# Show/hide zones (all default to true)
show_rooms: true
show_health: true
show_schedule: true
show_alerts: true
show_history: true

# Settings panel (edge clean / always finish / carpet boost / pass count)
# When show_rooms: false the settings panel moves into the Status zone
show_settings: true

# History
history_days: 28        # 7 | 14 | 28
show_lifetime: true     # collapsible lifetime stats footer
show_dirt_events: false # dirt event count in day detail (cloud required)

# Units — auto follows your HA unit system
area_unit: auto         # auto | sqft | m2

# Presence dots in the Schedule zone
presence_entities:
  - person.alice
  - person.bob

# For xiaomi-vacuum-map-card integration — see section below
robot_selector_helper: input_text.active_roomba
```

---

## Using with xiaomi-vacuum-map-card

Roomba+ Card and [xiaomi-vacuum-map-card](https://github.com/PiotrMachowski/lovelace-xiaomi-vacuum-map-card) are designed to work **together**: the map card handles spatial interaction (floor plan, live position, tap-to-clean), Roomba+ Card handles intelligence (history, health, alerts, scheduling).

**Requires:** xiaomi-vacuum-map-card ≥ v2.0 · roomba_plus integration ≥ v2.3.0

> ⚠️ Live path maps require robot firmware < 3.20. On firmware 3.20+ the xiaomi card shows the last-known static map.

### Single robot

```yaml
type: horizontal-stack
cards:
  - type: custom:xiaomi-vacuum-map-card
    entity: vacuum.roomba
    map_camera: image.roomba_cleaning_map
    calibration_source:
      camera: true      # reads calibration from entity attributes
    rooms:
      attribute: rooms  # reads room polygons from entity attributes

  - type: custom:roomba-plus-card
    entity: vacuum.roomba
    show_rooms: false   # xiaomi handles room selection
    show_settings: true
```

### Two robots, two floors

```yaml
# 1. Create a Text helper: Settings → Helpers → Text → name it "active_roomba"

type: vertical-stack
cards:
  - type: custom:roomba-plus-card
    entities:
      - vacuum.roomba_downstairs
      - vacuum.roomba_upstairs
    show_rooms: false
    show_settings: true
    robot_selector_helper: input_text.active_roomba

  - type: conditional
    conditions:
      - condition: state
        entity: input_text.active_roomba
        state: vacuum.roomba_downstairs
    card:
      type: custom:xiaomi-vacuum-map-card
      entity: vacuum.roomba_downstairs
      map_camera: image.roomba_downstairs_cleaning_map
      calibration_source:
        camera: true

  - type: conditional
    conditions:
      - condition: state
        entity: input_text.active_roomba
        state: vacuum.roomba_upstairs
    card:
      type: custom:xiaomi-vacuum-map-card
      entity: vacuum.roomba_upstairs
      map_camera: image.roomba_upstairs_cleaning_map
      calibration_source:
        camera: true
```

Switching robots in the Roomba+ dropdown writes the selected entity ID to `input_text.active_roomba`. The conditional cards react automatically.

### Using with Bubble Card

Place the card inside a Bubble Card pop-up. Use `robot_selector_helper` to wire the active robot to a Bubble Card button row:

```yaml
# Pop-up card (top-level in your dashboard, not inside a stack)
type: custom:bubble-card
card_type: pop-up
hash: "#roomba"

cards:
  - type: custom:roomba-plus-card
    entities:
      - vacuum.roomba_downstairs
      - vacuum.roomba_upstairs
    robot_selector_helper: input_text.active_roomba
    show_rooms: false
    show_settings: true
```

```yaml
# Trigger button in your Horizontal Buttons Stack
type: custom:bubble-card
card_type: button
button_type: custom
name: Roomba
icon: mdi:robot-vacuum
tap_action:
  action: navigate
  navigation_path: "#roomba"
```

The card's CSS variables chain from HA theme tokens and are compatible with Bubble Card themes out of the box — no extra CSS needed.

---

## Robot compatibility

| Feature | 600-series | 900/980 | i/s/j-series | Braava m6 |
|---|---|---|---|---|
| Status + controls | ✅ | ✅ | ✅ | ✅ |
| Room selector | ❌ | ✅ | ✅ | ✅ |
| Consumable bars | Filter only | ✅ | ✅ | Pad + tank |
| Coverage heatmap | ❌ | ❌ ¹ | ✅ | ❌ |
| Per-room coverage | ❌ | ❌ | ✅ (cloud) | ❌ |
| Scheduling + presence | ✅ | ✅ | ✅ | ✅ |
| Demand cleaning | ✅ (cloud) | ✅ (cloud) | ✅ (cloud) | ✅ (cloud) |
| Lifetime stats | Cloud required | Cloud required | Cloud required | Cloud required |

¹ 980-series: firmware ≥ 3.20 has no pose data. Coverage heatmap requires an earlier firmware.

Features that say "cloud" require iRobot cloud credentials configured in the integration.

---

## Troubleshooting

**A zone is missing** — The card hides zones when their backing entities are absent. Check that the `roomba_plus` integration is fully loaded and your robot has reported state at least once. Entities are named `sensor.<robot_name>_<key>` — see the integration docs for the full list.

**Custom entity IDs** — If you've renamed entities, the card's auto-discovery will miss them. The affected zone degrades silently (hidden, not broken). You can't override entity IDs in the card config; rename them back to the integration defaults or file an issue.

**Wrong area units** — Set `area_unit: m2` or `area_unit: sqft` explicitly to override the auto-detection.

**History not loading** — Requires integration ≥ 1.8.0. Older builds return a 404 on the history endpoint; the card shows "History requires Roomba+ v1.8 or later".

---

## Known limitations

**English only** — All UI labels are English. Date and time formatting follows your HA locale. Full translation support is planned for a future release.

**Keep-out polygon outlines** — Keep-out zone pins (🚫) show the zone centroid only, not the full polygon boundary. Full polygon rendering requires the integration to surface UMF polygon data in the hazards API endpoint.

**Cleaned rooms sequence** — The room sequence in today's day detail popover reflects the most recent mission only (sourced from a live vacuum entity attribute). Historical missions show room coverage percentages but not the room order.

---

## Development

```bash
npm install
npm run build   # → dist/roomba-plus-card.js
npm test        # 367 tests
```

---

## License

MIT
