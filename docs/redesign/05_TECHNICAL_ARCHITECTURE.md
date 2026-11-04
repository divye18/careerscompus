# 05 — Technical Architecture

Status: PROPOSAL. Based on inspection of the actual project (verified in `package.json`/`node_modules`).

## 1. Current stack (verified)
Next.js **16.3.8** (App Router, Turbopack), React **19.2.8** (React Compiler lint rules active), TypeScript 5, Tailwind **v4**, framer-motion **14**, three **0.186**, @react-three/fiber **9.8**, @react-three/drei **10.7**, lucide-react, clsx, tailwind-merge. `AGENTS.md` warns this Next has breaking changes: **before writing code, read the relevant guides in `node_modules/next/dist/docs/`** (Milestone 0 task).

## 2. Audit of the existing project

### Preserve (reuse as-is or with small changes)
| Item | Why |
|---|---|
| `HeroSearch.tsx` | Accessible combobox, honest sample data labelling; re-skin only |
| `CounsellingCTA.tsx` form logic | Validation, 44 px inputs, honest "nothing sent" confirmation |
| `FAQSection.tsx` content | Rewritten to be truthful |
| `PlatformPrinciples.tsx` copy | Honest value messaging |
| `UniversityPreview` sample data | Basic verified facts only (name/location/type) |
| `Footer`/`Header` honesty fixes | Section anchors, "Soon" markers, no invented contact details |
| `ui/Button, Input, Badge`, `lib/utils.ts` | Generic primitives |
| Compass **mechanics**: DOM-anchor docking, frame-delta clamp, WebGL detection (`useSyncExternalStore`), `eventSource=document.body` pointer routing, hover↔list sync event | Each solved a real bug found in QA |
| Docs: QA audit, decisions, changelog | Process history |

### Redesign
Hero (composition + compass → multi-needle atlas instrument), CareerExploration (→ Scenes 2–3), FeaturedCourses (the "Knowledge Archive" active-category idea survives inside Scene 4), CompareTeaser (→ live ledger, Scene 6), HowItWorks (→ Scene 7 steps), FinalCTA (→ Scene 8 close), Header (adds Direction Rail, persistent CTA), `globals.css` tokens.

### Replace / remove
- `ScrollJourney.tsx` (progress-over-whole-page "acts" model, now unused for visuals; replaced by `JourneyStage`).
- `PopularStreams.tsx` (generic gradient cards; domains are expressed in Scene 3).
- Page-wide fixed canvas under all content (pointer-event conflicts, overlap risk) → canvas lives **inside the sticky stage**.
- Legacy colour tokens `ch1…ch8` and aliases in `globals.css` → replaced by the system in 04.
- `Environment preset="city"` (remote HDR) → local lighting.

### Existing animations reusable
Hero search/dropdown micro-interactions, FAQ accordion, form feedback, `useReducedMotion`-aware compass snapping, `whileInView` reveals for the non-pinned sections (Scene 8, footer).

### Technical limitations / risks found
1. Fixed full-page canvas + overlapping section wrappers blocked pointer events (worked around with `eventSource`).
2. Large `delta` after hidden-tab/frames made lerps overshoot (fixed by clamping; must be a standard rule).
3. Frame rate could not be measured reliably in the in-app browser when its pane is hidden — **a perf harness must run in a real, visible browser (e.g. Playwright headed + Chrome tracing)**.
4. Remote HDR dependency; `drei <Html>` label for hovered nodes did not render in a quick test (unresolved; prefer DOM overlays driven by projected coordinates over `<Html>`).
5. Uncommitted app edits exist from the last 3D step (palette nodes, pointer hover, no-WebGL fallback); they are **not** part of this proposal and can be kept, reverted or folded in at approval time.

## 3. Architecture overview

```
app/page.tsx (server)  ─ composes ─►  <Journey scenes={SCENES} content={CONTENT}/>  (client island)
                                      │
                    ┌─────────────────┴──────────────────┐
                    │ JourneyProvider (progress, scene)  │
                    ├────────────────────────────────────┤
 Journey presenter  │ StageShell (sticky 100svh)         │   Linear presenter
  (capable device)  │  ├─ <SceneLayer/> DOM text/UI      │   (reduced motion / no WebGL /
                    │  ├─ <WorldCanvas/> (R3F, lazy)     │    low-power / print / no-JS)
                    │  └─ <DirectionRail/>               │   stacked sections, static visuals
                    └────────────────────────────────────┘
```

### 3.1 Content as data, two presenters
All scene copy, domains and illustrative data live in typed modules (`content/scenes.ts`, `content/domains.ts`). Two presenters render the **same content**:
- **Journey presenter** — pinned stage, scrubbed.
- **Linear presenter** — normal stacked sections with each scene's end-state visual (SVG/static render).
Selection logic: Journey iff `!reducedMotion && webgl && !lowPower && viewport ≥ 1024` (desktop); mobile has its own presenter (06). SSR renders the **Linear presenter's semantic HTML** so crawlers, no-JS and slow connections get real content; the Journey enhances after hydration.

### 3.2 Scroll progress & stage
- Journey container height = total scene vh; inner stage `position: sticky; top:0; height:100svh`.
- `useScroll({ target: containerRef, offset: ['start start','end end'] })` → `progress` MotionValue; smoothed with `useSpring` (see 03).
- Scene config `{id, start, end}`; hooks `useScene(id)` → `{local: MotionValue, active: boolean}`.
- **Native scrolling only.** No Lenis, no wheel handlers.

### 3.3 Shared 3D canvas
- One `<Canvas>` **inside the stage**, loaded with `next/dynamic({ ssr:false })` after idle/hero paint. `dpr={[1,1.5]}`, `antialias` on, `powerPreference:'high-performance'`, `frameloop="always"` only while the stage is in view; `"never"`/paused when off-screen or tab hidden (IntersectionObserver + `visibilitychange`).
- **World graph:** `<CompassRig/>` (persistent: bezel, face, N needles) and scene-scoped modules `<DomainObjects/>`, `<NeedleConverge/>` mounted by progress window. Procedural geometry first (no GLTF dependency); materials shared; geometries instanced where repeated.
- **Progress → 3D** by subscribing to MotionValues inside `useFrame` and writing to refs (no React re-render per frame).
- Pointer events via `eventSource={document.body}`, `eventPrefix="client"` (proven).
- Labels/tooltips as **DOM overlays** positioned from projected coordinates (avoid `<Html>` issues, keeps text accessible).

### 3.4 Non-3D scenes
Scenes 4–6 are DOM + SVG (`pathLength` for route draw; CSS transforms for ledger), still driven by the same `local` MotionValues. Scene 5 constellation: SVG or 2D canvas with three parallax layers (fallback for WebGL-less devices at zero extra cost).

### 3.5 GSAP ScrollTrigger — evaluation
| | CSS sticky + Framer Motion (proposed) | GSAP ScrollTrigger |
|---|---|---|
| Already installed | ✔ | ✘ (new dependency, ~30–50 KB gz with plugin) |
| Pinning | Native CSS sticky, no pin-spacer layout hacks | Robust pin + spacers, very mature |
| Scrubbed timelines | `useTransform` per property; fine for ~8 scenes | Excellent master timelines, labels, easing control |
| React 19/Next integration | Idiomatic | Needs `useGSAP`/cleanup discipline |
| Reduced motion / matchMedia | Manual | `matchMedia` built in |
**Decision: do not add GSAP now.** Re-evaluate at the end of Milestone 2 if (a) we need complex nested timelines that become unwieldy with `useTransform`, or (b) sticky pinning shows cross-browser defects (iOS URL-bar jumps are the main risk). Add only with a written justification.

### 3.6 Asset pipeline
- Fonts via `next/font` (Instrument Serif + Inter).
- Images AVIF/WebP via `next/image`.
- Compass bezel/paper normal maps ≤ 512 px, KTX2 optional later.
- Optional later: 1–2 pre-rendered transition clips (webm/mp4) behind the same scene API, used only if real-time cannot reach the desired look.

### 3.7 SEO / semantics
Single `<h1>`; each scene `<section aria-labelledby>`; DOM order = narrative order; the canvas is `aria-hidden`; Direction Rail uses `<nav aria-label="Journey">`; skip link "Skip the journey" jumps to Scene 8.

## 4. Performance budgets
| Metric | Budget |
|---|---|
| LCP | < 2.5 s (LCP element is hero **HTML text**, not WebGL) |
| CLS | < 0.05 |
| INP | < 200 ms |
| Initial JS (excluding lazy 3D) | < 170 KB gz |
| 3D chunk (three + r3f + drei subset) | lazy, < 400 KB gz; loaded after idle |
| Frame rate | ≥ 55 fps on integrated GPU @1440×900, dpr 1–1.5 |
| Draw calls / triangles | < 150 / < 200k per frame |
| GPU memory | < 150 MB |
Tactics: lazy canvas, scene mount windows, shared materials, no real-time shadows, no `MeshTransmissionMaterial` on large surfaces, no post-processing in v1, quality tiers (see 06), delta clamping, pause off-screen.

## 5. Testing & verification
- Playwright (headed Chrome) screenshot suite at scroll marks per scene × {1440, 1280, 768, 390}.
- Lighthouse CI for LCP/CLS; Chrome tracing for GPU frame time.
- Manual device matrix: low-end Android, iPhone Safari, integrated-GPU laptop.
- Automated checks: reduced-motion path, WebGL-disabled path, no-JS path.
- Existing gate stays: `npm run lint`, `npx tsc --noEmit`, `npm run build`.

## 6. Proposed folder structure
```
src/
  app/page.tsx
  content/            scenes.ts domains.ts copy.ts (typed, sourced)
  journey/
    JourneyProvider.tsx  StageShell.tsx  DirectionRail.tsx  useScene.ts
    presenters/ JourneyPresenter.tsx  LinearPresenter.tsx  MobilePresenter.tsx
    scenes/ 01-Arrival … 08-Guidance (DOM layer per scene)
    world/  WorldCanvas.tsx  CompassRig.tsx  DomainObjects/*  NeedleConverge.tsx
  components/ui/ …
  lib/ capability.ts (reduced-motion, webgl, low-power detect)
```
