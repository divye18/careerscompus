#!/usr/bin/env node
/**
 * Scene 3 (Explore) capture, real Chrome. For one viewport: the Discover→Explore hand-over frames and
 * the settled frame of each of the seven rooms (forwards), plus a backwards pass for two rooms.
 * Usage: node scripts/explore-check.mjs [outDir] [url] [width] [height]
 * Mirrors choreography.ts: EXPLORE_START_VH=290, DOMAIN_VH=46.
 */
import { chromium } from 'playwright-core';
import fs from 'node:fs';
const OUT = process.argv[2] || 'docs/qa-screenshots/explore';
const URL = process.argv[3] || 'http://localhost:3100';
const W = +(process.argv[4] || 1440);
const H = +(process.argv[5] || 900);
const IDS = ['technology', 'medicine', 'business', 'design', 'law', 'architecture', 'science'];
fs.mkdirSync(OUT, { recursive: true });
const b = await chromium.launch({ channel: 'chrome', headless: false });
const p = await (await b.newContext({ viewport: { width: W, height: H } })).newPage();
const errors = [];
p.on('pageerror', (e) => errors.push(String(e)));
p.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
await p.goto(URL, { waitUntil: 'networkidle' });
await p.waitForSelector('[data-world-ready="true"]');
await p.waitForTimeout(1200);
const top = await p.evaluate(() => document.querySelector('[data-journey="pinned"]').getBoundingClientRect().top + scrollY);
const at = (vh) => top + (vh / 100) * H;
const shot = async (name, vh, wait = 1100) => {
  await p.evaluate((y) => scrollTo({ top: y, behavior: 'instant' }), at(vh));
  await p.waitForTimeout(wait);
  await p.screenshot({ path: `${OUT}/${name}.jpg`, type: 'jpeg', quality: 82 });
};
const tag = `${W}`;
for (const vh of [200, 236, 252, 266, 280, 292, 304]) await shot(`${tag}-handover-${vh}`, vh, 800);
for (const [i, id] of IDS.entries()) await shot(`${tag}-room${i + 1}-${id}`, 290 + 46 * i + 26);
// backwards: jump to the end, then scroll up two rooms and settle
await shot(`${tag}-back-to-design`, 290 + 46 * 3 + 26);
await shot(`${tag}-back-to-medicine`, 290 + 46 * 1 + 26);
console.log(JSON.stringify({ errors }));
await b.close();
