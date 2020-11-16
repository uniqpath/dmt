import fs from 'fs';
import path from 'path';
import colors from 'colors';

import { ConnectionsAcceptor } from 'dmt/connectome';

import dmt from 'dmt/bridge';
const { log } = dmt;

class ProgramConnectionsAcceptor {
  constructor(program) {
    this.program = program;

    const port = 7780;

    this.keypair = dmt.keypair();

    if (this.keypair) {
      log.write(`Initializing ProgramConnectionsAcceptor with public key ${colors.gray(this.keypair.publicKeyHex)}`);

      this.acceptor = new ConnectionsAcceptor({ ssl: false, port, keypair: this.keypair });

      log.cyan(`Starting ProgramConnectionsAcceptor on port ${colors.magenta(port)}`);

      this.acceptor.on('connection', channel => {});

      this.acceptor.on('connection_closed', channel => {
        if (dmt.isDevMachine()) {
          console.log(
            colors.gray(`channel ${channel.protocol}/${channel.protocolLane} from ip ${channel.remoteIp() ? channel.remoteIp() : 'UNKNOWN/STALE'} closed`)
          );
        }
      });

      this.acceptor.on('protocol_added', ({ protocol, protocolLane }) => {
        log.brightWhite(`💡 Connectome protocol ${colors.cyan(protocol)}/${colors.cyan(protocolLane)} ready.`);
      });
    } else {
      log.red('ProgramConnectionsAcceptor not started because default keypair was not found for this device.');
      log.red('GUI for localhost and dmt/apps will not work.');
    }
  }

  ok() {
    return !!this.keypair;
  }

  registerProtocol({ protocol, protocolLane, onConnect }) {
    return this.acceptor.registerProtocol({ protocol, protocolLane, onConnect });
  }

  connectionList() {
    return this.acceptor.connectionList();
  }

  registeredProtocols() {
    return this.acceptor.registeredProtocols();
  }

  start() {
    if (this.keypair) {
      this.acceptor.start();
    }
  }
}

export default ProgramConnectionsAcceptor;
