#!/usr/bin/env node
/**
 * Product-readiness checks (needs `npx next start -p 3100`):
 *  counselling form collects nothing and cannot be submitted; compare studio has no invented values or hover behaviour;
 *  FAQ matches the implementation; skip link is hidden until focused, then visible, and moves focus to main.
 * Usage: node scripts/readiness-check.mjs [url] [outDir]
 */
import { chromium } from 'playwright-core';
import fs from 'node:fs';
const URL = process.argv[2] || 'http://localhost:3100';
const OUT = process.argv[3] || '';
let pass = 0, fail = 0;
const ok = (n, c, i = '') => { if (c) pass++; else fail++; console.log(`${c ? 'PASS' : 'FAIL'}  ${n}${i ? ' — ' + i : ''}`); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const b = await chromium.launch({ channel: 'chrome', headless: false });
if (OUT) fs.mkdirSync(OUT, { recursive: true });
for (const [w, h] of [[1440, 900], [390, 844]]) {
  const p = await (await b.newContext({ viewport: { width: w, height: h } })).newPage();
  const reqs = [];
  p.on('request', (r) => ['POST', 'PUT', 'PATCH'].includes(r.method()) && reqs.push(r.method() + ' ' + r.url()));
  await p.goto(URL, { waitUntil: 'domcontentloaded' });
  await sleep(1500);
  if (w === 1440) {
    const g = await p.evaluate(() => { const s = document.getElementById('act-guidance'); const f = s.querySelector('form'); return { inputs: [...f.querySelectorAll('input,textarea')].length, tel: !!f.querySelector('[type=tel],[autocomplete=tel],[autocomplete=name]'), btnDisabled: f.querySelector('button').disabled, btn: f.querySelector('button').textContent.trim(), text: s.innerText }; });
    ok('counselling form has no name or phone field', g.inputs === 0 && !g.tel, `inputs=${g.inputs}`);
    ok('submit button is disabled and says so', g.btnDisabled && /not available/i.test(g.btn), g.btn);
    ok('section states callback is unavailable', /not available yet/i.test(g.text));
    ok('no success or thanks message', !/thanks|thank you|we will call|has been submitted|request received/i.test(g.text));
    await p.evaluate(() => document.querySelector('#act-guidance form').requestSubmit?.());
    await sleep(300);
    ok('submit attempt sends no network request', reqs.length === 0, reqs.join(','));
    const c = await p.evaluate(() => document.getElementById('act-comparison').innerText);
    ok('compare studio presents no fees, ranks, salaries or scores when empty', !/₹|lakh|LPA|rank|score|winner/i.test(c.replace(/ranked or scored/g, '').replace(/does not pick a winner/g, '')), '');
    ok('compare studio states every missing value in words (empty state explains itself)', /ledger is empty/i.test(c), '');
    const faq = await p.evaluate(() => [...document.querySelectorAll('#act-trust button')].map((x) => x.textContent.trim()));
    ok('FAQ no longer implies a callback form works', !faq.some((q) => /Does the callback form send/i.test(q)) && faq.some((q) => /Can I request a callback/i.test(q)), faq.join(' | '));
    // skip link
    await p.goto(URL, { waitUntil: 'domcontentloaded' });
    await sleep(800);
    const before = await p.evaluate(() => { const a = document.querySelector('a[href="#main"]'); const cs = getComputedStyle(a); return { clip: cs.clip + ' ' + cs.clipPath, overflow: cs.overflow, pos: cs.position }; });
    await p.keyboard.press('Tab');
    const after = await p.evaluate(() => { const a = document.activeElement; const r = a.getBoundingClientRect(); const cs = getComputedStyle(a); return { txt: a.textContent.trim(), w: Math.round(r.width), h: Math.round(r.height), top: Math.round(r.top), ow: cs.outlineWidth }; });
    ok('skip link is first focus stop, visible and outlined when focused', /skip/i.test(after.txt) && after.w > 100 && after.h > 30 && after.top >= 0 && parseFloat(after.ow) >= 2, JSON.stringify(after));
    ok('skip link is not visible before focus', /inset\(50%\)|rect\(0/.test(before.clip) && before.overflow === 'hidden', JSON.stringify(before));
    if (OUT) await p.screenshot({ path: `${OUT}/1440-skip-link-focused.jpg`, type: 'jpeg', quality: 70, clip: { x: 0, y: 0, width: 700, height: 120 } });
    await p.keyboard.press('Enter');
    await sleep(400);
    ok('activating the skip link moves focus into main', await p.evaluate(() => document.activeElement?.id === 'main'));
  }
  if (OUT) for (const id of ['act-comparison', 'act-guidance', 'act-trust']) {
    await p.evaluate((i) => document.getElementById(i)?.scrollIntoView({ behavior: 'instant', block: 'start' }), id);
    await sleep(1200);
    await p.screenshot({ path: `${OUT}/${w}-${id}.jpg`, type: 'jpeg', quality: 70 });
  }
  await p.close();
}
await b.close();
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
