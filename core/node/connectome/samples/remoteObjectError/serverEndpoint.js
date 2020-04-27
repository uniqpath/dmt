function serverEndpoint({ channel }) {
  channel.registerRemoteObject('ErrorObject', {
    makeError: () => {
      throw new Error('ERROR IS THROWN');
    }
  });
}

export default serverEndpoint;
