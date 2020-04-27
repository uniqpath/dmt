import dmt from 'dmt/bridge';
const { log } = dmt;

import { parseArgs } from '../lib/utils/args';

import MultiProviderSearch from '../lib/multiProviderSearch';

function getActions() {
  const actions = [];

  actions.push({ command: 'info', handler: infoHandler });
  actions.push({ command: 'search', handler: searchHandler });

  return actions;
}

function infoHandler() {
  return new Promise((success, reject) => {
    const data = { methods: getActions().map(action => action.command) };
    success(data);
  });
}

function searchHandler({ args, action }, { program }) {
  return new Promise((success, reject) => {
    const options = parseArgs({ args, actorName: 'search' });

    const { atDevices } = options;

    delete options.atDevices;

    const searchClient = new MultiProviderSearch({ program, providers: atDevices });

    searchClient
      .search(options)
      .then(aggregateResults => {
        success(aggregateResults);
      })
      .catch(e => {
        log.red('Error in search service:');
        log.red(e);

        reject(e);
      });
  });
}

const actions = getActions();

export default actions;
