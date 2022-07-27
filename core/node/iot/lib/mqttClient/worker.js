import { parentPort } from 'worker_threads';

import MqttClient from './mqttClient.js';

const mqttClient = new MqttClient();

const type = 'mqtt';

mqttClient.on('message', payload => parentPort.postMessage({ type, payload }));

parentPort.on('message', payload => {
  mqttClient.publish(payload);
});
