class ConnectomeError extends Error {
  constructor(message, errorCode) {
    super(message);

    this.name = this.constructor.name;

    this.errorCode = errorCode;
  }

  errorCode() {
    return this.errorCode;
  }
}

export default ConnectomeError;
