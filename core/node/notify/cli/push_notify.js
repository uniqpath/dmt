import { colors } from 'dmt/common';
import { push } from '../index';

function help() {
  console.log(colors.green('Send push message to mobile devices via pushover.net service'));
  console.log(`${colors.yellow('Usage:')} cli notify [msg]`);
}

if (process.argv.length > 2 && process.argv[2] == '-h') {
  help();
  process.exit();
}
function send(msg, { highPriority = false } = {}) {
  push
    .highPriority(highPriority)
    .notify(msg)
    .then(success => {
      if (success) {
        console.log(colors.green('Push message sent'));
      } else {
        console.log(colors.red('Problem sending the push message:'));
      }

      process.exit();
    });
}

const args = process.argv.slice(2);

if (args.length) {
  const highPriority = args[0] == 'highPriority';
  send((highPriority ? args.slice(1) : args).join(' '), { highPriority });
} else {
  help();
}
