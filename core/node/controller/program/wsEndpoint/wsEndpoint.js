function wsEndpointWrapper({ program, actors }) {
  return ({ channel }) => wsEndpoint({ program, actors, channel });
}

function wsEndpoint({ program, actors, channel }) {
  actors.setupChannel(channel);
}

export default wsEndpointWrapper;
