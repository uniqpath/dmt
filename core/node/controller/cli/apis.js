import { colors } from 'dmt/common';

import { ipcClient, parseArgs, Table } from 'dmt/cli';

const args = parseArgs(process.argv.slice(2));

if (args.error) {
  console.log('Error in arguments, please use --help');
  process.exit();
}

function displayTable(registeredActors) {
  const table = new Table();

  const headers = ['apiName', 'restrictToLocal', 'methodCount'];

  table.push(headers.map(h => colors.cyan(h)));

  table.push(Table.divider);

  registeredActors.forEach(({ apiName, methodList, restrictToLocal }) => {
    table.push([colors.magenta(apiName), restrictToLocal ? '🔒' : colors.gray('No'), methodList.length]);
  });

  console.log(table.toString());
}

ipcClient({ apiName: 'controller', action: 'apis' })
  .then(({ registeredActors }) => {
    displayTable(registeredActors);
    process.exit();
  })
  .catch(e => {
    console.log(colors.red(e));
    process.exit();
  });
