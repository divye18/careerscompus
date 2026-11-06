#!/usr/bin/env node
/**
 * Fixed set of screenshots for before/after review of visual changes, real Chrome.
 * Usage: node scripts/stabilisation-shots.mjs <outDir> [url]
 */
import { chromium } from 'playwright-core';
import fs from 'node:fs';
const OUT = process.argv[2] || 'docs/qa-screenshots/stabilisation/after';
const URL = process.argv[3] || 'http://localhost:3100';
fs.mkdirSync(OUT, { recursive: true });
const b = await chromium.launch({ channel: 'chrome', headless: false, args: ['--disable-backgrounding-occluded-windows', '--disable-renderer-backgrounding'] });

const toEl = (p, sel, offset) => p.evaluate(({ sel, offset }) => { const el = document.querySelector(sel); scrollTo({ top: el.getBoundingClientRect().top + scrollY - offset, behavior: 'instant' }); }, { sel, offset });

async function run(name, width, height, touch) {
  const ctx = await b.newContext({ viewport: { width, height }, ...(touch ? { hasTouch: true, isMobile: true, deviceScaleFactor: 2 } : {}) });
  const p = await ctx.newPage();
  await p.goto(URL, { waitUntil: 'networkidle' });
  await p.waitForTimeout(1500);
  const shot = async (n) => { await p.waitForTimeout(1300); await p.screenshot({ path: `${OUT}/${name}-${n}.jpg`, type: 'jpeg', quality: 82 }); };

  await toEl(p, '#act-courses', 0);
  await shot('scene4-opening');
  await toEl(p, '#act-universities', 0);
  await shot('scene5-opening');

  const s4 = p.locator('#act-courses');
  await s4.locator('ul[aria-labelledby="pw-direction"]').getByRole('button', { name: 'Technology', exact: true }).click();
  await s4.locator('button[aria-label="Current education: Class 12"]').click();
  await p.waitForTimeout(touch ? 900 : 200);
  await s4.locator('button[aria-label^="Course: B.Tech"]').click();
  await p.waitForTimeout(touch ? 900 : 200);
  await s4.locator('button[aria-label="Specialisation: Computer Science"]').click();
  await p.waitForTimeout(touch ? 900 : 200);
  await s4.locator('button[aria-label="Possible career direction: Software engineer"]').click();
  await toEl(p, '#stage-1', touch ? 80 : 120);
  await shot('scene4-route');
  if (touch) { await toEl(p, '#pw-notes', 80); await shot('scene4-notes'); }

  const s5 = p.locator('#act-universities');
  await toEl(p, touch ? '#atlas-region-m' : '#atlas-type', 90);
  await (touch ? s5.locator('ol[aria-label="Institutions"] button', { hasText: 'IIT Madras' }) : s5.locator('button[aria-label^="Indian Institute of Technology Madras"]')).click();
  await p.waitForTimeout(touch ? 1200 : 300);
  if (!touch) await toEl(p, '#atlas-type', 90);
  await shot('scene5-panel');

  const pinned = await p.evaluate(() => document.querySelector('[data-journey]')?.getAttribute('data-journey') === 'pinned');
  if (pinned) {
    const top = await p.evaluate(() => document.querySelector('[data-journey="pinned"]').getBoundingClientRect().top + scrollY);
    for (const [i, id] of ['technology', 'medicine', 'design'].map((d) => [['technology', 'medicine', 'business', 'design'].indexOf(d), d])) {
      await p.evaluate((y) => scrollTo({ top: y, behavior: 'instant' }), top + ((290 + 46 * i + 26) / 100) * height);
      await p.waitForTimeout(600);
      await shot(`room-${id}`);
    }
  } else {
    await toEl(p, '#explore-technology', 80);
    await shot('room-technology');
  }
  const f = p.locator('footer');
  await f.scrollIntoViewIfNeeded();
  await p.waitForTimeout(500);
  await f.screenshot({ path: `${OUT}/${name}-footer.jpg`, type: 'jpeg', quality: 82 });
  await ctx.close();
}
await run('1440', 1440, 900, false);
await run('1280', 1280, 800, false);
await run('768', 768, 1024, true);
await run('390', 390, 844, true);
await b.close();
console.log('shots written to', OUT);
