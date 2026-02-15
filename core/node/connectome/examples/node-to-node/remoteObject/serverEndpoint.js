function serverEndpoint({ channel }) {
  channel.attachObject('ServerObject', { hello: () => 'world' });
}

export default serverEndpoint;
