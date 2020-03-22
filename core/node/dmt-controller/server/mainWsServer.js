import colors from 'colors';

import { Server } from 'connectome';

import dmt from 'dmt-bridge';
const { log } = dmt;

class WsServer {
  constructor(program) {
    this.program = program;

    const port = 7780;

    this.keypair = dmt.keypair();

    if (this.keypair) {
      log.write(`Initializing wsServer with public key ${colors.gray(this.keypair.publicKeyHex)}`);

      this.server = new Server({ port, keypair: this.keypair });

      log.cyan(`Starting wsServer on port ${colors.magenta(port)}`);

      this.server.on('connection', channel => {});

      this.server.on('connection_closed', channel => {
        if (dmt.isDevMachine()) {
          console.log(colors.gray(`channel ${channel.protocol}/${channel.lane} from ip ${channel.remoteIp()} closed`));
        }
      });

      this.server.on('protocol_added', ({ protocol, lane }) => {
        log.gray(`Setup new ws protocol ${colors.cyan(protocol)}, lane: ${colors.cyan(lane)}`);
      });
    } else {
      log.red('WsServer not started because default keypair was not found for this device.');
      log.red('GUI for localhost and dmt-apps will not work.');
    }
  }

  ok() {
    return !!this.keypair;
  }

  addWsEndpoint({ protocol, lane, wsEndpoint }) {
    return this.server.addWsEndpoint({ protocol, lane, wsEndpoint });
  }

  start() {
    if (this.keypair) {
      this.server.start();
    }
  }
}

export default WsServer;
