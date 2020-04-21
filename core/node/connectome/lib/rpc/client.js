import SpecificRpcClient from './specificClient';

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

export default RpcClient;
