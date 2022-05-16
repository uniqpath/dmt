import { log, keypair } from 'dmt/common';

import { ConnectorPool } from 'dmt/connectome';

import { isDevUser, isDevMachine } from 'dmt/common';

export default function createFiberPool({ port, protocol }) {
  return new ConnectorPool({ protocol, port, keypair: keypair(), log: isDevMachine() ? log : console.log(), verbose: isDevMachine() });
}
