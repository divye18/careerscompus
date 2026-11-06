#!/usr/bin/env node
/**
 * Scene 5 interaction / accessibility / honesty checks, real Chrome.
 * Usage: node scripts/universities-interaction-check.mjs [url] [mode: desktop|mobile|reduced|nowebgl]
 */
import { chromium } from 'playwright-core';
import fs from 'node:fs';
const URL = process.argv[2] || 'http://localhost:3100';
const MODE = process.argv[3] || 'desktop';
const mobile = MODE === 'mobile';
let pass = 0, fail = 0;
const ok = (name, cond, info = '') => { if (cond) pass++; else fail++; console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}${info ? ' — ' + info : ''}`); };

// ---- data integrity (static)
const data = JSON.parse(fs.readFileSync('src/content/institutions.data.json', 'utf8'));
const BANNED_KEYS = /rank|fee|salary|placement|cutoff|cut_off|naac|nirf|accreditation|entrance|admission/i;
ok('dataset has institutions', data.institutions.length >= 10, `${data.institutions.length}`);
ok('every institution has name + city evidence and a verification date', data.institutions.every((i) => i.sources.some((s) => s.field === 'name') && i.sources.some((s) => s.field === 'city') && /^\d{4}-\d{2}-\d{2}$/.test(i.lastVerified)));
ok('every populated optional fact has a source', data.institutions.every((i) => (i.institutionType === null || i.sources.some((s) => s.field === 'institutionType')) && (i.establishedYear === null || i.sources.some((s) => s.field === 'establishedYear')) && i.academicDomains.every((d) => i.sources.some((s) => s.field === `academicDomains:${d}`))));
ok('no coordinates are stored (none verified)', data.institutions.every((i) => i.coordinates === null));
ok('no ranking / fee / salary / placement / cut-off / accreditation / entrance fields exist', data.institutions.every((i) => Object.keys(i).every((k) => !BANNED_KEYS.test(k))));

const b = await chromium.launch({ channel: 'chrome', headless: false, args: MODE === 'nowebgl' ? ['--disable-webgl', '--disable-webgl2', '--disable-3d-apis'] : [] });
const ctx = await b.newContext({ viewport: mobile ? { width: 390, height: 844 } : { width: 1440, height: 900 }, reducedMotion: MODE === 'reduced' ? 'reduce' : 'no-preference', ...(mobile ? { hasTouch: true, isMobile: true, deviceScaleFactor: 2 } : {}) });
const p = await ctx.newPage();
const errors = [];
p.on('pageerror', (e) => errors.push(String(e)));
p.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
await p.goto(URL, { waitUntil: 'networkidle' });
await p.waitForTimeout(1500);
const sec = p.locator('#act-universities');
await p.evaluate(() => document.getElementById('act-universities').scrollIntoView({ block: 'start' }));
await p.waitForTimeout(600);
const openFilters = async () => { if (mobile) { const t = sec.getByRole('button', { name: /^Filters/ }); if ((await t.getAttribute('aria-expanded')) !== 'true') await t.click(); } };
const visibleCount = () => p.evaluate((m) => {
  const root = document.getElementById('act-universities');
  const sel = m ? 'ol[aria-label="Institutions"] button' : 'button[aria-pressed][aria-label]';
  return [...root.querySelectorAll(sel)].filter((e) => !/institution(s)?$/.test(e.getAttribute('aria-label') || '') && getComputedStyle(e).visibility !== 'hidden' && e.getBoundingClientRect().width > 0 && (m || /, /.test(e.getAttribute('aria-label')))).length;
}, mobile);

// all institutions present
const total = await visibleCount();
ok('all verified institutions are reachable as markers/rows', total === data.institutions.length, `${total}/${data.institutions.length}`);

// region by keyboard
const regionBtn = mobile ? sec.getByRole('button', { name: /^South India/ }) : sec.locator('button[aria-label^="South India"]');
await regionBtn.focus(); await p.keyboard.press('Enter');
ok('Enter selects a region (aria-pressed)', (await regionBtn.getAttribute('aria-pressed')) === 'true');
await p.waitForTimeout(300);
const infoText = await sec.innerText();
ok('region panel shows the verified count and the grouping note', /5 institutions checked/.test(infoText) && /Tamil Nadu, Karnataka/.test(infoText));

// institution by keyboard
const iitm = mobile ? sec.locator('ol[aria-label="Institutions"] button', { hasText: 'IIT Madras' }) : sec.locator('button[aria-label^="Indian Institute of Technology Madras"]');
await iitm.focus(); await p.keyboard.press('Space');
await p.waitForTimeout(700);
ok('Space opens the institution panel', /Indian Institute of Technology Madras/.test(await sec.locator('h3').first().innerText()) || (await sec.innerText()).includes('Indian Institute of Technology Madras'));
ok('marker is aria-pressed', (await iitm.getAttribute('aria-pressed')) === 'true');
const txt = await sec.innerText();
ok('verified facts shown (type, website)', /Institute of national importance/.test(txt) && /iitm\.ac\.in/.test(txt));
ok('missing facts say "Information coming soon" (established, admission, accreditation)', (txt.match(/Information coming soon/g) || []).length >= 3, `${(txt.match(/Information coming soon/g) || []).length} occurrences`);
const link = sec.locator('a[href^="https://www.iitm.ac.in"]').first();
ok('official website link opens safely in a new tab', (await link.getAttribute('target')) === '_blank' && /noopener/.test((await link.getAttribute('rel')) || ''));
const banned = txt.match(/\bNIRF\b|\bNAAC\b|\bQS\b|ranked|\branking|₹|\bLPA\b|salary|placement|cut-?off|\bJEE\b|\bNEET\b|\bGATE\b|\bCLAT\b|\d+\s*%/i);
ok('no rankings, fees, salaries, placements, accreditation grades, exam names or percentages', !banned, banned ? `found "${banned[0]}"` : '');
if (mobile) {
  const top = await p.evaluate(() => { const h = [...document.querySelectorAll('#act-universities h3')].find((x) => /Institute/.test(x.textContent)); return Math.round(h.getBoundingClientRect().top); });
  ok('on phones the panel is scrolled into view after choosing', top > 0 && top < 700, `top=${top}px`);
}

// focus ring
await iitm.focus(); await p.keyboard.press('Tab'); await p.keyboard.press('Shift+Tab');
await p.waitForTimeout(500);
const ring = await p.evaluate(() => { const cs = getComputedStyle(document.activeElement); return `${cs.outlineStyle} ${cs.outlineWidth} ${cs.outlineColor}`; });
ok('keyboard focus shows a visible cyan ring', /solid 2px rgb\(53, 230, 230\)/.test(ring), ring);

// back to atlas
await sec.getByRole('button', { name: /Back to the atlas/ }).click();
await p.waitForTimeout(300);
ok('Back to the atlas closes the panel (region kept)', !(await sec.innerText()).includes('How we checked this') && (await regionBtn.getAttribute('aria-pressed')) === 'true');

// filters
await openFilters();
const ini = sec.getByRole('button', { name: /^Institutes of national importance/ });
await sec.getByRole('button', { name: /Show all regions/ }).click();
await ini.click();
await p.waitForTimeout(400);
ok('type filter narrows to the 6 verified institutes of national importance', (await visibleCount()) === 6, `${await visibleCount()}`);
await sec.getByRole('button', { name: /^Medicine & Healthcare/ }).click();
await p.waitForTimeout(400);
ok('type + domain filters combine (INI ∩ medicine = AIIMS New Delhi only)', (await visibleCount()) === 1, `${await visibleCount()}`);
const lawChip = sec.getByRole('button', { name: /^Law & Public Policy/ });
ok('options with no verified match are disabled, not offered', await lawChip.isDisabled());
await sec.getByRole('button', { name: 'Reset filters' }).click();
await p.waitForTimeout(400);
ok('Reset filters restores every institution and clears selections', (await visibleCount()) === total && (await sec.locator('button[aria-pressed="true"]').count()) === 0);
ok('Reset is disabled when nothing is applied', await sec.getByRole('button', { name: 'Reset filters' }).isDisabled());

// international is honest
const intl = mobile ? sec.getByRole('button', { name: /^International/ }) : sec.locator('button[aria-label^="International"]');
await intl.click();
ok('International says no institutions are verified yet', /No international institutions have been verified yet/.test(await sec.innerText()));
await sec.getByRole('button', { name: /Show all regions|Reset filters/ }).first().click();

// cross-link to Scene 4 (select a domain from an institution)
const bits = mobile ? sec.locator('ol[aria-label="Institutions"] button', { hasText: 'IIT Kanpur' }) : sec.locator('button[aria-label^="Indian Institute of Technology Kanpur"]');
await bits.click(); await p.waitForTimeout(500);
await sec.getByRole('button', { name: /Technology →/ }).click();
await p.waitForTimeout(1800);
const pressed = await p.locator('#act-courses ul[aria-labelledby="pw-direction"]').getByRole('button', { name: 'Technology', exact: true }).getAttribute('aria-pressed');
ok('"See pathways in this domain" carries the field into Scene 4', pressed === 'true');

const overflow = await p.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
ok('no horizontal overflow', !overflow);
ok('no page errors', errors.length === 0, errors.slice(0, 2).join(' | '));
console.log(`\n${MODE}: ${pass} passed, ${fail} failed`);
await b.close();
process.exit(fail ? 1 : 0);
