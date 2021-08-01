import { colors } from 'dmt/common';

import { ipcClient, parseArgs, Table } from 'dmt/cli';

const args = parseArgs(process.argv.slice(2));

if (args.error) {
  console.log('Error in arguments, please use --help');
  process.exit();
}

function displayTable(registeredProtocols) {
  const table = new Table();

  const headers = ['protocol'];

  table.push(headers.map(h => colors.cyan(h)));

  table.push(Table.divider);

  registeredProtocols.forEach((protocol, key, arr) => {
    table.push([colors.green(protocol)]);
  });

  console.log(table.toString());
}

ipcClient({ apiName: 'controller', action: 'protocols' })
  .then(({ registeredProtocols }) => {
    displayTable(registeredProtocols);
    process.exit();
  })
  .catch(e => {
    console.log(colors.red(e));
    process.exit();
  });
