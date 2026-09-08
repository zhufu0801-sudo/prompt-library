import fs from 'node:fs';
const p = JSON.parse(fs.readFileSync('package.json', 'utf8'));
p.name = 'ai-made-easy';
p.scripts['content:build'] = 'node scripts/build-content.mjs';
p.scripts['db:generate'] = 'drizzle-kit generate';
p.scripts['db:local'] =
  'wrangler d1 migrations apply DB --local --config wrangler.local.json';
p.scripts['typecheck'] = 'tsc --noEmit';
p.scripts['test'] =
  'node --experimental-strip-types --test scripts/prompt.test.mjs';
p.scripts['test:api'] = 'node scripts/api.test.mjs';
p.scripts['prebuild'] = 'node scripts/build-content.mjs';
fs.writeFileSync('package.json', JSON.stringify(p, null, 2) + '\n');
