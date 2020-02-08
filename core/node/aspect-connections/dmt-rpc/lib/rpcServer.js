import colors from 'colors';

import dmt from 'dmt-bridge';
const { log } = dmt;
import jayson from 'jayson';

function jaysonCallbackWrapper({ data, error, jaysonCallback }) {
  if (error) {
    jaysonCallback({ code: -1, message: JSON.stringify(error) });
  } else {
    jaysonCallback(null, data);
  }
}

function createHandler({ action, symbol, serviceName, program }, setupData = {}) {
  return (args, jaysonCallback) => {
    const calledWith = args.length == 1 && args[0] == null ? '' : `with ${JSON.stringify(args, null, 2)}`;
    log.gray(`rpc method called → ${colors.cyan(serviceName)}/${colors.green(action.command)} ${calledWith}`);

    if (action.handler) {
      action
        .handler({ args, action, serviceName, program }, setupData)
        .then(data => jaysonCallbackWrapper({ data, jaysonCallback }))
        .catch(err => jaysonCallbackWrapper({ error: err.message, jaysonCallback }));
    }
  };
}

function spawnServer({ program, port, symbol, serviceName, services }) {
  const methods = [];

  const setupResults = {};

  for (const { serviceName, actions, setup } of services) {
    if (setup && !setupResults[serviceName]) {
      setupResults[serviceName] = setup({ program, serviceName });
    }

    for (const action of actions) {
      methods[`${serviceName}/${action.command}`] = createHandler({ action, symbol, serviceName, program }, setupResults[serviceName]);
    }
  }

  return new Promise(success => {
    jayson
      .server(methods)
      .http()
      .listen(port);

    const configInfo = { methods: Object.keys(methods) };
    success({ name: `${symbol} ${serviceName}`, port, configInfo });
  });
}

export default spawnServer;
