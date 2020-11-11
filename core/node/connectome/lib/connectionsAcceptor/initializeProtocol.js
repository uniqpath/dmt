function initializeProtocol({ server, channel }) {
  if (server.protocols[channel.protocol] && server.protocols[channel.protocol][channel.protocolLane]) {
    const { wsEndpoint, channelList } = server.protocols[channel.protocol][channel.protocolLane];
    channelList.add(channel);

    wsEndpoint({ channel, channelList });
  } else {
    console.log(`Error: unknown protocol ${channel.protocol}/${channel.protocolLane}, disconnecting`);
    channel.terminate();
  }
}

export default initializeProtocol;
