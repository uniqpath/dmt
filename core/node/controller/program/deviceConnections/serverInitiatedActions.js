import { mqttClient } from 'dmt/iot';
import { log, mainServer } from 'dmt/common';

import { getMainServerEndpoint } from './serverEndpoint.js';

export default function init({ program, connectorPool }) {
  if (program.isHub()) {
    const endpoint = getMainServerEndpoint();

    if (endpoint) {
      connectorPool.getConnector({ endpoint, deviceTag: mainServer().id }).then(connector => {
        connector.attachObject('downstream', {
          open_door: () => {
            mqttClient.send('entry-door', 'open');
            log.cyan('door opened through downstream call');
            return 'DOOR OPENED';
          },
          open_fence: () => {
            mqttClient.send('fence-door', 'move');
            log.cyan('fence door moved through downstream call');
            return 'FENCE MOVE';
          },
          sleep: () => {
            program.api('device').call('sleep');
            log.cyan('sleep');
            return 'SLEEP';
          }
        });
      });
    }
  }
}
