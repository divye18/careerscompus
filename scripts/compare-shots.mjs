#!/usr/bin/env node
/**
 * Scene 6 screenshots at 1440, 1280, 768, 390, 375, 360 (needs `npx next start -p 3100`): the opening, then a two-institution
 * comparison (element shot of the whole studio), and a programme comparison on wide and phone widths. Also reports
 * horizontal overflow and any control under 44px at each width.
 * Usage: node scripts/compare-shots.mjs <outDir> [url]
 */
import { chromium } from 'playwright-core';
import fs from 'node:fs';
const OUT = process.argv[2];
const URL = process.argv[3] || 'http://localhost:3100';
if (!OUT) throw new Error('usage: compare-shots.mjs <outDir> [url]');
fs.mkdirSync(OUT, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const b = await chromium.launch({ channel: 'chrome', headless: false, args: ['--disable-features=OverlayScrollbar', '--disable-overlay-scrollbar'] });
for (const w of [1440, 1280, 768, 390, 375, 360]) {
  const mobile = w < 768;
  const ctx = await b.newContext({ viewport: { width: w, height: mobile ? 800 : 900 }, ...(mobile ? { hasTouch: true } : {}) });
  const p = await ctx.newPage();
  await p.goto(URL, { waitUntil: 'networkidle' });
  await sleep(1200);
  await p.evaluate(() => document.getElementById('act-comparison').scrollIntoView({ behavior: 'instant', block: 'start' }));
  await sleep(900);
  await p.screenshot({ path: `${OUT}/${w}-opening.jpg`, type: 'jpeg', quality: 72 });
  const ws = p.locator('#studio-workspace');
  const add = async (noun, id) => { await ws.getByRole('button', { name: new RegExp(`Add ${noun}`) }).first().click(); await ws.locator(`button[data-option="${id}"]`).click(); await sleep(150); };
  await add('institution', 'iit-delhi');
  await add('institution', 'iit-madras');
  await sleep(400);
  await p.locator('#act-comparison').screenshot({ path: `${OUT}/${w}-two-institutions-full.jpg`, type: 'jpeg', quality: 70 });
  const m = await p.evaluate(() => ({
    overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    small: [...document.querySelectorAll('#act-comparison button, #act-comparison summary, #act-comparison a')].filter((e) => { const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); return r.height > 0 && r.height < 43.5 && cs.display !== 'none' && !e.closest('table') && !e.closest('details[open]'); }).map((e) => e.textContent.trim().slice(0, 24) + ':' + Math.round(e.getBoundingClientRect().height)).slice(0, 6),
  }));
  console.log(w, JSON.stringify(m));
  await ctx.close();
}
await b.close();
