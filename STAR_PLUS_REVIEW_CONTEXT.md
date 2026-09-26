# STAR PLUS — Code Review Context (OCR)

This project is **STAR PLUS — Astronaut Health Monitoring System**, built for the NASA Space Apps Challenge 2026.

## Requirements Summary
1. **Roles & Authorization**: Three roles (`Astronaut`, `Flight Medical Officer`, `Mission Control`). Protected routes (`/astronaut`, `/medical`, `/mission-control`). Pre-filled demo credentials (`astronaut01`, `medical01`, `control01` / `demo123`).
2. **Visual Palette**: Minimal, clean, space-inspired light theme. Palette: Background `#F7FAFF`, Soft Blue `#EAF3FF`, Royal Blue `#1769E8`, Deep Navy `#12213F`, Green `#16B978`, Amber `#F5A623`, Red `#E94B5F`.
3. **Data Layer**: Modular TypeScript data models (`src/types/`, `src/data/`, `src/services/`). Structured 30-day synthetic history and 72-hour Maya Chen storyline (Day 147 WATCH signal).
4. **Interactivity**: No fake/dead buttons or hardcoded non-responsive elements. Range filters (24H, 7D, 30D), metric detail chart modals, checklist toggles, alert acknowledgement, intervention logging, interactive search, notifications, mission simulation engine.
5. **Responsiveness**: Fully responsive on Desktop (1440/1280px), Tablet (1024/768px), and Mobile (390/375px) without horizontal scrolling.
6. **Deployment**: Next.js static export on Cloudflare Pages.
7. **Security**: No hardcoded API keys/tokens.
