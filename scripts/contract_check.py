#!/usr/bin/env python3
"""Contract guard v2 (Plan v3 A7): does the integration still offer what the card uses?

The card finds entities by device + translation_key (src/registry.ts) and
calls roomba_plus actions with named fields. When the integration renames
or drops a key, an action or a field, nothing errors -- a card feature
silently goes dark. This script reads both sides and fails on a gap:

  card side (from src/, by pattern):
    - every `R.id/st/ids/lookup('<domain>', '<key>')` and the diagnostics
      role table (src/diagnostics.ts DIAG_ROLES)
    - every key named in registry.ts KEY_ALIASES / SUFFIX_TO_KEY
    - every `callService('roomba_plus', '<action>', {<fields>})` and
      `resetService: '<action>'`
  integration side (from a checkout):
    - translation keys per domain from translations/en.json, plus every
      `translation_key=` in the code (keys without a translated name)
    - actions and their fields from services.yaml

Keys the card reads on purpose although the integration no longer creates
them (older installs, entities without a key) are listed with a reason in
scripts/contract_allow.json.

Usage:
    python3 scripts/contract_check.py /path/to/ha_roomba_plus [more checkouts...]

A key or action counts as present when ANY given checkout has it (the card
supports a range of integration versions); a gap is reported per checkout
with --strict.
"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "src"
ALLOW = ROOT / "scripts" / "contract_allow.json"

DOMAINS = ("sensor", "binary_sensor", "select", "switch", "button", "image",
           "vacuum", "device_tracker", "calendar", "todo", "number", "event")

LOOKUP_RE = re.compile(r"\.(?:id|st|ids|lookup)\(\s*'(\w+)'\s*,\s*'(\w+)'\s*\)")
DIAG_RE = re.compile(r"\[\s*'[^']+'\s*,\s*'(\w+)'\s*,\s*'(\w+)'\s*,\s*'(?:both|classic|prime)'\s*\]")
ALIAS_RE = re.compile(r"'((?:%s):\w+)'" % "|".join(DOMAINS))
SUFFIX_KEY_RE = re.compile(r"\[\s*/[^/]+/\s*,\s*'(\w+)'\s*(?:,\s*'(\w+)')?\s*\]")
SERVICE_RE = re.compile(r"callService\(\s*'roomba_plus'\s*,\s*'(\w+)'\s*,\s*\{([^}]*)\}", re.S)
RESET_RE = re.compile(r"resetService:\s*'(\w+)'|data-service=\"(\w+)\"")
NAMED_SVC_RE = re.compile(r"'roomba_plus\.(\w+)'")
FIELD_RE = re.compile(r"(\w+)\s*:")


def card_side() -> tuple[set[tuple[str, str]], dict[str, set[str]]]:
    keys: set[tuple[str, str]] = set()
    services: dict[str, set[str]] = {}
    for path in sorted(SRC.rglob("*.ts")):
        text = path.read_text("utf-8")
        for d, k in LOOKUP_RE.findall(text):
            keys.add((d, k))
        for d, k in DIAG_RE.findall(text):
            keys.add((d, k))
        if path.name == "registry.ts":
            block = text[text.find("KEY_ALIASES"):]
            block = block[:block.find("};") + 2]
            for dk in ALIAS_RE.findall(block):
                d, k = dk.split(":", 1)
                keys.add((d, k))
            sblock = text[text.find("SUFFIX_TO_KEY"):]
            sblock = sblock[:sblock.find("];") + 2]
            for k, d in SUFFIX_KEY_RE.findall(sblock):
                keys.add((d or "*", k))
        for action, body in SERVICE_RE.findall(text):
            fields = {f for f in FIELD_RE.findall(body) if f != "entity_id"}
            services.setdefault(action, set()).update(fields)
        for a, b in RESET_RE.findall(text):
            services.setdefault(a or b, set())
        # Action names shown to the user (maintenance links, ⚙ tab).
        for a in NAMED_SVC_RE.findall(text):
            services.setdefault(a, set())
    return keys, services


LOOP_SVC_RE = re.compile(r'for (_\w+) in \(([^)]*)\):\s*\n\s*svc = f"(\w*)\{\1\}(\w*)"')
KEY_IN_CODE_RE = re.compile(r"""translation_key\s*[=:]\s*["'](\w+)["']""")


def integration_side(checkout: Path) -> tuple[dict[str, set[str]], set[str], dict[str, set[str]], str]:
    comp = checkout / "custom_components" / "roomba_plus"
    en = json.loads((comp / "translations" / "en.json").read_text("utf-8"))
    by_domain = {d: set(v) for d, v in en.get("entity", {}).items()}
    in_code: set[str] = set()
    for py in comp.rglob("*.py"):
        in_code.update(KEY_IN_CODE_RE.findall(py.read_text("utf-8")))
    services: dict[str, set[str]] = {}
    yml = (comp / "services.yaml").read_text("utf-8")
    current = None
    in_fields = False
    for line in yml.splitlines():
        if not line.strip() or line.lstrip().startswith("#"):
            continue
        indent = len(line) - len(line.lstrip())
        m = re.match(r"^(\w+):\s*$", line)
        if indent == 0 and m:
            current, in_fields = m.group(1), False
            services[current] = set()
            continue
        if current and indent == 2:
            in_fields = line.strip() == "fields:"
            continue
        if current and in_fields and indent == 4:
            f = re.match(r"^\s{4}(\w+):", line)
            if f:
                services[current].add(f.group(1))
    # Actions registered in code (reset_*) have no services.yaml entry but
    # are described in the translations, fields included.
    for action, spec in (en.get("services") or {}).items():
        services.setdefault(action, set()).update((spec.get("fields") or {}).keys())
    # ...and some are registered in a loop without either (services.py:
    # `for _part in ("filter", ...): svc = f"reset_{_part}"`).
    code = (comp / "services.py").read_text("utf-8")
    for var, names, prefix, suffix in LOOP_SVC_RE.findall(code):
        for name in re.findall(r'"(\w+)"', names):
            services.setdefault(f"{prefix}{name}{suffix}", set())
    version = json.loads((comp / "manifest.json").read_text("utf-8")).get("version", "?")
    return by_domain, in_code, services, version


def main(argv: list[str]) -> int:
    strict = "--strict" in argv
    checkouts = [Path(a) for a in argv[1:] if not a.startswith("--")]
    if not checkouts:
        print(__doc__)
        return 2
    allow = json.loads(ALLOW.read_text("utf-8"))
    allowed_keys = {tuple(k.split(":", 1)) for k in allow.get("keys", {})}
    allowed_services = set(allow.get("services", {}))

    keys, services = card_side()
    sides = [(c, *integration_side(c)) for c in checkouts]

    def key_present(side, d: str, k: str) -> bool:
        _, by_domain, in_code, _, _ = side
        if d == "*":
            return any(k in v for v in by_domain.values()) or k in in_code
        return k in by_domain.get(d, set()) or k in in_code

    problems: list[str] = []
    for d, k in sorted(keys):
        if (d, k) in allowed_keys:
            continue
        hits = [key_present(s, d, k) for s in sides]
        if not any(hits) or (strict and not all(hits)):
            where = ", ".join(f"{s[4]}: {'yes' if h else 'NO'}" for s, h in zip(sides, hits))
            problems.append(f"entity key {d}:{k} — {where}")
    for action, fields in sorted(services.items()):
        if action in allowed_services:
            continue
        have = [s[3].get(action) for s in sides]
        if not any(h is not None for h in have) or (strict and any(h is None for h in have)):
            problems.append(f"action roomba_plus.{action} — missing")
            continue
        for f in sorted(fields):
            if not any(h is not None and f in h for h in have):
                problems.append(f"action roomba_plus.{action}: field `{f}` — missing")

    versions = ", ".join(s[4] for s in sides)
    print(f"card uses {len(keys)} entity keys and {len(services)} actions; integration {versions}")
    if problems:
        print("CONTRACT GAPS:")
        for p in problems:
            print("  -", p)
        print("Fix the card, or list the key/action in scripts/contract_allow.json with a reason.")
        return 1
    print("contract ok")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
