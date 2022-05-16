import { log, colors } from 'dmt/common';

import mqtt from 'mqtt';
import EventEmitter from 'events';

export default class MqttClient2 extends EventEmitter {
  constructor({ ip }) {
    super();

    this.client = mqtt.connect(`mqtt://${ip}`);
    this.ip = ip;

    this.client.on('connect', () => {
      this.client.subscribe('#');
      log.green(`✓ mqtt ${this.first ? '' : 're'}connected to ${colors.yellow(ip)}`);
      this.emit('connect');
    });

    this.client.on('message', (topic, msg) => {
      this.emit('message', { topic, msg: msg.toString() });
    });
  }

  publish({ topic, msg }) {
    if (this.client && this.client.connected) {
      this.client.publish(topic, msg);
      log.debug(`${colors.cyan('→ mqtt msg sent:')} ${topic} ■ ${msg}`, { cat: 'mqtt-sent' });
    } else {
    }
  }
}
