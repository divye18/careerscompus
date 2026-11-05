#!/usr/bin/env node
/**
 * Measured WCAG text contrast for the parts of the page no scene script covers: the interim Light Royal sections, the
 * footer and the 404 page. Text is made transparent, the background pixels under each text box are sampled, and the
 * lower of the two ratios against the lightest and darkest pixel is kept (these sections mix dark-on-light and
 * light-on-dark). Writes a markdown report. Usage: node scripts/contrast-measure-site.mjs [out.md] [url] [w] [h]
 */
import { chromium } from 'playwright-core';
import fs from 'node:fs';
const OUT = process.argv[2] || 'docs/qa-screenshots/audit/contrast-site-1440.md';
const URL = (process.argv[3] || 'http://localhost:3100').replace(/\/$/, '');
const W = +(process.argv[4] || 1440), H = +(process.argv[5] || 900);
const b = await chromium.launch({ channel: 'chrome', headless: false });
const p = await (await b.newContext({ viewport: { width: W, height: H }, reducedMotion: 'reduce' })).newPage();

const measure = async (root, label, rows) => {
  const box = await p.evaluate((r) => { const e = document.querySelector(r); if (!e) return null; const b0 = e.getBoundingClientRect(); return { top: b0.top + scrollY, height: b0.height }; }, root);
  if (!box) return;
  const seen = new Map();
  for (let y = box.top - 40; y < box.top + box.height; y += H * 0.7) {
    await p.evaluate((t) => scrollTo({ top: t, behavior: 'instant' }), y);
    await p.waitForTimeout(1600); // let in-view reveals finish, so opacity mid-animation is not measured
    const items = await p.evaluate((r) => {
      const out = [];
      const tw = document.createTreeWalker(document.querySelector(r), NodeFilter.SHOW_TEXT);
      const done = new Set();
      while (tw.nextNode()) {
        const t = tw.currentNode, el = t.parentElement;
        if (!t.textContent.trim() || done.has(el) || el.closest('svg') || el.closest('[aria-hidden="true"]') || el.closest('.sr-only')) continue;
        done.add(el);
        const rg = document.createRange();
        rg.selectNodeContents(t);
        const bb = rg.getBoundingClientRect();
        if (bb.width < 2 || bb.height < 2 || bb.top < 70 || bb.bottom > innerHeight - 20) continue;
        if (el.closest('button:disabled')) continue;
        let op = 1;
        for (let e = el; e; e = e.parentElement) op *= +getComputedStyle(e).opacity;
        if (op < 0.05) continue;
        const cs = getComputedStyle(el);
        const c2 = document.createElement('canvas').getContext('2d', { willReadFrequently: true });
        c2.clearRect(0, 0, 1, 1);
        c2.fillStyle = cs.color;
        c2.fillRect(0, 0, 1, 1);
        const px = c2.getImageData(0, 0, 1, 1).data;
        out.push({ rgba: [px[0], px[1], px[2], (px[3] / 255) * op], text: t.textContent.trim().slice(0, 44), x: bb.x, y: bb.y, w: bb.width, h: bb.height, size: parseFloat(cs.fontSize), weight: +cs.fontWeight });
      }
      return out;
    }, root);
    if (!items.length) continue;
    await p.addStyleTag({ content: `${root} *{color:transparent!important;-webkit-text-fill-color:transparent!important;text-decoration-color:transparent!important;caret-color:transparent!important} ${root} ::placeholder{color:transparent!important}` });
    await p.waitForTimeout(160);
    const png = (await p.screenshot({ type: 'png' })).toString('base64');
    await p.evaluate(() => document.querySelectorAll('style').forEach((s) => s.textContent.includes('text-fill-color:transparent') && s.remove()));
    const res = await p.evaluate(async ({ png, items }) => {
      const img = await createImageBitmap(await (await fetch('data:image/png;base64,' + png)).blob());
      const cv = new OffscreenCanvas(img.width, img.height);
      const cx = cv.getContext('2d', { willReadFrequently: true });
      cx.drawImage(img, 0, 0);
      const lum = (c) => { const [r, g, bl] = c.map((v) => ((v /= 255) <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)); return 0.2126 * r + 0.7152 * g + 0.0722 * bl; };
      const contrast = (a, c) => (Math.max(a, c) + 0.05) / (Math.min(a, c) + 0.05);
      return items.map((it) => {
        const x = Math.max(0, Math.floor(it.x)), y = Math.max(0, Math.floor(it.y));
        const w = Math.max(1, Math.min(img.width - x, Math.ceil(it.w))), h = Math.max(1, Math.min(img.height - y, Math.ceil(it.h)));
        const d = cx.getImageData(x, y, w, h).data;
        let lo = null, hi = null, ll = 9, hl = -1;
        for (let k = 0; k < d.length; k += 4) { const px = [d[k], d[k + 1], d[k + 2]], l = lum(px); if (l > hl) { hl = l; hi = px; } if (l < ll) { ll = l; lo = px; } }
        const a = it.rgba[3];
        const over = (bg) => contrast(lum([0, 1, 2].map((q) => it.rgba[q] * a + bg[q] * (1 - a))), lum(bg));
        const large = it.size >= 24 || (it.size >= 18.66 && it.weight >= 700);
        return { text: it.text, size: it.size, ratio: Math.min(over(lo), over(hi)), need: large ? 3 : 4.5 };
      });
    }, { png, items });
    for (const r of res) { const k = r.text; if (!seen.has(k) || r.ratio < seen.get(k).ratio) seen.set(k, r); }
  }
  const all = [...seen.values()];
  const bad = all.filter((r) => r.ratio < r.need).sort((a, c) => a.ratio - c.ratio);
  rows.push({ label, total: all.length, failing: bad.length, bad });
};

const rows = [];
await p.goto(URL, { waitUntil: 'networkidle' });
await p.waitForTimeout(1200);
for (const [root, label] of [['#act-comparison', 'Compare teaser + How it works (interim)'], ['#act-guidance', 'Guidance form (interim)'], ['#act-trust', 'Principles + FAQ (interim)'], ['#act-future', 'Final call to action (interim)'], ['footer', 'Footer']]) await measure(root, label, rows);
await p.goto(URL + '/this-page-does-not-exist', { waitUntil: 'networkidle' });
await p.waitForTimeout(400);
await measure('main', '404 page', rows);

const total = rows.reduce((a, r) => a + r.total, 0), failing = rows.reduce((a, r) => a + r.failing, 0);
const md = `# Measured text contrast: interim sections, footer, 404 (${W}x${H})\n\nDistinct text elements: ${total}; passing: ${total - failing}; failing: ${failing}\n\n| Area | Text elements | Failing | Worst examples |\n|---|---:|---:|---|\n${rows.map((r) => `| ${r.label} | ${r.total} | ${r.failing} | ${r.bad.slice(0, 5).map((x) => `"${x.text}" ${x.ratio.toFixed(2)} (need ${x.need})`).join('; ')} |`).join('\n')}\n`;
fs.writeFileSync(OUT, md);
console.log(md);
await b.close();
