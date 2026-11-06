// Runs the REAL scripts/verify-institutions.mjs offline: fetch is replaced by fixture pages and the script runs in a temp
// folder with fixture seeds, so no network is used and the repository's data is never read or written.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const SCRIPT = fileURLToPath(new URL('../verify-institutions.mjs', import.meta.url));
const filler = 'General information about the campus and its community of students. '.repeat(6);
const HOME = 'https://fixture.example/';
const ABOUT = 'https://fixture.example/about';
const PROG = 'https://fixture.example/programmes';
const PAGES = {
  [HOME]: `<p>${filler}</p>`,
  [ABOUT]: `<p>First mention. Testville University is in Chennai. It was established in 1950.</p><p>${filler}</p><p>Later mention. Testville University has a Chennai office. Testville University again. Testville College of Engineering teaches engineering.</p><p>${filler}</p>`,
  [PROG]: `<p>The four-year B.Tech programme is offered here.</p><p>${filler}</p>`,
};
const seed = {
  institutions: [{
    id: 'testville', name: 'Testville University', short: 'Testville', website: HOME, city: 'Chennai',
    nameEv: { url: ABOUT, re: 'Testville University' },
    cityEv: { url: ABOUT, re: 'Chennai' },
    type: { value: 'public', url: ABOUT, re: 'First mention' },
    established: { value: 1950, url: ABOUT, re: 'established in 1950' },
    domains: [{ id: 'technology', url: ABOUT, re: 'Testville (University|College of Engineering)' }],
  }],
};
const programmes = { programmes: { testville: [{ name: 'B.Tech', pathway: null, url: PROG, re: String.raw`four-year B\.Tech programme`, duration: { years: 4, re: String.raw`four-year B\.Tech` } }] }, notes: {} };

const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'cc-pipeline-'));
fs.mkdirSync(path.join(dir, 'data/institutions'), { recursive: true });
fs.mkdirSync(path.join(dir, 'src/content'), { recursive: true });
fs.writeFileSync(path.join(dir, 'data/institutions/seed.json'), JSON.stringify(seed));
fs.writeFileSync(path.join(dir, 'data/institutions/programmes.seed.json'), JSON.stringify(programmes));
const LIVE = '{"sentinel":"the live dataset must not be touched by a dry run","institutions":[],"lastVerified":"2026-01-01"}\n';
fs.writeFileSync(path.join(dir, 'src/content/institutions.data.json'), LIVE);
const stub = path.join(dir, 'stub-fetch.mjs');
fs.writeFileSync(stub, `const PAGES = ${JSON.stringify(PAGES)};
globalThis.fetch = async (url) => {
  if (!(url in PAGES)) throw new Error('unexpected network request: ' + url);
  return new Response(PAGES[url], { status: 200 });
};
`);
execFileSync(process.execPath, ['--import', pathToFileURL(stub).href, SCRIPT], { cwd: dir, stdio: 'pipe' });
const read = (f) => JSON.parse(fs.readFileSync(path.join(dir, 'data/institutions/dry-run', f), 'utf8'));
const diag = read('claim-match-diagnostics.json');
const data = read('institutions.data.proposed.json');
const inst = data.institutions[0];
const claim = (field) => diag.find((c) => c.field === field);
const quote = (field) => inst.sources.find((s) => s.field === field).quote;
test.after(() => fs.rmSync(dir, { recursive: true, force: true }));

test('the output records the counts of a pattern with several matches', () => {
  assert.equal(claim('name').count, 3);
  assert.equal(claim('name').shape, 'repeated');
  assert.equal(claim('city').count, 2);
  assert.equal(claim('establishedYear').count, 1);
  assert.equal(claim('establishedYear').shape, 'single');
  const d = claim('academicDomains:technology');
  assert.equal(d.count, 4);
  assert.equal(d.shape, 'varied');
  assert.equal(d.distinctTexts, 2);
  assert.equal(diag.length, 5, 'one record per institution-level claim');
});
test('the human-readable report lists the multi-match claims', () => {
  const report = fs.readFileSync(path.join(dir, 'data/institutions/dry-run/report.md'), 'utf8');
  assert.match(report, /\| testville \| name \| 3 \| repeated \|/);
  assert.match(report, /\| testville \| academicDomains:technology \| 4 \| varied \|/);
});
test('the first match is still the one used, and the diagnostics agree', () => {
  assert.equal(quote('name'), 'Testville University is in Chennai.');
  assert.doesNotMatch(quote('name'), /again|office/);
  assert.match(quote('city'), /is in Chennai/);
  assert.doesNotMatch(quote('city'), /office/);
  assert.equal(claim('name').selectedIndex, 0);
  assert.ok(claim('name').others.every((o) => /Later mention|again/.test(o.around)), 'only the later matches are listed as unused');
});
test('diagnostics change no facts or classifications', () => {
  assert.equal(inst.institutionType, 'public');
  assert.equal(inst.establishedYear, 1950);
  assert.deepEqual(inst.academicDomains, ['technology']);
  assert.equal(inst.availableCourses.length, 1);
  assert.equal(inst.availableCourses[0].evidence, 'statement');
  assert.equal(inst.availableCourses[0].durationYears, 4);
  for (const k of ['count', 'shape', 'others', 'variants', 'selectedIndex']) assert.ok(!(k in inst), `${k} must not enter the dataset`);
  assert.ok(inst.sources.every((s) => Object.keys(s).sort().join() === 'field,quote,url'), 'sources keep their shape');
});
test('a dry run does not touch the live dataset', () => {
  assert.equal(fs.readFileSync(path.join(dir, 'src/content/institutions.data.json'), 'utf8'), LIVE);
});
