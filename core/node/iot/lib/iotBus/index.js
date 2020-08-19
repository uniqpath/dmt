import EventEmitter from 'events';
import dmt from 'dmt/bridge';
const { log } = dmt;

import MqttRail from './mqttRail';

class IotBus extends EventEmitter {
  init() {
    this.mqttRail = new MqttRail({ ip: dmt.accessPointIP });

    let firstConnect = true;

    this.mqttRail.on('connect', () => {
      if (firstConnect) {
        firstConnect = false;
        this.emit('first_connect', { ip: dmt.accessPointIP });
      }
    });

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
