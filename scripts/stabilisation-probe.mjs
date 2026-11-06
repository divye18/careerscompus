#!/usr/bin/env node
/**
 * Stabilisation checks, real Chrome (needs `npx next start -p 3100`).
 *  - no infinite CSS animation is running at rest, in every scroll position sampled
 *  - the Technology room's scan runs once and ends stable
 *  - with prefers-reduced-motion, interim fades are fully visible and nothing animates
 *  - no nav or footer link targets a missing or hidden section
 *  - no text-[10px] class shipped; active nav follows the section; keyboard focus is visible
 * Usage: node scripts/stabilisation-probe.mjs [url]
 */
import { chromium } from 'playwright-core';
const URL = process.argv[2] || 'http://localhost:3100';
let pass = 0, fail = 0;
const ok = (name, cond, info = '') => { if (cond) pass++; else fail++; console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}${info ? ' — ' + info : ''}`); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const b = await chromium.launch({ channel: 'chrome', headless: false });

async function infinite(p) {
  return p.evaluate(() => document.getAnimations().filter((a) => a.effect?.getComputedTiming().iterations === Infinity && a.playState === 'running').map((a) => (a.effect?.target?.className?.baseVal ?? a.effect?.target?.className ?? '').toString().slice(0, 60) + ' ' + (a.animationName || a.transitionProperty || '')));
}

// ---- normal motion
{
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage();
  const errors = [];
  p.on('pageerror', (e) => errors.push(e.message));
  p.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  await p.goto(URL, { waitUntil: 'networkidle' });
  await sleep(1500);
  const height = await p.evaluate(() => document.documentElement.scrollHeight);
  const found = new Set();
  for (let y = 0; y < height; y += Math.round(height / 28)) {
    await p.evaluate((yy) => window.scrollTo({ top: yy, behavior: 'instant' }), y);
    await sleep(500);
    (await infinite(p)).forEach((x) => found.add(x));
  }
  ok('no infinite CSS animation running at any sampled scroll position', found.size === 0, [...found].join(' | '));

  // Technology room: scan runs once
  await p.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await p.evaluate(() => document.getElementById('explore-technology')?.scrollIntoView({ behavior: 'instant', block: 'center' }));
  await sleep(700);
  const scan1 = await p.evaluate(() => document.getAnimations().filter((a) => a.animationName === 'atlas-scan').map((a) => ({ it: a.effect.getComputedTiming().iterations, state: a.playState })));
  await sleep(5000);
  const scan2 = await p.evaluate(() => document.getAnimations().filter((a) => a.animationName === 'atlas-scan').map((a) => ({ it: a.effect.getComputedTiming().iterations, state: a.playState })));
  ok('Technology signal sweep has one iteration', scan1.length === 0 || scan1.every((s) => s.it === 1), JSON.stringify(scan1));
  ok('Technology signal sweep has finished (stable end state)', scan2.every((s) => s.state === 'finished'), JSON.stringify(scan2));

  // links
  const links = await p.evaluate(() => [...document.querySelectorAll('header a[href*="#"], footer a[href*="#"], nav a[href*="#"]')].map((a) => ({ href: a.getAttribute('href'), text: a.textContent.trim(), target: document.getElementById(a.getAttribute('href').split('#')[1] || ''), visible: (() => { const el = document.getElementById(a.getAttribute('href').split('#')[1] || ''); if (!el) return false; const r = el.getBoundingClientRect(); return r.height > 0; })() })).map(({ href, text, visible }) => ({ href, text, visible })));
  ok('every header/footer anchor link points at a rendered section', links.length > 0 && links.every((l) => l.visible), JSON.stringify(links.filter((l) => !l.visible)));
  const hidden = await p.evaluate(() => ['act-future'].filter((id) => document.getElementById(id)));
  ok('hidden interim sections are not in the page', hidden.length === 0, hidden.join(','));
  const text = await p.evaluate(() => document.body.innerText);
  ok('How It Works, Principles and Final CTA copy are absent', !/How it works/i.test(text) && !/Platform principles/i.test(text) && !/Begin your journey/i.test(text));

  // active nav
  await p.evaluate(() => document.getElementById('act-universities')?.scrollIntoView({ behavior: 'instant', block: 'center' }));
  await sleep(900);
  const cur = await p.evaluate(() => [...document.querySelectorAll('header nav a[aria-current]')].map((a) => a.textContent.trim()));
  ok('active nav follows the section in view (Universities)', cur.length === 1 && cur[0] === 'Universities', JSON.stringify(cur));
  await p.evaluate(() => document.getElementById('act-courses')?.scrollIntoView({ behavior: 'instant', block: 'center' }));
  await sleep(900);
  const cur2 = await p.evaluate(() => [...document.querySelectorAll('header nav a[aria-current]')].map((a) => a.textContent.trim()));
  ok('active nav follows the section in view (Courses)', cur2.length === 1 && cur2[0] === 'Courses', JSON.stringify(cur2));

  // keyboard: tab through the header and confirm a visible outline on each focused control
  await p.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await p.evaluate(() => { document.activeElement?.blur(); window.getSelection()?.removeAllRanges(); });
  await p.goto(URL, { waitUntil: 'networkidle' });
  await sleep(800);
  // (the search field is skipped: it shows its focus on its wrapper)
  await p.keyboard.press('Tab');
  let seen = 0, bad = 0;
  for (let i = 0; i < 12; i++) {
    const o = await p.evaluate(() => { const e = document.activeElement; if (!e || e === document.body || e.tagName === 'INPUT') return null; const s = getComputedStyle(e); return { w: parseFloat(s.outlineWidth), st: s.outlineStyle }; });
    if (o) { seen++; if (!(o.w >= 2 && o.st !== 'none')) bad++; }
    await p.keyboard.press('Tab');
  }
  ok('first 12 focus stops all show an outline', seen > 5 && bad === 0, `${seen} stops, ${bad} without`);
  ok('no console or page errors', errors.length === 0, errors.slice(0, 2).join(' | '));
  await ctx.close();
}

// ---- reduced motion
{
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  const p = await ctx.newPage();
  await p.goto(URL, { waitUntil: 'networkidle' });
  await p.evaluate(() => document.getElementById('act-comparison')?.scrollIntoView({ behavior: 'instant', block: 'start' }));
  await sleep(1200);
  const faded = await p.evaluate(() => [...document.querySelectorAll('[data-interim] *')].filter((e) => { const s = getComputedStyle(e); return e.style.opacity !== '' && parseFloat(s.opacity) < 0.99 && e.getBoundingClientRect().height > 8 && !e.matches('[disabled],[aria-disabled="true"]') && !e.closest('[disabled],[aria-disabled="true"],input,select,textarea,button'); }).map((e) => e.tagName + '.' + String(e.className).slice(0, 40) + '=' + getComputedStyle(e).opacity).slice(0, 6));
  ok('interim sections fully visible with reduced motion', faded.length === 0, faded.join(' | '));
  const running = await p.evaluate(() => document.getAnimations().filter((a) => a.playState === 'running' && a.effect?.getComputedTiming().iterations === Infinity).length);
  ok('no infinite animation with reduced motion', running === 0, String(running));
  const scrolls = await p.evaluate(() => document.getAnimations().filter((a) => a.animationName && a.playState === 'running').map((a) => a.animationName));
  ok('no CSS keyframe animation runs with reduced motion', scrolls.length === 0, scrolls.join(','));
  await ctx.close();
}

// ---- widths: overflow
for (const w of [1440, 1280, 768, 390]) {
  const ctx = await b.newContext({ viewport: { width: w, height: 900 } });
  const p = await ctx.newPage();
  await p.goto(URL, { waitUntil: 'networkidle' });
  await sleep(800);
  const o = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  ok(`no horizontal overflow at ${w}px`, o <= 0, `${o}`);
  const tiny = await p.evaluate(() => [...document.querySelectorAll('body *')].filter((e) => { if (!e.childNodes.length || ![...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())) return false; const s = getComputedStyle(e); if (s.display === 'none' || s.visibility === 'hidden' || e.getBoundingClientRect().height === 0) return false; return parseFloat(s.fontSize) < 11 && !e.closest('svg') && !e.closest('.sr-only'); }).map((e) => e.tagName + ':' + e.textContent.trim().slice(0, 24) + ':' + getComputedStyle(e).fontSize).slice(0, 5));
  ok(`no visible HTML text under 11px at ${w}px`, tiny.length === 0, tiny.join(' | '));
  await ctx.close();
}

await b.close();
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
