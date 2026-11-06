// Scene 7 logic, against the real dataset. Run: npm run test:action
import test from 'node:test';
import assert from 'node:assert/strict';
import { SCENE_NAME, STANDING_EVIDENCE_NOTE, buildActionPlan, isKnownStepId, planAsText } from '../../src/content/actionPlan.ts';
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
test('verification is one grouped action, with one source per institution and only dataset URLs', () => {
  const p = plan({ institutions: ['iit-madras', 'bits-pilani'], programmes: [STATEMENT, 'iit-madras--mba'] });
  const web = p.steps.filter((s) => s.id === 'check-official');
  assert.equal(web.length, 1);
  assert.deepEqual(web[0].sources.map((x) => x.institutionId), ['iit-madras', 'bits-pilani']);
  assert.equal(web[0].sources[0].href, INSTITUTIONS.find((i) => i.id === 'iit-madras').officialWebsite);
  assert.equal(new Set(web[0].sources[0].questions).size, web[0].sources[0].questions.length);
  assert.ok(!ids(p).some((i) => i.startsWith('check-website')), 'no separate task per institution');
});
test('step ids are unique in every state', () => {
  for (const s of [{}, { courses: [COURSE] }, { programmes: [LISTING] }, FULL]) {
    const list = ids(plan(s));
    assert.equal(new Set(list).size, list.length);
  }
});
test('listings get one grouped check-offered step, naming each programme, with official websites', () => {
  const p = plan({ programmes: [LISTING, 'bits-pilani--b-pharm', 'bits-pilani--b-e-computer-science'] });
  const s = p.steps.filter((x) => x.id === 'check-offered');
  assert.equal(s.length, 1);
  assert.deepEqual(s[0].sources.map((x) => [x.institutionId, x.href]), [['vit-vellore', 'https://vit.ac.in/'], ['bits-pilani', INSTITUTIONS.find((i) => i.id === 'bits-pilani').officialWebsite]]);
  assert.equal(s[0].sources[1].questions.length, 2);
  assert.equal(plan({ programmes: [STATEMENT] }).steps.some((x) => x.id === 'check-offered'), false);
});
test('every step is Orientation, has a known id, and every link is a dataset URL', () => {
  const official = new Set(INSTITUTIONS.map((i) => i.officialWebsite));
  for (const s of plan(FULL).steps) {
    assert.equal(s.status, 'orientation');
    assert.ok(isKnownStepId(s.id), s.id);
    for (const x of s.sources) assert.ok(official.has(x.href), x.href);
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
  for (const bad of ['', 'nope', 'check-website:iit-madras', 'add-another:nope', 3, null, {}]) assert.equal(isKnownStepId(bad), false, String(bad));
  for (const ok of ['talk', 'explore', 'explore-courses', 'add-another:courses', 'check-official', 'check-offered']) assert.equal(isKnownStepId(ok), true, ok);
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
test('grouping loses no gap: every question for a kept place is listed at its institution', () => {
  const p = plan(FULL);
  const web = p.steps.find((s) => s.id === 'check-official');
  const instOf = (i) => (i.mode === 'institutions' ? i.id : PROGRAMMES.find((x) => x.id === i.id).institution.id);
  let checked = 0;
  for (const qn of p.openQuestions.filter((x) => x.id !== 'currently-offered')) {
    for (const item of qn.items.filter((i) => i.mode !== 'courses')) {
      assert.ok(web.sources.find((x) => x.institutionId === instOf(item)).questions.includes(qn.label), qn.label + ' ' + item.id);
      checked++;
    }
  }
  assert.ok(checked > 10);
});
test('the number of steps does not grow with each institution', () => {
  const one = plan({ institutions: ['iit-madras', 'bits-pilani'], courses: [COURSE, COURSES[1].id] }).steps.length;
  const three = plan({ institutions: ['iit-madras', 'bits-pilani', 'nlsiu-bengaluru'], courses: [COURSE, COURSES[1].id] }).steps.length;
  assert.equal(one, three);
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

// ---------- approved clarifications
test('full means at least one course and at least one institution or programme', () => {
  assert.equal(plan({ courses: [COURSE], institutions: ['iit-madras'] }).state, 'full');
  assert.equal(plan({ courses: [COURSE], programmes: [STATEMENT] }).state, 'full');
  assert.equal(plan({ courses: [COURSE] }).state, 'partial');
  assert.equal(plan({ institutions: ['iit-madras'] }).state, 'partial');
  assert.equal(plan({ programmes: [STATEMENT] }).state, 'partial');
  assert.equal(plan({ institutions: ['iit-madras'], programmes: [STATEMENT] }).state, 'partial');
  assert.equal(plan({}).state, 'empty');
});
test('a place kept but no course: suggest courses and pathways, not the career worlds', () => {
  for (const s of [{ institutions: ['iit-madras'] }, { programmes: [STATEMENT] }]) {
    const p = plan(s);
    assert.ok(!ids(p).includes('explore'));
    assert.equal(p.steps[0].id, 'explore-courses');
    assert.equal(p.steps[0].targetId, 'act-courses');
  }
  assert.ok(ids(plan({})).includes('explore'), 'only a truly empty sheet starts at the career worlds');
  assert.ok(!ids(plan({})).includes('explore-courses'));
  assert.ok(!ids(plan(FULL)).includes('explore-courses'));
});
test('the student-facing name is Next Steps, and the internal name stays out of student text', () => {
  assert.equal(SCENE_NAME, 'Next Steps');
  for (const s of [{}, { courses: [COURSE] }, FULL]) assert.doesNotMatch(strings(plan(s)), /Career Action|Action Studio/i);
});

// ---------- source order follows the student's selection
const srcIds = (p, id) => p.steps.find((s) => s.id === id).sources.map((x) => x.institutionId);
test('sources follow the order institutions were kept in, in either direction', () => {
  assert.deepEqual(srcIds(plan({ institutions: ['nlsiu-bengaluru', 'iit-madras', 'bits-pilani'] }), 'check-official'), ['nlsiu-bengaluru', 'iit-madras', 'bits-pilani']);
  assert.deepEqual(srcIds(plan({ institutions: ['bits-pilani', 'iit-madras', 'nlsiu-bengaluru'] }), 'check-official'), ['bits-pilani', 'iit-madras', 'nlsiu-bengaluru']);
});
test('sources stay in selection order when questions are grouped across institutions and programmes', () => {
  const p = plan({ institutions: ['iit-madras', 'nlsiu-bengaluru'], programmes: [LISTING, 'iit-madras--mba', 'bits-pilani--b-pharm'] });
  assert.deepEqual(srcIds(p, 'check-official'), ['iit-madras', 'nlsiu-bengaluru', 'vit-vellore', 'bits-pilani']);
  assert.deepEqual(srcIds(p, 'check-offered'), ['vit-vellore', 'bits-pilani']);
});
test('within an institution, questions keep ledger order', () => {
  const p = plan({ institutions: ['nlsiu-bengaluru'] });
  const ledger = p.openQuestions.map((x) => x.label);
  assert.deepEqual(p.steps.find((s) => s.id === 'check-official').sources[0].questions, ledger);
  assert.notDeepEqual(ledger, [...ledger].sort(), 'this case would not detect sorting otherwise');
});

// ---------- copy as text
test('the copied text keeps labels, dates, links and the evidence note; ticks show only as ticks', () => {
  const p = plan({ programmes: [LISTING, STATEMENT], institutions: ['iit-madras'] });
  const a = planAsText(p, []);
  const b = planAsText(p, ['talk']);
  assert.match(a, /\(listed only\): Partially verified, last checked \d{4}-\d{2}-\d{2}/);
  assert.match(a, /B\.Tech \(at IIT Madras\): Verified/);
  assert.match(a, /IIT Madras: https:\/\/www\.iitm\.ac\.in/);
  assert.ok(a.includes(STANDING_EVIDENCE_NOTE));
  assert.match(b, /\[x\] Talk it through/);
  assert.equal(a.replace('[ ] Talk', '[x] Talk'), b, 'a tick changes nothing else');
  assert.match(planAsText(plan({}), []), /Nothing yet/);
});
