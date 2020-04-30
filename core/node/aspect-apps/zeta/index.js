import guiWsEndpointWrap from './lib/guiWsEndpoint';

function init({ program }) {
  const wsEndpoint = guiWsEndpointWrap({ program });
  program.addWsEndpoint({ protocol: 'zeta', protocolLane: 'gui', wsEndpoint });
}

export { init };
