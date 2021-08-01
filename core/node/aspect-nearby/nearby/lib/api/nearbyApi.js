import { device } from 'dmt/common';

import EventEmitter from 'events';

export default class NearbyAPI extends EventEmitter {
  constructor(nearby) {
    super();
    this.nearby = nearby;

    this.recentMessages = [];
  }

  messageReceived(wrapperMsg) {
    const { __originDevice, __eventName } = wrapperMsg;

    const obj = wrapperMsg.__payload;

    if (this.isUnique(wrapperMsg)) {
      this.emit(__eventName, { originDevice: __originDevice, obj });
    }
  }

  broadcast(eventName, obj) {
    const __id = Math.random();

    const wrapperMsg = { __id, __originDevice: device().id, __isNearbyApi: true, __eventName: eventName };

    wrapperMsg.__payload = obj;

    this.nearby.lanbus.broadcastMessage(wrapperMsg);
  }

  isUnique(wrapperMsg) {
    let unique;

    const { __id } = wrapperMsg;

    if (!this.recentMessages.find(({ id }) => id == __id)) {
      unique = true;

      this.recentMessages.push({ id: __id, receivedAt: Date.now() });
    }

    this.recentMessages = this.recentMessages.filter(({ receivedAt }) => receivedAt > Date.now() - 1000);

    return unique;
  }
}
