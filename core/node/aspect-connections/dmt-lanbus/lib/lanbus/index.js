const EventEmitter = require('events');

const OverUDP = require('./lanbusOverUdpBroadcast');
const OverIot = require('./lanbusOverIotBus');

class LanBus extends EventEmitter {
  constructor({ program }) {
    super();

    this.overUdp = new OverUDP({ program });

    this.overIot = new OverIot({ program });

    for (const bus of [this.overUdp, this.overIot]) {
      bus.on('message', obj => {
        this.emit('message', obj);
      });

      bus.on('lanbus-ping-request-for-us', () => {
        this.emit('lanbus-ping-request-for-us');
      });
    }
  }

  broadcastMessage(msgJson, { onlyUdp = false } = {}) {
    this.overUdp.broadcastMessage(msgJson);

    if (!onlyUdp) {
      this.overIot.broadcastMessage(msgJson);
    }
  }
}

module.exports = LanBus;
