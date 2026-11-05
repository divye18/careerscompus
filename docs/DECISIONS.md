# Decisions

1. **Checkpoint on `master`.** Everything was uncommitted; committed as-is before cleanup so nothing is lost.
2. **Delete CinematicEnvironment rather than fix it.** Unreferenced, belongs to the superseded dark direction; `Scroll3DScene` is the live 3D layer. Fixing would have meant maintaining dead code.
3. **Delete campus experiment and fix_*.js scripts** after confirming no imports/references.
4. **TrustStats/FAQ reintegrated** because the wireframe (sections 11, 12) and roadmap (items 51–52) include them; placed in wireframe order.
5. **`JourneySection` keeps its `mode` prop** in the interface (callers pass it) but it is currently unused; revisit when the journey is implemented.

6. **Compass docks to DOM anchors** (`data-compass-anchor`) rather than hard-coded world positions, so it is never behind copy at any width and scrolls away with the page. Anchors are sized/placed in the section layout.
7. **No fabricated trust signals.** Stats, press names, rankings, admission/placement figures, accreditation, and contact details were removed. Sample content stays only where labelled as sample.
8. **Dead routes are not linked.** Nav/footer use homepage anchors; missing pages show "Soon". Real routes should replace these when built.
9. **TrustStats replaced by PlatformPrinciples** (statements of intent only).

10. **Replace the scroll architecture** (ScrollJourney / page-wide canvas) with a self-contained pinned stage; progress is local to the journey.
11. **No GSAP for M1.** CSS sticky + Framer Motion MotionValues suffice; revisit at M2 with written justification.
12. **Single choreography module** of pure functions shared by WebGL, SVG and DOM layers.
13. **Two presenters, server renders flow.** Identical Scene 1 copy avoids layout shift on hydration.
14. **playwright-core as dev dependency** (drives installed Chrome; no browser download) to get valid visible-browser measurements.
15. **No video recording yet**: would require downloading Playwright's ffmpeg binary; awaiting approval. Frame sequences used instead.

16. **Nocturne Atlas adopted** (Midnight / Aubergine / Cyan; champagne brass; alternating night and ivory). Cyan is a signal, not a fill; domain hues identify, cyan selects. Royal Blue retired as the action colour.
17. **Metals as matcaps, no IBL.** The PMREM environment blocked the main thread ~3 s; matcaps look right and compile almost instantly.
18. **One token source** (`tokens.ts`) mirrored to CSS with an automated drift / stray-hex check; hex is only allowed in tokens.
19. **Phones get a shorter placeholder wording**, not truncated text; the search button is icon-only below `sm`.
20. **Don't fall back on a recoverable WebGL loss;** wait 3 s for restoration.
21. **Legacy Light Royal sections stay as they are** until their scenes are rebuilt (scope).
