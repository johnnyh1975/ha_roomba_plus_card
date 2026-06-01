# v1.2 — Multi-Robot · Performance · Spatial Foundation

## Requirements

- `roomba_plus` integration ≥ **2.0.0**
- Home Assistant ≥ **2024.1**
- Upgrading from v1.1: no config changes required. All new features are auto-detected from entity and API response presence.

---

## What's new

### Render guard

The card now tracks which entities actually drive its output. State updates from unrelated entities (other devices, counters, timers) no longer trigger a re-render. Open popovers no longer re-animate on irrelevant state changes — the long-standing visual diff limitation from v0.1-beta is resolved.

---

### "Last cleaned" display

When docked and history data is available, the status zone now shows how long ago the last completed mission finished:

```
✓ Docked
Last cleaned: 3h ago
```

Previously this read "Last mission: Xh ago" and was derived from the vacuum entity's `last_changed` timestamp, which updates on any state transition — not just mission completion. The new display uses the accurate `started_at` timestamp from the mission log. Falls back to the old entity-based display when history has not yet loaded.

---

### Demand-blocked indicator

When Presence-Aware Scheduling is active and `binary_sensor.*_demand_clean_blocked` is `on`, a warning appears below the docked status:

```
🧹 Floor needs cleaning — waiting for home to be empty
```

Hidden when the sensor is absent (integration < v2.3, or presence scheduling not configured).

---

### Multi-robot selector

A dropdown appears above the status zone when `entities` lists two or more robots:

```yaml
type: custom:roomba-plus-card
entity: vacuum.roomba_i7        # required — fallback for single-robot dashboards
entities:
  - vacuum.roomba_i7
  - vacuum.braava_m6
```

Switching robots resets all card state (selected rooms, open popovers, history data) and loads fresh history for the selected robot. The `entity` key remains required for backward compatibility with existing single-robot dashboards; `entities` takes precedence when present.

---

### Room chip icons

Room chips now display an emoji icon when the integration provides icon data via the `region_icons` attribute on `select.*_smart_zone_select`:

```
🍽️ Kitchen   🛏️ Bedroom   🛁 Bathroom
```

The card maps MDI icon names (as stored in `region_icons`) to emoji using a built-in lookup table of 30 common room types. An unknown MDI icon renders as `📍`. When `region_icons` is absent (integration < v2.1, or robot without smart zones), chips render as plain text — identical to v1.1 behaviour.

---

### Per-mission records (format=records)

The card now calls `GET /api/roomba_plus/{entry_id}/mission_history?format=records` alongside the existing `format=summary` request. When records are available, they are merged into the day summary data and used to populate the day detail popover with accurate per-mission rows.

Cloud robots include `run_min`, `recharges`, `evacuations`, `dirt_events`, and `wifi_signal`. Local-only robots include the same base fields as before. The `format=summary` call continues to drive the heatmap calendar; records are additive. Falls back silently to summary-only on integration < v2.0.

---

## MissionRecord field alignment

The internal `MissionRecord` type has been updated to match the `format=records` API shape introduced in integration v2.0:

| Old field | New field | Notes |
|-----------|-----------|-------|
| `start_time` | `started_at` | ISO datetime UTC |
| `nScrubs` | `dirt_events` | Cloud only, else null |
| *(absent)* | `id`, `ended_at`, `run_min`, `recharges`, `evacuations`, `wifi_signal`, `source`, `initiator`, `error_code` | New fields |

The `show_dirt_events: true` config key is unchanged. The dirt event count now reads from `dirt_events` instead of `nScrubs`.

---

## Config additions

```yaml
type: custom:roomba-plus-card
entity: vacuum.your_roomba          # unchanged — required
entities:                           # new: multi-robot selector
  - vacuum.roomba_i7
  - vacuum.braava_m6
show_dirt_events: false             # unchanged
show_lifetime: true                 # unchanged
```

---

## Bug fixes

- **`MissionApiClient` entity resolution in multi-robot mode** — the API client previously always resolved `entry_id` from `config.entity` regardless of which robot was active. In multi-robot mode this caused the wrong robot's history to load when switching. The client now accepts an explicit entity ID at construction time.
- **Dirt events leading separator** — a mission with dirt events but no zones rendered as `· 3 dirt events`. Now renders as `3 dirt events` with no leading separator.

---

## Known limitations

**Cloud zone names in day detail** — `format=records` cloud records carry no zone-name data (iRobot cloud does not expose room names per mission). The zones column is populated only for local-source records. Cloud records show an empty zones field in the day detail popover.

**Household endpoint** — when `entities` lists multiple robots, history is fetched with a separate API call per robot. A single household endpoint (`?entry_ids=a,b`) is planned for integration v2.3 / card v2.0.
