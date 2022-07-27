import { log, colors } from 'dmt/common';

import { parseSearchQuery as _parseSearchQuery } from 'dmt/search';

function parseSearchQuery(query) {
  return _parseSearchQuery({ query, apiName: 'player', defaultMediaType: 'music' });
}

function getMethods() {
  const methods = [];

  methods.push({ name: 'info', handler: infoHandler });

  methods.push({ name: 'search', handler: searchHandler });

  methods.push({ name: 'play', handler: playHandler });
  methods.push({ name: 'playUrl', handler });
  methods.push({ name: 'pause', handler });
  methods.push({ name: 'stop', handler });
  methods.push({ name: 'next', handler });

  methods.push({ name: 'volume', handler });
  methods.push({ name: 'status', handler });
  methods.push({ name: 'list', handler });

  methods.push({ name: 'add', handler: addOrInsertHandler });
  methods.push({ name: 'insert', handler: addOrInsertHandler });
  methods.push({ name: 'insplay', handler: insertplayHandler });

  methods.push({ name: 'similar', handler });
  methods.push({ name: 'bump', handler });
  methods.push({ name: 'songsToBump', handler });
  methods.push({ name: 'cut', handler });
  methods.push({ name: 'paste', handler });

  methods.push({ name: 'forward', handler });
  methods.push({ name: 'backward', handler });
  methods.push({ name: 'goto', handler });

  methods.push({ name: 'shuffle', handler });
  methods.push({ name: 'limit', handler });
  methods.push({ name: 'repeat', handler });

  return methods;
}

function infoHandler() {
  return new Promise((success, reject) => {
    const data = { methods: getMethods().map(method => method.name) };
    success(data);
  });
}

function playerNotReadyError() {
  return new Error('Player was not yet initialized, please try again.');
}

function handler({ args, method }, { player }) {
  return new Promise((success, reject) => {
    if (!player.isInitialized()) {
      reject(playerNotReadyError());
      return;
    }

    if (args) {
      if (!Array.isArray(args)) {
        args = [args];
      }

      player[method.name](...args)
        .then(success)
        .catch(reject);
    } else {
      player[method.name]()
        .then(success)
        .catch(reject);
    }
  });
}

function searchHandler({ args, method }, { paraSearch }) {
  return new Promise((success, reject) => {
    const query = args;
    paraSearch
      .search(parseSearchQuery(query))
      .then(aggregateResults => {
        success(aggregateResults);
      })
      .catch(e => {
        log.red(e);
        reject(e);
      });
  });
}

function playHandler({ args, method }, { paraSearch, player }) {
  const query = args || '';

  const { terms } = parseSearchQuery(query);

  return new Promise((success, reject) => {
    if (!player.isInitialized()) {
      reject(playerNotReadyError());
      return;
    }

    if (method.name == 'play') {
      if (terms.length == 0) {
        player
          .play()
          .then(success)
          .catch(reject);
        return;
      }

      if (terms.length == 1 && terms[0].match(new RegExp(/^\d+$/))) {
        player
          .next({ songId: terms[0] })
          .then(() => {
            success([]);
          })
          .catch(e => {
            success({ error: e.message });
          });

        return;
      }
    }

    addOrInsertHandler({ args, method }, { paraSearch, player })
      .then(success)
      .catch(reject);
  });
}

function doSearch({ args, paraSearch, player }) {
  return new Promise((success, reject) => {
    searchHandler({ args }, { paraSearch })
      .then(aggregateResults => {
        const successfulResults = aggregateResults.filter(res => !res.error);

        const errors = aggregateResults.filter(res => res.error);
        errors.forEach(results => {
          log.gray(
            `${colors.red('⚠️  Warning:')} could not get search results from provider ${colors.magenta(results.meta.providerHost)} (${
              results.meta.providerAddress
            }): ${colors.red(results.error)}`
          );
        });

        const mappedResults = successfulResults.map(results => player.mapToLocal(results));

        const playableResults = mappedResults.map(res => res.results.map(result => result.filePath)).flat();

        success({ aggregateResults, playableResults });
      })
      .catch(reject);
  });
}

function addOrInsertHandler({ args, method }, { paraSearch, player }) {
  return new Promise((success, reject) => {
    doSearch({ args, paraSearch, player })
      .then(({ aggregateResults, playableResults }) => {
        player[method.name]({ files: playableResults })
          .then(() => {
            success(aggregateResults);
          })
          .catch(reject);
      })
      .catch(reject);
  });
}

function insertplayHandler({ args }, { paraSearch, player }) {
  return new Promise((success, reject) => {
    if (!player.isInitialized()) {
      reject(playerNotReadyError());
      return;
    }

    doSearch({ args, paraSearch, player })
      .then(({ aggregateResults, playableResults }) => {
        const wasEmptyPlaylist = player.playlist.count() == 0;

        if (playableResults.length == 0) {
          success(aggregateResults);
        } else {
          player
            .insert({ files: playableResults })
            .then(() => {
              if (wasEmptyPlaylist && playableResults.length == 1) {
                player
                  .playCurrent()
                  .then(() => success(aggregateResults))
                  .catch(reject);
              } else {
                player
                  .next({ fromAction: true })
                  .then(() => success(aggregateResults))
                  .catch(reject);
              }
            })
            .catch(reject);
        }
      })
      .catch(reject);
  });
}

const methods = getMethods();

export default methods;
