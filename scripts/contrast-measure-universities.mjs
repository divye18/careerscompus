#!/usr/bin/env node
/**
 * Measured WCAG contrast of Scene 4 text (real pixels, Chrome). Same method as contrast-measure.mjs: DOM text is
 * made transparent, the lightest background pixel under each text box is sampled, the element's computed colour
 * (with alpha) is composited over it. Several pathway states and scroll positions are covered.
 * Usage: node scripts/contrast-measure-courses.mjs [out.md] [url] [w] [h]
 */
import { chromium } from 'playwright-core';
import fs from 'node:fs';
const OUT = process.argv[2] || 'docs/qa-screenshots/universities/contrast-measured-1440.md';
const URL = process.argv[3] || 'http://localhost:3100';
const W = +(process.argv[4] || 1440), H = +(process.argv[5] || 900);
const b = await chromium.launch({ channel: 'chrome', headless: false });
const p = await (await b.newContext({ viewport: { width: W, height: H }, reducedMotion: 'reduce' })).newPage();
await p.goto(URL, { waitUntil: 'networkidle' });
await p.waitForTimeout(1500);
const mobile = W < 700;
const sec = p.locator('#act-universities');
const openFilters = async () => { if (mobile) { const t = sec.getByRole('button', { name: /^Filters/ }); if ((await t.getAttribute('aria-expanded')) !== 'true') await t.click(); } };
const states = [
  ['empty', async () => {}],
  ['region-south', async () => { await sec.getByRole('button', { name: /^South India/ }).first().click(); }],
  ['institution-iit-kanpur', async () => { await sec.getByRole('button', { name: /^Central India/ }).first().click().catch(() => {}); await (mobile ? sec.locator('ol[aria-label="Institutions"] button', { hasText: 'IIT Kanpur' }) : sec.locator('button[aria-label^="Indian Institute of Technology Kanpur"]')).click(); await sec.getByText('How we checked this').click(); }],
  ['filters-ini-medicine', async () => { await openFilters(); await sec.getByRole('button', { name: 'Reset filters' }).click(); await sec.getByRole('button', { name: /^Institutes of national importance/ }).click(); await sec.getByRole('button', { name: /^Medicine & Healthcare/ }).click(); }],
];
const rows = []; let total = 0, fails = 0;
for (const [name, act] of states) {
  await act();
  await p.waitForTimeout(1200);
  for (const anchor of ['#act-universities', '#atlas-type', '#atlas-region-m', '#atlas-filters', '__bottom__']) {
    await p.evaluate((a) => { if (a === '__bottom__') { const sec = document.getElementById('act-universities'); scrollTo({ top: sec.getBoundingClientRect().bottom + scrollY - innerHeight - 220, behavior: 'instant' }); return; }
    const el = document.querySelector(a); if (!el || el.getBoundingClientRect().height === 0) return; scrollTo({ top: el.getBoundingClientRect().top + scrollY - (a === '#act-universities' ? 40 : 120), behavior: 'instant' }); }, anchor);
    await p.waitForTimeout(700);
    const items = await p.evaluate(() => {
      const root = document.getElementById('act-universities'); const out = [];
      const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT); const seen = new Set();
      while (w.nextNode()) {
        const n = w.currentNode, el = n.parentElement;
        if (!n.textContent.trim() || seen.has(el) || el.closest('svg') || el.closest('[aria-hidden="true"]') || el.closest('.sr-only')) continue;
        seen.add(el);
        const r = document.createRange(); r.selectNodeContents(n); const bb = r.getBoundingClientRect();
        if (bb.width < 2 || bb.height < 2 || bb.top < 70 || bb.bottom > innerHeight - 20) continue; // fully on screen, below the fixed header
        if (el.closest('button:disabled')) continue; // inactive controls are exempt
        let op = 1;
        for (let e = el; e; e = e.parentElement) op *= +getComputedStyle(e).opacity;
        if (op < 0.05) continue; // visually hidden (e.g. rail labels until hover/active)
        const cs = getComputedStyle(el);
        const c2 = document.createElement('canvas').getContext('2d', { willReadFrequently: true });
        c2.clearRect(0, 0, 1, 1); c2.fillStyle = cs.color; c2.fillRect(0, 0, 1, 1); const px = c2.getImageData(0, 0, 1, 1).data;
        out.push({ rgba: [px[0], px[1], px[2], px[3] / 255], text: n.textContent.trim().slice(0, 34), x: bb.x, y: bb.y, w: bb.width, h: bb.height, size: parseFloat(cs.fontSize), weight: +cs.fontWeight });
      }
      return out;
    });
    if (!items.length) continue;
    await p.addStyleTag({ content: '#act-universities *{color:transparent!important;-webkit-text-fill-color:transparent!important}' });
    await p.waitForTimeout(200);
    const png = (await p.screenshot({ type: 'png' })).toString('base64');
    await p.evaluate(() => document.querySelectorAll('style').forEach((s) => s.textContent.includes('text-fill-color:transparent') && s.remove()));
    const res = await p.evaluate(async ({ png, items }) => {
      const img = await createImageBitmap(await (await fetch('data:image/png;base64,' + png)).blob());
      const cv = new OffscreenCanvas(img.width, img.height); const cx = cv.getContext('2d', { willReadFrequently: true }); cx.drawImage(img, 0, 0);
      const lum = (c) => { const [r, g, b] = c.map((v) => ((v /= 255) <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
      return items.map((it) => {
        const x = Math.max(0, Math.floor(it.x)), y = Math.max(0, Math.floor(it.y));
        const w = Math.max(1, Math.min(img.width - x, Math.ceil(it.w))), h = Math.max(1, Math.min(img.height - y, Math.ceil(it.h)));
        const d = cx.getImageData(x, y, w, h).data; let best = null, bl = -1;
        for (let k = 0; k < d.length; k += 4) { const l = lum([d[k], d[k + 1], d[k + 2]]); if (l > bl) { bl = l; best = [d[k], d[k + 1], d[k + 2]]; } }
        const a = it.rgba[3]; const fg = [0, 1, 2].map((q) => it.rgba[q] * a + best[q] * (1 - a)); const lf = lum(fg);
        const ratio = (Math.max(lf, bl) + 0.05) / (Math.min(lf, bl) + 0.05);
        const large = it.size >= 24 || (it.size >= 18.66 && it.weight >= 700);
        return { text: it.text, size: it.size, ratio, need: large ? 3 : 4.5 };
      });
    }, { png, items });
    const bad = res.filter((r) => r.ratio < r.need); total += res.length; fails += bad.length;
    const worst = res.reduce((a, r) => (r.ratio / r.need < a.ratio / a.need ? r : a));
    rows.push(`| ${name} | ${anchor} | ${res.length} | ${worst.ratio.toFixed(2)} (need ${worst.need}) "${worst.text}" ${worst.size}px | ${bad.length ? 'FAIL: ' + bad.map((r) => `"${r.text}" ${r.ratio.toFixed(2)}`).join('; ') : 'pass'} |`);
  }
}
const md = `# Scene 5 measured text contrast (${W}x${H})\n\nReal-pixel measurement: DOM text made transparent, lightest background pixel under each text box, computed colour (with alpha) composited over it. Disabled controls and aria-hidden decoration are excluded.\n\n| State | View | Text elements | Lowest ratio | Result |\n|---|---|---:|---|---|\n${rows.join('\n')}\n\nText/background pairs tested: ${total}; passing: ${total - fails}; failing: ${fails}\n`;
fs.writeFileSync(OUT, md); console.log(md); await b.close();
