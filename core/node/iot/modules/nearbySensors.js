import * as sensorMsg from '../lib/sensorMessageFormats';

function handleIotEvent({ program, topic, msg }) {
  const parsedMsg = sensorMsg.parse({ topic, msg });

  if (parsedMsg) {
    const { id } = parsedMsg;
    delete parsedMsg.id;

    const patch = {};
    patch[id] = parsedMsg;
    program.store('nearbySensors').update(patch, { announce: false });
  }
}

export { handleIotEvent };
