#!/usr/bin/env node
/**
 * Scene 3 interaction checks (real Chrome, 1440×900): rail navigation, arrow keys, Discover-mark jump,
 * inert (non-active) rooms, backwards scroll, Get Guidance action, focus rings. Prints PASS/FAIL per check.
 * Usage: node scripts/explore-interaction-check.mjs [url]
 */
import { chromium } from 'playwright-core';
const URL = process.argv[2] || 'http://localhost:3100';
const results = [];
const check = (name, ok, detail = '') => { results.push({ name, ok: !!ok, detail }); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? '  — ' + detail : ''}`); };
const b = await chromium.launch({ channel: 'chrome', headless: false });
const p = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
const errors = [];
p.on('pageerror', (e) => errors.push(String(e)));
await p.goto(URL, { waitUntil: 'networkidle' });
await p.waitForSelector('[data-world-ready="true"]');
await p.waitForTimeout(1200);
const railActive = () => p.evaluate(() => document.querySelector('nav[aria-label^="Journey"] a[aria-current="step"]')?.getAttribute('href'));
const settle = (ms = 2800) => p.waitForTimeout(ms);

// 1. rail click → room
await p.click('nav[aria-label^="Journey"] a[href="#explore-law"]');
await settle();
check('rail link lands in the Law room', (await railActive()) === '#explore-law', await railActive());
const roomState = await p.evaluate(() => ({
  inert: document.querySelectorAll('[data-room][inert]').length,
  activeRoom: document.querySelector('[data-room]:not([inert])')?.getAttribute('data-room'),
  focusableInActive: document.querySelectorAll('[data-room]:not([inert]) button').length,
  focusableInInert: document.querySelectorAll('[data-room][inert] button:not([disabled])').length,
}));
check('only the active room is interactive (6 rooms inert)', roomState.inert === 6 && roomState.activeRoom === 'law', JSON.stringify(roomState));

// 2. arrow keys move focus along the rail
await p.focus('nav[aria-label^="Journey"] a[href="#explore-law"]');
await p.keyboard.press('ArrowDown');
const f1 = await p.evaluate(() => document.activeElement?.getAttribute('href'));
await p.keyboard.press('ArrowUp'); await p.keyboard.press('ArrowUp');
const f2 = await p.evaluate(() => document.activeElement?.getAttribute('href'));
check('ArrowDown/ArrowUp move rail focus', f1 === '#explore-architecture' && f2 === '#explore-design', `${f1} then ${f2}`);

// 3. Enter on a focused rail link navigates (keyboard)
await p.keyboard.press('Enter');
await settle();
check('Enter on a rail link navigates to that room', (await railActive()) === '#explore-design', await railActive());

// 4. backwards scroll
await p.click('nav[aria-label^="Journey"] a[href="#explore-science"]');
await settle();
const atScience = await railActive();
await p.click('nav[aria-label^="Journey"] a[href="#explore-technology"]');
await settle(3200);
const atTech = await railActive();
check('forwards then backwards scrolling returns to Technology', atScience === '#explore-science' && atTech === '#explore-technology', `${atScience} → ${atTech}`);
const techVisible = await p.evaluate(() => getComputedStyle(document.querySelector('[data-room="technology"]')).visibility);
check('Technology room visible after scrolling back', techVisible === 'visible');

// 5. Discover mark click jumps into that domain's room
await p.click('nav[aria-label^="Journey"] a[href="#act-discovery"]');
await settle(3200);
await p.click('button[aria-label^="Design"]');
await settle(3600);
check('clicking the Design mark in Discover jumps to the Design room', (await railActive()) === '#explore-design', await railActive());

// 6. Get Guidance inside a room scrolls to the guidance section
await p.click('[data-room="design"] button:has-text("Get Guidance")');
await settle(3500);
const gy = await p.evaluate(() => Math.round(document.getElementById('act-guidance').getBoundingClientRect().top));
check('Get Guidance (in a room) scrolls to the guidance section', Math.abs(gy - 64) < 120, `guidance top at ${gy}px`);

// 7. Explore Careers is honest (disabled, marked Soon)
await p.click('nav[aria-label^="Journey"] a[href="#explore-medicine"]').catch(() => {});
await p.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
await p.click('nav[aria-label^="Journey"] a[href="#explore-medicine"]');
await settle();
const soon = await p.evaluate(() => { const bt = [...document.querySelectorAll('[data-room="medicine"] button')].find((x) => /Explore Careers/.test(x.textContent)); return { disabled: bt?.getAttribute('aria-disabled'), soon: /Soon/i.test(bt?.textContent || '') }; });
check('"Explore Careers" is aria-disabled and labelled Soon (no fake route)', soon.disabled === 'true' && soon.soon, JSON.stringify(soon));

// 8. focus ring on a room button
await p.focus('nav[aria-label^="Journey"] a[href="#explore-medicine"]');
for (let k = 0; k < 40; k++) { await p.keyboard.press('Shift+Tab'); if (await p.evaluate(() => document.activeElement?.closest('[data-room]') && /Get Guidance/.test(document.activeElement.textContent))) break; }
await p.waitForTimeout(500); // outline colour transitions with the button's transition-colors
const ring = await p.evaluate(() => { const el = document.activeElement; const cs = getComputedStyle(el); return { outline: cs.outlineStyle + ' ' + cs.outlineWidth + ' ' + cs.outlineColor }; });
const onRoom = await p.evaluate(() => !!document.activeElement?.closest('[data-room="medicine"]'));
check("Tab reaches the active room's buttons (never an invisible control)", onRoom);
check('keyboard focus shows a visible cyan outline', ring.outline === 'solid 2px rgb(53, 230, 230)', ring.outline);

check('no page errors', errors.length === 0, errors.join(' | ').slice(0, 200));
await b.close();
const failed = results.filter((r) => !r.ok).length;
console.log(failed ? `\n${failed} CHECK(S) FAILED` : '\nALL INTERACTION CHECKS PASSED');
process.exit(failed ? 1 : 0);
