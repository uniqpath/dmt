import dmt from 'dmt/common';
const { log } = dmt;

import { ConnectorPool } from 'dmt/connectome';

export default function createFiberPool({ port, protocol, lane }) {
  const keypair = dmt.keypair();
  return new ConnectorPool({ protocol, lane, port, keypair, log: log.write });
}
