import colors from 'colors';
import { ipcClient } from 'dmt/cli';
import kindOf from 'kind-of';

import dmt from 'dmt/bridge';

const { Table } = dmt;

const table = new Table({
  chars: { mid: '', 'left-mid': '', 'mid-mid': '', 'right-mid': '' }
});

const headers = ['slot', 'elements'];

const args = process.argv.slice(2);

const action = 'state';
const slotName = args.join('');

function displayType(value) {
  const renderType = {
    array: '[…]',
    object: '{…}',
    string: 'str',
    number: 'num'
  };

  return renderType[kindOf(value)];
}

function numElements(value) {
  const type = kindOf(value);

  if (type == 'string' || type == 'number') {
    return colors.gray('/');
  }

  let len = 0;

  if (Array.isArray(value)) {
    len = value.length;
  } else {
    len = Object.keys(value).length;
  }

  return len > 0 ? len : colors.gray(len);
}

ipcClient({ actorName: 'device', action })
  .then(({ state, stateChangesCount }) => {
    if (slotName) {
      console.log('Observed state slot:');
      console.log();
      console.log(colors.yellow(`${slotName} =`));
      console.log(state[slotName]);
      console.log();
    } else {
      console.log(colors.brightWhite(`🗒️  ${colors.cyan('dmt-proc')} in-memory ${colors.magenta('state:')}`));
      console.log();
      table.push(headers.map(h => colors.cyan(h)));

      table.push(
        ...Object.keys(state)
          .sort()
          .map(slot => {
            const value = state[slot];
            return [`${colors.brightWhite(slot)} ${colors.gray(displayType(value))}`, numElements(value)];
          })
      );

      const uptime = dmt.prettyMacroTime(state.device.bootedAt).replace(' ago', '');

      console.log(table.toString());
      console.log();
      console.log(
        `🌀 ${colors.cyan('DMT')} announced ${colors.magenta(`${stateChangesCount} state changes`)} in ${colors.brightWhite(uptime)} since process restart.`
      );

      console.log();
      console.log(`💡 Use ${colors.green('dmt state [slot]')} to see the slot content.`);
    }

    process.exit();
  })
  .catch(e => {
    console.log(colors.red(e));
    process.exit();
  });
