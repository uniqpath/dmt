function wsEndpointWrapper({ program, actors }) {
  return ({ channel }) => wsEndpoint({ program, actors, channel });
}

function wsEndpoint({ program, actors, channel }) {
  channel.registerRemoteObject('actors', actors);
}

export default wsEndpointWrapper;
