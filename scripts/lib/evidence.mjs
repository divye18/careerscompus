/**
 * Pure helpers for the institution evidence pipeline (scripts/verify-institutions.mjs). No network, no file access, so
 * every rule here is unit-tested (scripts/tests/evidence.test.mjs).
 *
 * Principles:
 *  - A claim is kept only if a pattern matches the official page text. Nothing is inferred.
 *  - A programme STATEMENT pattern must match exactly once. More than one match is ambiguous and is rejected and recorded.
 *  - A duration is taken only from its own match, and only when that match is in the same statement as the programme
 *    match (the spans overlap or touch) and the match text itself contains the claimed number of years.
 *  - A page that could not be fetched, or whose text is empty, is a recorded failure, never a "not found".
 *  - Excerpts are exact substrings of the page text that start and end on word boundaries (and, where possible, at
 *    sentence boundaries). They never contain ellipses.
 */

const WORD = /[\p{L}\p{N}]/u;
export const isWordChar = (c) => c !== undefined && c !== '' && WORD.test(c);

/** All matches of `re` (case-insensitive, as the pipeline has always matched) with their positions. */
export function findMatches(text, re) {
  return [...text.matchAll(new RegExp(re, 'gi'))].map((m) => ({ index: m.index, end: m.index + m[0].length, text: m[0] }));
}

/**
 * Is the punctuation at `i` the end of a sentence? A full stop inside an abbreviation ("Ph.D.", "LL.M.", "B.Tech.",
 * "Dr.") is not, and the next word must start like a sentence (capital, digit or opening quote) or the text must end.
 */
export function isSentenceEnd(text, i) {
  const c = text[i];
  if (c !== '.' && c !== '!' && c !== '?') return false;
  let j = i + 1;
  while (j < text.length && /["')\]”’]/.test(text[j])) j++;
  if (j < text.length && !/\s/.test(text[j])) return false;
  while (j < text.length && /\s/.test(text[j])) j++;
  if (j < text.length && !/[A-Z0-9"“'(]/.test(text[j])) return false;
  if (c === '.') {
    const token = /[A-Za-z.]+$/.exec(text.slice(Math.max(0, i - 10), i))?.[0] ?? '';
    if (token.includes('.')) return false; // Ph.D, LL.B, B.Tech
    if (/^[A-Za-z]{1,2}$/.test(token) && /^[A-Z]/.test(token)) return false; // Dr, Mr, St
  }
  return true;
}
/** Start of the sentence containing `pos`, looking back at most `reach` characters; -1 when none is found. */
function sentenceStartBefore(text, pos, reach) {
  const from = Math.max(0, pos - reach);
  let found = -1;
  for (let i = from; i < pos; i++) {
    if (isSentenceEnd(text, i)) {
      let j = i + 1;
      while (j < text.length && /["')\]”’\s]/.test(text[j])) j++;
      if (j <= pos) found = j;
    }
  }
  return found;
}
/** End (exclusive) of the sentence containing `pos`, looking ahead at most `reach` characters; -1 when none is found. */
function sentenceEndAfter(text, pos, reach) {
  const to = Math.min(text.length, pos + reach);
  for (let i = pos; i < to; i++) {
    if (isSentenceEnd(text, i)) {
      let j = i + 1;
      while (j < text.length && /["')\]”’]/.test(text[j])) j++;
      return j;
    }
  }
  return -1;
}

/**
 * Grow [start,end) to whole words, then to the nearest sentence start/end within `context` characters.
 * Returns an exact substring of `text` (no ellipses) plus flags saying whether it starts/ends at a sentence boundary.
 */
export function excerptAround(text, start, end, { context = 90, maxLength = 360, reach = 220 } = {}) {
  let s = Math.max(0, start - context);
  let e = Math.min(text.length, end + context);
  while (s > 0 && isWordChar(text[s - 1]) && isWordChar(text[s])) s--;
  while (e < text.length && isWordChar(text[e - 1]) && isWordChar(text[e])) e++;
  // prefer to start at the beginning of the sentence the claim sits in
  let startsAtSentence = s === 0;
  const ss = reach > 0 ? sentenceStartBefore(text, start, reach) : -1;
  if (ss >= 0) {
    s = ss;
    startsAtSentence = true;
  } else if (reach > 0 && start <= reach) {
    s = 0;
    startsAtSentence = true;
  }
  // prefer to end at the end of that sentence
  let endsAtSentence = e === text.length;
  const se = reach > 0 ? (isSentenceEnd(text, end - 1) ? end : sentenceEndAfter(text, end, reach)) : -1;
  if (se >= 0) {
    e = se;
    endsAtSentence = true;
  }
  let excerpt = text.slice(s, e).trim();
  if (excerpt.length > maxLength) {
    // too long: fall back to the word-bounded window around the claim itself
    s = Math.max(0, start - 70);
    e = Math.min(text.length, end + 70);
    while (s > 0 && isWordChar(text[s - 1]) && isWordChar(text[s])) s--;
    while (e < text.length && isWordChar(text[e - 1]) && isWordChar(text[e])) e++;
    excerpt = text.slice(s, e).trim();
    startsAtSentence = false;
    endsAtSentence = false;
  }
  return { excerpt, startsAtSentence, endsAtSentence };
}

/**
 * Problems with an excerpt. With the page `text` the check is exact (substring, word boundaries); without it
 * (checking stored data) only what can be seen from the excerpt itself is checked.
 */
export function excerptProblems(excerpt, { text, claim } = {}) {
  const p = [];
  if (typeof excerpt !== 'string' || !excerpt.trim()) return ['empty'];
  if (excerpt !== excerpt.trim()) p.push('has leading or trailing whitespace');
  if (/…|\.\.\./.test(excerpt)) p.push('contains an ellipsis');
  if (/�|[\u0000-\u0008\u000B\u000C\u000E-\u001F]/.test(excerpt)) p.push('contains control or replacement characters');
  if (excerpt.length > 420) p.push('too long to be a focused excerpt');
  if (claim && !new RegExp(claim, 'i').test(excerpt)) p.push('does not contain the claim text');
  if (text) {
    const at = text.indexOf(excerpt.trim());
    if (at < 0) p.push('is not an exact substring of the page text');
    else {
      if (at > 0 && isWordChar(text[at - 1]) && isWordChar(excerpt.trim()[0])) p.push('starts mid-word');
      const last = at + excerpt.trim().length;
      if (last < text.length && isWordChar(text[last]) && isWordChar(excerpt.trim().slice(-1))) p.push('ends mid-word');
    }
  } else {
    // stored data: the original page text is not available, so look for the visible signs of a mid-word cut
    if (/^[a-z]{1,2}[,.;:)]/.test(excerpt.trim())) p.push('starts like a cut word fragment');
  }
  return p;
}

const NUMBER_WORDS = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7 };
/** Years stated inside a matched phrase ("4 Years", "five-year", "Two Years"), or null. Never guesses from anything else. */
export function parseYears(phrase) {
  const m = /\b(\d{1,2}|one|two|three|four|five|six|seven)[\s-]*(?:years?|yrs?)\b/i.exec(phrase);
  if (!m) return null;
  const v = /^\d/.test(m[1]) ? Number(m[1]) : NUMBER_WORDS[m[1].toLowerCase()];
  return v ?? null;
}

/** A match that starts inside a longer word on the page ("afour-year" for "a four-year"). Reported, never hidden. */
export function isGluedMatch(text, m) {
  return m.index > 0 && isWordChar(text[m.index - 1]) && isWordChar(text[m.index]);
}

const compact = (s) => s.toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');
/**
 * Does the text name the programme? Compared ignoring case, spaces and punctuation ("B.Tech" = "B. Tech"), as a whole
 * name, never token by token. A different wording on the page must be declared as an alias in the seed.
 * Returns the name or alias that was found, or null.
 */
export function programmeNameIn(text, name, aliases = []) {
  const t = compact(text);
  for (const n of [name, ...aliases]) if (compact(n) && t.includes(compact(n))) return n;
  return null;
}

/** Every number of years a text states ("four-year", "5 Years"), in order. */
export function yearsMentioned(text) {
  return [...text.matchAll(/(\d{1,2}|one|two|three|four|five|six|seven)[\s-]*(?:years?|yrs?)\b/gi)].map((m) => (/^\d/.test(m[1]) ? Number(m[1]) : NUMBER_WORDS[m[1].toLowerCase()]));
}

/** Do two matches belong to the same statement? They overlap, or sit within `gap` characters of each other. */
export function sameStatement(a, b, gap = 30) {
  if (!a || !b) return false;
  if (a.index < b.end && b.index < a.end) return true;
  const d = a.end <= b.index ? b.index - a.end : a.index - b.end;
  return d <= gap;
}

/**
 * Decide what a programme pattern established.
 *   page-unavailable   the official page could not be fetched
 *   empty-page         the page was fetched but has (almost) no text
 *   not-found          the page is fine and the pattern is not on it
 *   ambiguous          a statement pattern matched more than once (rejected)
 *   matched            exactly one match (statement) or at least one (listing)
 */
export function matchProgramme({ page, re, kind = 'statement' }) {
  if (!page || !page.ok) return { status: 'page-unavailable', reason: page?.err || 'unreachable', matches: [] };
  if (!page.text || page.text.trim().length < 200) return { status: 'empty-page', reason: 'the page text is empty or almost empty', matches: [] };
  const matches = findMatches(page.text, re);
  if (!matches.length) return { status: 'not-found', reason: 'pattern not found on the page', matches };
  if (kind === 'statement' && matches.length > 1) return { status: 'ambiguous', reason: `pattern matched ${matches.length} places; a statement must match exactly one`, matches };
  return { status: 'matched', matches };
}

/**
 * Take a duration only from its own pattern, in the same statement as the programme match.
 * Returns { status: 'ok', years, match } or a recorded failure status.
 */
export function associateDuration({ page, programmeMatch, durationRe, years }) {
  if (!page?.ok) return { status: 'page-unavailable', reason: page?.err || 'unreachable' };
  const matches = findMatches(page.text || '', durationRe);
  if (!matches.length) return { status: 'duration-not-found', reason: 'duration pattern not found on the page' };
  if (matches.length > 1) return { status: 'duration-ambiguous', reason: `duration pattern matched ${matches.length} places` };
  const [d] = matches;
  if (!sameStatement(programmeMatch, d)) return { status: 'duration-unassociated', reason: 'the duration match is not in the same statement as the programme match' };
  const stated = parseYears(d.text);
  if (stated === null) return { status: 'duration-not-stated', reason: 'the matched text does not itself state a number of years' };
  if (stated !== years) return { status: 'duration-mismatch', reason: `the matched text states ${stated} years, not ${years}` };
  return { status: 'ok', years: stated, match: d };
}

/** Days between an ISO date and `now`, or null when the date is missing or unreadable. */
export function ageInDays(iso, now = new Date()) {
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return null;
  return Math.floor((now.getTime() - t) / 86400000);
}
/** Stale when the date is missing, unreadable, in the future, or older than `maxDays`. */
export function isStale(iso, { now = new Date(), maxDays = 180 } = {}) {
  const d = ageInDays(iso, now);
  return d === null || d < 0 || d > maxDays;
}

/** Reasons a fact can be missing, each assigned only from a recorded outcome (see the pipeline). */
export const GAP_CATEGORIES = ['not-located', 'source-unavailable', 'source-silent', 'presence-not-established', 'source-ambiguous', 'not-recorded'];
export const gap = (category, detail, urls) => {
  if (!GAP_CATEGORIES.includes(category)) throw new Error(`unknown gap category: ${category}`);
  return urls && urls.length ? { category, detail, urls } : { category, detail };
};
