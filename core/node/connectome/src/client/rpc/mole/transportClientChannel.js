class TransportClientChannel {
  constructor(channel) {
    this.channel = channel;
  }

  onData(callback) {
    this.channel.on('json_rpc', callback);
  }

  sendData(data) {
    this.channel.send(data);
  }
}

export default TransportClientChannel;
