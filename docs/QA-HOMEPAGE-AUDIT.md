# Homepage Browser Audit — 2026-11-04

Method: dev server in the in-app browser, 1440 / 1280 / 390 px. Screenshots in `docs/qa-screenshots/`.
Limits: pane screenshots are ≤800px wide; the pane intermittently hid itself, so **frame rate could not be measured reliably** (readings of 1–2 fps were taken while hidden and are discarded). 1280px was checked by layout metrics only (no overflow, canvas 1265x800), not section-by-section screenshots. Safari/Firefox untested.

## Fixed (measurable defects)
1. **Final CTA invisible** — Pearl text on transparent/white (~1.05:1). `FinalCTA.tsx` now uses Deep Royal / slate text and a light secondary button.
2. **Header text turned Pearl over last 10% of scroll** (for a dark final section that doesn't exist). `Header.tsx` stops now stay dark.
3. **Mobile menu clipped to 64px** — fixed overlay lived inside a `backdrop-blur` header (becomes containing block). Overlay is now a sibling of the header.

## Open issues (reported, not changed)
- **Hero search missing** (wireframe §3): only two CTAs. Hero buttons are `<button>` with no action.
- **Compass overlaps hero headline/paragraph at 1440 and 390**; on scroll it scales up and overlaps text in Career Exploration and Courses (rings cross "B.Tech Computer Science" heading, career list on mobile). Needs a 3D-phase decision; not touched.
- **Off-palette/inconsistent styling**: terracotta dots under University cards, serif-italic + mono labels in Compare/Counselling vs sans elsewhere, sky-blue (#0ea5e9) stats and footer accent, tiny 10–11px low-contrast labels (university cards).
- **Placeholder trust content**: stats (1,200+ / 300+ / 100+ / 50,000+) and press names (The Hindu, Times of India, Forbes, EdTech) are unverified claims — replace or remove before launch.
- **Dead links**: /courses, /universities, /careers/*, /compare, /counselling, /streams/*, /about, /contact, /privacy, /terms, /sitemap all 404 (no routes yet).
- **Counselling form** submit does nothing (preventDefault, no feedback); inputs 36px tall, faint placeholders.
- Footer links ~19px tall touch targets on mobile.
- Career node hover is driven by hovering the list rows (custom `career-hover` event), not by pointing at nodes in 3D (from code; interaction not exercised in-browser).
- Section vertical gaps look large on mobile (partly fade-in timing).
