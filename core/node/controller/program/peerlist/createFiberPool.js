import { log, keypair } from 'dmt/common';

import { ConnectorPool } from 'dmt/connectome';

import { isDevUser, isMainDevice } from 'dmt/common';

export default function createFiberPool({ port, protocol }) {
  return new ConnectorPool({ protocol, port, keypair: keypair(), log: isMainDevice() ? log : console.log(), verbose: isMainDevice() });
}
