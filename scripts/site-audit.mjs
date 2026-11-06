#!/usr/bin/env node
/**
 * Whole-site quality audit in real Chrome: navigation, links, buttons, forms, metadata, routes, responsive overflow,
 * clipped text, touch targets, images, headings and landmarks at 1440, 1280, 768 and 390 px. Writes a JSON report and
 * section screenshots, so findings in docs/WEBSITE_QUALITY_AUDIT.md can be re-checked.
 * Usage: node scripts/site-audit.mjs [outDir] [url]
 */
import { chromium } from 'playwright-core';
import fs from 'node:fs';
const OUT = process.argv[2] || 'docs/qa-screenshots/audit';
const URL = (process.argv[3] || 'http://localhost:3100').replace(/\/$/, '');
fs.mkdirSync(OUT, { recursive: true });

const report = { url: URL, date: new Date().toISOString().slice(0, 10), routes: {}, metadata: {}, viewports: {}, navigation: {}, form: {}, links: {} };
const b = await chromium.launch({ channel: 'chrome', headless: false });

/* ---- routes + files ---- */
for (const path of ['/', '/favicon.ico', '/icon.svg', '/apple-icon.png', '/robots.txt', '/sitemap.xml', '/this-page-does-not-exist', '/careers', '/counselling', '/next.svg', '/vercel.svg']) {
  const r = await fetch(URL + path, { redirect: 'manual' });
  report.routes[path] = r.status;
}

/* ---- per viewport ---- */
const VIEWPORTS = [
  { name: '1440', width: 1440, height: 900 },
  { name: '1280', width: 1280, height: 800 },
  { name: '768', width: 768, height: 1024 },
  { name: '768-touch', width: 768, height: 1024, touch: true },
  { name: '390', width: 390, height: 844 },
  { name: '390-touch', width: 390, height: 844, touch: true },
];
const sweep = async (p) => {
  // visit the whole page so in-view reveals have run
  const h = await p.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < h; y += 700) {
    await p.evaluate((t) => scrollTo({ top: t, behavior: 'instant' }), y);
    await p.waitForTimeout(90);
  }
  await p.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
  await p.waitForTimeout(1600); // the journey's spring settles back to Scene 1
};
for (const v of VIEWPORTS) {
  const ctx = await b.newContext({ viewport: { width: v.width, height: v.height }, ...(v.touch ? { hasTouch: true, isMobile: true, deviceScaleFactor: 2 } : {}) });
  const p = await ctx.newPage();
  const errors = [];
  p.on('pageerror', (e) => errors.push(`pageerror: ${e}`));
  p.on('console', (m) => m.type() === 'error' && !m.text().includes('Failed to load resource') && errors.push(`console: ${m.text()}`));
  p.on('response', (r) => { if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`); });
  await p.goto(URL, { waitUntil: 'networkidle' });
  await p.waitForTimeout(1800);
  await sweep(p);
  report.viewports[v.name] = await p.evaluate(() => {
    const W = document.documentElement.clientWidth;
    const vis = (e) => { const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none'; };
    const clippedByAncestor = (e) => { for (let a = e.parentElement; a && a !== document.documentElement; a = a.parentElement) { const o = getComputedStyle(a).overflowX; if (o !== 'visible') return true; } return false; };
    const label = (e) => `${e.tagName.toLowerCase()}${e.id ? '#' + e.id : ''} "${(e.getAttribute('aria-label') || e.textContent || '').trim().slice(0, 34)}"`;
    const section = (e) => e.closest('section[id],div[id^="act-"],header,footer')?.id || e.closest('header,footer')?.tagName.toLowerCase() || '?';
    const overflow = [...document.querySelectorAll('body *')].filter((e) => { const r = e.getBoundingClientRect(); return r.right > W + 0.5 && r.width > 0 && vis(e) && !clippedByAncestor(e); }).slice(0, 8).map((e) => `${label(e)} class="${String(e.className?.baseVal ?? e.className).slice(0, 70)}" right=${Math.round(e.getBoundingClientRect().right)}`);
    const interactive = [...document.querySelectorAll('a[href],button,input,select,textarea,summary')].filter((e) => vis(e) && !e.closest('[inert]'));
    const small = interactive.filter((e) => { const r = e.getBoundingClientRect(); return r.height < 43.5 || r.width < 24; }).map((e) => { const r = e.getBoundingClientRect(); return `${section(e)}: ${label(e)} ${Math.round(r.width)}x${Math.round(r.height)}`; });
    const clipped = [...document.querySelectorAll('h1,h2,h3,h4,p,li,a,button,span,label')].filter((e) => vis(e) && e.children.length === 0 && e.textContent.trim() && !e.closest('[aria-hidden="true"]') && !e.closest('[inert]') && !e.closest('.sr-only') && (['hidden', 'clip'].includes(getComputedStyle(e).overflowX)) && e.scrollWidth > e.clientWidth + 1).map(label);
    const headings = [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].filter(vis).map((h) => ({ l: +h.tagName[1], t: h.textContent.trim().slice(0, 40), s: section(h) }));
    const skips = headings.filter((h, i) => i > 0 && h.l > headings[i - 1].l + 1).map((h) => `h${h.l} after a shallower heading: "${h.t}" (${h.s})`);
    const noName = interactive.filter((e) => !e.matches('input,select,textarea') && !(e.getAttribute('aria-label') || e.textContent.trim() || e.querySelector('svg title'))).map(label);
    const inputs = [...document.querySelectorAll('input,select,textarea')].filter(vis).filter((e) => !(e.labels?.length || e.getAttribute('aria-label') || e.getAttribute('aria-labelledby'))).map(label);
    const imgs = [...document.images].map((i) => ({ src: i.currentSrc.slice(-50), alt: i.alt, w: i.naturalWidth }));
    return {
      presenter: document.querySelector('[data-journey]')?.getAttribute('data-journey'),
      reason: document.querySelector('[data-journey]')?.getAttribute('data-journey-reason'),
      clientWidth: W, scrollWidth: document.documentElement.scrollWidth, overflow,
      smallTargets: small.length, smallTargetSamples: small.slice(0, 40), clipped: clipped.slice(0, 12),
      h1: headings.filter((h) => h.l === 1).map((h) => h.t), headingSkips: skips.slice(0, 12),
      buttonsWithoutName: noName, inputsWithoutLabel: inputs, images: imgs,
      landmarks: { main: document.querySelectorAll('main').length, header: document.querySelectorAll('header').length, footer: document.querySelectorAll('footer').length, skipLink: !!document.querySelector('a[href="#main"],a[href="#content"],a[href="#main-content"]') },
    };
  });
  report.viewports[v.name].errors = errors;

  // section screenshots for visual inspection (flow + legacy sections)
  if (['768', '390-touch', '1440'].includes(v.name)) {
    for (const id of ['act-hero', 'act-discovery', 'act-explore', 'act-courses', 'act-universities', 'act-comparison', 'act-guidance', 'act-trust', 'act-future']) {
      const loc = p.locator(`#${id}`).first();
      if (!(await loc.count())) continue;
      const box = await loc.boundingBox();
      if (!box || box.height > 7000) continue;
      await loc.scrollIntoViewIfNeeded().catch(() => {});
      await p.waitForTimeout(900);
      await p.addStyleTag({ content: 'header[data-theme]{visibility:hidden!important}' });
      await loc.screenshot({ path: `${OUT}/${v.name}-${id}.jpg`, type: 'jpeg', quality: 72 }).catch(() => {});
      await p.evaluate(() => document.querySelectorAll('style').forEach((x) => x.textContent.includes('header[data-theme]{visibility') && x.remove()));
    }
    const foot = p.locator('footer').first();
    await foot.scrollIntoViewIfNeeded();
    await p.waitForTimeout(500);
    await foot.screenshot({ path: `${OUT}/${v.name}-footer.jpg`, type: 'jpeg', quality: 72 });
  }
  await ctx.close();
}

/* ---- metadata + links (desktop) ---- */
{
  const p = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
  await p.goto(URL, { waitUntil: 'networkidle' });
  await p.waitForTimeout(1500);
  report.metadata = await p.evaluate(() => {
    const m = (s) => document.querySelector(s)?.getAttribute('content') ?? document.querySelector(s)?.getAttribute('href') ?? null;
    return { title: document.title, description: m('meta[name="description"]'), canonical: m('link[rel="canonical"]'), ogTitle: m('meta[property="og:title"]'), ogDescription: m('meta[property="og:description"]'), ogType: m('meta[property="og:type"]'), ogImage: m('meta[property="og:image"]'), twitterCard: m('meta[name="twitter:card"]'), icons: [...document.querySelectorAll('link[rel*="icon"]')].map((l) => l.getAttribute('href')), themeColor: m('meta[name="theme-color"]'), lang: document.documentElement.lang };
  });
  const links = await p.evaluate(() => [...document.querySelectorAll('a[href]')].map((a) => ({ href: a.getAttribute('href'), text: (a.getAttribute('aria-label') || a.textContent || '').trim().slice(0, 30), target: a.target, rel: a.rel, where: a.closest('section[id],div[id^="act-"],header,footer')?.id || a.closest('header,footer')?.tagName.toLowerCase() || '?' })));
  const seen = new Map();
  for (const l of links) seen.set(l.href, l);
  const dead = [], missingAnchors = [], external = [], tel = [];
  for (const [href, l] of seen) {
    if (/^https?:/.test(href)) { external.push({ href, safe: l.target !== '_blank' || /noopener/.test(l.rel) }); continue; }
    if (/^(mailto|tel):/.test(href)) { tel.push(href); continue; }
    const hash = href.includes('#') ? href.slice(href.indexOf('#') + 1) : null;
    const path = href.split('#')[0] || '/';
    const st = (await fetch(URL + path, { redirect: 'manual' })).status;
    if (st >= 400) dead.push(`${href} (${st}) "${l.text}" in ${l.where}`);
    if (hash && !(await p.evaluate((h) => Boolean(document.getElementById(h)), hash))) missingAnchors.push(`${href} "${l.text}" in ${l.where}`);
  }
  report.links = { total: links.length, unique: seen.size, dead, missingAnchors, unsafeExternal: external.filter((e) => !e.safe), externalCount: external.length, mailtoTel: tel };

  // nav links reach their section
  const nav = p.locator('header nav a');
  const navOut = [];
  for (let i = 0; i < (await nav.count()); i++) {
    const a = nav.nth(i);
    const href = await a.getAttribute('href');
    const text = (await a.innerText()).trim();
    await p.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
    await p.waitForTimeout(150);
    await a.click();
    await p.waitForTimeout(2200);
    const id = href.split('#')[1];
    const top = await p.evaluate((h) => Math.round(document.getElementById(h)?.getBoundingClientRect().top ?? -99999), id);
    navOut.push({ text, href, targetTop: top, ok: Math.abs(top) < 900, ariaCurrent: await a.getAttribute('aria-current') });
  }
  report.navigation.desktopLinks = navOut;
  report.navigation.activeState = navOut.some((n) => n.ariaCurrent);
  await p.evaluate(() => scrollTo({ top: 3000, behavior: 'instant' }));
  await p.waitForTimeout(300);
  await p.locator('header a[href="/"]').first().click();
  await p.waitForTimeout(1500);
  report.navigation.logoReturnsToTop = (await p.evaluate(() => scrollY)) < 5;

  // get guidance + search buttons
  await p.locator('header button', { hasText: 'About guidance' }).click();
  await p.waitForTimeout(2500);
  report.navigation.getGuidanceTop = await p.evaluate(() => Math.round(document.getElementById('act-guidance').getBoundingClientRect().top));

  // form
  await p.evaluate(() => document.getElementById('act-guidance').scrollIntoView({ behavior: 'instant' }));
  await p.waitForTimeout(900);
  // the callback form is intentionally unavailable: it collects nothing and cannot be submitted
  const form = p.locator('#act-guidance form');
  let posted = false;
  p.on('request', (r) => { if (r.method() === 'POST') posted = true; });
  report.form.fields = await form.locator('input, textarea').count();
  report.form.submitDisabled = await form.locator('button[type="submit"]').isDisabled();
  report.form.successMessage = /thanks|has been submitted|request received/i.test(await p.locator('#act-guidance').innerText());
  report.form.networkRequest = posted;
  await p.context().close();
}

/* ---- mobile menu ---- */
{
  const p = await (await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 })).newPage();
  await p.goto(URL, { waitUntil: 'networkidle' });
  await p.waitForTimeout(1200);
  await p.getByRole('button', { name: 'Open mobile menu' }).click();
  await p.waitForTimeout(500);
  const dlg = p.getByRole('dialog', { name: 'Menu' });
  report.navigation.mobileMenuOpens = await dlg.isVisible();
  report.navigation.mobileLinks = await dlg.locator('nav a').allInnerTexts();
  report.navigation.mobileFocusMovesIn = await p.evaluate(() => Boolean(document.activeElement?.closest('[role="dialog"]')));
  await p.screenshot({ path: `${OUT}/390-mobile-menu.jpg`, type: 'jpeg', quality: 72 });
  await p.keyboard.press('Escape');
  await p.waitForTimeout(400);
  report.navigation.mobileEscapeCloses = !(await dlg.isVisible().catch(() => false));
  if (!report.navigation.mobileEscapeCloses) await p.getByRole('button', { name: 'Close mobile menu' }).click();
  await p.waitForTimeout(400);
  await p.getByRole('button', { name: 'Open mobile menu' }).click();
  await p.waitForTimeout(400);
  await dlg.locator('nav a', { hasText: 'Universities' }).click();
  await p.waitForTimeout(2500);
  report.navigation.mobileLinkReachesTarget = await p.evaluate(() => Math.abs(document.getElementById('act-universities').getBoundingClientRect().top) < 400);
  await p.context().close();
}

/* ---- 404 ---- */
{
  const p = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
  await p.goto(URL + '/this-page-does-not-exist', { waitUntil: 'networkidle' });
  await p.waitForTimeout(500);
  report.routes.notFoundTitle = await p.title();
  report.routes.notFoundText = (await p.locator('body').innerText()).slice(0, 160);
  report.routes.notFoundHasHomeLink = (await p.locator('a[href="/"]').count()) > 0;
  await p.screenshot({ path: `${OUT}/404.jpg`, type: 'jpeg', quality: 72 });
  await p.context().close();
}

fs.writeFileSync(`${OUT}/report.json`, JSON.stringify(report, null, 1));
const brief = Object.fromEntries(Object.entries(report.viewports).map(([k, v]) => [k, { presenter: v.presenter, cw: v.clientWidth, sw: v.scrollWidth, overflow: v.overflow.length, small: v.smallTargets, clipped: v.clipped.length, h1: v.h1.length, skips: v.headingSkips.length, noName: v.buttonsWithoutName.length, unlabeled: v.inputsWithoutLabel.length, errors: v.errors.length }]));
console.log(JSON.stringify({ routes: report.routes, metadata: report.metadata, links: report.links, navigation: report.navigation, form: report.form, viewports: brief }, null, 1));
await b.close();
