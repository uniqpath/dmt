import colors from 'colors';

import { ipcClient } from 'dmt/cli';

const args = process.argv.slice(2);

if (args.length < 1) {
  console.log(colors.yellow('Usage:'));
  console.log(`${colors.green('index.js [action] [payload]?')} ${colors.gray('')}`);
  process.exit();
}

const action = args[0];
const payload = args.slice(1).join(' ');

ipcClient({ storeName: 'gui', action, payload })
  .then(response => {
    console.log(colors.green('ok'));
    process.exit();
  })
  .catch(() => {
    process.exit();
  });
