import nacl from 'tweetnacl';
import naclutil from 'tweetnacl-util';

import { EventEmitter, isBrowser, listify } from '../utils';

nacl.util = naclutil;

const nullNonce = new Uint8Array(new ArrayBuffer(24), 0);

import RpcClient from '../rpc/client';

import RPCTarget from '../rpc/RPCTarget';

function isObject(obj) {
  return obj !== undefined && obj !== null && obj.constructor == Object;
}

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

  registerRemoteObject(handle, obj) {
    new RPCTarget({ serversideChannel: this, serverMethods: obj, methodPrefix: handle });
  }

  messageReceived(message) {
    if (this.sharedSecret) {
      if (this.verbose == 'extra') {
        console.log('Received bytes:');
        console.log(message);
        console.log(`Decrypting with shared secret ${this.sharedSecret}...`);
      }

      try {
        const _decryptedMessage = nacl.secretbox.open(message, nullNonce, this.sharedSecret);
        const flag = _decryptedMessage[0];
        const decryptedMessage = _decryptedMessage.subarray(1);

        const decodedMessage = nacl.util.encodeUTF8(decryptedMessage);
        message = decodedMessage;
      } catch (e) {
        throw new Error(`${message} -- ${this.protocol} -- ${e.toString()}`);
      }
    }

    let jsonData;

    try {
      jsonData = JSON.parse(message);
    } catch (e) {
      console.log('---');
      console.log(message);
      console.log('---');
      return;
    }

    if (this.verbose) {
      if (this.sharedSecret) {
        console.log('Decrypted message:');
      } else {
        console.log('Received message:');
      }
      console.log(message);
      console.log();
    }

    if (jsonData.jsonrpc) {
      if (Object.keys(jsonData).includes('result') || Object.keys(jsonData).includes('error')) {
        this.reverseRpcClient.jsonrpcMsgReceive(message);
      } else {
        this.emit('json_rpc', message);
      }
    } else if (jsonData.tag == 'request_file') {
      this.streamFile(jsonData);
    } else {
      this.emit('message', message);
    }
  }

  addHeader(_msg, flag) {
    const msg = new Uint8Array(_msg.length + 1);

    const header = new Uint8Array(1);
    header[0] = flag;

    msg.set(header);
    msg.set(_msg, header.length);

    return msg;
  }

  send(message) {
    if (isObject(message)) {
      message = JSON.stringify(message);
    }

    if (this.verbose) {
      if (this.sharedSecret) {
        console.log('Sending encrypted message:');
      } else {
        console.log('Sending message:');
      }

      console.log(message);
    }

    if (this.sharedSecret) {
      let flag = 0;

      if (typeof message == 'string') {
        flag = 1;
      }

      const _encodedMessage = flag == 1 ? nacl.util.decodeUTF8(message) : message;
      const encodedMessage = this.addHeader(_encodedMessage, flag);

      const encryptedMessage = nacl.secretbox(encodedMessage, nullNonce, this.sharedSecret);
      message = encryptedMessage;

      if (this.verbose == 'extra') {
        console.log('Encrypted bytes:');
        console.log(encryptedMessage);
      }
    }

    if (this.verbose) {
      console.log();
    }

    if (!this.ws.terminated && this.ws.readyState == this.ws.OPEN) {
      this.sentMessageCount += 1;
      this.ws.send(message);
    } else {
      this.ws.terminated = true;
    }
  }
}

export default Channel;
