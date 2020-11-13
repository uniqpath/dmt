function serverEndpoint({ channel }) {
  channel.attachObject('ErrorObject', {
    makeError: () => {
      throw new Error('And just like that, AN ERROR IS THROWN');
    }
  });
}

export default serverEndpoint;
