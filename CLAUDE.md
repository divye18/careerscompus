@AGENTS.md


# CareersCompus — Project Notes

- Stack: Next.js 16 (App Router, Turbopack), React 19.2 (React Compiler lint rules active), Tailwind v4, framer-motion, three / @react-three/fiber / drei.
- Only route today: `/` (homepage). Sections live in `src/components/home/`, shared UI in `src/components/ui/`, layout in `src/components/layout/`.
- Design direction: **Light Royal**. Do not reintroduce the old dark "cinematic" environment.
- Homepage section order follows `docs/homepage-wireframe.md`; the persistent 3D layer is `Scroll3DScene` driven by `ScrollJourney` context.
- Quality gate before committing: `npm run lint`, `npx tsc --noEmit`, `npm run build` must all pass. Never silence lint rules to pass.
- No `any`, no `Math.random()`/`Date.now()` during render, no setState inside effects bodies.
- Status/history: `docs/PROJECT_STATUS.md`, `docs/CHANGELOG.md`, `docs/DECISIONS.md`, `docs/ROADMAP.md`.

## Meridian Atlas (redesign, branch `redesign/meridian-atlas`)
- Approved direction & specs: `docs/redesign/01–07`; colour identity: `docs/redesign/08_COLOUR_IDENTITY.md` (Nocturne Atlas, approved); as-built architecture: `docs/redesign/09_IMPLEMENTATION_ARCHITECTURE.md`.
- Homepage hero is `src/journey/` (Scenes 1–2). Do not start Scene 3+ without explicit approval of the next milestone.
- All scene motion is a pure function of progress in `src/journey/choreography.ts`; DOM and WebGL both read it. Never drive per-frame animation with React state.
- Capability tiers in `src/lib/capability.ts` (full = pinned+WebGL, flow = natural scroll+SVG). Keep both presenters working.
- Visual/perf QA must use a visible real browser: `npx next start -p 3100` then `npm run qa:visual` (headed Chrome via playwright-core). The in-app preview pane throttles when hidden — never report fps from it.
- React Compiler lint is strict: no mutating hook-held objects (use methods, e.g. `CompassAssets`), no ref access during render.
- Colour: never write hex in journey/header/footer components; use tokens (`src/theme/tokens.ts` ↔ `@theme`; run `node scripts/check-tokens.mjs`). Cyan = selection/focus/compass light only, never a fill. Buttons: ivory primary on night, ink primary on day, transparent + border secondary.
- Fonts: Instrument Serif (display), Inter (text), JetBrains Mono (labels/data).

## Scene 3 (Explore Careers) — done (M2/M2.1)
- Code in `src/journey/explore/`; seven environments registered in `registry.tsx`. Do not start Scene 4+ without approval.
- Keep rooms mounted; avoid repeating CSS gradients under masks (use SVG). Check any new text with `node scripts/contrast-measure.mjs` (needs `npx next start -p 3100`).
- QA: `explore-check.mjs`, `explore-flow-check.mjs <out> <url> mobile|reduced|nowebgl`, `explore-interaction-check.mjs`, `explore-transitions.mjs`.

## Scene 4 (Courses & Pathways) — done (M3)
- Code in `src/journey/courses/` + `src/content/pathways.ts`. Do not start Scene 5+ without approval.
- Content rules: only illustrative orientation data; never add durations, fees, cut-offs, salaries, placements, exam names or eligibility rules without a sourced, reviewed record (`entrance` stays `null` until then).
- QA: `courses-check.mjs`, `courses-interaction-check.mjs [url] desktop|mobile|reduced|nowebgl`, `courses-transitions.mjs`, `courses-perf.mjs`, `contrast-measure-courses.mjs` (need `npx next start -p 3100`).
