#!/usr/bin/env node
/**
 * Meridian Atlas — real-browser visual & performance check.
 *
 * Drives the locally installed Google Chrome (headed, real GPU) via playwright-core.
 * The in-app preview pane throttles rendering when hidden, so fps measured there is not valid;
 * this script exists so measurements come from a visible, real browser window.
 *
 * Usage:
 *   node scripts/visual-check.mjs [--url http://localhost:3100] [--out docs/qa-screenshots/m1]
 *                                 [--only desktop1440,desktop1280,mobile390,reduced,nowebgl]
 *                                 [--video] [--no-perf]
 *
 * Run against a production build for meaningful LCP numbers:
 *   npm run build && npx next start -p 3100
 */
import { chromium } from 'playwright-core';
import fs from 'node:fs';
import path from 'node:path';

const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, a, i, arr) => {
    if (a.startsWith('--')) acc.push([a.slice(2), arr[i + 1] && !arr[i + 1].startsWith('--') ? arr[i + 1] : true]);
    return acc;
  }, [])
);
const URL = args.url || 'http://localhost:3100';
const OUT = args.out || 'docs/qa-screenshots/m1';
const ONLY = args.only ? String(args.only).split(',') : null;
const VIDEO = !!args.video;
const PERF = !args['no-perf'];
const PERF_ONLY = !!args['perf-only'];
const INJECT = typeof args.inject === 'string' ? args.inject : null; // CSS injected for A/B perf experiments
fs.mkdirSync(OUT, { recursive: true });

const PINNED_MARKS = [0, 0.04, 0.09, 0.14, 0.2, 0.28, 0.36, 0.44, 0.52, 0.62, 0.8, 1];

const RUNS = [
  { name: 'desktop1440', viewport: { width: 1440, height: 900 } },
  { name: 'desktop1280', viewport: { width: 1280, height: 800 } },
  { name: 'mobile390', viewport: { width: 390, height: 844 }, mobile: true },
  { name: 'reduced', viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' },
  { name: 'nowebgl', viewport: { width: 1440, height: 900 }, noWebGL: true },
].filter((r) => !ONLY || ONLY.includes(r.name));

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function collectVitals(page) {
  return page.evaluate(
    () =>
      new Promise((resolve) => {
        let lcp = null;
        let lcpEl = null;
        let cls = 0;
        new PerformanceObserver((l) => {
          for (const e of l.getEntries()) {
            lcp = e.startTime;
            lcpEl = e.element ? `${e.element.tagName}.${String(e.element.className).slice(0, 40)}` : null;
          }
        }).observe({ type: 'largest-contentful-paint', buffered: true });
        new PerformanceObserver((l) => {
          for (const e of l.getEntries()) if (!e.hadRecentInput) cls += e.value;
        }).observe({ type: 'layout-shift', buffered: true });
        setTimeout(() => resolve({ lcp, lcpEl, cls }), 1500);
      })
  );
}

/** Scroll through the journey with rAF in the page and record frame intervals. */
async function measureScrollFrames(page, from, to, durationMs) {
  return page.evaluate(
    ({ from, to, durationMs }) =>
      new Promise((resolve) => {
        const frames = [];
        let last = performance.now();
        const t0 = last;
        window.scrollTo({ top: from, behavior: 'instant' });
        const step = (now) => {
          frames.push(now - last);
          last = now;
          const k = Math.min(1, (now - t0) / durationMs);
          window.scrollTo({ top: from + (to - from) * k, behavior: 'instant' });
          if (k < 1) requestAnimationFrame(step);
          else {
            const f = frames.slice(2).sort((a, b) => a - b);
            const avg = f.reduce((s, v) => s + v, 0) / f.length;
            resolve({
              frames: f.length,
              avgFps: +(1000 / avg).toFixed(1),
              p50ms: +f[Math.floor(f.length * 0.5)].toFixed(1),
              p95ms: +f[Math.floor(f.length * 0.95)].toFixed(1),
              over33ms: f.filter((v) => v > 33.4).length,
              visibility: document.visibilityState,
            });
          }
        };
        requestAnimationFrame(step);
      }),
    { from, to, durationMs }
  );
}

async function measureIdle(page, ms) {
  return page.evaluate(
    (ms) =>
      new Promise((resolve) => {
        let n = 0;
        const t0 = performance.now();
        const f = (now) => {
          n++;
          if (now - t0 < ms) requestAnimationFrame(f);
          else resolve({ idleFps: +((n * 1000) / (now - t0)).toFixed(1), visibility: document.visibilityState });
        };
        requestAnimationFrame(f);
      }),
    ms
  );
}

const report = { url: URL, date: new Date().toISOString(), runs: {} };

for (const run of RUNS) {
  const browser = await chromium.launch({
    channel: 'chrome',
    headless: false,
    args: run.noWebGL ? ['--disable-webgl', '--disable-webgl2', '--disable-3d-apis'] : [],
  });
  const ctx = await browser.newContext({
    viewport: run.viewport,
    deviceScaleFactor: run.mobile ? 3 : 1,
    isMobile: !!run.mobile,
    hasTouch: !!run.mobile,
    reducedMotion: run.reducedMotion || 'no-preference',
    recordVideo: VIDEO ? { dir: path.join(OUT, 'video'), size: run.viewport } : undefined,
  });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));

  await page.goto(URL, { waitUntil: 'networkidle' });
  if (INJECT) await page.addStyleTag({ content: INJECT });
  const r = { viewport: run.viewport, errors };

  r.presenter = await page.evaluate(() => document.querySelector('[data-journey]')?.getAttribute('data-journey'));
  r.reason = await page.evaluate(() => document.querySelector('[data-journey]')?.getAttribute('data-journey-reason'));
  if (r.presenter === 'pinned') {
    await page.waitForSelector('[data-world-ready="true"]', { timeout: 15000 }).catch(() => (r.worldReady = false));
  }
  await sleep(1500);
  r.vitals = await collectVitals(page);
  r.horizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);

  const shots = [];
  if (r.presenter === 'pinned') {
    const geo = await page.evaluate(() => {
      const el = document.querySelector('[data-journey="pinned"]');
      const top = el.getBoundingClientRect().top + window.scrollY;
      return { top, len: el.offsetHeight - window.innerHeight };
    });
    for (const p of PERF_ONLY ? [] : PINNED_MARKS) {
      await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), geo.top + p * geo.len);
      await sleep(1100); // let the progress spring settle
      const file = path.join(OUT, `${run.name}-p${String(Math.round(p * 100)).padStart(3, '0')}.jpg`);
      await page.screenshot({ path: file, type: 'jpeg', quality: 80 });
      shots.push(file);
    }
    if (PERF && !VIDEO) {
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
      await sleep(800);
      r.idle = await measureIdle(page, 3000);
      r.scroll = await measureScrollFrames(page, geo.top, geo.top + geo.len, 6000);
    }
  } else {
    // flow presenter: hero, mid-transition and settled discover
    const marks = await page.evaluate(() => {
      const d = document.getElementById('act-discovery');
      const top = d.getBoundingClientRect().top + window.scrollY;
      return [0, top - window.innerHeight * 0.6, top - window.innerHeight * 0.25, top, top + d.offsetHeight * 0.45];
    });
    for (const [k, y] of marks.entries()) {
      await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), y);
      await sleep(700);
      const file = path.join(OUT, `${run.name}-s${k}.jpg`);
      await page.screenshot({ path: file, type: 'jpeg', quality: 80 });
      shots.push(file);
    }
  }
  r.screenshots = shots;
  report.runs[run.name] = r;
  await ctx.close();
  await browser.close();
  console.log(run.name, JSON.stringify({ presenter: r.presenter, reason: r.reason, vitals: r.vitals, idle: r.idle, scroll: r.scroll, errors: errors.length, overflow: r.horizontalOverflow }));
}

fs.writeFileSync(path.join(OUT, VIDEO ? 'report-video.json' : 'report.json'), JSON.stringify(report, null, 2));
console.log('report written to', OUT);
