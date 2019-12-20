const EventEmitter = require('events');

const dmt = require('dmt-bridge');
const { log } = dmt;

class Channel extends EventEmitter {
  constructor(ws) {
    super();
    this.ws = ws;

    this.sentMessageCount = 0;
    this.receivedMessageCount = 0;

    ws.on('message', msg => {
      this.receivedMessageCount += 1;

      this.checkAuthentication();
    });

    let remoteIp = ws._socket.remoteAddress;

    if (remoteIp) {
      if (remoteIp.substr(0, 7) == '::ffff:') {
        remoteIp = remoteIp.substr(7);
      }

      this.remoteIp = remoteIp;
    } else {
      log.write(`WARNING: cannot read websocket remote Ip!! -- TODO: debug... happens mostly on lan`);
    }
  }

  isAthenticated() {
    return this.authenticated;
  }

  checkAuthentication() {}

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

  send(message) {
    this.checkAuthentication();

    if (!this.ws.terminated && this.ws.readyState == this.ws.OPEN) {
      this.sentMessageCount += 1;
      this.ws.send(message);
    } else {
      this.ws.terminated = true;
    }
  }
}

module.exports = Channel;
