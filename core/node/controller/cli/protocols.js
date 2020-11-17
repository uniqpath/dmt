import colors from 'colors';
import { ipcClient, parseArgs, Table } from 'dmt/cli';

const args = parseArgs(process.argv.slice(2));

if (args.error) {
  console.log('Error in arguments, please use --help');
  process.exit();
}

function displayTable(registeredProtocols) {
  const table = new Table();

  const headers = ['protocol', 'lane'];

  table.push(headers.map(h => colors.cyan(h)));

  table.push(Table.divider);

  registeredProtocols.forEach(({ protocol, lanes }, key, arr) => {
    lanes.forEach(lane => {
      table.push([colors.magenta(protocol), colors.cyan(lane)]);
    });

    if (!Object.is(arr.length - 1, key)) {
      table.push(Table.divider);
    }
  });

  console.log(table.toString());
}

ipcClient({ actorName: 'controller', action: 'protocols' })
  .then(({ registeredProtocols }) => {
    displayTable(registeredProtocols);
    process.exit();
  })
  .catch(e => {
    console.log(colors.red(e));
    process.exit();
  });
