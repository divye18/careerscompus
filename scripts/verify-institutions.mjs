#!/usr/bin/env node
/**
 * Builds src/content/institutions.data.json from data/institutions/seed.json by checking every claim against the
 * live official web page. A claim is kept ONLY if its evidence pattern matches the page text; otherwise the field
 * is written as null / omitted and listed in the report. An institution is dropped entirely if its name or city
 * cannot be verified. Nothing is ever filled in from memory.
 *
 * Usage: node scripts/verify-institutions.mjs            (needs network)
 * Writes: src/content/institutions.data.json, docs/qa-screenshots/universities/verification-report.md
 *
 * The state is looked up from the verified city in CITY_STATE below — public administrative geography
 * (which Indian state a city lies in), not a claim about the institution.
 */
import fs from 'node:fs';

const CITY_STATE = {
  'New Delhi': 'Delhi', Delhi: 'Delhi', Mumbai: 'Maharashtra', Chennai: 'Tamil Nadu', Kanpur: 'Uttar Pradesh', Kharagpur: 'West Bengal',
  Guwahati: 'Assam', Bengaluru: 'Karnataka', Pilani: 'Rajasthan', Vellore: 'Tamil Nadu', Varanasi: 'Uttar Pradesh', Bhopal: 'Madhya Pradesh', Ahmedabad: 'Gujarat',
};
const UA = { 'user-agent': 'Mozilla/5.0 (CareersCompus institution data verification; contact via project repository)' };
const strip = (h) => h.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/&nbsp;|&#160;/g, ' ').replace(/&amp;/g, '&').replace(/&#8211;/g, '–').replace(/&#8217;/g, '’').replace(/-->/g, ' ').replace(/\s+/g, ' ');
const cache = new Map();
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
    if (!out.ok) await new Promise((res) => setTimeout(res, 800));
  }
  cache.set(url, out);
  return out;
}
async function check(ev, ctx = 40) {
  if (!ev) return null;
  const p = await page(ev.url);
  if (!p.ok) return { ok: false, why: p.err };
  const m = p.text.match(new RegExp(ev.re, 'i'));
  if (!m) return { ok: false, why: 'pattern not found' };
  const quote = p.text.slice(Math.max(0, m.index - ctx), m.index + m[0].length + ctx).trim();
  return { ok: true, url: ev.url, quote };
}

const seed = JSON.parse(fs.readFileSync('data/institutions/seed.json', 'utf8'));
const extra = JSON.parse(fs.readFileSync('data/institutions/programmes.seed.json', 'utf8'));
const slug = (t) => t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
const today = new Date().toISOString().slice(0, 10);
const out = [];
const report = [];
for (const s of seed.institutions) {
  const home = await page(s.website);
  const nm = await check(s.nameEv);
  const ct = await check(s.cityEv);
  if (!nm?.ok || !ct?.ok || !home.ok || !CITY_STATE[s.city]) {
    report.push(`| ${s.short} | DROPPED | name:${nm?.ok ? 'ok' : nm?.why} city:${ct?.ok ? 'ok' : ct?.why} website:${home.ok ? 'ok' : home.err} |`);
    continue;
  }
  const sources = [{ field: 'name', url: nm.url, quote: nm.quote }, { field: 'city', url: ct.url, quote: ct.quote }, { field: 'officialWebsite', url: s.website, quote: 'official website reachable' }];
  const rec = { id: s.id, name: s.name, shortName: s.short, slug: s.id, city: s.city, state: CITY_STATE[s.city], country: 'India', officialWebsite: s.website, institutionType: null, establishedYear: null, academicDomains: [], availableCourses: [], coordinates: null, sources, lastVerified: today };
  const miss = [];
  if (s.type) { const r = await check(s.type); if (r.ok) { rec.institutionType = s.type.value; sources.push({ field: 'institutionType', url: r.url, quote: r.quote }); } else miss.push(`type(${r.why})`); } else miss.push('type(no evidence found)');
  if (s.established) { const r = await check(s.established); if (r.ok) { rec.establishedYear = s.established.value; sources.push({ field: 'establishedYear', url: r.url, quote: r.quote }); } else miss.push(`established(${r.why})`); } else miss.push('established(no unambiguous evidence)');
  for (const d of s.domains) { const r = await check(d); if (r.ok) { rec.academicDomains.push(d.id); sources.push({ field: `academicDomains:${d.id}`, url: r.url, quote: r.quote }); } else miss.push(`domain ${d.id}(${r.why})`); }
  if (!s.domains.length) miss.push('domains(multi-disciplinary; not verifiable from one phrase)');
  const progs = extra.programmes[s.id] ?? [];
  for (const pr of progs) {
    const r = await check({ url: pr.url, re: pr.re }, 0); // programme quotes are the matched phrase only
    if (!r.ok) { miss.push(`course ${pr.name}(${r.why})`); continue; }
    const id = `${s.id}--${slug(pr.name)}`;
    const c = { id, name: pr.name, pathwayId: pr.pathway, durationYears: null };
    sources.push({ field: `course:${id}`, url: r.url, quote: r.quote });
    if (pr.duration) {
      const d = await check({ url: pr.url, re: pr.duration.re }, 0);
      if (d.ok) { c.durationYears = pr.duration.years; sources.push({ field: `duration:${id}`, url: d.url, quote: d.quote }); } else miss.push(`duration of ${pr.name}(${d.why})`);
    } else miss.push(`duration of ${pr.name}(no evidence found)`);
    rec.availableCourses.push(c);
  }
  miss.push(progs.length ? 'other courses(not yet verified; the list is partial)' : 'courses(not yet verified)');
  rec.notes = extra.notes[s.id] ?? {};
  out.push(rec);
  report.push(`| ${s.short} | kept | unavailable: ${miss.join('; ')} |`);
}
fs.writeFileSync('src/content/institutions.data.json', JSON.stringify({ generatedBy: 'scripts/verify-institutions.mjs', lastVerified: today, institutions: out }, null, 1) + '\n');
fs.mkdirSync('docs/qa-screenshots/universities', { recursive: true });
fs.writeFileSync('docs/qa-screenshots/universities/verification-report.md', `# Institution data verification (${today})\n\nEvery kept claim matched a pattern on the live official page (quotes are stored in \`src/content/institutions.data.json\` under \`sources\`). Anything not listed as verified is shown to students as "Information coming soon".\n\n| Institution | Result | Notes |\n|---|---|---|\n${report.join('\n')}\n\nKept: ${out.length} of ${seed.institutions.length}\n`);
console.log(report.join('\n'));
console.log(`kept ${out.length}/${seed.institutions.length}`);
