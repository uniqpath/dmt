import fs from 'fs';
import colors from 'colors';
import { ipcClient, parseArgs, Table } from 'dmt/cli';
import kindOf from 'kind-of';

const args = process.argv.slice(2);

if (args[0] == '--help') {
  showHelp();
  process.exit();
}

const arg = args.length > 0 ? args[0] : undefined;

const table = new Table();

const headers = ['slot', 'elements'];

const action = 'state';
const slotName = arg;

function displayType(value) {
  const renderType = {
    array: '[…]',
    object: '{…}',
    string: 'str',
    number: 'num'
  };

  return renderType[kindOf(value)];
}

function showHelp() {
  console.log(`${colors.green('dmt state')} show process state table with slot names`);
  console.log(`${colors.green(`dmt state ${colors.brightGreen('[slot]')}`)} show some slot contents`);
  console.log(`${colors.green('dmt state --all')} output the entire process state`);
  console.log(`${colors.green(`dmt state --export ${colors.brightGreen('[file.json]')}`)} output the entire process state and save to a file`);
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
    if (arg == '--all') {
      console.log(state);
    } else if (arg == '--export') {
      const filePath = args.slice(1).join(' ');
      if (filePath) {
        fs.writeFileSync(filePath, JSON.stringify(state, null, 2));
        console.log(`Exported json process state to ${colors.yellow(filePath)}`);
      } else {
        console.log(colors.red('⚠️  Missing filePath'));
        console.log();
        showHelp();
      }
    } else if (slotName) {
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
      showHelp();
    }

    process.exit();
  })
  .catch(e => {
    console.log(colors.red(e));
    process.exit();
  });
