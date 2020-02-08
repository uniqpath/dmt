import colors from 'colors';

import dmt from 'dmt-bridge';
const { log } = dmt;

import { spawnServer } from 'dmt-rpc';

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

  initRPCEndpoint(program) {
    const rpcService = dmt.services('rpc');
    const rpcServiceName = rpcService.id;

    if (rpcService) {
      spawnServer({ program, port: rpcService.port, symbol: rpcService.symbol, serviceName: rpcServiceName, services: this.services })
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
