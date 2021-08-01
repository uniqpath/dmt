import { EventEmitter } from '../../utils/index.js';

class ChannelList extends EventEmitter {
  constructor({ protocol }) {
    super();

    this.protocol = protocol;

    this.channels = [];

    process.nextTick(() => {
      this.reportStatus();
    });
  }

  add(channel) {
    this.channels.push(channel);

    channel.on('disconnect', () => {
      this.channels.splice(this.channels.indexOf(channel), 1);
      this.reportStatus();
    });

    this.emit('new_channel', channel);

    this.reportStatus();
  }

  signalAll(signal, data) {
    for (const channel of this.channels) {
      channel.signal(signal, data);
    }
  }

  sendAll(msg) {
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

  multiCall(remoteObjectHandle, method, args) {
    const promises = this.channels.map(channel => channel.remoteObject(remoteObjectHandle).call(method, args));
    return Promise.all(promises);
  }

  reportStatus() {
    const connList = this.channels.map(channel => {
      const result = {
        ip: channel.remoteIp(),
        address: channel.remoteAddress(),
        remotePubkeyHex: channel.remotePubkeyHex()
      };

      return result;
    });

    this.emit('status', { connList });
  }

  [Symbol.iterator]() {
    let counter = 0;
    return {
      next: () => {
        if (counter < this.channels.length) {
          const result = { value: this.channels[counter], done: false };
          counter++;
          return result;
        }
        return { done: true };
      }
    };
  }
}

export default ChannelList;
