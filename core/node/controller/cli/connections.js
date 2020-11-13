import colors from 'colors';
import { ipcClient, parseArgs, Table } from 'dmt/cli';

const args = parseArgs(process.argv.slice(2));

if (args.error) {
  console.log('Error in arguments, please use --help');
  process.exit();
}

if (args.help == true) {
  console.log(colors.yellow('💡 HELP'));
  console.log();
  console.log(`${colors.green('dmt connections --full')} see full deviceKey`);
  process.exit();
}

const action = 'connections';

function displayTable(connectionList, outgoing = true) {
  if (connectionList.length > 0) {
    const table = new Table();

    const headers = ['address', 'protocol', 'lane', 'remoteDeviceKey'];

    table.push(headers.map(h => colors.cyan(h)));

    table.push(Table.divider);

    let prevProtocol;
    let prevLane;

    connectionList.forEach(({ address, protocol, protocolLane, ready, remotePubkeyHex }) => {
      const deviceKey = args.full ? remotePubkeyHex : `${remotePubkeyHex.substr(0, 8)}…`;

      let connectedMarker = colors.green('✓ ');

      if (outgoing && !ready) {
        connectedMarker = colors.red('✖ ');
      }

      const addressLine = `${connectedMarker}${colors.white(address)}`;

      const line = [addressLine, protocol, protocolLane, colors.gray(deviceKey)];

      if ((prevProtocol && prevProtocol != protocol) || (prevLane && prevLane != protocolLane)) {
        table.push(Table.divider);
      }

      prevProtocol = protocol;
      prevLane = protocolLane;

      table.push(line);
    });

    console.log(table.toString());
  } else {
    console.log(colors.gray(' — No open connections'));
  }
}

ipcClient({ actorName: 'device', action })
  .then(({ incoming, outgoing }) => {
    console.log(colors.brightWhite(`Open ${colors.cyan('dmt-proc')} ⚡ connections:`));
    console.log();
    console.log(colors.brightWhite(`${colors.cyan('🔺')} Outgoing`));
    displayTable(outgoing);
    console.log();

    console.log(colors.brightWhite(`${colors.cyan('🔻')} Incoming`));
    displayTable(incoming, false);

    process.exit();
  })
  .catch(e => {
    console.log(colors.red(e));
    process.exit();
  });
