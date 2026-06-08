# v1.5.0 — Spatial Intelligence

Surfaces the GridStore and UMF data introduced in integration v2.2. The History
zone gains a coverage heatmap tab with hazard pin overlay, the day detail popover
gains per-room coverage fractions, and three audit findings wired since v1.4 but
waiting on integration v2.2 entities are now active. The heatmap calendar cells
are enlarged for easier reading and touch interaction.

**Requires:** `roomba_plus` ≥ 2.2.0

---

## F7 — Coverage heatmap tab

The History zone now has a `[Calendar] [Coverage]` tab toggle when the
`image.*_coverage_map` entity is present (integration ≥ v2.2, robots with pose
data).

The Coverage panel renders:

- The `image.*_coverage_map` entity picture as a full-width image.
- Hazard pins overlaid via absolute CSS positioning, mapped from dock-relative mm
  coordinates to image-relative percentages using the `x_min_mm` / `x_max_mm` /
  `y_min_mm` / `y_max_mm` attributes on the image entity.
- Three pin sources, each with a distinct icon: 📍 stuck hotspot, 🚧 robot-detected
  obstacle, 🚫 keep-out zone. (Q_coord resolved with integration v2.3: all three
  source coordinate spaces are now confirmed reliable.)
- A conditional legend — only entries for pin sources that are actually present.
- "Updated X ago" relative timestamp below the image.

When spatial extent attributes are absent (GridStore still accumulating after a
fresh install), the image renders without pins and a "Spatial overlay unavailable —
grid accumulating" note is shown. The tab is not hidden — an image without spatial
overlay is still useful.

Switching tabs closes any open day-detail popover (tabs and popover are mutually
exclusive; the popover has no visual connection to the coverage image).

Hazard pin data is fetched once per robot session alongside the calendar data in
`loadHistory()`. Returns `[]` gracefully on integration < v2.2 or when no data
has accumulated.

**Note:** Keep-out zone pins (🚫) are centroid markers only. Full polygon outline
rendering is planned for card v2.0.

---

## F8 — Per-room coverage in day detail popover

When a mission record contains a `room_coverage` field (integration ≥ v2.2,
SMART map robots with cloud credentials), the day detail popover now shows
coverage fractions for each cleaned room as colour-coded chips:

- 🟢 Green: ≥ 80% coverage
- 🟡 Amber: 60–79%
- 🔴 Red: < 60%

When `alignment_confidence` is present and below 0.85 (integration v2.3+,
UmfAligner active), a footnote shows the confidence percentage:
`* Coverage estimates (alignment confidence: 72%)`.

Both elements are absent for whole-home missions (no room events) or when cloud
credentials are not configured.

---

## Integration entity fixes (A2, A3, A4)

Three capability flags have been wired since v1.4 but pointed at entities that
did not exist in pre-v2.2 integrations.

**A2 — `binary_sensor.*_mission_active`** (integration v2.2): The
`hasMissionActive` capability flag now resolves correctly. Mid-mission recharge
detection uses this sensor rather than the pre-v1.9 vacuum state fallback.
The `prevMissionActive` on→off transition now reliably triggers a post-mission
history reload.

**A3 — `select.*_carpet_boost_mode`** (integration v2.2): No card code change
was needed — the settings panel already reads `select.{n}_carpet_boost_mode` and
calls `select.select_option`. The carpet boost row now appears once the entity
exists.

**A4 — `hasLifetimeArea` entity key** (integration v2.1.2): `capabilities.ts`
still checked `sensor.*_lifetime_area` — a slug that was renamed to
`sensor.*_recent_area_30d` in integration v2.1.2. The `hasLifetimeArea` flag
has been `false` on every install since then, hiding the lifetime stats footer
even when the sensor was present. Fixed to `e('recent_area_30d')`.

---

## Heatmap resize

The mission calendar heatmap is enlarged for better readability and touch
interaction on mobile.

| Metric | v1.4 | v1.5 |
|--------|------|------|
| Cell size | 16 × 16 px | 24 × 24 px |
| Touch target | 18 × 18 px | 28 × 28 px |
| SVG width | 142 px | 200 px |
| SVG height (4 weeks) | 90 px | 124 px |

Week-start day-of-month labels are now rendered in the label column (previously
reserved but empty). Multi-mission dot indicators scale up to r=2 (was 1.5).

---

## Bug fixes

### normalisedWifiPct — histogram format (Amendment 8d)

`normalisedWifiPct()` previously detected the wlBars format by checking
`every(v => v <= 4)`. `wlBars` is confirmed (Amendment 8d) as a 5-element
bucket histogram where values are already percentages summing to ~100 — so
the scalar heuristic was not the right test.

Fixed to detect by `length === 5` → histogram path (pass through unchanged);
any other length → legacy scalar time-series path (multiply by 25). The signal
floor shown in the UI changes for histogram input: `[0, 35, 65, 0, 0]` gives
a minimum bucket index of 1, meaning a floor of 25%.

### RoomCoverage type — speculative shape corrected

`types.ts` declared `RoomCoverage` as an array of objects with `region_id`,
`name`, `coverage_fraction`, `estimated_area_mm2`, `umf_area_mm2`. This was
written speculatively against the v2.3 UmfAligner polygon output. The actual
`format=records` REST API shape (v2.2.1) is `Record<string, number>` — keyed
by room display name, value 0.0–1.0. Corrected to `type RoomCoverage = Record<string, number>`.

---

## Test suite

| | v1.4.0 | v1.5.0 |
|---|---|---|
| Test files | 11 | 11 |
| Tests | 298 | **326** |

Net change: +28. Notable additions:

- A4: `hasLifetimeArea` true on `recent_area_30d`; false on legacy `lifetime_area` (regression guard)
- 3a: heatmap SVG width ≤ 210 px; week-start date labels in label column
- 3b: `normalisedWifiPct` histogram pass-through (length=5); `mmToImagePct` basic mapping, y-axis inversion, boundary value
- 4: `fetchHazards` calls `format=hazards` endpoint; returns `[]` on non-ok; returns records on 200
- 6 (F7): tab toggle present/absent by capability; calendar/coverage active state; coverage image renders; all three pin sources render; graceful degradation without extent; grid accumulating note; conditional legend
- 6 (F8): room coverage chips with green/amber/red classes; alignment note at <0.85 threshold; note absent at ≥0.85; block absent when field undefined

---

## Upgrade notes

No config changes required. Drop-in replacement from any v1.4.x release.

**Heatmap size change:** The heatmap is now 200 px wide (was 142 px) with
24 × 24 px cells (was 16 × 16 px). If you have tested dashboard screenshots
or layout snapshots, update them.

Users on integration < v2.2.0 continue to work — all new features degrade
gracefully when their backing entities or API fields are absent. The tab
toggle is hidden, hazard pins are not fetched, room coverage chips are not
shown. The heatmap resize and normalisedWifiPct fix apply to all integration
versions.
