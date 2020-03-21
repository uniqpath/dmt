import jayson from 'jayson';

function jaysonCallbackWrapper({ data, error, jaysonCallback }) {
  if (error) {
    jaysonCallback({ code: -1, message: JSON.stringify(error) });
  } else {
    jaysonCallback(null, data);
  }
}

function spawnServer({ port, symbol, serviceName, methods }) {
  const jaysonMethods = {};

  for (const [methodName, handler] of Object.entries(methods)) {
    jaysonMethods[methodName] = (args, jaysonCallback) => {
      handler(args)
        .then(data => jaysonCallbackWrapper({ data, jaysonCallback }))
        .catch(err => jaysonCallbackWrapper({ error: err.message, jaysonCallback }));
    };
  }

  return new Promise(success => {
    jayson
      .server(jaysonMethods)
      .http()
      .listen(port);

    const configInfo = { methods: Object.keys(methods) };
    success({ name: `${symbol} ${serviceName}`, port, configInfo });
  });
}

export default spawnServer;
