import dmt from 'dmt-bridge';

const { log, def } = dmt;

import sensorMsg from '../lib/sensorMessageFormats/index.js';

function handleIotEvent({ program, topic, msg }) {
  const parsedMsg = sensorMsg.parse({ topic, msg });

  if (parsedMsg) {
    const { id } = parsedMsg;
    delete parsedMsg.id;

    program.replaceStoreElement({ storeName: 'nearbySensors', key: id, value: parsedMsg }, { announce: false });
  }
}

export { handleIotEvent };
