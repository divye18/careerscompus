#!/usr/bin/env node
/**
 * Scene 7 browser checks, real Chrome. Usage: node scripts/action-interaction-check.mjs [url] [desktop|mobile|reduced|nowebgl] [shotsDir]
 * Selections are made through the real Scene 6 chooser. With shotsDir, also captures screenshots of each state.
 */
import { chromium } from 'playwright-core';
import fs from 'node:fs';
const URL = process.argv[2] || 'http://localhost:3100';
const MODE = process.argv[3] || 'desktop';
const OUT = process.argv[4] || '';
const mobile = MODE === 'mobile';
let pass = 0, fail = 0;
const ok = (n, c, i = '') => { if (c) pass++; else fail++; console.log(`${c ? 'PASS' : 'FAIL'}  ${n}${i ? ' — ' + i : ''}`); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const b = await chromium.launch({ channel: 'chrome', headless: false, args: MODE === 'nowebgl' ? ['--disable-webgl', '--disable-webgl2', '--disable-3d-apis'] : [] });
const ctx = await b.newContext({ viewport: mobile ? { width: 390, height: 844 } : { width: 1440, height: 900 }, reducedMotion: MODE === 'reduced' ? 'reduce' : 'no-preference', ...(mobile ? { hasTouch: true, isMobile: true, deviceScaleFactor: 2 } : {}) });
const p = await ctx.newPage();
const errors = [];
p.on('pageerror', (e) => errors.push(String(e)));
p.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
const posts = [];
p.on('request', (r) => { if (!['GET', 'HEAD'].includes(r.method())) posts.push(r.method() + ' ' + r.url()); });
await p.goto(URL, { waitUntil: 'load' });
await sleep(2000);
const S = p.locator('#act-next-steps');
const ws = p.locator('#studio-workspace');
const state = () => S.getAttribute('data-plan-state');
const mode = async (name) => { await ws.locator('ul[aria-labelledby="studio-mode"]').getByRole('button', { name: new RegExp(`^${name}`) }).click(); await sleep(100); };
const add = async (noun, id) => { await ws.getByRole('button', { name: new RegExp(`Add ${noun}`) }).first().click(); await ws.locator(`button[data-option="${id}"]`).click(); await sleep(120); };
const shot = async (name) => { if (OUT) { fs.mkdirSync(OUT, { recursive: true }); await S.screenshot({ path: `${OUT}/${MODE}-${name}.jpg`, type: 'jpeg', quality: 70 }); } };
const text = () => S.innerText();
const stepBtn = (id) => S.locator(`[data-step="${id}"] button[aria-pressed]`);

// ---------- empty
ok('empty state', (await state()) === 'empty');
let t = await text();
ok('empty: honest message, no invented selection', /Nothing kept yet/.test(t) && (await S.locator('[data-kept]').count()) === 0);
ok('empty: can return to discovery', (await S.getByRole('button', { name: 'The career worlds', exact: true }).count()) === 1);
ok('empty: starts at the career worlds', (await S.locator('[data-step="explore"]').count()) === 1 && (await S.locator('[data-step="explore-courses"]').count()) === 0);
ok('student-facing name is Next Steps; internal name absent', /NEXT STEPS/i.test(t) && !/Action Studio/i.test(t));
await shot('1-empty');

// ---------- partial: a place, no course
await add('institution', 'bits-pilani');
await add('institution', 'iit-madras');
ok('partial with institutions', (await state()) === 'partial');
ok('partial: suggests courses and pathways, not career worlds', (await S.locator('[data-step="explore-courses"]').count()) === 1 && (await S.locator('[data-step="explore"]').count()) === 0);
const inst = S.locator('[data-kept="iit-madras"]');
ok('an institution has no overall status label', (await inst.getAttribute('data-status')) === 'none' && (await inst.locator('[data-status]').count()) === 0);
ok('an institution shows its last-checked date', /Last checked \d{4}-\d{2}-\d{2}/i.test(await inst.innerText()));
await shot('2-partial');

// ---------- full, with a listing
await mode('Programmes');
await add('programme', 'iit-madras--mba');
await add('programme', 'vit-vellore--b-tech');
await mode('Courses');
await add('course', 'technology-b-tech-b-e');
ok('full state', (await state()) === 'full');
const kept = await S.locator('[data-kept]').evaluateAll((e) => e.map((x) => x.dataset.kept));
ok('kept follows selection order, grouped', kept.join() === 'bits-pilani,iit-madras,iit-madras--mba,vit-vellore--b-tech,technology-b-tech-b-e', kept.join());
const listing = S.locator('[data-kept="vit-vellore--b-tech"]');
ok('a listing is Partially verified and marked listed only, never Verified', (await listing.locator('[data-status="partial"]').count()) === 1 && /listed only/.test(await listing.innerText()));
ok('a statement programme is Verified', (await S.locator('[data-kept="iit-madras--mba"] [data-status="verified"]').count()) === 1);
ok('a course is Orientation', (await S.locator('[data-kept="technology-b-tech-b-e"] [data-status="orientation"]').count()) === 1);
ok('the currently-offered question is kept for the listing', /vit vellore/i.test(await S.locator('[data-question="currently-offered"]').evaluate((d) => d.textContent)));
ok('unknown and not applicable are in separate groups', (await S.locator('[data-open-group="unknown"]').count()) === 1 && (await S.locator('[data-open-group="not-applicable"]').count()) === 1);
ok('one question appears once in the unknown group', (await S.locator('[data-open-group="unknown"] [data-question="accreditation"]').count()) === 1);
const groups = await S.locator('[data-step-group]').evaluateAll((e) => e.map((x) => x.dataset.stepGroup));
ok('steps are grouped Explore, Verify, Discuss', groups.join() === 'explore,verify,discuss', groups.join());
ok('verification is grouped into one action', (await S.locator('[data-step="check-official"]').count()) === 1 && (await S.locator('[data-step^="check-website"]').count()) === 0);
const src = await S.locator('[data-step="check-official"] [data-source]').evaluateAll((e) => e.map((x) => x.dataset.source));
ok('source order follows the selection', src.join() === 'bits-pilani,iit-madras,vit-vellore', src.join());
const links = await S.locator('[data-step="check-official"] a').evaluateAll((e) => e.map((a) => [a.getAttribute('href'), a.target, a.rel]));
ok('official links open safely in a new tab', links.length === 3 && links.every(([h, tg, r]) => h.startsWith('https://') && tg === '_blank' && /noopener/.test(r)));
t = await S.evaluate((e) => e.textContent);
const banned = t.match(/\bbest\b|\bwinner\b|\branked\b|\brecommended\b|match score|you qualify|apply now|up to date|₹|\bLPA\b|\d+\s*%/i);
ok('no ranking, scoring, money or freshness language', !banned, banned?.[0] ?? '');
await shot('3-full');

// ---------- ticks
const labels = () => S.locator('[data-kept] [data-status]').evaluateAll((e) => e.map((x) => x.dataset.status).join());
const compareKey = () => p.evaluate(() => sessionStorage.getItem('cc:compare:v1'));
const [l0, c0] = [await labels(), await compareKey()];
await stepBtn('talk').click();
ok('a tick shows as pressed, in words and not only colour', (await stepBtn('talk').getAttribute('aria-pressed')) === 'true' && /Your note: done/i.test(await S.locator('[data-step="talk"]').innerText()));
ok('a tick is announced', /Marked as done/.test(await S.locator('[role="status"]').last().innerText()));
ok('a tick changes no evidence label', (await labels()) === l0);
ok('a tick does not write to the comparison', (await compareKey()) === c0);
await shot('4-ticked');

// ---------- persistence and corrupt storage
await p.reload({ waitUntil: 'load' });
await sleep(1800);
ok('reload keeps the selections and the tick', (await state()) === 'full' && (await stepBtn('talk').getAttribute('aria-pressed')) === 'true');
await p.evaluate(() => sessionStorage.setItem('cc:action:v1', '{not json'));
await p.reload({ waitUntil: 'load' });
await sleep(1800);
ok('corrupt tick storage recovers, the page still works', (await state()) === 'full' && (await stepBtn('talk').getAttribute('aria-pressed')) === 'false');
await p.evaluate(() => sessionStorage.setItem('cc:action:v1', JSON.stringify(['talk', 'nope', 7])));
await p.reload({ waitUntil: 'load' });
await sleep(1800);
ok('invalid stored ids are ignored, valid ones kept', (await stepBtn('talk').getAttribute('aria-pressed')) === 'true');

// ---------- remove and undo
await S.getByRole('button', { name: 'Remove BITS Pilani' }).click();
await sleep(150);
ok('remove updates this sheet and focuses Undo', (await S.locator('[data-kept="bits-pilani"]').count()) === 0 && (await p.evaluate(() => document.activeElement?.textContent)) === 'Undo');
ok('remove updates the comparison store', !(await compareKey()).includes('bits-pilani'));
await S.getByRole('button', { name: 'Undo' }).click();
await sleep(150);
ok('undo restores it', (await S.locator('[data-kept="bits-pilani"]').count()) === 1);

// ---------- keyboard
await S.locator('[data-step="talk"] button[aria-pressed]').focus();
await p.keyboard.press('Space');
await sleep(80);
ok('Space toggles a step', (await stepBtn('talk').getAttribute('aria-pressed')) === 'false');
await p.keyboard.press('Enter');
await sleep(80);
ok('Enter toggles a step', (await stepBtn('talk').getAttribute('aria-pressed')) === 'true');
await p.keyboard.press('Shift+Tab');
await p.keyboard.press('Tab');
await sleep(250);
const ring = await p.evaluate(() => { const c = getComputedStyle(document.activeElement); return `${c.outlineStyle} ${c.outlineWidth} ${c.outlineColor}`; });
ok('keyboard focus shows the cyan ring', /solid 2px rgb\(53, 230, 230\)/.test(ring), ring);
await S.locator('[data-question]').first().locator('summary').focus();
const was = await S.locator('[data-question]').first().evaluate((d) => d.open);
await p.keyboard.press('Enter');
await sleep(80);
ok('a question expands and collapses by keyboard', (await S.locator('[data-question]').first().evaluate((d) => d.open)) === !was);

// ---------- return navigation
await S.getByRole('button', { name: /^Back to the atlas: IIT Madras/ }).click();
await sleep(1500);
const top = await p.evaluate(() => document.getElementById('atlas-view').getBoundingClientRect().top);
ok('Back to the atlas lands there and moves focus', Math.abs(top) < innerSize() && (await p.evaluate(() => document.activeElement?.id)) === 'atlas-view', `top ${Math.round(top)}`);
function innerSize() { return mobile ? 844 : 900; }
ok('the atlas opens that institution', /Indian Institute of Technology Madras/.test(await p.locator('#act-universities').innerText()));

// ---------- the index marks only the stage actually in view
const current = () => S.locator('nav[aria-label="Sections of your sheet"] a[aria-current="location"]').evaluateAll((e) => e.map((a) => a.getAttribute('href')));
const scrollTo = async (fn) => { await p.evaluate(fn); await sleep(350); };
await scrollTo(() => document.getElementById('next-steps').scrollIntoView({ behavior: 'instant', block: 'start' }));
ok('index marks Next when it is in view', (await current()).join() === '#next-steps', (await current()).join());
await scrollTo(() => document.getElementById('next-open').scrollIntoView({ behavior: 'instant', block: 'start' }));
ok('index marks Still open when it is in view', (await current()).join() === '#next-open', (await current()).join());
await scrollTo(() => { const r = document.getElementById('act-next-steps').getBoundingClientRect(); window.scrollTo({ top: r.top + scrollY - innerHeight * 0.7, behavior: 'instant' }); });
ok('index marks nothing when scrolled back above the stages', (await current()).length === 0, (await current()).join());

// ---------- structure, targets, heading order
const a11y = await S.evaluate((root) => {
  const small = [...root.querySelectorAll('button,summary,a')].filter((e) => { const r = e.getBoundingClientRect(); const c = getComputedStyle(e); return r.height > 0 && r.height < 43.5 && c.display !== 'none'; }).map((e) => e.textContent.trim().slice(0, 24));
  const levels = [...root.querySelectorAll('h2,h3,h4')].map((h) => +h.tagName[1]);
  return { small, skip: levels.some((l, i) => i && l - levels[i - 1] > 1), tiny: [...root.querySelectorAll('*')].filter((e) => [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()) && !e.closest('.sr-only') && parseFloat(getComputedStyle(e).fontSize) < 11 && e.getBoundingClientRect().height > 0).length };
});
ok('all controls are at least 44px', a11y.small.length === 0, a11y.small.join('|'));
ok('heading order has no skips', !a11y.skip);
ok('no text under 11px', a11y.tiny === 0);
if (MODE === 'reduced') {
  const m = await S.locator('[data-meridian]').evaluate((e) => getComputedStyle(e).transform);
  ok('reduced motion: the meridian is fully drawn', m === 'none' || m === 'matrix(1, 0, 0, 1, 0, 0)', m);
}
const rail = mobile ? null : await p.locator('nav[aria-label="Journey scenes and career domains"] a[href="#act-next-steps"]').count();
if (!mobile) ok('the rail has a Next Steps stop', rail >= 1);
ok('no horizontal overflow', await p.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth));
ok('nothing is sent anywhere (no non-GET requests)', posts.length === 0, posts.join(' '));
ok('no console or page errors', errors.length === 0, errors.slice(0, 2).join(' | '));
await b.close();
console.log(`\n${MODE}: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
