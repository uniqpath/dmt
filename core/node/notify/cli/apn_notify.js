import { colors } from 'dmt/common';
import { apn } from '../index';

function help() {
  console.log(colors.green('Send push message to mobile devices via pushover.net service'));
  console.log(`${colors.yellow('Usage:')} cli apn [msg]`);
}

if (process.argv.length > 2 && process.argv[2] == '-h') {
  help();
  process.exit();
}
function send(msg) {
  apn.notify(msg).then(() => {
    console.log(colors.green('Push message sent'));
    process.exit();
  });
}

const args = process.argv.slice(2);

if (args.length) {
  send(args.join(' '));
} else {
  help();
}
