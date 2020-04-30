import colors from 'colors';
import dmt from 'dmt/bridge';
const { log } = dmt;

import { parseArgs as parseSearchArgs } from 'dmt/search';

function parseArgs(args) {
  return parseSearchArgs({ args, actorName: 'player', defaultMediaType: 'music' });
}

import mapToLocal from '../lib/mapToLocal';

function getMethods() {
  const methods = [];

  methods.push({ name: 'info', handler: infoHandler });

  methods.push({ name: 'search', handler: searchHandler });

  methods.push({ name: 'play', handler: playHandler });
  methods.push({ name: 'pause', handler });
  methods.push({ name: 'stop', handler });
  methods.push({ name: 'next', handler });

  methods.push({ name: 'volume', handler });
  methods.push({ name: 'status', handler });
  methods.push({ name: 'list', handler });

  methods.push({ name: 'add', handler: addHandler });
  methods.push({ name: 'insert', handler: addHandler });
  methods.push({ name: 'insplay', handler: insertplayHandler });

  methods.push({ name: 'bump', handler });
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

function handler({ args, method }, { player }) {
  return new Promise((success, reject) => {
    if (args != '') {
      if (!Array.isArray(args) && args != null) {
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

function searchHandler({ args, method }, { searchClient }) {
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

function playHandler({ args, method }, { searchClient, player }) {
  args = parseArgs(args);

  return new Promise((success, reject) => {
    if (method.name == 'play') {
      if (args.terms.length == 0) {
        player
          .play()
          .then(success)
          .catch(reject);
        return;
      }

      if (args.terms.length == 1 && args.terms[0].match(new RegExp(/^\d+$/))) {
        player.next({ songId: args.terms[0] });
        success([]);
        return;
      }
    }

    addHandler({ args, method }, { searchClient, player })
      .then(success)
      .catch(reject);
  });
}

function addHandler({ args, method }, { searchClient, player }) {
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

        player[method.name]({ files: playableResults })
          .then(success)
          .catch(reject);

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

const methods = getMethods();

export default methods;
