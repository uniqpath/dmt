import { Connectome } from 'dmt/connectome-server';

import { log, colors, keypair, isDevMachine } from 'dmt/common';

import connectomeLogging from './connectomeLogging.js';

class ProgramConnectionsAcceptor {
  constructor(program) {
    this.program = program;

    const port = 7780;

    this.keypair = keypair();

    if (this.keypair) {
      log.write(`Initializing ProgramConnectionsAcceptor with public key ${colors.gray(this.keypair.publicKeyHex)}`);

      const { verbose } = connectomeLogging().server;

      this.channels = [];

      this.connectome = new Connectome({
        port,
        keypair: this.keypair,
        log,
        verbose
      });

      this.connectome.subscribe(({ connectionList }) => {
        program.slot('connectionsIn').set(connectionList);
      });

      this.connectome.on('connection', channel => {
        this.channels.push(channel);
      });

      this.connectome.on('connection_closed', channel => {
        const index = this.channels.indexOf(channel);
        if (index > -1) {
          this.channels.splice(index, 1);
        }

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

  downstream(pubKeyHex) {
    for (let i = this.channels.length - 1; i >= 0; i--) {
      if (this.channels[i].remotePubkeyHex() === pubKeyHex) {
        return this.channels[i];
      }
    }
    return null;
  }

  ok() {
    return !!this.keypair;
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
