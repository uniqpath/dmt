import colors from 'colors';

import { Connectome } from 'dmt/connectome-server';

import dmt from 'dmt/common';
const { log } = dmt;

class ProgramConnectionsAcceptor {
  constructor(program) {
    this.program = program;

    const port = 7780;

    this.keypair = dmt.keypair();

    if (this.keypair) {
      log.write(`Initializing ProgramConnectionsAcceptor with public key ${colors.gray(this.keypair.publicKeyHex)}`);

      this.connectome = new Connectome({ port, keypair: this.keypair });

      this.connectome.subscribe(({ connectionList }) => {
        program.store('connectionsIn').set(connectionList);
      });

      this.connectome.on('connection', channel => {});

      this.connectome.on('connection_closed', channel => {
        if (dmt.isDevMachine()) {
          console.log(colors.gray(`channel [ ${channel.protocol} ] ${channel.remoteIp() ? channel.remoteIp() : 'UNKNOWN/STALE'} closed`));
        }
      });

      this.connectome.on('protocol_added', ({ protocol }) => {
        log.brightWhite(`💡 Connectome protocol ${colors.cyan(protocol)} ready.`);
      });
    } else {
      log.red('ProgramConnectionsAcceptor not started because device keypair could not be established.');
      process.exit();
    }
  }

  ok() {
    return !!this.keypair;
  }

  registerProtocol({ protocol, onConnect }) {
    return this.connectome.registerProtocol({ protocol, onConnect });
  }

  connectionList() {
    return this.connectome.connectionList();
  }

  registeredProtocols() {
    return this.connectome.registeredProtocols();
  }

  start() {
    if (this.keypair) {
      log.cyan(`Starting Connectome on port ${colors.magenta(this.connectome.port)}`);
      this.connectome.start();
    }
  }
}

export default ProgramConnectionsAcceptor;
