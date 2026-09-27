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
    "VH_M_Lung.glb": [
        ("lobes", ["lobe", "lungs_l", "lungs_r", "hilum"], ["bronch"], False),
        ("segments", ["bronchopulmonary_segment"], [], False),
        ("airway", ["trachea", "bronch", "carina"], ["bronchopulmonary"], False),
        ("cartilage", ["cartilage"], [], False),
        ("other", [], [], True),
    ],
    "Allen_M_Brain.glb": [
        ("cortex", ["gyrus", "cortex", "lobule", "pole", "operculum", "planum"],
         ["cingulate", "hippocamp", "parahippocamp"], False),
        ("limbic", ["hippocamp", "amygdal", "cingulate", "fornix", "septal", "parahippocamp",
                    "olfactory", "piriform", "basal_forebrain", "stria_terminalis",
                    "central_nuclear_group", "basolateral_nucleus", "basomedial_nucleus",
                    "lateral_nucleus", "cortical_nucleus", "medial_nucleus"], [], False),
        ("deep", ["putamen", "caudate", "globus_pallidus", "accumbens", "claustrum", "subthalamic"], [], False),
        ("thalamus", ["thalamus", "geniculate", "habenular", "pulvinar"], [], False),
        ("hindbrain", ["cerebell", "pons", "medulla", "midbrain", "colliculus", "tegmentum", "vermis", "olive"], [], False),
        ("ventricles", ["ventricle", "aqueduct", "central_canal", "chiasm"], [], False),
        ("endocrine", ["pineal", "hypothalam", "pituitary"], [], False),
        ("other", [], [], True),
    ],
    "Skeleton.glb": [
        ("spine", ["vertebra", "vertebral", "intervertebral", "atlas", "axis", "sacrum", "coccyx"], [], False),
        ("thorax", ["rib", "sternum", "manubrium", "xiphoid", "costal cartilage"], [], False),
        ("skull", ["ethmoid", "frontal bone", "parietal", "temporal bone", "occipital", "sphenoid",
                   "vomer", "maxilla", "zygomatic", "nasal bone", "palatine bone", "mandible",
                   "hyoid", "cricoid", "arytenoid cartilage", "corniculate", "cuneiform cartilage",
                   "thyroid cartilage", "alar cartilage"], [], False),
        ("upper", ["humerus", "radius", "ulna", "scapula", "clavicle", "metacarpal", "scaphoid",
                   "lunate", "triquetral", "pisiform", "trapezium", "trapezoid", "capitate",
                   "hamate", "finger", "thumb"], [], False),
        ("lower", ["femur", "tibia", "fibula", "patella", "hip bone", "pelvis", "metatarsal",
                   "talus", "calcaneus", "navicular", "cuboid", "cuneiform bone", "sesamoid", "toe"], [], False),
        ("other", [], [], True),
    ],
    "Endocrine.glb": [
        ("circadian", ["pineal", "hypothalam", "pituitary"], [], False),
        ("stress", ["adrenal", "thyroid", "parathyroid"], [], False),
        ("metabolic", ["pancrea", "gonad", "thymus", "testis", "testicle", "ovary"], [], False),
        ("other", [], [], True),
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
