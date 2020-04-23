import nacl from 'tweetnacl';
import naclutil from 'tweetnacl-util';

import { EventEmitter, hexToBuffer } from '../../utils';

nacl.util = naclutil;

class AuthTarget extends EventEmitter {
  constructor({ keypair, channel }) {
    super();

    this.keypair = keypair;
    this.channel = channel;
  }

  exchangePubkeys({ pubkey }) {
    const remoteClientPubkey = hexToBuffer(pubkey);

    this.channel.setRemotePubkey(pubkey);

    this.sharedSecret = nacl.box.before(remoteClientPubkey, this.keypair.privateKey);

    return this.keypair.publicKeyHex;
  }

  finalizeHandshake({ protocolLane, expectHelloData }) {
    this.emit('shared_secret', { sharedSecret: this.sharedSecret, protocolLane, expectingHelloData: expectHelloData });
  }
}

export default AuthTarget;
