function initializeProtocol({ server, channel }) {
  if (server.protocols[channel.protocol]) {
    const { onConnect, channelList } = server.protocols[channel.protocol];
    channelList.add(channel);

    onConnect({ channel, channelList });

    return true;
  }
}

export default initializeProtocol;
