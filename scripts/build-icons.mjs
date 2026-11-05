#!/usr/bin/env node
/**
 * Renders src/app/icon.svg into src/app/favicon.ico (16, 32, 48 px, PNG-in-ICO) and src/app/apple-icon.png (180 px)
 * using the installed Chrome, so no image dependency is needed. Re-run after changing the icon.
 */
import { chromium } from 'playwright-core';
import fs from 'node:fs';
const svg = fs.readFileSync('src/app/icon.svg', 'utf8');
const b = await chromium.launch({ channel: 'chrome' });
const png = async (size) => {
  const p = await (await b.newContext({ viewport: { width: size, height: size } })).newPage();
  await p.setContent(`<!doctype html><html><body style="margin:0;background:transparent">${svg.replace('<svg ', `<svg width="${size}" height="${size}" style="display:block" `)}</body></html>`);
  const out = await p.screenshot({ type: 'png', omitBackground: true });
  await p.context().close();
  return out;
};
const sizes = [16, 32, 48];
const images = [];
for (const s of sizes) images.push(await png(s));
const head = Buffer.alloc(6);
head.writeUInt16LE(1, 2);
head.writeUInt16LE(sizes.length, 4);
let offset = 6 + 16 * sizes.length;
const dir = sizes.map((s, i) => {
  const e = Buffer.alloc(16);
  e.writeUInt8(s, 0);
  e.writeUInt8(s, 1);
  e.writeUInt16LE(1, 4);
  e.writeUInt16LE(32, 6);
  e.writeUInt32LE(images[i].length, 8);
  e.writeUInt32LE(offset, 12);
  offset += images[i].length;
  return e;
});
fs.writeFileSync('src/app/favicon.ico', Buffer.concat([head, ...dir, ...images]));
fs.writeFileSync('src/app/apple-icon.png', await png(180));
await b.close();
console.log('icons written');
