import colors from 'colors';
import EventEmitter from 'events';

import dmt from 'dmt/common';
const { log } = dmt;

import { iotBus } from 'dmt/iot';

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

          log.debug(`${colors.magenta('LANBUS')} message from: ${colors.magenta(jsonMsg.deviceName)} ● ${colors.cyan(jsonMsg)}`, { cat: 'lanbus' });
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
      if (jsonMsg.targetDeviceName == this.device.id) {
        this.emit('lanbus-ping-request-for-us');
      }
    }
  }

  broadcastMessage(msgJson) {
    const msg = JSON.stringify(msgJson);
    iotBus.publish({ topic: 'lanbus-chatter', msg });
    log.debug(`Broadcasting LANBUS MQTT message "${msg}"`, { cat: 'lanbus' });
  }
}

export default LanBusOverIotBus;
