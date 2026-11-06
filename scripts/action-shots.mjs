#!/usr/bin/env node
/**
 * Scene 7 screenshots and layout checks at 1440, 1280, 768, 390, 375, 360 with classic scrollbars, plus transition frames.
 * Usage: node scripts/action-shots.mjs <outDir> [url]
 */
import { chromium } from 'playwright-core';
import fs from 'node:fs';
const OUT = process.argv[2];
const URL = process.argv[3] || 'http://localhost:3100';
if (!OUT) throw new Error('usage: action-shots.mjs <outDir> [url]');
fs.mkdirSync(OUT, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const b = await chromium.launch({ channel: 'chrome', headless: false });
let bad = 0;
for (const w of [1440, 1280, 768, 390, 375, 360]) {
  const h = w < 768 ? 800 : 900;
  const p = await (await b.newContext({ viewport: { width: w, height: h } })).newPage();
  await p.goto(URL, { waitUntil: 'load' });
  await sleep(1800);
  const to = async (sel) => { await p.evaluate((s) => document.querySelector(s).scrollIntoView({ behavior: 'instant', block: 'start' }), sel); await sleep(600); };
  await to('#act-next-steps');
  await p.screenshot({ path: `${OUT}/${w}-empty-opening.jpg`, type: 'jpeg', quality: 72 });
  await to('#next-kept');
  await p.screenshot({ path: `${OUT}/${w}-empty-kept.jpg`, type: 'jpeg', quality: 72 });
  const ws = p.locator('#studio-workspace');
  const add = async (noun, id) => { await ws.getByRole('button', { name: new RegExp(`Add ${noun}`) }).first().click(); await ws.locator(`button[data-option="${id}"]`).click(); await sleep(120); };
  const mode = async (n) => { await ws.locator('ul[aria-labelledby="studio-mode"]').getByRole('button', { name: new RegExp(`^${n}`) }).click(); await sleep(100); };
  await add('institution', 'iit-madras');
  await add('institution', 'bits-pilani');
  await mode('Programmes');
  await add('programme', 'vit-vellore--b-tech');
  await mode('Courses');
  await add('course', 'technology-b-tech-b-e');
  for (const [name, sel] of [['kept', '#next-kept'], ['open', '#next-open'], ['next', '#next-steps']]) {
    await to(sel);
    await p.screenshot({ path: `${OUT}/${w}-full-${name}.jpg`, type: 'jpeg', quality: 72 });
  }
  const m = await p.evaluate(() => {
    const cw = document.documentElement.clientWidth;
    const root = document.getElementById('act-next-steps');
    const over = [...root.querySelectorAll('*')].filter((e) => { const r = e.getBoundingClientRect(); return r.width > 0 && r.right > cw + 0.5 && !e.closest('[aria-hidden="true"]'); }).map((e) => e.tagName + ':' + e.textContent.trim().slice(0, 20)).slice(0, 4);
    const small = [...root.querySelectorAll('button,summary,a')].filter((e) => { const r = e.getBoundingClientRect(); return r.height > 0 && r.height < 43.5; }).length;
    return { overflow: document.documentElement.scrollWidth - cw, over, small };
  });
  if (m.overflow > 0 || m.over.length || m.small) bad++;
  console.log(w, JSON.stringify(m));
  if (w === 1440) {
    const geo = await p.evaluate(() => { const r = document.getElementById('act-next-steps').getBoundingClientRect(); return { top: r.top + scrollY, bottom: r.bottom + scrollY }; });
    let i = 0;
    for (const y of [geo.top - 700, geo.top - 300, geo.top + 100, geo.bottom - 800, geo.bottom - 400, geo.bottom]) {
      await p.evaluate((t) => scrollTo({ top: t, behavior: 'instant' }), y);
      await sleep(500);
      await p.screenshot({ path: `${OUT}/1440-transition-${i++}.jpg`, type: 'jpeg', quality: 66 });
    }
  }
  await p.context().close();
}
await b.close();
process.exit(bad ? 1 : 0);
