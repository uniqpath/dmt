import colors from 'colors';
import { push } from '../index';

function help() {
  console.log(colors.green('Send push message to mobile devices via pushover.net service'));
  console.log(`${colors.yellow('Usage:')} cli notify [msg]`);
}

if (process.argv.length > 2 && process.argv[2] == '-h') {
  help();
  process.exit();
}
function send(msg) {
  push
    .notify(msg)
    .then(() => {
      console.log(colors.green('Push message sent'));
      process.exit();
    })
    .catch(error => {
      console.log(colors.red('Problem sending the push message:'));
      console.log(error);
    });
}

const args = process.argv.slice(2);

if (args.length) {
  send(args.join(' '));
} else {
  help();
}
