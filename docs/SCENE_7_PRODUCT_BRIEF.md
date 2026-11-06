# Scene 7: Career Action Studio — product brief

Status: **specification only, awaiting approval.** Nothing here is implemented. Based on inspection of `ff95e76` (primary) and `cee5f1d` (maintenance); `src/` is identical on both.

---

## 1. Product objective

**User problem.** By the end of Scene 6 a student has seen careers, routes, institutions and a comparison, but holds no record of what they set aside, what is still unknown, or what to do next. The site also has no place that says plainly "this is what we could not tell you, and here is where to find out".

**Objective.** Turn what the student chose to set aside into a short, honest working sheet: what you kept, what is still open, what you could do next.

**Scene 7 does not advise.** It never says which option suits the student. It organises their own choices and the known gaps.

**Working idea: the route sheet.** A navigator's log, where earlier scenes were the chart. This fits the atlas identity and gives the scene a clear job.

## 2. What the code actually supports today

| Source | What exists | Survives reload? | Reusable in Scene 7? |
|---|---|---|---|
| `compareStore` (Scenes 4, 5, 6) | Up to 3 ids each of institutions, courses, programmes; mode, view, hidden parameters | Yes, same tab (`sessionStorage`) | **Yes. This is the only record of student choice** |
| `ledgerRows()` in `comparison.ts` | Every parameter for chosen options, with state and reason | Derived | **Yes**, the basis of "what is still open" |
| `institutions.data.json` | 17 institutions, 18 programmes (12 statements, 6 listings), 10 durations, sources, quotes, `lastVerified`, recorded gaps | Static | **Yes** |
| `pathways.ts` | Illustrative courses, levels, specialisations, career directions; `entrance` always null | Static | **Yes, always as Orientation** |
| `domains.ts` | Seven career worlds, orientation copy | Static | Yes, for navigation |
| Scene 4 route (`useReducer` in `CoursesPathway`) | Level, direction, course, specialisation, career | **No**, private to the component | Only if Scene 4 is changed (decision D1) |
| Scene 5 filters and open panel | Local state | **No** | Not needed |
| Scene 3 rooms visited | Page-view bitmask for animation only | **No** | **Should not be used**: viewing is not interest |
| Navigation events | `goTo(id)`, `cc:atlas-open`, `cc:pathway-domain` | n/a | **Yes**, for returning to scenes |

**There is no student profile, account or backend**, and the brief does not add one. No marks, preferences, location or eligibility are known, and none may be implied.

**The arrangement of the page.** Scenes 1 to 3 are in `<Journey />` (pinned with WebGL, or natural-scroll flow with SVG). Scenes 4 to 6 are natural-scroll sections sharing `SceneRailLane`. After them come `<Handoff />` and the interim Counselling and FAQ sections.

**Departure from the original storyboard.** `docs/redesign/02_SCROLL_STORYBOARD.md` placed Scene 7 inside the pinned stage with WebGL needles converging. The built site ended the pinned stage at Scene 3, so this brief uses natural scroll and SVG. It keeps the storyboard's Royal Plum ground and the spirit of its three steps.

## 3. User journey

1. Arrives from Scene 6, or directly through the rail.
2. Sees the opening, which states what this sheet is and is not.
3. **Kept:** sees their own choices, grouped, or an honest empty state.
4. **Still open:** sees what nobody has confirmed for those choices, with reasons.
5. **Next:** sees possible actions in a sensible order, with official website links.
6. Goes back to any earlier scene from the item concerned, and returns.
7. Optionally ticks steps off and prints or copies the sheet.

**Three states drive everything:** empty (nothing kept), partial (only courses, or only institutions), and full.

## 4. Scene structure and content architecture

### A. Opening
A composition none of Scenes 4 to 6 use. Those are a left poster with lines falling right (4), a chart plate with stepped title (5), and a split masthead with a horizontal rule (6).

**Scene 7: a logbook spread on Royal Plum.** A single vertical meridian runs a third of the way across the page. Left of it, a narrow margin holds the three section names as a mono index. Right of it, the title sits low in the viewport with generous space above:

> **Turn what you found**
> *into what you check next.*

One paragraph follows: "This sheet holds only what you chose to keep. It does not know your marks or your eligibility, and it does not recommend an option." As you scroll, the meridian draws downward from Scene 6 and continues through the whole scene.

### B. Stage I: Kept (exploration summary)
Ruled entries, not cards, grouped as Institutions, Programmes, Courses. Each entry has the name, its status label, its last-checked date where verified, and one action: "Back to the atlas", "Back to pathways" or "Open in comparison".

- A course is always **Orientation**.
- A statement-backed programme is **Verified**; a listing-only programme is **Partially verified** with "(listed only)".
- An institution has no overall status, because its facts differ. It shows "Details vary, see still open". An overall "Verified" here would overstate the evidence.
- **Empty state:** "Nothing kept yet. That is fine." with routes to Scenes 3, 4, 5 and 6.

### C. Stage II: Still open (information gaps)
Organised by **question, not by option**, because that is how a student works: "Entrance examinations: not recorded for IIT Madras, BITS Pilani". Each question lists options and the existing reason from `ledgerRows`.

- Built only from existing cell states. Not verified and Not applicable stay separate.
- Listing-only programmes add a question of their own: "Is this currently offered? It is named on the institution's pages but not described."
- Closing line: "A gap means we have not confirmed it. It says nothing good or bad about the option."

### D. Stage III: Next (planning)
A short numbered sequence from a **fixed rule table**. The order reflects dependency between tasks, never merit. Every step shows the **Orientation** label as a group, because the sequence is our general guidance.

| Condition | Possible step |
|---|---|
| No course kept | Look through the career worlds and pathways (Scenes 3, 4) |
| Course kept, no institution | Find institutions that may teach it (Scene 5) |
| Institutions kept, no programme | Compare specific programmes (Scene 6) |
| Fewer than two options in a kind | Add another to compare (Scene 6) |
| Listing-only programme kept | Check it is currently offered, on the official website (link) |
| Any open question on an option | Look up that question on its official website (link) |
| Always | Talk it through with a teacher, family or a school counsellor |

Links go only to `officialWebsite` values in the dataset. There are no dates, deadlines or instructions such as "apply now". Steps can be ticked as the student's own note. **A tick is not verification** and changes no label.

### E. Take it with you
"Print this sheet" and "Copy as text". Both include last-checked dates and the sentence in section G. No email, no account, no sharing link.

### F. Navigation
Each entry returns to its scene using the existing events. The rail gains an "Action" stop. The margin index acts as in-scene navigation. Scene 3 is reached through a domain link (`explore-<domain>`) from course entries.

### G. Evidence transparency
- Only the shared four states from `StatusLabel`, with "Not applicable" as plain words. No fifth status, no scores.
- **Every verified fact keeps its date, and the wording treats it as a past event:** "Last checked 2026-11-06", never "current", "up to date" or "confirmed for this year".
- Standing sentence, valid at any age: "These facts were true on the date we checked. Institutions change details, so confirm on the official website before you act."
- This is deliberately static. The app has no date logic, and `docs/EVIDENCE_PIPELINE.md` records that it gives no stale warning. Adding one is decision D4, not part of this scene.

## 5. Interaction specification

| Action | Behaviour |
|---|---|
| Keep or remove an option | Already in Scenes 4, 5, 6. Removing here calls `compareActions.remove`, with an undo for this view |
| Return to a scene | `goTo` plus the existing event; focus moves to the target's heading |
| Tick a step | Toggle button with `aria-pressed`; stored locally; no effect on evidence |
| Expand a question | Native `<details>` |
| Print | `window.print()` with a print stylesheet on a light ground |
| Copy | Clipboard API, with a visible confirmation and a fallback to selecting the text |

No control is hover-only. Display-only text must not look clickable.

## 6. Desktop and mobile behaviour

**Desktop (1024 px and up): natural scroll, no hijacking.**
- The meridian draws with scroll through `pathLength` on a MotionValue.
- The margin index is `position: sticky` and marks the current stage using an IntersectionObserver (state changes only at boundaries).
- Stages have different compositions: Kept is a ruled ledger, Still open a two-column question list hung from the meridian, Next one wide numbered column.

**Mobile: a separate design, not a compressed one.**
- The margin index becomes a sticky bar of three 44 px anchors (Kept, Open, Next) under the header.
- The meridian moves to the left edge as a thin line with a node per stage.
- Each question is a collapsed `<details>` showing a count of options, so long lists do not become a wall of text.
- "Print" is dropped on phones if testing shows it is unreliable; "Copy" stays.
- No horizontal overflow at 390, 375 or 360 px.

**Reduced motion.** The meridian is fully drawn, scrolling is instant and content is identical.
**No WebGL.** The scene uses no WebGL at all, so the experience is the same on every tier.
**No JavaScript or first render.** The server renders the empty state, because the store is client-only. The sheet fills in after hydration without layout-shifting the page above it.

## 7. Visual direction

- **Ground:** Royal Plum `#43205F`, the one saturated ground reserved for this scene in `docs/redesign/08_COLOUR_IDENTITY.md`. Solid, not a gradient strip. Text is Soft Ivory. Rules and the meridian are Champagne. Cyan is focus and selection only.
- **Type:** Instrument Serif for the title and option names, Inter for reasons and steps, JetBrains Mono for dates, stage labels and status. Digits in display text use `<Figures>`. Minimum 12 px text, 11 px mono labels.
- **Structure:** rules, whitespace and alignment to the meridian. Radius tokens only, on controls.
- **Icons:** the Lucide family already used in Scene 6.
- **Join to neighbours:** Scene 6 ends on ink and the scene after is `<Handoff />`, whose top colour is `--handoff-top`. Both joins need a planned colour step, to be checked by the transition script.

## 8. Animation principles

Animate only: the meridian's drawing (progress), the current index marker (navigation), a step's tick (state change), and an entry's removal (state change). All run once or follow scroll. No infinite motion, no reveal-on-scroll on text, no needle ceremony.

## 9. Data dependencies and feasibility

Classes: **1** existing data, **2** local browser state, **3** needs backend or persistent storage, **4** needs more verified external data, **5** not currently feasible.

| Feature | Class | Note |
|---|---|---|
| Summary of kept options | 1 + 2 | `compareStore` already provides it |
| Status labels and dates per entry | 1 | |
| Questions from existing gaps | 1 | Derived from `ledgerRows` |
| Rule-based next steps | 1 | New fixed table in the content layer |
| Official website links | 1 | Dataset only |
| Returning to scenes | 1 | Existing `goTo` and events |
| Ticking steps | 2 | New small store |
| Print and copy | 2 | Browser only |
| Showing the Scene 4 route | 2 | **Requires a small change to approved Scene 4** (D1) |
| Keeping the sheet after the tab closes | 2 | `localStorage`, with a shared-computer concern (D2) |
| Sync across devices, saved plans, reminders | 3 | Needs accounts; out of scope |
| Email or shareable link | 3 | Out of scope |
| Answers to the open questions (fees, eligibility, exams, deadlines) | 4 | Needs sourced records; shown as open until then |
| Age-based staleness notice | 2 | Technically easy, but new verification behaviour (D4) |
| Personal fit, chances of admission, recommended option | 5 | No student data and no sound basis. **Will not be built** |
| Salaries or career outcomes | 4/5 | No reliable source; remains stated as missing |

## 10. Technical architecture

**Proposed files (not created):**
- `src/content/actionPlan.ts`: pure functions from selections to entries, questions and steps. No React, no invented values.
- `src/journey/action/ActionStudio.tsx`, `ActionIntro.tsx`, and one file per stage.
- `src/journey/action/actionStore.ts`: step ticks, following the `compareStore` pattern, with ids re-validated on load.

**Required wiring in approved files, needing your approval:**
- `src/app/page.tsx`: mount after `<ComparisonStudio />`.
- `src/journey/layers/DirectionRail.tsx`: add the stop. **Caution:** `RAIL_COMPARE_INDEX` is calculated as `length - 1` and the others from the end too, so all must be updated.
- `src/journey/layers/SceneRailLane.tsx`: observe the new section; review its height offsets.

Scene 4, 5 and 6 components are otherwise untouched. No new dependencies, backend, authentication or analytics. No personal data leaves the browser.

**Rules from the project:** no hex in components, no per-frame React state, no `any`, no `Date.now()` during render, no setState inside effect bodies, strict React Compiler lint.

## 11. Accessibility

- Section with `aria-labelledby`; heading order continues from Scene 6.
- The index is a `<nav>` with `aria-current="location"`.
- Lists are real lists; statuses are words plus a mark, never colour alone.
- WCAG AA by measured contrast on plum, including Champagne small text, using a new `contrast-measure-action.mjs`.
- Visible 2 px cyan focus. Cyan must be measured on plum too.
- Changes such as removal and copy are announced through a polite live region.
- Touch targets at least 44 px. Keyboard reaches everything. Focus is managed on return navigation and after removal.
- Screen-reader testing is still an uncovered gap in the project and should be done here.

## 12. Performance requirements

- 55 to 60 fps through the scene and both transitions, in fresh headed Chrome, 5 runs, medians reported.
- Only `transform`, `opacity` and SVG `pathLength` animate. State changes at boundaries only.
- No regression to the Scenes 4 to 6 measurements. No new heavy assets. Mounting the scene must not re-render earlier scenes (the external store pattern already prevents this).

## 13. Acceptance criteria

1. Empty, partial and full states are all correct and honest.
2. Every entry's label matches its Scene 6 state; a listing-only programme can never appear as Verified.
3. All verified facts show their date. No copy says or implies "current".
4. No fee, duration, eligibility, exam, deadline, salary, outcome, rank or score appears unless it already exists as verified data.
5. Nothing recommends, ranks or orders options by merit. A test scans for such language.
6. Selections from Scenes 4 to 6 appear without reload; removal here updates Scene 6.
7. Return links land correctly on desktop and mobile, with focus handled.
8. Ticks never change a label or a count of verified facts.
9. Works at 1440, 1280, 768, 390, 375, 360 with 0 overflow; mobile uses the separate layout.
10. Reduced motion and no-WebGL have complete, equivalent content.
11. Keyboard, focus, contrast and console checks pass; no hover-only information.
12. Constitution review gate (section 19) passes; the opening differs from Scenes 4 to 6.
13. All existing suites still pass; dataset counts unchanged (17, 18, 10, 12/6); no evidence pipeline change.
14. Lint, TypeScript, build, tokens and `test:evidence` pass.

## 14. What Scene 7 must NOT become

- **A recommendation engine.** No "best for you", match scores, fit or chance of admission.
- **A dashboard.** No progress rings, completion percentages, stat tiles, charts or bento grid.
- **A to-do app or gamified tracker.** No streaks, badges or "you are 60% ready".
- **A lead-capture funnel.** No phone or email requests, and no CTA to a counselling service that does not exist.
- **An eligibility or deadline tool.** No dates, cut-offs or "you qualify".
- **A behaviour tracker.** It must not infer interest from rooms viewed or scrolling.
- **A false-freshness surface.** Never "up to date", "latest" or "live".
- **A restated Scene 6.** It shows questions and actions, not a second comparison table.
- **Decoration.** No gradient header, glow, floating objects, fake testimonials or social proof.

## 15. Risks and unresolved decisions

**Decisions needed**

| # | Decision | Recommendation |
|---|---|---|
| D1 | Should the Scene 4 route (level, specialisation, career) appear? It is the student's clearest intent but lives in private state | **Not in v1.** Avoid touching approved Scene 4; kept courses already carry it. Revisit after review |
| D2 | `sessionStorage` or `localStorage`? | **Keep `sessionStorage`.** Consistent, safer on shared school or family computers. Print and copy cover keeping it |
| D3 | Name in the UI: "Career Action Studio", or "Your route sheet" / "Next steps" | Keep the project name internally; use **"Next steps"** on the rail and heading, as "Action Studio" means little to a student |
| D4 | Add an age-based notice after 180 days? | **Not in Scene 7.** Decide as a site-wide evidence policy |
| D5 | Is the "Always" step's counsellor wording right, given Scene 8 guidance does not exist? | Keep generic: teacher, family or school counsellor. No link to the unavailable callback |
| D6 | Merge the maintenance branch first? | **Yes.** There is no pull request yet, and the primary branch lacks `docs/EVIDENCE_PIPELINE.md`, which this brief relies on. `src/` is unaffected |

**Risks**
- **Thin value with few selections.** Many students will arrive having kept nothing, so the empty state is a primary design, not an edge case.
- **Repetition.** With 3 options, nearly every question is open for all of them. Grouping by question handles this but must be tested at maximum.
- **Keeping is not obvious.** Students may not know that "Add to comparison" is what fills this sheet. The copy must say so; changing earlier scenes is out of scope.
- **Mobile Scene 3 return.** `explore-<domain>` ids exist on the flow presenter (`ExploreFlow.tsx`), but landing and focus there are untested from this new entry point.
- **Plum contrast.** Champagne and silver small text are unmeasured on plum and may need adjusting.
- **Print.** Dark grounds and fixed elements need a dedicated stylesheet; browser coverage is limited.
- **Existing limits apply.** Chrome on Windows only so far; no Safari, Firefox, real-phone or screen-reader coverage.
- **Stale project note.** `CLAUDE.md` still describes Scene 6 as awaiting approval on `integrate/scene-6`; it should be corrected separately.
