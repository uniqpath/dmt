import SpecificRpcClient from './specificClient.js';

const DEFAULT_REQUEST_TIMEOUT = 10000;

class RpcClient {
  constructor(connectorOrServersideChannel, requestTimeout) {
    this.connectorOrServersideChannel = connectorOrServersideChannel;
    this.remoteObjects = {};
    this.requestTimeout = requestTimeout || DEFAULT_REQUEST_TIMEOUT;
  }

  remoteObject(methodPrefix) {
    const remoteObject = this.remoteObjects[methodPrefix];
    if (!remoteObject) {
      this.remoteObjects[methodPrefix] = new SpecificRpcClient(this.connectorOrServersideChannel, methodPrefix, this.requestTimeout);
    }
    return this.remoteObjects[methodPrefix];
  }

  jsonrpcMsgReceive(stringMessage) {
    for (const remoteObject of Object.values(this.remoteObjects)) {
      remoteObject.jsonrpcMsgReceive(stringMessage);
    }
  }
}

export default RpcClient;
