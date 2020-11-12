import colors from 'colors';
import { ipcClient, parseArgs, Table } from 'dmt/cli';

const action = 'connections';

function displayTable(connectionList, outgoing = true) {
  if (connectionList.length > 0) {
    const table = new Table({
      chars: { mid: '', 'left-mid': '', 'mid-mid': '', 'right-mid': '' }
    });

    const headers = ['address', 'protocol', 'lane', 'remotePubkey'];

    if (outgoing) {
      headers.push('ready');
    }

    table.push(headers.map(h => colors.cyan(h)));

    table.push(
      ...connectionList.map(({ address, protocol, protocolLane, ready, remotePubkeyHex }) => {
        const line = [colors.white(address), protocol, protocolLane, colors.gray(`${(remotePubkeyHex || '').substr(0, 8)} …`)];

        if (outgoing) {
          line.push(ready ? colors.green('  ✓') : colors.red('  ✖'));
        }

        return line;
      })
    );

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
