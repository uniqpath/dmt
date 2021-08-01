import EventEmitter from 'events';

import { log, accessPointIP as ip } from 'dmt/common';

import MqttClient2 from './mqttClient2';

export default class MqttClient extends EventEmitter {
  constructor() {
    super();

    this.mqttClient2 = new MqttClient2({ ip });

    this.mqttClient2.on('message', ({ topic, msg }) => {
      this.emit('message', { topic, msg });
    });
  }

  send(topic, msg) {
    this.publish({ topic, msg });
  }

  publish({ topic, msg }) {
    if (!this.mqttClient2) {
      log.debug('Called publish on uninitialized mqttClient (call init() first!)');
      return;
    }

    if (typeof msg !== 'string') {
      msg = JSON.stringify(msg);
    }

    this.mqttClient2.publish({ topic, msg });
  }
}
