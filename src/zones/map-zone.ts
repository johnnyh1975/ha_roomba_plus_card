/**
 * map-zone.ts — v3.0 C: the Map tab on image.*_rooms_map, both generations.
 *
 * Up to 2.5 the Map tab was the coverage heatmap (image.*_coverage_map) with
 * room outlines drawn on top — Classic only, and the overlay never shared a
 * frame with the picture until 2.5 rebuilt the renderer's transform. The
 * rooms map is the integration's own room picture for both generations,
 * 600 × 600 px, and publishes `calibration_points` that map its coordinate
 * space onto those pixels (image.py RoombaRoomsImage / PrimeRoomsImage). So
 * everything the card draws here is placed with ONE transform:
 *
 *   - rooms: tap to select (both generations), label at the centroid
 *   - Classic, aligned (`alignment_pending: false`, pose-space mm):
 *       coverage heatmap as an image layer, stuck hotspots, door markers,
 *       furniture candidates, the robot's position
 *     (learned obstacles and keep-out zones wait for Plan v3 I14)
 *   - Classic, not yet aligned (map units): rooms only. Map-sourced pins
 *     carry `x_umf`/`y_umf`, but the cloud's obstacle centroids are raw
 *     cloud values whose unit is not confirmed (cloud_coordinator.py
 *     observed_zone_centroids, "Q6"), while room outlines are scaled to mm
 *     — so they are not drawn there rather than drawn in the wrong place.
 *   - Prime: rooms; the picture itself carries the live layers
 *
 * The square canvas is cropped to the rooms' bounding box (plus a margin),
 * so a long, narrow home is not a strip in a dark square (#20).
 *
 * Layers that exist can be switched off (chips under the map); the card
 * keeps the set of switched-off layers for the session.
 */
import type { HomeAssistant, CardConfig, RobotCapabilities, HazardRecord, HAState } from '../types.js';
import { robot, Generation } from '../registry.js';
import { roomsRole } from '../robot-model.js';
import { buildCalibrationTransform, CalibrationTransform, CalibrationPoint, CALIBRATION_CANVAS_PX } from '../calibration.js';
import { coverageExtentFromAttrs, coverageContentBox } from '../heatmap.js';
import { esc, timeSince } from '../utils.js';
import { mdiToEmoji } from '../const.js';
import { t, resolveLang } from '../i18n/index.js';
import { pinIcon, buildPinTip, roomAccessTips } from './history-zone.js';

export type MapLayer = 'coverage' | 'stuck' | 'details' | 'robot';

export interface MapZoneState {
  selectedRooms: Set<string>;
  hazards: HazardRecord[];
  /** Layers the user switched off this session. */
  hiddenLayers: Set<MapLayer>;
}

interface RoomGeom {
  name: string;
  outline: [number, number][];
  /** Label anchor in map coordinates. */
  cx: number; cy: number;
  icon: string | null;
}

/** Pixel box of the map content (600 px canvas units). */
export interface PxBox { x0: number; y0: number; w: number; h: number }

/** The rooms map entity for this robot when it can carry the Map tab: has a
 *  picture, a calibration and at least one room. */
export function roomsMapUsable(hass: HomeAssistant, n: string): boolean {
  return mapModel(hass, n) !== null;
}

interface MapModel {
  entityId: string;
  picture: string;
  cal: CalibrationTransform;
  rooms: RoomGeom[];
  /** Classic: calibration in pose-space mm (aligned). Prime: true. */
  poseSpace: boolean;
  generation: Generation;
  attrs: Record<string, unknown>;
  state: HAState;
}

function mapModel(hass: HomeAssistant, n: string): MapModel | null {
  const R = robot(hass, n);
  const entityId = R.id('image', 'rooms_map');
  const s = entityId ? hass.states[entityId] : undefined;
  if (!entityId || !s || s.state === 'unavailable') return null;
  const attrs = s.attributes ?? {};
  const picture = typeof attrs.entity_picture === 'string' ? attrs.entity_picture : null;
  const cal = buildCalibrationTransform(attrs.calibration_points as CalibrationPoint[]);
  if (!picture || !cal) return null;
  const rawRooms = attrs.rooms && typeof attrs.rooms === 'object' ? attrs.rooms as Record<string, unknown> : {};
  const rooms: RoomGeom[] = [];
  for (const v of Object.values(rawRooms)) {
    const r = v as { outline?: unknown; name?: unknown; x?: unknown; y?: unknown; icon?: unknown };
    if (!Array.isArray(r.outline) || r.outline.length < 3 || typeof r.name !== 'string') continue;
    const outline = (r.outline as unknown[]).filter((p): p is [number, number] =>
      Array.isArray(p) && Number.isFinite(p[0]) && Number.isFinite(p[1]));
    if (outline.length < 3) continue;
    // Classic publishes a centroid; Prime does not — the vertex mean is
    // what the Classic integration computes too (image.py rooms[...]).
    const cx = typeof r.x === 'number' ? r.x : outline.reduce((a, p) => a + p[0], 0) / outline.length;
    const cy = typeof r.y === 'number' ? r.y : outline.reduce((a, p) => a + p[1], 0) / outline.length;
    rooms.push({ name: r.name, outline, cx, cy, icon: typeof r.icon === 'string' ? r.icon : null });
  }
  if (rooms.length === 0) return null;
  // Degenerate outlines (no area on the canvas): not usable — decided here
  // so the Map tab, capabilities and diagnostics agree.
  if (!contentBoxPx(cal, rooms)) return null;
  const generation = R.generation;
  return {
    entityId, picture, cal, rooms, generation, attrs, state: s,
    // Prime polygons are in the robot's own coordinates (prime_room_map.py,
    // nothing to align); Classic only once the aligner has run.
    poseSpace: generation === 'prime' || attrs.alignment_pending === false,
  };
}

/**
 * The robot's position in the maps' frame, from the tracker.
 * Integration ≥ 4.2.20 publishes it directly (`map_x_mm`/`map_y_mm`, from
 * the same function the maps use — Plan v3 I11). Older versions only have
 * the raw pose (`x_mm`/`y_mm`, firmware order, device_tracker.py:604),
 * while every map layer is drawn with the axes swapped (image.py:2034) —
 * there the card swaps them itself.
 */
export function trackerMapPosition(attrs: Record<string, unknown> | undefined): { x: number; y: number } | null {
  const a = attrs ?? {};
  const num = (v: unknown) => typeof v === 'number' && Number.isFinite(v);
  if (num(a.map_x_mm) && num(a.map_y_mm)) return { x: a.map_x_mm as number, y: a.map_y_mm as number };
  if (num(a.x_mm) && num(a.y_mm)) return { x: a.y_mm as number, y: a.x_mm as number };
  return null;
}

/** A Classic rooms map whose coordinates are still the cloud map's own
 *  (`alignment_pending`): the coverage heatmap and pins are in the robot's
 *  pose frame and cannot be placed on it yet. */
export function classicMapUnaligned(hass: HomeAssistant, n: string): boolean {
  const m = mapModel(hass, n);
  return !!m && m.generation !== 'prime' && !m.poseSpace;
}

/** Bounding box of all room outlines in canvas px, with a margin, clamped to
 *  the canvas. */
export function contentBoxPx(cal: CalibrationTransform, rooms: { outline: [number, number][] }[], marginPx = 12): PxBox | null {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const r of rooms) for (const [x, y] of r.outline) {
    const p = cal.toPx(x, y);
    if (!Number.isFinite(p.x) || !Number.isFinite(p.y)) continue;
    x0 = Math.min(x0, p.x); y0 = Math.min(y0, p.y); x1 = Math.max(x1, p.x); y1 = Math.max(y1, p.y);
  }
  if (!Number.isFinite(x0) || x1 - x0 < 1 || y1 - y0 < 1) return null;
  const C = CALIBRATION_CANVAS_PX;
  x0 = Math.max(0, x0 - marginPx); y0 = Math.max(0, y0 - marginPx);
  x1 = Math.min(C, x1 + marginPx); y1 = Math.min(C, y1 + marginPx);
  return { x0, y0, w: x1 - x0, h: y1 - y0 };
}

/** Map coordinates → % of the content box. */
export function toBoxPct(cal: CalibrationTransform, box: PxBox, x: number, y: number): { x: number; y: number } {
  const p = cal.toPx(x, y);
  return { x: (p.x - box.x0) / box.w * 100, y: (p.y - box.y0) / box.h * 100 };
}

/** Inline styles: wrapper with the box's aspect ratio (capped at 70 % of the
 *  viewport height), the 600 px picture scaled and shifted so the box fills
 *  the wrapper. */
export function frameStyles(box: PxBox): { wrap: string; img: string } {
  const C = CALIBRATION_CANVAS_PX;
  const aspect = box.w / box.h;
  return {
    wrap: `aspect-ratio:${aspect.toFixed(4)};width:min(100%, calc(70vh * ${aspect.toFixed(4)}))`,
    img: `position:absolute;left:${(-box.x0 / box.w * 100).toFixed(3)}%;top:${(-box.y0 / box.h * 100).toFixed(3)}%;`
       + `width:${(C / box.w * 100).toFixed(3)}%;height:${(C / box.h * 100).toFixed(3)}%;max-width:none`,
  };
}

/**
 * Where the coverage heatmap (image.*_coverage_map) lies on the rooms map,
 * in % of the content box. Both are pose-space mm: the heatmap square spans
 * `totalMm` from its top-left corner (x_min − ½ cell, y_max + ½ cell) —
 * the renderer's frame, heatmap.ts coverageContentBox. Null without a cell
 * size (very old integrations) or extent.
 */
export function coverageLayerRect(cal: CalibrationTransform, box: PxBox, coverageAttrs: Record<string, unknown> | undefined):
  { left: number; top: number; width: number; height: number; flipX: boolean; flipY: boolean } | null {
  const ext = coverageExtentFromAttrs(coverageAttrs);
  if (!ext) return null;
  const cb = coverageContentBox(ext);
  if (!cb) return null;
  const half = ext.cellMm! / 2;
  const a = toBoxPct(cal, box, ext.xMin - half, ext.yMax + half);                       // top-left
  const b = toBoxPct(cal, box, ext.xMin - half + cb.totalMm, ext.yMax + half - cb.totalMm); // bottom-right
  return {
    left: Math.min(a.x, b.x), top: Math.min(a.y, b.y),
    width: Math.abs(b.x - a.x), height: Math.abs(b.y - a.y),
    flipX: b.x < a.x, flipY: b.y < a.y,
  };
}

const fmt = (v: number) => v.toFixed(2);

export function renderMapZone(
  hass: HomeAssistant,
  config: CardConfig,
  caps: RobotCapabilities,
  n: string,
  state: MapZoneState,
): string {
  const lang = resolveLang(hass.language);
  const model = mapModel(hass, n);
  if (!model) return '';
  const R = robot(hass, n);
  const { cal } = model;
  const box = contentBoxPx(cal, model.rooms);
  if (!box) return '';
  const frame = frameStyles(box);
  const pct = (x: number, y: number) => toBoxPct(cal, box, x, y);
  const inBox = (p: { x: number; y: number }) => p.x >= 0 && p.x <= 100 && p.y >= 0 && p.y <= 100;
  const on = (l: MapLayer) => !state.hiddenLayers.has(l);
  const available = new Set<MapLayer>();

  // ── rooms ────────────────────────────────────────────────────────────
  // Only rooms the robot can be sent to are selectable (robot-model rooms
  // role: rooms, never zones; Prime: this account's room names).
  const rr = roomsRole(hass, n, R);
  const cleanable = new Set(rr.rooms);
  const selectable = (name: string) => caps.hasSmartZones && config.mode !== 'companion' && cleanable.has(name);
  const polys = model.rooms.map(room => {
    const pts = room.outline.map(([x, y]) => { const p = pct(x, y); return `${fmt(p.x)},${fmt(p.y)}`; }).join(' ');
    const sel = state.selectedRooms.has(room.name);
    return selectable(room.name)
      ? `<polygon class="rpc-room-poly${sel ? ' rpc-room-poly--selected' : ''}" points="${pts}" data-room-poly="${esc(room.name)}" />`
      : `<polygon class="rpc-room-poly rpc-room-poly--static" points="${pts}" />`;
  }).join('');
  const accessTips = roomAccessTips(hass, caps, n, lang);
  const labels = model.rooms.map(room => {
    const p = pct(room.cx, room.cy);
    if (!inBox(p)) return '';
    const sel = state.selectedRooms.has(room.name);
    const emoji = room.icon ? mdiToEmoji(room.icon) : (rr.icons[room.name] ? mdiToEmoji(rr.icons[room.name]) : '');
    const area = rr.areasM2[room.name];
    const areaSuffix = typeof area === 'number' && Number.isFinite(area) ? ` / ${area.toFixed(1)} m²` : '';
    const tip = accessTips[room.name];
    const attr = (selectable(room.name) ? ` data-room-label="${esc(room.name)}"` : '')
      + (tip ? ` title="${esc(tip)}"` : '');
    return `<div class="rpc-room-label${sel ? ' rpc-room-label--selected' : ''}${selectable(room.name) ? '' : ' rpc-room-label--static'}"
      style="left:${fmt(p.x)}%;top:${fmt(p.y)}%"${attr}>${emoji ? `${emoji} ` : ''}${esc(room.name)}${esc(areaSuffix)}</div>`;
  }).join('');

  // ── coverage heatmap (Classic, aligned) ──────────────────────────────
  let coverageHtml = '';
  const cov = model.poseSpace && model.generation === 'classic' ? R.st('image', 'coverage_map') : undefined;
  const covPic = cov?.attributes?.entity_picture;
  if (cov && typeof covPic === 'string') {
    const rect = coverageLayerRect(cal, box, cov.attributes);
    if (rect) {
      available.add('coverage');
      if (on('coverage')) {
        const flip = rect.flipX || rect.flipY ? `transform:scale(${rect.flipX ? -1 : 1},${rect.flipY ? -1 : 1});` : '';
        coverageHtml = `<img class="rpc-map-coverage" src="${esc(covPic)}" alt=""
          style="left:${fmt(rect.left)}%;top:${fmt(rect.top)}%;width:${fmt(rect.width)}%;height:${fmt(rect.height)}%;${flip}" />`;
      }
    }
  }

  // ── stuck hotspots (Classic, aligned) ────────────────────────────────
  // Only GridStore's stuck hotspots: pose-space mm, from the robot's own
  // pose stream. Learned obstacles and keep-out zones (pins and the room
  // map's `zones`) come through a cloud-map reader that currently yields
  // nothing on real data (Plan v3 I14) — not drawn until that is settled.
  const pins = state.hazards
    .filter(h => model.poseSpace && h.source === 'stuck_events' && (h.space ?? 'pose') === 'pose'
      && Number.isFinite(h.x_mm) && Number.isFinite(h.y_mm))
    .map(h => ({ h, pos: pct(h.x_mm, h.y_mm) })).filter(p => inBox(p.pos));
  if (pins.length) available.add('stuck');
  let stuckHtml = '';
  if (on('stuck') && pins.length) {
    stuckHtml = pins.map(({ h, pos }) => {
      const tip = esc(buildPinTip(h, lang));
      return `<div class="rpc-hazard-pin rpc-pin-${h.source}" style="left:${fmt(pos.x)}%;top:${fmt(pos.y)}%" title="${tip}" aria-label="${tip}">${pinIcon(h.source)}</div>`;
    }).join('');
  }

  // ── details: door markers, furniture candidates (Classic, aligned) ──
  const doors = model.poseSpace && Array.isArray(model.attrs.door_markers)
    ? (model.attrs.door_markers as { cx: number; cy: number; label: string; mission_count: number }[]) : [];
  const furniture = model.poseSpace && Array.isArray(model.attrs.furniture_candidates)
    ? (model.attrs.furniture_candidates as { x_mm: number; y_mm: number }[]) : [];
  if (doors.length || furniture.length) available.add('details');
  let detailsHtml = '';
  if (on('details')) {
    detailsHtml = doors.map(m => {
      const p = pct(m.cx, m.cy);
      if (!inBox(p)) return '';
      const tip = esc(t(lang, 'history.doorMarkerSeen', { label: m.label, count: m.mission_count }));
      return `<div class="rpc-door-marker" style="left:${fmt(p.x)}%;top:${fmt(p.y)}%" title="${tip}" aria-label="${tip}">🚪</div>`;
    }).join('') + furniture.map(c => {
      const p = pct(c.x_mm, c.y_mm);
      if (!inBox(p)) return '';
      const tip = esc(t(lang, 'history.possibleFurnitureChange'));
      return `<div class="rpc-furniture-shadow" style="left:${fmt(p.x)}%;top:${fmt(p.y)}%" title="${tip}" aria-label="${tip}"></div>`;
    }).join('');
  }

  // ── robot position (Classic, aligned: tracker pose; Prime: in the picture)
  let robotHtml = '';
  if (model.generation === 'classic' && model.poseSpace) {
    const pos = trackerMapPosition(R.st('device_tracker', 'position')?.attributes);
    if (pos) {
      const p = pct(pos.x, pos.y);
      if (inBox(p)) {
        available.add('robot');
        if (on('robot')) robotHtml = `<div class="rpc-map-robot" style="left:${fmt(p.x)}%;top:${fmt(p.y)}%" title="${esc(t(lang, 'map.robotPosition'))}"></div>`;
      }
    }
  }

  // ── layer chips, legend, notes ───────────────────────────────────────
  const LAYER_LABEL: Record<MapLayer, string> = {
    coverage: t(lang, 'map.layerCoverage'), stuck: t(lang, 'map.layerStuck'),
    details: t(lang, 'map.layerDetails'), robot: t(lang, 'map.layerRobot'),
  };
  const chips = (['coverage', 'stuck', 'details', 'robot'] as MapLayer[]).filter(l => available.has(l))
    .map(l => `<button class="rpc-pass-chip${on(l) ? ' rpc-pass-chip--selected' : ''}" data-map-layer="${l}" aria-pressed="${on(l)}">${LAYER_LABEL[l]}</button>`).join('');

  const legend = [
    // The heatmap paints coverage in blue (brighter = more often) and stuck
    // cells red (grid_store.py render_heatmap).
    coverageHtml ? `<span style="color:#2f6bff">●</span> ${t(lang, 'history.highCoverage')}` : '',
    coverageHtml ? `<span style="color:#1e3a5f">●</span> ${t(lang, 'history.rarelyCleaned')}` : '',
    stuckHtml ? `<span>📍</span> ${t(lang, 'history.pinStuckHotspot')}` : '',
  ].filter(Boolean).join(' ');

  const notAligned = model.generation === 'classic' && !model.poseSpace
    ? `<div class="rpc-coverage-note">${t(lang, 'map.notAligned')}</div>` : '';
  const hint = caps.hasSmartZones && config.mode !== 'companion' && state.selectedRooms.size === 0
    ? `<div class="rpc-coverage-updated">${t(lang, 'map.tapHint')}</div>` : '';

  // Prime: which floor this is ("follow the robot" or a named map).
  let floorHtml = '';
  const floorSel = R.st('select', 'prime_map');
  if (floorSel && floorSel.state !== 'unavailable') {
    const opts = Array.isArray(floorSel.attributes?.options) ? floorSel.attributes.options as string[] : [];
    if (opts.length > 2) {
      const id = R.id('select', 'prime_map')!;
      const shown = typeof hass.formatEntityState === 'function'
        ? (() => { try { return hass.formatEntityState!(floorSel); } catch { return floorSel.state; } })() : floorSel.state;
      floorHtml = `<button class="rpc-setting-cycle rpc-map-floor" data-cycle-entity="${esc(id)}"
        data-cycle-options="${esc(JSON.stringify(opts))}" data-cycle-current="${esc(floorSel.state)}">🗺 ${esc(shown)} ▼</button>`;
    }
  }

  // "Updated" only for the heatmap (its last mission); the rooms map's own
  // timestamp moves only when the picture is redrawn.
  const lastEnd = coverageHtml ? cov?.attributes?.last_mission_end : undefined;
  const updated = typeof lastEnd === 'string'
    ? `<div class="rpc-coverage-updated">${t(lang, 'history.updated', { time: timeSince(lastEnd, hass.language) })}</div>` : '';

  return `
    <div class="rpc-zone rpc-map-zone">
      ${floorHtml}
      <div class="rpc-coverage-panel">
        <div class="rpc-coverage-image-wrap rpc-map-wrap" style="${frame.wrap}">
          <img class="rpc-map-base" style="${frame.img}" src="${esc(model.picture)}" alt="${t(lang, 'map.alt')}" />
          ${coverageHtml}
          <svg class="rpc-room-overlay" viewBox="0 0 100 100" preserveAspectRatio="none">${polys}</svg>
          ${stuckHtml}
          ${detailsHtml}
          ${robotHtml}
          ${labels}
        </div>
        ${chips ? `<div class="rpc-map-layers">${chips}</div>` : ''}
        ${legend ? `<div class="rpc-coverage-legend">${legend}</div>` : ''}
        ${notAligned}
        ${hint}
        ${updated}
      </div>
    </div>
  `;
}
