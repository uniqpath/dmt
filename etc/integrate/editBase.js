import fs from 'fs';

import { join as pathJoin, basename } from 'path';

import colors from './colors.js';

const appBase = process.argv[3];
const projectRoot = process.argv[2];

const base = pathJoin('/', appBase);

const canEditRe = `paths\\:[\\ ]{[\\t\\n\\ ]*base:[\\ ]*\\'${base}\\'[\\t\\n\\ ]*\\}[\\ ]*\\,`;

function edit(filePath) {
  const re = /kit:[\ ]*{/;
  const toAdd = `kit: {
    paths: {
      base: '${base}'
    },`;
  if (fs.existsSync(filePath)) {
    let fileStr = fs.readFileSync(filePath, 'utf8');
    const canEdit = !RegExp(canEditRe).test(fileStr);
    if (canEdit) {
      fileStr = fileStr.replace(re, toAdd);
      fs.writeFileSync(filePath, fileStr);
      console.log(
        `${colors.green('✓')} Changed app base to ${colors.green(base)} (file: ${colors.cyan(projectRoot)}${colors.cyan('/')}${colors.yellow(
          basename(filePath)
        )})`
      );
    } else {
      console.log(colors.yellow(`Correct app base was already present in ${colors.cyan(projectRoot)}${colors.cyan('/')}${basename(filePath)}`));
    }
  }
}

edit(pathJoin(projectRoot, 'svelte.config.js'));
