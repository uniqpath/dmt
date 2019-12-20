const colors = require('colors');

const dmt = require('dmt-bridge');
const { cli } = dmt;

const rpc = require('dmt-rpc');

const { SearchClient, aggregateSearchResultsFormatter } = require('../index');

function help() {
  console.log(colors.cyan('\n'));
  console.log(colors.yellow('Usage:'));
  console.log(
    `${colors.green('search [terms] [depth=1]')} ${colors.gray('Searches local and remote providers (and their providers up to depth n) for file resources')}`
  );
}

if (require.main === module) {
  if (process.argv.length > 2 && process.argv[2] == '-h') {
    help();
    process.exit();
  }

  try {
    const allArgs = process.argv.slice(2);

    const { terms, atDevices, attributeOptions } = cli(allArgs);

    const clientMaxResults = attributeOptions.count;

    (async () => {
      const promises = [];

      for (const device of atDevices) {
        const client = new SearchClient(device, { mediaType: attributeOptions.media });
        promises.push(client.search({ terms, clientMaxResults, contentRef: device.contentRef }));
      }

      Promise.all(promises)
        .then(allResults => {
          for (const results of allResults) {
            aggregateSearchResultsFormatter(results);
          }
          process.exit();
        })
        .catch(e => {
          rpc.errorFormatter(e, { host: '' });
          process.exit();
        });
    })();
  } catch (e) {
    console.log(colors.red(e.message));
  }
}
