# Scene 6 (Comparison Studio): Stage A integration and audit

Date: 2026-11-06. Branch `integrate/scene-6` = `redesign/meridian-atlas` (`af6ac9e`) + cherry-pick of `6471554` as `6c754ff`. Nothing has been redesigned.

## Integration
- Backups: tag `backup/scene-6-6471554` and branch `backup/scene-6-comparison-studio-6471554`. `wip/scene-6-comparison-studio` and `master` are untouched; `redesign/meridian-atlas` is still `af6ac9e`.
- The wip branch has one unique commit (`6471554`, 21 source files plus ~145 QA screenshots) on merge base `0f1715b`.
- Three conflicts (`src/app/page.tsx`, `CoursesPathway.tsx`, `UniversityAtlas.tsx`) were resolved by hand: keep this branch's status labels, 11px floor and interim-section flag; keep Scene 6's compare toggles, singular type label and course objects. The Compare teaser is replaced by the studio (`#act-comparison`), so `CompareTeaser.tsx` is now unused.
- Checks on the integrated build: `tsc` clean, ESLint 0 errors (1 warning: unused `sec` in `scripts/compare-perf.mjs`), tokens OK.

## Regressions caused by integration (all small, none fixed yet)
1. `universities-interaction-check` (mobile) expects the plural "Institutes of national importance"; the panel now shows the singular, which is more correct for one institution. Test is stale.
2. `readiness-check` teaser assertions target `#act-comparison`, which is now the studio. Test is obsolete.
3. `stabilisation-probe` fails the 11px floor at every width because of Scene 6 (see below). This is a real finding.

## Findings against the constitution
| Area | Finding |
|---|---|
| Opening | Centred eyebrow, title, paragraph and SVG lines: the same composition as the earlier Scene 4 and 5 openings. Violates "distinct opening" |
| Status labels | Does not use the shared `StatusLabel`. Own three states (verified, unavailable, notApplicable) plus orientation, drawn with text glyphs. No "Partially verified" at cell level (partial lists are explained in a note). Mapping needed: verified, Verified; partial lists, Partially verified; orientation, Orientation; unavailable, Not verified; notApplicable has no shared equivalent (decision needed) |
| Figures | `Figures` unused. "1961" is set in Instrument Serif and reads "l96l". Durations are `figure` rows with the same face |
| Labels | 17 `text-[10px]` labels (state legend, "Optional", row headings) |
| Icons | Text glyphs as state marks and buttons: `✓ ○ ◇ – +` and "✓ Added". Not the SVG family |
| Radius | `rounded-sm`, `-md`, `-lg`, `-[3px]`; no atlas tokens |
| Nested boxes | Bordered option cards and a bordered parameter-chooser panel inside the section container |
| Composition | A conventional 19-row table. For a typical pair, 11 of 19 rows read "Not available for both options", so absence dominates. Needs an editorial rework, for example collapsing unavailable parameters into one "what we cannot tell you yet" list |
| Motion | No infinite animation. Intro is scroll-linked and fully drawn under reduced motion |
| Data | Sourced through the evidence pipeline (URL, quote, check date). 17 institutions, 9 with confirmed courses, 18 programmes. Some evidence patterns are loose (for example "B.Pharm", "MBA Admission") and should be re-reviewed before durations or programmes are relied on. Notes explain disputed years honestly. No fees, ranks, placements or salaries |

## What works
Real `<table>` on wide screens and a separate stacked layout on phones; 0 px overflow at 768/390/375/360 (classic scrollbars); no small touch targets; no console errors; no invented values; "does not pick a winner" statement; differences shown only when two verified values differ.

## Measured (headed Chrome, this machine)
- Scene 6's own suites: desktop 56/56, mobile 55/55, reduced 56/56. Contrast 1129/1129 pairs.
- Scene 6 range 59.9 fps median (p95 16.9 ms, 0 slow frames); Scene 5 to 6 transition 59.0 fps median, 54.4 on a cold run. Pinned stage this run 53.5 median (min 38.2 cold), in line with earlier run-to-run variance.
- Scenes 1 to 5 suites pass (Explore, Courses desktop, Universities desktop). Not re-run here: Courses mobile and reduced, Universities reduced, no-WebGL variants of the Scene 6 suite.
