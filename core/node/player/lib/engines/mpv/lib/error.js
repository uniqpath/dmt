const ErrorHandler = class {
  constructor() {
    this.messageDict = {
      0: 'Unable to load file or stream',
      1: 'Invalid argument',
      2: 'Binary not found',
      3: 'ipcCommand invalid',
      4: 'Unable to bind IPC socket',
      5: 'Timeout',
      6: 'MPV is already running',
      7: 'Could not send IPC message'
    };
  }

  errorMessage(errorCode, method, args, errorMessage, options) {
    let errorObject = {
      errcode: errorCode,
      verbose: this.messageDict[errorCode],
      method
    };

    if (args) {
      errorObject = Object.assign(errorObject, {
        arguments: args
      });
    }

    if (errorMessage) {
      errorObject = Object.assign(errorObject, {
        errmessage: errorMessage
      });
    }

    if (options) {
      errorObject = Object.assign(errorObject, {
        options
      });
    }

    return errorObject;
  }
};

export default ErrorHandler;
