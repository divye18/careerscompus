#!/usr/bin/env node
/**
 * Builds the institution dataset from data/institutions/seed.json and data/institutions/programmes.seed.json by checking
 * every claim against the live official web page. A claim is kept ONLY if its evidence pattern matches the page text;
 * otherwise the field is written as null / omitted and the reason is recorded. An institution is dropped entirely if its
 * name or city cannot be verified. Nothing is ever filled in from memory. The rules live in scripts/lib/evidence.mjs and
 * are unit-tested (node --test scripts/tests/evidence.test.mjs).
 *
 * Usage:
 *   node scripts/verify-institutions.mjs            DRY RUN (default). Needs network. Writes only to data/institutions/dry-run/:
 *                                                   institutions.data.proposed.json and claim-match-diagnostics.json
 *                                                   (both git-ignored), match-log.json, report.md, diff-vs-current.md
 *   node scripts/verify-institutions.mjs --write    ALSO replaces src/content/institutions.data.json and
 *                                                   docs/qa-screenshots/universities/verification-report.md
 *
 * The state is looked up from the verified city in CITY_STATE below: public administrative geography (which Indian
 * state a city lies in), not a claim about the institution.
 *
 * Programme rules (see the header of scripts/lib/evidence.mjs):
 *   kind "statement" (default)  exactly one match, and the excerpt must read as a statement about a programme
 *   kind "listing"              the programme is only named in a menu or list: recorded as partly confirmed
 *   duration                    only from its own pattern, in the same statement as the programme match, stating the years
 * Failed fetches, empty pages, ambiguous matches and unassociated durations are recorded, never silently dropped.
 * Institution-level claims (name, city, type, year, domain) use the FIRST match, as always. How many places each pattern matched
 * is recorded in claim-match-diagnostics.json (diagnostic only: it never changes which match is used, or any fact).
 */
import fs from 'node:fs';
import { associateDuration, excerptAround, excerptProblems, findMatches, gap, isGluedMatch, isStale, matchDiagnostics, matchProgramme, parseYears, programmeNameIn } from './lib/evidence.mjs';

const WRITE = process.argv.includes('--write');
const DRY = 'data/institutions/dry-run';
const CURRENT = 'src/content/institutions.data.json';

const CITY_STATE = {
  'New Delhi': 'Delhi', Delhi: 'Delhi', Mumbai: 'Maharashtra', Chennai: 'Tamil Nadu', Kanpur: 'Uttar Pradesh', Kharagpur: 'West Bengal',
  Guwahati: 'Assam', Bengaluru: 'Karnataka', Pilani: 'Rajasthan', Vellore: 'Tamil Nadu', Varanasi: 'Uttar Pradesh', Bhopal: 'Madhya Pradesh', Ahmedabad: 'Gujarat',
};
const UA = { 'user-agent': 'Mozilla/5.0 (CareersCompus institution data verification; contact via project repository)' };
const strip = (h) => h.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/&nbsp;|&#160;/g, ' ').replace(/&amp;/g, '&').replace(/&#8211;/g, '–').replace(/&#8217;/g, '’').replace(/-->/g, ' ').replace(/\s+/g, ' ');
const cache = new Map();
/** Fetch an official page. TLS certificate errors are NOT bypassed: they are recorded as an unavailable source. */
async function page(url) {
  if (cache.has(url)) return cache.get(url);
  let out = { ok: false, text: '', err: 'unreachable' };
  for (let i = 0; i < 4 && !out.ok; i++) {
    try {
      const r = await fetch(url, { redirect: 'follow', signal: AbortSignal.timeout(25000), headers: UA });
      if (r.status === 200) out = { ok: true, text: strip(await r.text()) };
      else out = { ok: false, text: '', err: `HTTP ${r.status}` };
    } catch (e) {
      out = { ok: false, text: '', err: e.cause?.code || e.message };
    }
    if (!out.ok && /CERT|SIGNATURE|SELF_SIGNED|ISSUER/i.test(out.err)) break; // retrying cannot fix a certificate problem
    if (!out.ok) await new Promise((res) => setTimeout(res, 800));
  }
  cache.set(url, out);
  return out;
}

/** An exact, word-bounded excerpt of the page around a match, validated against the page text. */
function makeExcerpt(text, m, claim) {
  const x = excerptAround(text, m.index, m.end);
  let problems = excerptProblems(x.excerpt, { text, claim });
  if (problems.length) {
    const y = excerptAround(text, m.index, m.end, { context: 60, reach: 0 });
    const p2 = excerptProblems(y.excerpt, { text, claim });
    if (!p2.length) return { excerpt: y.excerpt, problems: [] };
  }
  return { excerpt: x.excerpt, problems };
}

/** A single-value claim (name, city, type, year, domain): the first match, with how many there were. */
async function check(ev) {
  if (!ev) return null;
  const p = await page(ev.url);
  if (!p.ok) return { ok: false, status: 'page-unavailable', why: p.err };
  if (!p.text || p.text.trim().length < 200) return { ok: false, status: 'empty-page', why: 'the page text is empty or almost empty' };
  const ms = findMatches(p.text, ev.re);
  if (!ms.length) return { ok: false, status: 'not-found', why: 'pattern not found' };
  const { excerpt, problems } = makeExcerpt(p.text, ms[0], ev.re); // the FIRST match is always the one used
  if (problems.length) return { ok: false, status: 'bad-excerpt', why: problems.join('; ') };
  return { ok: true, url: ev.url, quote: excerpt, matchCount: ms.length, diag: matchDiagnostics(p.text, ev.re) };
}

/** Diagnostics for institution-level claims (name, city, type, year, domain). Recorded, never used to choose a match. */
const claimLog = [];
async function checkClaim(institution, field, ev) {
  const r = await check(ev);
  if (ev && r?.ok) claimLog.push({ institution, field, url: ev.url, pattern: ev.re, ...r.diag });
  return r;
}

const gapFor = (r, what) =>
  r.status === 'page-unavailable' ? gap('source-unavailable', `The official page could not be fetched when ${what} was checked (${r.why}).`, [])
    : r.status === 'empty-page' ? gap('source-unavailable', `The official page returned no readable text when ${what} was checked.`, [])
      : gap('not-located', `The official page was fetched and the statement of ${what} was not found on it.`, []);

const seed = JSON.parse(fs.readFileSync('data/institutions/seed.json', 'utf8'));
const extra = JSON.parse(fs.readFileSync('data/institutions/programmes.seed.json', 'utf8'));
const slug = (t) => t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
const today = new Date().toISOString().slice(0, 10);
const out = [];
const report = [];
const matchLog = [];
let previous = null;
try { previous = JSON.parse(fs.readFileSync(CURRENT, 'utf8')); } catch { /* first run */ }

for (const s of seed.institutions) {
  const home = await page(s.website);
  const nm = await checkClaim(s.id, 'name', s.nameEv);
  const ct = await checkClaim(s.id, 'city', s.cityEv);
  if (!nm?.ok || !ct?.ok || !home.ok || !CITY_STATE[s.city]) {
    report.push(`| ${s.short} | DROPPED | name:${nm?.ok ? 'ok' : nm?.why} city:${ct?.ok ? 'ok' : ct?.why} website:${home.ok ? 'ok' : home.err} |`);
    continue;
  }
  const sources = [{ field: 'name', url: nm.url, quote: nm.quote }, { field: 'city', url: ct.url, quote: ct.quote }, { field: 'officialWebsite', url: s.website, quote: 'official website reachable' }];
  const rec = { id: s.id, name: s.name, shortName: s.short, slug: s.id, city: s.city, state: CITY_STATE[s.city], country: 'India', officialWebsite: s.website, institutionType: null, establishedYear: null, academicDomains: [], availableCourses: [], coordinates: null, sources, lastVerified: today };
  const gaps = {};
  const miss = [];
  const notes = extra.notes[s.id] ?? {};

  if (s.type) {
    const r = await checkClaim(s.id, 'institutionType', s.type);
    if (r.ok) { rec.institutionType = s.type.value; sources.push({ field: 'institutionType', url: r.url, quote: r.quote }); }
    else { miss.push(`type(${r.why})`); gaps.institutionType = gapFor(r, 'its type'); }
  } else { miss.push('type(no evidence recorded)'); gaps.institutionType = gap('not-recorded', 'No statement of the institution type has been recorded.'); }

  if (s.established) {
    const r = await checkClaim(s.id, 'establishedYear', s.established);
    if (r.ok) { rec.establishedYear = s.established.value; sources.push({ field: 'establishedYear', url: r.url, quote: r.quote }); }
    else { miss.push(`established(${r.why})`); gaps.establishedYear = gapFor(r, 'its founding year'); }
  } else {
    miss.push('established(no unambiguous evidence)');
    gaps.establishedYear = notes.establishedYear ? gap('source-ambiguous', notes.establishedYear) : gap('not-recorded', 'No unambiguous statement of the founding year has been recorded.');
  }

  for (const d of s.domains) {
    const r = await checkClaim(s.id, `academicDomains:${d.id}`, d);
    if (r.ok) { rec.academicDomains.push(d.id); sources.push({ field: `academicDomains:${d.id}`, url: r.url, quote: r.quote }); }
    else { miss.push(`domain ${d.id}(${r.why})`); gaps[`academicDomains:${d.id}`] = gapFor(r, `the ${d.id} domain`); }
  }
  if (!s.domains.length) { miss.push('domains(multi-disciplinary; not verifiable from one phrase)'); gaps.academicDomains = gap('not-recorded', 'This institution is multi-disciplinary; no single statement of its fields was recorded.'); }

  const progs = extra.programmes[s.id] ?? [];
  for (const pr of progs) {
    const id = `${s.id}--${slug(pr.name)}`;
    const kind = pr.kind ?? 'statement';
    const log = { id, kind, url: pr.url, pattern: pr.re };
    matchLog.push(log);
    const pg = await page(pr.url);
    const pm = matchProgramme({ page: pg, re: pr.re, kind });
    log.status = pm.status;
    log.matchCount = pm.matches.length;
    if (pm.status !== 'matched') {
      log.reason = pm.reason;
      if (pm.status === 'ambiguous') log.matches = pm.matches.map((m) => makeExcerpt(pg.text, m, pr.re).excerpt);
      miss.push(`course ${pr.name}(${pm.status}: ${pm.reason})`);
      continue;
    }
    const first = pm.matches[0];
    const { excerpt, problems } = makeExcerpt(pg.text, first, pr.re);
    if (problems.length) { log.status = 'bad-excerpt'; log.reason = problems.join('; '); miss.push(`course ${pr.name}(bad excerpt: ${log.reason})`); continue; }
    if (kind === 'statement' && !/programme|program\b|programs\b|degree|course/i.test(excerpt)) {
      log.status = 'statement-without-programme-wording';
      log.reason = 'a statement must read as being about a programme, degree or course';
      miss.push(`course ${pr.name}(${log.reason})`);
      continue;
    }
    // the evidence must name the programme (or a declared alias); otherwise the link between page and programme is an inference
    const named = programmeNameIn(excerpt, pr.name, pr.aliases ?? []);
    if (!named) {
      log.status = 'programme-name-not-in-evidence';
      log.reason = `neither "${pr.name}" nor a declared alias appears in the evidence text`;
      miss.push(`course ${pr.name}(${log.reason})`);
      continue;
    }
    const c = { id, name: pr.name, pathwayId: pr.pathway, durationYears: null, evidence: kind };
    if (named !== pr.name) c.evidenceNote = `The page names it "${named}"; it is listed here as ${pr.name}.`;
    sources.push({ field: `course:${id}`, url: pr.url, quote: excerpt });
    if (kind === 'listing') {
      c.evidenceNote = [c.evidenceNote, pr.reviewed ?? 'Named in a programme list on the institution\'s pages; no page we checked describes the programme itself.'].filter(Boolean).join(' ');
      c.evidenceNote += ' Listed, not described: we cannot confirm from this that it is currently offered.';
    }
    for (const t of pr.alsoTried ?? []) {
      const tp = await page(t.url);
      const tm = matchProgramme({ page: tp, re: t.re, kind: 'listing' });
      matchLog.push({ id: `${id} (also tried)`, kind: 'listing', url: t.url, pattern: t.re, status: tm.status, matchCount: tm.matches.length, reason: tm.reason });
      if (tm.status !== 'matched') c.evidenceNote += ` Also tried ${t.url}: ${tm.status === 'page-unavailable' ? `source unavailable (${tm.reason})` : tm.status}.`;
    }
    // duration: only from its own pattern, in the same statement, stating the years
    if (pr.duration) {
      const d = associateDuration({ page: pg, programmeMatch: first, durationRe: pr.duration.re, years: pr.duration.years });
      log.duration = d.status;
      if (d.status === 'ok') {
        c.durationYears = d.years;
        if (isGluedMatch(pg.text, d.match)) {
          c.durationNote = `The official page's wording runs the words together ("${(/\S*$/.exec(pg.text.slice(0, d.match.index))[0] + d.match.text).slice(0, 40)}"). The number of years is read from "${d.match.text}".`;
          log.durationWarning = 'duration matched inside a longer word on the page';
        }
        sources.push({ field: `duration:${id}`, url: pr.url, quote: makeExcerpt(pg.text, d.match, pr.duration.re).excerpt });
      } else {
        log.durationReason = d.reason;
        c.durationGap = d.status === 'page-unavailable' ? gap('source-unavailable', `The official page could not be fetched (${d.reason}).`) : d.status === 'duration-not-found' ? gap('not-located', 'The duration was not found on the official page.') : gap('source-ambiguous', `A duration was found but is not tied to this programme statement (${d.reason}).`);
        miss.push(`duration of ${pr.name}(${d.status}: ${d.reason})`);
      }
    } else if (pr.durationNote && matchProgramme({ page: pg, re: pr.durationNote.re, kind: 'statement' }).status === 'matched') {
      // a human-reviewed, pipeline-verified note: the page does state a length elsewhere, but not as a fixed duration
      c.durationGap = gap('not-recorded', pr.durationNote.detail);
      miss.push(`duration of ${pr.name}(page gives a usual duration; not recorded)`);
    } else if (parseYears(excerpt) !== null) {
      c.durationGap = gap('not-recorded', 'The source statement mentions a length of study; it has not been recorded as a verified duration yet.');
      miss.push(`duration of ${pr.name}(mentioned in the statement; not recorded)`);
    } else {
      c.durationGap = gap('source-silent', kind === 'listing' ? 'The programme list we matched does not give a duration.' : 'The programme statement we matched does not give a duration.');
      miss.push(`duration of ${pr.name}(source does not state it)`);
    }
    rec.availableCourses.push(c);
  }
  gaps.availableCourses = progs.length ? gap('not-recorded', 'Only some programmes have been checked, so this list is partial.') : gap('not-recorded', 'No programmes have been checked for this institution yet.');
  miss.push(progs.length ? 'other courses(not yet verified; the list is partial)' : 'courses(not yet verified)');
  rec.notes = notes;
  rec.gaps = gaps;
  out.push(rec);
  report.push(`| ${s.short} | kept | unavailable: ${miss.join('; ')} |`);
}

const data = { generatedBy: 'scripts/verify-institutions.mjs', evidenceSchema: 2, lastVerified: today, institutions: out };

// ---- compare with the dataset currently in the repository
const diff = [];
if (previous) {
  const prevI = new Map(previous.institutions.map((i) => [i.id, i]));
  for (const i of out) {
    const o = prevI.get(i.id);
    if (!o) { diff.push(`- ${i.shortName}: new institution`); continue; }
    const oc = new Map(o.availableCourses.map((c) => [c.id, c]));
    for (const c of i.availableCourses) {
      const before = oc.get(c.id);
      if (!before) diff.push(`- ${i.shortName} / ${c.name}: NEW programme (${c.evidence})`);
      else {
        if (before.durationYears !== c.durationYears) diff.push(`- ${i.shortName} / ${c.name}: duration ${before.durationYears} -> ${c.durationYears}`);
        const bq = o.sources.find((s) => s.field === `course:${c.id}`);
        const aq = i.sources.find((s) => s.field === `course:${c.id}`);
        if (bq?.url !== aq?.url) diff.push(`- ${i.shortName} / ${c.name}: evidence page ${bq?.url} -> ${aq?.url}`);
        if (c.evidence === 'listing') diff.push(`- ${i.shortName} / ${c.name}: now recorded as a LISTING (Partially verified), not a statement`);
      }
    }
    for (const c of o.availableCourses) if (!i.availableCourses.some((x) => x.id === c.id)) diff.push(`- ${i.shortName} / ${c.name}: DROPPED (no longer passes the rules)`);
    for (const f of ['institutionType', 'establishedYear']) if (o[f] !== i[f]) diff.push(`- ${i.shortName}: ${f} ${o[f]} -> ${i[f]}`);
    if (JSON.stringify(o.academicDomains) !== JSON.stringify(i.academicDomains)) diff.push(`- ${i.shortName}: academic domains ${o.academicDomains} -> ${i.academicDomains}`);
  }
  for (const o of previous.institutions) if (!out.some((i) => i.id === o.id)) diff.push(`- ${o.shortName}: DROPPED institution`);
}
const quoteStats = (d) => {
  const q = d.institutions.flatMap((i) => i.sources.filter((s) => s.field !== 'officialWebsite').map((s) => s.quote));
  return { total: q.length, bad: q.filter((x) => excerptProblems(x).length).length };
};
const stale = previous ? isStale(previous.lastVerified) : null;

const reportMd = `# Institution data verification (${today}) ${WRITE ? '' : '(DRY RUN: nothing in src/ was changed)'}\n\nEvery kept claim matched a pattern on the live official page; quotes are exact, word-bounded excerpts. Anything not listed as verified is shown to students as unavailable, with its recorded reason.\n\n| Institution | Result | Notes |\n|---|---|---|\n${report.join('\n')}\n\nKept: ${out.length} of ${seed.institutions.length}\n\n## Programme match log\n\n| Programme | Kind | Status | Matches | Duration |\n|---|---|---|---|---|\n${matchLog.map((l) => `| ${l.id} | ${l.kind} | ${l.status}${l.reason ? ` (${l.reason})` : ''} | ${l.matchCount} | ${l.duration ?? ''}${l.durationReason ? ` (${l.durationReason})` : ''} |`).join('\n')}\n`;
const diffMd = `# Proposed changes versus the dataset in the repository\n\nPrevious data last verified: ${previous?.lastVerified ?? 'none'}${stale ? ' (STALE)' : ''}. Proposed: ${today}.\n\nStored excerpts that look malformed: before ${previous ? quoteStats(previous).bad : 'n/a'} of ${previous ? quoteStats(previous).total : 'n/a'}, after ${quoteStats(data).bad} of ${quoteStats(data).total}.\n\n${diff.length ? diff.join('\n') : '(no differences in programmes, durations, types, years or domains)'}\n`;

fs.mkdirSync(DRY, { recursive: true });
fs.writeFileSync(`${DRY}/institutions.data.proposed.json`, JSON.stringify(data, null, 1) + '\n');
fs.writeFileSync(`${DRY}/match-log.json`, JSON.stringify(matchLog, null, 1) + '\n');
fs.writeFileSync(`${DRY}/claim-match-diagnostics.json`, JSON.stringify(claimLog, null, 1) + '\n');
const multi = claimLog.filter((c) => c.count > 1);
const shapeCount = (shape) => claimLog.filter((c) => c.shape === shape).length;
const claimMd = `\n## Institution-level claim match counts (diagnostic only)\n\nThese claims always use the FIRST match. This section records how many places each pattern matched; it never changes a fact. ${claimLog.length} claims were checked: ${shapeCount('single')} matched once, ${shapeCount('repeated')} matched the same phrase several times (the page simply repeats it), ${shapeCount('varied')} matched different wording (review these).\n\n| Institution | Claim | Matches | Shape | Distinct wordings |\n|---|---|---|---|---|\n${multi.map((c) => `| ${c.institution} | ${c.field} | ${c.count} | ${c.shape} | ${c.variants.join(' / ')} |`).join('\n') || '| (none) | | | | |'}\n`;
fs.writeFileSync(`${DRY}/report.md`, reportMd + claimMd);
fs.writeFileSync(`${DRY}/diff-vs-current.md`, diffMd);
if (WRITE) {
  fs.writeFileSync(CURRENT, JSON.stringify(data, null, 1) + '\n');
  fs.mkdirSync('docs/qa-screenshots/universities', { recursive: true });
  fs.writeFileSync('docs/qa-screenshots/universities/verification-report.md', reportMd);
}
console.log(report.join('\n'));
console.log(`\n${WRITE ? 'WROTE' : 'DRY RUN, wrote only to ' + DRY}: kept ${out.length}/${seed.institutions.length}`);
console.log(diffMd);
