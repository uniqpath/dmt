import colors from 'colors';

import { ipcClient, aggregateSearchResultsFormatter, colorJSON } from 'dmt/cli';

const args = process.argv.slice(2);

if (args.length < 1 || args[0] == '-h') {
  console.log(colors.yellow('Usage:'));
  console.log(`${colors.green('search.js [terms] [@count=N] [@mediaType=music|video|photos]')}`);
  process.exit();
}

const action = 'search';

const payload = args.join(' ');

ipcClient({ actorName: 'search', action, payload })
  .then(response => {
    aggregateSearchResultsFormatter(response);

    process.exit();
  })
  .catch(e => {
    console.log(colors.red(e.message));
    process.exit();
  });
