import dmt from 'dmt-bridge';
const { log } = dmt;

class Channels {
  constructor() {
    this.channels = [];
  }

  add(channel) {
    this.channels.push(channel);

    channel.on('channel_closed', () => {
      this.reportCount();
    });

    this.reportCount();
  }

  sendToAll(protocol, msg) {
    for (const channel of this.channels.filter(ch => ch.protocol == protocol && !ch.closed())) {
      channel.send(msg);
    }
  }

  remoteCallAll(protocol, remoteObjectHandle, method, args) {
    for (const channel of this.channels.filter(ch => ch.protocol == protocol && !ch.closed())) {
      channel
        .remoteObject(remoteObjectHandle)
        .call(method, args)
        .catch(e => {
          log.red(e.toString());
        });
    }
  }

  reportCount() {
    if (dmt.isDevMachine()) {
      console.log(`Open channels: ${this.channels.filter(ch => !ch.closed()).length}`);
    }
  }
}

export default Channels;
