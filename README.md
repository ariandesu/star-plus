# STAR PLUS — Astronaut Health Monitoring & Decision Support System

[![Next.js 15](https://img.shields.io/badge/Next.js-15-blue.svg)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19-61dafb.svg)](https://react.dev/)
[![Cloudflare Pages](https://img.shields.io/badge/Cloudflare_Pages-Deployed-orange.svg)](https://star-plus.pages.dev)
[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](LICENSE)

> **⚠️ DEMO ENVIRONMENT DISCLAIMER:**
> *This dashboard is a synthetic demonstration system designed for space health monitoring visualization. All crew vitals, environmental telemetry, and biomarker signals are synthetically generated. This system is **not** a clinical diagnostic tool or medical device.*

---

## 🚀 Overview & NASA Space Apps Context

**STAR PLUS** (Space Telemetry & Astronaut Recovery Physiological Long-term Unobtrusive System) is an integrated health monitoring, environmental telemetry, and clinical decision-support platform engineered for long-duration human spaceflight (e.g., Lunar Gateway & Mars Transit Missions).

Human spaceflight subjects crew members to extreme physiological stressors: microgravity fluid shifts, altered sleep-wake cycles, elevated cosmic radiation, high cognitive workload, and isolation. STAR PLUS provides real-time multi-system baseline deviation tracking and deterministic decision-support recommendations to preserve crew health and operational readiness.

---

## 🔑 Demo Access & Role Credentials

The platform features role-based views tailored to specific operational domains. Select any role on the landing page or use the credentials below:

| Role | Username | Password | Purpose & Access Scope |
|---|---|---|---|
| **Astronaut** | `astronaut01` | `demo123` | Personal health portal, domain filter tabs, vitals history, and wellness self-tracking. |
| **Flight Medical Officer** | `medical01` | `demo123` | Multi-crew health triage, WATCH signal rationale ("Why was this flagged?"), clinical notes, and intervention guidance. |
| **Mission Control** | `control01` | `demo123` | Spacecraft ECLSS telemetry monitoring, cabin environmental controls, and anomaly simulation. |

---

## 🔬 Core Architectural Features

### 1. Multi-System Physiological Baseline Tracking
- **30-Day Historical Baselines:** Vitals (Heart Rate, Sleep, Stress, Exercise, Reaction Time) are continuously compared against established personal baselines.
- **72-Hour Moving Window:** Detects subtle early-onset physiological shifts before acute symptomatic presentation.

### 2. Multi-System WATCH Signal Rationale
When a multi-biomarker deviation occurs (such as CDR Maya Chen's cumulative sleep debt and elevated resting heart rate), the system generates an explicit **WATCH Signal**:
- **Sleep Duration:** `-19%` (4.8h current vs 7.5h baseline)
- **Resting Heart Rate:** `+8%` (65 bpm current vs 60 bpm baseline)
- **Exercise Performance:** `-11%` (82 pts vs 92 pts baseline)
- **Stress Index:** `+17%` (26 vs 22 baseline)
- **Reaction Time:** `+9%` (229 ms vs 210 ms baseline)

### 3. Interactive "Why was this flagged?" Diagnostic Modal
Allows Flight Medical Officers to audit:
- Raw baseline measurements vs 72-hour window values
- Percentage deviation & direction (`elevated` / `reduced`)
- Contributing operational & environmental factors (e.g., fluid shift, circadian phase delay)
- Rule-based decision-support interventions with state updates

### 4. Interactive Mission Anomaly Simulation
- Toggle ECLSS cabin anomalies (CO₂ spikes, temperature shifts, radiation level changes) from Mission Control.

---

## 🛠️ Tech Stack & Requirements

- **Framework:** Next.js 15 (App Router, Static Export target `./out`)
- **Library:** React 19, Lucide React Icons, Recharts
- **Styling:** Tailwind CSS with custom glassmorphic utilities (`bg-white/80 backdrop-blur-md`)
- **Deployment Platform:** Cloudflare Pages via `@opennextjs/cloudflare` & `wrangler.jsonc`

---

## 💻 Local Development Setup

```bash
# 1. Clone repository
git clone https://github.com/ariandesu/star-plus.git
cd star-plus

# 2. Install dependencies (Node 20+ supported)
npm install

# 3. Launch local development server
npm run dev
# Open http://localhost:3000

# 4. Build static production export
npm run build
```

---

## 🌐 Production Deployment

The project is configured for Cloudflare Pages static export using `wrangler.jsonc`:

```bash
# Production Wrangler build & deploy
npm run build
npx wrangler deploy
```

- **Live URL:** [https://star-plus.pages.dev](https://star-plus.pages.dev)
- **Alternative Worker Target:** [https://star-plus.shareflow.workers.dev/](https://star-plus.shareflow.workers.dev/)

---

## 🛡️ Code Quality & Audit

Static code quality, type safety, and security audits are performed using `open-code-review` (`ocr`):

```bash
# Run open-code-review on current workspace
ocr review --commit HEAD
```

---

## 📄 License

This project is open-source under the MIT License. Built for demonstration and educational purposes.
