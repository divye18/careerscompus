# Changelog

## 2026-11-04 — Stabilisation
- Checkpoint commit `b542ade` of all pre-existing work.
- Removed unused/obsolete: `src/components/campus/*` (imported only by itself), `src/components/home/CinematicEnvironment.tsx` (no importers; old dark-theme background; had `any`, `Math.random` in render, setState-in-effect), `fix_careers.js`, `fix_compass.js` (broken scratch scripts). Recoverable from `b542ade`.
- Fixed all ESLint findings (unused imports/vars, unescaped apostrophe) in CareerExploration, CounsellingCTA, Hero, Header, ScrollJourney, UniversityPreview.
- Reintegrated `TrustStats` and `FAQSection` into `src/app/page.tsx` between CounsellingCTA and FinalCTA, per wireframe sections 11–12.
