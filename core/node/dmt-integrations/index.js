const fs = require('fs');
const path = require('path');
const dmt = require('dmt-bridge');
const { scan } = dmt;

async function loadIntegrations(program) {
  const integrationsDir = path.join(dmt.dmtPath, 'core/node/aspect-integrations');

  if (fs.existsSync(integrationsDir)) {
    for (const integrationPath of scan.dir(integrationsDir, { onlyDirs: true })) {
      const integrationImport = await import(path.join(integrationPath, 'index.js'));

      if (integrationImport.default.init) {
        integrationImport.default.init(program);
      } else {
      }
    }
  } else {
  }
}

async function init(program) {
  program.on('program_ready', () => {
    loadIntegrations(program);
  });
}

module.exports = {
  init
};
