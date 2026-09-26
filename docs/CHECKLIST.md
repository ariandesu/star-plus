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

- **Cloudflare deployment is pending operator action.** The `wrangler` token is
  not present in this environment, so the live site is one build behind. The
  exact deploy command is in the handoff below.
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

## Deploy handoff

```bash
cd /home/mahir-linux/Development/star-plus
npm run build                              # already built; out/ is current
CLOUDFLARE_API_TOKEN=<your-token> npx wrangler deploy
```

Then confirm the live chunk matches the local build:

```bash
curl -s https://star-plus.shareflow.workers.dev/astronaut/ \
  | grep -oE '/_next/static/chunks/app/astronaut/[A-Za-z0-9_.-]+\.js'
grep -oE '/_next/static/chunks/app/astronaut/[A-Za-z0-9_.-]+\.js' out/astronaut/index.html
```

The two hashes must be identical. A GitHub push does **not** trigger a deploy —
verified: the live chunk hash stayed `page-cfebe752de28b746.js` while the local
build produced `page-1f01c12b625af900.js`.
