import { log, colors, device } from 'dmt/common';
import EventEmitter from 'events';

import UdpBus from '../udpbus/index.js';

class LanBusOverUdpBroadcast extends EventEmitter {
  constructor({ program }) {
    super();

    this.device = device({ onlyBasicParsing: true });
    this.program = program;

    this.udpBus = new UdpBus();

    this.initUDPBroadcast();
  }

  handlePingRequest(msg) {
    if (msg.request == 'lanbus-ping-request') {
      if (msg.__targetDevice == this.device.id) {
        this.emit('lanbus-ping-request-for-us');
      }

      return true;
    }
  }

  initUDPBroadcast() {
    log.green(`✓ LanBus-over-${colors.yellow('UDP-BROADCAST')} initialized`);

    this.udpBus.on('message', msg => {
      if (!this.handlePingRequest(msg) && (msg.origin == 'dmt' || msg.__origin == 'dmt')) {
        delete msg.__origin;

        this.emit('message', msg);
      }

      log.debug(`${colors.magenta('LANBUS')} message from: ${colors.magenta(msg.deviceName)} ● ${colors.cyan(msg)}`, { cat: 'lanbus' });
    });
  }

  broadcastMessage(msgJson) {
    if (this.program.slot('device').get('ip')) {
      const msg = JSON.stringify(msgJson);

      this.udpBus
        .publish(msg)
        .then(() => {
          log.debug(`Broadcasted UDP message "${msg}"`, { cat: 'lanbus' });
        })
        .catch(e => {
          log.debug(`Lanbus broadcast error: ${JSON.stringify(e, null, 2)}`);
        });
    }
  }
}

export default LanBusOverUdpBroadcast;
