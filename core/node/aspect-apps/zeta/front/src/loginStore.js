export default ClassBase =>
  class LoginStore extends ClassBase {
    constructor({ verbose = false } = {}) {
      super();

      this.verbose = verbose;
    }

    login(ethAddress) {
      this.set({ ethAddress, loggedIn: true });
      this.emit('metamask_login', ethAddress);
    }
  };
