// Scene 7 logic, against the real dataset. Run: npm run test:action
import test from 'node:test';
import assert from 'node:assert/strict';
import { STANDING_EVIDENCE_NOTE, buildActionPlan, isKnownStepId } from '../../src/content/actionPlan.ts';
import { PROGRAMMES, ledgerRows } from '../../src/content/comparison.ts';
import { INSTITUTIONS } from '../../src/content/institutions.ts';
import { COURSES } from '../../src/content/pathways.ts';

const NONE = { institutions: [], programmes: [], courses: [] };
const plan = (s) => buildActionPlan({ ...NONE, ...s });
const ids = (p) => p.steps.map((s) => s.id);
const q = (list, id) => list.find((x) => x.id === id);
const STATEMENT = 'iit-madras--b-tech';
const LISTING = 'vit-vellore--b-tech';
const COURSE = 'technology-b-tech-b-e';
const FULL = { institutions: ['iit-madras', 'bits-pilani', 'nlsiu-bengaluru'], programmes: [STATEMENT, LISTING, 'iit-kharagpur--b-arch'], courses: [COURSE, COURSES[1].id, COURSES[2].id] };
const strings = (o) => JSON.stringify(o);

// ---------- states
test('empty: nothing kept, no questions, and only the starting steps', () => {
  const p = plan({});
  assert.equal(p.state, 'empty');
  assert.deepEqual(p.kept, { institutions: [], programmes: [], courses: [] });
  assert.deepEqual(p.openQuestions, []);
  assert.deepEqual(p.notApplicable, []);
  assert.deepEqual(ids(p), ['explore', 'talk']);
});
test('an empty or malformed input is handled', () => {
  assert.equal(buildActionPlan({}).state, 'empty');
  assert.equal(plan({ institutions: ['no-such-place', 'no-such-place'], courses: ['nope'] }).state, 'empty');
});
test('partial: only courses', () => {
  const p = plan({ courses: [COURSE] });
  assert.equal(p.state, 'partial');
  assert.deepEqual(ids(p), ['find-institutions', 'add-another:courses', 'talk']);
});
test('partial: only institutions', () => {
  const p = plan({ institutions: ['iit-madras', 'bits-pilani'] });
  assert.equal(p.state, 'partial');
  assert.ok(ids(p).includes('explore'));
  assert.ok(ids(p).includes('compare-programmes'));
  assert.ok(!ids(p).includes('add-another:institutions'), 'two options need no prompt to add another');
});
test('partial: only programmes never asks to compare programmes', () => {
  const p = plan({ programmes: [STATEMENT, 'iit-madras--mba'] });
  assert.equal(p.state, 'partial');
  assert.ok(!ids(p).includes('compare-programmes'));
});
test('full: everything is grouped, and no starting prompts remain', () => {
  const p = plan(FULL);
  assert.equal(p.state, 'full');
  assert.equal(p.kept.institutions.length, 3);
  assert.equal(p.kept.programmes.length, 3);
  assert.equal(p.kept.courses.length, 3);
  for (const s of ['explore', 'find-institutions', 'compare-programmes']) assert.ok(!ids(p).includes(s), s);
  assert.equal(ids(p).at(-1), 'talk');
});
test('selection order is kept: nothing is re-ranked', () => {
  const a = plan({ institutions: ['bits-pilani', 'iit-madras'] }).kept.institutions.map((e) => e.id);
  const b = plan({ institutions: ['iit-madras', 'bits-pilani'] }).kept.institutions.map((e) => e.id);
  assert.deepEqual(a, ['bits-pilani', 'iit-madras']);
  assert.deepEqual(b, ['iit-madras', 'bits-pilani']);
});

// ---------- evidence states
test('every listing-only programme is Partially verified, every statement is Verified', () => {
  const r = PROGRAMMES.map((x) => ({ x, e: plan({ programmes: [x.id] }).kept.programmes[0] }));
  assert.equal(r.filter(({ e }) => e.status === 'verified').length, 12);
  assert.equal(r.filter(({ e }) => e.status === 'partial').length, 6);
  for (const { x, e } of r) {
    assert.equal(e.status, x.course.evidence === 'statement' ? 'verified' : 'partial', x.id);
    assert.equal(e.listedOnly, x.course.evidence === 'listing', x.id);
  }
});
test('a listing carries its recorded note; a statement has none', () => {
  assert.match(plan({ programmes: [LISTING] }).kept.programmes[0].note, /Listed, not described/);
  assert.equal(plan({ programmes: [STATEMENT] }).kept.programmes[0].note, null);
});
test('an institution has no overall status but keeps its check date', () => {
  const e = plan({ institutions: ['iit-madras'] }).kept.institutions[0];
  assert.equal(e.status, null);
  assert.equal(e.lastVerified, INSTITUTIONS.find((i) => i.id === 'iit-madras').lastVerified);
});
test('a course is always Orientation and has no check date', () => {
  for (const c of COURSES) {
    const e = plan({ courses: [c.id] }).kept.courses[0];
    assert.equal(e.status, 'orientation', c.id);
    assert.equal(e.lastVerified, null, c.id);
  }
});

// ---------- questions
test('questions are grouped by question, naming each option', () => {
  const p = plan({ institutions: ['iit-madras', 'bits-pilani'] });
  assert.deepEqual(q(p.openQuestions, 'accreditation').items.map((i) => i.id), ['iit-madras', 'bits-pilani']);
  assert.equal(p.openQuestions.filter((x) => x.id === 'accreditation').length, 1);
});
test('only the option that lacks a fact is listed', () => {
  const p = plan({ institutions: ['iit-delhi', 'iit-madras'] });
  assert.deepEqual(q(p.openQuestions, 'established').items.map((i) => i.id), ['iit-madras']);
});
test('unknown and not applicable stay separate, even for the same parameter', () => {
  const p = plan({ institutions: ['iit-madras'], programmes: [STATEMENT] });
  assert.deepEqual(q(p.openQuestions, 'tuition').items.map((i) => i.mode), ['programmes']);
  assert.deepEqual(q(p.notApplicable, 'tuition').items.map((i) => i.mode), ['institutions']);
});
test('every question and reason matches the ledger: nothing is added or lost', () => {
  for (const [mode, list] of Object.entries(FULL)) {
    for (const row of ledgerRows(mode, list)) {
      row.cells.forEach((cell, n) => {
        const p = plan(FULL);
        const bucket = cell.state === 'unavailable' ? p.openQuestions : cell.state === 'notApplicable' ? p.notApplicable : null;
        const hit = bucket && q(bucket, row.id)?.items.find((i) => i.mode === mode && i.id === list[n]);
        if (bucket) assert.equal(hit?.reason, cell.reason, `${mode} ${row.id}`);
      });
    }
  }
});
test('recorded reasons are used, not a generic sentence', () => {
  const p = plan({ institutions: ['nlsiu-bengaluru'] });
  assert.match(q(p.openQuestions, 'established').items[0].reason, /1986 and 1988/);
});
test('a listing-only programme adds a question of its own, first; a statement does not', () => {
  assert.equal(plan({ programmes: [LISTING] }).openQuestions[0].id, 'currently-offered');
  assert.equal(q(plan({ programmes: [STATEMENT] }).openQuestions, 'currently-offered'), undefined);
});

// ---------- steps
test('website steps are deduplicated per institution and use only the dataset URL', () => {
  const p = plan({ institutions: ['iit-madras'], programmes: [STATEMENT, 'iit-madras--mba'] });
  const web = p.steps.filter((s) => s.id.startsWith('check-website:'));
  assert.equal(web.length, 1);
  assert.equal(web[0].href, INSTITUTIONS.find((i) => i.id === 'iit-madras').officialWebsite);
  assert.ok(web[0].questions.length > 0);
  assert.equal(new Set(web[0].questions).size, web[0].questions.length);
});
test('step ids are unique in every state', () => {
  for (const s of [{}, { courses: [COURSE] }, { programmes: [LISTING] }, FULL]) {
    const list = ids(plan(s));
    assert.equal(new Set(list).size, list.length);
  }
});
test('a listing gets a check-offered step with its official website', () => {
  const s = plan({ programmes: [LISTING] }).steps.find((x) => x.id === `check-offered:${LISTING}`);
  assert.equal(s.href, 'https://vit.ac.in/');
  assert.equal(plan({ programmes: [STATEMENT] }).steps.some((x) => x.id.startsWith('check-offered')), false);
});
test('every step is Orientation, has a known id, and every link is a dataset URL', () => {
  const official = new Set(INSTITUTIONS.map((i) => i.officialWebsite));
  for (const s of plan(FULL).steps) {
    assert.equal(s.status, 'orientation');
    assert.ok(isKnownStepId(s.id), s.id);
    if (s.href) assert.ok(official.has(s.href), s.href);
  }
});
test('steps do not depend on the order options were kept in, except by naming them', () => {
  const a = ids(plan({ institutions: ['iit-madras', 'bits-pilani'] })).sort();
  const b = ids(plan({ institutions: ['bits-pilani', 'iit-madras'] })).sort();
  assert.deepEqual(a, b);
});

// ---------- honesty
const BANNED = /\b(best|top|recommended|recommend|ideal|perfect|winner|match(ed)? score|you qualify|eligible for|apply now|deadline|guaranteed|up to date|latest|ranked)\b|₹|\bLPA\b|\d+\s*%/i;
test('steps and kept entries contain no recommendation, ranking, money, deadline or freshness wording', () => {
  for (const s of [{}, { courses: [COURSE] }, FULL]) {
    const p = plan(s);
    assert.doesNotMatch(strings(p.steps), BANNED);
    assert.doesNotMatch(strings(p.kept).replace(/"note":"[^"]*"/g, ''), BANNED);
  }
  assert.doesNotMatch(STANDING_EVIDENCE_NOTE, BANNED);
});
test('the function is pure: same input, same output, input untouched', () => {
  const input = structuredClone(FULL);
  assert.deepEqual(plan(input), plan(input));
  assert.deepEqual(input, FULL);
});
test('isKnownStepId rejects anything the plan could not produce', () => {
  for (const bad of ['', 'nope', 'check-website:nope', 'check-offered:iit-madras', 'add-another:nope', 3, null, {}]) assert.equal(isKnownStepId(bad), false, String(bad));
  for (const ok of ['talk', 'explore', 'add-another:courses', 'check-website:iit-madras', `check-offered:${LISTING}`]) assert.equal(isKnownStepId(ok), true, ok);
});

// ---------- groups, maximum selections, removed ids
test('steps run Explore, then Verify, then Discuss, in every state', () => {
  const rank = { explore: 0, verify: 1, discuss: 2 };
  for (const s of [{}, { courses: [COURSE] }, { institutions: ['iit-madras'] }, { programmes: [LISTING] }, FULL]) {
    const order = plan(s).steps.map((x) => rank[x.group]);
    assert.deepEqual(order, [...order].sort((a, b) => a - b));
  }
  assert.equal(plan({}).steps.find((x) => x.id === 'talk').group, 'discuss');
  assert.equal(plan({ programmes: [LISTING] }).steps.find((x) => x.id.startsWith('check-offered')).group, 'verify');
});
test('deduplicated website steps keep every distinct information gap', () => {
  const p = plan({ institutions: ['iit-madras'], programmes: [STATEMENT] });
  const web = p.steps.filter((s) => s.id === 'check-website:iit-madras');
  assert.equal(web.length, 1);
  const expected = p.openQuestions.filter((x) => x.items.some((i) => i.id === 'iit-madras' || i.id === STATEMENT) && x.id !== 'currently-offered').map((x) => x.label);
  assert.deepEqual(web[0].questions, expected);
});
test('maximum selections (three of each) stay complete', () => {
  const p = plan(FULL);
  for (const qn of p.openQuestions) assert.ok(qn.items.length <= 9 && qn.items.length > 0, qn.id);
  const everyOption = p.openQuestions.flatMap((x) => x.items.map((i) => i.id));
  for (const id of [...FULL.institutions, ...FULL.programmes, ...FULL.courses]) assert.ok(everyOption.includes(id), id);
});
test('removed or invalid stored ids are dropped, and valid ones keep their cells aligned', () => {
  const p = plan({ institutions: ['gone', 'iit-delhi', 'iit-delhi', 'also-gone', 'iit-madras'] });
  assert.deepEqual(p.kept.institutions.map((e) => e.id), ['iit-delhi', 'iit-madras']);
  assert.deepEqual(q(p.openQuestions, 'established').items.map((i) => i.id), ['iit-madras']);
  assert.ok(!strings(p).includes('gone'));
});
test('the empty state offers somewhere to start and assumes nothing about the student', () => {
  const p = plan({});
  assert.ok(p.steps[0].targetId);
  assert.doesNotMatch(strings(p), /your (marks|score|interest|profile|stream)|based on you/i);
});
