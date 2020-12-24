import dmt from 'dmt/bridge';
const { log } = dmt;

import { ConnectorPool } from 'dmt/connectome';

export default function createFiberPool({ port, protocol, lane }) {
  const { privateKey: clientPrivateKey, publicKey: clientPublicKey } = dmt.keypair();
  return new ConnectorPool({ protocol, lane, port, clientPrivateKey, clientPublicKey, log: log.write });
}
