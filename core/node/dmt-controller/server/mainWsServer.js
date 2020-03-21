import colors from 'colors';

import { Server } from 'connectome';

import { wsEndpoint as wsGuiEndpoint } from 'dmt-gui';
import dmt from 'dmt-bridge';
const { log } = dmt;
const { bufferToHex } = dmt.util.hexutils;

class WsServer {
  constructor(program) {
    this.program = program;

    const port = 7780;

    const protocols = {
      dmt_gui: wsGuiEndpoint(program)
    };

    const keypair = dmt.keypair();

    this.server = new Server({ port, keypair, protocols });

    log.cyan(`Starting wsServer on port ${colors.magenta(port)}`);

    this.server.on('connection', channel => {
      program.channels.add(channel);
    });

    this.server.on('connection_closed', channel => {
      log.gray(`wsServer ${channel.remoteIp()} closed`);
    });

    this.server.on('protocol_added', protocol => {
      log.gray(`Setup new ws protocol ${colors.cyan(protocol)}`);
    });
  }

  addProtocol(protocol, wsEndpoint) {
    this.server.addProtocol(protocol, wsEndpoint);
  }

  start() {
    this.server.start();
  }
}

export default WsServer;
