import { colors } from 'dmt/common';

import colorJSON from '../lib/colorJSON.js';
import def from '../lib/parsers/def/parser.js';

function help() {
  console.log(colors.cyan('\n'));
  console.log(colors.yellow('Usage:'));
  console.log(`${colors.green('')} ${colors.gray('')}`);
  console.log(`${colors.green('')} ${colors.gray('')}`);
  console.log(`${colors.green('')} ${colors.gray('')}`);
}

if (process.argv.length > 2 && process.argv[2] == '-h') {
  help();
  process.exit();
}

const args = process.argv.slice(2);

(async () => {
  if (args.length == 0) {
    console.log(colors.red('Missing arguments'));
    return;
  }

  try {
    const parsed = def.parseFile(args[0]).multi;
    const obj = parsed.length == 1 ? parsed[0] : parsed;
    console.log(colorJSON(obj));
  } catch (e) {
    console.log(colors.red(e.toString()));
  }
})();
