#!/usr/bin/env node
/**
 * READ-ONLY audit of the programme and duration evidence patterns in data/institutions/programmes.seed.json.
 * It fetches each official page (the same way scripts/verify-institutions.mjs does), counts matches, prints the matched
 * text with surrounding context, and flags patterns that are loose. It never writes to the dataset.
 * Usage: node scripts/audit-programme-patterns.mjs [outFile.json]
 */
import fs from 'node:fs';
const UA = { 'user-agent': 'Mozilla/5.0 (CareersCompus evidence audit, read-only)' };
const strip = (h) => h.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/&nbsp;|&#160;/g, ' ').replace(/&amp;/g, '&').replace(/&#8211;/g, '–').replace(/&#8217;/g, '’').replace(/-->/g, ' ').replace(/\s+/g, ' ');
const cache = new Map();
async function page(url) {
  if (cache.has(url)) return cache.get(url);
  let out;
  try {
    const r = await fetch(url, { headers: UA, redirect: 'follow', signal: AbortSignal.timeout(25000) });
    out = r.ok ? { ok: true, text: strip(await r.text()), final: r.url } : { ok: false, err: `HTTP ${r.status}` };
  } catch (e) {
    out = { ok: false, err: String(e.message || e) };
  }
  cache.set(url, out);
  return out;
}
const seed = JSON.parse(fs.readFileSync('data/institutions/programmes.seed.json', 'utf8'));
const data = JSON.parse(fs.readFileSync('src/content/institutions.data.json', 'utf8'));
const stored = new Map(data.institutions.flatMap((i) => i.availableCourses.map((c) => [c.id, { c, i }])));
const slug = (t) => t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
const CTX = 90;

function analyse(text, re) {
  const all = [...text.matchAll(new RegExp(re, 'gi'))];
  const m = all[0];
  if (!m) return { count: 0 };
  const exactCase = new RegExp(re).test(text);
  return { count: all.length, exactCase, first: { before: text.slice(Math.max(0, m.index - CTX), m.index), hit: m[0], after: text.slice(m.index + m[0].length, m.index + m[0].length + CTX) } };
}

const rows = [];
for (const [inst, list] of Object.entries(seed.programmes)) {
  for (const pr of list) {
    const id = `${inst}--${slug(pr.name)}`;
    const p = await page(pr.url);
    const rec = stored.get(id);
    const row = { id, institution: inst, programme: pr.name, url: pr.url, page: p.ok ? 'ok' : p.err, stored: Boolean(rec), storedDuration: rec ? rec.c.durationYears : null, programmeEvidence: null, durationEvidence: null, flags: [] };
    if (p.ok) {
      row.programmeEvidence = { pattern: pr.re, ...analyse(p.text, pr.re) };
      const a = row.programmeEvidence;
      if (a.count === 0) row.flags.push('programme pattern no longer matches the live page');
      if (a.count > 0 && !a.exactCase) row.flags.push('matches only when case is ignored');
      if (a.count > 3) row.flags.push(`programme pattern matches ${a.count} places (could be navigation, news or an unrelated mention)`);
      if (pr.re.replace(/\\/g, '').length < 14) row.flags.push('programme pattern is very short');
      if (a.first && !/(programme|program|course|degree|offer|admission|curricul|duration|years?|bachelor|master|postgraduate|undergraduate|study)/i.test(a.first.before + a.first.after)) row.flags.push('no programme/course/degree wording near the match');
      if (a.first && /(admission|apply|eligib|notice|news|event|circular)/i.test(a.first.before.slice(-50) + a.first.after.slice(0, 50)) && !/(programme|program|course|degree|offered)/i.test(a.first.before.slice(-50) + a.first.after.slice(0, 50))) row.flags.push('match sits in admission/news wording, not clearly a statement that the programme is offered');
    }
    if (pr.duration) {
      if (p.ok) {
        row.durationEvidence = { pattern: pr.duration.re, claimedYears: pr.duration.years, ...analyse(p.text, pr.duration.re) };
        const d = row.durationEvidence;
        if (d.count === 0) row.flags.push('duration pattern no longer matches');
        if (d.count > 1) row.flags.push(`duration pattern matches ${d.count} places`);
        if (d.first && !new RegExp(`\\b(${pr.duration.years}|${['zero', 'one', 'two', 'three', 'four', 'five', 'six'][pr.duration.years]})\\b`, 'i').test(d.first.hit)) row.flags.push('matched text does not itself contain the claimed number of years');
      }
    } else {
      row.flags.push('no duration claim (duration stays unavailable; correct)');
    }
    rows.push(row);
  }
}
const out = process.argv[2];
if (out) fs.writeFileSync(out, JSON.stringify(rows, null, 1));
for (const r of rows) {
  console.log(`\n## ${r.id}  [${r.page}]  stored=${r.stored} duration=${r.storedDuration}`);
  if (r.programmeEvidence?.first) console.log(`  programme /${r.programmeEvidence.pattern}/ x${r.programmeEvidence.count}: …${r.programmeEvidence.first.before}[[${r.programmeEvidence.first.hit}]]${r.programmeEvidence.first.after}…`);
  else if (r.programmeEvidence) console.log(`  programme /${r.programmeEvidence.pattern}/ x0`);
  if (r.durationEvidence?.first) console.log(`  duration  /${r.durationEvidence.pattern}/ x${r.durationEvidence.count} (claims ${r.durationEvidence.claimedYears}y): …${r.durationEvidence.first.before}[[${r.durationEvidence.first.hit}]]${r.durationEvidence.first.after}…`);
  for (const f of r.flags) console.log(`  FLAG: ${f}`);
}
console.log(`\n${rows.length} programmes audited, ${rows.filter((r) => r.flags.some((f) => !f.startsWith('no duration claim'))).length} with at least one flag.`);
