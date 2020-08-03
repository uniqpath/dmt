import colors from 'colors';

import dmt from 'dmt/bridge';
const { log } = dmt;

import mqtt from 'mqtt';
import EventEmitter from 'events';

class MqttRail extends EventEmitter {
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

export default MqttRail;
