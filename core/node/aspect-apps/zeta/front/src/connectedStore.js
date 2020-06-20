import { stores } from 'dmt-js';

class ConnectedStore extends stores.ConnectedStore {
  constructor(loginStore, options) {
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

  loginAddress(ethAddress) {
    this.remoteObject('GUIFrontendAcceptor')
      .call('getUserIdentity', { address: ethAddress, urlHostname: window.location.hostname })
      .then(identity => {
        this.loginStore.set(identity);
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
}

export default ConnectedStore;
