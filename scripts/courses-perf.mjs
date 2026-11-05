#!/usr/bin/env node
/**
 * Scroll-performance of Scene 4 in real Chrome (headed, real GPU). Scrolls a range over ~5 s with
 * requestAnimationFrame stepping and records frame intervals; 5 repeats, medians. Ranges:
 *   transition = Explore end → Pathways intro;  scene4 = the Pathways section (with a full route selected).
 * Usage: node scripts/courses-perf.mjs [out.json] [url] [w] [h] [mode: desktop|mobile]
 */
import { chromium } from 'playwright-core';
import fs from 'node:fs';
import path from 'node:path';
const OUT = process.argv[2] || 'docs/qa-screenshots/courses/perf/report.json';
const URL = process.argv[3] || 'http://localhost:3100';
const W = +(process.argv[4] || 1440), H = +(process.argv[5] || 900);
const mobile = W < 700;
fs.mkdirSync(path.dirname(OUT), { recursive: true });
const median = (a) => [...a].sort((x, y) => x - y)[Math.floor(a.length / 2)];
const b = await chromium.launch({ channel: 'chrome', headless: false });
const ctx = await b.newContext({ viewport: { width: W, height: H }, ...(mobile ? { hasTouch: true, isMobile: true, deviceScaleFactor: 2 } : {}) });
const p = await ctx.newPage();
await p.goto(URL, { waitUntil: 'networkidle' });
await p.waitForTimeout(2500);
const sec = p.locator('#act-courses');
const dom = (n) => sec.locator('ul[aria-labelledby="pw-direction"]').getByRole('button', { name: n, exact: true });
const geo = await p.evaluate(() => { const s = document.getElementById('act-courses'); const t = s.getBoundingClientRect().top + scrollY; return { top: t, bottom: t + s.offsetHeight }; });
const ranges = { transition: [geo.top - 1.5 * H, geo.top + 0.6 * H], scene4: [geo.top, geo.bottom - H] };
const run = (from, to) => p.evaluate(([from, to]) => new Promise((res) => {
  scrollTo({ top: from, behavior: 'instant' });
  const dur = 5000; const frames = []; let last = performance.now(); const t0 = last;
  const step = (now) => {
    frames.push(now - last); last = now;
    const k = Math.min(1, (now - t0) / dur);
    scrollTo({ top: from + (to - from) * k, behavior: 'instant' });
    if (k < 1) requestAnimationFrame(step); else { const f = frames.slice(2); res({ n: f.length, avgFps: 1000 / (f.reduce((a, v) => a + v, 0) / f.length), p95: [...f].sort((a, b) => a - b)[Math.floor(f.length * 0.95)], over33: f.filter((v) => v > 33.4).length }); }
  };
  requestAnimationFrame(step);
}), [from, to]);
const report = { W, H, ranges: {} };
for (const [name, [from, to]] of Object.entries(ranges)) {
  if (name === 'scene4') { await p.evaluate((t) => scrollTo({ top: t, behavior: 'instant' }), geo.top + 200); await p.waitForTimeout(400); await dom('Technology').click(); await sec.locator('button[aria-label="Current education: Class 12"]').click(); await sec.locator('button[aria-label^="Course: B.Tech"]').click(); await sec.locator('button[aria-label="Specialisation: Computer Science"]').click(); await p.waitForTimeout(1200); }
  const runs = [];
  for (let i = 0; i < 5; i++) { runs.push(await run(from, to)); await p.waitForTimeout(500); }
  report.ranges[name] = { medianAvgFps: +median(runs.map((r) => r.avgFps)).toFixed(1), medianP95ms: +median(runs.map((r) => r.p95)).toFixed(1), medianOver33: median(runs.map((r) => r.over33)), minFps: +Math.min(...runs.map((r) => r.avgFps)).toFixed(1), maxFps: +Math.max(...runs.map((r) => r.avgFps)).toFixed(1), runs: runs.map((r) => +r.avgFps.toFixed(1)) };
}
fs.writeFileSync(OUT, JSON.stringify(report, null, 1));
console.log(JSON.stringify(report.ranges));
await b.close();
