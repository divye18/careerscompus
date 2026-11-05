#!/usr/bin/env node
/**
 * Scene 5 (University Atlas) capture + checks, real Chrome.
 * Usage: node scripts/universities-check.mjs [outDir] [url] [width] [height] [mode: desktop|reduced|nowebgl]
 */
import { chromium } from 'playwright-core';
import fs from 'node:fs';
const OUT = process.argv[2] || 'docs/qa-screenshots/universities';
const URL = process.argv[3] || 'http://localhost:3100';
const W = +(process.argv[4] || 1440), H = +(process.argv[5] || 900);
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
const sec = p.locator('#act-universities');
let n = 0;
const shot = async (name, sel, offset = 80) => {
  if (sel) await p.evaluate(({ sel, offset }) => { let el = document.querySelector(sel); if (el.getBoundingClientRect().height === 0) el = document.querySelector('#atlas-region-m'); scrollTo({ top: el.getBoundingClientRect().top + scrollY - offset, behavior: 'instant' }); }, { sel, offset });
  await p.waitForTimeout(1100);
  await p.screenshot({ path: `${OUT}/${tag}-${String(n++).padStart(2, '0')}-${name}.jpg`, type: 'jpeg', quality: 82 });
};
const openFilters = async () => { if (mobile) { const t = sec.getByRole('button', { name: /^Filters/ }); if ((await t.getAttribute('aria-expanded')) !== 'true') await t.click(); } };
const inst = (name) => sec.locator(mobile ? `ol[aria-label="Institutions"] button` : `button[aria-label^="${name}"]`);
const region = (label) => sec.getByRole('button', { name: new RegExp(`^${label}`) });
const chip = (t) => sec.getByRole('button', { name: new RegExp(`^${t}`) });
await shot('intro', '#act-universities', 0);
await shot('atlas-empty', '#atlas-type', 90);
await region('South India').first().click();
await shot('region-south', '#atlas-type', 90);
await (mobile ? sec.locator('ol[aria-label="Institutions"] button', { hasText: 'IIT Madras' }) : inst('Indian Institute of Technology Madras')).click();
await shot('institution-iit-madras', mobile ? '#atlas-type' : '#atlas-type', 90);
if (mobile) await shot('panel', null);
await openFilters();
await sec.getByRole('button', { name: 'Reset filters' }).click();
await openFilters();
await chip('Institutes of national importance').click();
await chip('Technology').click();
await shot('filters-ini-tech', '#atlas-type', 90);
await openFilters();
await sec.getByRole('button', { name: 'Reset filters' }).click();
await openFilters();
await chip('Deemed-to-be universities').click();
await chip('Science').click();
await shot('filters-no-match-or-disabled', '#atlas-type', 90);
await openFilters();
await sec.getByRole('button', { name: 'Reset filters' }).click();
await region('International').first().click();
await shot('region-international-empty', '#atlas-type', 90);
await openFilters();
await sec.getByRole('button', { name: 'Reset filters' }).click();
await region('Central India').first().click();
await shot('region-central', '#atlas-type', 90);
const metrics = await p.evaluate(() => {
  const s = document.getElementById('act-universities');
  const small = [...s.querySelectorAll('button')].filter((e) => { const r = e.getBoundingClientRect(); const v = r.width > 0 && r.height > 0 && getComputedStyle(e).visibility !== 'hidden'; return v && (r.height < 43.5 || r.width < 30); }).map((e) => (e.getAttribute('aria-label') || e.textContent || '?').trim().slice(0, 30) + ' ' + Math.round(e.getBoundingClientRect().width) + 'x' + Math.round(e.getBoundingClientRect().height));
  return { docOverflow: document.documentElement.scrollWidth > window.innerWidth, smallTargets: small, presenter: document.querySelector('[data-journey]')?.getAttribute('data-journey') };
});
console.log(JSON.stringify({ mode: MODE, W, errors, ...metrics }));
await b.close();
