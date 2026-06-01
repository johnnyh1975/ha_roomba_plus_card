# Roomba+ Card

[![HACS](https://img.shields.io/badge/HACS-Custom-orange.svg)](https://github.com/hacs/integration)
[![Version](https://img.shields.io/badge/version-1.1-blue.svg)](https://github.com/johnnyh1975/ha_roomba_plus_card/releases)

A full-featured Lovelace card for the [`roomba_plus`](https://github.com/johnnyh1975/roomba_plus) Home Assistant integration.

> **Requires:** `roomba_plus` ≥ 1.9.0 · Home Assistant ≥ 2024.1

---

## Features

| Zone | What you get |
|------|-------------|
| **Status** | Live state (cleaning / paused / docked / recharging mid-mission / error / emptying bin), animated progress bar, area cleaned, time remaining, vs-usual delta. Quick-action buttons: Start, Pause, Resume, Return home, Locate, Cancel mission. |
| **Rooms** | Tap-to-select room chips for targeted cleaning. Pass-count selector (Auto / ×1 / ×2). Repeat last mission shortcut. Collapsed settings panel (edge clean, always finish, carpet boost). |
| **Health** | Consumable bars for Filter, Brush/Pad, Battery, Tank, Clean Base — colour-coded green → amber → red. Tap any bar for detail + "Mark as replaced". Wear trend arrows (↑ → ↓) with one-time legend when L4 installed. |
| **Schedule & Presence** | Next scheduled clean time, next likely clean window (~estimate). Schedule hold badge (manual / presence-managed). Per-person presence dots. Weekly presence analytics (opportunities / utilisation). |
| **Alerts** | Collapsed when the robot is healthy. Surfaces errors → bin full → filter wear → brush wear → nav quality — in priority order. 100ms debounce prevents flicker. |
| **History** | 28-day heatmap calendar. Streak + completion rate summary. Problem zone callout. Tap any day for mission detail. Collapsed lifetime stats footer (cloud credentials required). |

Automatically adapts to your robot — 600-series, 900/980, i/s/j-series, and Braava m6 all render correctly from entity presence alone. No manual model configuration needed.

---

## Installation

### Via HACS (recommended)

1. Open HACS → Frontend → **⋮** → Custom repositories
2. Add `https://github.com/johnnyh1975/ha_roomba_plus_card` · Category: **Lovelace**
3. Click **Download**
4. Reload the browser

### Manual

Copy `dist/roomba-plus-card.js` to `config/www/roomba-plus-card.js`, then add to your dashboard resources:

```yaml
url: /local/roomba-plus-card.js
type: module
```

---

## Configuration

```yaml
type: custom:roomba-plus-card
entity: vacuum.roomba_i7        # required — your vacuum entity
show_health: true               # Zone 3 (default: true)
show_schedule: true             # Zone 4 (default: true)
show_alerts: true               # Zone 5 (default: true)
show_history: true              # Zone 6 (default: true)
show_rooms: true                # Zone 2 (default: true)
history_days: 28                # 7 | 14 | 28 (default: 28)
area_unit: auto                 # auto | sqft | m2 (default: auto)
presence_entities:              # optional — presence dots in Zone 4
  - person.alice
  - person.bob
show_lifetime: true             # lifetime stats footer (default: true, hidden when cloud sensors absent)
show_dirt_events: false         # dirt events in day detail (default: false — requires integration ≥ v2.0)
```

All `show_*` options are overrides on top of automatic capability detection. Setting `show_rooms: true` on a 600-series has no effect — the zone is hidden because it has no zone support, regardless of config.

---

## Robot compatibility matrix

| Feature | 600-series | 900/980 | i/s/j-series | Braava m6 |
|---------|-----------|---------|--------------|-----------|
| Status + quick actions | ✅ | ✅ | ✅ | ✅ |
| Recharge mid-mission state | ✅ | ✅ | ✅ | ✅ |
| Emptying bin (evac) state | ❌ | ❌ | s9+ only | ❌ |
| Area / time metrics | ❌ | ✅ | ✅ | ✅ |
| Room selector | ❌ | ✅ (ephemeral) | ✅ (smart map) | ✅ |
| Settings panel | ❌ | Partial | ✅ | Partial |
| Filter bar | ✅ | ✅ | ✅ | ✅ |
| Brush bar | ✅ | ✅ | ✅ | ❌ |
| Pad bar | ❌ | ❌ | ❌ | ✅ |
| Water tank bar | ❌ | ❌ | ❌ | ✅ |
| Clean Base bar | ❌ | ❌ | s9+ only | ❌ |
| Wear trend arrows | L4 required | L4 required | L4 required | L4 required |
| Nav quality alert | ❌ | ❌ | ✅ | ❌ |
| Schedule / presence | ✅ | ✅ | ✅ | ✅ |
| Presence analytics | L6 required | L6 required | L6 required | L6 required |
| History heatmap | ✅ | ✅ | ✅ | ✅ |
| Lifetime stats | Cloud required | Cloud required | Cloud required | Cloud required |

---

## Integration version requirements

| Feature | Minimum integration version |
|---------|----------------------------|
| All core zones | 1.8.0 |
| Recharge mid-mission state, evac phase | 1.9.0 |
| Wear trend arrows, nav quality alert | 1.9.0 |
| Presence analytics, next likely window | 1.8.0 (L6) |
| Lifetime stats | 1.9.0 (cloud credentials) |
| Dirt events in day detail | 2.0.0 |

---

## Entity naming convention

The card auto-discovers companion entities by replacing `vacuum.` with `sensor.` / `select.` / `binary_sensor.` / `switch.` / `button.` and appending the expected key. Example: `vacuum.roomba_i7` → `sensor.roomba_i7_filter_remaining_hours`.

If your integration uses custom entity IDs, discovery fails silently and the affected zone degrades gracefully — hidden, not broken.

---

## Development

```bash
npm install
npm run build   # production build → dist/roomba-plus-card.js
npm run dev     # watch mode
npm run check   # TypeScript type-check only
```

---

## License

MIT
