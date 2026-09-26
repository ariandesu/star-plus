# STAR PLUS — NASA Astronaut Health Monitoring & Telemetry Platform

## Project Summary
STAR PLUS is an advanced, role-based predictive astronaut health monitoring, biomarker anomaly detection, and mission operational readiness system designed for NASA long-duration missions (Artemis VIII).

## Core Architecture
- **Framework:** Next.js 14 (App Router, TypeScript, React 18, Tailwind CSS, Recharts, Lucide React).
- **Static Export:** Fully optimized static HTML/JS output (`npm run build`).
- **State & Service Layer:**
  - `authService.ts`: Single Sign-On role authentication, session persistence, demo card auto-fill.
  - `healthService.ts`: 24H / 7D / 30D astronaut biomarker telemetry calculation and domain health scores.
  - `analysisService.ts`: Deterministic baseline vs. current deviation analysis, medical rationale generation, and action item check-off tracking.
  - `alertService.ts`: Anomaly alert acknowledgement and crew monitoring notifications.
  - `missionService.ts`: Spacecraft environmental telemetry (CO2, Temp, Humidity, Radiation, Pressure, O2) and Mission Health Index calculation.
  - `simulationService.ts`: Interactive mission simulation toggles (Day 140 baseline → Day 147 anomaly → intervention recovery).

## Role Portals & Features
1. **Landing & Role Selector (`/`)**:
   - 1-click role logins for CDR Maya Chen (Astronaut), Dr. Evelyn Vance (Flight Medical Officer), and CAPT Thomas Miller (Mission Control).
   - Direct credential authentication with validation and demo disclaimers.
2. **Astronaut Portal (`/astronaut`)**:
   - Overall astronaut health status badge and score gauge.
   - Interactive biomarker metric cards with 24H / 7D / 30D trend line chart modals.
   - Sub-modules: Cardiovascular, Sleep & Recovery, Fitness & Musculoskeletal, Nutrition, Cognitive & Neuro.
   - Focus checklist and daily schedule items with state persistence.
3. **Flight Medical Officer Dashboard (`/medical`)**:
   - Multi-astronaut crew telemetry overview grid.
   - Domain health score breakdown (Cardiovascular, Sleep, Musculoskeletal, Cognitive, Environment).
   - Data-driven "Why was this flagged?" clinical rationale modal with biomarker deviation tables.
   - Interactive prescription/intervention checklist with timestamp and role tracking.
4. **Mission Control Dashboard (`/mission-control`)**:
   - Overall Mission Health Index score gauge (e.g. 86/100).
   - Spacecraft environmental telemetry parameters with history modals.
   - Operational crew status and duty readiness grid.
   - Clickable mission timeline event sequence.
5. **Global Shell & Components**:
   - Top navbar with role badge, global search modal (`Cmd+K`), notification drawer, and simulation toggle.
   - Fully responsive design matching NASA aerospace standards (#F7FAFF background, #EAF3FF soft blue accents, #1769E8 royal blue branding).

## Build & Verification Summary
- **Compilation:** `npm run build` executed with 0 type errors and generated 7 static routes.
- **Local Verification:** Verified runtime output served via `npx serve out -p 3333`.
- **Version Control:** Git repository initialized with `main` and `feature/star-plus-v1` branches.
