// Capability stress test: N fresh real-Chrome loads; tallies presenter + reason, WebGL context events.
// Usage: node scripts/capability-stress.mjs [N]   (server on :3100)
import { chromium } from 'playwright-core';
const N = +(process.argv[2] || 15);
const tally = {};
const rows = [];
for (let i = 0; i < N; i++) {
  const b = await chromium.launch({ channel: 'chrome', headless: false });
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  await ctx.addInitScript(() => {
    window.__cc = { lost: 0, restored: 0, ctx: 0, fails: 0 };
    const orig = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (t, ...a) {
      const r = orig.call(this, t, ...a);
      if (/webgl/.test(t)) {
        window.__cc.ctx++;
        if (!r) window.__cc.fails++;
        this.addEventListener('webglcontextlost', () => window.__cc.lost++);
        this.addEventListener('webglcontextrestored', () => window.__cc.restored++);
      }
      return r;
    };
  });
  const p = await ctx.newPage();
  await p.goto('http://localhost:3100', { waitUntil: 'networkidle' });
  await p.waitForTimeout(3500);
  const r = await p.evaluate(() => ({
    presenter: document.querySelector('[data-journey]')?.getAttribute('data-journey'),
    reason: document.querySelector('[data-journey]')?.getAttribute('data-journey-reason'),
    ready: document.querySelector('[data-world-ready]')?.getAttribute('data-world-ready'),
    vis: document.visibilityState,
    focus: document.hasFocus(),
    pointerFine: matchMedia('(pointer: fine)').matches,
    desktopMQ: matchMedia('(min-width: 1024px) and (pointer: fine)').matches,
    mem: navigator.deviceMemory, cores: navigator.hardwareConcurrency,
    ...window.__cc,
  }));
  rows.push(r);
  const k = `${r.presenter}:${r.reason ?? '-'}`;
  tally[k] = (tally[k] || 0) + 1;
  await b.close();
}
console.log(JSON.stringify(tally));
for (const r of rows) console.log(JSON.stringify(r));
