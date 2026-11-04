const fs = require('fs');
let content = fs.readFileSync('src/components/home/CareerExploration.tsx', 'utf-8');
content = content.replace(/href=\{.*?}/g, 'href={\/careers/\ + c.title.toLowerCase().replace(\' \', \'-\')}');
content = content.replace(/className=\{[^\}]+overflow-hidden\s+\}/g, 'className={\lex flex-col sm:flex-row sm:items-center justify-between p-4 border-b border-[var(--color-royal-deep)]/5 transition-all duration-500 relative overflow-hidden \\}');
fs.writeFileSync('src/components/home/CareerExploration.tsx', content);

