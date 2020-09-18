import * as sensorMsg from '../lib/sensorMessageFormats';

function handleIotEvent({ program, topic, msg }) {
  const parsedMsg = sensorMsg.parse({ topic, msg });

  if (parsedMsg) {
    const { id } = parsedMsg;
    delete parsedMsg.id;

    program.store.replaceSlotElement({ slotName: 'nearbySensors', key: id, value: parsedMsg }, { announce: false });
  }
}

export { handleIotEvent };
