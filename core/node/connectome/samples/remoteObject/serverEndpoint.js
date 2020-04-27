function serverEndpoint({ channel }) {
  channel.registerRemoteObject('ServerObject', { hello: () => 'world' });
}

export default serverEndpoint;
