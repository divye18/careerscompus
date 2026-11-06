# Audit of programme evidence patterns

Read-only. `node scripts/audit-programme-patterns.mjs [out.json]` re-fetches every official page used in `data/institutions/programmes.seed.json`, counts matches of each pattern, shows the matched text with context and flags loose patterns. It writes nothing to the dataset. Run on 2026-11-06; raw output `docs/qa-screenshots/scene6-review/pattern-audit.json`. **The dataset was not changed and must not be expanded until the items below are resolved.**

All 18 stored programmes still match their live pages (one transient fetch failure for IIT Kharagpur on the first run; a second run and a manual fetch both matched all four of its patterns). Every match is exact-case.

## What the dataset claims
18 programmes at 9 institutions; 10 of them state a duration (4, 2, 2, 2, 4, 5, 5, 3, 1, 2 years). A programme appears in the studio only if its pattern matched; a duration only if its own, separate pattern matched.

## Classification

**A. Sound: the page states the programme and its duration in one sentence (10).**
IIT Madras B.Tech, M.Tech, M.Sc, MBA; IIT Kharagpur B.Tech, B.Arch (one sentence: "a four-year B.Tech … a five-year B.Arch degree"); NLSIU B.A., LL.B. (Hons.); NLSIU LL.B. (Hons.); NLSIU LL.M.; IIM Ahmedabad MBA (PGP). The duration patterns are specific and each contains the number it claims. Two of these have a **loose programme pattern next to a good duration pattern** (see C).

**B. Presence only, evidence is a menu entry or notice (8). Programme is probably offered, but the match does not state it.**

| Programme | Pattern | Matched text and where | Concern |
|---|---|---|---|
| VIT B.Tech | `B\.Tech Admission` | "January Session B.Tech Admission 2027" in an admissions link list; 5 matches | An admissions menu or notice, not a programme description |
| IIT Delhi M.Tech | `admission to M\.Tech\.` | "List of Candidates Selected under SPOT Round for admission to M.Tech. for Civil Engineering…" | A time-limited news notice, not a listing |
| IIT Delhi MBA | `MBA Admission` | A navigation link in the admissions menu | Menu entry; very short |
| BITS B.E. (Computer Science) | `B\.E\.\s?\(Computer Science\)` | In a list of first-degree programmes under the integrated first degree page | Menu-style list; 2 matches |
| BITS B.Pharm | `B\.Pharm` | "B.Pharm.(Pharmacy)" in the same list; 3 matches | Very short, no wording nearby |
| SPA Delhi B.Arch | `Bachelor of Architecture` | "Under-graduate Programs Bachelor of Architecture Bachelor of Planning…" menu; 4 matches | Menu entry |
| IISc Bachelor of Science (Research) | `Bachelor of Science \(Research\)` | "Under-graduate (UG) Programmes Bachelor of Science (Research)…" | Menu entry (reasonable, one match) |
| IISc M.Tech. | `M\.Tech\. and M\.Des\.` | "Post-graduate (PG) Course Programmes M.Tech. and M.Des." | Menu entry; does not say IISc itself awards a standalone M.Tech |

The duration is correctly absent for all eight (no duration stated on the matched page).

**C. Loose programme pattern where the duration pattern is good (3).**
- NLSIU LL.B. (Hons.): `LL\.B\. \(Hons\.\)` also matches the 5-year integrated "B.A., LL.B. (Hons.)" (2 matches, the first is the integrated degree). The 3-year duration pattern is correct, so the stored facts are right, but the programme pattern would pass for the wrong degree.
- NLSIU LL.M.: `LL\.M\.` is 7 characters with 2 matches.
- IIM Ahmedabad MBA (PGP): `Postgraduate Programme \(PGP\)` has 2 matches; the duration pattern is exact.

Also: IIT Madras MBA's programme pattern `MBA: Duration` sits beside admissions wording, but the match is a section heading followed by "The Master of Business Administration (MBA) programme is a two-year, full-time…", so it is sound.

## Evidence-quality issue (all programmes)
Stored quotes are cut at a fixed character count and can start or end mid-word ("e, engineering…"). Tag stripping can also join words ("afour-year B.Tech"). Accurate but untidy.

## Recommendations (none applied)
1. **Tighten the programme pattern to the duration pattern** wherever one exists (C), so one specific sentence supports both facts.
2. **Replace menu and notice evidence (B) with a programme page** (or a stated "programmes offered" list) at the institution, or mark those programmes as **Partially verified** in the programme chooser instead of Verified until then. The simplest honest option is to keep them in the studio with the label "Partially verified: listed on the institution's programme menu" and no duration.
3. **Anchor and lengthen short patterns** (`B\.Pharm`, `LL\.M\.`, `MBA Admission`) so they cannot match unrelated text.
4. **Add an automated guard** to `verify-institutions.mjs`: reject a programme pattern with more than one match unless the matches are identical sentences; reject patterns under about 14 characters; require a programme or degree word within the context; snap excerpts to word boundaries and repair tag-join artefacts.
5. **Date and re-run on a schedule**: all facts say "checked 2026-11-05"; the live pages are not guaranteed to still say this next term.
6. **Do not add institutions or programmes** until 1 to 4 are done and regenerated.

Nothing in this audit says any programme is wrongly listed. It says eight are supported only by menu or notice text, and three have a pattern that could pass for a different degree.
