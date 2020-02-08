import colors from 'colors';
import EventEmitter from 'events';

import dmt from 'dmt-bridge';
const { log } = dmt;
import { iotBus } from 'dmt-iot';

class LanBusOverIotBus extends EventEmitter {
  constructor({ program }) {
    super();

    this.device = dmt.device({ onlyBasicParsing: true });
    this.program = program;

    this.init();

    log.green(`✓ LanBus-over-${colors.cyan('MQTT')} initialized`);
  }

  init() {
    iotBus.on('message', ({ topic, msg }) => {
      if (topic == 'lanbus-chatter') {
        try {
          const jsonMsg = JSON.parse(msg);

          this.emit('message', jsonMsg);

          log.debug(`${colors.magenta('LANBUS')} message from: ${colors.magenta(jsonMsg.deviceId)} ● ${colors.cyan(jsonMsg)}`, { cat: 'lanbus' });
        } catch (e) {
          log.write(`Received LANBUS MQTT message from: ${colors.gray(JSON.parse(msg, null, 2))} ${colors.red("But couldn't parse it to JSON")}`);
        }
      }

      this.handleSpecialRequests({ topic, msg });
    });
  }

  handleSpecialRequests({ topic, msg }) {
    if (topic == 'lanbus-ping-request') {
      const jsonMsg = JSON.parse(msg);
      if (jsonMsg.targetDeviceId == this.device.id) {
        this.emit('lanbus-ping-request-for-us');
      }
    }
  }

  broadcastMessage(msgJson) {
    const ip = this.program.state.controller ? this.program.state.controller.ip : null;
    if (ip) {
      const msg = JSON.stringify(Object.assign(msgJson, { ip }));
      iotBus.publish({ topic: 'lanbus-chatter', msg });
      log.debug(`Broadcasting LANBUS MQTT message "${msg}"`, { cat: 'lanbus' });
    } else {
      log.red('Not broadcasting LANBUS MQTT message because IP address of this device is unknown...');
    }
  }
}

export default LanBusOverIotBus;
