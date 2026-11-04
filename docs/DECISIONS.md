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
