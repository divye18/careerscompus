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

---

## Resolution (2026-11-06): applied to the dataset with --write

The pipeline, tests and application code are updated, and the dry-run result below was then applied with `node scripts/verify-institutions.mjs --write` after approval (the written data is identical to the dry-run output). The pipeline runs in dry-run mode by default and writes its dry-run result to `data/institutions/dry-run/` (`institutions.data.proposed.json`, `match-log.json`, `report.md`, `diff-vs-current.md`). Applying it means running `node scripts/verify-institutions.mjs --write`, which needs your approval.

### What the pipeline now enforces (`scripts/lib/evidence.mjs`, 28 unit tests)
- A programme *statement* pattern must match exactly once; more matches are **ambiguous** and rejected, and recorded in the match log with every match. A *listing* may match several times but is recorded as only partly confirmed.
- A duration is taken only from its own pattern, only in the same statement as the programme match (the matches overlap or touch), and only if the matched text itself states the claimed years. Nothing is inferred from a programme name.
- Failed fetches (certificate errors are never bypassed), empty pages, not-found, ambiguous, unassociated, mismatched and unstated durations are separate recorded outcomes.
- Excerpts are exact substrings of the page text, grown to whole words and, where a real sentence boundary is near, to the sentence (abbreviations such as "Ph.D." and "LL.M." are not sentence ends). No ellipses. Validators reject mid-word starts or ends, padding, control characters and over-long excerpts.
- Missing facts get a `gap` with a category assigned only from a recorded outcome: `not-located`, `source-unavailable`, `source-silent`, `presence-not-established`, `source-ambiguous`, `not-recorded`. A gap is shown as **Not verified**; it is not a fifth status.

### Class C, resolved in the proposal
| Programme | Before | After |
|---|---|---|
| NLSIU LL.B. (Hons.) | `LL\.B\. \(Hons\.\)`, 2 matches, could pass for the 5-year degree | One statement: "3-Year LL.B. (Hons.) The 3-year LLB (Hons) is a postgraduate professional degree programme", duration from the same statement |
| NLSIU LL.M. | `LL\.M\.`, 2 matches | "1-Year LL.M. The one-year LL.M. programme…", duration from the same statement |
| IIM Ahmedabad MBA (PGP) | 2 matches | "Two Years Postgraduate Programme (PGP) in Management…", duration from the same statement |

### Class B, reviewed
| Programme | Result |
|---|---|
| IIT Delhi M.Tech | **Upgraded to a statement**: "A large number of M.Tech programs are offered by IITD." on `academics.iitd.ac.in/postgraduate-programs/` (replaces a SPOT-round news notice) |
| IISc Bachelor of Science (Research) | **Upgraded to a statement** on the programme's own site (`bs-ug.iisc.ac.in`): "The Bachelor of Science (Research) programme at the Indian Institute of Science (IISc) is…" |
| VIT B.Tech | Stays a **listing** (Partially verified): named in the heading of "VIT UG Courses"; the readable text of VIT's programme pages is navigation and admission notices |
| IIT Delhi MBA | Stays a **listing**: admissions link only. The Department of Management Studies page fails TLS certificate verification and is recorded as source unavailable on every run |
| BITS B.E. (Computer Science), B.Pharm | Stay **listings**: named in the Integrated First Degree list; their own pages repeat the list without a description |
| SPA Delhi B.Arch | Stays a **listing**: menu entry, and the admissions text on the page refers to the 2024-25 session |
| IISc M.Tech | Stays a **listing**: admissions menu entry |

Result: 12 statements (10 before plus 2 upgraded) and 6 listings; 18 programmes, none dropped; no duration added or removed.

### Remaining uncertain records
1. **IIT Kharagpur B.Tech duration (4 years).** The official page's text reads "afour-year B.Tech" (words run together). The pipeline now flags in-word matches and shows that note in the source details; the duration is kept because the matched text states "four-year", but it rests on a page typo.
2. **Six listings** above remain only partly confirmed until a programme page with a statement is found.
3. **Unrecorded durations** that sources mention and we deliberately did not record (this would expand the dataset): IISc B.S. (Research) "four-year" in its statement; IIT Delhi M.Tech "usual duration … 2 yrs" in a separate sentence. Both show as "not recorded" with that explanation.
4. **Nine institutions have no programmes checked**; "Available courses" says so.
5. **IIT Kharagpur's server resets connections intermittently** (one transient failure in earlier runs). The pipeline retries four times; a persistent failure would be recorded as source unavailable.
6. **Excerpts from menu pages include the neighbouring menu words** (exact text, but untidy), for example IISc and VIT.
7. **`reviewed` notes in the seed are human-written** records of what was looked for; only `alsoTried` fetches and `durationNote` patterns are re-checked on every run.
8. **Freshness:** the data tests fail if a verification date is more than 180 days old.
