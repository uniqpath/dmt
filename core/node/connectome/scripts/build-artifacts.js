const fs = require('fs');

fs.writeFileSync(
  'server/package.json',
  JSON.stringify({ main: 'index.js', module: 'index.mjs', typings: '../typings/src/server/index.d.ts' }, undefined, '\t')
);
