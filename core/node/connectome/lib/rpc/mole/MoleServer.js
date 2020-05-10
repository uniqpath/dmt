import errorCodes from './errorCodes';

class MoleServer {
  constructor({ transports }) {
    if (!transports) throw new Error('TRANSPORT_REQUIRED');

    this.transportsToRegister = transports;
    this.methods = {};
  }

  setMethodPrefix(methodPrefix) {
    this.methodPrefix = methodPrefix;
  }

  expose(methods) {
    this.methods = methods;
  }

  registerTransport(transport) {
    transport.onData(this._processRequest.bind(this, transport));
  }

  async _processRequest(transport, data) {
    const requestData = JSON.parse(data);
    let responseData;

    if (Array.isArray(requestData)) {
      responseData = await Promise.all(requestData.map(request => this._callMethod(request, transport)));
    } else {
      responseData = await this._callMethod(requestData, transport);
    }

    return JSON.stringify(responseData);
  }

  async _callMethod(request, transport) {
    const isRequest = request.hasOwnProperty('method');
    if (!isRequest) return;

    const { method, params = [], id } = request;

    let methodName = method;

    if (methodName.includes('::')) {
      const [prefix, name] = methodName.split('::');
      methodName = name;
      if (this.methodPrefix && prefix != this.methodPrefix) {
        return;
      }
    }

    const methodNotFound =
      !this.methods[methodName] ||
      typeof this.methods[methodName] !== 'function' ||
      methodName === 'constructor' ||
      methodName.startsWith('_') ||
      this.methods[methodName] === Object.prototype[methodName];

    let response = {};

    if (methodNotFound) {
      response = {
        jsonrpc: '2.0',
        id,
        error: {
          code: errorCodes.METHOD_NOT_FOUND,
          message: `Method [${methodName}] not found on remote target object`
        }
      };
    } else {
      this.currentTransport = transport;

      try {
        const result = await this.methods[methodName].apply(this.methods, params);

        if (!id) return;

        response = {
          jsonrpc: '2.0',
          result: typeof result === 'undefined' ? null : result,
          id
        };
      } catch (e) {
        console.log(`Exposed RPC method ${method} internal error:`);
        console.log(e);
        console.log('Sending this error as a result to calling client ...');
        response = {
          jsonrpc: '2.0',
          error: {
            code: errorCodes.REMOTE_INTERNAL_ERROR,
            message: `Method [${method}] internal error: ${e.stack}`
          },
          id
        };
      }
    }

    return response;
  }

  run() {
    for (const transport of this.transportsToRegister) {
      this.registerTransport(transport);
    }

    this.transportsToRegister = [];
  }
}

export default MoleServer;
