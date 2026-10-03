#!/usr/bin/env python3
"""Refresh tests/fixtures/integration-states.json from an ha_roomba_plus checkout.

The card's contract guard (tests/slugs.test.ts, Plan v3 F15) checks every
slug the card compares against (src/slugs.ts) against the STATE KEYS the
integration declares in its translations/en.json. This script extracts
those keys -- nothing else -- so the fixture stays small and diffable.

Usage:
    python3 scripts/update_contract.py /path/to/ha_roomba_plus

Run it against each integration branch the card supports; commit the
result. If a slug the card uses disappears, `npm test` turns red.
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "tests" / "fixtures" / "integration-states.json"


def main(argv: list[str]) -> int:
    if len(argv) != 2:
        print(__doc__)
        return 2
    comp = Path(argv[1]) / "custom_components" / "roomba_plus"
    translations = json.loads((comp / "translations" / "en.json").read_text("utf-8"))
    manifest = json.loads((comp / "manifest.json").read_text("utf-8"))

    states: dict[str, dict[str, list[str]]] = {}
    for platform, entities in sorted(translations.get("entity", {}).items()):
        for key, spec in sorted(entities.items()):
            keys = sorted((spec.get("state") or {}).keys())
            if keys:
                states.setdefault(platform, {})[key] = keys

    OUT.write_text(
        json.dumps(
            {"integration_version": manifest.get("version"), "states": states},
            indent=1, ensure_ascii=False, sort_keys=True,
        ) + "\n",
        "utf-8",
    )
    print(f"wrote {OUT.relative_to(ROOT)} for integration {manifest.get('version')}")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
