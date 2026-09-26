# STAR PLUS — Current State Audit

Date: 2026-09-26
Repo: `/home/mahir-linux/Development/star-plus` (GitHub `ariandesu/star-plus`)

## 1. Stack

| Item | Value |
|---|---|
| Framework | Next.js 16 (App Router), React 19, TypeScript |
| Styling | Tailwind CSS v4 |
| 3D | three.js + @react-three/fiber + @react-three/drei |
| Charts | Recharts |
| Icons | lucide-react |
| Static export | `output: 'export'` → `out/` |
| Deploy | Cloudflare Workers/Pages (`star-plus.shareflow.workers.dev`) |

## 2. Routes

| Route | Purpose | Data source |
|---|---|---|
| `/` | Login / role entry | `authService` |
| `/astronaut` | Astronaut health dashboard (primary) | `astronautHealthDataset` + `mockData` |
| `/medical` | Flight Medical Officer view | same dataset |
| `/mission-control` | Mission Ops | same dataset |

Auth is client-side localStorage (`authService`), role-gated via `getRoleDefaultRoute`.

## 3. Services (existing)

- `authService.ts` — session, role default route, login/logout
- `healthService.ts` — derived health metrics from dataset
- `analysisService.ts` — explainability lines + findings
- `alertService.ts` — alert items + signal level
- `store.ts` — cross-page selection state (selected astronaut / time horizon)
- `dataAdapterService.ts` — CSV → typed records
- `testRunnerService.ts` — QA scenario runner
- `atlasLoaderService.ts` — BodyParts3D chunked binary loader (written in prior session)

## 4. Data assets on disk

### 4.1 BodyParts3D atlas (`public/models/`) — verified real

- `atlas.json` — manifest, **2,234 anatomical parts**
- `body-0.bin` … `body-14.bin` + `.gz` — **15 chunks, ~60 MB raw / ~33 MB gz**
- Part record: `{id, name, conceptId, system, chunk, positions, normals, indices, vertexCount, indexCount, bounds}`
- Triangle count across dataset: **2,290,000+**
- Systems present: arterial 639, venous 404, muscular 402, skeletal 296, nervous 139,
  respiratory 119, digestive 97, sensory 45, connective 40, cardiac 23,
  reproductive 12, urinary 6, integumentary 5, endocrine 4, lymphatic 3

**Attribution:** BodyParts3D, © The Database Center for Life Science (DBCLS), CC BY 4.0 — derivative of the Life Science Integrated Database Project.

### 4.2 Defects found in the BodyParts3D manifest

| # | Defect | Impact |
|---|---|---|
| D1 | `cardiac` system contains **brain** structures: `Third ventricle`, `Left lateral ventricle`, `Right lateral ventricle` | A keyword filter on `ventricle` pulls **brain anatomy into the heart view** |
| D2 | **No `lung` mesh exists** anywhere in BodyParts3D 4.0 — `respiratory` is trachea + 118 bronchopulmonary segments | The Respiratory view cannot show detailed lungs from this source |
| D3 | `skeletal` (296 parts) is dominated by teeth/gingiva records; bone meshes are present but must be selected by explicit id, not by `system` alone | Naive `system==='skeletal'` renders a mouth, not a skeleton |

**Conclusion:** BodyParts3D alone cannot satisfy the brief (no lungs, hearts only 23 parts with
co-mingled brain ventricles). A second, higher-fidelity source is required for organ detail.

## 5. New anatomy source — HuBMAP Human Reference Atlas (HRA)

Verified live and downloaded. `hubmapconsortium/ccf-releases@main/v1.2`, served via jsDelivr.

| Model | Raw | Optimized (meshopt) | gz | Nodes | Triangles | Named structures |
|---|---|---|---|---|---|---|
| `VH_M_Heart.glb` | 4.07 MB | **716 KB** | 495 KB | 18 | 164,119 | mitral / tricuspid / aortic / pulmonary valves, papillary muscles |
| `VH_M_Lung.glb` | 6.36 MB | **1.49 MB** | 1.05 MB | 87 | 288,463 | `VH_M_lungs_L`/`_R`, lobes, lingula, bronchopulmonary segments |
| `Allen_M_Brain.glb` | 11.98 MB | **3.30 MB** | 2.33 MB | 286 | 607,054 | hypothalamus, pineal body, thalamic nuclei, cerebellar vermis |
| `VH_M_Spinal_Cord.glb` | 490 KB | **144 KB** | 73 KB | 31 | 16,358 | C1–C8 / T / L cord segments |

**License:** CC BY 4.0 — HuBMAP Human Reference Atlas (HuBMAP Consortium / Indiana University).
Underlying Allen brain parcellation: Allen Institute for Brain Science.

Optimization used `@gltf-transform/cli` → `simplify` (brain, ratio 0.45) then `meshopt --level high`.
`EXT_meshopt_compression` + `KHR_mesh_quantization`; decoder present in
`node_modules/three/examples/jsm/libs/meshopt_decoder.module.js`.

### 5.1 Models requested but NOT available (404, must not be fabricated)

`VH_M_Skeleton`, `VH_F_Skeleton`, `VH_M_Body`, `VH_M_Stomach`, `VH_M_Colon` → 404.
Therefore **Musculoskeletal uses the BodyParts3D skeletal + muscular meshes** (D3 applies).

## 6. Final source-of-truth mapping

| System view | Primary mesh source | Reason |
|---|---|---|
| Cardiovascular | HRA `Heart.glb` | Detailed valves/atria/ventricles, 164k tris |
| Respiratory | HRA `Lung.glb` | Only source with real lungs + segments |
| Cognitive | HRA `brain.glb` | Cortical + deep structures |
| Musculoskeletal | BodyParts3D skeletal + muscular | HRA skeleton is 404 |
| Recovery / Sleep | HRA `brain.glb` (hypothalamus + pineal body) + BodyParts3D endocrine | Real circadian structures |

## 7. Terminology defects (brief §terminology)

| Location | Current (wrong) | Required |
|---|---|---|
| Astronaut dashboard metric | `O₂ Saturation: ... 20.9 %` | Ambient O₂ **concentration** (20.9 %) is a *habitat air* value; blood oxygenation is **SpO₂** (~95–100 %). Conflated. |
| Analysis panel title | `AI Diagnostics` | Rephrase to non-diagnostic decision-support wording |

## 8. Interaction defects

| # | Defect |
|---|---|
| I1 | `24H / 7D / 30D` toggles re-render the same series — no data change |
| I2 | Alert `WATCH` signal is a static badge — not interactive, no explanation |
| I3 | `Sep 26, 2026` date pill is static text, not a control |
| I4 | No per-organ loading state, no WebGL fallback, no model-failure path |
| I5 | Prior heart view mixed brain ventricles into cardiac (see D1) |

## 9. Verification baseline

- `npm run build` → exit 0, all routes static-exported.
- Live `https://star-plus.shareflow.workers.dev/astronaut/` → HTTP 200.
