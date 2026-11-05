# Project Status (2026-11-04)

## Verified
- `npm run lint`: 0 errors, 0 warnings.
- `npx tsc --noEmit`: clean.
- `npm run build`: succeeds; routes `/` and `/_not-found` (static).

## Not verified
- Visual/responsive appearance, 3D performance, and scroll behaviour were **not** checked in a browser during the cleanup.
- Reintegrated TrustStats/FAQSection have not been visually reviewed in context.

## Exists
Homepage only (Hero, CareerExploration, PopularStreams, FeaturedCourses, UniversityPreview, CompareTeaser, HowItWorks, CounsellingCTA, TrustStats, FAQSection, FinalCTA) with a persistent R3F `Scroll3DScene`.

## Does not exist yet
Other routes, database, auth, API, search, forms backend, tests.

## Notes
- `docs/handover/` was referenced in the cleanup brief but does not exist in the repo. `docs/AUDIT-REPORT.md` is a blueprint-consistency audit, not a code audit; code issues were verified directly via lint/tsc/build.
- Branch is `master`; there is no `main`.

## Update 2026-11-05
- Verified in browser at 1440, 1280 and 390 px: hero search, compass docking, university section, counselling form (validation + confirmation), footer, mobile menu. Screenshots: `docs/qa-screenshots/before|after`.
- lint / tsc / build pass.
- Still not verified: frame rate (browser pane throttles when hidden), Safari/Firefox, real touch devices. Search, forms and all data are preview/sample only (no backend).

## Update 2026-11-05 — Meridian Atlas Milestones 0–1 (branch `redesign/meridian-atlas`)
Implemented Scenes 1 (Arrival) and 2 (Discover) with desktop pinned/WebGL and flow (mobile / reduced-motion / no-WebGL) presenters. Remaining homepage sections are the previous content, rendered below as interim.

Measured in headed Chrome (Windows, Intel UHD integrated GPU), production build:
| Metric | Result |
|---|---|
| LCP desktop 1440/1280 (pinned) | 1.48–2.24 s across runs (one outlier 2.6 s in a run that fell back to flow; cause not captured) |
| LCP flow paths (390, reduced, no-WebGL) | 0.97–1.50 s |
| CLS | 0 – 0.0001 |
| Idle frame rate at hero (1440, 1280) | 56.6–60.4 fps |
| Continuous 6 s scripted scroll through the stage | avg 47.9–56.9 fps (typical ≈ 52–54), p50 16.7 ms, p95 17–50 ms, 5–23 frames > 33 ms — **slightly below the 55 fps target** |
| Before the compositing fixes | avg ≈ 42 fps, p95 50 ms |
| Console errors / horizontal overflow | none |
Perf A/B (CSS injection): hiding the WebGL canvas did **not** improve scroll fps; removing the mix-blend grain and per-frame SVG re-rasterisation did — so remaining cost is DOM compositing, not 3D.

Not verified: Safari/Firefox, real phones (mobile verified by Chrome emulation at 390×844, DPR 3), video recording (ffmpeg not installed).

## Update 2026-11-05 — Nocturne Atlas + stabilisation (branch `redesign/meridian-atlas`)
Implemented: Nocturne Atlas colour identity for Scenes 1–2 (pinned + flow), header (night/day theme), footer, buttons, search; compass in brass / smoked ivory / blued steel with a cyan tip; temporary dawn handoff; JetBrains Mono labels.

**Performance, same machine / browser / method** (real Chrome, Intel UHD, production build, 6 s scripted scroll, 5 repeats, medians):
| | M1 baseline (`df41d95`) | Now |
|---|---|---|
| 1440 avg fps (min–max) | 51.7 (49.2–53.4) | **59.4 (57.5–59.9)** |
| 1280 avg fps (min–max) | 54.9 (52.5–58.7) | **59.9 (59.4–60.1)** |
| p95 frame time | 33.4 / 33.3 ms | **17.0 / 17.0 ms** |
| Frames > 33 ms (median) | 18 / 12 | **1 / 0** |
| Paint events / raster tasks (trace, 1440) | 278 / 1083 | **129 / 83** |
| GPU task time (trace, 1440) | 2653 ms | **785 ms** |
| React commits during the scroll | 2 | 2 (none per frame) |
| Idle fps at hero | 59.9–60.2 | 60.2–60.3 |

Load: the compass canvas mounts at ≈1.6–1.9 s (unchanged); fully faded in at ≈3.0–3.2 s vs ≈4.7–5.5 s before (PMREM environment removed); the main-thread long task at 3D start is ≈1.0 s vs 2.7–3.4 s. LCP 0.7–1.5 s, CLS 0–0.0001 on desktop, mobile, reduced-motion and no-WebGL.

Capability: 60 consecutive real-Chrome loads → 60/60 pinned. The original unexplained fallback was **not reproduced**; two fragile paths were fixed (a failed WebGL probe was cached forever; any context loss fell back immediately) and verified with `scripts/context-loss-test.mjs` (recoverable loss stays 3D and redraws; permanent loss falls back after ~3 s with reason `webgl-lost`). One earlier "fallback" run coincided with a stale server returning 500.

Contrast: all 29 text/graphic pairs used pass (4.5 text / 3.0 graphics) — `docs/qa-screenshots/nocturne/contrast-audit.txt`.

Not verified: Safari/Firefox, real phones (390 px is Chrome emulation), screen-reader pass. The interim sections below the handoff are still Light Royal (gradient stream cards etc.) and visually clash until Scenes 3–8 replace them. Recorded videos show motion, but their frame rate is capture-limited and is not a performance figure.
