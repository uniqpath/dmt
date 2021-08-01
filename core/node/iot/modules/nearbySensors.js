import * as sensorMsg from '../lib/sensorMessageFormats/index.js';

function handleMqttEvent({ program, topic, msg }) {
  const parsedMsg = sensorMsg.parse({ topic, msg });

  if (parsedMsg) {
    const { id } = parsedMsg;
    delete parsedMsg.id;

    const patch = {};
    patch[id] = parsedMsg;
    program.slot('nearbySensors').update(patch, { announce: false });
  }
}

export { handleMqttEvent };
