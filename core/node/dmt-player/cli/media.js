import colors from 'colors';

import { ipcClient, colorJSON } from 'dmt-cli';

import formatMediaResponse from './lib/formatMediaResponse';

const args = process.argv.slice(2);

if (args.length < 1) {
  console.log(colors.yellow('Usage:'));
  process.exit();
}

const action = args[0];

const payload = args.slice(1).join(' ');

try {
  ipcClient({ actorName: 'player', action, payload }).then(response => {
    formatMediaResponse(action, response, payload);
    process.exit();
  });
} catch (e) {
  console.log(e);
}
