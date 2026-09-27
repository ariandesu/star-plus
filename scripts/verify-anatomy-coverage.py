#!/usr/bin/env python3
"""Verify every structure node in each organ GLB lands in exactly one catalog group.

Mirrors the group rules in src/services/anatomyCatalog.ts (first-match-wins,
with a trailing catch-all). Run from the repo root:

    python3 scripts/verify-anatomy-coverage.py
"""
import json
import os
import struct
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ORGAN_DIR = os.path.join(ROOT, "public", "models", "organs")


def glb_json(path):
    with open(path, "rb") as fh:
        data = fh.read()
    _, _, total = struct.unpack("<III", data[:12])
    off = 12
    while off < total:
        clen, ctype = struct.unpack("<II", data[off:off + 8])
        off += 8
        chunk = data[off:off + clen]
        off += clen
        if ctype == 0x4E4F534A:
            return json.loads(chunk.decode())
    raise ValueError(f"no JSON chunk in {path}")


# (group_id, match[], exclude[], is_catch_all)
GROUPS = {
    # Single fused photoreal surface — one whole-organ catch-all, no invented
    # chamber/valve groups (see src/services/anatomyCatalog.ts).
    "realistic_human_heart.glb": [
        ("whole", [], [], True),
    ],
    "realistic_human_lungs.glb": [
        ("whole", [], [], True),
    ],
    "realistic_human_brain.glb": [
        ("whole", [], [], True),
    ],
    "realistic_human_skeleton.glb": [
        ("whole", [], [], True),
    ],
    "sleep_astronaut.glb": [
        ("whole", [], [], True),
    ],
}


def main() -> int:
    ok = True
    for fname, groups in GROUPS.items():
        path = os.path.join(ORGAN_DIR, fname)
        if not os.path.exists(path):
            print(f"!! missing {fname}", file=sys.stderr)
            ok = False
            continue
        names = [n["name"] for n in glb_json(path)["nodes"] if n.get("name")]
        counts = {g[0]: [] for g in groups}
        for name in names:
            low = name.lower()
            for gid, match, exclude, catch in groups:
                if catch:
                    counts[gid].append(name)
                    break
                if any(e.lower() in low for e in exclude):
                    continue
                if any(m.lower() in low for m in match):
                    counts[gid].append(name)
                    break
        total = sum(len(v) for v in counts.values())
        status = "OK" if total == len(names) else "GAP"
        print(f"[{status}] {fname}: {len(names)} nodes -> {total} grouped")
        for gid in counts:
            if counts[gid]:
                print(f"        {gid:<11} {len(counts[gid]):4d}   e.g. {counts[gid][0]}")
        if total != len(names):
            ok = False
            grouped = {n for v in counts.values() for n in v}
            for missing in [n for n in names if n not in grouped][:10]:
                print(f"        !! ungrouped: {missing}", file=sys.stderr)
    print("\nAll structures reachable in the UI." if ok else "\nCoverage gaps found.")
    return 0 if ok else 1


if __name__ == "__main__":
    raise SystemExit(main())
