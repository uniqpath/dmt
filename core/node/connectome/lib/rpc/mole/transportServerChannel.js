class TransportServerChannel {
  constructor(channel) {
    this.channel = channel;
  }

  async onData(callback) {
    this.channel.on('json_rpc', async reqData => {
      const resData = await callback(reqData);
      if (!resData) return;

      this.channel.send(resData);
    });
  }
}

export default TransportServerChannel;
