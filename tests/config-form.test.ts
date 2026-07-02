/**
 * B4 (v2.1.0) — config form reflects the v2.0 tab architecture.
 *
 * Tests the REAL schema via buildConfigFormSchema() (extracted to a pure module
 * so it imports without a DOM). This is a genuine drift tripwire: if the form
 * regresses to the old zone model, these assertions fail.
 */
import { describe, it, expect } from 'vitest';
import { buildConfigFormSchema, ADVANCED_VISIBILITY_FLAGS, HAFormField } from '../src/config-form';

const schema = buildConfigFormSchema();
const topLevelNames = schema.map((f) => f.name);

function field(name: string): HAFormField | undefined {
  return schema.find((f) => f.name === name);
}
function advancedGroup(): HAFormField | undefined {
  return schema.find((f) => f.type === 'expandable');
}

describe('B4 — top-level leads with real v2.0 switches', () => {
  it('exposes mode at top level', () => {
    expect(topLevelNames).toContain('mode');
    const opts = (field('mode')?.selector as any)?.select?.options?.map((o: any) => o.value);
    expect(opts).toEqual(['standalone', 'companion']);
  });

  it('exposes default_tab at top level with all four tabs', () => {
    expect(topLevelNames).toContain('default_tab');
    const opts = (field('default_tab')?.selector as any)?.select?.options?.map((o: any) => o.value);
    expect(opts).toEqual(['map', 'history', 'health', 'settings']);
  });

  it('keeps entity required', () => {
    expect(field('entity')?.required).toBe(true);
  });
});

describe('B4 — legacy show_* flags grouped under Advanced', () => {
  it('has an expandable Advanced group', () => {
    const grp = advancedGroup();
    expect(grp).toBeDefined();
    expect(grp?.title).toMatch(/Advanced/);
  });

  it('Advanced contains exactly the legacy visibility flags', () => {
    const grp = advancedGroup();
    const names = (grp?.schema ?? []).map((f) => f.name);
    expect(names).toEqual([...ADVANCED_VISIBILITY_FLAGS]);
  });

  it('none of the legacy flags appear at top level', () => {
    for (const flag of ADVANCED_VISIBILITY_FLAGS) {
      expect(topLevelNames).not.toContain(flag);
    }
  });
});

describe('B4 — deprecated show_settings is not offered', () => {
  it('absent from top level', () => {
    expect(topLevelNames).not.toContain('show_settings');
  });

  it('absent from Advanced group', () => {
    const names = (advancedGroup()?.schema ?? []).map((f) => f.name);
    expect(names).not.toContain('show_settings');
  });
});

describe('B4 — every field carries a selector or is a group', () => {
  it('all top-level non-group fields have a selector', () => {
    for (const f of schema) {
      if (f.type === 'expandable') continue;
      expect(f.selector, `field ${f.name}`).toBeDefined();
    }
  });

  it('all Advanced fields are booleans with labels', () => {
    for (const f of advancedGroup()?.schema ?? []) {
      expect(f.selector).toHaveProperty('boolean');
      expect(typeof f.label).toBe('string');
    }
  });
});
