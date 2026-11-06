#!/usr/bin/env node
/**
 * Horizontal-overflow probe, real Chrome with CLASSIC (non-overlay) scrollbars (needs `npx next start -p 3100`).
 * For each width it reports scrollWidth - clientWidth and the elements whose box extends past the viewport and are not
 * clipped by an ancestor, walking the whole page so every scene and the footer are covered.
 * Usage: node scripts/overflow-probe.mjs [url] [outDir]
 */
import { chromium } from 'playwright-core';
import fs from 'node:fs';
const URL = process.argv[2] || 'http://localhost:3100';
const OUT = process.argv[3] || '';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const b = await chromium.launch({ channel: 'chrome', headless: false, args: ['--disable-features=OverlayScrollbar', '--disable-overlay-scrollbar'] });
let bad = 0;
for (const w of [768, 390, 375, 360]) {
  const ctx = await b.newContext({ viewport: { width: w, height: 800 } });
  const p = await ctx.newPage();
  await p.goto(URL, { waitUntil: 'networkidle' });
  await sleep(800);
  const h = await p.evaluate(() => document.documentElement.scrollHeight);
  const found = new Map();
  let max = 0;
  for (let y = 0; y <= h; y += 400) {
    await p.evaluate((yy) => window.scrollTo({ top: yy, behavior: 'instant' }), y);
    await sleep(120);
    const r = await p.evaluate(() => {
      const cw = document.documentElement.clientWidth;
      const clipped = (el) => { for (let a = el.parentElement; a && a !== document.documentElement; a = a.parentElement) { const o = getComputedStyle(a); if (/(hidden|clip|auto|scroll)/.test(o.overflowX) && a.getBoundingClientRect().right <= cw + 0.5) return true; } return false; };
      const list = [];
      for (const el of document.body.querySelectorAll('*')) {
        const r = el.getBoundingClientRect();
        if (r.width === 0 || r.height === 0 || r.right <= cw + 0.5) continue;
        const cs = getComputedStyle(el);
        if (cs.visibility === 'hidden' || cs.display === 'none' || el.closest('[inert]') || clipped(el)) continue;
        list.push(`${el.tagName.toLowerCase()}.${String(el.className?.baseVal ?? el.className).slice(0, 50)} right=${Math.round(r.right)} cw=${cw}`);
      }
      return { over: document.documentElement.scrollWidth - cw, list: list.slice(0, 8) };
    });
    max = Math.max(max, r.over);
    r.list.forEach((l) => found.set(l, (found.get(l) || 0) + 1));
  }
  const cw = await p.evaluate(() => document.documentElement.clientWidth);
  console.log(`${w}px (clientWidth ${cw}, scrollbar ${w - cw}px): max scrollWidth overflow ${max}px; offending boxes ${found.size}`);
  [...found.keys()].slice(0, 6).forEach((k) => console.log('   ', k));
  if (max > 0) bad++;
  if (OUT) { fs.mkdirSync(OUT, { recursive: true }); await p.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' })); await p.screenshot({ path: `${OUT}/${w}-top.jpg`, type: 'jpeg', quality: 70 }); }
  await ctx.close();
}
await b.close();
process.exit(bad ? 1 : 0);
