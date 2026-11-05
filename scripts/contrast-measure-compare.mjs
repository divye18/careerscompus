#!/usr/bin/env node
/**
 * Measured WCAG contrast of Scene 6 text (real pixels, Chrome). Same method as the other scenes: DOM text is made
 * transparent, the lightest background pixel under each text box is sampled, and the element's computed colour (with
 * alpha) is composited over it. Covers every major state, scrolling through the whole workspace in each.
 * Also measures the graphical signals (cyan difference rule, focus ring, column rules) against the ledger surface.
 * Usage: node scripts/contrast-measure-compare.mjs [out.md] [url] [w] [h]
 */
import { chromium } from 'playwright-core';
import fs from 'node:fs';
const OUT = process.argv[2] || 'docs/qa-screenshots/compare/contrast-measured-1440.md';
const URL = process.argv[3] || 'http://localhost:3100';
const W = +(process.argv[4] || 1440), H = +(process.argv[5] || 900);
const b = await chromium.launch({ channel: 'chrome', headless: false });
const p = await (await b.newContext({ viewport: { width: W, height: H }, reducedMotion: 'reduce' })).newPage();
await p.goto(URL, { waitUntil: 'networkidle' });
await p.waitForTimeout(1500);
const ws = p.locator('#studio-workspace');
const add = async (noun, id) => {
  await ws.getByRole('button', { name: new RegExp(`Add ${noun}`) }).first().click();
  await ws.locator(`button[data-option="${id}"]`).click();
  await p.waitForTimeout(120);
};
const openAllEvidence = () => p.evaluate(() => document.querySelectorAll('#studio-workspace details').forEach((d) => { d.open = true; }));
const view = (name) => ws.getByRole('button', { name, exact: true });
const modeBtn = (name) => ws.locator('ul[aria-labelledby="studio-mode"]').getByRole('button', { name: new RegExp(`^${name}`) });

const states = [
  ['empty', async () => {}],
  ['picker', async () => { await ws.getByRole('button', { name: /Add institution/ }).first().click(); }],
  ['three-institutions+evidence', async () => { await ws.locator('button[data-option="iit-delhi"]').click(); await add('institution', 'iit-madras'); await add('institution', 'bits-pilani'); await openAllEvidence(); }],
  ['differences', async () => { await view('Differences only').click(); }],
  ['parameter-chooser', async () => { await view('All parameters').click(); await ws.getByRole('button', { name: /^Choose parameters/ }).click(); await ws.locator('#studio-params').getByRole('button', { name: 'Established', exact: true }).click(); }],
  ['courses', async () => { await ws.locator('#studio-params').getByRole('button', { name: 'Established', exact: true }).click(); await ws.getByRole('button', { name: /^Choose parameters/ }).click(); await modeBtn('Courses').click(); await add('course', 'technology-b-tech-b-e'); await add('course', 'technology-bca'); await openAllEvidence(); }],
  ['programmes', async () => { await modeBtn('Programmes').click(); await add('programme', 'iit-madras--b-tech'); await add('programme', 'iit-kharagpur--b-arch'); await openAllEvidence(); }],
  ['no-differences', async () => { await modeBtn('Courses').click(); await view('Differences only').click(); }],
];

const rows = [];
let total = 0, fails = 0;
for (const [name, act] of states) {
  await act();
  await p.waitForTimeout(400);
  const geo = await p.evaluate(() => { const r = document.getElementById('act-comparison').getBoundingClientRect(); return { top: r.top + scrollY, height: r.height }; });
  const seen = new Set();
  let n = 0, bad = [], worst = null;
  for (let y = geo.top - 40; y < geo.top + geo.height - 200; y += H * 0.7) {
    await p.evaluate((t) => scrollTo({ top: t, behavior: 'instant' }), y);
    await p.waitForTimeout(220);
    const items = await p.evaluate(() => {
      const root = document.getElementById('act-comparison');
      const out = [];
      const tw = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      const done = new Set();
      while (tw.nextNode()) {
        const t = tw.currentNode, el = t.parentElement;
        if (!t.textContent.trim() || done.has(el) || el.closest('svg') || el.closest('[aria-hidden="true"]') || el.closest('.sr-only')) continue;
        done.add(el);
        const rg = document.createRange();
        rg.selectNodeContents(t);
        const bb = rg.getBoundingClientRect();
        if (bb.width < 2 || bb.height < 2 || bb.top < 150 || bb.bottom > innerHeight - 20) continue; // fully on screen, clear of the fixed header and sticky row
        if (el.closest('button:disabled')) continue; // inactive controls are exempt
        let op = 1;
        for (let e = el; e; e = e.parentElement) op *= +getComputedStyle(e).opacity;
        if (op < 0.05) continue;
        const cs = getComputedStyle(el);
        const c2 = document.createElement('canvas').getContext('2d', { willReadFrequently: true });
        c2.clearRect(0, 0, 1, 1);
        c2.fillStyle = cs.color;
        c2.fillRect(0, 0, 1, 1);
        const px = c2.getImageData(0, 0, 1, 1).data;
        out.push({ rgba: [px[0], px[1], px[2], px[3] / 255], text: t.textContent.trim().slice(0, 34), x: bb.x, y: bb.y, w: bb.width, h: bb.height, size: parseFloat(cs.fontSize), weight: +cs.fontWeight });
      }
      return out;
    });
    if (!items.length) continue;
    await p.addStyleTag({ content: '#act-comparison *{color:transparent!important;-webkit-text-fill-color:transparent!important;caret-color:transparent!important;text-decoration-color:transparent!important}' });
    await p.waitForTimeout(160);
    const png = (await p.screenshot({ type: 'png' })).toString('base64');
    await p.evaluate(() => document.querySelectorAll('style').forEach((s) => s.textContent.includes('text-fill-color:transparent') && s.remove()));
    const res = await p.evaluate(async ({ png, items }) => {
      const img = await createImageBitmap(await (await fetch('data:image/png;base64,' + png)).blob());
      const cv = new OffscreenCanvas(img.width, img.height);
      const cx = cv.getContext('2d', { willReadFrequently: true });
      cx.drawImage(img, 0, 0);
      const lum = (c) => { const [r, g, bl] = c.map((v) => ((v /= 255) <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)); return 0.2126 * r + 0.7152 * g + 0.0722 * bl; };
      return items.map((it) => {
        const x = Math.max(0, Math.floor(it.x)), y = Math.max(0, Math.floor(it.y));
        const w = Math.max(1, Math.min(img.width - x, Math.ceil(it.w))), h = Math.max(1, Math.min(img.height - y, Math.ceil(it.h)));
        const d = cx.getImageData(x, y, w, h).data;
        let best = null, bl = -1;
        for (let k = 0; k < d.length; k += 4) { const l = lum([d[k], d[k + 1], d[k + 2]]); if (l > bl) { bl = l; best = [d[k], d[k + 1], d[k + 2]]; } }
        const a = it.rgba[3];
        const fg = [0, 1, 2].map((q) => it.rgba[q] * a + best[q] * (1 - a));
        const lf = lum(fg);
        const ratio = (Math.max(lf, bl) + 0.05) / (Math.min(lf, bl) + 0.05);
        const large = it.size >= 24 || (it.size >= 18.66 && it.weight >= 700);
        return { text: it.text, size: it.size, ratio, need: large ? 3 : 4.5 };
      });
    }, { png, items });
    for (const r of res) {
      n++;
      if (!worst || r.ratio / r.need < worst.ratio / worst.need) worst = r;
      if (r.ratio < r.need && !seen.has(r.text)) { seen.add(r.text); bad.push(r); }
    }
    fails += res.filter((r) => r.ratio < r.need).length;
  }
  total += n;
  rows.push(`| ${name} | ${n} | ${worst ? `${worst.ratio.toFixed(2)} (need ${worst.need}) "${worst.text}" ${worst.size}px` : ''} | ${bad.length ? 'FAIL: ' + bad.map((r) => `"${r.text}" ${r.ratio.toFixed(2)}`).join('; ') : 'pass'} |`);
}

// graphical signals against the ledger surface (ink-900)
const lum = (hex) => { const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)).map((v) => ((v /= 255) <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; };
const cr = (a, b2) => { const [x, y] = [lum(a), lum(b2)].sort((q, r) => r - q); return ((x + 0.05) / (y + 0.05)).toFixed(2); };
const t = fs.readFileSync('src/theme/tokens.ts', 'utf8');
const tok = (k) => t.match(new RegExp(`${k}:\\s*'(#[0-9A-Fa-f]{6})'`))[1];
const graphics = `Graphical signals on the ledger surface (need 3.0): cyan difference rule and focus ring ${cr(tok('cyan'), tok('ink900'))}; champagne top rule ${cr(tok('champagne'), tok('ink900'))}.`;

const md = `# Scene 6 measured text contrast (${W}x${H})\n\nReal-pixel measurement: DOM text made transparent, lightest background pixel under each text box, computed colour (with alpha) composited over it. Every state is scrolled through the whole workspace, so a text element can be measured at more than one position. Disabled controls and aria-hidden glyphs are excluded.\n\n| State | Text measurements | Lowest ratio | Result |\n|---|---:|---|---|\n${rows.join('\n')}\n\nText/background pairs tested: ${total}; passing: ${total - fails}; failing: ${fails}\n\n${graphics}\n`;
fs.writeFileSync(OUT, md);
console.log(md);
await b.close();
