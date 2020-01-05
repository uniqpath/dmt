const EventEmitter = require('events');
const colors = require('colors');
const dmt = require('dmt-bridge');
const { log } = dmt;

const MqttRail = require('./mqttRail');

const logging = require('./logging');

const MessageDropper = require('./messageDropper');
class IotBus extends EventEmitter {
  constructor() {
    super();

    this.mqttRails = [];
    this.messageDropper = new MessageDropper();
  }

  init({ specialNodes, onlyAp }) {
    this.initialized = true;

    if (specialNodes && !onlyAp) {
      log.yellow(`IoT and push-notify ("special") nodes: ${specialNodes.length}`);

      let firstConnect = true;

      for (const { ip } of specialNodes) {
        const rail = new MqttRail({ ip });

        rail.on('connect', () => {
          if (firstConnect) {
            firstConnect = false;
            this.emit('first_connect', { ip });
          }
        });

        this.mqttRails.push(rail);
      }
    }

    const apRail = new MqttRail({ ip: dmt.accessPointIP, ensureBrokerIsAuthentic: true });
    apRail.on('connect', () => {
      this.emit('ap_connect', { ip: dmt.accessPointIP });
    });
    this.mqttRails.push(apRail);

    for (const mqttRail of this.mqttRails) {
      mqttRail.on('message', ({ topic, msg }) => {
        if (!this.messageDropper.shouldDrop({ topic, msg })) {
          this.emit('message', { topic, msg });
        }
      });
    }
  }

  publish({ topic, msg }) {
    if (!this.initialized) {
      log.debug(`Called publish on uninitialized iotBus (call init() first!)`);
    }

    if (typeof msg !== 'string') {
      msg = JSON.stringify(msg);
    }

    for (const mqttRail of this.mqttRails) {
      mqttRail.publish({ topic, msg });
    }
  }
}

module.exports = IotBus;
