import EventEmitter from '../emitter';

class ChannelList extends EventEmitter {
  constructor({ protocol, lane }) {
    super();

    this.protocol = protocol;
    this.lane = lane;

    this.channels = [];

    process.nextTick(() => {
      this.reportCount();
    });
  }

  add(channel) {
    this.channels.push(channel);

    channel.on('channel_closed', () => {
      this.channels.splice(this.channels.indexOf(channel), 1);
      this.reportCount();
    });

    this.emit('new_channel', channel);

    this.reportCount();
  }

  sendToAll(msg) {
    for (const channel of this.channels) {
      channel.send(msg);
    }
  }

  remoteCallAll(remoteObjectHandle, method, args) {
    for (const channel of this.channels) {
      channel
        .remoteObject(remoteObjectHandle)
        .call(method, args)
        .catch(e => {
          console.log(e);
        });
    }
  }

  reportCount() {
    const num = this.channels.length;
    this.emit('status', { num });
  }
}

export default ChannelList;
