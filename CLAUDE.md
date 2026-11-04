@AGENTS.md


# CareersCompus — Project Notes

- Stack: Next.js 16 (App Router, Turbopack), React 19.2 (React Compiler lint rules active), Tailwind v4, framer-motion, three / @react-three/fiber / drei.
- Only route today: `/` (homepage). Sections live in `src/components/home/`, shared UI in `src/components/ui/`, layout in `src/components/layout/`.
- Design direction: **Light Royal**. Do not reintroduce the old dark "cinematic" environment.
- Homepage section order follows `docs/homepage-wireframe.md`; the persistent 3D layer is `Scroll3DScene` driven by `ScrollJourney` context.
- Quality gate before committing: `npm run lint`, `npx tsc --noEmit`, `npm run build` must all pass. Never silence lint rules to pass.
- No `any`, no `Math.random()`/`Date.now()` during render, no setState inside effects bodies.
- Status/history: `docs/PROJECT_STATUS.md`, `docs/CHANGELOG.md`, `docs/DECISIONS.md`, `docs/ROADMAP.md`.
