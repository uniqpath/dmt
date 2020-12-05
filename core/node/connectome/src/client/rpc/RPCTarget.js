import { MoleServer, ServerTransport } from './mole/index.js';

class RPCTarget {
  constructor({ serversideChannel, serverMethods, methodPrefix }) {
    const transports = [new ServerTransport(serversideChannel)];
    this.server = new MoleServer({ transports });
    this.server.expose(serverMethods);
    this.server.setMethodPrefix(methodPrefix);
    this.server.run();
  }
}

export default RPCTarget;
