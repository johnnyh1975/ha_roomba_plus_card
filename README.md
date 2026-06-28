# Roomba+ Card

[![HACS](https://img.shields.io/badge/HACS-Custom-orange.svg)](https://github.com/hacs/integration)
[![Version](https://img.shields.io/badge/version-2.0.4-blue.svg)](https://github.com/johnnyh1975/ha_roomba_plus_card/releases)
[![HACS installs](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=johnnyh1975&repository=ha_roomba_plus_card&category=dashboard)

The companion Lovelace card for the [`roomba_plus`](https://github.com/johnnyh1975/roomba_plus) Home Assistant integration. A persistent header shows live status and one-tap actions; four tabs — **Map**, **History**, **Health**, **⚙** — hold everything else, so the card only shows what's relevant to what you're checking right now.

> **Requires:** `roomba_plus` integration ≥ 2.8.6 · Home Assistant ≥ 2024.1

Works with all iRobot models: 600-series, 900/980, i/s/j-series, and Braava m6. The card detects your robot's capabilities automatically — nothing to configure per model.

> **v2.0 is a full redesign.** The previous six-zone stacked layout (v1.x) is replaced entirely by a persistent header + tab architecture. If you're upgrading, your existing config still works — `show_rooms` / `show_health` / `show_schedule` / `show_alerts` / `show_history` continue to gate their respective content inside the new tabs. `show_settings` is deprecated in favour of `mode: companion` (see below) but still works as an alias.

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

That's it. The card auto-discovers all companion sensors and adapts to your robot's tier (NONE / EPHEMERAL / SMART).

---

## Layout

**Persistent header** — always visible, regardless of which tab is open. Shows live state (Docked / Cleaning / Paused / Error / Recharging) and at most two action buttons (three while Paused) — never a static row of every possible action. While cleaning on a SMART robot, the current room and percentage complete appear inline. Tapping **Rooms…** expands a chip-based room picker beneath the header; selecting any rooms swaps the header's action button to **Start N selected rooms**.

**Map tab** *(SMART and EPHEMERAL robots, standalone mode only)* — the GridStore coverage heatmap with hazard pins (stuck spots, robot-learned obstacles, keep-out zones). On SMART robots with a calibrated map, room boundaries overlay the heatmap — tap a room to select it for a targeted clean, sharing the same selection as the header's room picker. Room labels show the area too when available (e.g. "Kitchen / 20.0 m²", integration ≥ 2.9.1) — and just the name when it isn't, with no error either way. EPHEMERAL robots (e.g. the 980) get the heatmap and hazard pins without named room boundaries, plus an automatically-sharpening floor outline once a few missions have run.

**History tab** — 7/14/28-day calendar heatmap. Tap any day for per-mission detail: duration, area, a merged room sequence + coverage row, WiFi signal sparkline, and dirt event count. Streak, completion rate, and lifetime stats in a collapsible footer. In `mode: companion`, this tab also gets a Calendar/Coverage sub-tab toggle, since the Map tab itself is hidden in that mode.

**Health tab** — a single 0–100 robot health score (when the integration supports it) with a colour band, collapsed by default; tap **Show details** for the individual filter/brush/battery/tank bars underneath. A wheel/contact/bin maintenance calendar sits below that. The tab icon gets a small badge dot whenever the score drops below 60, a maintenance sensor is over 90 days old, or any of the existing alert conditions (filter/brush wear, navigation quality, consecutive skipped cleans) are active.

**⚙ tab** — schedule + presence intelligence, the settings panel (edge clean / always finish / carpet boost), room targeting (standalone mode), and maintenance service-call references for Developer Tools.

**History tab badge** — lights up specifically for a WiFi signal dead-zone detected during the last mission; this is intentionally narrower than the Health badge so a connectivity issue doesn't get buried among performance alerts.

---

## Multiple robots & household view

Add an `entities:` list to switch between robots with a dropdown:

```yaml
type: custom:roomba-plus-card
entities:
  - vacuum.roomba_downstairs
  - vacuum.roomba_upstairs
```

The same dropdown also offers **📊 Household summary** — selecting it replaces the header and tabs with a combined view across all configured robots (completion rate, area, and floor breakdown for the last 28 days). A **← Back** chip returns to the per-robot view. The card remembers the last active robot between sessions.

---

## Companion mode (use alongside xiaomi-vacuum-map-card)

Roomba+ Card and [xiaomi-vacuum-map-card](https://github.com/PiotrMachowski/lovelace-xiaomi-vacuum-map-card) (XVMC) are designed to work **together**: XVMC handles the live floor plan, robot position, and room-tap-to-clean; Roomba+ Card handles status, intelligence, history, and health. When both are present, set `mode: companion` — this hides the Map tab and the header's **Rooms…** picker, since XVMC already owns spatial interaction and room selection.

```yaml
type: custom:roomba-plus-card
entity: vacuum.roomba
mode: companion
```

**Requires:** xiaomi-vacuum-map-card ≥ v2.0 · roomba_plus integration ≥ v2.7.0

> ⚠️ Live path maps require robot firmware < 3.20. On firmware 3.20+ XVMC shows the last-known static map.

### Single robot

```yaml
type: horizontal-stack
cards:
  - type: custom:xiaomi-vacuum-map-card
    entity: vacuum.roomba
    map_camera: image.roomba_coverage_map
    calibration_source:
      camera: true      # reads calibration from entity attributes
    rooms:
      attribute: rooms  # reads room polygons from entity attributes

  - type: custom:roomba-plus-card
    entity: vacuum.roomba
    mode: companion
```

### Two robots, two floors

Each XVMC instance is pinned to one robot — no selector needed there. The Roomba+ Card carries the robot/household selector and switches its own analytics underneath; `robot_selector_helper` keeps a Text helper in sync if you want other cards (or `conditional` cards) to react to which robot is active.

```yaml
# 1. Create a Text helper: Settings → Helpers → Text → name it "active_roomba"

type: vertical-stack
cards:
  - type: horizontal-stack
    cards:
      - type: conditional
        conditions:
          - condition: state
            entity: input_text.active_roomba
            state: vacuum.roomba_downstairs
        card:
          type: custom:xiaomi-vacuum-map-card
          entity: vacuum.roomba_downstairs
          map_camera: image.roomba_downstairs_coverage_map
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
          map_camera: image.roomba_upstairs_coverage_map
          calibration_source:
            camera: true

  - type: custom:roomba-plus-card
    entities:
      - vacuum.roomba_downstairs
      - vacuum.roomba_upstairs
    mode: companion
    robot_selector_helper: input_text.active_roomba
```

Switching robots in the Roomba+ dropdown writes the selected entity ID to `input_text.active_roomba`; the conditional cards react automatically. Selecting **📊 Household summary** in the dropdown does *not* change `input_text.active_roomba` — the XVMC cards stay showing whichever robot was last individually selected, since a combined household view has no single floor plan to show.

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
    mode: companion
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

The card's CSS variables chain from HA theme tokens and are compatible with Bubble Card themes out of the box — no extra CSS needed. **Health score colour is the one exception**: `--rpc-green` is a fixed `#4ade80`, not theme-derived, because some themes (including Casa5HeyneV2) redefine `--state-active-color` in ways that previously made the health bars render amber instead of green. This is intentional, not a bug — health-status colour must stay consistent regardless of theme.

---

## All configuration options

```yaml
type: custom:roomba-plus-card

# Robot(s) — use entity: for one robot, entities: for multiple
entity: vacuum.roomba_i7
# entities:
#   - vacuum.roomba_downstairs
#   - vacuum.roomba_upstairs

# v2.0: 'standalone' (default) shows the Map tab and header room picker.
# 'companion' hides both — use when xiaomi-vacuum-map-card is also present.
mode: standalone        # standalone | companion

# v2.0: override which tab opens first. Defaults: Map for standalone
# SMART/EPHEMERAL robots, History otherwise.
# default_tab: map       # map | history | health | settings

# Show/hide content within tabs (all default to true)
show_rooms: true
show_health: true
show_schedule: true
show_alerts: true
show_history: true

# Settings panel (edge clean / always finish / carpet boost / pass count) —
# lives in the ⚙ tab, independent of room-targeting capability.
# show_settings: true   # deprecated v2.0 — use mode: companion instead

# History
history_days: 28        # 7 | 14 | 28
show_lifetime: true     # collapsible lifetime stats footer
show_dirt_events: false # dirt event count in day detail (cloud required)

# Units — auto follows your HA unit system
area_unit: auto         # auto | sqft | m2

# Presence dots in the ⚙ tab's schedule section
presence_entities:
  - person.alice
  - person.bob

# For xiaomi-vacuum-map-card sync — see Companion mode section above
robot_selector_helper: input_text.active_roomba
```

---

## Robot compatibility

| Feature | 600-series | 900/980 | i/s/j-series | Braava m6 |
|---|---|---|---|---|
| Header + controls | ✅ | ✅ | ✅ | ✅ |
| Room selector / targeting | ❌ | ✅ | ✅ | ✅ |
| Consumable bars | Filter only | ✅ | ✅ | Pad + tank |
| Map tab (heatmap + hazard pins) | ❌ | ✅ ¹ | ✅ | ❌ |
| Room boundary overlay on Map tab | ❌ | ❌ | ✅ (cloud, calibrated) | ❌ |
| Per-room coverage in day detail | ❌ | ❌ | ✅ (cloud) | ❌ |
| Robot health score | Depends on integration version and signal availability — see Known limitations | | | |
| Scheduling + presence | ✅ | ✅ | ✅ | ✅ |
| Demand cleaning | ✅ (cloud) | ✅ (cloud) | ✅ (cloud) | ✅ (cloud) |
| Lifetime stats | Cloud required | Cloud required | Cloud required | Cloud required |

¹ 980-series: firmware ≥ 3.20 has no pose data. Map tab heatmap requires an earlier firmware.

Features that say "cloud" require iRobot cloud credentials configured in the integration.

---

## Troubleshooting

**A tab or section is missing** — The card hides content when its backing entities are absent. Check that the `roomba_plus` integration is fully loaded and your robot has reported state at least once. Entities are named `sensor.<robot_name>_<key>` — see the integration docs for the full list.

**Custom entity IDs** — If you've renamed entities, the card's auto-discovery will miss them. The affected section degrades silently (hidden, not broken). You can't override entity IDs in the card config; rename them back to the integration defaults or file an issue.

**Wrong area units** — Set `area_unit: m2` or `area_unit: sqft` explicitly to override the auto-detection.

**History not loading** — Requires integration ≥ 1.8.0. Older builds return a 404 on the history endpoint; the card shows "History requires Roomba+ v1.8 or later".

**Health score says "Calibrating…"** — The integration needs at least 20 missions in the last 30 days and at least 3 of its 5 input signals available before it will compute a score. This is expected on a newly set up robot or one that's recently had its mission history reset; it resolves on its own with normal use.

---

## Known limitations

**English only** — All UI labels are English. Date and time formatting follows your HA locale. Full translation support is planned for a future release.

**Keep-out polygon outlines** — Keep-out zone pins (🚫) on the Map tab show the zone centroid only, not the full polygon boundary. Full polygon rendering requires the integration to surface UMF polygon data in the hazards API endpoint.

**Cleaned rooms sequence** — The room sequence in today's day detail popover reflects the most recent mission only (sourced from a live vacuum entity attribute). Historical missions show room coverage percentages but not the room order.

**Mission anomaly banner is built but not yet active** — The Health tab is wired to show a banner after 2+ consecutive anomalous missions, but the integration doesn't currently expose the data this needs (`consecutive_anomalous` on `last_mission_result`). The card-side code activates automatically once a future integration release adds it — no card update will be required.

**Header "Start selected rooms" has no loading spinner** — Selecting rooms via the Map tap-to-select overlay or the header chip picker and tapping the resulting "Start N selected rooms" button sends the command correctly, but the button itself doesn't show a sending-in-progress spinner (the room-targeting panel's own button in the ⚙ tab does, if visible). Cosmetic only — the command still goes through.

**Household view has no loading skeleton** — Switching to "📊 Household summary" before the household data has finished loading shows only the "← Back" chip until data arrives, rather than a placeholder.

**Door markers and zone overlays on EPHEMERAL robots** — Not yet available. The integration detects zone divisions for EPHEMERAL robots internally but doesn't currently expose them in a form the card can draw. This is on the integration's roadmap; the card's overlay mechanism (already used for SMART room boundaries) will support it without any card-side changes once the integration adds it.

---

## Development

```bash
npm install
npm run build   # → dist/roomba-plus-card.js
npm test        # 439 tests
```

---

## License

MIT
