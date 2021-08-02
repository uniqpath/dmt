import dmt from 'dmt/common';
const { log } = dmt;

import { ConnectorPool } from 'dmt/connectome';

export default function createFiberPool({ port, protocol }) {
  const keypair = dmt.keypair();
  return new ConnectorPool({ protocol, port, keypair, log: log.write });
}
