/** v3.0 C — map-zone.ts: the Map tab on image.*_rooms_map. */
import { describe, it, expect } from 'vitest';
import {
  renderMapZone, roomsMapUsable, contentBoxPx, toBoxPct, frameStyles, coverageLayerRect, MapLayer,
} from '../../src/zones/map-zone';
import { buildCalibrationTransform } from '../../src/calibration';
import { classicI7, primeCombo } from '../fixtures/robots';
import { baseConfig, defaultCaps } from '../helpers';
import type { HazardRecord } from '../../src/types';

// The integration's own rooms-map render (image.py _render_rooms_png):
// square 600 px, one scale from the larger span, y flipped.
function integrationCal(polys: [number, number][][]) {
  const xs = polys.flat().map(p => p[0]), ys = polys.flat().map(p => p[1]);
  const xMin = Math.min(...xs), xMax = Math.max(...xs), yMin = Math.min(...ys), yMax = Math.max(...ys);
  const scale = 600 / Math.max(xMax - xMin, yMax - yMin, 1);
  const toPx = (x: number, y: number) => ({ x: (x - xMin) * scale, y: 600 - (y - yMin) * scale });
  const anchors: [number, number][] = [[xMin, yMin], [xMax, yMin], [xMax, yMax]];
  return {
    toPx,
    points: anchors.map(([x, y]) => ({ vacuum: { x, y }, map: toPx(x, y) })),
  };
}

// A long, narrow home: 8 m × 3 m, two rooms, pose mm.
const KITCHEN: [number, number][] = [[0, 0], [4000, 0], [4000, 3000], [0, 3000]];
const HALL: [number, number][] = [[4000, 0], [8000, 0], [8000, 3000], [4000, 3000]];
const CAL = integrationCal([KITCHEN, HALL]);

const roomsAttrs = (aligned: boolean, extra: Record<string, unknown> = {}) => ({
  entity_picture: '/api/image_proxy/image.i7_rooms_map?token=x',
  alignment_pending: !aligned,
  calibration_points: CAL.points,
  rooms: {
    Kitchen: { outline: KITCHEN, name: 'Kitchen', room_id: 'kitchen', icon: 'mdi:fridge', x: 2000, y: 1500 },
    Hall: { outline: HALL, name: 'Hall', room_id: 'hall', icon: 'mdi:door', x: 6000, y: 1500 },
  },
  ...extra,
});

const classicMap = (aligned = true, extra: Record<string, unknown> = {}, rows: Parameters<typeof classicI7>[0] = []) =>
  classicI7([
    ['image.i7_rooms_map', 'rooms_map', 'idle', roomsAttrs(aligned, extra)],
    ['select.i7_cloud_zone_abc', 'cloud_smart_zone_select', 'Kitchen', {
      options: ['Kitchen', 'Hall', 'Rug zone'], is_active_map: true,
      region_icons: { Kitchen: 'mdi:fridge', Hall: 'mdi:door' },
    }],
    ...rows,
  ]);

// Where the card puts a map point: % of the rendered box (12 px margin).
const CALT = buildCalibrationTransform(CAL.points)!;
const BOX = contentBoxPx(CALT, [{ outline: KITCHEN }, { outline: HALL }])!;
const at = (x: number, y: number) => {
  const p = toBoxPct(CALT, BOX, x, y);
  return `left:${p.x.toFixed(2)}%;top:${p.y.toFixed(2)}%`.replace(/[.]/g, '\\.');
};

const caps = { ...defaultCaps, hasSmartZones: true, hasRoomsMap: true };
const state = (o: Partial<{ selectedRooms: Set<string>; hazards: HazardRecord[]; hiddenLayers: Set<MapLayer> }> = {}) => ({
  selectedRooms: new Set<string>(), hazards: [] as HazardRecord[], hiddenLayers: new Set<MapLayer>(), ...o,
});

describe('geometry', () => {
  const cal = buildCalibrationTransform(CAL.points)!;
  const box = contentBoxPx(cal, [{ outline: KITCHEN }, { outline: HALL }], 0)!;

  it('content box is the rooms\' extent on the canvas (wide home → wide box)', () => {
    expect(box.x0).toBeCloseTo(0); expect(box.w).toBeCloseTo(600);
    expect(box.y0).toBeCloseTo(375); expect(box.h).toBeCloseTo(225);
  });
  it('corners map to the box corners (y flipped like the renderer)', () => {
    const tl = toBoxPct(cal, box, 0, 3000), br = toBoxPct(cal, box, 8000, 0);
    expect(tl.x).toBeCloseTo(0); expect(tl.y).toBeCloseTo(0);
    expect(br.x).toBeCloseTo(100); expect(br.y).toBeCloseTo(100);
  });
  it('frame styles: aspect of the box, picture shifted up by the cropped band', () => {
    const f = frameStyles(box);
    expect(f.wrap).toContain('aspect-ratio:2.6667');
    expect(f.img).toContain('top:-166.667%');
    expect(f.img).toContain('height:266.667%');
  });
  it('the margin is clamped to the canvas', () => {
    const b = contentBoxPx(cal, [{ outline: KITCHEN }, { outline: HALL }], 12)!;
    expect(b.x0).toBe(0); expect(b.x0 + b.w).toBe(600);
  });

  // The coverage heatmap's own frame (heatmap.ts / GridStore.render_heatmap):
  // square of side totalMm, top-left at (x_min − ½cell, y_max + ½cell).
  it('coverage layer: a pose point lands on the same spot in both pictures', () => {
    const cov = { x_min_mm: 100, x_max_mm: 7900, y_min_mm: 100, y_max_mm: 2900, cell_size_mm: 200 };
    const rect = coverageLayerRect(cal, box, cov)!;
    expect(rect.flipX || rect.flipY).toBe(false);
    const total = Math.max(7800, 2800) + 200;
    for (const [x, y] of [[3000, 1000], [7900, 2900], [100, 100]]) {
      const inSquare = { x: (x - 100 + 100) / total, y: (2900 - y + 100) / total };
      const onMap = toBoxPct(cal, box, x, y);
      expect(rect.left + inSquare.x * rect.width).toBeCloseTo(onMap.x, 6);
      expect(rect.top + inSquare.y * rect.height).toBeCloseTo(onMap.y, 6);
    }
  });
  it('coverage layer: no cell size → none', () =>
    expect(coverageLayerRect(cal, box, { x_min_mm: 0, x_max_mm: 1, y_min_mm: 0, y_max_mm: 1 })).toBeNull());
});

describe('roomsMapUsable', () => {
  it('needs picture, calibration and rooms', () => {
    expect(roomsMapUsable(classicMap(), 'i7')).toBe(true);
    expect(roomsMapUsable(classicI7(), 'i7')).toBe(false); // fixture: no calibration
    expect(roomsMapUsable(classicMap(true, { calibration_points: [] }), 'i7')).toBe(false);
    expect(roomsMapUsable(classicMap(true, { rooms: {} }), 'i7')).toBe(false);
  });
});

describe('renderMapZone — Classic, aligned', () => {
  const pin = (o: Partial<HazardRecord>): HazardRecord => ({
    gx: null, gy: null, x_mm: 1000, y_mm: 1000, stuck_count: 4, room_name: null,
    bearing_deg: null, distance_mm: null, source: 'stuck_events', ...o,
  } as HazardRecord);
  const hass = classicMap(true, {
    door_markers: [{ id: 'd1', cx: 4000, cy: 1500, label: 'Kitchen ↔ Hall', mission_count: 5 }],
  }, [
    ['image.i7_coverage_map', 'coverage_map', 'idle', {
      entity_picture: '/api/image_proxy/image.i7_coverage_map', x_min_mm: 100, x_max_mm: 7900, y_min_mm: 100, y_max_mm: 2900, cell_size_mm: 200,
    }],
    // Raw pose from the tracker (x = point.x); the map frame swaps the
    // axes (image.py:2034) — this robot stands at map (6000, 1500).
    ['device_tracker.i7', 'position', 'Docked', { x_mm: 1500, y_mm: 6000 }],
  ]);
  const hazards = [pin({}), pin({ source: 'keepout', space: 'umf', x_umf: 5, y_umf: 5 })];
  const html = renderMapZone(hass, baseConfig, caps, 'i7', state({ hazards, selectedRooms: new Set(['Hall']) }));

  it('rooms map is the base picture', () => expect(html).toContain('image.i7_rooms_map'));
  it('rooms are selectable polygons, the selected one marked', () => {
    expect(html).toContain('data-room-poly="Kitchen"');
    expect(html).toMatch(/rpc-room-poly--selected" points="[^"]+" data-room-poly="Hall"/);
  });
  it('labels sit at the centroids', () => {
    expect(html).toMatch(new RegExp(`${at(2000, 1500)}"[^>]*data-room-label="Kitchen"`));
    expect(html).toContain('🧊 Kitchen');
  });
  it('coverage, pose pin, door, robot are drawn; the umf pin is not (map is pose space)', () => {
    expect(html).toContain('rpc-map-coverage');
    expect(html).toContain('rpc-pin-stuck_events');
    expect(html).not.toContain('rpc-pin-keepout');
    expect(html).toContain('🚪');
    expect(html).toMatch(new RegExp(`rpc-map-robot" style="${at(6000, 1500)}`));
  });
  it('layer chips for what exists', () => {
    for (const l of ['coverage', 'stuck', 'details', 'robot']) expect(html).toContain(`data-map-layer="${l}"`);
  });
  it('a hidden layer is not drawn, its chip stays', () => {
    const h = renderMapZone(hass, baseConfig, caps, 'i7', state({ hazards, hiddenLayers: new Set<MapLayer>(['coverage', 'robot']) }));
    expect(h).not.toContain('rpc-map-coverage');
    expect(h).not.toContain('rpc-map-robot');
    expect(h).toContain('data-map-layer="coverage" aria-pressed="false"');
  });
  it('companion mode: rooms not selectable', () => {
    const h = renderMapZone(hass, { ...baseConfig, mode: 'companion' }, caps, 'i7', state());
    expect(h).not.toContain('data-room-poly');
  });
});

describe('renderMapZone — Classic, not yet aligned (map units)', () => {
  const hass = classicMap(false, {}, [
    ['image.i7_coverage_map', 'coverage_map', 'idle', {
      entity_picture: '/x', x_min_mm: 0, x_max_mm: 1, y_min_mm: 0, y_max_mm: 1, cell_size_mm: 200 }],
    ['device_tracker.i7', 'position', 'Docked', { x_mm: 6000, y_mm: 1500 }],
  ]);
  const hazards: HazardRecord[] = [
    { gx: null, gy: null, x_mm: 1, y_mm: 1, space: 'umf', x_umf: 2000, y_umf: 1500, stuck_count: null, room_name: null,
      bearing_deg: null, distance_mm: null, source: 'robot_learned' } as HazardRecord,
    { gx: 1, gy: 1, x_mm: 2000, y_mm: 1500, space: 'pose', stuck_count: 5, room_name: null,
      bearing_deg: 0, distance_mm: 1, source: 'stuck_events' } as HazardRecord,
  ];
  const html = renderMapZone(hass, baseConfig, caps, 'i7', state({ hazards }));
  it('rooms still selectable', () => expect(html).toContain('data-room-poly="Kitchen"'));
  it('no pose-space layers (coverage, robot, stuck pin), a note says why', () => {
    expect(html).not.toContain('rpc-map-coverage');
    expect(html).not.toContain('rpc-map-robot');
    expect(html).not.toContain('rpc-pin-stuck_events');
    expect(html).toContain('not yet matched');
  });
  it('map-sourced pins are not drawn (cloud centroid unit unconfirmed)', () =>
    expect(html).not.toContain('rpc-pin-robot_learned'));
});

describe('renderMapZone — Prime', () => {
  const ROOMS = { 7: { outline: KITCHEN, name: 'Kitchen', room_id: '7' }, 9: { outline: HALL, name: 'Bath', room_id: '9' } };
  const hass = primeCombo([
    ['image.combo_rooms_map', 'rooms_map', 'idle', {
      entity_picture: '/api/image_proxy/image.combo_rooms_map', calibration_points: CAL.points, rooms: ROOMS }],
    ['select.combo_prime_map', 'prime_map', 'follow_robot', { options: ['follow_robot', 'Ground', 'Upstairs'] }],
  ]);
  const html = renderMapZone(hass, baseConfig, caps, 'combo', state());
  it('rooms by name, labels at the vertex mean', () => {
    expect(html).toContain('data-room-poly="Kitchen"');
    expect(html).toMatch(new RegExp(`${at(2000, 1500)}"[^>]*data-room-label="Kitchen"`));
  });
  it('floor selector from prime_map', () => {
    expect(html).toContain('data-cycle-entity="select.combo_prime_map"');
  });
  it('no Classic-only layers', () => {
    expect(html).not.toContain('rpc-map-coverage');
    expect(html).not.toContain('data-map-layer');
    expect(html).not.toContain('not yet matched');
  });
  it('a room the select does not list is drawn but not selectable', () => {
    const h = renderMapZone(primeCombo([
      ['image.combo_rooms_map', 'rooms_map', 'idle', {
        entity_picture: '/p', calibration_points: CAL.points,
        rooms: { ...ROOMS, 11: { outline: [[0, 0], [10, 0], [10, 10]], name: 'Garage', room_id: '11' } } }],
    ]), baseConfig, caps, 'combo', state());
    expect(h).not.toContain('data-room-poly="Garage"');
    expect(h).toContain('Garage');
  });
});

describe('negative controls', () => {
  it('a mirrored calibration moves the labels (the render reads the transform)', () => {
    const mirrored = CAL.points.map(p => ({ vacuum: p.vacuum, map: { x: 600 - p.map.x, y: p.map.y } }));
    const html = renderMapZone(classicMap(true, { calibration_points: mirrored }), baseConfig, caps, 'i7', state());
    expect(html).toMatch(new RegExp(`${at(6000, 1500)}"[^>]*data-room-label="Kitchen"`));
    expect(html).not.toMatch(new RegExp(`${at(2000, 1500)}"[^>]*data-room-label="Kitchen"`));
  });
  it('without a rooms map → empty (the tab falls back to the coverage view)', () =>
    expect(renderMapZone(classicI7(), baseConfig, caps, 'i7', state())).toBe(''));
});

describe('renderMapZone — v3.0 bug-hunt fixes', () => {
  it('robot pose: axes swapped into the map frame (negative control: unswapped is off-map)', () => {
    const swapped = classicMap(true, {}, [['device_tracker.i7', 'position', 'Docked', { x_mm: 1500, y_mm: 6000 }]]);
    expect(renderMapZone(swapped, baseConfig, caps, 'i7', state())).toMatch(new RegExp(`rpc-map-robot" style="${at(6000, 1500)}`));
    const raw = classicMap(true, {}, [['device_tracker.i7', 'position', 'Docked', { x_mm: 6000, y_mm: 1500 }]]);
    expect(renderMapZone(raw, baseConfig, caps, 'i7', state())).not.toContain('rpc-map-robot');
  });
  it('I14: only stuck hotspots are drawn — learned obstacles, keep-outs and map zones wait', () => {
    const hass = classicMap(true, {
      zones: [{ type: 'observed', x: 1000, y: 1000 }, { type: 'keepout', polygon: [[4500, 300], [5500, 300], [5500, 900]] }],
    });
    const hz = [
      { gx: 1, gy: 1, x_mm: 1000, y_mm: 1000, space: 'pose', source: 'stuck_events', stuck_count: 5, room_name: null, bearing_deg: 0, distance_mm: 1 },
      { gx: null, gy: null, x_mm: 5000, y_mm: 500, space: 'pose', source: 'keepout', stuck_count: null, room_name: null, bearing_deg: 0, distance_mm: 1 },
      { gx: null, gy: null, x_mm: 5000, y_mm: 600, space: 'pose', source: 'robot_learned', stuck_count: null, room_name: null, bearing_deg: 0, distance_mm: 1 },
    ] as HazardRecord[];
    const html = renderMapZone(hass, baseConfig, caps, 'i7', state({ hazards: hz }));
    expect(html).toContain('rpc-pin-stuck_events');
    expect(html).not.toContain('rpc-pin-keepout');
    expect(html).not.toContain('rpc-pin-robot_learned');
    expect(html).not.toContain('rpc-zone-keepout');
  });
});

describe('renderMapZone — v3.0 bug hunt 2', () => {
  it('room accessibility tooltip on the label (Classic, 2.4 ROOM-ACCESS)', () => {
    const hass = classicMap(true, {}, [['sensor.i7_room_accessibility_scores', 'room_accessibility_scores', '2',
      { Kitchen: { score: 42.4, limiting_factor: 'narrow_passages' }, friendly_name: 'x' }]]);
    const html = renderMapZone(hass, baseConfig, { ...caps, hasRoomAccess: true }, 'i7', state());
    expect(html).toMatch(/data-room-label="Kitchen" title="[^"]*42[^"]*"/);
  });
  it('"Updated" follows the heatmap\'s last mission, not the rooms picture', () => {
    const when = new Date(Date.now() - 2 * 3600e3).toISOString();
    const hass = classicMap(true, {}, [['image.i7_coverage_map', 'coverage_map', 'idle', {
      entity_picture: '/cov', x_min_mm: 100, x_max_mm: 7900, y_min_mm: 100, y_max_mm: 2900, cell_size_mm: 200, last_mission_end: when }]]);
    expect(renderMapZone(hass, baseConfig, caps, 'i7', state())).toContain('Updated 2 hours ago');
    expect(renderMapZone(hass, baseConfig, caps, 'i7', state({ hiddenLayers: new Set<MapLayer>(['coverage']) }))).not.toContain('Updated');
  });
  it('degenerate outlines → not usable (tab, caps and diagnostics agree)', () => {
    const flat = { A: { outline: [[0, 0], [0, 0], [0, 0]], name: 'A', x: 0, y: 0 } };
    expect(roomsMapUsable(classicMap(true, { rooms: flat }), 'i7')).toBe(false);
  });
});

// ── I11 (integration 4.2.20): position in the map frame from the tracker ──
import { trackerMapPosition } from '../../src/zones/map-zone';
describe('trackerMapPosition — I11', () => {
  it('uses map_x_mm/map_y_mm when published (no swap)', () =>
    expect(trackerMapPosition({ x_mm: 100, y_mm: 200, map_x_mm: 6000, map_y_mm: 1500 })).toEqual({ x: 6000, y: 1500 }));
  it('older integration: swaps the raw pose into the map frame', () =>
    expect(trackerMapPosition({ x_mm: 1500, y_mm: 6000 })).toEqual({ x: 6000, y: 1500 }));
  it('nothing usable → null', () => {
    expect(trackerMapPosition({})).toBeNull();
    expect(trackerMapPosition({ map_x_mm: NaN, map_y_mm: 1 })).toBeNull();
  });
  it('render: the map-frame pair wins over the raw pose (negative control: raw alone would be off-map)', () => {
    const hass = classicMap(true, {}, [['device_tracker.i7', 'position', 'Cleaning', { x_mm: 6000, y_mm: 1500, map_x_mm: 6000, map_y_mm: 1500 }]]);
    expect(renderMapZone(hass, baseConfig, caps, 'i7', state())).toMatch(new RegExp(`rpc-map-robot" style="${at(6000, 1500)}`));
    const raw = classicMap(true, {}, [['device_tracker.i7', 'position', 'Cleaning', { x_mm: 6000, y_mm: 1500 }]]);
    expect(renderMapZone(raw, baseConfig, caps, 'i7', state())).not.toContain('rpc-map-robot');
  });
});

// ── I12 (4.2.20): room-map names = select names, so an aliased room is tappable ──
describe('renderMapZone — I12 aliased Classic room', () => {
  it('a room named by its alias on both sides is selectable', () => {
    const hass = classicMap(true, {
      rooms: {
        'Küche (neu)': { outline: KITCHEN, name: 'Küche (neu)', room_id: 'kuche_neu', region_id: '7', x: 2000, y: 1500 },
        Hall: { outline: HALL, name: 'Hall', room_id: 'hall', region_id: '8', x: 6000, y: 1500 },
      },
    }, [['select.i7_cloud_zone_abc', 'cloud_smart_zone_select', 'Hall', {
      options: ['Küche (neu)', 'Hall'], is_active_map: true }]]);
    expect(renderMapZone(hass, baseConfig, caps, 'i7', state())).toContain('data-room-poly="Küche (neu)"');
  });
});

// 4.2.20 notes: the Prime room map can list a zone among its rooms; segment_type says so.
describe('renderMapZone — I13 zone among the room map\'s rooms (Prime)', () => {
  it('drawn, not selectable', () => {
    const hass = primeCombo([
      ['image.combo_rooms_map', 'rooms_map', 'idle', { entity_picture: '/p', calibration_points: CAL.points,
        rooms: { 1: { outline: KITCHEN, name: 'Kitchen', room_id: 'kitchen', region_id: '1' },
                 2: { outline: HALL, name: 'Couch zone', room_id: 'couch_zone', region_id: 'z2' } } }],
      ['select.combo_prime_zone_select', 'prime_zone_select', 'Kitchen', {
        options: ['Couch zone', 'Kitchen'], segment_type: { Kitchen: 'room', 'Couch zone': 'zone' } }],
    ]);
    const html = renderMapZone(hass, baseConfig, caps, 'combo', state());
    expect(html).toContain('data-room-poly="Kitchen"');
    expect(html).not.toContain('data-room-poly="Couch zone"');
    expect(html).toContain('Couch zone');
  });
});
