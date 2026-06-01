# v1.2 — Foundation & Multi-Robot

Structural release that fixes three spec gaps in v1.1, adds multi-robot support, and lays the groundwork for the performance analytics introduced in v1.3.

## Requirements

- `roomba_plus` integration ≥ **2.0.0** (≥ 2.1.0 for room chip icons — degrade gracefully on 2.0.0)
- Home Assistant ≥ **2024.1**
- Upgrading from v1.1: no config changes required. New config keys (`entities`, `show_rooms`) are optional.

---

## What's new

### Multi-robot selector (F3)

Cards configured with a list of vacuum entities now show a robot selector dropdown at the top, above all zones. Switching robots resets all state, reloads history for the new robot, and re-evaluates all capability flags.

```yaml
type: custom:roomba-plus-card
entities:
  - vacuum.roomba_downstairs
  - vacuum.roomba_upstairs
```

Single-robot cards (`entity:`) are unchanged — backward compatible.

**`show_rooms: false`** — new config key to hide the room selector zone entirely. Useful when pairing with xiaomi-vacuum-map-card (full integration added in v1.3).

---

### Room chip icons (F5)

Room chips in the zone selector now display an emoji icon alongside the room name, sourced from the integration's zone metadata:

```
🛋 Living Room  🍳 Kitchen  🛏 Bedroom
```

Icons are auto-matched from the zone name. Falls back to a neutral chip when no icon matches. Requires integration ≥ 2.1.0; degrades gracefully on 2.0.0 (chips shown without icons).

---

### Bug fixes (spec alignment)

**MissionRecord shape (F2)** — `start_time` renamed to `started_at` in `types.ts` to match the field name served by the API. Day detail popovers now correctly populate per-mission data on all robots.

**Render guard (F1)** — history loading no longer triggers a flash of the skeleton heatmap on every entity state change. The card only re-renders the heatmap section when history data actually changes.

---

## Config additions

```yaml
type: custom:roomba-plus-card
entities:                       # multi-robot list (replaces entity: when present)
  - vacuum.roomba_downstairs
  - vacuum.roomba_upstairs
show_rooms: true                # set false to hide room selector zone (default: true)
```

All v1.1 config keys are unchanged.

---

## Known limitations

**No visual diff rendering** — carries over from v1.1. The card rebuilds its full DOM on every Home Assistant state update. Open popovers re-trigger their entry animation when any unrelated entity changes.

**Per-mission detail in day popover** — requires `roomba_plus` ≥ 1.8.0. The card shows "Per-mission detail not available" on older builds.
