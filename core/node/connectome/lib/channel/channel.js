import send from './send';
import receive from './receive';

import { EventEmitter, isBrowser, listify } from '../utils';

import RpcClient from '../rpc/client';

import RPCTarget from '../rpc/RPCTarget';

class Channel extends EventEmitter {
  constructor(ws, { verbose }) {
    super();
    this.ws = ws;
    this.verbose = verbose;

    this.protocol = ws.protocol;

    this.reverseRpcClient = new RpcClient(this);

    this.sentMessageCount = 0;
    this.receivedMessageCount = 0;

    ws.on('message', msg => {
      this.receivedMessageCount += 1;
    });

    ws.on('close', () => {
      this.emit('channel_closed');
    });
  }

  setProtocolLane(protocolLane) {
    this.protocolLane = protocolLane;
  }

  setSharedSecret(sharedSecret) {
    this.sharedSecret = sharedSecret;
  }

  setClientInitData(clientInitData) {
    this._clientInitData = clientInitData;
  }

  clientInitData() {
    return this._clientInitData;
  }

  remoteIp() {
    return this.ws.remoteIp;
  }

  setRemotePubkey(remotePubkeyHex) {
    this.remotePubkeyHex = remotePubkeyHex;
  }

  remotePubkey() {
    return this.remotePubkeyHex;
  }

  send(message) {
    send({ message, channel: this });
  }

  messageReceived(message) {
    receive({ message, channel: this });
  }

  registerRemoteObject(handle, obj) {
    new RPCTarget({ serversideChannel: this, serverMethods: obj, methodPrefix: handle });
  }

  remoteObject(handle) {
    return {
      call: (methodName, params = []) => {
        return this.reverseRpcClient.remoteObject(handle).call(methodName, listify(params));
      }
    };
  }

  streamFile({ filePath, sessionId }) {
    if (isBrowser()) {
      throw new Error('Cannot stream file from browser, use this only from node.js process!');
    } else {
      import('../fileTransport/feedBytesIntoChannel/streamFile').then(streamFileModule => streamFileModule.default({ filePath, sessionId, channel: this }));
    }
  }

  terminate() {
    this.ws.terminated = true;

    this.ws.close();

    process.nextTick(() => {
      if ([this.ws.OPEN, this.ws.CLOSING].includes(this.ws.readyState)) {
        this.ws.terminate();
      }
    });
  }

  terminated() {
    return this.ws.terminated;
  }

  closed() {
    return [this.ws.CLOSED, this.ws.CLOSING].includes(this.ws.readyState);
  }
}

export default Channel;
