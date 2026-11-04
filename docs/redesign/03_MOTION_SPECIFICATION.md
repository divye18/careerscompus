# 03 — Motion Specification

Status: PROPOSAL.

## 1. Principles
1. **Scroll is the clock.** Scene progression is a pure function of scroll position (scrubbed), so it is reversible and never "plays" on its own.
2. **Natural scrolling only.** No wheel/touch interception, no snap-hijack, no smooth-scroll libraries that decouple scroll from the browser.
3. **Ambient motion is slow and optional** (idle rotation, parallax) and disabled under reduced motion.
4. **Different scenes use different motion verbs** (draw, converge, dissolve, reveal, drift). No repeated fade-up-everything.
5. **Everything has a static end state** that is legible without animation.

## 2. Timing and easing tokens

| Token | Value | Use |
|---|---|---|
| `ease-atlas` | `cubic-bezier(0.22, 1, 0.36, 1)` | Entrances, mask reveals |
| `ease-settle` | `cubic-bezier(0.65, 0, 0.35, 1)` | Needle converge, colour lerps |
| `ease-linear` | linear | Pure scrubs (route draw, ghost word parallax) |
| `dur-micro` | 160 ms | Hover, focus |
| `dur-ui` | 320 ms | Tooltips, panels |
| `dur-reveal` | 900 ms (time-based reveals only) | Heading line reveals in non-pinned sections |
| `stagger-line` | 60 ms | Heading lines / list items |
| `smooth-progress` | spring `{stiffness: 120, damping: 30, mass: 0.6}` | Smoothing the raw scroll progress (≈120–180 ms lag) |

Scrubbed animations map **scroll → value** via `useTransform` on the (smoothed) master progress; time-based tweens are used only for micro-interactions and non-pinned reveals.

## 3. Master progress model
- `progress` (0–1) = scroll through the journey container (Framer Motion `useScroll({ target, offset: ['start start','end end'] })`).
- Scenes are declared in a config as `{ id, start, end }`; each scene derives `local = clamp((progress - start)/(end - start))`.
- **Overlap windows:** adjacent scenes overlap by 0.015 progress for cross-dissolves.
- A scene is **mounted** from `start - 0.05` to `end + 0.05`, and otherwise unmounted (or frozen) to save work.

## 4. Per-scene motion

| Scene | Entering | During | Exiting |
|---|---|---|---|
| 1 Arrival | Time-based: headline lines mask-reveal (900 ms, stagger 60 ms), compass fades/scales 0.94→1 (1200 ms), ghost needles drift (ambient) | Compass rises/scales 1.0→1.25; headline lines translate −40 px & fade (scrub) | Ground tint lerps paper→sky |
| 2 Discover | Needles extend (scrub, 6 % stagger), marks fade in 200 ms after | Meridian opacity 0.4→1 | Camera begins dolly |
| 3 Explore | Domain: colour lerp (`ease-settle`), object scale 0→1 + 25° rotation settle, text masks | Slow object rotation (≈6°/s, ambient), ghost word parallax ±40 px | Object scale→0.9 & fade, text masks out |
| 4 Courses | Route SVG `pathLength` 0→1 (scrub, linear) | Stops reveal at path-length thresholds; labels slide 12 px | Route fades |
| 5 Universities | Ground paper→ink (colour lerp), stars appear per region (opacity+scale 0.6→1) | 3-layer parallax (depth factors 0.2/0.5/1.0), camera scale 1→1.15 | Two nodes translate to ledger anchors |
| 6 Compare | Ledger lines draw, rows reveal (translateY 16→0 + opacity) every ~8 vh | Active row highlight bar | Ledger collapses toward compass |
| 7 Next step | Meridians converge (translate to centre, stagger reversed) | Needles slerp to a single angle (`ease-settle`) | Stage un-pins |
| 8 Guidance | Standard reveal on enter (opacity + 16 px, 600 ms `ease-atlas`) | — | — |

## 5. Sticky/pin behaviour
- Journey container `height = totalVh` (≈ 1000 vh). Inner stage: `position: sticky; top: 0; height: 100svh`.
- No JS pinning library; the pin is CSS. This avoids pin-spacer layout jank, works with browser find/anchors, and keeps scrolling native.
- Anchor links (Direction Rail) compute `scrollTo` offsets from the scene config, with `behavior: 'smooth'` unless reduced motion.

## 6. Pointer interaction
- **Hero parallax:** compass tilt ≤ 4°, damped (spring, 8 Hz), pointer-fine devices only.
- **Hover on 3D objects/marks:** scale ≤ 1.08, 160 ms; cursor pointer. Event source is `document.body` (already proven in the current build, because page layers sit above the canvas).
- **Focus:** every interactive 3D mark has a DOM twin (button/link) so keyboard and screen-reader users have equal access; focus ring uses 2 px `Royal` outline, 3 px offset.

## 7. Reduced motion (`prefers-reduced-motion: reduce`)
- Journey renders in **Linear Edition** (see 05): each scene becomes a normal stacked section with its end-state visual (static image/SVG of the object), no scrubbing, no ambient rotation, no parallax.
- Remaining motion: instant state changes or ≤150 ms opacity fades.
- Hover/focus micro-interactions retain colour changes but drop scale/translate.

## 8. Performance rules for motion
- Animate only `transform` and `opacity` in DOM; never layout properties.
- R3F: update refs in `useFrame`/MotionValue subscriptions, never React state per frame.
- Clamp frame delta (≤ 50 ms) in all lerps (a defect found in the current build: large deltas after tab stalls overshoot).
- `will-change` only on elements actively scrubbing; remove after the scene exits.
- Pause the canvas when the journey is off-screen or the tab is hidden.

## 9. Cues
- Scene 1 "Scroll" cue: a thin line that pulses (opacity 0.3↔1, 1.6 s), disappears after 3 vh of scroll.
- Direction Rail is the persistent progress indicator.
