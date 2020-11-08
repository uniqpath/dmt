import MoleChannel from './moleChannel.js';

import * as mole from './mole/index.js';

const { MoleClient, ClientTransport } = mole;

import ConnectomeError from '../error/connectomeError.js';

class SpecificRpcClient {
  constructor(connectorOrServersideChannel, methodPrefix, requestTimeout) {
    this.moleChannel = new MoleChannel(connectorOrServersideChannel);
    this.methodPrefix = methodPrefix;

    this.connectorOrServersideChannel = connectorOrServersideChannel;

    this.client = new MoleClient({
      requestTimeout,
      transport: new ClientTransport(this.moleChannel)
    });
  }

  jsonrpcMsgReceive(stringMessage) {
    this.moleChannel.emit('json_rpc', stringMessage);
  }

  call(methodName, params) {
    if (this.connectorOrServersideChannel.closed()) {
      return new Promise((success, reject) => {
        reject(
          new ConnectomeError(
            `Method call [${this.methodPrefix}::${methodName}] on closed channel or connector ignored. Please add a check for closed channel in your code.`,
            'CLOSED_CHANNEL'
          )
        );
      });
    }

    return this.client.callMethod(`${this.methodPrefix}::${methodName}`, params);
  }
}

export default SpecificRpcClient;
