import { colors } from 'dmt/common';

import { ipcClient, aggregateSearchResultsFormatter, colorJSON } from 'dmt/cli';

const args = process.argv.slice(2);

if (args.length < 1 || ['-h', '--help', 'help'].includes(args[0])) {
  console.log(colors.yellow('Usage:'));
  console.log(`${colors.green('search.js [terms] [@count=N] [@mediaType=music|video|photos]')}`);
  process.exit();
}

const action = 'search';

const query = args.join(' ');

ipcClient({ apiName: 'search', action, payload: { query } })
  .then(response => {
    aggregateSearchResultsFormatter(response);

    process.exit();
  })
  .catch(e => {
    console.log(colors.red(e.message));
    console.log(`If ${colors.cyan('dmt-proc')} is not running, please start it with ${colors.green('dmt start')}.`);
    process.exit();
  });
