#!/usr/bin/env node
/**
 * Scene 4 (Courses & Pathways) capture + checks, real Chrome.
 * Usage: node scripts/courses-check.mjs [outDir] [url] [width] [height] [mode: desktop|reduced|nowebgl]
 * Captures the converge intro, then each pathway state; reports horizontal overflow, console errors and
 * touch-target sizes. Saves to <out>/courses/<w>-NN-state.jpg
 */
import { chromium } from 'playwright-core';
import fs from 'node:fs';
const OUT = (process.argv[2] || 'docs/qa-screenshots/courses');
const URL = process.argv[3] || 'http://localhost:3100';
const W = +(process.argv[4] || 1440);
const H = +(process.argv[5] || 900);
const MODE = process.argv[6] || 'desktop';
fs.mkdirSync(OUT, { recursive: true });
const b = await chromium.launch({ channel: 'chrome', headless: false, args: MODE === 'nowebgl' ? ['--disable-webgl', '--disable-webgl2', '--disable-3d-apis'] : [] });
const mobile = W < 700;
const ctx = await b.newContext({ viewport: { width: W, height: H }, reducedMotion: MODE === 'reduced' ? 'reduce' : 'no-preference', ...(mobile ? { deviceScaleFactor: 2, hasTouch: true, isMobile: true } : {}) });
const p = await ctx.newPage();
const errors = [];
p.on('pageerror', (e) => errors.push(String(e)));
p.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
await p.goto(URL, { waitUntil: 'networkidle' });
await p.waitForTimeout(1500);
const tag = `${MODE === 'desktop' ? '' : MODE + '-'}${W}`;
let n = 0;
const shot = async (name, sel, offset = 80) => {
  if (sel) await p.evaluate(({ sel, offset }) => { const el = document.querySelector(sel); scrollTo({ top: el.getBoundingClientRect().top + scrollY - offset, behavior: 'instant' }); }, { sel, offset });
  await p.waitForTimeout(1200);
  await p.screenshot({ path: `${OUT}/${tag}-${String(n++).padStart(2, '0')}-${name}.jpg`, type: 'jpeg', quality: 82 });
};
const click = async (label) => { await p.locator(`button[aria-label="${label}"]`).first().click(); };
await p.evaluate(() => scrollTo({ top: document.getElementById('act-courses').getBoundingClientRect().top + scrollY - 200, behavior: 'instant' }));
await p.waitForTimeout(900);
await p.screenshot({ path: `${OUT}/${tag}-${String(n++).padStart(2, '0')}-converge-start.jpg`, type: 'jpeg', quality: 82 });
await shot('converge-title', '#act-courses', 60);
await shot('chart-empty', '#pw-direction', 100);
await p.locator('#act-courses').getByRole('button', { name: 'Technology', exact: true }).click();
await click('Current education: Class 12');
await shot('level-domain', '#pw-direction', 100);
await click('Course: B.Tech / B.E., a possible pathway');
await shot('course', '#pw-direction', 100);
await click('Specialisation: Computer Science');
await shot('specialisation', '#pw-direction', 100);
await click('Possible career direction: Software engineer');
await shot('career-complete', '#pw-direction', 100);
await shot('notes-and-handoff', '#pw-notes', 200);
if (!mobile) {
  await p.locator('#act-courses').getByRole('button', { name: 'Start over' }).click();
  await p.locator('#act-courses').getByRole('button', { name: 'Medicine', exact: true }).click();
  await click('Current education: Class 10');
  await shot('fallback-class10-medicine', '#pw-direction', 100);
  await p.locator('#act-courses').getByRole('button', { name: 'Start over' }).click();
  await p.locator('#act-courses').getByRole('button', { name: 'Design', exact: true }).click();
  await click('Current education: Undergraduate');
  await click('Course: M.Des, a possible pathway');
  await click('Specialisation: Interaction Design');
  await shot('design-m-des', '#pw-direction', 100);
}
const metrics = await p.evaluate(() => {
  const sec = document.getElementById('act-courses');
  const small = [...sec.querySelectorAll('button')].filter((e) => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && (r.height < 43.5 || r.width < 30); }).map((e) => (e.getAttribute('aria-label') || e.textContent || '?').trim().slice(0, 30) + ' ' + Math.round(e.getBoundingClientRect().width) + 'x' + Math.round(e.getBoundingClientRect().height));
  return { docOverflow: document.documentElement.scrollWidth > window.innerWidth, secOverflow: sec.scrollWidth > sec.clientWidth, smallTargets: small, presenter: document.querySelector('[data-journey]')?.getAttribute('data-journey') };
});
console.log(JSON.stringify({ mode: MODE, W, errors, ...metrics }));
await b.close();
