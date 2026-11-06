# Evidence pipeline

How institution and programme facts are checked. Code: `scripts/verify-institutions.mjs`, rules in `scripts/lib/evidence.mjs`, tests in `scripts/tests/`. Why the programme rules exist: `docs/SCENE_6_PATTERN_AUDIT.md`.

## Running it

```bash
node scripts/verify-institutions.mjs
```

This is a dry run and needs network access. It re-checks every claim against the live official pages and writes only to `data/institutions/dry-run/`. Review the output, then apply it:

```bash
node scripts/verify-institutions.mjs --write
```

Then run `npm run test:evidence`.

## Dry-run outputs

| File | Committed? | Purpose |
|---|---|---|
| `institutions.data.proposed.json` | **No, git-ignored** | The dataset the run would write. After `--write` it is a duplicate of `src/content/institutions.data.json`, so it is regenerated, not stored. `scripts/tests/data.test.mjs` also checks it when it is present and skips it when it is not |
| `match-log.json` | Yes | Outcome of every programme pattern |
| `claim-match-diagnostics.json` | Yes | Match counts for institution-level claims (see below) |
| `report.md` | Yes | Readable summary of the run |
| `diff-vs-current.md` | Yes | What the run would change compared with the live dataset |

## Claims that match more than once

Programme statements must match exactly once. Institution-level claims (name, city, type, founding year, domain) do not have that rule: **they use the first match**. The diagnostics record how many places each pattern matched, and they never change which match is used or any fact.

Each claim gets a shape:

- `single`: one match.
- `repeated`: the same phrase several times. The page simply repeats it, for example an institution's own name.
- `varied`: different wordings matched by one pattern. These are worth a look.

Results on 2026-11-06, from 62 claims: 24 single, 36 repeated, 2 varied.

- The 38 multi-match claims are 14 name, 14 city and 10 domain.
- No founding-year or institution-type claim matches more than once.
- The 2 varied claims come from deliberate alternatives in the seed: IIT Delhi's city (`Hauz Khas|New Delhi`) and University of Delhi's name (`Delhi University|University of Delhi`).

A repeated match shows the phrase appears on the page. It does not make the claim stronger, and a generic domain pattern such as `Institute of Technology` rests largely on the institution's own name.

## The 180-day verification rule

**Which date is used.** The `lastVerified` value at the top of the dataset and on each institution. It is the date of the pipeline run that wrote the data, and one run stamps every institution with the same date. Sources have no dates of their own.

**The rule.** `isStale()` in `scripts/lib/evidence.mjs` treats a date as stale if it is missing, unreadable, in the future, or more than 180 days old.

**When evidence goes over 180 days:**

- The data test "verification dates are valid, not in the future and not stale" fails, so `npm run test:evidence` exits non-zero.
- The next pipeline run marks the previous date `(STALE)` in `diff-vs-current.md`.
- Nothing else happens. `npm run build`, lint and TypeScript still pass, and there is no CI in this repository, so the failure appears only when someone runs the tests.

For data checked on 2026-11-06, day 180 is 2027-05-05 and the test first fails on 2027-05-06 (UTC). The test can therefore start failing with no code change.

**What expiry does not do.** It does not change a fact or a status. The application has no date logic: students keep seeing the same values and labels (a Verified fact stays Verified), with the "Last checked" date beside them. Expiry says the check needs repeating, not that the fact is wrong. The site does not warn students about old checks.

**Refreshing.** Run the dry run, review `diff-vs-current.md` and `report.md`, apply with `--write`, then run `npm run test:evidence`. Refreshing re-checks claims against the live pages, so it can change the data: a claim whose evidence has gone is dropped or recorded as missing, with its reason. Do not edit the date by hand.
