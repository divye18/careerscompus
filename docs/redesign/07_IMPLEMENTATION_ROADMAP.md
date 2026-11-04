# 07 — Implementation Roadmap

Status: PROPOSAL. **No implementation starts until the creative direction and storyboard are approved.**

## Guiding rules
- One milestone = one reviewable, demoable slice; each ends with lint + `tsc` + build + browser verification (visible pane / headed browser) and updated docs.
- Content honesty rules (04 §6) apply to every milestone.
- Natural scrolling, reduced-motion path and no-WebGL path are acceptance criteria from Milestone 1, not afterthoughts.

## Milestone 0 — Decisions & groundwork (≈ 2–3 days)
- Approve concept + storyboard; resolve open questions (below).
- Read the relevant guides in `node_modules/next/dist/docs/` (per `AGENTS.md`).
- Resolve the uncommitted compass edits (keep/revert/fold in).
- Add Instrument Serif; define tokens from 04; remove legacy `ch*` tokens in a separate cleanup commit.
- Build the **verification harness**: headed Playwright + screenshot-at-scroll-marks script and a GPU frame-time capture (the in-app pane is not reliable for fps).
**Exit:** tokens merged, harness runs on the current homepage, baseline fps recorded.

## Milestone 1 — Journey skeleton + Scenes 1–2 (≈ 1.5 weeks) ← **recommended first milestone**
- `JourneyProvider`, `StageShell` (CSS sticky), scene config, smoothed progress, `DirectionRail`.
- `content/` typed modules; **Linear presenter** (SSR semantic HTML) and **Journey presenter** switch via `lib/capability.ts`.
- Scene 1 Arrival: multi-needle `CompassRig` (procedural, brass/ivory materials, local lighting), headline, preserved HeroSearch/CTAs.
- Scene 2 Discover: seven meridians + domain marks, hover/focus, jump-to-domain stub.
- Reduced-motion and no-WebGL paths working.
**Acceptance:**
1. 1440/1280 desktop: scroll through Scenes 1–2 is reversible, smooth (≥ 55 fps on integrated GPU), no overlap of copy and compass.
2. WebGL disabled and reduced motion both render a complete, readable Linear version.
3. Lighthouse LCP < 2.5 s (hero text), CLS < 0.05.
4. No scroll hijack; keyboard + screen-reader parity via DOM twins.
5. lint / tsc / build pass; before/after screenshots recorded.

## Milestone 2 — Scene 3 "Explore" (≈ 2 weeks)
- Seven domain worlds: colour lerp, signature objects, ghosted type, "Paths in" / "Ways it shows up" copy (reviewed for accuracy).
- Rail integration, keyboard navigation.
- **GSAP decision gate** (03/05): keep Framer, or adopt with justification.
**Exit:** all seven domains pass AA contrast; perf budget holds.

## Milestone 3 — Scenes 4 & 5 (≈ 1.5 weeks)
Route drawing (SVG), course stops with labelled illustrative content; constellation (2D) with region clusters and sample institutions; dark-ground transition.

## Milestone 4 — Scenes 6, 7, 8 (≈ 1.5 weeks)
Compare ledger (table semantics, sample states), needle convergence payoff, guidance section reusing the preserved form/FAQ.

## Milestone 5 — Mobile presenter (≈ 2 weeks; can overlap M3–M4 for 2D scenes)
Tier detection, mobile scene variants, swipe track, bottom sheet, mini-CTA; device-lab testing.

## Milestone 6 — Hardening & polish (≈ 1–2 weeks)
Perf pass (budgets), a11y audit, cross-browser (Chrome, Safari, Firefox, Edge), content/source review, asset polish, optional pre-rendered transition clip evaluation, analytics (privacy-respecting) if desired.

## Dependencies & risks
| Risk | Mitigation |
|---|---|
| Integrated-GPU frame rate | Quality tiers, procedural low-poly, no post-processing in v1, harness from M0 |
| iOS Safari sticky/URL-bar behaviour | `svh` units, real-device testing; GSAP gate if needed |
| Content accuracy (exams, eligibility, fees) | Illustrative labelling; sourced data only; review step in M2/M3 |
| Scope creep | Each scene has a defined "done"; polish deferred to M6 |
| Font/asset licensing | Google Fonts (OFL); no third-party imagery until licensed |

## Open questions for approval
1. Approve **The Meridian Atlas** concept (many needles → one needle)?
2. Is the **expanded palette** (domain hues + Paper/Ink grounds) acceptable, with Royal Blue remaining the brand/action colour?
3. Domain list: start with the seven proposed (Technology, Medicine, Business, Design, Law, Architecture, Science)?
4. Photography: procedural-only for launch, or budget for licensed/commissioned imagery?
5. Please share the **screen recording** of ixigo if you want scrub feel/easing matched more closely.
6. Keep or revert the uncommitted compass edits (palette nodes, pointer hover, no-WebGL guard)?
