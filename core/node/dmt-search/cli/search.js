import colors from 'colors';

import { ipcClient } from 'dmt-cli';

const args = process.argv.slice(2);

if (args.length < 1) {
  console.log(colors.yellow('Usage:'));
  process.exit();
}

const action = 'search';

const payload = args.join(' ');

try {
  ipcClient({ actorName: 'search', action, payload }).then(response => {
    console.log(response);
    process.exit();
  });
} catch (e) {
  console.log(e);
}
