import colors from 'colors';

import ipcCall from '../../dmt-controller/program/ipc/client';

const args = process.argv.slice(2);

if (args.length < 1) {
  console.log(colors.yellow('Usage:'));
  console.log(`${colors.green('index.js [action] [payload]?')} ${colors.gray('')}`);
  process.exit();
}

let payload;

if (args.length > 1) {
  payload = args[1];
}

try {
  ipcCall({ storeName: 'gui', action: args[0], payload });
} catch (e) {
  console.log(e);
}
