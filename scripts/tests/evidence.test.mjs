// Regression tests for the evidence rules. Run: node --test scripts/tests/
import test from 'node:test';
import assert from 'node:assert/strict';
import { isGluedMatch, yearsMentioned, ageInDays, associateDuration, excerptAround, excerptProblems, findMatches, gap, isStale, matchProgramme, parseYears, sameStatement } from '../lib/evidence.mjs';

const filler = (n) => 'Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor. '.repeat(n);
const page = (text) => ({ ok: true, text: filler(4) + text + ' ' + filler(4) });

// ---------- programme patterns: ambiguous, multiple, missing
test('a statement pattern that matches twice is ambiguous and rejected', () => {
  const p = page('5-Year B.A., LL.B. (Hons.) is integrated. 3-Year LL.B. (Hons.) is a postgraduate degree.');
  const r = matchProgramme({ page: p, re: 'LL\\.B\\. \\(Hons\\.\\)', kind: 'statement' });
  assert.equal(r.status, 'ambiguous');
  assert.equal(r.matches.length, 2);
});
test('the NLSIU LL.B. case: the loose pattern is rejected, the statement pattern is accepted', () => {
  const p = page('Undergraduate Programmes 5-Year B.A., LL.B. (Hons.) NLSIU pioneered this. Postgraduate Programmes 3-Year LL.B. (Hons.) The 3-year LLB (Hons) is a postgraduate professional degree programme that is open to graduates.');
  assert.equal(matchProgramme({ page: p, re: 'LL\\.B\\. \\(Hons\\.\\)' }).status, 'ambiguous');
  const ok = matchProgramme({ page: p, re: '3-Year LL\\.B\\. \\(Hons\\.\\) The 3-year LLB \\(Hons\\) is a postgraduate professional degree programme' });
  assert.equal(ok.status, 'matched');
  assert.equal(ok.matches.length, 1);
});
test('a listing may match several times (it only says the programme is named in a list)', () => {
  const p = page('Programmes: B.Pharm. Admissions: B.Pharm. Fees: B.Pharm.');
  assert.equal(matchProgramme({ page: p, re: 'B\\.Pharm', kind: 'listing' }).status, 'matched');
});
test('a pattern that is not on the page is not-found, never matched', () => {
  assert.equal(matchProgramme({ page: page('Nothing relevant here.'), re: 'MBA \\(PGP\\)' }).status, 'not-found');
});

// ---------- empty source and failed fetches are recorded failures, not "not found"
test('a failed official-page fetch is page-unavailable and keeps the error', () => {
  const r = matchProgramme({ page: { ok: false, err: 'UNABLE_TO_VERIFY_LEAF_SIGNATURE' }, re: 'MBA' });
  assert.equal(r.status, 'page-unavailable');
  assert.match(r.reason, /UNABLE_TO_VERIFY_LEAF_SIGNATURE/);
});
test('a missing page object is page-unavailable', () => {
  assert.equal(matchProgramme({ page: undefined, re: 'x' }).status, 'page-unavailable');
});
test('empty or near-empty source content is empty-page, not not-found', () => {
  assert.equal(matchProgramme({ page: { ok: true, text: '' }, re: 'MBA' }).status, 'empty-page');
  assert.equal(matchProgramme({ page: { ok: true, text: '   Loading...   ' }, re: 'MBA' }).status, 'empty-page');
});
test('a duration cannot be associated when the page failed', () => {
  assert.equal(associateDuration({ page: { ok: false, err: 'HTTP 503' }, programmeMatch: { index: 0, end: 5 }, durationRe: '4 years', years: 4 }).status, 'page-unavailable');
});

// ---------- duration association
const stmt = 'The coveted B.Tech (Duration – 4 Years) programme awards an undergraduate degree.';
test('a duration in the same statement is accepted and parsed from its own text', () => {
  const p = page(stmt);
  const pm = matchProgramme({ page: p, re: 'B\\.Tech \\(Duration' }).matches[0];
  const d = associateDuration({ page: p, programmeMatch: pm, durationRe: 'B\\.Tech \\(Duration . 4 Years\\)', years: 4 });
  assert.equal(d.status, 'ok');
  assert.equal(d.years, 4);
});
test('a duration far from the programme match is not associated (incorrect association)', () => {
  const p = page('The MBA programme is offered here. ' + 'Unrelated paragraph text. '.repeat(12) + 'The two-year M.Tech programme is also offered.');
  const pm = matchProgramme({ page: p, re: 'MBA programme' }).matches[0];
  const d = associateDuration({ page: p, programmeMatch: pm, durationRe: 'two-year M\\.Tech', years: 2 });
  assert.equal(d.status, 'duration-unassociated');
});
test('a duration is never inferred from a loosely matched name: the match text must state the number', () => {
  const p = page('The B.Tech programme. B.Tech Duration is described elsewhere.');
  const pm = findMatches(p.text, 'B\\.Tech programme')[0];
  assert.equal(associateDuration({ page: p, programmeMatch: pm, durationRe: 'B\\.Tech Duration', years: 4 }).status, 'duration-not-stated');
});
test('the stated years must equal the claimed years', () => {
  const p = page('The five-year B.Arch degree.');
  const pm = findMatches(p.text, 'B\\.Arch degree')[0];
  assert.equal(associateDuration({ page: p, programmeMatch: pm, durationRe: 'five-year B\\.Arch', years: 4 }).status, 'duration-mismatch');
});
test('a duration pattern that matches twice is ambiguous', () => {
  const p = page('A 2 years course. Another 2 years course.');
  const pm = findMatches(p.text, 'A 2 years course')[0];
  assert.equal(associateDuration({ page: p, programmeMatch: pm, durationRe: '2 years', years: 2 }).status, 'duration-ambiguous');
});
test('a missing duration pattern is duration-not-found', () => {
  const p = page('The MBA programme.');
  assert.equal(associateDuration({ page: p, programmeMatch: findMatches(p.text, 'MBA')[0], durationRe: '2 years', years: 2 }).status, 'duration-not-found');
});
test('parseYears reads digits and number words and nothing else', () => {
  assert.equal(parseYears('4 Years'), 4);
  assert.equal(parseYears('five-year B.Arch'), 5);
  assert.equal(parseYears('Two Years Postgraduate'), 2);
  assert.equal(parseYears('1-Year LL.M.'), 1);
  assert.equal(parseYears('Bachelor of Technology'), null);
  assert.equal(parseYears('2026-27 session'), null);
});
test('sameStatement: overlap or touching, not far apart', () => {
  assert.equal(sameStatement({ index: 0, end: 20 }, { index: 10, end: 30 }), true);
  assert.equal(sameStatement({ index: 0, end: 20 }, { index: 40, end: 50 }), true);
  assert.equal(sameStatement({ index: 0, end: 20 }, { index: 300, end: 320 }), false);
});

// ---------- excerpts
const sample = 'Home About Overview. IIT Delhi is a premier institute for engineering and technology in India. Established as College of Engineering in 1961, the Institute was later declared as an Institute of Eminence. Contact us today.';
test('an excerpt is an exact substring, with no ellipsis, starting and ending on whole words', () => {
  const start = sample.indexOf('1961');
  const x = excerptAround(sample, start, start + 4, { context: 20 });
  assert.ok(sample.includes(x.excerpt));
  assert.deepEqual(excerptProblems(x.excerpt, { text: sample, claim: '1961' }), []);
  assert.ok(!/…|\.\.\./.test(x.excerpt));
});
test('excerpts start at the beginning of the sentence when it is near', () => {
  const start = sample.indexOf('1961');
  const x = excerptAround(sample, start, start + 4, { context: 40 });
  assert.equal(x.startsAtSentence, true);
  assert.ok(x.excerpt.startsWith('Established as College of Engineering'));
  assert.ok(x.excerpt.endsWith('Institute of Eminence.'));
});
test('a window that would start mid-word is grown to the whole word', () => {
  const text = 'The coveted programme awards students an undergraduate degree in engineering and technology across disciplines.';
  const at = text.indexOf('degree');
  const x = excerptAround(text, at, at + 6, { context: 13 });
  assert.deepEqual(excerptProblems(x.excerpt, { text }), []);
});
test('excerpts that begin or end mid-word are reported', () => {
  assert.ok(excerptProblems('ngineering and technology in India.', { text: sample }).includes('starts mid-word') || excerptProblems('ngineering and technology in India.', { text: sample }).includes('is not an exact substring of the page text'));
  assert.ok(excerptProblems('IIT Delhi is a premier institute for engineer', { text: sample }).includes('ends mid-word'));
  const fragment = 'e, engineering and technology in India. Established as College of Engineering in 1961, the Institute was later declared as an';
  assert.ok(excerptProblems(fragment).includes('starts like a cut word fragment'));
});
test('ellipses, whitespace padding, empty and non-substring excerpts are reported', () => {
  assert.ok(excerptProblems('Established in 1961…', { text: sample }).includes('contains an ellipsis'));
  assert.ok(excerptProblems(' Established ', { text: sample }).includes('has leading or trailing whitespace'));
  assert.deepEqual(excerptProblems(''), ['empty']);
  assert.ok(excerptProblems('Founded in 1961 by the government.', { text: sample }).includes('is not an exact substring of the page text'));
  assert.ok(excerptProblems('Established as College of Engineering.', { text: sample, claim: '1961' }).includes('does not contain the claim text'));
});
test('an excerpt that overruns the length limit falls back to a word-bounded window around the claim', () => {
  const long = ('word '.repeat(200) + 'FOUND ' + 'word '.repeat(200)).trim();
  const at = long.indexOf('FOUND');
  const x = excerptAround(long, at, at + 5, { context: 400 });
  assert.ok(x.excerpt.length < 360);
  assert.deepEqual(excerptProblems(x.excerpt, { text: long, claim: 'FOUND' }), []);
});

// ---------- stale verification dates
test('verification dates: fresh, stale, missing, unreadable and future', () => {
  const now = new Date('2027-01-01T00:00:00Z');
  assert.equal(isStale('2026-12-01', { now, maxDays: 180 }), false);
  assert.equal(isStale('2026-01-01', { now, maxDays: 180 }), true);
  assert.equal(isStale(undefined, { now }), true);
  assert.equal(isStale('not a date', { now }), true);
  assert.equal(isStale('2027-06-01', { now }), true, 'a date in the future is not a valid check date');
  assert.equal(ageInDays('2026-12-22', now), 10);
});

// ---------- gap categories
test('only known gap categories can be assigned', () => {
  assert.deepEqual(gap('not-recorded', 'x'), { category: 'not-recorded', detail: 'x' });
  assert.throws(() => gap('probably-fine', 'x'));
});

// ---------- abbreviations are not sentence ends
import { isSentenceEnd } from '../lib/evidence.mjs';
test('abbreviations such as Ph.D., LL.M. and Dr. do not end a sentence', () => {
  const t = 'Two Years Postgraduate Programme (PGP) in Management at IIMA. Academics Ph.D. View All Programme. The one-year LL.M. programme is offered. Dr. Rao teaches.';
  const at = (s) => t.indexOf(s) + s.length - 1;
  assert.equal(isSentenceEnd(t, at('IIMA.')), true);
  assert.equal(isSentenceEnd(t, at('Ph.D.')), false);
  assert.equal(isSentenceEnd(t, at('LL.M.')), false);
  assert.equal(isSentenceEnd(t, at('Dr.')), false);
  assert.equal(isSentenceEnd(t, at('offered.')), true);
});
test('an excerpt runs past an abbreviation to the real end of the sentence', () => {
  const text = 'Intro text. The one-year LL.M. programme provides a blend of core and elective courses. Next sentence here.';
  const at = text.indexOf('LL.M.');
  const x = excerptAround(text, at - 9, at + 5);
  assert.equal(x.excerpt, 'The one-year LL.M. programme provides a blend of core and elective courses.');
});

test('yearsMentioned lists every stated length in order', () => {
  assert.deepEqual(yearsMentioned('a four-year B.Tech degree, a five-year B.Arch degree'), [4, 5]);
  assert.deepEqual(yearsMentioned('Two Years, then 3 yrs'), [2, 3]);
});
test('a match that starts inside a longer word ("afour-year") is detected so it can be reported', () => {
  const text = 'can apply in afour-year B.Tech degree and a five-year B.Arch degree';
  assert.equal(isGluedMatch(text, findMatches(text, 'four-year B\.Tech')[0]), true);
  assert.equal(isGluedMatch(text, findMatches(text, 'five-year B\.Arch')[0]), false);
});
