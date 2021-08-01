import fs from 'fs';
import { join as pathJoin } from 'path';

import colors from './colors.js';

const appBase = process.argv[3];
const projectRoot = process.argv[2];

const base = pathJoin('/', appBase);

const AddedConfig = `[\\t\\n\\ ]*paths\\:[\\ ]{[\\t\\n\\ ]*base:[\\ ]*\\'${base}\\'[\\t\\n\\ ]*\\}[\\ ]*\\,[\\t\\n\\ ]*`;

const restore = filePath => {
  if (fs.existsSync(filePath)) {
    let svelteConfigFile = fs.readFileSync(filePath, 'utf8');
    svelteConfigFile = svelteConfigFile.replace(RegExp(AddedConfig), `\n\t`);
    fs.writeFileSync(filePath, svelteConfigFile);

    console.log(colors.yellow('— Restored svelte.config.cjs'));
  }
};

restore(pathJoin(projectRoot, 'svelte.config.js'));
