import { colors } from 'dmt/common';

import { ipcClient } from 'dmt/cli';

const args = process.argv.slice(2);

const action = args.length > 0 ? args[0] : 'info';
const payload = args.slice(1).join(' ');

ipcClient({ apiName: 'controller', action, payload })
  .then(response => {
    if (action == 'log') {
      console.log();
      for (const line of response) {
        console.log(line);
      }
    } else if (response && JSON.stringify(response) != '{}') {
      console.log(response);
    }

    process.exit();
  })
  .catch(e => {
    console.log(colors.red(e));
    process.exit();
  });
