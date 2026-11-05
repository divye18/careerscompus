#!/usr/bin/env node
/**
 * Verifies every Scene 3 boundary in real Chrome, forwards AND backwards: Scene 2→Technology, each room→room,
 * Science→handoff. For each boundary it captures frames across the cross-fade window, records the mean
 * luminance of every frame, and flags sudden jumps (flashes / seams). Writes frames to
 * <out>/transitions/<boundary>/{fwd,back}-NN.jpg and a JSON summary.
 * Usage: node scripts/explore-transitions.mjs [outDir] [url] [width] [height]
 */
import { chromium } from 'playwright-core';
import fs from 'node:fs';
const OUT = (process.argv[2] || 'docs/qa-screenshots/explore') + '/transitions';
const URL = process.argv[3] || 'http://localhost:3100';
const W = +(process.argv[4] || 1440);
const H = +(process.argv[5] || 900);
const IDS = ['technology', 'medicine', 'business', 'design', 'law', 'architecture', 'science'];
// [name, centre vh, half-window vh]
const BOUNDS = [
  ['scene2-to-technology', 280, 22],
  ...IDS.slice(1).map((id, k) => [`${IDS[k]}-to-${id}`, 290 + 46 * (k + 1), 9]),
  ['science-to-handoff', 585, 17],
];
fs.mkdirSync(OUT, { recursive: true });
const b = await chromium.launch({ channel: 'chrome', headless: false });
const p = await (await b.newContext({ viewport: { width: W, height: H } })).newPage();
const errors = [];
p.on('pageerror', (e) => errors.push(String(e)));
await p.goto(URL, { waitUntil: 'networkidle' });
await p.waitForSelector('[data-world-ready="true"]');
await p.waitForTimeout(1200);
const top = await p.evaluate(() => document.querySelector('[data-journey="pinned"]').getBoundingClientRect().top + scrollY);
const at = (vh) => top + (vh / 100) * H;
const meanLum = (buf) =>
  p.evaluate(async (b64) => {
    const img = await createImageBitmap(await (await fetch('data:image/jpeg;base64,' + b64)).blob());
    const cv = new OffscreenCanvas(64, 40);
    const cx = cv.getContext('2d', { willReadFrequently: true });
    cx.drawImage(img, 0, 90 / 900 * img.height, img.width, img.height - 90 / 900 * img.height, 0, 0, 64, 40); // skip header
    const d = cx.getImageData(0, 0, 64, 40).data;
    let s = 0;
    for (let k = 0; k < d.length; k += 4) s += 0.2126 * d[k] + 0.7152 * d[k + 1] + 0.0722 * d[k + 2];
    return s / (d.length / 4);
  }, buf.toString('base64'));
const summary = [];
for (const [name, c, half] of BOUNDS) {
  fs.mkdirSync(`${OUT}/${name}`, { recursive: true });
  const offs = Array.from({ length: 9 }, (_, k) => -half + (k * 2 * half) / 8);
  const res = {};
  for (const dir of ['fwd', 'back']) {
    const seq = dir === 'fwd' ? offs : [...offs].reverse();
    // approach from well outside the window so the spring settles in the right direction
    await p.evaluate((y) => scrollTo({ top: y, behavior: 'instant' }), at(c + (dir === 'fwd' ? -half - 14 : half + 14)));
    await p.waitForTimeout(900);
    const lums = [];
    for (const [n, o] of seq.entries()) {
      await p.evaluate((y) => scrollTo({ top: y, behavior: 'instant' }), at(c + o));
      await p.waitForTimeout(700);
      const buf = await p.screenshot({ type: 'jpeg', quality: 70, path: `${OUT}/${name}/${dir}-${String(n).padStart(2, '0')}.jpg` });
      lums.push(+(await meanLum(buf)).toFixed(2));
    }
    const jumps = lums.slice(1).map((v, k) => Math.abs(v - lums[k]));
    res[dir] = { lums, maxStep: +Math.max(...jumps).toFixed(2) };
  }
  summary.push({ name, ...res });
  console.log(name, 'fwd maxStep', res.fwd.maxStep, 'back maxStep', res.back.maxStep);
}
fs.writeFileSync(`${OUT}/summary.json`, JSON.stringify({ viewport: { W, H }, errors, summary }, null, 1));
console.log('errors', errors.length);
await b.close();
