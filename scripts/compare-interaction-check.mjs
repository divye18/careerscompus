#!/usr/bin/env node
/**
 * Scene 6 interaction / accessibility / data-integrity checks, real Chrome.
 * Usage: node scripts/compare-interaction-check.mjs [url] [mode: desktop|mobile|reduced|nowebgl]
 */
import { chromium } from 'playwright-core';
import fs from 'node:fs';
const URL = process.argv[2] || 'http://localhost:3100';
const MODE = process.argv[3] || 'desktop';
const mobile = MODE === 'mobile';
let pass = 0, fail = 0;
const ok = (name, cond, info = '') => { if (cond) pass++; else fail++; console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}${info ? ' — ' + info : ''}`); };

const data = JSON.parse(fs.readFileSync('src/content/institutions.data.json', 'utf8'));
const programmeCount = data.institutions.flatMap((i) => i.availableCourses).length;

const b = await chromium.launch({ channel: 'chrome', headless: false, args: MODE === 'nowebgl' ? ['--disable-webgl', '--disable-webgl2', '--disable-3d-apis'] : [] });
const ctx = await b.newContext({ viewport: mobile ? { width: 390, height: 844 } : { width: 1440, height: 900 }, reducedMotion: MODE === 'reduced' ? 'reduce' : 'no-preference', ...(mobile ? { hasTouch: true, isMobile: true, deviceScaleFactor: 2 } : {}) });
const p = await ctx.newPage();
const errors = [];
p.on('pageerror', (e) => errors.push(String(e)));
p.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
await p.goto(URL, { waitUntil: 'networkidle' });
await p.waitForTimeout(1500);

const ws = p.locator('#studio-workspace');
const toStudio = async () => { await p.evaluate(() => document.getElementById('studio-workspace').scrollIntoView({ block: 'start', behavior: 'instant' })); await p.waitForTimeout(250); };
const view = (name) => ws.getByRole('button', { name, exact: true });
const modeBtn = (name) => ws.locator('ul[aria-labelledby="studio-mode"]').getByRole('button', { name: new RegExp(`^${name}`) });
const add = async (noun, id) => {
  await ws.getByRole('button', { name: new RegExp(`Add ${noun}`) }).first().click();
  await ws.locator(`button[data-option="${id}"]`).click();
  await p.waitForTimeout(150);
};
/** rows of the ledger actually displayed: [{ id, differs, text, cells: [{ state, text, marked }] }] */
const rows = () => p.evaluate(() => [...document.querySelectorAll('#studio-workspace [data-row]')].filter((r) => r.getBoundingClientRect().height > 0).map((r) => ({
  id: r.dataset.row,
  differs: r.dataset.differs === 'true',
  text: r.innerText,
  cells: [...r.querySelectorAll('[data-state]')].map((c) => {
    const cs = getComputedStyle(c);
    return { state: c.dataset.state, text: c.innerText, marked: cs.borderLeftColor === 'rgb(53, 230, 230)' };
  }),
})));
const row = async (id) => (await rows()).find((r) => r.id === id);

await toStudio();

// ---- empty
let txt = await ws.innerText();
ok('empty comparison explains itself and shows no ledger', /Your ledger is empty/.test(txt) && (await rows()).length === 0);
ok('Reset is disabled when there is nothing to reset', await ws.getByRole('button', { name: 'Reset comparison' }).isDisabled());
await view('Differences only').click();
ok('no rows or numbers invented while empty', (await rows()).length === 0);
await view('All parameters').click();

// ---- picker by keyboard
const firstAdd = ws.getByRole('button', { name: /Add institution/ }).first();
await firstAdd.focus();
await p.keyboard.press('Enter');
await p.waitForTimeout(200);
ok('opening the chooser moves focus into it', await p.evaluate(() => Boolean(document.activeElement?.dataset?.option)));
await p.keyboard.press('Escape');
await p.waitForTimeout(200);
ok('Escape closes the chooser and returns focus to the slot', (await ws.locator('button[data-option]').count()) === 0 && (await p.evaluate(() => document.activeElement?.dataset?.slot === '0')));
await p.keyboard.press('Enter');
await p.waitForTimeout(200);
await ws.locator('button[data-option="iit-delhi"]').focus();
await p.keyboard.press('Enter');
await p.waitForTimeout(200);
txt = await ws.innerText();
ok('keyboard adds an institution', /IIT Delhi/.test(txt) && (await rows()).length > 0);
ok('one option asks for another instead of comparing', /Add at least one more institution/.test(txt));
await view('Differences only').click();
ok('differences with one option: says to add another', /Add another option to see differences/.test(await ws.innerText()));
await view('All parameters').click();

// ---- two options; missing is not a difference and not zero
await add('institution', 'iit-madras');
let r = await row('established');
ok('two-institution comparison works', r.cells.length === 2);
ok('verified value and missing value sit side by side', r.cells[0].state === 'verified' && /1961/.test(r.cells[0].text) && r.cells[1].state === 'unavailable' && /not verified/i.test(r.cells[1].text));
ok('one verified + one missing is NOT a difference', r.differs === false && !r.cells.some((c) => c.marked));
ok('the reason for a missing value is shown', /Not confirmed on the official pages/.test(r.cells[1].text));
if (!mobile) {
  const sem = await p.evaluate(() => { const t = [...document.querySelectorAll('#studio-workspace table')][0]; return { caption: !!t.querySelector('caption'), cols: t.querySelectorAll('thead th[scope="col"]').length, rowHeads: t.querySelectorAll('tbody th[scope="row"]').length, groups: t.querySelectorAll('th[scope="rowgroup"]').length }; });
  ok('real table semantics: caption, column, row and group headers', sem.caption && sem.cols === 3 && sem.rowHeads >= 6 && sem.groups >= 2, JSON.stringify(sem));
  const sticky = await p.evaluate(() => getComputedStyle(document.querySelector('#studio-workspace thead th')).position);
  ok('column names stay visible while scrolling (sticky)', sticky === 'sticky');
} else {
  const labels = await p.evaluate(() => [...document.querySelectorAll('#studio-workspace [data-row] h4')].filter((h) => h.getBoundingClientRect().height > 0).length);
  ok('phones: each parameter keeps its label', labels >= 6, `${labels} labels`);
  const named = await p.evaluate(() => [...document.querySelectorAll('#studio-workspace dl [data-state] dt')].filter((h) => h.getBoundingClientRect().height > 0).length);
  ok('phones: each value is named by its option', named >= 2);
}

// ---- nothing presented as zero, no scores
const all = await rows();
const zeros = all.flatMap((x) => x.cells).filter((c) => /^\s*(0|₹\s*0|0\s*%|0\s*years?)\b/i.test(c.text));
ok('missing information is never presented as zero', zeros.length === 0, zeros.map((c) => c.text.slice(0, 20)).join('|'));
const ledgerText = all.map((x) => x.text).join(' ');
const banned = ledgerText.match(/\bscore|\branked|\branking|\bwinner|\bbest\b|₹|\bLPA\b|\d+\s*%|\bNIRF\b|\bNAAC\b|\bJEE\b|\bNEET\b|\bGATE\b|\bCLAT\b/i);
ok('no scores, rankings, fees, percentages or exam names in the ledger', !banned, banned ? `found "${banned[0]}"` : '');

// ---- three states are distinct
r = await row('tuition');
ok('Not applicable is distinct, with a reason, and listed apart from the table', /per programme/.test(r.text) && !/not verified/i.test(r.text) && r.cells.length === 0 && /Not applicable to this kind of comparison/i.test(await ws.innerText()));
r = await row('accreditation');
ok('Not verified parameters are listed with a reason, not as empty table rows', /accrediting body/.test(r.text) && r.cells.length === 0 && /What we cannot tell you yet/.test(await ws.innerText()));

// ---- evidence
const est = ws.locator('[data-row="established"]:visible [data-state="verified"]').first();
await est.locator('summary').click();
await p.waitForTimeout(150);
const ev = await est.innerText();
const evLink = est.locator('a').first();
ok('a verified value opens its source, quote and last-checked date', /Established as College of Engineering in 1961/.test(ev) && /Last checked \d{4}-\d{2}-\d{2}/i.test(ev) && (await evLink.getAttribute('target')) === '_blank' && /noopener/.test((await evLink.getAttribute('rel')) || ''), ev.replace(/\s+/g, ' ').slice(0, 90));
await est.locator('summary').click();
const site = ws.locator('[data-row="website"]:visible a').first();
ok('official website is a safe external link', (await site.getAttribute('href')) === 'https://home.iitd.ac.in/' && (await site.getAttribute('target')) === '_blank');

// ---- differences
await view('Differences only').click();
await p.waitForTimeout(150);
let ids = (await rows()).map((x) => x.id);
ok('differences only: real verified differences, no missing-value rows', ids.includes('location') && ids.includes('region') && !ids.includes('established') && !ids.includes('type') && !ids.includes('accreditation'), ids.join(','));
ok('every shown cell in differences mode is verified and marked in cyan', (await rows()).every((x) => x.differs && x.cells.every((c) => c.state === 'verified' && c.marked)));
await view('All parameters').click();

// ---- three columns; replace; partial lists
await add('institution', 'iit-kanpur');
r = await row('established');
ok('three-institution comparison works', r.cells.length === 3);
ok('three columns: 1961 vs 1959 differ, the missing one is not marked', r.differs && r.cells[0].marked && !r.cells[1].marked && r.cells[1].state === 'unavailable' && r.cells[2].marked);
ok('no fourth option can be added', (await ws.getByRole('button', { name: /Add institution/ }).count()) === 0);
await ws.getByRole('button', { name: 'Replace IIT Kanpur' }).click();
await p.waitForTimeout(150);
ok('options already compared are disabled in the chooser', await ws.locator('button[data-option="iit-delhi"]').isDisabled());
await ws.locator('button[data-option="bits-pilani"]').click();
await p.waitForTimeout(200);
txt = await ws.innerText();
ok('replace swaps the option', /BITS Pilani/.test(txt) && !/IIT Kanpur/.test(txt));
r = await row('domains');
ok('partial lists never count as a difference', r.differs === false && /Technology, Science/.test(r.text));
ok('deemed vs national importance is a real, marked difference', (await row('type')).differs === true);
await ws.getByRole('button', { name: 'Remove IIT Madras' }).click();
await p.waitForTimeout(150);
ok('remove leaves a working two-column comparison', (await row('established')).cells.length === 2);

// ---- views + parameter chooser
await view('Verified parameters').click();
await p.waitForTimeout(150);
ids = (await rows()).map((x) => x.id);
ok('verified view keeps only parameters with a verified value', ids.includes('location') && !ids.includes('accreditation') && !ids.includes('tuition'), ids.join(','));
await view('All parameters').click();
await ws.getByRole('button', { name: /^Choose parameters/ }).click();
await p.waitForTimeout(150);
await ws.locator('#studio-params').getByRole('button', { name: 'Established', exact: true }).click();
await p.waitForTimeout(100);
ok('a parameter can be switched off', !(await rows()).some((x) => x.id === 'established') && /18\/19/.test(await ws.getByRole('button', { name: /^Choose parameters/ }).innerText()));
await ws.locator('#studio-params').getByRole('button', { name: /Hide all Outcomes/ }).click();
await p.waitForTimeout(100);
ok('a whole group can be switched off', !(await rows()).some((x) => x.id === 'salary'));
await ws.locator('#studio-params').getByRole('button', { name: /Show all Outcomes/ }).click();
await ws.locator('#studio-params').getByRole('button', { name: 'Established', exact: true }).click();
await ws.getByRole('button', { name: /^Choose parameters/ }).click();

// ---- focus ring
await ws.getByRole('button', { name: 'Reset comparison' }).focus();
await p.keyboard.press('Shift+Tab');
await p.keyboard.press('Tab');
await p.waitForTimeout(400);
const ring = await p.evaluate(() => { const cs = getComputedStyle(document.activeElement); return `${cs.outlineStyle} ${cs.outlineWidth} ${cs.outlineColor}`; });
ok('keyboard focus shows a visible cyan ring', /solid 2px rgb\(53, 230, 230\)/.test(ring), ring);

// ---- programmes: only verified pairs exist
await modeBtn('Programmes').click();
await p.waitForTimeout(150);
await ws.getByRole('button', { name: /Add programme/ }).first().click();
await p.waitForTimeout(150);
const offered = await ws.locator('button[data-option]').count();
ok('programme chooser offers only verified institution + course pairs', offered === programmeCount, `${offered}/${programmeCount}`);
await ws.locator('button[data-option="iit-madras--b-tech"]').click();
await p.waitForTimeout(150);
await add('programme', 'iit-kharagpur--b-tech');
r = await row('duration');
ok('same duration on two verified programmes is not a difference', r.differs === false && r.cells.every((c) => c.state === 'verified' && /4 years/.test(c.text)));
await add('programme', 'vit-vellore--b-tech');
r = await row('duration');
ok('unstated duration stays Not verified, not a difference', r.differs === false && r.cells[2].state === 'unavailable' && /does not state/.test(r.cells[2].text));
await ws.getByRole('button', { name: 'Replace B.Tech' }).last().click();
await p.waitForTimeout(150);
await ws.locator('button[data-option="iit-kharagpur--b-arch"]').click();
await p.waitForTimeout(150);
r = await row('duration');
ok('4 years vs 5 years is a verified difference', r.differs === true);
ok('unlike programmes are flagged, not hidden', /different kinds of programme/.test(await ws.innerText()));
r = await row('tuition');
ok('programme fees stay Not available rather than empty or zero', /not verified/i.test(r.text + (await ws.innerText())));

// ---- Scene 4 → comparison
await p.evaluate(() => document.getElementById('pw-direction').scrollIntoView({ block: 'start', behavior: 'instant' }));
await p.waitForTimeout(250);
const sc4 = p.locator('#act-courses');
await sc4.locator('ul[aria-labelledby="pw-direction"]').getByRole('button', { name: 'Technology', exact: true }).click();
await sc4.locator('button[aria-label="Current education: Class 12"]').click();
await p.waitForTimeout(mobile ? 1000 : 250);
await sc4.locator('button[aria-label^="Course: BCA"]').click();
await p.waitForTimeout(mobile ? 1000 : 250);
await sc4.getByRole('button', { name: /Add course to comparison: BCA/ }).click();
await p.waitForTimeout(150);
await sc4.getByRole('button', { name: /Open comparison \(1\/3\)/ }).click();
await p.waitForTimeout(mobile || MODE !== 'reduced' ? 1500 : 400);
ok('a course from Scene 4 arrives in the course comparison', (await modeBtn('Courses').getAttribute('aria-pressed')) === 'true' && /BCA/.test(await ws.innerText()));
await add('course', 'technology-b-tech-b-e');
const cRows = await rows();
ok('course pathways are labelled orientation, never verified', (cRows.find((x) => x.id === 'subjects').cells.every((c) => c.state === 'orientation' && /orientation/i.test(c.text))));
const confirmed = cRows.find((x) => x.id === 'confirmedAt');
ok('"Confirmed at" uses verified programme records only', confirmed.cells.some((c) => c.state === 'verified' && /IIT Madras/.test(c.text)) && confirmed.cells.some((c) => c.state === 'unavailable'));
await view('Differences only').click();
await p.waitForTimeout(150);
txt = await ws.innerText();
ok('orientation content never produces a difference', (await rows()).length === 0 && /No verified differences to show/.test(txt) && /does not mean these options are the same/.test(txt));
await view('All parameters').click();

// ---- Scene 5 ↔ comparison
await modeBtn('Universities').click();
await p.waitForTimeout(100);
await ws.getByRole('button', { name: 'Return to the university atlas' }).click();
await p.waitForTimeout(1500);
const inView = await p.evaluate(() => { const r = document.getElementById('atlas-view').getBoundingClientRect(); return r.top < innerHeight && r.top > -200; });
ok('Return to the atlas lands on the atlas', inView);
const sc5 = p.locator('#act-universities');
const iisc = mobile ? sc5.locator('ol[aria-label="Institutions"] button', { hasText: 'IISc Bengaluru' }) : sc5.locator('button[aria-label^="Indian Institute of Science"]');
await iisc.click();
await p.waitForTimeout(mobile ? 1200 : 300);
await sc5.getByRole('button', { name: 'Add to comparison: IISc Bengaluru' }).click();
await p.waitForTimeout(150);
ok('adding from the atlas shows it is in the comparison', (await sc5.getByRole('button', { name: /IISc Bengaluru is in the comparison/ }).getAttribute('aria-pressed')) === 'true');
const toggle = sc5.getByRole('button', { name: /Add M\.Tech at IISc Bengaluru to the programme comparison/ });
ok('verified courses in the atlas panel can be compared as programmes', (await toggle.count()) === 1);
await sc5.getByRole('button', { name: /Open comparison \(3\/3\)/ }).click();
await p.waitForTimeout(MODE === 'reduced' ? 400 : 1500);
ok('Open comparison goes to the studio with the institution in place', /IISc Bengaluru/.test(await ws.innerText()) && (await modeBtn('Universities').getAttribute('aria-pressed')) === 'true');
await ws.getByRole('button', { name: /View BITS Pilani .* on the atlas/ }).click();
await p.waitForTimeout(mobile ? 1800 : 1500);
ok('Atlas button opens that institution in Scene 5', /Birla Institute of Technology and Science/.test(await sc5.innerText()));
const fullBtn = sc5.getByRole('button', { name: /BITS Pilani is in the comparison/ });
ok('the atlas knows it is already in the comparison', (await fullBtn.count()) === 1);
const kgp = mobile ? null : sc5.locator('button[aria-label^="Indian Institute of Technology Kharagpur"]');
if (kgp) {
  await sc5.getByRole('button', { name: /Show all regions/ }).click();
  await kgp.click();
  await p.waitForTimeout(200);
  const disabled = await sc5.getByRole('button', { name: 'Add to comparison: IIT Kharagpur' }).isDisabled();
  ok('a full comparison explains itself in the atlas', disabled && /holds 3 options/.test(await sc5.innerText()));
}

// ---- persistence + reset
await p.reload({ waitUntil: 'networkidle' });
await p.waitForTimeout(1500);
await toStudio();
txt = await ws.innerText();
ok('selection survives a reload in the same tab', /BITS Pilani/.test(txt) && /IISc Bengaluru/.test(txt));
await ws.getByRole('button', { name: 'Reset comparison' }).click();
await p.waitForTimeout(150);
txt = await ws.innerText();
ok('Reset clears this comparison', /Your ledger is empty/.test(txt));
ok('Reset leaves the other modes alone', /[1-3]/.test(await modeBtn('Courses').innerText()) && /[1-3]/.test(await modeBtn('Programmes').innerText()));

const overflow = await p.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
ok('no horizontal overflow', !overflow);
ok('no page errors', errors.length === 0, errors.slice(0, 2).join(' | '));
console.log(`\n${MODE}: ${pass} passed, ${fail} failed`);
await b.close();
process.exit(fail ? 1 : 0);
