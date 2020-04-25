import colors from 'colors';
import dmt from 'dmt/bridge';
const { log } = dmt;

import { parseArgs as parseSearchArgs } from 'dmt/search';

function parseArgs(args) {
  return parseSearchArgs({ args, actorName: 'player', defaultMediaType: 'music' });
}

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
  actions.push({ command: 'volume', handler });
  actions.push({ command: 'forward', handler });
  actions.push({ command: 'backward', handler });
  actions.push({ command: 'goto', handler });
  actions.push({ command: 'limit', handler });
  actions.push({ command: 'repeat', handler });

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
    if (args != '') {
      if (!Array.isArray(args) && args != null) {
        args = [args];
      }

      player[action.command](...args)
        .then(data => success(data))
        .catch(e => {
          reject(e);
        });
    } else {
      player[action.command]()
        .then(data => {
          success(data);
        })
        .catch(e => {
          reject(e);
        });
    }
  });
}

function searchHandler({ args, action }, { searchClient }) {
  return new Promise((success, reject) => {
    args = parseArgs(args);

    searchClient
      .search(args)
      .then(aggregateResults => {
        success(aggregateResults);
      })
      .catch(e => {
        log.red(e);
        reject(e);
      });
  });
}

function playHandler({ args, action }, { searchClient, player }) {
  args = parseArgs(args);

  return new Promise((success, reject) => {
    if (action.command == 'play') {
      if (args.terms.length == 0) {
        player
          .play()
          .then(success)
          .catch(e => {
            reject(e);
          });
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

        const mappedResults = successfulResults.map(results => mapToLocal(results));

        const playableResults = mappedResults.map(res => res.results.map(result => result.filePath)).flat();

        player[action.command]({ files: playableResults })
          .then(success)
          .catch(e => {
            reject(e);
          });

        success(successfulResults);
      })
      .catch(reject);
  });
}

function insertplayHandler({ args }, { searchClient, player }) {
  return new Promise((success, reject) => {
    searchHandler({ args }, { searchClient })
      .then(aggregateResults => {
        const mappedResults = aggregateResults.map(results => mapToLocal(results));
        const playableResults = mappedResults.map(res => res.results.map(result => result.filePath)).flat();

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
