// Load timeline: when the flow/pinned presenters, canvas and 3D appear, plus main-thread long tasks.
// Usage: node scripts/load-timeline.mjs   (server on :3100)
import { chromium } from 'playwright-core';
const b = await chromium.launch({ channel: 'chrome', headless: false });
const p = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
await p.addInitScript(() => {
  const t = (n) => (window.__t = window.__t || {}, window.__t[n] ??= Math.round(performance.now()));
  new MutationObserver(() => {
    if (document.querySelector('[data-journey="flow"]')) t('flow');
    if (document.querySelector('[data-journey="pinned"]')) t('pinned');
    if (document.querySelector('[data-world-ready]')) t('worldMount');
    if (document.querySelector('[data-world-ready="true"]')) t('worldReady');
    if (document.querySelector('canvas')) t('canvas');
  }).observe(document, { subtree: true, childList: true, attributes: true });
  const lt = [];
  new PerformanceObserver((l) => { for (const e of l.getEntries()) lt.push([Math.round(e.startTime), Math.round(e.duration)]); }).observe({ type: 'longtask', buffered: true });
  window.__lt = lt;
});
await p.goto(process.argv[2] || 'http://localhost:3100', { waitUntil: 'domcontentloaded' });
await p.waitForTimeout(8000);
console.log(JSON.stringify(await p.evaluate(() => ({ t: window.__t, longTasks: window.__lt }))));
await b.close();
