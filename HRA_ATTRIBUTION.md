# Anatomy data attribution — STAR PLUS

STAR PLUS renders real, published reference anatomy. **No organ geometry in this
project is hand-modelled, procedural, or invented.** Every mesh is derived from a
peer-reviewed open anatomical dataset, and each source is credited below with its
licence.

---

## 1. Realistic Human Organ Models (Sketchfab / User Supplied)

Used for: **Cardiovascular** (heart), **Respiratory** (lungs), **Cognitive** (brain), **Musculoskeletal** (skeleton).

- **Realistic Human Heart**: `realistic_human_heart.glb` by neshallads (CC BY 4.0).
- **Realistic Human Lungs**: `realistic_human_lungs.glb` by neshallads (CC BY 4.0).
- **Realistic Human Brain**: `realistic_human_brain.glb` by 3DRT STUDIOS (CC BY 4.0).
- **Realistic Human Skeleton**: `realistic_human_skeleton.glb` by Wunna Ko Ko (CC BY 4.0).
- **Astronaut Sleep Environment**: `sleep_astronaut.glb` — STAR PLUS Microgravity Sleep Chamber Model with alpha blend transparency.

### Structure partitioning

All four user-supplied photoreal organ assets are rendered with their authored high-resolution PBR texture maps (diffuse, normal, roughness) as fused whole-organ models (`partitioned: false`). Sub-structure hover highlights and click selection are disabled, and each model displays a gentle static left-to-right turntable rotation.

---

## 2. Allen Human Brain Atlas — Brain

Used for: **Cognitive** (brain).

- Source: Allen Institute for Brain Science, *Allen Human Brain Reference Atlas*,
  distributed through the Human Reference Atlas 3D reference library.
- File: `Allen_M_Brain.glb`
- Licence: **CC BY 4.0** — <https://creativecommons.org/licenses/by/4.0/>
- Citation: Allen Institute for Brain Science. *Allen Human Brain Atlas* (2010).
  <https://human.brain-map.org>

### Structures preserved as individually selectable

286 named structures, including the hypothalamus, pineal body, hippocampus,
amygdala, thalamic nuclei, basal ganglia, cerebellum, brainstem and the
ventricular system.

---

## 3. BodyParts3D — Skeleton, Muscular, Endocrine

Used for: **Musculoskeletal** (skeleton), the muscular reference, and
**Recovery / Sleep** (endocrine structures).

- Source: The Database Center for Life Science (DBCLS), *BodyParts3D* 4.0,
  `isa_BP3D_4.0_obj_99.zip`.
- Files: `Skeleton.glb`, `Muscular.glb`, `Endocrine.glb`
- Dataset: <https://dbarchive.biosciencedbc.jp/en/bodyparts3d/download.html>
- Licence: **CC BY 4.0** — <https://dbarchive.biosciencedbc.jp/en/bodyparts3d/lic.html>
- Publication: Mitsuhashi N. et al. *BodyParts3D: 3D structure database for
  anatomical concepts.* Nucleic Acids Research (2009).
  <https://doi.org/10.1093/nar/gkn613>

### Structures preserved as individually selectable

| Model | Parts | Covers |
|---|---|---|
| `Skeleton.glb` | 246 | Vertebral column, thoracic cage, skull and facial bones, upper and lower limbs |
| `Muscular.glb` | 376 | Named skeletal muscles |
| `Endocrine.glb` | 12 | Pineal body, pituitary gland, adrenal glands, pancreas, thymus, gonads |

---

## Adaptations applied by this project

Geometry was **not** re-authored. The following mechanical transformations were
applied, and all source structure identity is preserved in the glTF node names:

1. **Simplification** — quadric mesh simplification within a bounded per-structure
   relative error limit, to bring the models within a web-delivery budget.
2. **Compression** — `EXT_meshopt_compression` with `KHR_mesh_quantization`
   (decoded in-browser by `three`'s bundled Meshopt decoder via drei's `useGLTF`).
3. **Material replacement** — source materials are replaced at runtime with a
   single neutral clinical material for consistent lighting and reproducible
   highlight/isolation behaviour. Source colour data is not used.
4. **Centering** — models are recentred at render time from their measured
   world-space bounding box. No scaling of anatomical proportions is applied.

Measured delivery sizes after adaptation (raw → served):

| Model | Source | Served |
|---|---|---|
| Heart | 4.07 MB | **0.70 MB** |
| Lungs | 6.36 MB | **1.46 MB** |
| Brain | 12.0 MB | **3.15 MB** |
| Skeleton | 7.98 MB | **1.50 MB** |
| Muscular | 20.5 MB | **3.48 MB** |
| Endocrine | 0.46 MB | **0.09 MB** |

Only the model for the currently selected system is downloaded; models are
lazy-loaded on demand.

### Regenerating the derived BodyParts3D models

```bash
python3 scripts/build-anatomy-assets.py       # atlas manifest -> Skeleton/Muscular/Endocrine GLB
python3 scripts/verify-anatomy-coverage.py    # asserts every structure maps to a UI group
```

---

## Scope and limitations — read before interpreting anything in this UI

- These are **adult male reference anatomies**. They are population-level
  reference models assembled from imaging and anatomical literature, **not a scan
  of any individual**, and not a model of the crew member shown on screen.
- **Reference anatomy ≠ personal anatomy.** Size, shape and position vary
  substantially between individuals.
- The BodyParts3D source is a curated anatomical concept set. It does not
  represent every structure or anatomical variation in the human body.
- This interface is **educational and illustrative**. It is **not a medical
  device, not clinical decision software, and not validated for diagnosis or
  treatment**. Nothing shown here should be used to make a clinical decision.
- Health metrics displayed alongside the anatomy are **simulated demonstration
  data** for a fictional mission scenario. They are not telemetry from any real
  person.

## Historical assets removed from this release

Earlier revisions of this repository shipped the male BodyParts3D anatomy as a
~33 MB manifest plus 15 binary chunks. Those files have been replaced by the
per-organ GLB models above, which are materially smaller and load lazily. A
historical female reference-organ set (CC BY 4.0, DOI
<https://doi.org/10.48539/HBM352.BTSQ.586>) was also referenced in earlier
revisions and is not part of the current release.
