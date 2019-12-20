const dmt = require('dmt-bridge');
const { def, cli, log } = dmt;

const { SearchClient } = require('dmt-search');
const LocalPlayer = require('../lib/localPlayer');

const mapToLocal = require('../lib/mapToLocal');

function setup({ program }) {
  const playerInfo = dmt.services('player');
  if (!playerInfo) {
    throw new Error('Cannot find player service definition');
  }

  const contentRefs = def.values(playerInfo.contentRef);
  const providers = dmt.providersFromContentRefs(contentRefs);

  const searchClient = new SearchClient(providers);
  const player = new LocalPlayer({ program });

  setupWsAPI({ program, searchClient, player });

  return { searchClient, player };
}

function executeSearch({ args, searchClient, requestId }) {
  const { terms, atDevices, attributeOptions } = cli(args.trim().split(/\s+/));

  const clientMaxResults = attributeOptions.count;
  const mediaType = attributeOptions.media || 'music';

  const { serverMaxResults } = dmt.maxResults('player');

  return new Promise((success, reject) => {
    searchClient
      .search({ terms, mediaType, clientMaxResults: clientMaxResults || serverMaxResults })
      .then(success)
      .catch(reject);
  });
}

function search({ args, searchClient, channel, requestId }) {
  executeSearch({ args, searchClient, requestId })
    .then(aggregateResults => {
      const response = { type: 'search_results', requestId, aggregateResults };
      channel.send(JSON.stringify(response));
    })
    .catch(e => {
      log.red(e);
    });
}

function addOrPlay(action, { args, searchClient, channel, requestId, player }) {
  executeSearch({ args, searchClient, requestId })
    .then(aggregateResults => {
      const response = { type: 'search_results', requestId, aggregateResults };

      const successfulResults = aggregateResults.filter(res => !res.error);

      aggregateResults
        .filter(res => res.error)
        .forEach(results => {
          log.gray(
            `${colors.red('⚠️  Warning:')} could not get search results from provider ${colors.magenta(results.meta.providerHost)} (${
              results.meta.providerAddress
            }): ${colors.red(results.error)}`
          );
        });

      const shareMappings = dmt.remoteShareMappings();
      const mappedResults = successfulResults.map(results => mapToLocal(results, shareMappings));
      const playableResults = dmt.util.flatten(mappedResults.map(res => res.results));

      player[action]({ files: playableResults });
    })
    .catch(e => {
      log.red(e);
    });
}

function setupWsAPI({ program, searchClient, player }) {
  program.on('ws_api_request', ({ action, payload, channel }) => {
    const { method, args, requestId } = payload;

    switch (method) {
      case 'search':
        search({ args, searchClient, channel, requestId });
        break;
      case 'add':
      case 'insert':
      case 'play':
        addOrPlay(method, { args, searchClient, channel, requestId, player });
        break;
      default:
        break;
    }
  });
}

module.exports = setup;
