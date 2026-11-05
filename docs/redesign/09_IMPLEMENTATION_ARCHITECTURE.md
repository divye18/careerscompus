# 09 — Implementation Architecture (as built, Milestones 0–1 + Nocturne Atlas)

Status: **implemented** on branch `redesign/meridian-atlas`. Scenes 1 (Arrival) and 2 (Discover) only.

## 1. Decision: replace, not adapt, the old scroll architecture
| Old | Problem | New |
|---|---|---|
| `ScrollJourney` (whole-page `useScroll`, "acts" by page %) | Scene timing shifted whenever page length changed | `PinnedJourney`: progress measured over its **own** container only |
| `Scroll3DScene` (page-wide `position:fixed` canvas under all content) | Overlapped copy, blocked pointer events, rendered when invisible | Canvas lives **inside the sticky stage**, lazy-loaded, paused off-screen |
| `CareerCompassSystem` (state + DOM-anchor docking) | Coupled to page sections | `CompassRig` reads a pure choreography module; no DOM lookups per frame |
| `Hero` | Replaced | `ArrivalCopy` (shared by both presenters) |

Removed files (recoverable from `dc15e6c`): `Hero.tsx`, `Scroll3DScene.tsx`, `CareerCompassSystem.tsx`, `ScrollJourney.tsx`. `CareerExploration.tsx` is kept on disk as source content for Scene 3 but is no longer rendered.

## 2. Framer Motion vs GSAP
Kept **Framer Motion (already installed)**; did **not** add GSAP. Reasons: CSS `position: sticky` gives the pin natively (no pin-spacer), `useScroll` + `useSpring` + `useTransform` cover the two-scene timeline cleanly, and everything is MotionValue-based so scrolling causes **zero React re-renders**. Re-evaluate at Milestone 2 (seven domain sub-scenes) only if nested timelines become unwieldy or iOS sticky defects appear.

## 3. Module map
```
src/lib/capability.ts          useCapability(): tier 'full' | 'flow' (+ reason). Cached useSyncExternalStore snapshot.
src/content/domains.ts         The 7 approved domains (name, hue, neutral blurb).
src/journey/
  Journey.tsx                  Picks presenter by capability; falls back to flow if WebGL context is lost.
  PinnedJourney.tsx            Desktop: tall container + sticky 100dvh stage; useScroll → useSpring → progress.
  FlowJourney.tsx              Phones / reduced motion / no WebGL / low power / SSR: natural scroll, SVG compass.
  JourneyContext.tsx           MotionValues only: progress, stageW, stageH (ResizeObserver), hover.
  choreography.ts              PURE functions: timeline ranges, rigLayout(), spokeState(), markPosition(), easing.
  CompassSVG.tsx               2D compass driven by the same choreography (attributes set imperatively).
  DomainGlyph.tsx              Seven original hairline glyphs.
  scroll.ts                    goTo(id) with reduced-motion handling.
  layers/                      DOM layers of the stage (no 3D dependency):
    Ground, Graticule, ArrivalCopy, DiscoverCopy, DomainMarks, DirectionRail
  world/                       WebGL only (lazy chunk):
    WorldCanvas (Canvas, local Lightformer lighting, pause off-screen, context-loss → onFail)
    CompassRig (body, rings, 7 <Spoke/>), compassAssets (shared geometries/materials), faceTexture (procedural dial)
```
**Scene types are decoupled from 3D:** every scene is a set of DOM layers reading `progress`; the 3D world is just one more layer. Scenes that do not need WebGL (4, 6, 8 in the storyboard) will add DOM/SVG layers only.

## 4. Data flow
```
native scroll ─► useScroll(target=container) ─► useSpring (≈150 ms smoothing) ─► progress (MotionValue)
                                                                  │
          ┌───────────────────────────────┬──────────────────────┴──────────────┐
   DOM layers: useTransform(progress, fn)   CompassRig/Spoke: useFrame reads progress.get()   DirectionRail: event → setState only when scene index changes
          └───────── all fns come from choreography.ts (single source of truth) ─────────┘
```

## 5. Capability tiers
| Tier | Condition | Presenter |
|---|---|---|
| full | `(min-width:1024px) and (pointer:fine)`, WebGL available, no reduced motion (OS or `localStorage['cc:motion']='reduce'`), not low-power (`deviceMemory<4`, `hardwareConcurrency<4`, `saveData`) | PinnedJourney |
| flow | anything else, plus SSR, `?tier=flow`, or runtime WebGL context loss | FlowJourney |
The server always renders **flow**; Scene 1's copy is identical in both, so hydration to the pinned stage does not shift the first screen (measured CLS 0–0.0001).

## 6. Performance techniques
- 3D chunk (three/r3f/drei) loaded via `next/dynamic({ ssr:false })` inside a Client Component (per Next 16 docs), only on the full tier.
- LCP element is hero **HTML text**; the canvas fades in after its first frames.
- Shared geometries/materials (`CompassAssets`), procedural dial texture (no image/font fetch), **no remote HDR** (local `Lightformer` environment rendered once).
- `dpr={[1,1.5]}`, render loop `never` when the stage is off-screen; frame delta clamped to 50 ms.
- Composite-only DOM animation: ground colour cross-fade via opacity, grain without blend modes, graticule without `non-scaling-stroke`, no backdrop-filter over the canvas (each measured, see PROJECT_STATUS).

## 7. Verification process
`npm run qa:visual` (see `scripts/visual-check.mjs`) against `next start -p 3100`:
headed **real Chrome** via `playwright-core` → screenshots at scroll marks for 1440/1280 pinned, 390 mobile, reduced motion, WebGL disabled; LCP/CLS from PerformanceObserver; idle fps and a 6 s scripted scroll frame-time profile in a visible window; `--inject` CSS for A/B perf experiments; `--only`, `--perf-only`, `--no-perf`.
Video recording needs Playwright's ffmpeg download (not installed); a dense JPEG frame sequence is captured instead.

## 8. Nocturne Atlas integration (added)
- **Tokens:** one JS source `src/theme/tokens.ts` (colours, compass materials, matcap ramps, domain night/ink hues) mirrored in `globals.css` `@theme`; `node scripts/check-tokens.mjs` fails on drift or stray hex in journey/header/footer components. Legacy Light Royal tokens remain only for the interim sections and are labelled LEGACY.
- **Materials:** compass metals are procedural **matcaps** (`world/matcaps.ts`, tones from tokens); dial texture drawn from tokens; `MeshBasicMaterial` cyan tip core + halo (no bloom pass); two lights (warm key, faint cyan rim). **No IBL/PMREM** (it blocked the main thread ≈3 s).
- **Selection:** `JourneyContext.selected` (cyan marks selection; domain hue identifies). Hover emphasises; the rig reads both from MotionValues.
- **Header:** follows the environment beneath it via `data-header-theme="night"` markers (night/day); React state changes only on boundary crossings.
- **Handoff:** `--handoff-top` CSS variable is the shared end colour of the stage, the flow Discover section and the top of `Handoff.tsx` (temporary dawn band).
- **Capability:** a failed WebGL probe is retried once; context loss waits 3 s for restoration before falling back (`data-journey-reason` exposes why).
- **Tooling (`scripts/`):** visual-check (`--repeat`, `--trace`, `--video`), contact-sheet, transition-frames, states-check, context-loss-test, capability-stress, load-timeline, check-tokens.
