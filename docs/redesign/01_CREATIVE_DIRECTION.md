# 01 — Creative Direction

Status: **PROPOSAL — awaiting approval. No application code has been changed.**

## 1. Why we are changing direction

The current homepage is a competent stack of sections (hero, list, cards, table, form) with a 3D compass docked beside some of them. It communicates *information*, but it does not create *a journey*. A student scrolling it never feels that anything is happening to them. The redesign replaces "a page of sections" with **one continuous, scroll-driven scene** in which the world visibly transforms as the student moves from *not knowing* to *knowing their next step*.

## 2. What we studied: ixigo AU Credit Card page

Method: live page inspected in the browser (DOM, media, layout, behaviour at 1440 px and 390 px) with scroll-position sampling. **A screen recording was mentioned but did not arrive with the brief, so inter-frame motion (easing, exact scrub feel) is inferred, not observed.** Please resend it if you want that nuance matched.

Findings (observed):

| Aspect | Observation |
|---|---|
| Structure | One `100dvh` hero "stage" inside a pin-spacer ~31,500 px tall (~35 viewports). Header, benefits and FAQ are ordinary content *after* the stage. |
| Mechanism | Pinned stage (class `pin-spacer-hero-stage`, i.e. a ScrollTrigger-style pin). Three full-bleed `<video>` elements (`transition-1/2/3.mp4`), `paused`, `muted`, not looping — scroll position drives their playback. No `<canvas>`, no WebGL, no Lottie. |
| Scenes | Photographic flat-lay hero (product object centred, headline above, CTA, "Keep Scrolling" cue) → object flips/rotates → benefit scenes with giant ghosted background word, benefit copy flanking the product → "fly-through" video transitions (aeroplane window → clouds → landscape) → big-number scene ("10%") with short copy bottom-left. |
| Persistent UI | Logo top-left, primary CTA top-right at all times, a vertical **category rail** (label + dots) on the right showing which scene you are in, and a "Keep Scrolling" cue. |
| Colour | Each scene owns a colour world (warm wood-brown → amber → dusk blue). Colour changes *are* the transitions. |
| Copy | One benefit per scene, huge type, one supporting line. |
| Mobile | **A different strategy.** No pin; page is only ~4.7 viewports; forward *and reverse* videos (`transition-N-rev.mp4`), i.e. triggered playback in both scroll directions rather than scrubbing. |
| Natural scrolling | Preserved — the browser scrolls normally; the stage is pinned by layout, not by hijacking wheel events. |

### What we borrow (philosophy only)
1. **One pinned stage, many scenes.** The viewer stays in one place; the world changes around them.
2. **One idea per scene**, expressed in very large type plus one hero visual.
3. **Colour as transition.** Each scene is its own colour world.
4. **A persistent wayfinding rail and one persistent CTA.**
5. **A separately designed mobile experience**, not a squeezed desktop.
6. **Content after the stage stays plain and fast.**

### What we deliberately do *not* copy
Photographic wood-desk aesthetic, orange palette, product-card hero, video-scrub as the only mechanism, their copy, layout, assets, or code. We also do **not** rely on pre-rendered video as the core (see §6): CareersCompus has 8 concepts and 7+ domain identities that benefit from real-time, interactive visuals.

## 3. The concept: **The Meridian Atlas**

> *"Your Future Has More Than One Direction."*

The compass is the brand's best idea, but a compass on a page is decoration. We make it the **organising metaphor of the whole experience**:

- Every direction on a compass is a possible future. At the start, the needle *cannot decide* — several ghost needles point different ways at once.
- Scrolling **draws the atlas**: meridians fan out into career domains (Scenes 2–3), unfold into learning routes (4), resolve into a constellation of institutions (5), line up into a comparison ledger (6), and finally **converge into one needle pointing one heading — the student's own** (7–8).
- The emotional arc is therefore *uncertainty → possibility → structure → clarity → action*, and the visual arc is *many needles → one needle*.

This gives the homepage a narrative spine that a generic education site lacks, and it explains *why* the page transforms as it does.

### Creative pillars
1. **Cartography as craft** — editorial, instrument-like, tactile (brass, paper, glass, ink), never sci-fi.
2. **One idea per scene.**
3. **Colour worlds** — each career domain has its own hue; scene backgrounds shift between paper, ink and domain tints.
4. **Typography leads** — very large serif display type carries the story; 3D supports it.
5. **Honest** — no invented rankings, numbers, partners or outcomes. Illustrative content is labelled.
6. **Natural scrolling, always.** No scroll hijack. The page remains usable without WebGL, without JS animation, and with reduced motion.

## 4. Tone and feel
Premium, calm, confident, editorial. Think printed atlas / luxury stationery / museum wayfinding rendered with modern motion — **not** neon, gaming, glassmorphism or SaaS dashboards.

Voice: short declarative lines. "Pick a direction." "See where it leads." No hype, no guarantees.

## 5. Where 3D earns its place (and where it doesn't)

| Scene | 3D? | Rationale |
|---|---|---|
| 1 Arrival | **Yes** — hero compass with multiple needles | The signature object; must be memorable. |
| 2 Discover | **Yes (light)** — needle fan / meridian rays | Same canvas; continuity with Scene 1. |
| 3 Explore | **Yes** — one signature object per domain | Gives each domain a material identity without photography. |
| 4 Courses | **No** — SVG/DOM typographic path | Must stay readable; text-first. |
| 5 Universities | **Hybrid** — 2D constellation (SVG/canvas) with subtle depth | Exploration feel without a campus walkthrough. |
| 6 Compare | **No** — DOM ledger | Data legibility and accessibility. |
| 7 Next step | **Yes (light)** — needle convergence | Narrative payoff using the Scene 1 rig. |
| 8 Guidance | **No** — DOM form + final CTA | Conversion clarity. |

Reasonable 3D coverage: **~4 of 8 scenes**, all driven by one shared canvas and one compass rig, so it is cheap and coherent.

## 6. Why real-time + DOM rather than pre-rendered video
- ixigo's video-scrub suits one product with one story. We have many domains and interactive hover/selection; real-time objects can respond to the pointer and to progress.
- Video scrubbing needs keyframe-dense encodes and large downloads; real-time procedural geometry is KB, not MB.
- Pre-rendered video remains an **optional enhancement** for one or two cinematic transitions later, if budget allows.

## 7. Success criteria
- A first-time visitor can say what CareersCompus does within 5 seconds of landing.
- Every scene communicates exactly one idea.
- The page is fully usable and readable with WebGL off, reduced motion on, and on a mid-range phone.
- No invented claims.
