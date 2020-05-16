class GUIFrontendStateAcceptor {
  constructor({ program, backendStore, channel }) {
    this.program = program;
    this.backendStore = backendStore;
    this.channel = channel;
  }

  getUserIdentity(address) {
    return this.backendStore.getUserIdentity(address);
  }
}

export default GUIFrontendStateAcceptor;
