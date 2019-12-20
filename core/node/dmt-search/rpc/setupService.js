const dmt = require('dmt-bridge');

const SearchClient = require('../lib/searchClient');

function setup({ program, serviceName }) {
  const providers = [dmt.thisProvider()];

  const searchClient = new SearchClient(providers);

  return { searchClient };
}

module.exports = setup;
