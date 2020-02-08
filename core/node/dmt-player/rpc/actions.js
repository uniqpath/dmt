import colors from 'colors';
import dmt from 'dmt-bridge';
const { log } = dmt;

import mapToLocal from '../lib/mapToLocal';

function getActions() {
  const actions = [];

  actions.push({ command: 'info', handler: infoHandler });

  actions.push({ command: 'search', handler: searchHandler });
  actions.push({ command: 'play', handler: playHandler });
  actions.push({ command: 'add', handler: addHandler });
  actions.push({ command: 'insert', handler: addHandler });
  actions.push({ command: 'insplay', handler: insertplayHandler });
  actions.push({ command: 'pause', handler });
  actions.push({ command: 'next', handler });
  actions.push({ command: 'list', handler });
  actions.push({ command: 'cut', handler });
  actions.push({ command: 'paste', handler });
  actions.push({ command: 'bump', handler });
  actions.push({ command: 'status', handler });
  actions.push({ command: 'shuffle', handler });
  actions.push({ command: 'stop', handler });
  actions.push({ command: 'volume', handler, argsMapper: args => args[0] });
  actions.push({ command: 'forward', handler, argsMapper: args => args[0] });
  actions.push({ command: 'backward', handler, argsMapper: args => args[0] });
  actions.push({ command: 'goto', handler, argsMapper: args => args[0] });
  actions.push({ command: 'limit', handler, argsMapper: args => args[0] });

  return actions;
}

function infoHandler() {
  return new Promise((success, reject) => {
    const data = { methods: actions().map(action => action.command) };
    success(data);
  });
}

function handler({ args, action }, { player }) {
  return new Promise((success, reject) => {
    player[action.command](action.argsMapper ? action.argsMapper(args) : args)
      .then(data => success(data))
      .catch(reject);
  });
}

function searchHandler({ args, action }, { searchClient }) {
  return new Promise((success, reject) => {
    const { serverMaxResults } = dmt.maxResults('player');
    const clientMaxResults = args.clientMaxResults ? args.clientMaxResults : serverMaxResults;

    searchClient
      .search({ terms: args.terms, mediaType: args.mediaType || 'music', clientMaxResults })
      .then(aggregateResults => {
        success(aggregateResults);
      })
      .catch(() => reject(new Error('Search service probably not running on media provider')));
  });
}

function playHandler({ args, action }, { searchClient, player }) {
  return new Promise((success, reject) => {
    if (action.command == 'play') {
      if (args.terms.length == 0) {
        player.play();
        success([]);
        return;
      }

      if (args.terms.length == 1 && args.terms[0].match(new RegExp(/^\d+$/))) {
        player.next({ songId: args.terms[0] });
        success([]);
        return;
      }
    }

    addHandler({ args, action }, { searchClient, player })
      .then(success)
      .catch(reject);
  });
}

function addHandler({ args, action }, { searchClient, player }) {
  return new Promise((success, reject) => {
    searchHandler({ args }, { searchClient })
      .then(aggregateResults => {
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
        const playableResults = mappedResults.map(res => res.results).flat();

        player[action.command]({ files: playableResults });

        success(successfulResults);
      })
      .catch(reject);
  });
}

function insertplayHandler({ args }, { searchClient, player }) {
  return new Promise((success, reject) => {
    searchHandler({ args }, { searchClient })
      .then(aggregateResults => {
        const shareMappings = dmt.remoteShareMappings();
        const mappedResults = aggregateResults.map(results => mapToLocal(results, shareMappings));
        const playableResults = mappedResults.map(res => res.results).flat();

        player.insert({ files: playableResults }).then(() => {
          if (playableResults.length == 0) {
            success(aggregateResults);
          } else {
            player
              .next({ fromAction: true })
              .then(() => success(aggregateResults))
              .catch(reject);
          }
        });
      })
      .catch(reject);
  });
}

const actions = getActions();

export default actions;
