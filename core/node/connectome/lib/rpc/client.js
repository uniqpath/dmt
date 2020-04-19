import MoleChannel from './moleChannel';

import * as mole from './mole';

const { MoleClient, ClientTransport } = mole;

class RpcClient {
  constructor(connectorOrServersideChannel) {
    this.connectorOrServersideChannel = connectorOrServersideChannel;
    this.remoteObjects = {};
  }

  remoteObject(methodPrefix) {
    const remoteObject = this.remoteObjects[methodPrefix];
    if (!remoteObject) {
      this.remoteObjects[methodPrefix] = new SpecificRpcClient(this.connectorOrServersideChannel, methodPrefix);
    }
    return this.remoteObjects[methodPrefix];
  }

  jsonrpcMsgReceive(stringMessage) {
    for (const remoteObject of Object.values(this.remoteObjects)) {
      remoteObject.jsonrpcMsgReceive(stringMessage);
    }
  }
}

class SpecificRpcClient {
  constructor(connectorOrServersideChannel, methodPrefix) {
    this.moleChannel = new MoleChannel(connectorOrServersideChannel);
    this.methodPrefix = methodPrefix;

    this.connectorOrServersideChannel = connectorOrServersideChannel;

    this.client = new MoleClient({
      requestTimeout: 1000,
      transport: new ClientTransport(this.moleChannel)
    });
  }

  jsonrpcMsgReceive(stringMessage) {
    this.moleChannel.emit('json_rpc', stringMessage);
  }

  call(methodName, params) {
    if (this.connectorOrServersideChannel.closed()) {
      return new Promise((success, reject) => {
        reject(new Error(`Method call [${methodName}] on closed channel or connector ignored. Please add a check for closed channel in your code.`));
      });
    } else {
      return this.client.callMethod(`${this.methodPrefix}::${methodName}`, params);
    }
  }
}

export default RpcClient;
