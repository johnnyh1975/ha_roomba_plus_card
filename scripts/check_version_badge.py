#!/usr/bin/env python3
"""README version badge vs. package.json — consistency check.

Adapted from ha_roomba_plus's identically-named script (same drift class:
a README badge left stale across releases because nothing checked it
automatically). Two differences from that version, both deliberate:

1. Version source is package.json's "version" field, not manifest.json.
2. The badge here is major.minor only ("version-2.3-blue.svg"), while
   package.json carries the full semver ("2.3.0") — verified against this
   repo's actual current README, not assumed. A strict string-equality
   check (like the integration's) would permanently fail here even with
   zero real drift, since the two will never be byte-identical by design.
   This script instead accepts a match when the badge version is EITHER
   exactly equal to package.json's version OR a valid major[.minor]
   prefix of it (e.g. badge "2.3" matches package.json "2.3.0" or
   "2.3.4", but not "2.4.0"). This still catches genuine drift — a badge
   stuck at "2.2" against package.json "2.4.0" fails, correctly.

Exit 0 = badge matches (exactly or as a valid prefix). Exit 1 = mismatch,
printed to stdout.
"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PACKAGE_JSON_PATH = ROOT / "package.json"
README_PATH = ROOT / "README.md"

BADGE_PATTERN = re.compile(r"!\[Version\]\(https://img\.shields\.io/badge/version-([\d.]+)-blue\.svg\)")


def main() -> int:
    with open(PACKAGE_JSON_PATH, encoding="utf-8") as f:
        package_version = json.load(f)["version"]

    readme_text = README_PATH.read_text(encoding="utf-8")
    match = BADGE_PATTERN.search(readme_text)
    if not match:
        print(f"::error::No version badge matching {BADGE_PATTERN.pattern!r} found in README.md")
        return 1
    badge_version = match.group(1)

    if badge_version == package_version or package_version.startswith(badge_version + "."):
        print(f"Version check passed: badge={badge_version} package.json={package_version}")
        return 0

    print(
        f"::error::README badge version ({badge_version}) does not match "
        f"or prefix-match package.json version ({package_version})"
    )
    return 1


if __name__ == "__main__":
    sys.exit(main())
