const path = require('path');
const stripAnsi = require('strip-ansi');

const dmt = require('dmt-bridge');
const { def, log } = dmt;

function mapToLocal(providerResults, shareMappings) {
  if (!shareMappings.multi) {
    return providerResults;
  }

  const mappings = shareMappings.multi.find(provider => provider.id == providerResults.meta.providerHost);

  if (!mappings) {
    return providerResults;
  }

  const mappingList = def.listify(mappings.map).sort((a, b) => b.from.length - a.from.length);

  const mappedResults = providerResults.results.map(file => {
    for (const mapping of mappingList) {
      const re = new RegExp(`^${mapping.from}/`);
      const str = stripAnsi(file);

      if (str.match(re)) {
        const relativePath = str.replace(re, './');
        return path.join(mapping.to, relativePath);
      }
    }
  });

  return Object.assign(JSON.parse(JSON.stringify(providerResults)), { results: mappedResults });
}

module.exports = mapToLocal;