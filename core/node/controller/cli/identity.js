import { colors } from 'dmt/common';

import { ipcClient, parseArgs } from 'dmt/cli';

const args = parseArgs(process.argv.slice(2));

if (args.error) {
  console.log('Error in arguments, please use --help');
  process.exit();
}

ipcClient({ actorName: 'identity', action: 'list' })
  .then(({ identityList }) => {
    console.log(identityList);
    process.exit();
  })
  .catch(e => {
    console.log(colors.red(e));
    process.exit();
  });
