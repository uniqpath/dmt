import colors from 'colors';
import { ipcClient } from 'dmt/cli';

const args = process.argv.slice(2);

const action = 'connections';
const payload = args.slice(1).join(' ');

import Table from 'cli-table2';

function displayTable(connectionList, addressField = 'address') {
  if (connectionList.length > 0) {
    const table = new Table({
      chars: { mid: '', 'left-mid': '', 'mid-mid': '', 'right-mid': '' }
    });

    const headers = [addressField, 'protocol', 'lane', 'remotePubkey'];

    table.push(headers.map(h => colors.cyan(h)));

    table.push(
      ...connectionList.map(({ ip, address, protocol, protocolLane, remotePubkeyHex }) => {
        return [colors.brightWhite(ip || address), protocol, protocolLane, colors.gray(`${(remotePubkeyHex || '').substr(0, 8)} …`)];
      })
    );

    console.log(table.toString());
  } else {
    console.log(colors.gray(' — No open connections'));
  }
}

ipcClient({ actorName: 'device', action, payload })
  .then(({ incomingGui, incomingOther, outgoing }) => {
    console.log(colors.magenta('  ··· ⚡ fiberState ···'));
    console.log(colors.brightWhite(`Open ${colors.cyan('dmt-proc')} connections:`));
    console.log();
    console.log(colors.brightWhite(`${colors.cyan('⚡ Slot1')} → ${colors.cyan('🌋')} ${colors.cyan('Outgoing')}`));
    displayTable(outgoing);
    console.log();

    console.log(colors.brightWhite(`${colors.cyan('⚡ Slot2')} → ${colors.cyan('🪂')} Incoming`));
    displayTable(incomingOther, 'ip');

    console.log();

    console.log(colors.brightWhite(`⚡ ${colors.cyan('Slot3')} → ${colors.cyan('🖥️')}  Incoming GUI ${colors.gray('(usually from web browser)')}`));
    displayTable(incomingGui, 'ip');

    console.log();

    process.exit();
  })
  .catch(e => {
    console.log(colors.red(e.message));
    process.exit();
  });
