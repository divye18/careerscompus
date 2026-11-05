#!/usr/bin/env node
/**
 * Scene 5 → Scene 6 transition, forwards and backwards, real Chrome. Scrolls in steps from inside the last
 * Explore room through the pinned stage's end into the Pathways intro; records the mean luminance of each frame
 * (sudden jumps = flashes/seams) and saves frames. Usage: node scripts/courses-transitions.mjs [outDir] [url] [w] [h] [mode]
 */
import { chromium } from 'playwright-core';
import fs from 'node:fs';
const OUT = (process.argv[2] || 'docs/qa-screenshots/compare') + '/transition';
const URL = process.argv[3] || 'http://localhost:3100';
const W = +(process.argv[4] || 1440), H = +(process.argv[5] || 900);
const MODE = process.argv[6] || 'desktop';
fs.mkdirSync(OUT, { recursive: true });
const b = await chromium.launch({ channel: 'chrome', headless: false });
const p = await (await b.newContext({ viewport: { width: W, height: H }, reducedMotion: MODE === 'reduced' ? 'reduce' : 'no-preference' })).newPage();
await p.goto(URL, { waitUntil: 'networkidle' });
await p.waitForTimeout(1500);
const geo = await p.evaluate(() => {
  const c = document.getElementById('act-comparison').getBoundingClientRect().top + scrollY;
  const pin = document.querySelector('[data-journey="pinned"]');
  return { courses: c, pinned: !!pin, pinEnd: pin ? pin.getBoundingClientRect().top + scrollY + pin.offsetHeight : c };
});
const from = geo.courses - H * 1.5, to = geo.courses + H * 0.55, N = 13;
const ys = Array.from({ length: N }, (_, i) => from + ((to - from) * i) / (N - 1));
const lum = (buf) => p.evaluate(async (b64) => {
  const img = await createImageBitmap(await (await fetch('data:image/jpeg;base64,' + b64)).blob());
  const cv = new OffscreenCanvas(64, 40); const cx = cv.getContext('2d', { willReadFrequently: true });
  const hh = 90 / 900 * img.height; cx.drawImage(img, 0, hh, img.width, img.height - hh, 0, 0, 64, 40);
  const d = cx.getImageData(0, 0, 64, 40).data; let s = 0; for (let k = 0; k < d.length; k += 4) s += 0.2126 * d[k] + 0.7152 * d[k + 1] + 0.0722 * d[k + 2];
  return s / (d.length / 4);
}, buf.toString('base64'));
const out = {};
for (const dir of ['fwd', 'back']) {
  const seq = dir === 'fwd' ? ys : [...ys].reverse();
  await p.evaluate((y) => scrollTo({ top: y, behavior: 'instant' }), dir === 'fwd' ? from - H * 0.3 : to + H * 0.3);
  await p.waitForTimeout(900);
  const l = [];
  for (const [i, y] of seq.entries()) {
    await p.evaluate((y) => scrollTo({ top: y, behavior: 'instant' }), y);
    await p.waitForTimeout(650);
    const buf = await p.screenshot({ type: 'jpeg', quality: 70, path: `${OUT}/${MODE}-${W}-${dir}-${String(i).padStart(2, '0')}.jpg` });
    l.push(+(await lum(buf)).toFixed(2));
  }
  out[dir] = { lums: l, maxStep: +Math.max(...l.slice(1).map((v, k) => Math.abs(v - l[k]))).toFixed(2) };
}
console.log(JSON.stringify({ W, MODE, pinned: geo.pinned, ...out }));
await b.close();
