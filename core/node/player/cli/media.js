import { colors } from 'dmt/common';

import { ipcClient, colorJSON } from 'dmt/cli';

import formatMediaResponse from './lib/formatMediaResponse';

function showHelp(response) {
  console.log(colors.yellow('Usage:'));
  console.log(`${colors.green('media.js [action] [actionOptions]')}`);
  console.log();
  console.log(response.methods);
}

let action;

const args = process.argv.slice(2);

if (args.length < 1 || ['-h', '--help', 'help'].includes(args[0])) {
  action = 'info';
} else {
  action = args.shift();
}

let atDevice;

if (args.length > 0 && args[0].startsWith('@') && !args[0].includes('=')) {
  atDevice = args.shift();
}

const payload = args.join(' ');

ipcClient({ actorName: 'player', action, payload, atDevice })
  .then(response => {
    console.log(`${colors.cyan('dmt-player')} ${colors.green(`Ξ ${action.toUpperCase()}`)}`);

    if (action == 'info') {
      showHelp(response);
    } else {
      formatMediaResponse(action, response, payload);
    }

    process.exit();
  })
  .catch(e => {
    console.log(colors.red(e.message));
    console.log(`If ${colors.cyan('dmt-proc')} is not running, please start it with ${colors.green('dmt start')}.`);
    process.exit();
  });
