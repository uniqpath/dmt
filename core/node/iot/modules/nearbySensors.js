import { isDevUser } from 'dmt/common';
import { push } from 'dmt/notify';

import * as sensorMsg from '../lib/sensorMessageFormats/index.js';

function handleMqttEvent({ program, topic, msg }) {
  try {
    const parsedMsg = sensorMsg.parse({ topic, msg });

    if (parsedMsg) {
      const { id } = parsedMsg;
      delete parsedMsg.id;

      const patch = {};
      patch[id] = parsedMsg;
      program.slot('nearbySensors').update(patch, { announce: false });
    }
  } catch (e) {
    if (isDevUser()) {
      push.title('nearbySensors parsing problem').notify('ignoring, nothing serious.. tasmota issue... todo: remove this push message');
    }
  }
}

export { handleMqttEvent };
