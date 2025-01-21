import { ipcClient, parseArgs, Table } from 'dmt/cli';

import { colors, timeutils } from 'dmt/common';

const { prettyTimeAgo } = timeutils;

const args = parseArgs(process.argv.slice(2));

if (args.error) {
  console.log('Error in arguments, please use --help');
  process.exit();
}

if (args.help == true) {
  console.log(colors.yellow('💡 HELP'));
  console.log();
  console.log(colors.gray(`${colors.green('dmt connections --full')} show more info (connection uptime, full deviceKey)`));
  console.log(colors.gray(`${colors.green('dmt connections --raw')} show raw json output`));
  process.exit();
}

const action = 'connections';

function displayTable(connectionList, outgoing = true) {
  if (connectionList.length > 0) {
    const table = new Table();

    const headers = ['address', 'protocol'];

    if (args.full) {
      headers.push(...['conn uptime', 'last message']);
    }

    headers.push('remote deviceKey');

    table.push(headers.map(h => colors.cyan(h)));

    table.push(Table.divider);

    let prevProtocol;

    connectionList.forEach(({ address, protocol, ready, connectedAt, lastMessageAt, remotePubkeyHex }) => {
      const deviceKey = args.full ? remotePubkeyHex : `${remotePubkeyHex ? remotePubkeyHex.substr(0, 8) : '?'}…`;

      const connectedMarker = ready ? colors.green('✓') : colors.red('✖');

      const addressLine = `${connectedMarker} ${colors.white(address)}`;

      const connUptime = connectedAt ? prettyTimeAgo(connectedAt, { detailed: true }).replace(' ago', '') : '';
      const lastMessageTime = lastMessageAt ? prettyTimeAgo(lastMessageAt, { detailed: true }) : '';

      const line = [addressLine, protocol];

      if (args.full) {
        line.push(...[colors.gray(connUptime), colors.gray(lastMessageTime)]);
      }

      line.push(colors.gray(deviceKey));

      if (prevProtocol && prevProtocol != protocol) {
        table.push(Table.divider);
      }

      prevProtocol = protocol;

      table.push(line);
    });

    console.log(table.toString());
  } else {
    console.log(colors.gray(' — No working connections'));
  }
}

ipcClient({ apiName: 'controller', action })
  .then(({ incoming, outgoing }) => {
    console.log(colors.bold().white(`Open ${colors.cyan('dmt-proc')} ⚡ connections:`));
    console.log();
    console.log(colors.bold().white(`${colors.cyan('🔺')} Outgoing`));
    if (args.raw) {
      console.log(outgoing);
    } else {
      displayTable(outgoing);
    }
    console.log();

    console.log(colors.bold().white(`${colors.cyan('🔻')} Incoming`));
    if (args.raw) {
      console.log(incoming);
    } else {
      displayTable(incoming, false);
    }

    console.log();
    console.log(colors.gray(`💡 See ${colors.green('dmt connections --help')} for more options`));

    process.exit();
  })
  .catch(e => {
    console.log(colors.red(e));
    process.exit();
  });
