# v1.3.1 — Bug Fixes, Heatmap Layout & Theme Integration

Maintenance release fixing four bugs found in v1.3.0 and improving visual
integration with Bubble Card / HA themes. No config changes required.
All fixes degrade gracefully — the card behaves identically on robots where the
fixed entities are not present.

---

## Bug fixes

### B1 — Multi-robot render guard used wrong entity (critical)

In multi-robot mode (`entities:` list with 2+ robots), the render-guard watched
`config.entity` (always the first/default robot) instead of `activeRobot` (the
currently displayed one). After switching robots, state changes on the active
robot were silently ignored — the card appeared frozen until an unrelated HA
state change happened to trigger a re-render.

**Fix:** `relevantEntityIds()` now builds the list from `this.activeRobot`.

### B2 — Render guard missed ~12 entity IDs

The following entities were rendered or used in capability detection but were
absent from `relevantEntityIds()`. Changes to these entities would not trigger
a re-render in single-robot mode either:

- `sensor.*_area_cleaned_today` — Wave A3 "X ft² already today" status line
- `sensor.*_mission_expire_time` — recharge ETA countdown (mid-mission recharge)
- `binary_sensor.*_demand_clean_blocked` — "floor needs cleaning" indicator
- `sensor.*_readiness` — Wave A5 alert text refinement ("Bin full" vs generic)
- `sensor.*_last_error_zone` — error zone detail in status zone
- `sensor.*_average_area_30d` — vs-usual area delta metric
- `sensor.*_mission_count_30d` — gates the vs-usual delta (requires ≥5 missions)
- `sensor.*_mop_pad` — Braava pad consumable bar
- `sensor.*_mop_tank_level` — Braava tank level bar
- `sensor.*_mop_behavior` — Braava mop behavior display
- `sensor.*_estimated_battery_eol` — battery EOL in health popover
- `image.*_coverage_map` — `hasCoverageImage` capability flag

**Fix:** All 12 IDs added to `relevantEntityIds()`.

### B3 — Missing demand initiator badge in day detail popover

The F1 spec required a `[demand]` badge on mission rows where
`initiator === "demand"` (robot cleaned automatically because the floor was
detected as dirty). The badge was specified but never implemented.

**Fix:** Mission rows in the day detail popover now show a compact blue
`demand` badge inline when `initiator === "demand"`.

### B4 — `npm test` broken due to corrupted vitest shim

The `node_modules/.bin/vitest` shim contained a relative import
(`import './dist/cli.js'`) that resolved to `.bin/dist/cli.js` — a path that
does not exist. Tests could only be run via
`node node_modules/vitest/dist/cli.js run` directly.

**Fix:** The shim now imports from the correct path
(`../vitest/dist/cli.js`).

---

## Heatmap layout fix

The history zone heatmap previously used `width: 100%; max-width: 220px` CSS
scaling, which caused the SVG to be stretched to card width on most phones
(~360px), making cells and day-name labels disproportionately large relative to
the rest of the card.

**Root cause:** The SVG had no explicit `width`/`height` attributes — only a
`viewBox`. CSS `width: 100%` scaled the SVG proportionally, enlarging everything
inside it together.

**Fix:** The SVG now has explicit `width` and `height` pixel attributes set at
render time from fixed constants:
- Cell size: 16×16px (was 14×14px)
- Cell gap: 2px (unchanged)
- Day label column: 18px left margin
- Day label font: 8px (was 7px — slightly larger but in a fixed, compact SVG)
- Total SVG width: **142px** — compact and proportionate within the card

The CSS rule becomes simply `display: block` — no scaling, no `max-width` cap.
The SVG renders at its natural size on all screen widths.

The skeleton heatmap (loading state) was updated identically.

---

## Theme integration

The card's semantic colour tokens now cascade from standard HA theme variables
before falling back to hardcoded hex values:

| Token | New source | Fallback |
|---|---|---|
| `--rpc-green` | `var(--state-active-color)` | `#2d9c4f` |
| `--rpc-amber` | `var(--warning-color)` | `#d97706` |
| `--rpc-red` | `var(--error-color)` | `#db4437` |
| `--rpc-blue` | `var(--primary-color)` | `#2563eb` |
| `--rpc-grey-light` | `var(--divider-color)` | `#e5e7eb` |
| `--rpc-grey-mid` | `var(--disabled-text-color)` | `#9ca3af` |
| `--rpc-cell-empty` | `var(--secondary-background-color)` | `#e5e7eb` |

These variables are defined by every HA theme — including Bubble Card themes,
Mushroom themes, and the HA default. The card will now automatically adapt its
status colours, bar fills, alert highlights, and heatmap empty-cells to the
active theme's palette without any additional configuration.

The card-level `box-shadow` now defaults to `none` (matching Bubble Card and
modern HA themes which define `ha-card-box-shadow` without a default shadow).
If your theme defines `ha-card-box-shadow`, the card inherits it automatically.

---

## Test suite

| | Before | After |
|---|---|---|
| Test files | 10 | 11 |
| Tests | 262 | **286** |

New tests added:
- 4 heatmap fixed-size regression tests (SVG width attribute, max-width ≤160px, label font size)
- 4 demand badge tests (demand shown, schedule not shown, manual not shown, badge coexists with zones+wifi)
- 16 `relevantEntityIds()` coverage tests (B1 activeRobot, B2 all 12 missing IDs)
