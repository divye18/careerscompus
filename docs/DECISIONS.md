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

22. **Environments = CSS backdrop + fixed-viewBox SVG art**, tokens only, memoised and prop-less; motion switched by `data-active` + CSS. Rooms stay mounted (hiding/unmounting rooms caused raster spikes and lower fps in A/B tests).
23. **No repeating CSS gradients under masks for grids/rings** — use SVG patterns/circles (measured +5–6 fps).
24. **"Explore Careers" is disabled with a "Soon" tag** rather than linking to a route that does not exist.
25. **Contrast is measured on rendered pixels**, not assumed from tokens (worst-case lightest background pixel under each text box).

26. **Scene 4 is a natural-scroll DOM/SVG section, not another pinned stage.** The pathway is state-driven (user selections), so scroll only drives the short intro (seven lines converging); all essential information is plain text and never needs scrolling-as-input. No Three.js.
27. **Pathway content model has no fields for durations, fees, cut-offs, salaries or placements;** `entrance` is `null` until sourced. Courses carry `status: 'illustrative'`; `from` means "commonly entered from", never eligibility.
28. **Connecting lines are measured from the real station dots and drawn imperatively** (no React state, redrawn on selection/resize); they leave from the end of the selected label so routes never strike through text.
29. **Mobile uses the same DOM stacked vertically** (route line down the left) and brings the next stage into view after a choice — chosen over compressing the 4-column diagram.
30. **Header re-observes the DOM** (MutationObserver) because the journey swaps presenters after hydration; otherwise the header theme is wrong over the pinned stage.

31. **Institution data is verified by script, not typed.** A claim is stored only if its evidence pattern matches the live official page (source URL + quote kept); otherwise the UI says "Information coming soon". Accuracy over volume: 17 institutions, not hundreds.
32. **No coordinates → a schematic constellation, labelled as such.** Region hubs are arranged like a compass for orientation only; institutions sit on an orbit around their hub alphabetically. Never placed on a real map.
33. **Region = state via the Zonal Councils** (North-East under East); state comes from the verified city. It is an editorial grouping for browsing, stated in the code.
34. **Filters never produce empty results:** options with no verified match are disabled and show 0.
35. **One shared rail lane (`SceneRailLane`)** across Scenes 4–5 instead of one per scene (two rails showed at the seam).

36. **Design Constitution adopted** as a permanent standard. Approved scenes are documented and classified rather than redesigned on sight.
37. **Scene 6 parked on a side branch** when the audit was requested, so the main working branch stays at the approved state.
38. **Canonical origin** defaults to the domain in `docs/routes.md` and can be overridden with `NEXT_PUBLIC_SITE_URL`. To be confirmed by the owner, along with whether a preview should be indexed.
39. **Radius tokens added without migrating components.** Migration needs approval because it touches approved scenes.
