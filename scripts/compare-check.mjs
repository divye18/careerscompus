#!/usr/bin/env node
/**
 * Scene 6 (Comparison Studio) capture + basic checks, real Chrome.
 * Usage: node scripts/compare-check.mjs [outDir] [url] [width] [height] [mode: desktop|reduced|nowebgl]
 * Saves viewport shots plus full-height captures of the workspace (`-full`) for every major state.
 */
import { chromium } from 'playwright-core';
import fs from 'node:fs';
const OUT = process.argv[2] || 'docs/qa-screenshots/compare';
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
p.on('console', (m) => m.type() === 'error' && !m.text().includes('Failed to load resource') && errors.push(m.text()));
p.on('response', (r) => { if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`); });
await p.goto(URL, { waitUntil: 'networkidle' });
await p.waitForTimeout(1500);
const tag = `${MODE === 'desktop' ? '' : MODE + '-'}${W}`;
const ws = p.locator('#studio-workspace');
let n = 0;
const name = (s) => `${OUT}/${tag}-${String(n++).padStart(2, '0')}-${s}.jpg`;
const top = async (offset = 84) => { await p.evaluate((o) => scrollTo({ top: document.getElementById('studio-workspace').getBoundingClientRect().top + scrollY - o, behavior: 'instant' }), offset); await p.waitForTimeout(500); };
const shot = async (s) => { await top(); await p.screenshot({ path: name(s), type: 'jpeg', quality: 82 }); };
const full = async (s) => {
  await p.addStyleTag({ content: 'header[data-theme]{visibility:hidden!important} #studio-workspace th{position:static!important}' });
  await ws.screenshot({ path: name(`${s}-full`), type: 'jpeg', quality: 80 });
  await p.evaluate(() => document.querySelectorAll('style').forEach((x) => x.textContent.includes('header[data-theme]{visibility') && x.remove()));
};
const add = async (noun, opt) => {
  await ws.getByRole('button', { name: new RegExp(`Add ${noun}`) }).first().click();
  await ws.locator(`button[data-option="${opt}"]`).click();
  await p.waitForTimeout(250);
};
await p.evaluate(() => scrollTo({ top: document.getElementById('act-comparison').getBoundingClientRect().top + scrollY - 40, behavior: 'instant' }));
await p.waitForTimeout(1000);
await p.screenshot({ path: name('intro'), type: 'jpeg', quality: 82 });
await shot('empty');
await ws.getByRole('button', { name: /Add institution/ }).first().click();
await p.waitForTimeout(300);
await shot('picker');
await ws.locator('button[data-option="iit-delhi"]').click();
await p.waitForTimeout(300);
await shot('one-option');
await add('institution', 'iit-madras');
await shot('two-institutions');
await full('two-institutions');
await add('institution', 'bits-pilani');
await shot('three-institutions');
await full('three-institutions');
await ws.getByRole('button', { name: 'Verified parameters' }).click();
await full('verified-view');
await ws.getByRole('button', { name: 'Differences only' }).click();
await p.waitForTimeout(200);
await full('differences-only');
await ws.getByRole('button', { name: 'Replace IIT Madras' }).click();
await p.waitForTimeout(200);
await shot('replace-picker');
await ws.locator('button[data-option="nlsiu-bengaluru"]').click();
await p.waitForTimeout(200);
await full('after-replace-differences');
await ws.getByRole('button', { name: 'All parameters', exact: true }).click();
await ws.getByRole('button', { name: /^Choose parameters/ }).click();
await p.waitForTimeout(200);
await shot('parameter-chooser');
await ws.getByRole('button', { name: /^Choose parameters/ }).click();
await ws.getByRole('button', { name: /^Courses/ }).click();
await p.waitForTimeout(200);
await shot('courses-empty');
await add('course', 'technology-b-tech-b-e');
await add('course', 'technology-bca');
await full('courses-two');
await ws.getByRole('button', { name: 'Differences only' }).click();
await p.waitForTimeout(200);
await shot('courses-no-differences');
await ws.getByRole('button', { name: 'All parameters', exact: true }).click();
await ws.getByRole('button', { name: /^Programmes/ }).click();
await p.waitForTimeout(200);
await add('programme', 'iit-madras--b-tech');
await add('programme', 'iit-kharagpur--b-arch');
await add('programme', 'nlsiu-bengaluru--ll-m');
await full('programmes-three');
const metrics = await p.evaluate(() => {
  const s = document.getElementById('act-comparison');
  const small = [...s.querySelectorAll('button')].filter((e) => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && (r.height < 43.5 || r.width < 30); }).map((e) => (e.getAttribute('aria-label') || e.textContent || '?').trim().slice(0, 30) + ' ' + Math.round(e.getBoundingClientRect().width) + 'x' + Math.round(e.getBoundingClientRect().height));
  return { docOverflow: document.documentElement.scrollWidth > window.innerWidth, smallTargets: small, presenter: document.querySelector('[data-journey]')?.getAttribute('data-journey'), reason: document.querySelector('[data-journey]')?.getAttribute('data-journey-reason') };
});
console.log(JSON.stringify({ mode: MODE, W, errors, ...metrics }));
await b.close();
