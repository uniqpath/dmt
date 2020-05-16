import BackendStore from './lib/backendStore';

import guiWsEndpointWrap from './lib/guiWsEndpoint';

function init({ program }) {
  const backendStore = new BackendStore({ program });

  const wsEndpoint = guiWsEndpointWrap({ program, backendStore });
  program.addWsEndpoint({ protocol: 'zeta', protocolLane: 'gui', wsEndpoint });
}

export { init };
