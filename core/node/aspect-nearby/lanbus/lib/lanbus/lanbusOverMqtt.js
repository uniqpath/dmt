import EventEmitter from 'events';

import { log, colors, device } from 'dmt/common';

import { mqttClient } from 'dmt/iot';

const DEBUG = false;

function logDebug(msg) {
  if (DEBUG) {
    log.cyan(msg);
  } else {
    log.debug(msg, { cat: 'lanbus' });
  }
}

export default class LanBusOverMqtt extends EventEmitter {
  constructor({ program }) {
    super();

    this.device = device({ onlyBasicParsing: true });
    this.program = program;

    this.init();

    log.green(`✓ LanBus-over-${colors.cyan('MQTT')} initialized`);
  }

  init() {
    mqttClient.on('message', ({ topic, msg }) => {
      if (topic == 'lanbus-chatter') {
        try {
          const jsonMsg = JSON.parse(msg);

          this.emit('message', jsonMsg);

          if (!jsonMsg.processId) {
            logDebug(`Received ${colors.magenta('LANBUS MQTT')} message from: ${colors.cyan(jsonMsg)}`);
          }
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
      if (jsonMsg.__targetDevice == this.device.id) {
        this.emit('lanbus-ping-request-for-us');
      }
    }
  }

  broadcastMessage(jsonMsg) {
    const msg = JSON.stringify(jsonMsg);
    mqttClient.publish({ topic: 'lanbus-chatter', msg });
    if (!jsonMsg.processId) {
      logDebug(`Broadcasting LANBUS MQTT message: ${msg}`);
    }
  }
}
