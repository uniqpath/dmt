import { stores } from 'dmt-js';

class ConnectedStore extends stores.ConnectedStore {
  constructor(frontendStore, options) {
    super(options);

    this.frontendStore = frontendStore;

    this.on('connected', () => {
      const { ethAddress } = this.frontendStore.get();

      if (ethAddress) {
        this.loginAddress(ethAddress);
      }
    });

    frontendStore.on('login', ethAddress => {
      if (this.connected) {
        this.loginAddress(ethAddress);
      }
    });
  }

  loginAddress(ethAddress) {
    this.remoteObject('GUIFrontendStateAcceptor')
      .call('getUserIdentity', ethAddress)
      .then(identity => {
        this.frontendStore.set(identity);
      })
      .catch(console.log);
  }
}

export default ConnectedStore;
