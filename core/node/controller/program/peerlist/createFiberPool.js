import { log, keypair } from 'dmt/common';

import { ConnectorPool } from 'dmt/connectome';

import { isDevUser, isDevMachine, program } from 'dmt/common';

import connectomeLogging from '../connectomeLogging.js';

const SEARCH_TIMEOUT = 50000;

export default function createFiberPool({ port, protocol }) {
  const { fiberPoolLog, verbose } = connectomeLogging().client;

  return new ConnectorPool({
    protocol,
    port,
    keypair: keypair(),
    rpcRequestTimeout: SEARCH_TIMEOUT,
    log: fiberPoolLog,
    verbose
  });
}
