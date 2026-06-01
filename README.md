# Roomba+ Card

A full-featured Lovelace card for the [`roomba_plus`](https://github.com/your-org/roomba_plus) Home Assistant integration.

> **Requires:** `roomba_plus` ≥ 1.8.0 · Home Assistant ≥ 2024.1

---

## Features

| Zone | What you get |
|------|-------------|
| **Status** | Live state (cleaning / paused / docked / error), animated progress bar, area cleaned, time remaining, vs-usual delta. Quick-action buttons: Start, Pause, Resume, Return home, Locate. |
| **Rooms** | Tap-to-select room chips for targeted cleaning. Pass-count selector (Auto / ×1 / ×2). Repeat last mission shortcut. |
| **Health** | Consumable bars for Filter, Brush/Pad, Battery, Tank, Clean Base — colour-coded green → amber → red. Tap any bar for detail + "Mark as replaced". Wear trend arrows (↑ → ↓) when L4 installed. |
| **Schedule & Presence** | Next clean time, schedule hold badge (manual / presence-managed), per-person presence dots. |
| **Alerts** | Collapsed when nothing is wrong. Surfaces errors, maintenance, and wear-rate warnings in priority order. |
| **History** | 28-day heatmap calendar. Streak + completion rate summary. Problem zone callout. Tap any day for mission detail. |

Automatically adapts to your robot: 600-series, 900/980, i/s/j-series, and Braava m6 all render correctly from entity presence alone — no manual model configuration needed.

---

## Installation

### Via HACS (recommended)

1. Open HACS → Frontend → **⋮** → Custom repositories
2. Add `https://github.com/your-org/roomba-plus-card` · Category: **Lovelace**
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
presence_entities:              # optional — for presence dots in Zone 4
  - person.alice
  - person.bob
```

All `show_*` options are overrides on top of automatic capability detection. Setting `show_rooms: true` on a 600-series has no effect — the zone is hidden because it has no zone support, regardless of config.

---

## Robot compatibility matrix

| Feature | 600-series | 900/980 | i/s/j-series | Braava m6 |
|---------|-----------|---------|--------------|-----------|
| Status + quick actions | ✅ | ✅ | ✅ | ✅ |
| Area / time metrics | ❌ | ✅ | ✅ | ✅ |
| Room selector | ❌ | ✅ (ephemeral) | ✅ (smart map) | ✅ |
| Filter bar | ✅ | ✅ | ✅ | ✅ |
| Brush bar | ✅ | ✅ | ✅ | ❌ |
| Pad bar | ❌ | ❌ | ❌ | ✅ |
| Water tank bar | ❌ | ❌ | ❌ | ✅ |
| Clean Base bar | ❌ | ❌ | s9+ only | ❌ |
| Wear trend arrows | L4 required | L4 required | L4 required | L4 required |
| Schedule / presence | ✅ | ✅ | ✅ | ✅ |
| History heatmap | ✅ | ✅ | ✅ | ✅ |

---

## Wave A features (included in v0.1-beta)

- **Repeat last mission button** — one-tap shortcut next to "Clean selected"
- **Cleaning passes selector** — Auto / ×1 / ×2 in Zone 2
- **Area cleaned today** — context line during active missions (Zone 1, 900+ only)
- **Readiness-specific alert text** — "Bin full — empty to continue" instead of generic "Maintenance due"

Wave B (presence analytics, next likely window, settings panel, nav quality alert) and Wave C (lifetime stats, dirt detection) are planned for v1.1 and v2.0 respectively.

---

## Entity naming convention

The card auto-discovers companion entities by replacing `vacuum.` with `sensor.` / `select.` / `binary_sensor.` and appending the expected key. Example: `vacuum.roomba_i7` → `sensor.roomba_i7_filter_remaining_hours`.

If your integration uses custom entity IDs, discovery fails silently and the affected zone degrades gracefully (hidden, not broken).

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
