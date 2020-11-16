function initializeProtocol({ server, channel }) {
  if (server.protocols[channel.protocol] && server.protocols[channel.protocol][channel.protocolLane]) {
    const { onConnect, channelList } = server.protocols[channel.protocol][channel.protocolLane];
    channelList.add(channel);

    onConnect({ channel, channelList });
  } else {
    console.log(`Error: unknown protocol ${channel.protocol}/${channel.protocolLane}, disconnecting`);
    channel.terminate();
  }
}

export default initializeProtocol;
