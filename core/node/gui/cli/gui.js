import { colors, promiseTimeout } from 'dmt/common';

import { ipcClient } from 'dmt/cli';

const args = process.argv.slice(2);

if (args.length < 1) {
  console.log(colors.yellow('Usage:'));
  console.log(`${colors.green('index.js [action] [payload]?')} ${colors.gray('')}`);
  process.exit();
}

const action = args[0];
const payload = args.slice(1).join(' ');

promiseTimeout(2000, ipcClient({ namespace: 'gui', action, payload }))
  .then(() => {
    console.log(colors.green('ok'));
    process.exit();
  })
  .catch(() => {
    process.exit();
  });
