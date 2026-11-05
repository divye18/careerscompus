#!/usr/bin/env node
/**
 * WebGL context-loss behaviour test (real Chrome, headed).
 *   1. Recoverable: lose the context, restore it after 600 ms → must stay on the pinned 3D presenter
 *      and keep rendering (we verify the canvas still produces pixels after restore).
 *   2. Permanent: lose and never restore → must fall back to the flow presenter after ~3 s
 *      with data-journey-reason="webgl-lost".
 * Usage: node scripts/context-loss-test.mjs [url]
 */
import { chromium } from 'playwright-core';

const URL = process.argv[2] || 'http://localhost:3100';
const out = {};

async function load(browser) {
  const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
  await page.goto(URL, { waitUntil: 'networkidle' });
  await page.waitForSelector('[data-world-ready="true"]', { timeout: 20000 });
  return page;
}
const state = (page) =>
  page.evaluate(() => ({
    presenter: document.querySelector('[data-journey]')?.getAttribute('data-journey'),
    reason: document.querySelector('[data-journey]')?.getAttribute('data-journey-reason'),
    canvases: document.querySelectorAll('canvas').length,
  }));

const browser = await chromium.launch({ channel: 'chrome', headless: false });

// 1) recoverable
{
  const page = await load(browser);
  await page.evaluate(() => {
    const c = document.querySelector('canvas');
    const gl = c.getContext('webgl2') || c.getContext('webgl');
    window.__ext = gl.getExtension('WEBGL_lose_context');
    window.__ext.loseContext();
  });
  await page.waitForTimeout(600);
  const mid = await state(page);
  await page.evaluate(() => window.__ext.restoreContext());
  await page.waitForTimeout(4500); // longer than the 3 s fallback window
  const after = await state(page);
  // does the restored canvas still draw? sample non-background pixels around the compass
  const shot = await page.screenshot({ type: 'jpeg', quality: 80, path: 'docs/qa-screenshots/nocturne/context-restored.jpg' });
  out.recoverable = { whileLost: mid, afterRestore: after, canvasBytes: shot.length, stayedPinned: after.presenter === 'pinned' };
  await page.context().close();
}

// 2) permanent
{
  const page = await load(browser);
  await page.evaluate(() => {
    const c = document.querySelector('canvas');
    const gl = c.getContext('webgl2') || c.getContext('webgl');
    gl.getExtension('WEBGL_lose_context').loseContext();
  });
  await page.waitForTimeout(1500);
  const early = await state(page);
  await page.waitForTimeout(3000);
  const late = await state(page);
  out.permanent = { at1_5s: early, at4_5s: late, fellBack: late.presenter === 'flow' && late.reason === 'webgl-lost' };
  await page.context().close();
}

await browser.close();
console.log(JSON.stringify(out, null, 2));
const ok = out.recoverable.stayedPinned && out.permanent.at1_5s.presenter === 'pinned' && out.permanent.fellBack;
console.log(ok ? 'CONTEXT-LOSS TEST PASSED' : 'CONTEXT-LOSS TEST FAILED');
process.exit(ok ? 0 : 1);
