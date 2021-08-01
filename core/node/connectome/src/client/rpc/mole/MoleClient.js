import X from './X.js';
import errorCodes from './errorCodes.js';

class MoleClient {
  constructor({ transport, requestTimeout = 20000 }) {
    if (!transport) throw new Error('TRANSPORT_REQUIRED');
    this.transport = transport;

    this.requestTimeout = requestTimeout;

    this.pendingRequest = {};
    this.initialized = false;
  }

  setMethodPrefix(methodPrefix) {
    this.methodPrefix = methodPrefix;
  }

  async callMethod(methodName, params) {
    this._init();

    const method = this.methodPrefix ? `${this.methodPrefix}::${methodName}` : methodName;

    const request = this._makeRequestObject({ method, params });

    return this._sendRequest({ object: request, id: request.id });
  }

  notify(method, params) {
    this._init();

    const request = this._makeRequestObject({ method, params, mode: 'notify' });
    this.transport.sendData(JSON.stringify(request));
    return true;
  }

  async runBatch(calls) {
    const batchId = this._generateId();
    let onlyNotifications = true;

    const batchRequest = [];

    for (const [method, params, mode] of calls) {
      const request = this._makeRequestObject({ method, params, mode, batchId });

      if (request.id) {
        onlyNotifications = false;
      }

      batchRequest.push(request);
    }

    if (onlyNotifications) {
      return this.transport.sendData(JSON.stringify(batchRequest));
    }

    return this._sendRequest({ object: batchRequest, id: batchId });
  }

  _init() {
    if (this.initialized) return;

    this.transport.onData(this._processResponse.bind(this));

    this.initialized = true;
  }

  _sendRequest({ object, id }) {
    const data = JSON.stringify(object);

    return new Promise((resolve, reject) => {
      this.pendingRequest[id] = { resolve, reject, sentObject: object };

      setTimeout(() => {
        if (this.pendingRequest[id]) {
          delete this.pendingRequest[id];

          reject(new X.RequestTimeout(data, this.requestTimeout));
        }
      }, this.requestTimeout);

      try {
        this.transport.sendData(data);
      } catch (e) {
        delete this.pendingRequest[id];
        reject(e);
      }
    });
  }

  _processResponse(data) {
    const response = JSON.parse(data);

    if (Array.isArray(response)) {
      this._processBatchResponse(response);
    } else {
      this._processSingleCallResponse(response);
    }
  }

  _processSingleCallResponse(response) {
    const isSuccessfulResponse = response.hasOwnProperty('result') || false;
    const isErrorResponse = response.hasOwnProperty('error');

    if (!isSuccessfulResponse && !isErrorResponse) return;

    const resolvers = this.pendingRequest[response.id];
    delete this.pendingRequest[response.id];

    if (!resolvers) return;

    if (isSuccessfulResponse) {
      resolvers.resolve(response.result);
    } else if (isErrorResponse) {
      const errorObject = this._makeErrorObject(response.error);
      resolvers.reject(errorObject);
    }
  }

  _processBatchResponse(responses) {
    let batchId;
    const responseById = {};
    const errorsWithoutId = [];

    for (const response of responses) {
      if (response.id) {
        if (!batchId) {
          batchId = response.id.split('|')[0];
        }

        responseById[response.id] = response;
      } else if (response.error) {
        errorsWithoutId.push(response.error);
      }
    }

    if (!this.pendingRequest[batchId]) return;

    const { sentObject, resolve } = this.pendingRequest[batchId];
    delete this.pendingRequest[batchId];

    const batchResults = [];
    let errorIdx = 0;
    for (const request of sentObject) {
      if (!request.id) {
        batchResults.push(null);
        continue;
      }

      const response = responseById[request.id];

      if (response) {
        const isSuccessfulResponse = response.hasOwnProperty('result') || false;

        if (isSuccessfulResponse) {
          batchResults.push({
            success: true,
            result: response.result
          });
        } else {
          batchResults.push({
            success: false,
            result: this._makeErrorObject(response.error)
          });
        }
      } else {
        batchResults.push({
          success: false,
          error: this._makeErrorObject(errorsWithoutId[errorIdx])
        });
        errorIdx++;
      }
    }

    resolve(batchResults);
  }

  _makeRequestObject({ method, params, mode, batchId }) {
    const request = {
      jsonrpc: '2.0',
      method
    };

    if (params && params.length) {
      request.params = params;
    }

    if (mode !== 'notify') {
      request.id = batchId ? `${batchId}|${this._generateId()}` : this._generateId();
    }

    return request;
  }

  _makeErrorObject(errorData) {
    const errorBuilder = {
      [errorCodes.METHOD_NOT_FOUND]: () => {
        return new X.MethodNotFound(errorData.message);
      },
      [errorCodes.REMOTE_INTERNAL_ERROR]: () => {
        return new X.RemoteInternalError(errorData.message);
      }
    }[errorData.code];

    return errorBuilder();
  }

  _generateId() {
    const alphabet = 'bjectSymhasOwnProp-0123456789ABCDEFGHIJKLMNQRTUVWXYZ_dfgiklquvxz';
    let size = 10;
    let id = '';

    while (0 < size--) {
      id += alphabet[(Math.random() * 64) | 0];
    }

    return id;
  }
}

export default MoleClient;
