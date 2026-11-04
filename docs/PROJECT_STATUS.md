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
