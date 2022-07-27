import { colors } from 'dmt/common';

import { ipcClient } from 'dmt/cli';

const args = process.argv.slice(2);

let dev;
let msg = 'cli_nearby_notification';

if (args.length > 0) {
  if (args[0] == 'dev') {
    dev = true;
    if (args.length > 1) {
      msg = args.slice(1).join(' ');
    }
  } else {
    msg = args.join(' ');
  }
}

const title = 'REMINDER';

ipcClient({ apiName: 'controller', action: 'nearbyNotification', payload: { dev, msg, title, omitDeviceName: true } })
  .then(() => {
    process.exit();
  })
  .catch(e => {
    console.log(colors.red(e));
    process.exit(1);
  });
