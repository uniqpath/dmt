import cliResolveIp from './lib/cliResolveIp';

import Nearby from './lib/nearby';

function init(program) {
  const nearby = new Nearby(program);

  program.on('lanbus:ready', lanbus => nearby.registerLanbus(lanbus));
}

export { init, cliResolveIp };
