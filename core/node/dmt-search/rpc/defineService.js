const dmt = require('dmt-bridge');
const { log } = dmt;

function actions() {
  const actions = [];

  actions.push({ command: 'info', handler: infoHandler });
  actions.push({ command: 'search', handler: searchHandler });

  return actions;
}

function infoHandler() {
  return new Promise((success, reject) => {
    const data = { methods: actions().map(action => action.command) };
    success(data);
  });
}

function searchHandler({ args, action, serviceId }, { searchClient }) {
  return new Promise((success, reject) => {
    const { serverMaxResults } = dmt.maxResults(serviceId);
    const clientMaxResults = args.clientMaxResults ? args.clientMaxResults : serverMaxResults;
    const options = { terms: args.terms, clientMaxResults, mediaType: args.mediaType, contentRef: args.contentRef };

    searchClient
      .search(options)
      .then(aggregateResults => {
        success(aggregateResults);
      })
      .catch(e => {
        log.red('Error in search service:');
        log.red(e);
        reject(new Error(e.error));
      });
  });
}

module.exports = { actions: actions() };
