import dmt from 'dmt/common';
const { log } = dmt;

import { appFrontendList } from 'dmt/load-app-engines';

const PORT = 8888;

import Server from './server';

function init(program) {
  const appList = appFrontendList();

  program.on('apps_loaded', appInitResults => {
    const server = new Server({ appList, appInitResults });
    server.listen(PORT);
  });
}

export { init };
