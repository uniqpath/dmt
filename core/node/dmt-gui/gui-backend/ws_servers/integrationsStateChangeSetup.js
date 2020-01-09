function integrationsStateChangeSetup({ program, channel }) {
  function sendIntegrationsState() {
    if (program.state.integrations) {
      channel.send(JSON.stringify({ integrations: program.state.integrations }));
    }
  }

  const name = 'integrations_state_updated';

  const callback = () => {
    if (channel.closed()) {
      program.removeListener(name, callback);
    } else {
      sendIntegrationsState();
    }
  };

  program.on(name, callback);

  sendIntegrationsState();
}

module.exports = integrationsStateChangeSetup;
