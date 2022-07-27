import { device } from 'dmt/common';

import EventEmitter from 'events';

const DUPLICATE_MESSAGES_WINDOW = 128;

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
    const now = Date.now();
    const { __id } = wrapperMsg;

    this.recentMessages = this.recentMessages.filter(({ receivedAt }) => receivedAt > now - DUPLICATE_MESSAGES_WINDOW * 1000);

    if (!this.recentMessages.find(({ id }) => id == __id)) {
      this.recentMessages.push({ id: __id, receivedAt: now });
      return true;
    }
  }
}
