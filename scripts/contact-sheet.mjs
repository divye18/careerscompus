#!/usr/bin/env node
/**
 * Builds a contact sheet (one image) from a folder of frames, using the installed Chrome via
 * playwright-core (no extra dependency).
 *
 * Usage: node scripts/contact-sheet.mjs <inputDir> <outFile.jpg> [--cols 4] [--thumb 420] [--match regex]
 */
import { chromium } from 'playwright-core';
import fs from 'node:fs';
import path from 'node:path';

const [, , dir, out, ...rest] = process.argv;
if (!dir || !out) {
  console.error('usage: contact-sheet.mjs <inputDir> <outFile.jpg> [--cols N] [--thumb PX] [--match REGEX]');
  process.exit(1);
}
const opt = (k, d) => {
  const i = rest.indexOf(`--${k}`);
  return i >= 0 ? rest[i + 1] : d;
};
const cols = +opt('cols', 4);
const thumb = +opt('thumb', 420);
const match = new RegExp(opt('match', '\\.(jpe?g|png)$'), 'i');

const files = fs.readdirSync(dir).filter((f) => match.test(f)).sort();
if (!files.length) throw new Error('no frames matched in ' + dir);

const cells = files
  .map((f) => {
    const b64 = fs.readFileSync(path.join(dir, f)).toString('base64');
    const mime = f.toLowerCase().endsWith('png') ? 'png' : 'jpeg';
    return `<figure><img src="data:image/${mime};base64,${b64}"><figcaption>${f.replace(/\.(jpe?g|png)$/i, '')}</figcaption></figure>`;
  })
  .join('');

const html = `<!doctype html><meta charset="utf-8"><style>
body{margin:0;background:#101322;font:12px/1.2 ui-monospace,Consolas,monospace;color:#cfd4ee}
.g{display:grid;grid-template-columns:repeat(${cols},${thumb}px);gap:10px;padding:12px;width:max-content}
figure{margin:0}img{display:block;width:${thumb}px;height:auto;border:1px solid #2a3050}
figcaption{padding:4px 2px 0}
</style><div class="g">${cells}</div>`;

const browser = await chromium.launch({ channel: 'chrome', headless: false });
const page = await browser.newPage({ viewport: { width: cols * (thumb + 10) + 34, height: 800 } });
await page.setContent(html, { waitUntil: 'load' });
await page.waitForTimeout(400);
fs.mkdirSync(path.dirname(out), { recursive: true });
await page.screenshot({ path: out, type: 'jpeg', quality: 82, fullPage: true });
await browser.close();
console.log(`contact sheet: ${out} (${files.length} frames)`);
