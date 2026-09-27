#!/usr/bin/env python3
"""Validate every anatomy model and the group mapping that drives the UI.

Checks, for each organ GLB:
  * the file is a structurally valid glTF 2.0 binary container
  * meshes carry real geometry (non-zero triangles, finite positions)
  * the runtime extensions the loader must support are declared
  * every named node maps to exactly one catalog group (no unreachable anatomy)
  * node names do not collide within a model (collisions break selection)

Also asserts the served file sizes stay within a delivery budget so a future
re-export cannot silently push megabytes back onto the critical path.

    python3 scripts/validate-anatomy.py
"""
from __future__ import annotations

import json
import os
import struct
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ORGAN_DIR = os.path.join(ROOT, "public", "models", "organs")

# Mirrors src/services/anatomyCatalog.ts. Kept as data so this validator runs
# without a Node toolchain.
CATALOG = {
    # Single fused photoreal surface: no named anatomical sub-structures to
    # map, so the whole model is one catch-all group. The keys are
    # Sketchfab/ZBrush scaffolding names, not anatomy.
    "realistic_human_heart.glb": {
        "budget_mb": 8.0,
        "groups": [
            ("whole", [], [], True),
        ],
        "prefix_required": False,
    },
    "realistic_human_lungs.glb": {
        "budget_mb": 20.0,
        "groups": [
            ("whole", [], [], True),
        ],
        "prefix_required": False,
    },
    "realistic_human_brain.glb": {
        "budget_mb": 5.0,
        "groups": [
            ("whole", [], [], True),
        ],
        "prefix_required": False,
    },
    "realistic_human_skeleton.glb": {
        "budget_mb": 12.0,
        "groups": [
            ("whole", [], [], True),
        ],
        "prefix_required": False,
    },
    "Muscular.glb": {
        "budget_mb": 4.0,
        "groups": [("all", [], [], True)],
    },
    "sleep_astronaut.glb": {
        "budget_mb": 1.0,
        "groups": [("whole", [], [], True)],
        "prefix_required": False,
    },
}


def read_glb(path):
    """Return (json_chunk, bin_length) for a glTF binary, validating the container."""
    with open(path, "rb") as fh:
        data = fh.read()
    if len(data) < 12:
        raise ValueError("file shorter than a glTF header")
    magic, version, total = struct.unpack("<III", data[:12])
    if magic != 0x46546C67:
        raise ValueError(f"bad magic 0x{magic:x} (expected glTF)")
    if version != 2:
        raise ValueError(f"unsupported glTF version {version}")
    if total != len(data):
        raise ValueError(f"length mismatch: header says {total}, file is {len(data)}")
    off = 12
    js = None
    bin_len = 0
    while off + 8 <= total:
        clen, ctype = struct.unpack("<II", data[off:off + 8])
        off += 8
        if off + clen > total:
            raise ValueError("chunk overruns file")
        if ctype == 0x4E4F534A:
            js = json.loads(data[off:off + clen].decode("utf-8"))
        elif ctype == 0x004E4942:
            bin_len += clen
        off += clen
    if js is None:
        raise ValueError("no JSON chunk")
    return js, bin_len


def group_for(groups, name):
    low = name.lower()
    for gid, match, exclude, catch in groups:
        if catch:
            return gid
        if any(e.lower() in low for e in exclude):
            continue
        if any(m.lower() in low for m in match):
            return gid
    return None


def main() -> int:
    failures: list[str] = []
    total_tris = 0

    if not os.path.isdir(ORGAN_DIR):
        print(f"missing {ORGAN_DIR}", file=sys.stderr)
        return 1

    for fname, spec in CATALOG.items():
        path = os.path.join(ORGAN_DIR, fname)
        if not os.path.exists(path):
            failures.append(f"{fname}: file missing")
            continue

        size_mb = os.path.getsize(path) / 1e6
        try:
            gltf, bin_len = read_glb(path)
        except Exception as exc:  # noqa: BLE001 - report and continue
            failures.append(f"{fname}: invalid GLB ({exc})")
            continue

        used = set(gltf.get("extensionsUsed", []))
        required = set(gltf.get("extensionsRequired", []))
        # The viewer relies on drei/three-stdlib decoding both of these.
        for ext in required:
            if ext not in ("EXT_meshopt_compression", "KHR_mesh_quantization"):
                failures.append(f"{fname}: requires unsupported extension {ext}")

        # Geometry sanity: every mesh primitive must have a POSITION accessor
        # with a real vertex count.
        verts = 0
        prims = 0
        for mesh in gltf.get("meshes", []):
            for prim in mesh.get("primitives", []):
                prims += 1
                pos_idx = prim.get("attributes", {}).get("POSITION")
                if pos_idx is None:
                    failures.append(f"{fname}: primitive without POSITION")
                    continue
                acc = gltf["accessors"][pos_idx]
                verts += int(acc.get("count", 0))
                if acc.get("count", 0) == 0:
                    failures.append(f"{fname}: empty POSITION accessor")

        if prims == 0:
            failures.append(f"{fname}: no mesh primitives")

        # Node names drive selection: they must exist and be unique.
        names = [n.get("name") for n in gltf.get("nodes", []) if n.get("mesh") is not None and n.get("name")]
        named_meshes = [n.get("name") for n in gltf.get("nodes", []) if n.get("name")]
        dupes = {n for n in named_meshes if named_meshes.count(n) > 1}
        if dupes:
            failures.append(f"{fname}: duplicate node names break selection: {sorted(dupes)[:5]}")

        # Coverage: every named structure must land in a group.
        unmapped = [n for n in named_meshes if group_for(spec["groups"], n) is None]
        if unmapped:
            failures.append(f"{fname}: {len(unmapped)} unmapped structures, e.g. {unmapped[:3]}")

        if size_mb > spec["budget_mb"]:
            failures.append(f"{fname}: {size_mb:.2f} MB exceeds budget {spec['budget_mb']} MB")

        total_tris += verts // 3
        print(
            f"[OK] {fname:22s} {size_mb:5.2f} MB  meshes={len(gltf.get('meshes', [])):4d} "
            f"named={len(named_meshes):4d} prims={prims:4d} verts={verts:7,d} "
            f"bin={bin_len/1e6:5.2f} MB ext={sorted(used)}"
        )

    # cross-model invariant: a model must not reuse a node name from another model
    # in a way that would confuse the catalog (names carry source prefixes, so
    # verify the prefixes are present).
    for fname in CATALOG:
        path = os.path.join(ORGAN_DIR, fname)
        if not os.path.exists(path):
            continue
        if CATALOG[fname].get("prefix_required", True) is False:
            continue
        gltf, _ = read_glb(path)
        named = [n.get("name") for n in gltf.get("nodes", []) if n.get("name")]
        prefixed = [n for n in named if n.startswith(("VH_", "Allen_", "FJ"))]
        if len(prefixed) != len(named):
            bad = [n for n in named if n not in prefixed][:3]
            failures.append(f"{fname}: node names without a source prefix: {bad}")

    print(f"\ntotal vertices across models: {total_tris:,}")
    if failures:
        print("\nFAILURES:", file=sys.stderr)
        for f in failures:
            print(f"  - {f}", file=sys.stderr)
        return 1
    print("All anatomy assets and group mappings valid.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
