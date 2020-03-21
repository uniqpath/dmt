class TransportClientChannel {
  constructor(channel) {
    this.channel = channel;
  }

  async onData(callback) {
    this.channel.on('json_rpc', callback);
  }

  async sendData(data) {
    await this.channel.send(data);
  }
}

export default TransportClientChannel;
