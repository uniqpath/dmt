import guiWsEndpointWrap from './endpoint';

export default function setup({ program, backendStore }) {
  const wsEndpoint = guiWsEndpointWrap({ program, backendStore });
  program.addConnectomeEndpoint({ protocol: 'zeta', protocolLane: 'gui', wsEndpoint });
}
