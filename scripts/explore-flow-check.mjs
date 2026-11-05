#!/usr/bin/env node
/**
 * Scene 3 flow (mobile / fallback) capture, real Chrome. Scrolls the Explore section into view, then
 * swipes the native track to each panel (scrollIntoView inline:center) and screenshots it.
 * Also measures horizontal overflow, tap-target sizes and keyboard access.
 * Usage: node scripts/explore-flow-check.mjs [outDir] [url] [mode: mobile|reduced|nowebgl]
 */
import { chromium } from 'playwright-core';
import fs from 'node:fs';
const OUT = process.argv[2] || 'docs/qa-screenshots/explore';
const URL = process.argv[3] || 'http://localhost:3100';
const MODE = process.argv[4] || 'mobile';
fs.mkdirSync(OUT, { recursive: true });
const opts = MODE === 'mobile'
  ? { viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true }
  : { viewport: { width: 1440, height: 900 }, reducedMotion: MODE === 'reduced' ? 'reduce' : 'no-preference' };
const b = await chromium.launch({ channel: 'chrome', headless: false, args: MODE === 'nowebgl' ? ['--disable-webgl', '--disable-webgl2', '--disable-3d-apis'] : [] });
const p = await (await b.newContext(opts)).newPage();
const errors = [];
p.on('pageerror', (e) => errors.push(String(e)));
p.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
await p.goto(URL, { waitUntil: 'networkidle' });
const presenter = await p.evaluate(() => document.querySelector('[data-journey]')?.getAttribute('data-journey'));
await p.evaluate(() => document.getElementById('act-explore').scrollIntoView({ block: 'start' }));
await p.waitForTimeout(900);
await p.screenshot({ path: `${OUT}/${MODE}-explore-intro.jpg`, type: 'jpeg', quality: 80 });
const ids = ['technology', 'medicine', 'business', 'design', 'law', 'architecture', 'science'];
for (const [i, id] of ids.entries()) {
  // bring the panel into the track's centre, then capture the whole panel element (full height)
  await p.evaluate((id) => document.getElementById(`explore-${id}`).scrollIntoView({ inline: 'center', block: 'nearest' }), id);
  await p.waitForTimeout(700);
  await p.locator(`#explore-${id}`).screenshot({ path: `${OUT}/${MODE}-panel${i + 1}-${id}.jpg`, type: 'jpeg', quality: 80 });
}
const metrics = await p.evaluate(() => {
  const small = [...document.querySelectorAll('#act-explore button, #act-explore a')].filter((e) => {
    const r = e.getBoundingClientRect();
    return r.width > 0 && r.height > 0 && (r.height < 43.5 || r.width < 43.5);
  }).map((e) => (e.getAttribute('aria-label') || e.textContent || '?').trim().slice(0, 24) + ' ' + Math.round(e.getBoundingClientRect().width) + 'x' + Math.round(e.getBoundingClientRect().height));
  return {
    docOverflow: document.documentElement.scrollWidth > window.innerWidth,
    smallTargets: small,
    panels: document.querySelectorAll('#act-explore article').length,
    trackFocusable: document.querySelector('#act-explore [role="region"]')?.tabIndex === 0,
  };
});
console.log(JSON.stringify({ mode: MODE, presenter, errors, ...metrics }));
await b.close();
