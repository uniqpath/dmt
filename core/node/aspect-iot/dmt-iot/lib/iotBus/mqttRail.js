const colors = require('colors');

const dmt = require('dmt-bridge');
const { log } = dmt;

const mqtt = require('mqtt');
const EventEmitter = require('events');

class MqttRail extends EventEmitter {
  constructor({ ip, ensureBrokerIsAuthentic = false }) {
    super();

    this.client = mqtt.connect(`mqtt://${ip}`);
    this.ip = ip;
    this.first = true;

    this.client.on('connect', () => {
      this.client.subscribe('#');
      log.green(`✓ mqtt ${this.first ? '' : 're'}connected to ${colors.yellow(ip)}`);
      this.first = false;
      this.authenticBroker = undefined;

      this.emit('connect');
    });

    this.client.on('message', (topic, msg) => {
      if (['lanbus-chatter', 'lanbus-ping-request'].includes(topic) && ensureBrokerIsAuthentic && !this.authenticBroker) {
        this.authenticBroker = true;
        log.magenta(`mqtt broker ${colors.yellow(ip)} authenticity confirmed, this is a dmt node, now parsing all messages from it`);
      }

      if (!ensureBrokerIsAuthentic || (ensureBrokerIsAuthentic && this.authenticBroker)) {
        this.emit('message', { topic, msg: msg.toString() });
      }
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

module.exports = MqttRail;
