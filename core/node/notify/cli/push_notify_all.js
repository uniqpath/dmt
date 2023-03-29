import { colors } from 'dmt/common';
//we go directly here so that we load the absolute minimum amount of code (entire lib2 (dmt notifiers) is bypasses)
import { highPriority as pushHP } from '../lib/pushover/index.js';

function help() {
  console.log(colors.green('Send push message to mobile devices via pushover.net service'));
  console.log(`${colors.yellow('Usage:')} cli notify_all [msg]`);
}

if (process.argv.length > 2 && process.argv[2] == '-h') {
  help();
  process.exit();
}
function send(msg, { highPriority = false } = {}) {
  pushHP({}, highPriority)
    .title('REMINDER')
    .notifyAll(msg)
    .then(() => {
      console.log(colors.green('Push message sent to all'));
      process.exit();
    })
    .catch(error => {
      console.log(colors.red('Problem sending the push message:'));
      console.log(error);
    });
}

const args = process.argv.slice(2);

if (args.length) {
  const highPriority = args[0] == '--highPriority';
  send((highPriority ? args.slice(1) : args).join(' '), { highPriority });
} else {
  help();
}
