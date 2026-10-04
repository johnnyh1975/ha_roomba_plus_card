# Roomba+ Card

[![HACS](https://img.shields.io/badge/HACS-Custom-orange.svg)](https://github.com/hacs/integration)
[![Version](https://img.shields.io/badge/version-3.0-blue.svg)](https://github.com/johnnyh1975/ha_roomba_plus_card/releases)
[![HACS installs](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=johnnyh1975&repository=ha_roomba_plus_card&category=plugin)

The companion Lovelace card for the [`roomba_plus`](https://github.com/johnnyh1975/ha_roomba_plus) Home Assistant integration. A persistent header shows live status and one-tap actions; four tabs — **Map**, **History**, **Care**, **⚙** — hold everything else, so the card only shows what's relevant to what you're checking right now.

> **Requires:** `roomba_plus` integration ≥ 4.2 — **4.2.20 / 4.3.0b8 recommended** (robot position, renamed rooms and Prime zones on the Map tab; 4.2.19 / 4.3.0b7 for Prime history and map pins) · Home Assistant ≥ 2025.5
> **v3.0** finds the robot's entities through Home Assistant's entity registry (renamed entities keep working), covers Prime / V4 robots fully, moves the Map tab onto the integration's room map, renames Health to **Care** and adds a **Card diagnostics** panel in ⚙ — see [release notes](release-notes/v3.0.0.md).
> The card checks both when it loads and shows a short notice at the top if either is older.
> Full v2.5 feature set (mission coverage replay including cloud-source rows, room accessibility scoring, per-room suggested cleaning intervals, Auto-clean dirty rooms, mission-map rotation, Gentle Mode, and per-robot fleet health) needs integration ≥ **3.4.3** — everything degrades gracefully on older versions, feature by feature.

Works with all iRobot models: 600-series, 900/980, i/s/j-series, Braava m6, and Prime / V4 robots (Combo 205/405/505, Max 705 …). The card detects your robot's capabilities automatically — nothing to configure per model. UI text follows your Home Assistant language automatically — see [Language support](#language-support) below.

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

That's it. The card finds the robot's entities through Home Assistant's entity registry — by device and the integration's internal keys, so renamed entities are found too — and adapts to your robot's tier (NONE / EPHEMERAL / SMART) and generation (Classic / Prime). In the visual editor the robot picker lists only `roomba_plus` robots.

---

## Layout

**Persistent header** — always visible, regardless of which tab is open. Shows live state (Docked / Cleaning / Paused / Error / Recharging) and at most two action buttons (three while Paused) — never a static row of every possible action. While cleaning on a SMART robot, the current room and percentage complete appear inline. Tapping **Rooms…** expands a chip-based room picker beneath the header; selecting any rooms swaps the header's action button to **Start N selected rooms**. A small connectivity badge (☁ Robot/Cloud offline) appears beside the robot name only when the cloud or local MQTT link is degraded, and a firmware badge (⬆ FW) appears for 24 hours after a firmware change.

**Map tab** *(v3.0, standalone mode)* — the integration's room map (`image.<robot>_rooms_map`, Classic and Prime) with the rooms drawn on it: tap a room to select it for cleaning, the same selection as the header's **Rooms…** picker. On Classic robots whose map the integration has matched to the robot's own position data, the coverage heatmap, stuck hotspots, door markers, furniture candidates and the robot's position are layers on that map (learned obstacles and keep-out zones follow once the integration delivers them reliably), each switchable with a chip below it. On Prime robots a floor switch (`select.<robot>_prime_map`) picks the map. The picture is cropped to the rooms and capped at 70 % of the screen height. Without a usable room map (no calibration or rooms yet, or a 980 without cloud) the tab shows the coverage view described next; on a Classic map not yet matched, that view follows below the room map.

**Map tab — coverage view** *(2.x, the fallback above)* — the GridStore coverage heatmap with hazard pins (stuck spots, robot-learned obstacles, keep-out zones). Stuck-hotspot pins show a time pattern when the integration has found one — "usually Mon ~9am" (integration ≥ 3.3.0) — with an explanatory footnote for pins that haven't hit the pattern-detection threshold yet, so those don't look silently broken. On SMART robots with a calibrated map, room boundaries overlay the heatmap — tap a room to select it for a targeted clean, sharing the same selection as the header's room picker. Room labels show the area too when available (e.g. "Kitchen / 20.0 m²", integration ≥ 2.9.1) — and just the name when it isn't, with no error either way. A room label also carries an accessibility-score tooltip on hover when the integration has computed one (0–100, plus which factor limits it most — obstacle density, narrow passages, or coverage gaps; integration ≥ 3.2.0 ROOM-ACCESS, same aligned-map gate as the room boundaries themselves). Robot-observed obstacle markers, keep-out zone outlines (full polygons, not just centroids), door markers, and furniture-shadow markers layer on top when the integration provides them (integration ≥ 3.3.0, aligned mode). EPHEMERAL robots (e.g. the 980) get the heatmap and hazard pins without named room boundaries, plus an automatically-sharpening floor outline once a few missions have run.

> **v2.3 fix:** room boundaries, calibration, and the new overlays above read from `image.*_map` — the integration's live cleaning-map entity. Prior versions read `image.*_coverage_map` (an unrelated GridStore diagnostic heatmap that has never carried this data), which likely meant the room-overlay feature never rendered for anyone, on any integration version, since it was built in v2.0.0. If you've configured xiaomi-vacuum-map-card's `map_camera` to `image.<robot>_coverage_map` following an older version of this README's companion-mode examples, update it to `image.<robot>_map` — see [Companion mode](#companion-mode-use-alongside-xiaomi-vacuum-map-card) below.

**History tab** — 7/14/28-day calendar heatmap. Calendar cell colours follow the same three-tier model as the mission icons: green = clean success, amber = ended with a caution (e.g. a battery error or cancellation), red = a genuine failure the robot never recovered from (v2.2 — previously amber and red were swapped relative to the icons). Tap any day for per-mission detail: duration, area, a merged room sequence + coverage row, WiFi signal sparkline, and dirt event count. On missions that didn't end cleanly, a **Why?** button asks the integration for a plain-language explanation — "Obstacle or blockage", "Excessive recharging", "Unusually dirty area", "Incomplete coverage" — judged against *this robot's own* mission history, with a recommended action (integration ≥ 3.2.0; now works on cloud-source rows too as of integration 3.3.0, not just local-history missions). A **Route** button replays the mission room by room with timestamps — "09:05 Kitchen → 09:23 Hallway → 09:31 Bedroom" (integration ≥ 3.2.1). A **Map** button replays the mission's actual coverage — room outlines with the points the robot really cleaned — rendered client-side from the integration's per-mission coverage data (integration ≥ 3.3.0; now works on cloud-source rows too as of integration 3.4.2, not just local-history missions), optionally rotated via `mission_map_rotate` to match your dashboard's orientation. Streak, completion rate, and lifetime stats in a collapsible footer, now including lifetime dirt-detection counters when those diagnostic sensors are enabled. In `mode: companion`, this tab also gets a Calendar/Coverage sub-tab toggle, since the Map tab itself is hidden in that mode.

**Care tab** *(called Health up to 2.5; `default_tab: health` still opens it)* — on Prime robots: each part in its own unit (hours, washes, emptyings), with a bar for parts that wear out; the station's status with **Empty bin**, **Wash pad** and the pad-drying switch. On Classic robots, as before: a single 0–100 robot health score (when the integration supports it) with a colour band, collapsed by default; tap **Show details** for the individual filter/brush/battery/tank bars underneath, plus a dock-health block (tank level and lifetime knockoff/charge-abort/contact-chatter counters) on Clean Base robots with those sensors enabled. Next to the score, a trend arrow (↗ improving / → stable / ↘ declining) judges the recent score against this robot's own learned baseline — and while that baseline is still building, the card shows the countdown ("trend in ~31d") instead of a silent blank (integration ≥ 3.2.0). Below the score, the integration's own plain-language status and recommendation appear when available ("Battery capacity is declining — keep an eye on the retention sensor", integration ≥ 3.1.0, localised server-side). Error handling is now honest about time: the alert banner only appears while an error is **actually active** on the robot; a resolved error shows as a muted "Last error: … · 6 days ago (resolved)" line instead of a permanent red banner (v2.2 fix). A wheel/contact/bin maintenance calendar sits below that. A **rooms-overdue block** (SMART + cloud, integration ≥ 3.3.0) lists which rooms are due for cleaning and by how much, with per-room suggested cleaning intervals once the integration has learned enough dirt-velocity data (same integration ≥ 3.3.0 ROOM-SCHED sensor — previously only its daily_suggested subset was surfaced) and a **Clean overdue** button that starts a travel-optimized targeted clean of just those rooms — zero overdue shows a plain "All rooms in rhythm" rather than being hidden. A second **Auto-clean dirty rooms** button (integration ≥ 3.3.0 SMART-ORDER, previously not surfaced) targets rooms dirtier than the household average by learned dirt index instead — a different signal than overdue-ness, so it's always available rather than hidden on a no-op check, falling back to a normal whole-house clean when no room qualifies. An opt-in **dirt-correlation block** shows the strongest link the integration has found between mission dirt and any HA sensors you've configured to correlate against, or per-sensor progress toward the 30-sample threshold while still collecting data (integration ≥ 3.3.0, off by default). The tab icon gets a small badge dot whenever the score drops below 60, a maintenance sensor is over 90 days old, any of the existing alert conditions (filter/brush wear, navigation quality, consecutive skipped cleans) are active, the integration detects a room-layout change (integration ≥ 3.2.0), or any rooms are currently overdue (integration ≥ 3.3.0).

**⚙ tab** — schedule + presence intelligence, the settings panel (edge clean / always finish / carpet boost / gentle mode where the robot reports it, integration ≥ 3.4.3), room targeting (standalone mode), your iRobot-app favourite routines as one-tap buttons (auto-discovered; best with integration ≥ 3.0.0), and maintenance service-call references for Developer Tools. At the bottom, **Card diagnostics** (v3.0) lists each role the card uses with the entity it found and how (key, alias, id fallback, missing), plus card / Home Assistant / integration versions — **Copy for issue** puts it on the clipboard as Markdown (entity ids and versions only, no states).

**Wide cards** *(v3.0)* — from 700 px of card width (a wide card in a sections dashboard, a panel view) the map moves into its own column beside the header and tabs.

**History tab badge** — lights up specifically for a WiFi signal dead-zone detected during the last mission; this is intentionally narrower than the Care badge so a connectivity issue doesn't get buried among performance alerts.

---

## Multiple robots & household view

Add an `entities:` list to switch between robots with a dropdown:

```yaml
type: custom:roomba-plus-card
entities:
  - vacuum.roomba_downstairs
  - vacuum.roomba_upstairs
```

The same dropdown also offers **📊 Household summary** — selecting it replaces the header and tabs with a combined view across all configured robots (completion rate, area, and floor breakdown for the last 28 days). When the integration reports it (≥ 3.4.3), a fleet-health line shows "All N robots healthy" or lists which ones need attention (maintenance due and/or a declining health trend), with a ⚠ badge and tooltip on the specific robot row — degrades to the plain completion-rate view with no fleet-health line at all on older integrations. A **← Back** chip returns to the per-robot view. The card remembers the last active robot between sessions.

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
# default_tab: map       # map | history | health (the Care tab) | settings

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

# v2.4.0: rotate the History tab's Map-button coverage replay to match your
# dashboard's orientation — same intent as the integration's own `?rotate=`
# param on map.png (integration ≥ 3.4.1), applied client-side here instead.
# mission_map_rotate: 0  # 0 | 90 | 180 | 270

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
| Room selector / targeting | ❌ | ❌ | ✅ | ✅ |
| Consumable bars | Filter only | ✅ | ✅ | Pad + tank |
| Map tab (heatmap + hazard pins) | ❌ | ✅ ¹ | ✅ | ❌ |
| Room boundary overlay on Map tab | ❌ | ❌ | ✅ (cloud, calibrated) | ❌ |
| Zone/door/furniture overlays on Map tab | ❌ | ❌ | ✅ (cloud, calibrated) | ❌ |
| Room accessibility score tooltip on Map tab | ❌ | ❌ | ✅ (cloud, calibrated) | ❌ |
| Mission coverage replay (Map button) | ❌ | ❌ | ✅ (cloud) | ❌ |
| Per-room coverage in day detail | ❌ | ❌ | ✅ (cloud) | ❌ |
| Rooms-overdue widget + Clean-overdue button | ❌ | ❌ | ✅ (cloud) | ❌ |
| Dirt/sensor correlation (opt-in) | ❌ | ❌ | ✅ (cloud) | ❌ |
| Robot health score | Depends on integration version and signal availability — see Known limitations | | | |
| Scheduling + presence | ✅ | ✅ | ✅ | ✅ |
| Demand cleaning | ✅ (cloud) | ✅ (cloud) | ✅ (cloud) | ✅ (cloud) |
| Lifetime stats | Cloud required | Cloud required | Cloud required | Cloud required |

¹ 980-series: firmware ≥ 3.20 has no pose data. Map tab heatmap requires an earlier firmware.

**Prime / V4 robots** (Roomba Combo 205/405/505, Max 705 and other robots the integration sets up in its cloud-only "Prime" mode) — since v3.0.0 the whole card: header with station activity, cleaning mode and the start check; understandable errors (title, description, which mode still works); favourites; room selection grouped by floor; the Map tab on the Prime room map; parts and station in the Care tab. History, household view and rooms-overdue need integration ≥ 4.2.19.

Features that say "cloud" require iRobot cloud credentials configured in the integration.

---

## Language support

The card reads Home Assistant's own language setting (`hass.language` — the one you pick under your HA profile) and shows UI text in that language automatically; there's no separate card config option for it. 8 languages are supported, matching the integration's own translation set: German (de), English (en), Spanish (es), French (fr), Italian (it), Dutch (nl), Polish (pl), Portuguese (pt). English is the source of truth and the automatic fallback — for any HA language not in this list, and for any individual text that hasn't been translated for some reason, you'll see English rather than a blank space.

**First-draft translations.** English is written and reviewed as part of building each feature. The other 7 languages are machine-translated first drafts, not reviewed by a native speaker or field tester. They should be understandable, but expect occasional awkward phrasing or a wrong word choice here and there. Corrections are very welcome — open an issue or a PR with the fix; if you're one of this project's own field testers (Thonno/veronoicc for Italian, boutXIII for French, mdarocha for Polish), your review of your own language would be especially valuable.

**Two deliberate scope limits**, not oversights:
- The visual card editor (the form you get by editing the card without YAML) stays English-only. Home Assistant calls `getConfigForm()` as a static method with no `hass` object available at that point, unlike every other part of this card — there's genuinely no language to read yet when that schema is built.
- Pluralization is two-form (singular/"1 room" vs. plural/"2 rooms") only. Languages with more grammatical plural forms than that (Polish, for instance, distinguishes "few" from "many") fall back to the plural form outside the simple singular case — grammatically imperfect in those specific cases, but always the more-common form, never blank or wrong-language.

---

## Troubleshooting

**A tab or section is missing** — The card hides content when its backing entities are absent. Check that the `roomba_plus` integration is fully loaded and your robot has reported state at least once. Entities are named `sensor.<robot_name>_<key>` — see the integration docs for the full list.

**Custom entity IDs** — Since v3.0 renamed entities are found: the card looks entities up by device and the integration's internal key, not by id. Only when Home Assistant's entity registry is not available to the card does it fall back to the default ids. **⚙ → Card diagnostics** shows, per role, which entity the card uses and how it found it — paste **Copy for issue** into an issue if something is missing.

**Wrong area units** — `area_unit: auto` (the default) follows Home Assistant's unit system (v2.5.0: metric installs were shown ft² before — HA reports its metric length unit as `km`, which the card did not recognise). Set `area_unit: m2` or `area_unit: sqft` to override. Area sensors are read in the unit they report (m² since integration 4.x).

**"History isn't available for this robot yet"** — The integration answered 404 for this robot's history endpoint. Up to integration 4.2.18 / 4.3.0b6 the history endpoints are registered only when a Classic robot is set up, so an installation with **only Prime / V4 robots** has none — update to 4.2.19 / 4.3.0b7. Any other failure shows "History temporarily unavailable".

**Health score says "Calibrating…"** — The integration needs at least 20 missions in the last 30 days and at least 3 of its 5 input signals available before it will compute a score. This is expected on a newly set up robot or one that's recently had its mission history reset; it resolves on its own with normal use.

---

## Known limitations

**8 languages, first-draft quality** — The card now follows your Home Assistant language setting (`hass.language`) for UI text: German, English, Spanish, French, Italian, Dutch, Polish, and Portuguese — the same 8 locales the integration itself ships. English is the reference and always the fallback for any locale not in this list. **The other 7 are unreviewed machine-translated first drafts** — not proofread by a native speaker or field tester. If you spot a wrong or awkward translation, please open an issue (or better: a PR) with the correction; contributions from Thonno (Italian), boutXIII (French), or mdarocha (Polish) reviewing their own language would be especially welcome. French has been reconciled with the translation @Geo26160 shared in #21 (v2.5.0). Date/time formatting already followed your HA locale before this and is unaffected. Two small, deliberate scope limits: the visual card editor (⚙-icon config form) stays English-only — it has no access to `hass` at the point Home Assistant renders it; and pluralization is two-form (singular/plural) only, so languages with more grammatical plural forms (e.g. Polish) fall back to the "other" form outside the simple singular case.

**Keep-out polygon outlines on hazard pins** — The 🚫 hazard pin itself (from the hazards endpoint) still shows the zone centroid only, not its boundary — that part of the endpoint is unchanged. As of integration ≥ 3.3.0, the Map tab's separate zone overlay draws the full keep-out polygon boundary alongside it (see Map tab above), so the boundary is visible via that layer even though the pin itself isn't.

**Cleaned rooms sequence** — The room sequence in today's day detail popover reflects the most recent mission only (sourced from a live vacuum entity attribute). Historical missions show room coverage percentages but not the room order.

**Header "Start selected rooms" now shows a loading spinner** — Previously sent the command correctly but showed no sending-in-progress state at all (the ⚙ tab's own room-targeting button already did). Fixed in v2.5.0: the button now spins and disables for the duration of the `clean_room` call, and a failed/timed-out send now also shows the error message in the header itself — previously that message only reached the ⚙ tab's panel, so a failure while looking at any other tab showed nothing at all.

**Household view now shows a loading skeleton** — Switching to "📊 Household summary" previously showed only the "← Back" chip until the fetch resolved, with a blank area below it. Now shows a pulsing placeholder (same pattern as the History tab's own calendar skeleton) for the fetch's duration. If the fetch finishes and still has nothing to show (e.g. integration too old for this endpoint), the view intentionally goes back to showing nothing beyond "← Back" — not a new error message, since that case isn't a failure to alarm about.

**Door markers and zone overlays are SMART-tier for now** — Shipped as of integration ≥ 3.3.0 for SMART robots with an aligned map (see Map tab above). EPHEMERAL robots (900-series) get these only if the integration's aligner reaches aligned mode for that robot (via cloud UMF geometry) — not guaranteed on every EPHEMERAL setup. This is the same aligned-mode gate the existing room-boundary overlay already uses, not a new restriction.

**Favourites** — Since v3.0 read from the vacuum's `favorites` attribute (both generations) and started through `roomba_plus.run_favorite`; the button search by entity-id pattern remains only as a fallback for integrations that do not publish the attribute. Classic favourites need the iRobot cloud.

**Room map naming (Classic, integration < 4.2.20)** — Up to integration 4.2.19 the room map names a room by its cloud name, the room select by its display name (an alias you set comes first). A room with an alias is then drawn on the Map tab but cannot be tapped there; use the **Rooms…** chips, or update to 4.2.20, which names both the same way.

**The anomaly banner and navigation health need their sensors enabled** — Both the mission-anomaly banner and the navigation-health panel read sensors the integration ships **disabled by default** (`consecutive_mission_anomalies` for the banner; `nav_panics` / `nav_landmark_quality` / `nav_good_landmarks` for navigation health, all integration ≥ 3.0.0). Until you enable them in Home Assistant (Settings → Devices → your robot → the disabled entities), the card simply shows nothing in those spots — that's expected, not a fault. The anomaly banner additionally only appears once three consecutive missions have been flagged anomalous (two can be coincidence; three are a pattern).

**Dirt-detection counters and dock counters are disabled-by-default diagnostics too** — The lifetime dirt-detect line in the History stats footer (`optical_dirt_detections` / `piezo_dirt_detections` / `scrubs_count`) and the dock knockoff/charge-abort/contact-chatter counters in the Care tab's dock block follow the same pattern: enable the entities and the card picks them up; leave them disabled and those lines simply don't exist. `dock_tank_level` is the exception — it's enabled by default on robots that report it.

**Why? now works on cloud-source rows too** — As of integration ≥ 3.3.0, the explanation endpoint resolves cloud-source mission rows as well as local ones (previously a real limitation, tracked as of 3.2.1: cloud-source rows — typically gap-fillers for missions the local link missed — couldn't be resolved and didn't get the button). On integration < 3.3.0, that older limitation still applies.

**Route needs integration ≥ 3.2.1 and cloud enrichment** — The per-row mission counter that keys the replay endpoint ships with integration 3.2.1. On local-source rows it arrives via cloud backfill, so a mission may show its Route button a little after it first appears in the list — and never on cloud-less installs.

**Map (mission coverage replay) now works on cloud-source rows too** — As of integration ≥ 3.4.2, the Map button's own record lookup resolves cloud-source mission rows the same way Why?'s does (a separate fix, MISSION-MAP-CLOUD-ROWS, mirroring the earlier EXPLAIN-CLOUD fix — previously a real, tracked limitation since this endpoint's own lookup hadn't been extended). On integration < 3.4.2, that older limitation still applies. Same `n_mssn` requirement as Route.

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
