import { Connectome } from 'dmt/connectome-server';

import { log, colors, keypair, isDevMachine, isDevUser } from 'dmt/common';

class ProgramConnectionsAcceptor {
  constructor(program) {
    this.program = program;

    const port = 7780;

    this.keypair = keypair();

    if (this.keypair) {
      log.write(`Initializing ProgramConnectionsAcceptor with public key ${colors.gray(this.keypair.publicKeyHex)}`);

      this.connectome = new Connectome({
        port,
        keypair: this.keypair,
        log,
        verbose: false
      });

      this.connectome.subscribe(({ connectionList }) => {
        program.store('connectionsIn').set(connectionList);
      });

      this.connectome.on('connection', channel => {});

      this.connectome.on('connection_closed', channel => {
        if (isDevMachine()) {
          console.log(colors.gray(`channel [ ${channel.protocol} ] ${channel.remoteIp() ? channel.remoteIp() : 'UNKNOWN/STALE'} closed`));
        }
      });

      this.connectome.on('protocol_added', ({ protocol }) => {
        log.white(`💡 Connectome protocol ${colors.cyan(protocol)} ready.`);
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
