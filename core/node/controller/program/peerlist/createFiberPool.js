import { log, keypair } from 'dmt/common';

import { ConnectorPool } from 'dmt/connectome';

import { isDevUser, isDevMachine } from 'dmt/common';

const SEARCH_TIMEOUT = 50000;

export default function createFiberPool({ port, protocol }) {
  return new ConnectorPool({
    protocol,
    port,
    keypair: keypair(),
    rpcRequestTimeout: SEARCH_TIMEOUT
  });
}
