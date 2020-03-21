import quantum from 'quantum-generator';

function setupEndpoint(channel) {
  const send = () => {
    if (!channel.closed()) {
      channel
        .remoteObject('WisdomReceiver')
        .call('wisdom', quantum({ numSentences: 2 }))
        .catch(console.log);

      setTimeout(() => {
        send();
      }, 7000);
    }
  };

  send();
}

export default setupEndpoint;
