import onConnectWrap from './onConnect';

export default function setup({ program, backendStore }) {
  const onConnect = onConnectWrap({ backendStore });
  program.registerProtocol({ protocol: 'zeta', lane: 'gui', onConnect });
}
