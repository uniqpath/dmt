import colors from 'colors';

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
  action = args[0];
}

const payload = args.slice(1).join(' ');

ipcClient({ actorName: 'player', action, payload })
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
