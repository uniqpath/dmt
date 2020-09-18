import nacl from 'tweetnacl';
import naclutil from 'tweetnacl-util';
nacl.util = naclutil;

export default ClassBase =>
  class ConnectedStore extends ClassBase {
    constructor(loginStore, options) {
      const keys = nacl.box.keyPair();
      const clientPublicKey = keys.publicKey;
      const clientPrivateKey = keys.secretKey;

      Object.assign(options, { clientPrivateKey, clientPublicKey });
      super(options);

      this.loginStore = loginStore;

      this.on('connected', () => {
        const { ethAddress } = this.loginStore.get();

        if (ethAddress) {
          this.loginAddress(ethAddress);
        }
      });

      loginStore.on('metamask_login', ethAddress => {
        if (this.connected) {
          this.loginAddress(ethAddress);
        }
      });
    }

    emitProgramEvent(name, data) {
      this.remoteObject('GUIFrontendAcceptor')
        .call('emitProgramEvent', [name, data])
        .catch(console.log);
    }

    loginAddress(ethAddress) {
      const data = { ethAddress, urlHostname: window.location.hostname };

      this.remoteObject('GUIFrontendAcceptor')
        .call('getUserIdentity', data)
        .then(identity => {
          this.loginStore.set(identity);

          this.emitProgramEvent('zeta::login', { ...identity, ...data });
        })
        .catch(console.log);
    }

    saveUserProfile(options) {
      this.remoteObject('GUIFrontendAcceptor')
        .call('saveUserProfile', options)
        .then(() => {
          console.log('Profile saved');
          this.loginStore.set(options);
        })
        .catch(console.log);
    }
  };
