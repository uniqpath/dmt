import nacl from 'tweetnacl';
import naclutil from 'tweetnacl-util';

import EventEmitter from '../emitter';

nacl.util = naclutil;

const nullNonce = new Uint8Array(new ArrayBuffer(24), 0);

import util from '../util';

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

  setLane(protocolLane) {
    this.lane = protocolLane;
  }

  setSharedSecret(sharedSecret) {
    this.sharedSecret = sharedSecret;
  }

  remoteIp() {
    return this.ws.remoteIp;
  }

  remoteObject(handle) {
    return {
      call: (methodName, params = []) => {
        return this.reverseRpcClient.remoteObject(handle).call(methodName, util.listify(params));
      }
    };
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
        const decryptedMessage = nacl.secretbox.open(message, nullNonce, this.sharedSecret);
        const decodedMessage = nacl.util.encodeUTF8(decryptedMessage);
        message = decodedMessage;
      } catch (e) {
        throw new Error(`${message} -- ${this.protocol} -- ${e.toString()}`);
      }
    }

    const jsonData = JSON.parse(message);

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
    } else {
      this.emit('message', message);
    }
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
      const encodedMessage = nacl.util.decodeUTF8(message);
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
