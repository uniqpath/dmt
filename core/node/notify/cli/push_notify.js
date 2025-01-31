import { colors } from 'dmt/common';

import { timeutils } from 'dmt/common';

const { ONE_DAY } = timeutils;

//we go directly here so that we load the absolute minimum amount of code (entire lib2 (dmt notifiers) is bypasses)
import { highPriority as pushHP } from '../lib/pushover/index.js';

function help() {
  console.log(colors.green('Send push message to mobile devices via pushover.net service'));
  console.log(`${colors.yellow('Usage:')} cli notify [msg]`);
}

if (process.argv.length > 2 && process.argv[2] == '-h') {
  help();
  process.exit();
}
function send(msg, { reminder = false, highPriority = false } = {}) {
  pushHP({}, highPriority)
    .app('reminders')
    .title(reminder ? 'Reminder' : undefined)
    .ttl(3 * ONE_DAY)
    .notify(msg)
    .then(() => {
      console.log(colors.green('Push message sent'));

      process.exit();
    })
    .catch(error => {
      console.log(colors.red('Problem sending the push message:'));
      console.log(error);
      process.exit();
    });
}

const args = process.argv.slice(2);

let args2 = args;

const highPriorityArg = '--highPriority';
const reminderArg = '--reminder';

let highPriority;
let reminder;

if (args.length) {
  for (let i = 0; i < 2; i++) {
    if (args2.length > 0) {
      if (args2[0] == highPriorityArg) {
        highPriority = true;
        args2 = args2.slice(1);
      }
      if (args2[0] == reminderArg) {
        reminder = true;
        args2 = args2.slice(1);
      }
    }
  }

  send(args2.join(' '), { highPriority, reminder });
} else {
  help();
}
