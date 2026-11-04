# Changelog

## 2026-11-04 — Stabilisation
- Checkpoint commit `b542ade` of all pre-existing work.
- Removed unused/obsolete: `src/components/campus/*` (imported only by itself), `src/components/home/CinematicEnvironment.tsx` (no importers; old dark-theme background; had `any`, `Math.random` in render, setState-in-effect), `fix_careers.js`, `fix_compass.js` (broken scratch scripts). Recoverable from `b542ade`.
- Fixed all ESLint findings (unused imports/vars, unescaped apostrophe) in CareerExploration, CounsellingCTA, Hero, Header, ScrollJourney, UniversityPreview.
- Reintegrated `TrustStats` and `FAQSection` into `src/app/page.tsx` between CounsellingCTA and FinalCTA, per wireframe sections 11–12.

## 2026-11-04 — Browser audit
- Fixed invisible Final CTA text, Header Pearl-on-light text near page bottom, clipped mobile menu overlay. See `docs/QA-HOMEPAGE-AUDIT.md`.
- Added `.claude/launch.json` (dev server) and `docs/qa-screenshots/`.

## 2026-11-05 — Homepage refinement
- Hero: added preview search (`HeroSearch.tsx`, sample suggestions only, labelled as such), working "Explore Courses"/"Explore Careers" CTAs (smooth-scroll to existing sections), left-aligned desktop layout.
- Compass: now docks to `[data-compass-anchor]` elements (hero side/below, career section) instead of a fixed screen position; career nodes show only at the career anchor (`data-compass-nodes`). Clamped frame delta (fixes oversized nodes after tab/frame stalls). Removed `globalProgress` prop.
- University section rewritten: Light Royal only, terracotta removed, invented stats/accreditation removed, cards no longer link to missing pages.
- Removed unverified claims: TrustStats numbers + press names (component replaced by `PlatformPrinciples`), stream course counts, FAQ answers (rewritten to describe the real preview state), counselling service claims, How It Works claims, footer phone/address/email.
- Counselling form: validation, 44px inputs, higher-contrast placeholders/labels/button, honest "nothing was sent" confirmation.
- Navigation: header/footer links point to homepage section anchors; pages that don't exist show "Soon" instead of 404 links. Compare/Featured Course links replaced with "coming soon" labels.
- Mobile: 44px footer links, tags, search button, menu buttons. Defined missing `.hide-scrollbar`; added smooth scroll (reduced-motion safe).
