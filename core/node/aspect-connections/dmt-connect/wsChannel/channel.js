import EventEmitter from 'events';

import dmt from 'dmt-bridge';
const { log } = dmt;

import getRemoteIp from './getRemoteIp';

class Channel extends EventEmitter {
  constructor(ws) {
    super();
    this.ws = ws;

    this.sentMessageCount = 0;
    this.receivedMessageCount = 0;

    ws.on('message', msg => {
      this.receivedMessageCount += 1;
    });

    this.remoteIp = getRemoteIp(ws);

    if (dmt.isDevMachine() && !this.remoteIp) {
      log.red('WARNING: cannot read websocket remote Ip!! -- TODO: debug... happens mostly on lan');
    }
  }

  terminate() {
    this.ws.terminated = true;

    this.ws.close();

    process.nextTick(() => {
      if ([this.ws.OPEN, this.ws.CLOSING].includes(this.ws.readyState)) {
        this.ws.terminate();
      }
    });
  }

  terminated() {
    return this.ws.terminated;
  }

  closed() {
    return [this.ws.CLOSED, this.ws.CLOSING].includes(this.ws.readyState);
  }

  jsonRpcReceived(msg) {
    this.emit('json_rpc', msg);
  }

  send(message) {
    if (!this.ws.terminated && this.ws.readyState == this.ws.OPEN) {
      this.sentMessageCount += 1;
      this.ws.send(message);
    } else {
      this.ws.terminated = true;
    }
  }
}

export default Channel;
