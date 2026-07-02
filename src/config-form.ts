/**
 * B4 (v2.1.0) — config form schema, extracted as a pure module so it can be
 * unit-tested without a DOM (the card class extends HTMLElement and cannot be
 * imported in the node test environment).
 *
 * Leads with the real v2.0 tab-architecture switches (mode, default_tab). The
 * legacy show_* zone booleans predate tabs; they still gate content *within*
 * tabs, so they're retained under an "Advanced — content visibility" group
 * rather than removed (removal is a breaking change reserved for v3.0) and
 * rather than shown top-level (where they read as layout controls, which they
 * no longer are).
 *
 * `show_settings` is intentionally absent: it is the @deprecated alias for
 * mode:'companion' and must not be offered alongside the `mode` selector.
 */

export interface HAFormField {
  name: string;
  label?: string;
  title?: string;
  type?: string;
  required?: boolean;
  selector?: Record<string, unknown>;
  schema?: HAFormField[];
}

export const ADVANCED_VISIBILITY_FLAGS = [
  'show_rooms',
  'show_health',
  'show_schedule',
  'show_alerts',
  'show_history',
  'show_lifetime',
  'show_dirt_events',
] as const;

export function buildConfigFormSchema(): HAFormField[] {
  return [
    {
      name: 'entity',
      label: 'Robot vacuum',
      required: true,
      selector: { entity: { domain: 'vacuum' } },
    },
    {
      name: 'entities',
      label: 'Multiple robots (overrides single robot above)',
      selector: { entity: { domain: 'vacuum', multiple: true } },
    },
    // ── v2.0 tab-architecture switches (the real layout controls) ──────────
    {
      name: 'mode',
      label: 'Mode',
      selector: {
        select: {
          mode: 'dropdown',
          options: [
            { value: 'standalone', label: 'Standalone — card owns the Map tab & room selection' },
            { value: 'companion',  label: 'Companion — external map card handles spatial view' },
          ],
        },
      },
    },
    {
      name: 'default_tab',
      label: 'Default tab on load',
      selector: {
        select: {
          mode: 'dropdown',
          options: [
            { value: 'map',      label: 'Map' },
            { value: 'history',  label: 'History' },
            { value: 'health',   label: 'Health' },
            { value: 'settings', label: 'Settings' },
          ],
        },
      },
    },
    {
      name: 'area_unit',
      label: 'Area unit',
      selector: { select: { options: ['auto', 'sqft', 'm2'], mode: 'dropdown' } },
    },
    {
      name: 'history_days',
      label: 'History window',
      selector: {
        select: {
          options: [
            { value: 7,  label: '7 days'  },
            { value: 14, label: '14 days' },
            { value: 28, label: '28 days' },
          ],
          mode: 'dropdown',
        },
      },
    },
    {
      name: 'presence_entities',
      label: 'Presence sensors (person.* entities)',
      selector: { entity: { domain: 'person', multiple: true } },
    },
    {
      name: 'robot_selector_helper',
      label: 'Robot selector helper (input_text or input_select — for xiaomi card sync)',
      selector: { entity: { domain: ['input_text', 'input_select'] } },
    },
    // ── Advanced: content visibility within tabs ───────────────────────────
    {
      name: '',
      type: 'expandable',
      title: 'Advanced — content visibility',
      schema: ADVANCED_VISIBILITY_FLAGS.map((flag) => ({
        name: flag,
        label: ADVANCED_LABELS[flag],
        selector: { boolean: {} },
      })),
    },
  ];
}

const ADVANCED_LABELS: Record<(typeof ADVANCED_VISIBILITY_FLAGS)[number], string> = {
  show_rooms:       'Room selector (SMART robots, Map tab)',
  show_health:      'Health tab content',
  show_schedule:    'Schedule & presence content',
  show_alerts:      'Alert banners',
  show_history:     'History tab content',
  show_lifetime:    'Lifetime stats (History tab)',
  show_dirt_events: 'Dirt events in day detail',
};
