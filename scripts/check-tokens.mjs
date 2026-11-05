#!/usr/bin/env node
/**
 * Verifies that the Nocturne Atlas colours in src/theme/tokens.ts and src/app/globals.css (@theme)
 * are identical, and that journey components contain no stray hex colours.
 * Usage: node scripts/check-tokens.mjs   (exit code 1 on mismatch)
 */
import fs from 'node:fs';
import path from 'node:path';

const ts = fs.readFileSync('src/theme/tokens.ts', 'utf8');
const css = fs.readFileSync('src/app/globals.css', 'utf8');

const kebab = (k) => k.replace(/([a-z])([0-9A-Z])/g, '$1-$2').toLowerCase();
const pairs = [];
for (const m of ts.matchAll(/^\s{2}(\w+): '(#[0-9A-Fa-f]{6})'/gm)) {
  // only the `color` block maps 1:1 to CSS
  const before = ts.slice(0, m.index);
  if (before.lastIndexOf('export const color') > before.lastIndexOf('export const compass')) pairs.push([m[1], m[2]]);
}
for (const m of ts.matchAll(/^\s{2}(\w+): \{ night: '(#[0-9A-Fa-f]{6})'/gm)) pairs.push([`domain-${m[1]}`, m[2]]);

let bad = 0;
for (const [k, hex] of pairs) {
  const name = k.startsWith('domain-') ? k : kebab(k).replace(/^ink(\d)/, 'ink-$1');
  const re = new RegExp(`--color-${name}:\\s*(#[0-9A-Fa-f]{6})`);
  const got = css.match(re)?.[1];
  if (!got || got.toLowerCase() !== hex.toLowerCase()) {
    console.error(`MISMATCH ${name}: tokens.ts ${hex} vs globals.css ${got ?? '(missing)'}`);
    bad++;
  }
}

// stray hex in journey components (tokens.ts, choreography maths and SVG data-URIs excepted)
const allow = new Set(['src/theme/tokens.ts']);
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]));
const stray = [];
for (const f of walk('src/journey').concat(['src/components/layout/Header.tsx', 'src/components/layout/Footer.tsx'])) {
  const rel = f.replace(/\\/g, '/');
  if (allow.has(rel) || !/\.(tsx?|css)$/.test(rel)) continue;
  const src = fs.readFileSync(f, 'utf8');
  for (const m of src.matchAll(/#[0-9A-Fa-f]{6}\b/g)) {
    const line = src.slice(0, m.index).split('\n').length;
    stray.push(`${rel}:${line} ${m[0]}`);
  }
}
if (stray.length) {
  console.error(`Stray hex colours (use tokens):\n  ${stray.join('\n  ')}`);
  bad += stray.length;
}

console.log(bad ? `token check FAILED (${bad})` : `token check OK (${pairs.length} tokens mirrored, no stray hex)`);
process.exit(bad ? 1 : 0);
