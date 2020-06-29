function serverEndpoint({ channel }) {
  channel.registerRemoteObject('ErrorObject', {
    makeError: () => {
      throw new Error('And just like that, AN ERROR IS THROWN');
    }
  });
}

export default serverEndpoint;
