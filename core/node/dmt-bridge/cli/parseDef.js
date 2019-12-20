const colorJson = require('../lib/colorJson');
const colors = require('colors');
const def = require('../lib/parsers/def/parser.js');

function help() {
  console.log(colors.cyan('\n'));
  console.log(colors.yellow('Usage:'));
  console.log(`${colors.green('')} ${colors.gray('')}`);
  console.log(`${colors.green('')} ${colors.gray('')}`);
  console.log(`${colors.green('')} ${colors.gray('')}`);
}

if (require.main === module) {
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
      console.log(colorJson(obj));
    } catch (e) {
      console.log(colors.red(e.toString()));
    }
  })();
}
