const { join: pathJoin } = require('path');
const fs = require('fs');

let settings = fs.readFileSync('dmt/settings.json', 'utf-8');
settings = JSON.parse(settings);

const app_base = pathJoin('/', settings.app_base);

const AddedConfig = `[\\t\\n\\ ]*paths\\:[\\ ]{[\\t\\n\\ ]*assets:[\\ ]*\\'${app_base}\\'\\,[\\t\\n\\ ]*base:[\\ ]*\\'${app_base}\\'[\\t\\n\\ ]*\\}[\\ ]*\\,[\\t\\n\\ ]*`;

const restore = (filePath) => {
  if (fs.existsSync(filePath)) {
    svelteConfigFile = fs.readFileSync(filePath, 'utf8');
    svelteConfigFile = svelteConfigFile.replace(RegExp(AddedConfig), `\n\t`);
    fs.writeFileSync(filePath, svelteConfigFile);

    console.log(`restored svelte.config.cjs`);
  }
};

restore('svelte.config.js');
restore('svelte.config.cjs');
