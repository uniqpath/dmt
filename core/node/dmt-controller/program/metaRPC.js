import colors from 'colors';

import dmt from 'dmt-bridge';
const { log } = dmt;

import { spawnServer } from 'dmt-rpc';

function createHandler({ action, serviceName, program }, setupData = {}) {
  return args => {
    return new Promise(success => {
      const calledWith = args.length == 1 && args[0] == null ? '' : `with ${JSON.stringify(args, null, 2)}`;
      log.gray(`rpc method called → ${colors.cyan(serviceName)}/${colors.green(action.command)} ${calledWith}`);

      if (action.handler) {
        action
          .handler({ args, action, serviceName, program }, setupData)
          .then(success)
          .catch(err => success({ error: err.message }));
      }
    });
  };
}

function prepareMethods({ program, services }) {
  const methods = {};

  const setupResults = {};

  for (const { serviceName, actions, setup } of services) {
    if (setup && !setupResults[serviceName]) {
      setupResults[serviceName] = setup({ program, serviceName });
    }

    for (const action of actions) {
      methods[`${serviceName}/${action.command}`] = createHandler({ action, serviceName, program }, setupResults[serviceName]);
    }
  }

  return methods;
}

class MetaRPC {
  constructor(program) {
    this.program = program;
    this.services = [];
  }

  registerService(service) {
    this.services.push(service);
  }

  registrationsFinished() {
    this.initRPCEndpoint(this.program);
  }

  call(remoteObject, remoteMethod, args) {
    const methodName = `${remoteObject}/${remoteMethod}`;

    return new Promise((success, reject) => {
      const method = this.methods[methodName];
      if (method) {
        method(args).then(success);
      } else {
        reject(new Error(`Remote meta-rpc method ${methodName} does not exist.`));
      }
    });
  }

  initRPCEndpoint(program) {
    const rpcService = dmt.services('rpc');
    const rpcServiceName = rpcService.id;

    if (rpcService) {
      this.methods = prepareMethods({ program: this.program, services: this.services });

      spawnServer({ program, port: rpcService.port, symbol: rpcService.symbol, serviceName: rpcServiceName, methods: this.methods })
        .then(({ name, port, configInfo }) => {
          log.green(`${name} listening at port ${port} ${colors.gray(`■ RPC methods: ${configInfo.methods.length}`)}`);
        })
        .catch(e => {
          log.red(`Service ${rpcServiceName} error when starting: ${e.toString()}`);
        });
    }
  }
}

export default MetaRPC;
