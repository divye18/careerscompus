# 06 — Mobile Experience

Status: PROPOSAL.

## 1. Principle: a separately designed experience
ixigo's own page confirms the approach: on a 390 px viewport it drops the 35-screen pinned stage entirely (page ≈ 4.7 screens, no pin-spacer) and uses forward/reverse **triggered** videos instead of scroll-scrubbed ones. We take the same lesson, not the same implementation: **mobile is not a shrunken desktop.**

## 2. Strategy
| Concern | Desktop | Mobile (≤ 767 px or coarse pointer) |
|---|---|---|
| Structure | One ~1000 vh pinned stage | **Short pinned moments** (≤ 3, each ≤ 150 svh) separated by ordinary flowing sections |
| Progress | Scrubbed | Scrubbed only inside the short pinned moments; elsewhere **triggered** (play once on entering the viewport, reversible) |
| 3D | Shared WebGL canvas across scenes 1–3, 7 | Hero compass only (single small canvas, dpr 1) on capable devices; everything else 2D (SVG/CSS) |
| Viewport units | `100svh` | `100svh` (stable with URL bar) + `100lvh` only for backgrounds |
| Scenes | 7 pinned + 1 flow | See §3 |
| Pointer effects | Parallax, hover | None; tap targets ≥ 44 px, tap-to-reveal tooltips |
| Typography | Display XL up to 176 px | Display scales to `clamp(44px, 12vw, 64px)`; ≥ 16 px body |

## 3. Scene adaptation
1. **Arrival** — compass in a **reserved area below the headline** (never behind text); small, slowly rotating; search + CTAs above it (current layout, proven). Static SVG compass if low-power.
2. **Discover** — vertical **fan of seven rays** drawn in SVG as the section enters (triggered, 900 ms), domain marks as a 2-column list of tappable chips.
3. **Explore** — **horizontal snap-free swipe track** (native `overflow-x: auto` + scroll-snap proximity, *not* pinned): one domain per full-width panel with its colour world, a 2D SVG/CSS object (or a pre-rendered 480 px webp loop), name, one sentence, "Paths in". Dot indicator below. No vertical scroll-jacking.
4. **Courses** — vertical **route**: a line drawing downward (stroke-dashoffset tied to the section's scroll position), stops as stacked editorial rows.
5. **Universities** — dark section with a **2D constellation** (SVG), tap a star → bottom sheet with name/type/location. Region chips filter.
6. **Compare** — stacked ledger: two columns with sticky first column; row groups collapse/expand; "Sample" labels persist.
7. **Next step** — three-step vertical list; needles converge as a small SVG animation (triggered).
8. **Guidance** — form + FAQ (current mobile-proven layout).

## 4. Capability tiers (detected once, client-side)
| Tier | Detection | Experience |
|---|---|---|
| **A** | `pointer: fine`, ≥1024 px, WebGL ok, `deviceMemory ≥ 4` or `hardwareConcurrency ≥ 6` (when available), no reduced motion | Full desktop journey |
| **B** | Capable phone/tablet, WebGL ok | Mobile presenter + hero 3D compass (dpr 1, ≤ 30 fps cap if thermal/`saveData` hints) |
| **C** | `prefers-reduced-motion`, `saveData`, WebGL unavailable/lost context, low memory | Linear presenter, static SVG visuals, no 3D |
Note: tier detection must degrade gracefully when APIs (`deviceMemory`) are missing — default to B on touch, A on capable desktop. Users get a visible "Reduce motion" toggle in the footer that sets tier C.

## 5. Performance on mobile
- Initial JS < 120 KB gz; 3D chunk loaded only on tier B/A after first interaction or idle (≥ 2 s).
- No video scrubbing; any clips are ≤ 700 KB, `playsinline muted`, lazy.
- Avoid large blurs and full-screen alpha layers (expensive on mobile GPUs).
- Touch scrolling must never be blocked: no `touchmove` preventDefault, passive listeners only.

## 6. Interaction details
- Swipe track uses native scrolling with CSS snap `proximity`; keyboard arrows supported on the track region.
- Bottom sheet for details (focus-trapped, dismissible by swipe/ESC/tap scrim).
- Sticky mini-CTA ("Get Guidance") bottom-right after Scene 2, hidden when the form is in view.
- Direction Rail on mobile becomes a **thin progress bar** at the top (no labels) plus a tappable domain index in Scene 3.

## 7. Verification
Test at 390, 430, 768; iOS Safari (URL-bar resize), Android Chrome, one low-end device; verify no horizontal scroll, 44 px targets, AA contrast, `prefers-reduced-motion`, offline/slow-3G first paint.
