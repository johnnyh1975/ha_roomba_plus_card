# Roomba+ Card

[![HACS](https://img.shields.io/badge/HACS-Custom-orange.svg)](https://github.com/hacs/integration)
[![Version](https://img.shields.io/badge/version-2.3-blue.svg)](https://github.com/johnnyh1975/ha_roomba_plus_card/releases)
[![HACS installs](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=johnnyh1975&repository=ha_roomba_plus_card&category=dashboard)

The companion Lovelace card for the [`roomba_plus`](https://github.com/johnnyh1975/roomba_plus) Home Assistant integration. A persistent header shows live status and one-tap actions; four tabs — **Map**, **History**, **Health**, **⚙** — hold everything else, so the card only shows what's relevant to what you're checking right now.

> **Requires:** `roomba_plus` integration ≥ 2.8.6 · Home Assistant ≥ 2024.1
> Full v2.3 feature set (mission coverage replay, per-room cleaning rhythm, hazard time patterns, dirt-sensor correlation) needs integration ≥ **3.3.0** — everything degrades gracefully on older versions, feature by feature.

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

**Persistent header** — always visible, regardless of which tab is open. Shows live state (Docked / Cleaning / Paused / Error / Recharging) and at most two action buttons (three while Paused) — never a static row of every possible action. While cleaning on a SMART robot, the current room and percentage complete appear inline. Tapping **Rooms…** expands a chip-based room picker beneath the header; selecting any rooms swaps the header's action button to **Start N selected rooms**. A small connectivity badge (☁ Robot/Cloud offline) appears beside the robot name only when the cloud or local MQTT link is degraded, and a firmware badge (⬆ FW) appears for 24 hours after a firmware change.

**Map tab** *(SMART and EPHEMERAL robots, standalone mode only)* — the GridStore coverage heatmap with hazard pins (stuck spots, robot-learned obstacles, keep-out zones). Stuck-hotspot pins show a time pattern when the integration has found one — "usually Mon ~9am" (integration ≥ 3.3.0) — with an explanatory footnote for pins that haven't hit the pattern-detection threshold yet, so those don't look silently broken. On SMART robots with a calibrated map, room boundaries overlay the heatmap — tap a room to select it for a targeted clean, sharing the same selection as the header's room picker. Room labels show the area too when available (e.g. "Kitchen / 20.0 m²", integration ≥ 2.9.1) — and just the name when it isn't, with no error either way. Robot-observed obstacle markers, keep-out zone outlines (full polygons, not just centroids), door markers, and furniture-shadow markers layer on top when the integration provides them (integration ≥ 3.3.0, aligned mode). EPHEMERAL robots (e.g. the 980) get the heatmap and hazard pins without named room boundaries, plus an automatically-sharpening floor outline once a few missions have run.

> **v2.3 fix:** room boundaries, calibration, and the new overlays above read from `image.*_map` — the integration's live cleaning-map entity. Prior versions read `image.*_coverage_map` (an unrelated GridStore diagnostic heatmap that has never carried this data), which likely meant the room-overlay feature never rendered for anyone, on any integration version, since it was built in v2.0.0. If you've configured xiaomi-vacuum-map-card's `map_camera` to `image.<robot>_coverage_map` following an older version of this README's companion-mode examples, update it to `image.<robot>_map` — see [Companion mode](#companion-mode-use-alongside-xiaomi-vacuum-map-card) below.

**History tab** — 7/14/28-day calendar heatmap. Calendar cell colours follow the same three-tier model as the mission icons: green = clean success, amber = ended with a caution (e.g. a battery error or cancellation), red = a genuine failure the robot never recovered from (v2.2 — previously amber and red were swapped relative to the icons). Tap any day for per-mission detail: duration, area, a merged room sequence + coverage row, WiFi signal sparkline, and dirt event count. On missions that didn't end cleanly, a **Why?** button asks the integration for a plain-language explanation — "Obstacle or blockage", "Excessive recharging", "Unusually dirty area", "Incomplete coverage" — judged against *this robot's own* mission history, with a recommended action (integration ≥ 3.2.0; now works on cloud-source rows too as of integration 3.3.0, not just local-history missions). A **Route** button replays the mission room by room with timestamps — "09:05 Kitchen → 09:23 Hallway → 09:31 Bedroom" (integration ≥ 3.2.1). A **Map** button replays the mission's actual coverage — room outlines with the points the robot really cleaned — rendered client-side from the integration's per-mission coverage data (integration ≥ 3.3.0; local-history missions only for now). Streak, completion rate, and lifetime stats in a collapsible footer, now including lifetime dirt-detection counters when those diagnostic sensors are enabled. In `mode: companion`, this tab also gets a Calendar/Coverage sub-tab toggle, since the Map tab itself is hidden in that mode.

**Health tab** — a single 0–100 robot health score (when the integration supports it) with a colour band, collapsed by default; tap **Show details** for the individual filter/brush/battery/tank bars underneath, plus a dock-health block (tank level and lifetime knockoff/charge-abort/contact-chatter counters) on Clean Base robots with those sensors enabled. Next to the score, a trend arrow (↗ improving / → stable / ↘ declining) judges the recent score against this robot's own learned baseline — and while that baseline is still building, the card shows the countdown ("trend in ~31d") instead of a silent blank (integration ≥ 3.2.0). Below the score, the integration's own plain-language status and recommendation appear when available ("Battery capacity is declining — keep an eye on the retention sensor", integration ≥ 3.1.0, localised server-side). Error handling is now honest about time: the alert banner only appears while an error is **actually active** on the robot; a resolved error shows as a muted "Last error: … · 6 days ago (resolved)" line instead of a permanent red banner (v2.2 fix). A wheel/contact/bin maintenance calendar sits below that. A **rooms-overdue block** (SMART + cloud, integration ≥ 3.3.0) lists which rooms are due for cleaning and by how much, with a **Clean overdue** button that starts a travel-optimized targeted clean of just those rooms — zero overdue shows a plain "All rooms in rhythm" rather than being hidden. An opt-in **dirt-correlation block** shows the strongest link the integration has found between mission dirt and any HA sensors you've configured to correlate against, or per-sensor progress toward the 30-sample threshold while still collecting data (integration ≥ 3.3.0, off by default). The tab icon gets a small badge dot whenever the score drops below 60, a maintenance sensor is over 90 days old, any of the existing alert conditions (filter/brush wear, navigation quality, consecutive skipped cleans) are active, the integration detects a room-layout change (integration ≥ 3.2.0), or any rooms are currently overdue (integration ≥ 3.3.0).

**⚙ tab** — schedule + presence intelligence, the settings panel (edge clean / always finish / carpet boost), room targeting (standalone mode), your iRobot-app favourite routines as one-tap buttons (auto-discovered; best with integration ≥ 3.0.0), and maintenance service-call references for Developer Tools.

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
    map_camera: image.roomba_map
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
          map_camera: image.roomba_downstairs_map
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
          map_camera: image.roomba_upstairs_map
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

# Favourites: no option needed. iRobot-app favourite routines are
# auto-discovered and shown as one-tap buttons in the ⚙ tab.
# (Best with integration ≥ 3.0.0 — see Known limitations.)

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
| Zone/door/furniture overlays on Map tab | ❌ | ❌ | ✅ (cloud, calibrated) | ❌ |
| Mission coverage replay (Map button) | ❌ | ❌ | ✅ (cloud) | ❌ |
| Per-room coverage in day detail | ❌ | ❌ | ✅ (cloud) | ❌ |
| Rooms-overdue widget + Clean-overdue button | ❌ | ❌ | ✅ (cloud) | ❌ |
| Dirt/sensor correlation (opt-in) | ❌ | ❌ | ✅ (cloud) | ❌ |
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

**Keep-out polygon outlines on hazard pins** — The 🚫 hazard pin itself (from the hazards endpoint) still shows the zone centroid only, not its boundary — that part of the endpoint is unchanged. As of integration ≥ 3.3.0, the Map tab's separate zone overlay draws the full keep-out polygon boundary alongside it (see Map tab above), so the boundary is visible via that layer even though the pin itself isn't.

**Cleaned rooms sequence** — The room sequence in today's day detail popover reflects the most recent mission only (sourced from a live vacuum entity attribute). Historical missions show room coverage percentages but not the room order.

**Header "Start selected rooms" has no loading spinner** — Selecting rooms via the Map tap-to-select overlay or the header chip picker and tapping the resulting "Start N selected rooms" button sends the command correctly, but the button itself doesn't show a sending-in-progress spinner (the room-targeting panel's own button in the ⚙ tab does, if visible). Cosmetic only — the command still goes through.

**Household view has no loading skeleton** — Switching to "📊 Household summary" before the household data has finished loading shows only the "← Back" chip until data arrives, rather than a placeholder.

**Door markers and zone overlays are SMART-tier for now** — Shipped as of integration ≥ 3.3.0 for SMART robots with an aligned map (see Map tab above). EPHEMERAL robots (900-series) get these only if the integration's aligner reaches aligned mode for that robot (via cloud UMF geometry) — not guaranteed on every EPHEMERAL setup. This is the same aligned-mode gate the existing room-boundary overlay already uses, not a new restriction.

**Favourites depend on the default entity-id naming** — Favourite buttons are discovered by their entity-id pattern (`button.<robot>_fav_<id>`). This is the same assumption the card already makes for every other robot entity (passes, repeat-mission, etc.), so renaming your vacuum entity's slug by hand would hide favourites along with those other controls. With integration ≥ 3.0.0 the default naming is stable and locale-independent; on older integrations the entity-ids derive from the user-chosen routine name and may not be discovered at all.

**The anomaly banner and navigation health need their sensors enabled** — Both the mission-anomaly banner and the navigation-health panel read sensors the integration ships **disabled by default** (`consecutive_mission_anomalies` for the banner; `nav_panics` / `nav_landmark_quality` / `nav_good_landmarks` for navigation health, all integration ≥ 3.0.0). Until you enable them in Home Assistant (Settings → Devices → your robot → the disabled entities), the card simply shows nothing in those spots — that's expected, not a fault. The anomaly banner additionally only appears once three consecutive missions have been flagged anomalous (two can be coincidence; three are a pattern).

**Dirt-detection counters and dock counters are disabled-by-default diagnostics too** — The lifetime dirt-detect line in the History stats footer (`optical_dirt_detections` / `piezo_dirt_detections` / `scrubs_count`) and the dock knockoff/charge-abort/contact-chatter counters in the Health tab's dock block follow the same pattern: enable the entities and the card picks them up; leave them disabled and those lines simply don't exist. `dock_tank_level` is the exception — it's enabled by default on robots that report it.

**Why? now works on cloud-source rows too** — As of integration ≥ 3.3.0, the explanation endpoint resolves cloud-source mission rows as well as local ones (previously a real limitation, tracked as of 3.2.1: cloud-source rows — typically gap-fillers for missions the local link missed — couldn't be resolved and didn't get the button). On integration < 3.3.0, that older limitation still applies.

**Route needs integration ≥ 3.2.1 and cloud enrichment** — The per-row mission counter that keys the replay endpoint ships with integration 3.2.1. On local-source rows it arrives via cloud backfill, so a mission may show its Route button a little after it first appears in the list — and never on cloud-less installs.

**Map (mission coverage replay) is local-history only** — Unlike Why?, the Map button's own record lookup (integration ≥ 3.3.0) hasn't been extended to resolve cloud-source rows — verified against source, this is a separate, still-open lookup path from the one Why? uses. Same `n_mssn` requirement as Route.

---

## Development

```bash
npm install
npm run build   # → dist/roomba-plus-card.js
npm test        # 733 tests
```

---

## License

MIT
