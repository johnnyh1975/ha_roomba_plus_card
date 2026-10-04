/** v2.5.0 — const.ts: MDI → emoji lookup for room icons. */
import { describe, it, expect } from 'vitest';
import { mdiToEmoji, MDI_TO_EMOJI } from '../src/const';

describe('mdiToEmoji()', () => {
  it('accepts the integration\'s full "mdi:" name (what region_icons sends)', () =>
    expect(mdiToEmoji('mdi:fridge')).toBe('🧊'));
  it('accepts a bare name', () => expect(mdiToEmoji('fridge')).toBe('🧊'));
  it('unknown / empty → fallback', () => {
    expect(mdiToEmoji('mdi:nothing-like-this', '📍')).toBe('📍');
    expect(mdiToEmoji(undefined)).toBe('');
  });
  it('negative control: the raw table alone does NOT match "mdi:" names (the old bug)', () =>
    expect(MDI_TO_EMOJI['mdi:fridge']).toBeUndefined());
  it('covers every room-type icon of the integration (REGION_TYPE_ICONS, 4.2.18)', () => {
    const integrationIcons = ['shower', 'bed-king', 'silverware-fork-knife', 'hanger', 'sofa-single',
      'door-open', 'garage', 'stove', 'archive', 'asterisk', 'home-floor-b', 'landslide',
      'shoe-print', 'sun-angle', 'teddy-bear', 'toolbox', 'desk', 'television'];
    expect(integrationIcons.filter(i => mdiToEmoji(`mdi:${i}`) === '')).toEqual([]);
  });
});

// ── v3.0 A4 — CARD_VERSION follows package.json ──────────────────────────
import { CARD_VERSION } from '../src/const';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
describe('CARD_VERSION', () => {
  it('equals package.json version', () => {
    const pkg = JSON.parse(readFileSync(join(__dirname, '..', 'package.json'), 'utf-8'));
    expect(CARD_VERSION).toBe(pkg.version);
  });
});
