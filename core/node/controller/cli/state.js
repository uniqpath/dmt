import colors from 'colors';
import { ipcClient, parseArgs, Table } from 'dmt/cli';
import kindOf from 'kind-of';

const args = parseArgs(process.argv.slice(2));

if (args.error) {
  console.log('Error in arguments, please use --help');
  process.exit();
}

const table = new Table();

const headers = ['slot', 'elements'];

const action = 'state';
const slotName = args.slot;

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

ipcClient({ actorName: 'controller', action })
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

      table.push(Table.divider);

      table.push(
        ...Object.keys(state)
          .sort()
          .map(slot => {
            const value = state[slot];
            return [`${colors.brightWhite(slot)} ${colors.gray(displayType(value))}`, numElements(value)];
          })
      );

      console.log(table.toString());

      console.log();
      console.log(`💡 Use ${colors.green('dmt state --slot [slotName]')} to see the slot content.`);
    }

    process.exit();
  })
  .catch(e => {
    console.log(colors.red(e));
    process.exit();
  });
