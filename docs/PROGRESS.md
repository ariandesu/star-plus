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

## Verification performed (real browser, not assumed)

| Check | Result |
|---|---|
| All 4 routes load, zero console errors | pass |
| Default view is the isolated, prominent 3D heart | pass |
| Heart is anatomically recognizable (independent visual check) | pass |
| All five systems load real models with synchronized analysis | pass |
| Structures listed per system: Heart 14, Lungs 67, Brain 283, Bones 246, Sleep 12 | pass |
| Skeleton shows the complete skeleton (skull, ribcage, spine, arms, legs) | pass |
| Group → structure select → Isolate → ISOLATED badge | pass |
| Isolation zoom coverage | 4.7% → **54.9%** after fix |
| Anonymous access to protected routes | redirected to `/` |
| Login (`astronaut01`) → dashboard + 3D heart | pass |
| Notification drawer shows real alerts | pass |
| Search filters real data | pass |
| WATCH full-explanation modal | pass |
| Zero horizontal overflow at 1440/1280/1024/768/390/375 | pass |
| `npm run verify` (anatomy + coverage + invariants + types) | 51/51 checks, 0 errors |
| `npm run build` | 0 errors, 7 static pages |
| `ocr` code review of the viewer commit | complete, 4 files, **0 findings** |

### Defects found by exercising the build (and fixed)

1. **Per-mesh materials stalled the browser.** Each structure got its own
   `MeshStandardMaterial`, so the 246-mesh skeleton meant 246 shader programs
   compiling on the main thread — the page hung. The viewer now shares exactly
   two materials and switches the active structure between them. The transparent
   base was also replaced with an opaque one, because transparency pushed every
   structure into the depth-sorted transparent pass; visibility uses
   `mesh.visible` instead.

2. **A default group hid most of the organ.** Opening a system applied its first
   structure group as a visibility filter, so Bones showed only the vertebral
   column. Groups are now an optional filter that starts cleared, and the
   structure list shows every loaded structure without requiring the user to
   guess the right group.

3. **No catch-all on the skeleton groups.** Coverage was 100% at the time, but a
   future re-export adding an unmatched bone would have made it unreachable in
   the UI. `scripts/test-catalog-and-metrics.mjs` caught this; a catch-all group
   was added.

4. **Isolation was technically correct but visually useless.** An isolated valve
   filled 4.7% of the viewport at whole-heart framing. Isolation now re-frames
   the camera and rewrites the orbit distance limits (**54.9%** measured).

## Live deployment

**Deployment is automatic.** Cloudflare Workers Builds is connected to the
GitHub repo `ariandesu/star-plus` and deploys `main` on every push. There is no
local `wrangler` token on this host, and none is needed.

Verified on 2026-09-26 against `https://star-plus.shareflow.workers.dev`:

| Check | Result |
|---|---|
| GitHub check-runs on `3f3a70bd` and `98c23e0e` | `Workers Builds: star-plus` → **success** |
| Viewer chunk `256` sha256, live vs local HEAD | **identical** (`d341a02df60d7f3e…`) |
| All seven organ GLBs, live vs local byte sizes | **identical** |
| Page chunk string literals, live vs local | 300 vs 300, symmetric difference **0** |
| Live login (`astronaut01`) → `/astronaut` + 3D canvas | pass |
| Live system sweep: Heart 14, Lungs 67, Brain 283, Bones 246, Sleep 12 | pass, zero console errors |

Chunk *filenames* differ between a local and a Workers build (Next.js emits
build-environment-specific webpack module ids), so filename comparison is not a
valid staleness test. Compare bytes — see `docs/CHECKLIST.md`.

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
