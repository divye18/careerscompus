#!/usr/bin/env node
/**
 * Interactive-state screenshots (real Chrome): search focus, button hover/focus, selected domain (cyan),
 * keyboard focus ring, mobile menu. Usage: node scripts/states-check.mjs [outDir] [url]
 */
import { chromium } from 'playwright-core';
import fs from 'node:fs';
const OUT = process.argv[2] || 'docs/qa-screenshots/nocturne/states';
const URL = process.argv[3] || 'http://localhost:3100';
fs.mkdirSync(OUT, { recursive: true });
const b = await chromium.launch({ channel: 'chrome', headless: false });
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
const p = await ctx.newPage();
await p.goto(URL, { waitUntil: 'networkidle' });
await p.waitForSelector('[data-world-ready="true"]');
await p.waitForTimeout(1200);
const shot = (n, clip) => p.screenshot({ path: `${OUT}/${n}.jpg`, type: 'jpeg', quality: 82, clip });
const clipHero = { x: 40, y: 530, width: 640, height: 300 };

await p.hover('button:has-text("Explore Courses")');
await p.waitForTimeout(300);
await shot('btn-primary-hover', clipHero);
await p.mouse.move(5, 300);
await p.focus('input[role="combobox"]');
await p.keyboard.type('law');
await p.waitForTimeout(400);
await shot('search-focus-suggestions', { x: 40, y: 530, width: 640, height: 360 });
await p.keyboard.press('Escape'); await p.keyboard.press('Escape');
await p.keyboard.press('Tab'); await p.keyboard.press('Tab'); await p.keyboard.press('Tab');
await p.waitForTimeout(300);
await shot('keyboard-focus-ring', clipHero);

// Discover: select a domain (cyan) + hover another
const geo = await p.evaluate(() => { const e = document.querySelector('[data-journey="pinned"]'); return { top: e.getBoundingClientRect().top + scrollY, len: e.offsetHeight - innerHeight }; });
await p.evaluate((y) => scrollTo({ top: y, behavior: 'instant' }), geo.top + geo.len * 0.9);
await p.waitForTimeout(1500);
await p.click('button[aria-label^="Medicine"]');
await p.hover('button[aria-label^="Design"]');
await p.waitForTimeout(700);
await shot('discover-selected-cyan-and-hover', undefined);
await p.keyboard.press('Tab');
await b.close();
console.log('states captured in', OUT);
