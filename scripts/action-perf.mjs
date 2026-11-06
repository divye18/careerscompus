#!/usr/bin/env node
/**
 * Scroll-performance of Scene 7 in real Chrome (headed, real GPU). Scrolls a range over ~5 s with
 * requestAnimationFrame stepping and records frame intervals; 5 repeats, medians. Ranges:
 *   transition = Atlas end → Studio intro;  scene7 = the Studio section (three institutions in the ledger).
 * Usage: node scripts/courses-perf.mjs [out.json] [url] [w] [h] [mode: desktop|mobile]
 */
import { chromium } from 'playwright-core';
import fs from 'node:fs';
import path from 'node:path';
const OUT = process.argv[2] || 'docs/qa-screenshots/next-steps/perf/report.json';
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
const geo = await p.evaluate(() => { const s = document.getElementById('act-next-steps'); const t = s.getBoundingClientRect().top + scrollY; return { top: t, bottom: t + s.offsetHeight }; });
const ranges = { transition: [geo.top - 1.5 * H, geo.top + 0.6 * H], scene7: [geo.top, (await p.evaluate(() => { const r = document.getElementById('act-next-steps'); return r.getBoundingClientRect().top + scrollY + r.offsetHeight; })) - H] };
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
for (const [name, [from, to0]] of Object.entries(ranges)) {
  let to = to0;
  if (name === 'scene7') { await p.evaluate((t) => scrollTo({ top: t, behavior: 'instant' }), geo.top + 200); await p.waitForTimeout(400); for (const id of ['iit-delhi', 'iit-kharagpur', 'bits-pilani']) { await p.locator('#studio-workspace').getByRole('button', { name: 'Add institution' }).first().click(); await p.locator(`button[data-option="${id}"]`).click(); await p.waitForTimeout(100); } await p.waitForTimeout(1200); to = (await p.evaluate(() => { const r = document.getElementById('act-next-steps'); return r.getBoundingClientRect().top + scrollY + r.offsetHeight; })) - H; }
  const runs = [];
  for (let i = 0; i < 5; i++) { runs.push(await run(from, to)); await p.waitForTimeout(500); }
  report.ranges[name] = { medianAvgFps: +median(runs.map((r) => r.avgFps)).toFixed(1), medianP95ms: +median(runs.map((r) => r.p95)).toFixed(1), medianOver33: median(runs.map((r) => r.over33)), minFps: +Math.min(...runs.map((r) => r.avgFps)).toFixed(1), maxFps: +Math.max(...runs.map((r) => r.avgFps)).toFixed(1), runs: runs.map((r) => +r.avgFps.toFixed(1)) };
}
fs.writeFileSync(OUT, JSON.stringify(report, null, 1));
console.log(JSON.stringify(report.ranges));
await b.close();
