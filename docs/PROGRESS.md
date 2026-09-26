# STAR PLUS — Progress Log

## Task
Integrate licensed anatomical reference-organ models into the Astronaut dashboard
as the primary visual, replacing the previous procedural/placeholder 3D shapes.

## Status: implementation complete, verified live in a real browser

---

## What was done

### 1. Anatomy source audit and selection

Inspected `github.com/ashemag/human-atlas` as the brief required, and read its
asset pipeline. Key findings that changed the approach:

| Finding | Consequence |
|---|---|
| BodyParts3D 4.0 is a 2,234-mesh adult male set shipped as a ~33 MB manifest + 15 binary chunks | Too large to load up front; needed per-organ extraction |
| The manifest's `system` field is **unreliable** — muscle meshes are tagged `skeletal` (e.g. *Right fibularis brevis*) | Selection must be by explicit name pattern, never by `system` |
| The manifest's `cardiac` system contains **brain** structures (*Third ventricle*, *Left lateral ventricle*) | A naive keyword filter pulls brain anatomy into the heart view |
| BodyParts3D has **no lung mesh at all** (its "respiratory" set is bronchial trees) | Lungs required a different source |
| BodyParts3D skeleton is 246 meshes and is genuinely good | Used for Musculoskeletal |

Because the heart and lungs had to be real, detailed and selectable, they were
sourced from the **Human Reference Atlas** (HuBMAP) instead, which publishes
named reference organs with individually addressable sub-structures.

### 2. Models acquired and adapted

| System | Source | Structures | Served size |
|---|---|---|---|
| Cardiovascular | HRA `VH_M_Heart.glb` | 18 (chambers, septum, 4 valves, 6 papillary muscles) | 0.72 MB |
| Respiratory | HRA `VH_M_Lung.glb` | 87 (lobes, 20 segments, airway, cartilage) | 1.49 MB |
| Cognitive | Allen `Allen_M_Brain.glb` | 286 (cortex, limbic, basal ganglia, thalamus, brainstem, ventricles) | 3.30 MB |
| Musculoskeletal | BodyParts3D `Skeleton.glb` | 246 (full skeleton) | 1.57 MB |
| Recovery/Sleep | BodyParts3D `Endocrine.glb` | 12 (pineal, pituitary, adrenals, pancreas, thymus) | 0.09 MB |

Adaptation = meshopt compression + `KHR_mesh_quantization` only. **No geometry was
re-authored.** Source structure names are preserved in the glTF node names.

Notable fix during the build: BodyParts3D tags laryngeal muscles and cartilages
(*Sternothyroid*, *Thyroid cartilage*, *Cricothyroid*) as `endocrine`, so the
first Endocrine export was mostly voice-box muscles. The selector now filters by
gland name and excludes muscle/cartilage explicitly.

### 3. Viewer implementation

`src/components/three/AnatomicalOrganViewer.tsx`

- Real glTF meshes rendered through a single `<primitive>`, so the graph is
  never drawn twice.
- Per-mesh materials are owned and disposed by the component; the file's own
  materials are released on adopt.
- Camera framing measured from real world-space bounding boxes, because
  quantized accessors report bounds that do not describe visible geometry.
- Orbit rotate, wheel zoom, discrete zoom buttons, camera reset, structure
  hover identification, structure selection and isolation.
- **Isolation re-frames the camera** and rewrites the orbit distance limits.
  Without this, isolating a valve left it at 4.7% viewport coverage; measured
  after the fix it is **54.9%**.
- Smooth easeOutCubic camera transitions; disabled under reduced motion.

### 4. Correctness work

- **Every structure is reachable.** Groups are evaluated first-match-wins with an
  explicit trailing catch-all, so all 649 structures across the 5 models map to a
  group. Enforced by `scripts/verify-anatomy-coverage.py` and
  `scripts/validate-anatomy.py`.
- **Deviation figures are derived, never hardcoded.** `organHealthService.ts`
  computes every percentage from the current value and the personal baseline, so
  a card and its chart cannot disagree. The previous page hardcoded `+8%` next to
  a value that actually differed by 23.3%.
- **Terminology corrected.** "O₂ SATURATION 20.9%" was a *cabin air oxygen
  concentration* labelled as a clinical saturation. Cabin gas is now
  "O₂ Concentration" and the clinical metric is
  "SpO₂ (blood oxygen saturation)". "AI Diagnostic Decision Support" — which was
  a deterministic rule engine, not AI — is now "Health Analysis".
- **Time ranges actually change the data.** 24H/7D/30D now produce 8/7/30 points
  with different labels and amplitudes; previously the range only changed a title.

### 5. Removed

- The 90 MB atlas chunk set and `atlasLoaderService` (replaced by 7 lean GLBs).
  Deploy payload: **103 MB → 14 MB**.
- `HeartModel`, `LungModel`, `BrainModel`, `SkeletalModel`, `CircadianModel`,
  `HealthVisualizationFallback`, `OrganHealthScene`, `AstronautHealthScene` —
  the procedural placeholder geometry the brief prohibited.
- `/medical` was migrated off the old pipeline onto the same real model viewer.

### 6. Verification performed (real browser, not assumed)

| Check | Result |
|---|---|
| All 4 routes load, zero console errors | pass |
| Default view is the isolated, prominent 3D heart | pass |
| Heart is anatomically recognizable (independent visual check) | pass |
| Organ switching Heart→Lungs→Brain→Bones→Sleep with real group counts | pass |
| Group → structure select → Isolate → ISOLATED badge | pass |
| Isolation zoom coverage | 4.7% → **54.9%** after fix |
| Anonymous access to protected routes | redirected to `/` |
| Login (`astronaut01`) → dashboard + 3D heart | pass |
| Notification drawer shows real alerts | pass |
| Search filters real data | pass |
| WATCH full-explanation modal | pass |
| Zero horizontal overflow at 1440/1280/1024/768/390/375 | pass |
| `tsc --noEmit` | 0 errors |
| `npm run build` | 0 errors, 7 static pages |
| `scripts/validate-anatomy.py` | all models + mappings valid |

## Honest limitations

- Metrics, missions and crew are **simulated demonstration data**, not telemetry.
- Reference anatomy is a population model, **not a scan of the person shown**.
- Route guarding is a demo access boundary enforced in the browser; the demo
  credentials ship in the bundle. It is not a security boundary.
- The musculoskeletal view shows the skeleton. The muscular model was built and
  is valid but is not currently wired to a selector entry, because the brief's
  five required systems map the skeleton to Musculoskeletal.
- Structure-level hover tooltips report the anatomical name; there is no
  per-structure clinical prose, which would require a sourced anatomical
  knowledge base.
