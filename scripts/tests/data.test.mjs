// Invariants of the generated institution data. Run: node --test scripts/tests/
// Checks src/content/institutions.data.json and, when present, the dry-run output data/institutions/dry-run/institutions.data.proposed.json.
// Older data (no evidenceSchema) is checked for the invariants it can meet; excerpt quality there is reported as a todo until regenerated.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { GAP_CATEGORIES, excerptProblems, isStale, yearsMentioned } from '../lib/evidence.mjs';

const FILES = [process.env.EVIDENCE_DATA, 'src/content/institutions.data.json', 'data/institutions/dry-run/institutions.data.proposed.json'].filter((f, i, a) => f && fs.existsSync(f) && a.indexOf(f) === i);

for (const file of FILES) {
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  const v2 = data.evidenceSchema >= 2;
  const label = `${file} (${v2 ? 'schema 2' : 'schema 1'})`;

  test(`${label}: verification dates are valid, not in the future and not stale`, () => {
    assert.equal(isStale(data.lastVerified, { maxDays: 180 }), false, `top-level date ${data.lastVerified} is stale or invalid`);
    for (const i of data.institutions) assert.equal(isStale(i.lastVerified, { maxDays: 180 }), false, `${i.id}: ${i.lastVerified}`);
  });

  test(`${label}: every programme has a source, and a duration only with its own duration source stating those years`, () => {
    for (const i of data.institutions) {
      for (const c of i.availableCourses) {
        const course = i.sources.find((s) => s.field === `course:${c.id}`);
        assert.ok(course, `${c.id}: no course source`);
        assert.match(course.url, /^https:\/\//, `${c.id}: source is not an https URL`);
        const dur = i.sources.find((s) => s.field === `duration:${c.id}`);
        if (c.durationYears !== null) {
          assert.ok(dur, `${c.id}: duration without a duration source`);
          assert.ok(yearsMentioned(dur.quote).includes(c.durationYears), `${c.id}: the duration quote does not state ${c.durationYears} years`);
          assert.equal(dur.url, course.url, `${c.id}: duration and programme come from different pages`);
        } else {
          assert.equal(dur, undefined, `${c.id}: a duration source exists but no duration is recorded`);
        }
      }
    }
  });

  test(`${label}: no source quote contains an ellipsis or is empty`, () => {
    for (const i of data.institutions) for (const s of i.sources) assert.ok(typeof s.quote === 'string' && s.quote.trim() && !/…|\.\.\./.test(s.quote), `${i.id} ${s.field}`);
  });

  const quotes = data.institutions.flatMap((i) => i.sources.filter((s) => s.field !== 'officialWebsite').map((s) => ({ where: `${i.id} ${s.field}`, quote: s.quote })));
  const bad = quotes.map((q) => ({ ...q, p: excerptProblems(q.quote) })).filter((q) => q.p.length);
  if (v2) {
    test(`${label}: no malformed excerpts (start or end mid-word, whitespace, control characters)`, () => {
      assert.deepEqual(bad.map((b) => `${b.where}: ${b.p.join(', ')}`), []);
    });
  } else {
    test(`${label}: excerpt quality (regenerate with the improved pipeline)`, { todo: bad.length ? `${bad.length} stored excerpt(s) look malformed: ${bad.map((b) => b.where).join(', ')}` : false }, () => {
      assert.deepEqual(bad, []);
    });
  }

  if (v2) {
    test(`${label}: every programme says whether it is a statement or a listing; a listing carries its note and no duration`, () => {
      for (const i of data.institutions) {
        for (const c of i.availableCourses) {
          assert.ok(['statement', 'listing'].includes(c.evidence), `${c.id}: evidence kind missing`);
          if (c.evidence === 'listing') {
            assert.ok(c.evidenceNote && c.evidenceNote.length > 30, `${c.id}: a listing needs a note saying what was reviewed`);
            assert.equal(c.durationYears, null, `${c.id}: a duration must not come from a listing`);
          }
          if (c.durationYears === null) assert.ok(c.durationGap, `${c.id}: a missing duration needs a recorded reason`);
        }
      }
    });
    test(`${label}: every missing fact has a recorded gap with a known category and an explanation`, () => {
      for (const i of data.institutions) {
        if (i.institutionType === null) assert.ok(i.gaps.institutionType, `${i.id}: type gap`);
        if (i.establishedYear === null) assert.ok(i.gaps.establishedYear, `${i.id}: established gap`);
        for (const [field, g] of Object.entries({ ...i.gaps, ...Object.fromEntries(i.availableCourses.filter((c) => c.durationGap).map((c) => [c.id, c.durationGap])) })) {
          assert.ok(GAP_CATEGORIES.includes(g.category), `${i.id} ${field}: unknown category ${g.category}`);
          assert.ok(g.detail && g.detail.length > 15, `${i.id} ${field}: explanation too short`);
        }
      }
    });
    test(`${label}: a gap is never claimed as "not located" without a fetch (no category the pipeline could not have recorded)`, () => {
      for (const i of data.institutions) for (const g of Object.values(i.gaps)) if (g.category === 'not-located') assert.match(g.detail, /fetched/i);
    });
  }
}
test('there is a dataset to test', () => assert.ok(FILES.length >= 1));
