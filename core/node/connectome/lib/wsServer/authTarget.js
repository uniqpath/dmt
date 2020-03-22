import nacl from 'tweetnacl';
import naclutil from 'tweetnacl-util';

import EventEmitter from '../emitter';
import util from '../util';

nacl.util = naclutil;

const { hexToBuffer } = util;

class AuthTarget extends EventEmitter {
  constructor({ keypair }) {
    super();

    this.keypair = keypair;
  }

  exchangePubkeys({ pubkey }) {
    const remoteClientPubkey = hexToBuffer(pubkey);

    this.sharedSecret = nacl.box.before(remoteClientPubkey, this.keypair.privateKey);

    return this.keypair.publicKeyHex;
  }

  finalizeHandshake({ protocolLane }) {
    this.emit('shared_secret', { sharedSecret: this.sharedSecret, protocolLane });
  }
}

export default AuthTarget;
