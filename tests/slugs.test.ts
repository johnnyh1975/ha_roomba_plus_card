/**
 * v2.5.0 F15 — contract guard v1.
 *
 * Every slug the card compares against (src/slugs.ts) must exist as a state
 * key in the integration's translations/en.json. The extract lives in
 * tests/fixtures/integration-states.json; refresh it with
 *   python3 scripts/update_contract.py /path/to/ha_roomba_plus
 * When the integration renames or drops a value the card relies on, this
 * turns red — exactly the failure class of issue #17, which shipped because
 * nothing could turn red.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { CARD_SLUG_CONTRACT, READINESS, PHASE } from '../src/slugs';

const fixture = JSON.parse(
  readFileSync(join(__dirname, 'fixtures', 'integration-states.json'), 'utf-8'),
) as { integration_version: string; states: Record<string, Record<string, string[]>> };

function missingSlugs(
  contract: Record<string, Record<string, readonly string[]>>,
  states: Record<string, Record<string, string[]>>,
): string[] {
  const missing: string[] = [];
  for (const [platform, keys] of Object.entries(contract)) {
    for (const [key, slugs] of Object.entries(keys)) {
      const known = new Set(states[platform]?.[key] ?? []);
      for (const slug of slugs) if (!known.has(slug)) missing.push(`${platform}.${key}: ${slug}`);
    }
  }
  return missing;
}

describe('integration slug contract (F15)', () => {
  it('fixture is a real extract (sanity)', () => {
    expect(fixture.integration_version).toMatch(/^\d+\.\d+\.\d+/);
    expect(fixture.states.sensor.readiness).toContain('ready');
  });

  it('every slug the card compares against exists in the integration', () => {
    expect(missingSlugs(CARD_SLUG_CONTRACT, fixture.states)).toEqual([]);
  });

  it('negative control: a display string where a slug belongs is reported (the #17 bug)', () => {
    const broken = { sensor: { readiness: ['Ready'], phase: ['evac'] } };
    expect(missingSlugs(broken, fixture.states)).toEqual([
      'sensor.readiness: Ready',
      'sensor.phase: evac',
    ]);
  });

  it('negative control: a slug the integration drops is reported', () => {
    const states = JSON.parse(JSON.stringify(fixture.states));
    states.sensor.readiness = states.sensor.readiness.filter((s: string) => s !== READINESS.BIN_FULL);
    expect(missingSlugs(CARD_SLUG_CONTRACT, states)).toEqual(['sensor.readiness: bin_full']);
  });

  it('PHASE covers every phase value the header special-cases', () => {
    expect(Object.values(PHASE)).toEqual(expect.arrayContaining([
      'emptying_bin', 'charging_mid_mission', 'no_contact', 'not_responding',
      'washing_pad', 'drying_pad', 'refilling_tank',
    ]));
  });
});

// Invariant 2 (Plan v3): no comparison against display text. A source scan
// for the specific literals that broke in the field — so they cannot creep
// back in through a copy-paste from an old branch.
describe('no display-text comparisons in src/ (invariant 2)', () => {
  const SRC = join(__dirname, '..', 'src');
  const files: string[] = [];
  const walk = (dir: string) => {
    for (const name of readdirSync(dir)) {
      const p = join(dir, name);
      if (statSync(p).isDirectory()) { if (name !== 'i18n') walk(p); }
      else if (p.endsWith('.ts')) files.push(p);
    }
  };
  walk(SRC);

  const BANNED = /[!=]==\s*'(Ready|Bin Full|evac|Empty|Full)'/;

  it('scans a non-trivial number of files', () => expect(files.length).toBeGreaterThan(15));

  it('finds no comparison against a retired display string', () => {
    const hits = files.flatMap(f => readFileSync(f, 'utf-8').split('\n')
      .map((line, i) => ({ f, i: i + 1, line }))
      .filter(({ line }) => BANNED.test(line) && !line.trim().startsWith('//')));
    expect(hits.map(h => `${h.f}:${h.i}`)).toEqual([]);
  });

  it('negative control: the scan pattern catches the original #17 line', () => {
    expect(BANNED.test(`readiness !== 'Ready' && readiness !== 'unknown'`)).toBe(true);
  });
});
