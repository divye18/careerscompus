#!/usr/bin/env node
/**
 * Scene 4 interaction / accessibility / honesty checks, real Chrome.
 * Usage: node scripts/courses-interaction-check.mjs [url] [mode: desktop|mobile|reduced|nowebgl]
 */
import { chromium } from 'playwright-core';
const URL = process.argv[2] || 'http://localhost:3100';
const MODE = process.argv[3] || 'desktop';
const mobile = MODE === 'mobile';
const b = await chromium.launch({ channel: 'chrome', headless: false, args: MODE === 'nowebgl' ? ['--disable-webgl', '--disable-webgl2', '--disable-3d-apis'] : [] });
const ctx = await b.newContext({ viewport: mobile ? { width: 390, height: 844 } : { width: 1440, height: 900 }, reducedMotion: MODE === 'reduced' ? 'reduce' : 'no-preference', ...(mobile ? { hasTouch: true, isMobile: true, deviceScaleFactor: 2 } : {}) });
const p = await ctx.newPage();
const errors = [];
p.on('pageerror', (e) => errors.push(String(e)));
p.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
await p.goto(URL, { waitUntil: 'networkidle' });
await p.waitForTimeout(1500);
const sec = p.locator('#act-courses');
let pass = 0, fail = 0;
const ok = (name, cond, info = "") => { if (cond) pass++; else fail++; console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}${info ? ' — ' + info : ''}`); };
const pressed = async (name) => (await sec.locator(`button[aria-label="${name}"]`).first().getAttribute('aria-pressed')) === 'true';
const dom = (n) => sec.locator('ul[aria-labelledby="pw-direction"]').getByRole('button', { name: n, exact: true });
await p.evaluate(() => document.getElementById('pw-direction').scrollIntoView({ block: 'start' }));
await p.waitForTimeout(600);

// 1. keyboard-only selection
await dom('Technology').focus(); await p.keyboard.press('Enter');
ok('Enter selects a direction (aria-pressed)', (await dom('Technology').getAttribute('aria-pressed')) === 'true');
const lvl = sec.locator('button[aria-label="Current education: Class 12"]');
await lvl.focus(); await p.keyboard.press('Space');
ok('Space selects a level', await pressed('Current education: Class 12'));
await p.waitForTimeout(400);
const crs = sec.locator('button[aria-label="Course: B.Tech / B.E., a possible pathway"]');
ok('course options appear for level + direction', (await crs.count()) === 1);
await crs.focus(); await p.keyboard.press('Enter');
await p.waitForTimeout(700);
ok('course selected → specialisations listed', (await sec.locator('button[aria-label^="Specialisation:"]').count()) === 3);
if (!mobile) {
  await p.waitForTimeout(900);
  const n = await sec.locator('svg[aria-hidden="true"].pointer-events-none path').count();
  ok('connecting route lines are drawn between stations', n >= 3, `${n} paths`);
}
await sec.locator('button[aria-label="Specialisation: Computer Science"]').focus(); await p.keyboard.press('Enter');
await p.waitForTimeout(500);
await sec.locator('button[aria-label="Possible career direction: Software engineer"]').focus(); await p.keyboard.press('Enter');
await p.waitForTimeout(500);
const crumbs = await sec.locator('nav[aria-label="Your route so far"] li').allInnerTexts();
ok('breadcrumb shows the full route', crumbs.join('|').replace(/→/g, '').replace(/\s+/g, ' ').includes('Class 12') && crumbs.some((c) => c.includes('Software engineer')), crumbs.map((c) => c.replace(/\s*→\s*/, '')).join(' > '));

// 2. focus indicator
await sec.locator('button[aria-label="Current education: Diploma"]').focus();
await p.keyboard.press('Tab'); await p.keyboard.press('Shift+Tab');
await p.waitForTimeout(500);
const ring = await p.evaluate(() => { const cs = getComputedStyle(document.activeElement); return `${cs.outlineStyle} ${cs.outlineWidth} ${cs.outlineColor}`; });
ok('keyboard focus shows a visible cyan ring', /solid 2px rgb\(53, 230, 230\)/.test(ring), ring);

// 3. back / stage / reset
await sec.getByRole('button', { name: /Back one step/ }).click();
ok('Back one step removes the career', !(await pressed('Possible career direction: Software engineer')) && (await pressed('Specialisation: Computer Science')));
await sec.getByRole('button', { name: /Back one step/ }).click();
ok('Back again removes the specialisation', !(await pressed('Specialisation: Computer Science')) && (await pressed('Course: B.Tech / B.E., a possible pathway')));
await sec.locator('nav[aria-label="Your route so far"]').getByRole('button', { name: 'Class 12' }).click();
ok('Breadcrumb step-back clears deeper choices (keeps level + direction)', !(await pressed('Course: B.Tech / B.E., a possible pathway')) && (await pressed('Current education: Class 12')));
await sec.getByRole('button', { name: 'Start over' }).click();
const anyPressed = await sec.locator('button[aria-pressed="true"]').count();
ok('Start over clears every selection', anyPressed === 0, `${anyPressed} pressed`);
ok('Back/Start over are disabled with nothing selected', (await sec.getByRole('button', { name: /Back one step/ }).isDisabled()) && (await sec.getByRole('button', { name: 'Start over' }).isDisabled()));

// 4. honest fallbacks
await dom('Medicine').click(); await sec.locator('button[aria-label="Current education: Class 10"]').click();
const note = await sec.innerText();
ok('Class 10 + Medicine says no common route is listed (not an invented one)', /No common route from Class 10/i.test(note));
await sec.getByRole('button', { name: 'Start over' }).click();

// 5. 'Explore this course' is honest
const ex = sec.getByRole('button', { name: /Explore this course/ });
ok('"Explore this course" is aria-disabled and labelled Soon', (await ex.getAttribute('aria-disabled')) === 'true' && /Soon/i.test(await ex.innerText()));

// 6. content honesty: no invented figures/claims anywhere in the scene
await dom('Law').click(); await sec.locator('button[aria-label="Current education: Class 12"]').click();
await sec.locator('button[aria-label^="Course:"]').first().click();
const text = (await sec.innerText()) + (await p.evaluate(() => document.getElementById('act-courses').getAttribute('aria-label')));
const bad = text.match(/₹|\bLPA\b|\bsalary|\bplacement|cut-?off|\bJEE\b|\bNEET\b|\bCLAT\b|\bGATE\b|\bNIRF\b|guarantee|\d+\s*(?:years?|months?)\b|\d+%/i);
ok('no salaries, placements, cut-offs, exam names, durations or percentages', !bad, bad ? `found "${bad[0]}"` : '');
ok('entrance/eligibility is honestly marked as not yet listed', /Entrance and eligibility details are not listed yet/i.test(text));
ok('"possible pathway" / check-institution wording is present', /possible pathway/i.test(text) && /check each institution|check institution|official/i.test(text));
await sec.getByRole('button', { name: 'Start over' }).click();

// 7. mobile: auto-advance to the newly opened stage + no overflow
if (mobile) {
  await dom('Technology').click(); await sec.locator('button[aria-label="Current education: Class 12"]').click();
  await p.waitForTimeout(1500);
  const top2 = await p.evaluate(() => Math.round(document.getElementById('stage-2').getBoundingClientRect().top));
  ok('after choosing level + direction, Stage 2 is brought into view', top2 >= 0 && top2 < 300, `top=${top2}px`);
  await sec.locator('button[aria-label="Course: B.Tech / B.E., a possible pathway"]').click();
  await p.waitForTimeout(1500);
  const top3 = await p.evaluate(() => Math.round(document.getElementById('stage-3').getBoundingClientRect().top));
  ok('after choosing a course, Stage 3 is brought into view', top3 >= 0 && top3 < 300, `top=${top3}px`);
}
const overflow = await p.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
ok('no horizontal overflow', !overflow);
ok('no page errors', errors.length === 0, errors.slice(0, 2).join(' | '));
console.log(`\n${MODE}: ${pass} passed, ${fail} failed`);
await b.close();
process.exit(fail ? 1 : 0);
