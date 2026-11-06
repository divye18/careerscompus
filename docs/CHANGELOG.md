# Changelog

## 2026-11-06 — Evidence pipeline hardening (dataset regenerated with --write)
- `scripts/lib/evidence.mjs` + 28 unit tests and `scripts/tests/data.test.mjs`: ambiguous-match rejection, same-statement durations, recorded fetch failures, word-bounded exact excerpts, gap categories, stale-date check. `npm run test:evidence`.
- `scripts/verify-institutions.mjs` is dry-run by default (writes `data/institutions/dry-run/`); `--write` replaces the dataset. Programme seed updated (Class C patterns tightened; two Class B programmes upgraded; six declared listings).
- App reads optional `evidence`, `gaps`, `durationGap`, `durationNote` fields: listing programmes show Partially verified, missing facts show their recorded reason. No new status. Current data is unchanged, so behaviour is as before until the dry-run is approved. Details: `docs/SCENE_6_PATTERN_AUDIT.md`.

## 2026-11-06 — Scene 6 Comparison Studio (branch integrate/scene-6)
- Parked Scene 6 integrated onto `af6ac9e` (backups: tag `backup/scene-6-6471554`, branch `backup/scene-6-comparison-studio-6471554`; `wip/scene-6-comparison-studio` untouched).
- Redesigned to the constitution: masthead opening, shared `StatusLabel`, `Figures`, icons, radius tokens, un-nested columns, missing parameters listed once, decorative grid removed, Compare teaser removed.
- Tests, `site-audit.mjs` and `readiness-check.mjs` updated; `compare-shots.mjs` added. Details: `docs/WEBSITE_QUALITY_AUDIT.md` section 12.

## 2026-11-06 — Product readiness (after b419382)
- Counselling form no longer collects name or phone and cannot be submitted; "Get Guidance" buttons renamed "About guidance". Compare teaser states it is unavailable and has no hover behaviour. FAQ updated to match.
- HSTS is production-only. Verified production (`SITE_ENV=production`) and preview builds separately. New `scripts/overflow-probe.mjs` (0 px overflow at 768/390/375/360 with classic scrollbars) and `scripts/readiness-check.mjs`.
- QA screenshots: exact duplicates and superseded Explore A/B frames removed, large JPEGs re-encoded; see `docs/qa-screenshots/MANIFEST.md`.

## 2026-11-06 — Stabilisation milestone
- Interim How It Works, Principles and Final CTA hidden (`SHOW_INTERIM_SECTIONS`); nav/footer links to unfinished content removed; active nav state; footer reduced to working links.
- All endless animation made one-shot or removed; Technology sweep runs once; reduced motion honoured site-wide.
- Scene 4 and 5 openings recomposed; digits via `Figures`; no 10px text; four-state `StatusLabel`; radius tokens in live components; display-only chips as text.
- www to non-www 308, HSTS, production-only indexing; dead components and `clsx`, `tailwind-merge`, `@react-three/drei` removed.
- Details, open items and the screenshot-footprint proposal: `docs/WEBSITE_QUALITY_AUDIT.md` section 10.

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

## 2026-11-05 — Meridian Atlas M0 + M1 (branch `redesign/meridian-atlas`)
- Checkpoints: `dc15e6c` (earlier compass experiment), `e440b9d` (redesign docs).
- M0: capability tiers (`lib/capability.ts`), journey context + pure choreography, lazy WebGL world, flow presenter, real-browser QA harness (`scripts/visual-check.mjs`, dev dep `playwright-core`, no browser download), Instrument Serif via next/font, atlas tokens.
- M1 Scene 1 Arrival: brass pocket-compass (procedural dial, crown, orbit rings, 1 primary + 6 ghost needles), editorial serif headline, preserved HeroSearch + CTAs, scroll cue, Direction Rail.
- M1 Scene 2 Discover: needles open into 7 domain meridians with hues, beads, graticule; DOM marks with glyphs/labels, hover/focus/select description panel; hover emphasises the 3D meridian.
- Mobile/reduced/no-WebGL: SVG compass with the same choreography; scrubbed by section scroll (static when reduced).
- Removed: Hero, Scroll3DScene, CareerCompassSystem, ScrollJourney. CareerExploration no longer rendered.
- Fixed during QA: font var scope (moved to <html>), dial orientation, dead transition frame, ghost-needle legibility, cue/button collision at 800 px height, clipped SVG halo, mobile eyebrow wrap, scroll jank from blend/backdrop/SVG repaint.

## 2026-11-05 — Nocturne Atlas + stabilisation
- Checkpoint `befaeb6` (paused stabilisation work) before any change.
- Colour: `src/theme/tokens.ts` + `@theme` + drift check; domains night/ink hues; Ground (Midnight→Aubergine atmosphere, champagne key-light pool, grain); graticule in champagne; DomainMarks / Rail / Discover copy / ArrivalCopy / HeroSearch / Header / Footer / FlowJourney re-themed; buttons per the approved system; cyan = selection/focus only.
- Compass: matcap brass, smoked-ivory dial with deep-cyan N, blued-steel primary needle, silver ghosts, cyan tip (core + halo), cyan rim light, cyan selected bead. JetBrains Mono added.
- Transition re-timed (compass glides with the text exit; needles keep Arrival character, then extend in sequence; marks bloom as each meridian lands; aubergine eases in).
- Perf: composite-only layers, promoted glow/grain, no blend modes / backdrop blur, header without blur; PMREM removed.
- Capability: probe retry, context-loss grace window, `data-journey-reason`.
- Mobile: phone placeholder wording + icon-only search button (no truncation); 44 px targets.
- Handoff: temporary dawn band with shared `--handoff-top`.
- Docs: architecture doc renumbered to 09.

## 2026-11-05 — M2 Scene 3 Explore Careers
- Seven career environments (Technology, Medicine, Business, Design, Law, Architecture, Science) in `src/journey/explore/` — CSS backdrop + fixed-viewBox SVG art per domain, tokens only; registry for placement/typography.
- Timeline: Explore range after Scenes 1–2 (`EXPLORE_START_VH=290`, `DOMAIN_VH=46`, total 602vh); compass docks, meridians fold into a dial, marks/title fade into room 1; natural scroll only.
- Rail has 2 scene + 7 domain stops; Discover marks jump to rooms; Get Guidance in every room; "Explore Careers" is honestly disabled ("Soon") until the careers library exists.
- Mobile/reduced/no-WebGL: native swipe track (`ExploreFlow`), seven static panels, no horizontal overflow, 44px targets.
- Fixed: site-wide invisible focus ring (Tailwind v4 `outline-solid`), faded-out controls still focusable.
- Known: Explore-range scroll ~49 fps median in headed Chrome (GPU raster spikes on room change); Scenes 1–2 ~58.

## 2026-11-05 — M2.1 Scene 3 stabilisation
- Perf: Architecture/Science backdrops (stacked repeating CSS-gradient grids/rings) replaced by SVG `<pattern>`/circles (`GridLayer`); CSS A/B tests showed these two backdrops were the dominant raster cost. Explore @1440: 48.7 → 58.0 fps median.
- Contrast: new `scripts/contrast-measure.mjs` (real-pixel, Chrome) and `scripts/contrast-audit.mjs` (token maths). Fixed: separator dash, disclaimer (ivory/70, width-capped), list titles (ivory/90), "Soon" tag (ivory/80), Design dots 18%, Science rings/glow lighter. 162/162 DOM text pairs pass at 1440 and 1280.
- Layout: Technology art moved right/narrower; Architecture art 42vw with faded edges (was colliding with detail labels at 1280×800); mobile panels `scroll-mt-20`.
- QA: `scripts/explore-transitions.mjs` (all 8 boundaries fwd+back). Frames in `docs/qa-screenshots/explore/transitions/`.

## 2026-11-05 — M3 Scene 4 Courses & Learning Pathways
- New `src/journey/courses/`: `CoursesPathway` (interactive four-stage route chart: where you are → course → specialisation → career direction, plus a direction filter, breadcrumb, Back one step, Start over), `PathwayConverge` (seven domain lines converge into one champagne line with natural scroll), `usePathEdges` (measured connecting lines drawn imperatively into an SVG overlay), `pathwayState` (reducer).
- Content model `src/content/pathways.ts`: 28 illustrative courses (all `status: 'illustrative'`), specialisations, career directions, subjects. No fields for durations/fees/cut-offs/salaries/placements; `entrance` is `null` until verified data exists (UI says so).
- Replaces the legacy "Popular streams / Featured courses" block; the dawn `Handoff` now follows Scene 4. Direction rail gains a Courses stop and is shared (`RailNav`) with Scene 4.
- Mobile/fallback: same DOM stacks into a vertical route (no overlay, auto-advances to the next stage after a choice). Reduced motion: lines draw instantly, intro fully drawn.
- Fix (found in QA): the header theme never observed the pinned presenter (it was swapped in after hydration), so the header stayed light over night grounds; Header now re-scans on DOM structure change.
- QA scripts: `courses-check`, `courses-interaction-check`, `courses-transitions`, `courses-perf`, `contrast-measure-courses`.

## 2026-11-05 — M4 Scene 5 University Discovery Atlas
- New `src/journey/universities/` (`UniversityAtlas`, `AtlasIntro`, `atlasLayout`) and `src/content/institutions.ts`. A schematic regional constellation (six region hubs, institutions on an orbit around their hub), type + field filters, region focus, an information panel, reset/back. Mobile: region chips + vertical route list, filters tucked into a disclosure, panel scrolls into view.
- Data is generated, not hand-written: `data/institutions/seed.json` (candidates + evidence patterns) → `scripts/verify-institutions.mjs` fetches the live official pages and keeps only claims whose pattern matches → `src/content/institutions.data.json` (with source URL + quote per fact, `lastVerified`). 17 institutions kept; types known for 7, establishment year for 7, academic domains for 13 (where the official name states them); coordinates `null`; courses empty ("Information coming soon"). No fields exist for rankings, fees, placements, salaries, cut-offs, accreditation grades or entrance rules.
- Scene 4→5 intro: four stage lines merge and open into six region nodes (scroll-linked, reduced-motion safe). Replaced the legacy sample "University preview". One shared `SceneRailLane` now carries the direction rail across Scenes 4–5 (rail gains a Universities stop); fixed a 1px hairline seam at the Scene 4/5 boundary.
- Cross-link: an institution's field of study buttons ("Technology →") select that direction in Scene 4.
- QA scripts: `universities-check`, `universities-interaction-check`, `universities-transitions`, `universities-perf`, `contrast-measure-universities`, `verify-institutions`.

## 2026-11-05 — Design constitution and website quality audit
- New: `docs/DESIGN_CONSTITUTION.md`, `docs/WEBSITE_QUALITY_AUDIT.md`, `scripts/site-audit.mjs`, `scripts/contrast-measure-site.mjs`, `scripts/build-icons.mjs`.
- Removed a false claim ("Join thousands of students"), two dead links and invented fee, duration and eligibility figures from the interim sections; corrected the FAQ.
- Fixed the Scene 2 overflow at the offending element (4px at 390 with classic scrollbars). Mobile menu focus handling and Escape. Skip link. 44px targets for search suggestions and rail links. Interim-section contrast (93 of 93 pass).
- Added custom favicon set, branded 404, Open Graph, canonical, theme colour, robots and sitemap. Removed starter assets. Added radius tokens (not yet used by components).
- Scene 6 work parked on `wip/scene-6-comparison-studio`; not on this branch.
