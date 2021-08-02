import EventEmitter from 'events';
import dmt from 'dmt/common';
const { log } = dmt;

import MqttRail from './mqttRail';

const ip = dmt.accessPointIP;

class IotBus extends EventEmitter {
  init() {
    this.mqttRail = new MqttRail({ ip });

    this.mqttRail.on('message', ({ topic, msg }) => {
      this.emit('message', { topic, msg });
    });
  }

  publish({ topic, msg }) {
    if (!this.mqttRail) {
      log.debug('Called publish on uninitialized iotBus (call init() first!)');
      return;
    }

    if (typeof msg !== 'string') {
      msg = JSON.stringify(msg);
    }

    this.mqttRail.publish({ topic, msg });
  }
}

export default IotBus;
