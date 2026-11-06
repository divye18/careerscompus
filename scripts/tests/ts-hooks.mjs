// Lets node --test import the app's TypeScript without a new dependency: resolves `@/` paths, extensionless relative
// imports under src/, and JSON imports. Node itself strips the types. Used with: node --import ./scripts/tests/ts-hooks.mjs
import { registerHooks } from 'node:module';
import fs from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';

const SRC = new URL('../../src/', import.meta.url);

registerHooks({
  resolve(specifier, context, next) {
    let url = null;
    if (specifier.startsWith('@/')) url = new URL(specifier.slice(2), SRC);
    else if (specifier.startsWith('.') && context.parentURL?.startsWith(SRC.href)) url = new URL(specifier, context.parentURL);
    if (url) {
      const file = fileURLToPath(url);
      const found = [file, `${file}.ts`, `${file}.tsx`].find((f) => fs.existsSync(f) && fs.statSync(f).isFile());
      if (found) {
        return next(pathToFileURL(found).href, context);
      }
    }
    return next(specifier, context);
  },
  load(url, context, next) {
    // the app imports JSON without an attribute (the bundler allows it), so serve it as a module with a default export
    if (url.startsWith(SRC.href) && url.endsWith('.json')) {
      return { format: 'module', shortCircuit: true, source: `export default ${fs.readFileSync(fileURLToPath(url), 'utf8')};` };
    }
    return next(url, context);
  },
});
