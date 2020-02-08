import dmt from 'dmt-bridge';
const { log } = dmt;
import colors from 'colors';
import EventEmitter from 'events';

import UdpBus from '../udpbus';

class LanBusOverUdpBroadcast extends EventEmitter {
  constructor({ program }) {
    super();

    this.device = dmt.device({ onlyBasicParsing: true });
    this.program = program;

    this.udpBus = new UdpBus();

    this.initUDPBroadcast();
  }

  handlePingRequest(msg) {
    if (msg.request == 'lanbus-ping-request') {
      if (msg.targetDeviceId == this.device.id) {
        this.emit('lanbus-ping-request-for-us');
      }

      return true;
    }
  }

  initUDPBroadcast() {
    log.green(`✓ LanBus-over-${colors.yellow('UDP-BROADCAST')} initialized`);

    this.udpBus.on('message', msg => {
      if (!this.handlePingRequest(msg) && msg.origin == 'dmt') {
        this.emit('message', msg);
      }

      log.debug(`${colors.magenta('LANBUS')} message from: ${colors.magenta(msg.deviceId)} ● ${colors.cyan(msg)}`, { cat: 'lanbus' });
    });
  }

  broadcastMessage(msgJson) {
    const ip = this.program.state.controller ? this.program.state.controller.ip : null;
    if (ip) {
      msgJson.ip = ip;
    }

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

export default LanBusOverUdpBroadcast;
