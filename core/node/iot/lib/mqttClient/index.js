import { Worker } from 'worker_threads';

import EventEmitter from 'events';

import { log } from 'dmt/common';

import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));

export default class MqttClient extends EventEmitter {
  constructor() {
    super();

    this.worker = new Worker(join(__dirname, 'worker.js'));

    log.wireWorker(this.worker);

    this.worker.on('message', ({ type, payload }) => {
      if (type == 'mqtt') {
        this.emit('message', payload);
      }
    });
  }

  receive(callback) {
    this.on('message', callback);
  }

  send(topic, msg) {
    this.publish({ topic, msg });
  }

  publish({ topic, msg }) {
    this.worker.postMessage({ topic, msg });
  }
}
