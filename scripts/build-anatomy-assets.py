#!/usr/bin/env python3
"""
Build lean, web-optimized GLB organ models from the BodyParts3D atlas manifest.

Usage: python3 scripts/build-anatomy-assets.py

Reads  public/models/atlas.json + public/models/body-*.bin
Writes public/models/organs/{Skeleton,Muscular,Endocrine}.glb

The HRA reference organs (Heart, Lung, Brain, SpinalCord) are sourced separately
from hubmapconsortium/ccf-releases v1.2 and optimized with gltf-transform.
This script covers the systems BodyParts3D is the only source for.

Binary layout per part (verified against manifest bounds):
  positions : float32 x 3 per vertex
  normals   : int16   x 3 per vertex, normalized (/32767)
  indices   : uint16  x N

The `system` field in the manifest is UNRELIABLE: muscle meshes are tagged
`skeletal` (e.g. "Right fibularis brevis" -> system=skeletal). Selection is
therefore by explicit name pattern, never by `system` alone.
"""
from __future__ import annotations

import json
import os
import re
import struct
import sys

import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODELS = os.path.join(ROOT, "public", "models")
OUT = os.path.join(MODELS, "organs")

ARRAY_BUFFER = 34962
ELEMENT_ARRAY_BUFFER = 34963
FLOAT = 5126
UNSIGNED_INT = 5125

MUSCLE_RE = re.compile(
    r"(muscle|musculi|fibularis|gastrocnemius|biceps|triceps|quadriceps|deltoid|"
    r"pectoral|latissimus|trapezius|oblique|sartorius|soleus|tibialis|hamstring|"
    r"semitendinosus|semimembranosus|adductor|masseter|temporalis|diaphragm|"
    r"intercostal|spinae|sternocleidomastoid|subscapularis|infraspinatus|"
    r"supraspinatus|\bteres\b|iliopsoas|psoas|iliacus|rectus|levator|risorius|"
    r"orbicularis|zygomaticus|mentalis|platysma|buccinator|frontalis|occipitalis|"
    r"nasalis|depressor|corrugator|procerus|auricularis|digastric|mylohyoid|"
    r"geniohyoid|stylohyoid|thyrohyoid|omohyoid|sternohyoid|sternothyroid|"
    r"scalene|longus|brevis|iliotibial|aponeurosis|tendon|fascia|retinaculum|"
    r"vocalis|arytenoid muscle)",
    re.I,
)

DENTAL_RE = re.compile(r"(tooth|teeth|gingiva|dental|incisor|molar|premolar|canine)", re.I)


def _pad(data: bytes, align: int = 4) -> bytes:
    rem = len(data) % align
    return data + b"\x00" * (align - rem) if rem else data


def build_glb(path: str, meshes: list[tuple[str, np.ndarray, np.ndarray, np.ndarray]]) -> None:
    """Write a minimal glTF 2.0 binary file with one indexed triangle mesh per entry."""
    bin_parts: list[bytes] = []
    buffer_views: list[dict] = []
    accessors: list[dict] = []
    gltf_meshes: list[dict] = []
    nodes: list[dict] = []
    offset = 0

    for name, pos, nrm, idx in meshes:
        pos = np.ascontiguousarray(pos, dtype="<f4")
        nrm = np.ascontiguousarray(nrm, dtype="<f4")
        idx = np.ascontiguousarray(idx, dtype="<u4")

        pos_bytes, nrm_bytes, idx_bytes = pos.tobytes(), nrm.tobytes(), idx.tobytes()
        views = []
        for raw, target in (
            (pos_bytes, ARRAY_BUFFER),
            (nrm_bytes, ARRAY_BUFFER),
            (idx_bytes, ELEMENT_ARRAY_BUFFER),
        ):
            padded = _pad(raw)
            buffer_views.append(
                {"buffer": 0, "byteOffset": offset, "byteLength": len(raw), "target": target}
            )
            bin_parts.append(padded)
            views.append(len(buffer_views) - 1)
            offset += len(padded)

        accessors.append(
            {
                "bufferView": views[0],
                "componentType": FLOAT,
                "count": int(pos.shape[0]),
                "type": "VEC3",
                "min": [float(v) for v in pos.min(axis=0)],
                "max": [float(v) for v in pos.max(axis=0)],
            }
        )
        accessors.append(
            {
                "bufferView": views[1],
                "componentType": FLOAT,
                "count": int(nrm.shape[0]),
                "type": "VEC3",
            }
        )
        accessors.append(
            {
                "bufferView": views[2],
                "componentType": UNSIGNED_INT,
                "count": int(idx.shape[0]),
                "type": "SCALAR",
            }
        )
        a_pos, a_nrm, a_idx = len(accessors) - 3, len(accessors) - 2, len(accessors) - 1

        gltf_meshes.append(
            {
                "name": name,
                "primitives": [
                    {"attributes": {"POSITION": a_pos, "NORMAL": a_nrm}, "indices": a_idx}
                ],
            }
        )
        nodes.append({"name": name, "mesh": len(gltf_meshes) - 1})

    bin_blob = _pad(b"".join(bin_parts))
    gltf = {
        "asset": {"version": "2.0", "generator": "star-plus/build-anatomy-assets"},
        "scene": 0,
        "scenes": [{"nodes": list(range(len(nodes)))}],
        "nodes": nodes,
        "meshes": gltf_meshes,
        "accessors": accessors,
        "bufferViews": buffer_views,
        "buffers": [{"byteLength": len(bin_blob)}],
    }

    # glTF requires the JSON chunk padded with SPACES (0x20), the BIN chunk with nulls.
    json_blob = json.dumps(gltf, separators=(",", ":")).encode()
    json_blob += b" " * ((4 - len(json_blob) % 4) % 4)

    total = 12 + 8 + len(json_blob) + 8 + len(bin_blob)
    with open(path, "wb") as fh:
        fh.write(struct.pack("<III", 0x46546C67, 2, total))
        fh.write(struct.pack("<II", len(json_blob), 0x4E4F534A))
        fh.write(json_blob)
        fh.write(struct.pack("<II", len(bin_blob), 0x004E4942))
        fh.write(bin_blob)


def main() -> int:
    os.makedirs(OUT, exist_ok=True)
    manifest = json.load(open(os.path.join(MODELS, "atlas.json")))
    parts = manifest["parts"]

    raw_cache: dict[int, bytes] = {}

    def raw(chunk: int) -> bytes:
        if chunk not in raw_cache:
            with open(os.path.join(MODELS, f"body-{chunk}.bin"), "rb") as fh:
                raw_cache[chunk] = fh.read()
        return raw_cache[chunk]

    def read_part(p: dict) -> tuple[np.ndarray, np.ndarray, np.ndarray]:
        blob = raw(p["chunk"])
        vc, ic = p["vertexCount"], p["indexCount"]
        pos = np.frombuffer(blob, dtype="<f4", count=vc * 3, offset=p["positions"]).reshape(-1, 3)
        nrm = (
            np.frombuffer(blob, dtype="<i2", count=vc * 3, offset=p["normals"])
            .reshape(-1, 3)
            .astype(np.float32)
            / 32767.0
        )
        idx = np.frombuffer(blob, dtype="<u2", count=ic, offset=p["indices"]).astype(np.uint32)
        return pos, nrm, idx

    # --- selection -----------------------------------------------------------
    skeletal = [p for p in parts if p["system"] == "skeletal" and not MUSCLE_RE.search(p["name"])]
    skeletal = [p for p in skeletal if not DENTAL_RE.search(p["name"])]
    muscular = [p for p in parts if p["system"] == "muscular" and not DENTAL_RE.search(p["name"])]
    # Glands only. The manifest tags laryngeal muscles and cartilages
    # ("Sternothyroid", "Thyroid cartilage", "Cricothyroid") as endocrine, so
    # muscle and cartilage names must be filtered out explicitly.
    GLAND_RE = re.compile(r"(pineal|pituitary|hypophysis|adrenal|suprarenal|pancrea|thyroid gland|parathyroid|thymus|gonad|ovary|testis|testicle)", re.I)
    CARTILAGE_RE = re.compile(r"(cartilage|ligament|chondro)", re.I)
    endocrine = [
        p
        for p in parts
        if p["system"] == "endocrine"
        and not MUSCLE_RE.search(p["name"])
        and not CARTILAGE_RE.search(p["name"])
    ]
    glands = [
        p
        for p in parts
        if GLAND_RE.search(p["name"])
        and not MUSCLE_RE.search(p["name"])
        and not CARTILAGE_RE.search(p["name"])
        and p["system"] not in ("arterial", "venous")
    ]

    def dedupe(seq: list[dict]) -> list[dict]:
        seen: set[str] = set()
        out = []
        for p in seq:
            key = p["name"].strip().lower()
            if key in seen:
                continue
            seen.add(key)
            out.append(p)
        return out

    targets = {
        "Skeleton": dedupe(skeletal),
        "Muscular": dedupe(muscular),
        "Endocrine": dedupe(endocrine + glands),
    }

    ok = True
    for label, seq in targets.items():
        if not seq:
            print(f"!! {label}: no parts matched", file=sys.stderr)
            ok = False
            continue

        meshes = []
        for p in seq:
            pos, nrm, idx = read_part(p)
            # Integrity: the decoded mesh must be CONTAINED WITHIN the manifest bounds.
            # The manifest bounds are pre-simplification while the chunk holds the
            # simplified mesh, so quadric simplification may shrink the hull slightly
            # but must never exceed it (that would mean a decode/offset error).
            lo = pos.min(axis=0)
            hi = pos.max(axis=0)
            exp_lo, exp_hi = np.array(p["bounds"][0]), np.array(p["bounds"][1])
            eps = 1e-3
            if np.any(lo < exp_lo - eps) or np.any(hi > exp_hi + eps):
                print(
                    f"!! {p['id']} {p['name']} escapes manifest bounds: "
                    f"decoded {lo.round(4).tolist()}..{hi.round(4).tolist()} vs "
                    f"manifest {exp_lo.round(4).tolist()}..{exp_hi.round(4).tolist()}",
                    file=sys.stderr,
                )
                ok = False
            if idx.max(initial=0) >= pos.shape[0]:
                print(f"!! bad index in {p['id']} {p['name']}", file=sys.stderr)
                ok = False
            meshes.append((f"{p['id']} {p['name']}", pos, nrm, idx))

        out_path = os.path.join(OUT, f"{label}.glb")
        build_glb(out_path, meshes)
        tris = sum(m[3].shape[0] // 3 for m in meshes)
        verts = sum(m[1].shape[0] for m in meshes)
        print(
            f"{label:11s} parts={len(meshes):4d} verts={verts:7,d} tris={tris:7,d} "
            f"raw={os.path.getsize(out_path)/1e6:.2f} MB -> {out_path}"
        )

    if not ok:
        print("integrity check failed", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
