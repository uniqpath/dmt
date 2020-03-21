import colors from 'colors';

import { Server } from 'connectome';

import { wsEndpoint as wsGuiEndpoint } from 'dmt-gui';
import dmt from 'dmt-bridge';
const { log } = dmt;

class WsServer {
  constructor(program) {
    this.program = program;

    const port = 7780;

    const protocols = {
      dmt_gui: wsGuiEndpoint(program)
    };

    this.keypair = dmt.keypair();

    if (this.keypair) {
      log.write(`Initializing wsServer with public key ${colors.gray(this.keypair.publicKeyHex)}`);

      this.server = new Server({ port, keypair: this.keypair, protocols });

      log.cyan(`Starting wsServer on port ${colors.magenta(port)}`);

      this.server.on('connection', channel => {
        program.channels.add(channel);
      });

      this.server.on('connection_closed', channel => {
        if (dmt.isDevMachine()) {
          log.gray(`wsServer ${channel.remoteIp()} closed`);
        }
      });

      this.server.on('protocol_added', protocol => {
        log.gray(`Setup new ws protocol ${colors.cyan(protocol)}`);
      });
    } else {
      log.red('WsServer not started because default keypair was not found for this device.');
      log.red('GUI for localhost and dmt-apps will not work.');
    }
  }

  ok() {
    return !!this.keypair;
  }

  addProtocol(protocol, wsEndpoint) {
    this.server.addProtocol(protocol, wsEndpoint);
  }

  start() {
    if (this.keypair) {
      this.server.start();
    }
  }
}

export default WsServer;
