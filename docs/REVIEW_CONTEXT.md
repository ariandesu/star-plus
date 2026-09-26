# STAR PLUS — Review Context

Context for anyone reviewing the anatomy integration change.

## What this change is

The Astronaut dashboard previously rendered procedural approximations — a
hand-built heart from primitives, a lung from cylinders, a skeleton from boxes —
which the brief explicitly prohibited. This change replaces all of that with
real, published, licensed anatomical reference meshes and makes individual
anatomical structures selectable and isolatable.

## Read these first

| File | Why |
|---|---|
| `HRA_ATTRIBUTION.md` | Per-model source, licence, exact adaptations, and the scope/limitations statement |
| `docs/PROGRESS.md` | What was built, what was measured, what is honestly not done |
| `docs/CHECKLIST.md` | Requirement-by-requirement verification record |
| `STAR_PLUS_CURRENT_STATE_AUDIT.md` | The pre-change audit of the app, including the data defects found |

## Where the behaviour lives

```
src/services/anatomyCatalog.ts        model registry + structure→group mapping + name humanising
src/services/organHealthService.ts    every derived metric, deviation and interpretation
src/components/three/AnatomicalOrganViewer.tsx   the 3D viewer (loading, selection, isolation, camera)
src/components/RouteGuard.tsx         role-protected route gate
src/app/astronaut/page.tsx            dashboard: wires system selection to viewer + metrics + signal
scripts/build-anatomy-assets.py       BodyParts3D manifest -> Skeleton/Endocrine/Muscular GLB
scripts/validate-anatomy.py           asset + mapping validation gate
scripts/verify-anatomy-coverage.py    asserts every structure maps to a UI group
```

Assets: `public/models/organs/*.glb` (7 files, 11 MB total, lazy-loaded per system).

## Decisions a reviewer should know about

1. **Two anatomy sources, deliberately.** BodyParts3D is excellent for the
   skeleton but has no lung mesh (its respiratory set is bronchial trees) and its
   `system` field mislabels muscles as skeletal and brain ventricles as cardiac.
   Heart, lungs, brain and spinal cord therefore come from the Human Reference
   Atlas, which publishes named reference organs with addressable sub-structures.
   Both are CC BY 4.0 and both are credited.

2. **Groups are first-match-wins with an explicit `isCatchAll` flag.** A catch-all
   cannot be expressed as a substring pattern (`.` matches nothing as a literal),
   so it needs the flag. Order in the array is significant: earlier groups win.
   `scripts/verify-anatomy-coverage.py` asserts full coverage so a reordering
   mistake cannot silently hide anatomy.

3. **Isolation re-frames the camera and rewrites orbit distance limits.** This is
   not cosmetic. Measured: an isolated mitral valve covered 4.7% of the viewport
   before this, and 54.9% after. If the distance limits are not rewritten,
   OrbitControls clamps the camera straight back out and the structure disappears.

4. **Camera framing ignores accessor min/max.** All models are
   `KHR_mesh_quantization` + `EXT_meshopt_compression`; quantized accessors report
   bounds in quantized units with node scales like `0.00469`, so accessor bounds
   do not describe the visible geometry. Framing measures real world-space
   bounding boxes instead.

5. **Metrics are derived, not stored.** Every percentage on screen comes from
   `value` vs the astronaut's own `baseline` at render time. The previous page
   hardcoded `+8%` beside a value that actually deviated by 23.3%. If you add a
   metric, derive its deviation — do not type a percentage.

6. **RouteGuard is a role-separation boundary, not security.** The app is a static
   export with no server, and the demo credentials ship in the bundle. The guard
   stops an unauthenticated browser from rendering a dashboard; it does not
   protect data. This is stated in the code and in `docs/CHECKLIST.md`.

7. **Procedural components were deleted, not left unused.** `HeartModel`,
   `LungModel`, `BrainModel`, `SkeletalModel`, `CircadianModel`,
   `HealthVisualizationFallback`, `OrganHealthScene` and `AstronautHealthScene`
   are gone so the placeholder geometry cannot be reintroduced by accident.

## Known gaps (do not treat as oversights)

- `Muscular.glb` (376 muscles) is built and validated but has no selector entry:
  the brief's five systems map Musculoskeletal to the skeleton.
- No automated browser test suite is committed. Verification was scripted and
  measured during development; the reproducible gates are
  `scripts/validate-anatomy.py`, `scripts/verify-anatomy-coverage.py`,
  `tsc --noEmit` and `npm run build`.
- Verified in Chromium only; no cross-browser matrix was run.
- Structure tooltips report the anatomical name but not clinical prose, which
  would require a sourced anatomical knowledge base.

## How to reproduce the verification

```bash
cd /home/mahir-linux/Development/star-plus
python3 scripts/validate-anatomy.py           # assets, extensions, budgets, mapping
python3 scripts/verify-anatomy-coverage.py    # every structure reachable
npx tsc -p tsconfig.json --noEmit             # types
npm run build                                 # static export
python3 -m http.server 8790 --directory out   # serve, then exercise the UI
```
