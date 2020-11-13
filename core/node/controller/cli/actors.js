import colors from 'colors';
import { ipcClient, parseArgs } from 'dmt/cli';

const args = parseArgs(process.argv.slice(2));

if (args.error) {
  console.log('Error in arguments, please use --help');
  process.exit();
}

ipcClient({ actorName: 'controller', action: 'actors' })
  .then(({ registeredActors }) => {
    console.log(registeredActors);
    process.exit();
  })
  .catch(e => {
    console.log(colors.red(e));
    process.exit();
  });
