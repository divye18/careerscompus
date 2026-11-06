#!/usr/bin/env node
/**
 * Scene 6 review package screenshots (needs `npx next start -p 3100`). Usage: node scripts/compare-review-shots.mjs <outDir> [url]
 *  1440: opening, two- and three-institution comparisons, verified programmes, orientation (courses), unknown-information
 *        section, an opened source with date, Scene 5 to 6 transition frames.
 *  390:  opening and the whole mobile flow (empty, chooser, one option, two options, a source, the unknown list).
 */
import { chromium } from 'playwright-core';
import fs from 'node:fs';
const OUT = process.argv[2];
const URL = process.argv[3] || 'http://localhost:3100';
if (!OUT) throw new Error('usage: compare-review-shots.mjs <outDir> [url]');
fs.mkdirSync(OUT, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const b = await chromium.launch({ channel: 'chrome', headless: false });

async function session(w, h, mobile) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, ...(mobile ? { hasTouch: true, isMobile: true, deviceScaleFactor: 2 } : {}) });
  const p = await ctx.newPage();
  await p.goto(URL, { waitUntil: 'networkidle' });
  await sleep(1200);
  const ws = p.locator('#studio-workspace');
  const toStudio = async (sel = '#act-comparison') => { await p.evaluate((s) => document.querySelector(s).scrollIntoView({ behavior: 'instant', block: 'start' }), sel); await sleep(800); };
  const add = async (noun, id) => { await ws.getByRole('button', { name: new RegExp(`Add ${noun}`) }).first().click(); await ws.locator(id ? `button[data-option="${id}"]` : 'button[data-option]:not(:disabled)').first().click(); await sleep(200); };
  const mode = async (name) => { await ws.locator('ul[aria-labelledby="studio-mode"]').getByRole('button', { name: new RegExp(`^${name}`) }).click(); await sleep(250); };
  const shot = (name, loc) => (loc || p).screenshot({ path: `${OUT}/${name}.jpg`, type: 'jpeg', quality: 74 });
  return { ctx, p, ws, toStudio, add, mode, shot };
}

// ---------- desktop 1440
{
  const { ctx, p, ws, toStudio, add, mode, shot } = await session(1440, 900, false);
  await toStudio();
  await shot('1440-01-opening');
  // Scene 5 -> 6 transition: scroll through the boundary
  const top = await p.evaluate(() => document.getElementById('act-comparison').getBoundingClientRect().top + scrollY);
  let i = 0;
  for (const off of [-1.1, -0.7, -0.35, -0.1, 0.2, 0.45]) {
    await p.evaluate((y) => scrollTo({ top: y, behavior: 'instant' }), top + off * 900);
    await sleep(700);
    await shot(`1440-02-transition-${String(i++).padStart(2, '0')}`);
  }
  await add('institution', 'iit-delhi');
  await add('institution', 'iit-madras');
  await sleep(300);
  await shot('1440-03-two-institutions-full', p.locator('#act-comparison'));
  // opened source with the verification date
  const sum = ws.locator('[data-row="established"]:visible details summary').first();
  await sum.scrollIntoViewIfNeeded();
  await sum.click();
  await sleep(300);
  await p.evaluate(() => [...document.querySelectorAll('[data-row="established"]')].find((e) => e.getBoundingClientRect().height > 0).scrollIntoView({ behavior: 'instant', block: 'center' }));
  await sleep(300);
  await shot('1440-04-source-and-date');
  // unknown information
  await p.evaluate(() => document.querySelector('[data-missing-list]').scrollIntoView({ behavior: 'instant', block: 'start' }));
  await sleep(500);
  await shot('1440-05-unknown-information');
  await add('institution', 'bits-pilani');
  await sleep(300);
  await shot('1440-06-three-institutions-full', p.locator('#act-comparison'));
  // differences only
  await ws.getByRole('button', { name: 'Differences only', exact: true }).click();
  await sleep(300);
  await shot('1440-07-differences-only', p.locator('#studio-workspace'));
  // verified programmes
  await mode('Programmes');
  await add('programme', 'iit-madras--b-tech');
  await add('programme', 'iit-kharagpur--b-tech');
  await ws.getByRole('button', { name: 'All parameters', exact: true }).click();
  await sleep(300);
  await shot('1440-08-programmes-verified-full', p.locator('#act-comparison'));
  // orientation (course pathways)
  await mode('Courses');
  await add('course');
  await add('course');
  await ws.getByRole('button', { name: 'All parameters', exact: true }).click();
  await sleep(300);
  await shot('1440-09-courses-orientation-full', p.locator('#act-comparison'));
  await ctx.close();
}

// ---------- mobile 390
{
  const { ctx, p, ws, toStudio, add, shot } = await session(390, 844, true);
  await toStudio();
  await shot('390-01-opening');
  await toStudio('#studio-workspace');
  await shot('390-02-empty');
  await ws.getByRole('button', { name: /Add institution/ }).first().click();
  await sleep(400);
  await shot('390-03-chooser');
  await ws.locator('button[data-option="iit-delhi"]').click();
  await sleep(300);
  await shot('390-04-one-option');
  await add('institution', 'iit-madras');
  await toStudio('#studio-workspace');
  await shot('390-05-two-options');
  await p.evaluate(() => [...document.querySelectorAll('[data-row="location"]')].find((e) => e.getBoundingClientRect().height > 0).scrollIntoView({ behavior: 'instant', block: 'center' }));
  await sleep(300);
  await shot('390-06-a-difference');
  const sum = ws.locator('[data-row="established"]:visible details summary').first();
  await sum.scrollIntoViewIfNeeded();
  await sum.click();
  await sleep(300);
  await p.evaluate(() => [...document.querySelectorAll('[data-row="established"]')].find((e) => e.getBoundingClientRect().height > 0).scrollIntoView({ behavior: 'instant', block: 'center' }));
  await sleep(300);
  await shot('390-07-source-and-date');
  await p.evaluate(() => document.querySelector('[data-missing-list]').scrollIntoView({ behavior: 'instant', block: 'start' }));
  await sleep(500);
  await shot('390-08-unknown-information');
  await shot('390-09-full', p.locator('#act-comparison'));
  await ctx.close();
}
await b.close();
console.log('review shots written to', OUT);
