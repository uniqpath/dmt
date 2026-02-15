import { log, colors } from 'dmt/common';

import mqtt from 'mqtt';
import EventEmitter from 'events';

export default class MqttClient2 extends EventEmitter {
  constructor({ ip }) {
    super();

    this.client = mqtt.connect(`mqtt://${ip}`);
    this.ip = ip;

    this.queue = [];
    const CACHE_EARLY_MESSAGES_DELAY = 1000;

    setTimeout(() => {
      if (this.queue?.length > 0) {
        log.debug(
          '⚠️  Dropping these early mqtt messages because client was not connected in time (and will drop more silently if mqtt client still not connected):',
          { cat: 'mqtt-sent' }
        );
        log.debug(this.queue, { cat: 'mqtt-sent' });
      }
      this.queue = null;
    }, CACHE_EARLY_MESSAGES_DELAY);

    this.client.on('connect', () => {
      if (this.queue) {
        const { queue } = this;
        this.queue = null;
        if (queue?.length > 0) {
          log.debug('These early mqtt messages were sent with some small delay because of waiting for initial mqtt client connect (max 1s):', {
            cat: 'mqtt-sent'
          });
          log.debug(queue, { cat: 'mqtt-sent' });
        }
        for (const obj of queue) {
          this.publish(obj);
        }
      }

      this.client.subscribe('#');
      log.green(`✓ mqtt ${this.first ? '' : 're'}connected to ${colors.yellow(ip)}`);
      this.emit('connect');
    });

    this.client.on('message', (topic, msg) => {
      this.emit('message', { topic, msg: msg.toString() });
    });
  }

  publish({ topic, msg }) {
    if (this.queue) {
      this.queue.push({ topic, msg });
      return;
    }

    if (this.client && this.client.connected) {
      this.client.publish(topic, msg);
    } else {
    }
  }
}
