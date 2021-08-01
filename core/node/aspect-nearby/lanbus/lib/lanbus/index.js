import EventEmitter from 'events';

import { log } from 'dmt/common';

import OverUDP from './lanbusOverUdpBroadcast';
import OverMqtt from './lanbusOverMqtt';

const DEBUG = false;

class LanBus extends EventEmitter {
  constructor({ program }) {
    super();

    this.overUdp = new OverUDP({ program });

    this.overMqtt = new OverMqtt({ program });

    for (const rail of [this.overUdp, this.overMqtt]) {
      rail.on('message', obj => {
        if (DEBUG && !obj.processId) {
          log.green(`Retransmitting message from ${rail.constructor.name}:`);
          log.magenta(obj);
        }

        this.emit('message', obj);
      });

      rail.on('lanbus-ping-request-for-us', () => {
        this.emit('lanbus-ping-request-for-us');
      });
    }
  }

  broadcastMessage(msgJson, { onlyUdp = false } = {}) {
    this.overUdp.broadcastMessage({ ...msgJson, __origin: 'dmt' });

    if (!onlyUdp) {
      this.overMqtt.broadcastMessage(msgJson);
    }
  }
}

export default LanBus;
