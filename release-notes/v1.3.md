# v1.3 — Performance Intelligence & xiaomi Integration

Surfaces the new performance sensors from integration v2.1, adds a full xiaomi-vacuum-map-card integration story, and makes all dates and times locale-aware. All features degrade gracefully — the card behaves exactly like v1.2 on integration versions below 2.1.

## Requirements

- `roomba_plus` integration ≥ **1.9.0** (card runs on any version ≥ 1.9.0)
- `roomba_plus` integration ≥ **2.1.0** for v1.3 features (battery health, coverage, speed trend, WiFi alerts and sparkline)
- Home Assistant ≥ **2024.1**
- Upgrading from v1.2: no config changes required. All new features are auto-detected from entity presence.

---

## What's new

### Battery health bar (F6a)

A new **Bat. Health** bar in the Health zone showing battery capacity retention as a percentage. Colour-coded green (> 85%), amber (> 70%), red (≤ 70%). Tap to open a popover:

```
Battery Health
──────────────
78% of original capacity
312 charge cycles
Battery life: ~180 days remaining
```

When the battery reaches end-of-life, the popover shows a replacement prompt instead of the days estimate.

**Entity sources:**
- `sensor.*_battery_capacity_retention` — bar value
- `sensor.*_charge_cycles` — cycle count (shown in popover when present)
- `sensor.*_estimated_battery_eol` — days remaining (shown in popover when present, requires `hasBatteryRetention`)

---

### Floor coverage bar (F6a)

A new **Coverage** bar below the battery health bar, showing what percentage of the floor was covered on the last mission. Tap to open a popover with context:

```
Floor Coverage
──────────────
78% of floor area covered on the last mission.
Based on 15 missions in the last 30 days.
Low coverage may indicate obstacles, map drift, or a missed room.
```

Shows "Building history…" instead of a bar for the first 9 missions — avoids misleading data on new installs.

**Entity sources:**
- `sensor.*_recent_coverage_pct` — coverage percentage
- `sensor.*_missions_last_30d` — mission count gate (skeleton shown below 10)

---

### Speed trend in history summary bar (F6a)

When cleaning speed has been declining over 14 days, an amber token appears in the history summary bar. When improving, a green token appears. Stable is silent — no noise when things are normal.

```
🔥 14-day streak · 92% completion · ↓ Speed declining
```

**Entity source:** `sensor.*_cleaning_speed_trend` — `improving` | `stable` | `declining`

---

### Consecutive clean skips alert (F6a)

New priority-6 alert (below navigation quality, above WiFi floor) when the robot has been blocked from cleaning multiple times consecutively:

```
⚠️ Robot blocked from cleaning 3 consecutive times
   Check blocking sensors or robot placement.
```

**Entity source:** `binary_sensor.*_consecutive_clean_skips` — `on` when blocking detected; `skip_count` attribute carries the count.

---

### WiFi floor alert (F6a)

New priority-7 alert when WiFi signal dropped below 50% during the last mission:

```
⚠️ Wi-Fi signal dropped to 25% during last mission
   Consider moving the router or adding a Wi-Fi extender.
```

**Entity source:** `sensor.*_recent_wifi_floor` — minimum wlBars value from last mission, normalised to percentage.

---

### WiFi sparkline in day detail (F6b)

Mission rows in the day detail popover now show a compact 7-bar WiFi signal sparkline for cloud-sourced records. Colour-coded green/amber/red by floor signal. Only appears when data is available — no empty state shown.

```
✓  07:14  37 min  412 ft²
   Kitchen · Hallway
   📶 ▂▄▃▂▁▂▃  25% min
```

**Field source:** `wifi_signal` array in `format=records` API response (cloud-sourced missions only).

> **Note:** The iRobot cloud returns WiFi signal as wlBars (0–4 integer scale). The card normalises this to percentage automatically. No action needed when the integration is updated to return actual percentages — the card adapts via a safe heuristic.

---

### xiaomi-vacuum-map-card integration (F3b)

Roomba+ Card and [xiaomi-vacuum-map-card](https://github.com/PiotrMachowski/lovelace-xiaomi-vacuum-map-card) are now designed to work together as a two-card dashboard — xiaomi for the floor plan, Roomba+ for mission intelligence.

**`show_settings`** — New config key (default: `true`) to show or hide the settings panel (edge clean, always finish, carpet boost, passes). When `show_rooms: false`, the settings panel and Repeat Last button automatically relocate into the Status zone under a **CONTROLS** section, so nothing is lost when hiding the rooms zone.

**`robot_selector_helper`** — New config key accepting an `input_text` or `input_select` entity ID. When the robot dropdown switches, the card writes the selected vacuum entity ID to this helper. Conditional xiaomi cards read it to show/hide the correct floor plan automatically. Write failures are non-fatal and never interrupt robot switching.

See the [xiaomi integration section in the README](https://github.com/johnnyh1975/ha_roomba_plus_card#xiaomi-vacuum-map-card-integration) for single-robot and multi-robot dashboard YAML with step-by-step setup.

---

### Locale-aware dates and times

All date and time displays now respect `hass.language`. Previously hardcoded to `en-US` — German, French, Dutch and other users saw English weekday names and date formats regardless of their HA language setting.

Affected displays:
- Heatmap calendar date labels (`Jan 5` → `5. Jan.` in German)
- Day detail popover header (`Monday, May 14, 2024` → `Montag, 14. Mai 2024`)
- Mission start times in day detail
- Schedule zone next-clean and likely-window timestamps
- Health zone "last replaced" dates
- "Last cleaned X ago" and all relative time strings — now use `Intl.RelativeTimeFormat`, which produces "vor 3 Tagen", "il y a 2 heures", "3 dagen geleden" automatically without a translation file

---

### Config editor labels

All 11 fields in the visual config editor (Settings → Dashboard → Edit → Edit card) now show human-readable labels. Previously, fields like `robot_selector_helper` and `show_dirt_events` showed their raw key names.

---

## Config additions

```yaml
type: custom:roomba-plus-card
entity: vacuum.roomba

# New in v1.3:
show_settings: true                                 # show settings panel (default: true)
                                                    # when show_rooms:false, settings move to Status zone
robot_selector_helper: input_text.active_roomba     # optional — for xiaomi card sync
```

All v1.2 config keys are unchanged.

---

## Bug fixes

- **Race condition on robot switch** — A fast robot switch could cause the previous robot's in-flight history fetch to overwrite the newly selected robot's data. Fixed by capturing the target robot at fetch start and discarding stale results silently.

- **`repeat-last` button placement** — When `show_rooms: false`, the Repeat Last button now renders inside the action button row `[ ▶ Start ][ ⊙ Locate ][ ↩ Repeat last ]` as intended, not floating below it as a detached link.

- **Oldest record used for capability detection** — WiFi sparklines could fail to appear on robots with early local-only missions even after enabling cloud, because capability detection sampled the oldest record (no `wifi_signal`) instead of the most recent one.

- **Orphaned separator in Health zone** — A divider could appear in the Health zone even when no new bars rendered (entity unavailable or missing). Separator now only emits when at least one bar actually renders.

- **Keyboard navigation on health bars** — All health bar rows now respond to Enter and Space in addition to click, completing ARIA `role="button"` accessibility.

---

## Architecture changes (for contributors)

**Two-tier capability detection** — `detectCapabilities()` now accepts optional `firstRecord` and `firstSummary` arguments. Tier 1 caps (entity-based) resolve synchronously on first render. Tier 2 caps (`hasWifiSignal`, `hasRoomCoverage`, `hasDirtDensity`) resolve after `loadHistory` completes with a silent second render. `hasRobotSelectorHelper` is config-based.

**Shared `timeSince()` utility** — Two near-duplicate relative time helpers (health zone and status zone) replaced by a single `timeSince(iso, locale)` in `utils.ts` using `Intl.RelativeTimeFormat`.

**`renderSettingsPanel()` exported** — Extracted from `renderRoomSelectorZone` as a standalone exported function so `renderStatusZone` can call it without duplication when `show_rooms: false`.

---

## Known limitations

**Full string translation** — UI labels (state names, zone headers, alert texts, action buttons) remain English-only. Date/time formatting is resolved in this release; translating static strings requires a `translations/` framework which will be added in a future release.

**No visual diff rendering** — carries over from v1.1. The card rebuilds its full DOM on every Home Assistant state update.

**Per-mission detail in day popover** — requires `roomba_plus` ≥ 1.8.0. The card shows "Per-mission detail not available" on older builds.
