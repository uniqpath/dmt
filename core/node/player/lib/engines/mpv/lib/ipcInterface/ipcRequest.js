const ErrorHandler = require('../error');

const ipcRequest = class {
  constructor(resolve, reject, args) {
    this.messageResolve = resolve;
    this.messageReject = reject;
    this.args = args;

    const stackMatch = new Error().stack.match(/mpv.\w+\s/g);
    this.caller = stackMatch ? stackMatch[stackMatch.length - 1].slice(4, -1) + '()' : null;
  }

  resolve(resolveValue) {
    this.messageResolve(resolveValue);
  }

  reject(err) {
    const errHandler = new ErrorHandler();
    const errMessage = errHandler.errorMessage(3, this.caller, this.args, err);
    this.messageReject(errMessage);
  }
};

module.exports = ipcRequest;
