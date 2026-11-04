# Decisions

1. **Checkpoint on `master`.** Everything was uncommitted; committed as-is before cleanup so nothing is lost.
2. **Delete CinematicEnvironment rather than fix it.** Unreferenced, belongs to the superseded dark direction; `Scroll3DScene` is the live 3D layer. Fixing would have meant maintaining dead code.
3. **Delete campus experiment and fix_*.js scripts** after confirming no imports/references.
4. **TrustStats/FAQ reintegrated** because the wireframe (sections 11, 12) and roadmap (items 51–52) include them; placed in wireframe order.
5. **`JourneySection` keeps its `mode` prop** in the interface (callers pass it) but it is currently unused; revisit when the journey is implemented.
