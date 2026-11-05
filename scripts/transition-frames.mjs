#!/usr/bin/env node
/**
 * Dense frame sequence through the Arrival→Discover transition (real Chrome, 1440×900).
 * Usage: node scripts/transition-frames.mjs [outDir] [url] [stepPercent=2] [endPercent=64]
 */
import { chromium } from 'playwright-core';
import fs from 'node:fs';
const OUT = process.argv[2] || 'docs/qa-screenshots/nocturne/transition-frames';
const URL = process.argv[3] || 'http://localhost:3100';
const STEP = +(process.argv[4] || 2);
const END = +(process.argv[5] || 30);
fs.mkdirSync(OUT, { recursive: true });
const b = await chromium.launch({ channel: 'chrome', headless: false });
const p = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
await p.goto(URL, { waitUntil: 'networkidle' });
await p.waitForSelector('[data-world-ready="true"]');
await p.waitForTimeout(1200);
const len = await p.evaluate(() => { const el = document.querySelector('[data-journey="pinned"]'); return el.offsetHeight - innerHeight; });
let n = 0;
for (let k = 0; k <= END; k += STEP) {
  await p.evaluate((y) => scrollTo({ top: y, behavior: 'instant' }), (k / 100) * len);
  await p.waitForTimeout(650);
  await p.screenshot({ path: `${OUT}/f${String(n++).padStart(2, '0')}-p${String(k).padStart(3, '0')}.jpg`, type: 'jpeg', quality: 72 });
}
await b.close();
console.log('frames', n);
