function initializeProtocol({ server, channel }) {
  if (server.protocols[channel.protocol] && server.protocols[channel.protocol][channel.lane]) {
    const { onConnect, channelList } = server.protocols[channel.protocol][channel.lane];
    channelList.add(channel);

    onConnect({ channel, channelList });
  } else {
    console.log(
      `Error: request from ${channel.remoteIp()} (${channel.remotePubkeyHex()}) - unknown protocol ${channel.protocol}/${channel.lane}, disconnecting`
    );

    channel.terminate();
  }
}

export default initializeProtocol;
