# Website Quality Audit

Date: 2026-11-05. Branch: `redesign/meridian-atlas`. Audited against `docs/DESIGN_CONSTITUTION.md`.

**Method.** Production build in real Chrome via `scripts/site-audit.mjs` at 1440, 1280, 768 and 390 px, with classic scrollbars and with touch emulation (768, 390). Text contrast by rendered pixels (`scripts/contrast-measure-site.mjs`, plus the scene scripts). Code inventory by search. Screenshots inspected at each width. Raw results: `docs/qa-screenshots/audit/report.json`; state before fixes: `docs/qa-screenshots/audit/baseline/`.

**Not tested:** real phones and tablets, Safari, Firefox, a screen reader, a live deployment.

**Scene 6.** Work on Scene 6 had already begun when this audit was requested. It is parked, unapproved, on the local branch `wip/scene-6-comparison-studio` (`6471554`) and is not part of this branch. See section 9.

---

## 1. Summary

The approved scenes (1 to 5) are in good functional health: no overflow, no clipped text, no console errors, working navigation. The serious problems were almost all in the **interim Light Royal sections below Scene 5**, which still look like a different website and held a false claim, dead links and invented figures.

| | Count |
|---|---:|
| Critical bugs found, fixed and tested | 4 |
| Other small defects fixed and tested | 11 |
| Critical design inconsistency still open | 1 |
| Important improvements awaiting approval | 12 |
| Optional refinements | 8 |

---

## 2. Critical bugs (all fixed and tested)

| # | Problem | Where | Fix | Evidence |
|---|---|---|---|---|
| C1 | **False claim:** "Join thousands of students who have discovered their ideal career path" | `FinalCTA.tsx` | Replaced with a truthful line | `baseline/1440-act-future.jpg` |
| C2 | **Dead links:** Explore Careers to `/careers`, Get Guidance to `/counselling` (both 404). Next prefetched them, logging 404s on every load | `FinalCTA.tsx` | Point to real sections | Dead links 2 to 0; console errors 2-4 to 0 at all widths |
| C3 | **Invented figures** on the page: "₹2L—₹15L/yr", "₹50K—₹3L/yr", durations, eligibility, labelled sample but unsourced | `CompareTeaser.tsx` | Values now say "Not verified yet" | `baseline/contact-1440-legacy.jpg` |
| C4 | **Out-of-date statement:** FAQ said all university details were sample data, contradicting Scene 5 | `FAQSection.tsx` | Rewritten to say what is verified and what is orientation | Read in place |

The C2 finding also explains the unexplained 404s seen during Scene 6 capture. An earlier one-off "flow presenter at 1440" reading was **not** reproduced: 15 of 15 fresh loads were pinned. Its cause is unknown.

## 3. Other small defects fixed and tested

| # | Problem | Fix | Tested |
|---|---|---|---|
| F1 | Scene 2 horizontal overflow, 4px at 390 with classic scrollbars. **Reproduced.** Offender: the flow compass `svg` with `w-[min(92vw,440px)]`: `vw` includes the scrollbar, and it was wider than its column on phones too, so it sat off-centre | `w-full max-w-[440px]` in `FlowJourney.tsx`. No global overflow rule | Scroll width 379 to 375 of 375. Margins now equal, 20/20 |
| F2 | Default Next.js favicon | Custom compass mark: `icon.svg`, `favicon.ico`, `apple-icon.png` (`scripts/build-icons.mjs`) | Served, 3 icon links in `<head>` |
| F3 | Starter assets `next.svg`, `vercel.svg`, `file.svg`, `globe.svg`, `window.svg` in `public/`, unreferenced | Removed | 404 now, no references |
| F4 | Default unbranded 404 with no way back | `not-found.tsx`, with a title and 3 real links | Status 404, title correct, screenshot inspected |
| F5 | No Open Graph, canonical, theme colour; description said "top careers" | Metadata in `layout.tsx` | Read from the rendered `<head>` |
| F6 | No `robots.txt` or `sitemap.xml` | `robots.ts`, `sitemap.ts` | Both 200 with correct content |
| F7 | Mobile menu: declared modal, but focus did not move in, Escape did nothing, focus could escape | Focus in, trap, Escape, return focus | Tab cycle stays inside; focus returns to the menu button |
| F8 | No skip link | Added, with `<main id="main">` | First Tab reaches it; Enter moves focus to main |
| F9 | Touch targets: search suggestions 36px at 768+, rail links 40px | Both 44px | Audit reports none below 44px, apart from the skip link while it is visually hidden |
| F10 | Contrast failures in interim sections: "The Journey Continues" 1.68, "STEP" labels, "ATTRIBUTE" 3.78 | Moved to `champagne-800` and `cyan-800` tokens | 93 of 93 pass at each of 1440, 1280, 768, 390 |
| F11 | Interim eyebrows "05 / DECIDE" and "06 / GUIDANCE" clashed with Scene 05 Universities | Numbers removed | Read in place |

Also added: radius tokens (constitution section 8). No component uses them yet.

---

## 4. Critical design inconsistency (open, needs your decision)

**D1. The interim sections contradict Nocturne Atlas.** After the dawn handoff the page becomes a different website: royal blue buttons, lavender panel, slate text, Plus Jakarta headings, white cards. See `audit/contact-1440-interim.jpg`.

| Section | Violations | Location |
|---|---|---|
| How It Works | Four-step icon-in-circle cards: the most template-like block on the site. Generic lucide icons, shadows, staggered reveals | `HowItWorks.tsx` |
| Guidance form | Royal blue, lavender card, uppercase button, non-token error red | `CounsellingCTA.tsx` |
| Platform principles | Three-column feature block | `PlatformPrinciples.tsx` |
| FAQ | White cards, staggered reveals | `FAQSection.tsx` |
| Final call to action | Glowing horizon with `blur-3xl`, blue glow shadow, `backdrop-blur` glass button, hover lift, hard-coded `#1E2A78` | `FinalCTA.tsx` |
| Compare teaser | Placeholder until Scene 6 | `CompareTeaser.tsx` |

**Recommendation:** do not restyle these twice. Replace them through Scenes 6 to 8. If the site will be shown to anyone before then, hide How It Works, Principles and the Final CTA, which add the least.

---

## 5. Important improvements (open, awaiting approval)

### Repeated design-system violations

| # | Issue | Where | Recommendation |
|---|---|---|---|
| I1 | **Meaningless infinite animation.** See the inventory below | Scene 3, Scene 1 | Run once on room entry, or tie to scroll. Needs your call, because the Technology sweep was named in M2.1 |
| I2 | **Identical scene openings:** centred eyebrow, centred title, centred paragraph, line drawing. The parked Scene 6 repeats it a third time | `PathwayConverge.tsx`, `AtlasIntro.tsx` | Keep the line-drawing idea, but give each scene its own composition. `courses/1440-01-converge-title.jpg` vs `universities/1440-00-intro.jpg` |
| I3 | **Instrument Serif numerals:** "17 institutions" reads like "l7" | Scene 5 panel headings | Set figures in Inter or JetBrains Mono. `universities/1440-01-atlas-empty.jpg` |
| I4 | **Very small mono labels:** 21 uses of 10px, 31 of 11px, 49 uppercase | Across scenes | Raise the floor to 11px, reserve mono for real metadata |
| I5 | **Radius mix:** full 30, md 17, lg 16, default 8, sm 7, xl 3, with no logic | Everywhere | Migrate to the scale when each scene is next touched |
| I6 | **Labels that look like buttons:** discipline and subject chips share the bordered shape of real controls | `ContentBlocks.tsx`, `CoursesPathway.tsx` | Plain comma text or a borderless treatment |
| I7 | **Mixed icon language:** lucide (2px), custom `DomainGlyph` (1.4px), text arrows (→ ←) | Header, CTAs, scenes | Pick one family and stroke, including arrows |
| I8 | **Decorative dot grids and chart lines:** dot grids in two rooms; the same 64px grid behind Scenes 4 and 5 | `MedicineEnv.tsx`, `DesignEnv.tsx`, `CoursesPathway.tsx`, `UniversityAtlas.tsx` | Keep only where it reads as a chart; remove the dots |

### Functional and accessibility

| # | Issue | Where | Recommendation |
|---|---|---|---|
| I9 | **No active navigation state.** Nothing shows where you are in the header (the rail does, on desktop only) | `Header.tsx` | Add a section observer with `aria-current` |
| I10 | **Reduced motion ignored by interim reveals.** Measured: a card fades 0.44 to 1.00 with reduced motion on. 13 `whileInView` uses, none guarded | `components/home/*` | Goes away with D1. Otherwise guard them |
| I11 | **Footer dead-ends:** 8 "Top Streams" links all land on the same section unfiltered; "Commerce" and "Arts" match no domain; 5 "Soon" badges | `Footer.tsx` | Remove the column until it can filter; state what is missing once |
| I12 | **No privacy policy,** while the form asks for a name and phone number. Nothing is sent today, verified: no network request. **Blocker before real submissions** | `Footer.tsx`, `CounsellingCTA.tsx` | Write it before connecting a backend |

### Inventory: continuous animation (I1)

| Location | What | Purpose | Class | Recommendation |
|---|---|---|---|---|
| `envs/shared.tsx:86` | Pulsing nodes, Scene 3 | Decorative | Repeated violation | Remove or once on entry |
| `DesignEnv.tsx:39` | Floating circle | Decorative | Repeated violation | Remove |
| `DesignEnv.tsx:45`, `MedicineEnv.tsx:52`, `ScienceEnv.tsx:52` | Slow spins, 60-120s | Atmosphere | Repeated violation | Tie to scroll, or stop |
| `TechnologyEnv.tsx:48` | Signal sweep | Suggests signal, loops forever | Repeated violation | Once on entry; your call |
| `CompassSVG.tsx:149`, `globals.css:210` | Needle sway, fallback compass | Character | Optional | Stop after a few seconds |
| `DomainMarks.tsx:72` | Ping while hovered | Feedback, but loops | Optional | Once per hover |
| `PinnedJourney.tsx:65` | Scroll cue | Functional hint | Keep | Check it stops once scrolling starts |

All of these are disabled under reduced motion, and only the active room's run.

---

## 6. Optional refinements

| # | Item |
|---|---|
| O1 | Four of seven Scene 3 rooms share "text left, lists right", and every room repeats the same content stack. They differ most through artwork. |
| O2 | Tablets (below 1024) get the Scene 5 list, not the atlas. A 768 screen could hold a simplified atlas. |
| O3 | Em dashes in visible copy: eyebrows "03 — Explore" (all scenes), Scene 3 art labels, footer tagline, Scene 4 fallback and summary, Scene 5 footnote. |
| O4 | "Explore this course" shows in Scene 4 before a course is chosen. Show it once one is. |
| O5 | "Soon" appears in all seven Scene 3 rooms. It is meaningful, but could be stated once. |
| O6 | Hero copy and footer tagline are close to identical. |
| O7 | The header wordmark is Inter semibold with a dot. A serif or compass-based mark would carry the identity further, and would match the new favicon. |
| O8 | Add an Open Graph image. Metadata is in place, but shared links have no picture. |

---

## 7. Evaluation by area

### Typography

| Check | Finding |
|---|---|
| Headline personality | **Strong.** Instrument Serif with italic champagne emphasis is distinctive. Keep. |
| Body readability | Good. Inter at 14-18px. |
| Display | Good, but one weight only, so hierarchy depends on size and italic. |
| Numerals | **Weak.** See I3. |
| Metadata | Characterful but overused and small. See I4. |
| Mobile scaling | Good. `clamp()` headlines, no clipped text at any width. |
| Font loading | Self-hosted, swap. 6 files, 154 KB on desktop. **Plus Jakarta Sans is a fourth family** used only by interim sections; it goes with D1. |

No font replacement is recommended.

### Layout by scene

| Scene | Finding |
|---|---|
| 1 Arrival | Distinctive. Keep. |
| 2 Discover | Distinctive. Keep. |
| 3 Explore | Artwork is excellent. See O1, I1, I8. |
| 4 Pathways | The chart is distinctive. Opening shared with Scene 5 (I2). |
| 5 Atlas | Distinctive. Opening shared with Scene 4 (I2). |
| Interim | Template-like (D1). |

### Navigation, buttons, forms

| Check | Result |
|---|---|
| Header links reach their sections | Pass, 4 of 4 |
| Logo returns to the top | Pass |
| Mobile menu | Pass after F7 |
| Dead internal links | 0 (were 2) |
| Missing anchors | 0 |
| Disabled actions | Labelled "Soon" with a reason. They use `aria-disabled` and stay focusable; acceptable |
| Hero search | Works, and states when nothing matches |
| Form | Validates, shows errors and an honest success state. Sends nothing; verified. No loader needed, as no async work exists |
| Contact details | None published, so none to link. None invented |
| External links | All use `noopener`; tested in Scene 5 |

### Responsive (after fixes)

| Width | Presenter | Overflow | Clipped text | Targets under 44px | Console errors |
|---|---|---:|---:|---:|---:|
| 1440 | Pinned | 0 | 0 | 0* | 0 |
| 1280 | Pinned | 0 | 0 | 0* | 0 |
| 768 | Flow | 0 | 0 | 0* | 0 |
| 768 touch | Flow | 0 | 0 | 0* | 0 |
| 390 | Flow | 0 | 0 | 0* | 0 |
| 390 touch | Flow | 0 | 0 | 0* | 0 |

*The audit reports one entry at each width: the skip link while visually hidden. It is 44px tall when focused.

Visual inspection: `audit/contact-768.jpg`, `audit/contact-390.jpg`. No overlaps found. Regression after fixes: Scene 3 12/12, Scene 4 19/19 and 20/20, Scene 5 25/25 and 26/26 (desktop, mobile).

### SEO and completeness

| Item | Before | After |
|---|---|---|
| Title | OK | Template added for future pages |
| Description | "top careers" wording | Factual |
| Open Graph | None | Yes, no image (O8) |
| Canonical | None | `https://careerscompus.in` |
| Favicon | Next.js default | Custom |
| 404 | Default | Branded |
| Sitemap, robots | None | Yes |
| Copyright year | Correct | Correct. Set at build time, so it needs a rebuild each year |

**To confirm:** the domain comes from `docs/routes.md`. Override with `NEXT_PUBLIC_SITE_URL`. `robots.txt` allows indexing, so if the preview should stay out of search, say so.

### Images and assets

No raster images are used on the page: the artwork is SVG and CSS. No broken paths, no missing alt text. Unused starter assets removed (F3). Decorative SVGs are `aria-hidden`.

### Loading states

No loaders exist, and none are needed, since no async user operation exists yet. This is correct. The 3D compass fades in without a spinner.

### Accessibility

Landmarks correct, one `h1`, no heading skips, no unnamed buttons, no unlabelled inputs at any width. Contrast measured for every scene and interim section. Open: I9, I10. No screen-reader pass yet.

### Technical

| Item | Finding | Recommendation |
|---|---|---|
| Dead components | `CareerExploration`, `FeaturedCourses`, `PopularStreams`, `UniversityPreview`, `ui/Badge`, `ui/Button`, `ui/Input` have no importers | Delete after approval |
| Effectively unused dependencies | `clsx`, `tailwind-merge` are used only through `lib/utils`, whose only users are the dead `ui/*` files | Remove with them |
| Misplaced dependency | `@types/three` is in `dependencies` | Move to dev |
| Legacy CSS | About 70 Light Royal colour variables in `globals.css`, plus a base heading rule that set the invisible 404 heading | Remove with D1 |
| Repo weight | `docs/qa-screenshots` is 87 MB, committed | Keep contact sheets and reports; move the rest out |
| Build hazard | A running `next dev` broke `next build` by leaving a malformed file in `.next/dev/types`, which `tsconfig` includes. Found in this audit | Now a constitution rule |
| JS weight | 474 KB desktop (with 3D), 234 KB on phones (3D correctly not loaded) | No action |
| Re-renders | Scroll work stays out of React state. No concern found | No action |

---

## 8. Recommended fixes, ranked

*Status after the stabilisation milestone: see section 10. Everything below is done except I7 (icon family), the Scene 6 review, Optional refinements and the launch items.*

| Priority | Fix | Effort | Needs |
|---|---|---|---|
| **P0** | Decide how interim sections are handled until Scenes 6-8 (D1) | Small to hide; large to replace | Your decision |
| **P1** | Review Scene 6 against the constitution, then resume it (section 9) | Medium | Your approval |
| **P1** | Remove or convert decorative infinite animation (I1) | Small | Your call on the sweep |
| **P1** | Give Scenes 4 and 5 distinct openings (I2) | Medium | Approval: touches approved scenes |
| **P1** | Fix figures and raise the label floor (I3, I4) | Small | Approval |
| **P2** | Active navigation state (I9) | Small | Approval |
| **P2** | Footer clean-up (I11) | Small | Approval |
| **P2** | Icon family and arrows (I7), chips (I6), dot grids (I8) | Small to medium | Approval |
| **P2** | Radius migration (I5) | Medium | Approval |
| **P2** | Delete dead code, Plus Jakarta and legacy CSS | Small, after D1 | Approval |
| **P3** | Optional refinements O1 to O8 | Varies | Your preference |
| **Before launch** | Privacy policy (I12), real form backend, real-device, Safari, Firefox and screen-reader testing | Medium | Launch plan |

---

## 9. Parked Scene 6, reviewed against the constitution

Branch `wip/scene-6-comparison-studio`, commit `6471554`. **Not complete and not approved.**

| Rule | Finding |
|---|---|
| Honesty, three states | Follows it. Adds a fourth "orientation" label, because Scene 4 pathways have no sources. This needs your agreement |
| Infinite animation | None |
| Nested cards | None |
| Badges | Meaningful (Verified, In comparison) |
| **Scene opening** | **Violates section 6:** same centred opening as Scenes 4 and 5 |
| **Figures** | **Violates section 4:** years and durations in Instrument Serif |
| **Radii** | **Violates section 8:** older values, not the new tokens |
| **Small labels** | **Violates section 4:** 10px mono labels |
| Icons | Uses text glyphs (✓ ○ – ◇) as state marks. Should become SVG |

Also on that branch: 18 programme records and 10 durations through the evidence pipeline.

Unfinished: 1280 contrast after the last script change; the 1280 Scene 6 performance reading (1 fps) is invalid and must be re-measured, as the browser was probably throttled; docs; full screenshot inspection.


---

## 10. Stabilisation milestone (2026-11-06)

Controlled stabilisation on `redesign/meridian-atlas`. Scene 6 was not touched. Before and after screenshots: `docs/qa-screenshots/stabilisation/before` and `.../after` (1440, 1280, 768, 390).

### Fixed

| Item | What changed |
|---|---|
| D1 interim sections | How It Works, Platform Principles and Final CTA are hidden behind `SHOW_INTERIM_SECTIONS` (code kept). Header "Compare" and footer Compare, About, Contact, Sitemap and the eight identical "Top Streams" links are removed, so nothing points at hidden or unfinished content |
| I1 continuous animation | Every endless loop removed or made one-shot: room pulses, float, 60/90/120 s spins, the Technology scan (now crosses the die once on first open, ends stable), hover ping, scroll cue (3 repeats), fallback compass sway (settles once), 3D compass idle drift and glow (`idleTime` stops it after about 12 s) |
| Reduced motion | `MotionConfig reducedMotion="user"` site-wide and a `[data-interim]` rule so the legacy `whileInView` fades are fully visible (they measured opacity 0.44) |
| I2 openings | Scene 4: poster-scale left-aligned headline with hue lines that merge into one rail leading into the chart. Scene 5: chart plate left, stepped title right, regional hubs drawn from the atlas's own layout, with three real facts |
| I3 figures | `Figures` sets digits in JetBrains Mono ("17 institutions" no longer reads "l7"); route labels use it too |
| I4 label floor | No `text-[10px]` remains; SVG annotations scale with their artwork and are hidden on phones and tablets, with readable fixed-size captions instead |
| Status labels | Four-state vocabulary implemented (`StatusLabel`, `StatusLegend`) and applied to the Scene 5 info panel and Scene 4 panels |
| I5 radius | Live components moved onto `rounded-atlas-sm / atlas / atlas-lg` |
| I6 chips | Display-only discipline and subject chips are now plain slash-separated text; bordered boxes remain only for controls. The bordered "Soon" badge inside disabled buttons is plain text |
| I8 dot grids | Medicine and Design backdrop dot grids removed. The Scene 5 atlas grid is kept: it is the chart's coordinate system |
| I9 active nav | `aria-current="location"` plus an underline follows the section in view |
| I11 footer | Three columns, working links only, "coming soon" as plain text |
| Dead code | `components/ui/*`, `lib/utils.ts`, four unused home components, and the dependencies `clsx`, `tailwind-merge`, `@react-three/drei` removed |
| SEO and domain | www to non-www 308, HSTS, production-only indexing, noindex and disallow-all elsewhere, canonical `https://careerscompus.in` |

### Intentionally left open

- **I7 icon family**: the lucide icons, text arrows and `DomainGlyph` still coexist. Unifying them touches approved Scenes 1 to 3; needs your approval.
- **Scene 6**: still parked. It must adopt the four labels, `Figures`, the radius tokens and a distinct opening before it resumes.
- **Interim sections still shown**: Compare teaser, Counselling and FAQ remain (not on the hide list); they are still Light Royal and will be replaced by Scenes 6 to 8. The Counselling form has no backend.
- **`@types/three`** is still in `dependencies` (should be a devDependency); Plus Jakarta Sans remains for the interim sections.
- **Access protection for previews** is a hosting setting I could not and did not touch.
- **Scene 2 4 px overflow** with classic scrollbars was not re-investigated.

### P3: `docs/qa-screenshots` footprint (proposal only, nothing deleted)

The tracked folder is 981 files: 955 JPEGs (76 MB, average 81 KB, 29 over 200 KB) and 4 WebM clips (19.4 MB), roughly 88 MB of git pack. 99 JPEGs are byte-identical duplicates. Proposal, in order of safety: (1) remove byte-identical duplicates; (2) keep only the latest run per script and device, since earlier runs are in git history; (3) move the four WebM clips to a release asset or storage outside git; (4) re-encode JPEGs over 200 KB at quality 78. This would plausibly cut the working tree by more than half. Git history keeps the size unless it is rewritten, which I do not recommend. Keep the `after` set above, the `audit` baseline and each scene's final run as the visual-regression evidence. Awaiting your approval.

### Measured after the changes

Lint, `tsc --noEmit` and `next build` pass; `check-tokens` OK; `site-audit`: 0 overflow, 0 clipped text, 0 console errors at 1440, 1280, 768, 390 and both touch profiles; interim contrast 58/58; Explore, Courses (desktop, mobile) and Universities (desktop, mobile) interaction suites all pass. Performance in headed Chrome: idle 60.2 fps; pinned scroll 58.9 fps median over 5 runs at 1440 (min 48.8; a single cold run reads about 39); Scenes 4 and 5 at 59.8 to 60 fps.
