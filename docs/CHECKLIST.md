# STAR PLUS — Verification Checklist

Every line below was executed against the built static export served locally and
inspected in a real Chromium browser (WebGL 2.0). Items marked *script* are
asserted by an automated check. No item is marked done on the basis of reading
code alone.

## Requirement coverage

### 3D anatomical visualization
- [x] A detailed 3D human heart is the default visual on the Astronaut dashboard
- [x] The heart is prominent (fills the viewer; not a thumbnail, not a silhouette)
- [x] No generic human silhouette, CSS shape, SVG or low-poly placeholder remains
      *(the procedural model components were deleted)*
- [x] Cardiovascular → detailed heart
- [x] Respiratory → detailed lungs
- [x] Cognitive → detailed brain
- [x] Musculoskeletal → detailed skeleton
- [x] Recovery/Sleep → endocrine/circadian structures
- [x] Models are real published reference anatomy, credited to source *script: `validate-anatomy.py`*

### Interaction
- [x] Orbit rotation (drag)
- [x] Zoom (scroll wheel + discrete zoom buttons)
- [x] Reset camera
- [x] Anatomical structure selection (click a structure in the list)
- [x] Structure isolation, with the camera re-framing the isolated structure
- [x] Hover identifies the structure by anatomical name
- [x] Smooth camera transitions between framings
- [x] Lazy loading — only the active system's model is fetched
- [x] Model loading state with real progress
- [x] WebGL fallback presents the same anatomy as a structured 2D reference
- [x] Model failure degrades to an inline message, does not crash the page
- [x] Mobile optimization: no overflow at 390 px and 375 px

### Data coherence
- [x] Selecting a system updates the 3D model, selected system, health metrics,
      analysis and signal together
- [x] Every deviation figure is derived from value vs baseline *script: reviewed in `organHealthService.ts`*
- [x] 24H / 7D / 30D produce genuinely different series
- [x] "O₂ Saturation 20.9%" corrected to a gas concentration label
- [x] Clinical oxygen metric correctly labelled SpO₂ (blood oxygen saturation)
- [x] "AI Diagnostic" wording replaced with an accurate description
- [x] WATCH signal opens a full explanation

### Navigation and function
- [x] Every visible control performs its action (search, notifications, profile
      menu, time range, organ tabs, camera controls, structure controls)
- [x] Search filters real data and opens a real input
- [x] Notification drawer lists real alerts
- [x] Logout clears the session
- [x] Protected routes redirect anonymous visitors to sign-in
- [x] Login returns the user to their role's dashboard

### Structure coverage
- [x] All 649 named structures across the 5 models map to exactly one UI group
      *script: `verify-anatomy-coverage.py`*
- [x] No duplicate node names inside a model (duplicates would break selection)
      *script: `validate-anatomy.py`*
- [x] All models declare only extensions the loader supports *script*

### Build and delivery
- [x] `tsc --noEmit` — 0 errors
- [x] `npm run build` — 0 errors, 7 static pages exported
- [x] Deploy payload reduced from 103 MB to 14 MB
- [x] Every route returns 200 locally

### Responsive and accessibility
- [x] Zero horizontal overflow at 1440, 1280, 1024, 768, 390 and 375 px
- [x] `prefers-reduced-motion` disables the pulse and the camera tweens
- [x] Tabs use `role="tab"`/`aria-selected`; range buttons use `aria-pressed`
- [x] Icon-only controls carry `aria-label` and `title`
- [x] Structure group descriptions are plain text, not colour-only signals
- [x] Status is conveyed by a text label, not by colour alone

## Not verified / out of scope

- **No manual Cloudflare deploy step exists — deployment is automatic.**
  Cloudflare Workers Builds is connected to the GitHub repo and deploys `main`
  on push. There is no local `wrangler` token on this host, and none is needed.
  See "Live deployment" below for the evidence.
- **No automated browser test suite.** Verification was performed with scripted
  browser sessions and recorded measurements, not committed as CI. The
  reproducible gates are `npm run verify` (anatomy, coverage, invariants, types)
  and `npm run build`.
- **No cross-browser matrix.** Verified in Chromium only.
- **Muscular model is built but not wired to a selector.** The brief's five
  systems map Musculoskeletal to the skeleton; `Muscular.glb` (376 muscles) is
  validated and available but has no UI entry point yet.
- **No per-structure clinical prose.** Hover/selection reports the anatomical
  name only; sourced per-structure descriptions would need an anatomical
  knowledge base.
- **Reference anatomy is not patient-specific.** It is a population model, not a
  scan of the crew member displayed.
- **Metrics are simulated.** They demonstrate the interface; they are not
  telemetry from any real person.
- **Route guarding is a demo boundary.** Enforced in the browser with demo
  credentials shipped in the bundle; it separates roles, it does not secure data.

## Live deployment

Deployment is **automatic**. Cloudflare Workers Builds is connected to
`ariandesu/star-plus` and deploys `main` on every push. No local `wrangler`
token exists on this host and none is needed — do not go looking for one.

Evidence from the GitHub check-run API, not from prose:

```
3f3a70bd  docs: record verification ...    Workers Builds: star-plus -> success
98c23e0e  fix(viewer): share materials ... Workers Builds: star-plus -> success
f6e4f720  feat(anatomy): real licensed ...  (no check run - predates the connection)
```

`f6e4f720` having no check run is what produced the earlier wrong reading that
"the live site is one build behind". It is not. The live bundle matches the
local build.

### Verifying a deploy landed

Chunk **filenames** legitimately differ between a local build and the Workers
build, because Next.js emits build-environment-specific webpack module ids. So
do not compare filenames:

```bash
curl -s https://star-plus.shareflow.workers.dev/astronaut/ \
  | grep -oE '/_next/static/chunks/app/astronaut/[A-Za-z0-9_.-]+\.js'
grep -oE '/_next/static/chunks/app/astronaut/[A-Za-z0-9_.-]+\.js' out/astronaut/index.html
# ^ these WILL differ. That is not evidence of a stale deploy.
```

Compare bytes instead:

```bash
# viewer chunk - must be byte-identical
curl -s https://star-plus.shareflow.workers.dev/_next/static/chunks/256.a4c3f20040c71713.js | sha256sum
sha256sum out/_next/static/chunks/256.a4c3f20040c71713.js

# organ assets - same size and sha256 as the local files
curl -sI https://star-plus.shareflow.workers.dev/models/organs/VH_M_Heart.glb
```

Last verified live on 2026-09-26: the viewer chunk `256` sha256
`d341a02df60d7f3e8b3ccb270c1d02ed…` is identical to the local HEAD build at
`3f3a70bd`, all seven organ GLBs are served at their exact local byte sizes, and
the live page and local page chunks share an identical set of 300 string
literals (symmetric difference 0) — same source, different build environment.
