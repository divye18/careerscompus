#!/usr/bin/env node
/**
 * Measured WCAG contrast of the Scene 3 DOM text, in real Chrome. For each room (settled) it screenshots the
 * page with all DOM text made transparent, then for every text element samples the real background pixels
 * under its box, composites the element's computed colour (incl. alpha) over the lightest sampled pixel
 * (worst case for light-on-dark) and reports the ratio. Large text = >=24px, or >=18.66px bold.
 * Usage: node scripts/contrast-measure.mjs [out.md] [url] [width] [height]
 */
import { chromium } from 'playwright-core';
import fs from 'node:fs';
const OUT = process.argv[2] || 'docs/qa-screenshots/explore/contrast-measured.md';
const URL = process.argv[3] || 'http://localhost:3100';
const W = +(process.argv[4] || 1440);
const H = +(process.argv[5] || 900);
const IDS = ['technology', 'medicine', 'business', 'design', 'law', 'architecture', 'science'];
const b = await chromium.launch({ channel: 'chrome', headless: false });
const p = await (await b.newContext({ viewport: { width: W, height: H } })).newPage();
await p.goto(URL, { waitUntil: 'networkidle' });
await p.waitForSelector('[data-world-ready="true"]');
await p.waitForTimeout(1200);
const top = await p.evaluate(() => document.querySelector('[data-journey="pinned"]').getBoundingClientRect().top + scrollY);
const lines = [];
let fails = 0;
let total = 0;
let min = 99;
for (const [i, id] of IDS.entries()) {
  await p.evaluate((y) => scrollTo({ top: y, behavior: 'instant' }), top + ((290 + 46 * i + 26) / 100) * H);
  await p.waitForTimeout(1300);
  // collect text boxes + colours
  const items = await p.evaluate((room) => {
    const sec = document.querySelector(`[data-room="${room}"]`);
    const out = [];
    const walker = document.createTreeWalker(sec, NodeFilter.SHOW_TEXT);
    const seen = new Set();
    while (walker.nextNode()) {
      const n = walker.currentNode;
      const el = n.parentElement;
      if (!n.textContent.trim() || seen.has(el) || el.closest('svg') || el.closest('[aria-hidden="true"]')) continue; // decorative artwork text is aria-hidden: audited separately in contrast-report.md
      seen.add(el);
      const r = document.createRange();
      r.selectNodeContents(n);
      const bb = r.getBoundingClientRect();
      if (bb.width < 2 || bb.height < 2) continue;
      const cs = getComputedStyle(el);
      const c2 = document.createElement('canvas').getContext('2d', { willReadFrequently: true });
      c2.clearRect(0, 0, 1, 1);
      c2.fillStyle = cs.color;
      c2.fillRect(0, 0, 1, 1);
      const px = c2.getImageData(0, 0, 1, 1).data;
      out.push({ rgba: [px[0], px[1], px[2], px[3] / 255], text: n.textContent.trim().slice(0, 34), x: bb.x, y: bb.y, w: bb.width, h: bb.height, color: cs.color, size: parseFloat(cs.fontSize), weight: +cs.fontWeight });
    }
    return out;
  }, id);
  await p.addStyleTag({ content: '[data-room] *{color:transparent!important;-webkit-text-fill-color:transparent!important} [data-room] svg text{fill:transparent!important}' });
  await p.waitForTimeout(250);
  const png = (await p.screenshot({ type: 'png' })).toString('base64');
  await p.evaluate(() => document.querySelectorAll('style').forEach((s) => s.textContent.includes('text-fill-color:transparent') && s.remove()));
  const res = await p.evaluate(
    async ({ png, items }) => {
      const img = await createImageBitmap(await (await fetch('data:image/png;base64,' + png)).blob());
      const cv = new OffscreenCanvas(img.width, img.height);
      const cx = cv.getContext('2d', { willReadFrequently: true });
      cx.drawImage(img, 0, 0);
      const lum = (c) => {
        const [r, g, b] = c.map((v) => ((v /= 255) <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
      };
      return items.map((it) => {
        const x = Math.max(0, Math.floor(it.x)), y = Math.max(0, Math.floor(it.y));
        const w = Math.max(1, Math.min(img.width - x, Math.ceil(it.w))), h = Math.max(1, Math.min(img.height - y, Math.ceil(it.h)));
        const d = cx.getImageData(x, y, w, h).data;
        let best = null, bl = -1;
        for (let k = 0; k < d.length; k += 4) {
          const l = lum([d[k], d[k + 1], d[k + 2]]);
          if (l > bl) { bl = l; best = [d[k], d[k + 1], d[k + 2]]; }
        }
        const m = it.rgba;
        const a = m[3];
        const fg = [0, 1, 2].map((q) => m[q] * a + best[q] * (1 - a));
        const lf = lum(fg);
        const ratio = (Math.max(lf, bl) + 0.05) / (Math.min(lf, bl) + 0.05);
        const large = it.size >= 24 || (it.size >= 18.66 && it.weight >= 700);
        return { text: it.text, size: it.size, ratio, need: large ? 3 : 4.5 };
      });
    },
    { png, items }
  );
  const worst = res.reduce((a, r) => (r.ratio / r.need < a.ratio / a.need ? r : a));
  const bad = res.filter((r) => r.ratio < r.need);
  fails += bad.length;
  total += res.length;
  min = Math.min(min, ...res.map((r) => r.ratio / r.need));
  lines.push(`| ${id} | ${res.length} | ${worst.ratio.toFixed(2)} (need ${worst.need}) "${worst.text}" ${worst.size}px | ${bad.length ? 'FAIL: ' + bad.map((r) => `"${r.text}" ${r.ratio.toFixed(2)}`).join('; ') : 'pass'} |`);
}
const md = `# Scene 3 measured text contrast (${W}x${H})\n\nReal-pixel measurement in Chrome: DOM text made transparent, lightest background pixel under each text box, computed text colour (with alpha) composited over it.\n\n| Room | Text elements | Lowest ratio (relative to requirement) | Result |\n|---|---:|---|---|\n${lines.join('\n')}\n\nText/background pairs tested: ${total}; passing: ${total - fails}; failing: ${fails}\n`;
fs.writeFileSync(OUT, md);
console.log(md);
await b.close();
