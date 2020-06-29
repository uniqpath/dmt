import send from './send.js';
import receive from './receive.js';

import { EventEmitter, isBrowser, listify } from '../utils/index.js';

import RpcClient from '../rpc/client.js';

import RPCTarget from '../rpc/RPCTarget.js';

class Channel extends EventEmitter {
  constructor(ws, { rpcRequestTimeout, verbose = false }) {
    super();
    this.ws = ws;
    this.verbose = verbose;

    this.protocol = ws.protocol;

    this.reverseRpcClient = new RpcClient(this, rpcRequestTimeout);

    ws.on('close', () => {
      this.emit('channel_closed');
    });

    this.sentCount = 0;
    this.receivedCount = 0;
  }

  setProtocolLane(protocolLane) {
    this.protocolLane = protocolLane;
  }

  setSharedSecret(sharedSecret) {
    this.sharedSecret = sharedSecret;
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
    this.sentCount += 1;
  }

  messageReceived(message) {
    receive({ message, channel: this });
    this.receivedCount += 1;
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
