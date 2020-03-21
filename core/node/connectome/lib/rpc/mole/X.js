import errorCodes from './errorCodes';

class Base extends Error {
  constructor(data = {}) {
    super();

    if (!data.code) throw new Error('Code required');
    if (!data.message) throw new Error('Message required');

    this.code = data.code;
    this.message = data.message;
  }
}

class MethodNotFound extends Base {
  constructor(message) {
    super({
      code: errorCodes.METHOD_NOT_FOUND,
      message: message || 'Method not found'
    });
  }
}

class InvalidParams extends Base {
  constructor() {
    super({
      code: errorCodes.INVALID_PARAMS,
      message: 'Invalid params'
    });
  }
}

class InternalError extends Base {
  constructor() {
    super({
      code: errorCodes.INTERNAL_ERROR,
      message: 'Internal error'
    });
  }
}

class ParseError extends Base {
  constructor() {
    super({
      code: errorCodes.PARSE_ERROR,
      message: 'Parse error'
    });
  }
}

class InvalidRequest extends Base {
  constructor() {
    super({
      code: errorCodes.INVALID_REQUEST,
      message: 'Invalid request'
    });
  }
}

class ServerError extends Base {}

class RequestTimout extends ServerError {
  constructor(message) {
    super({
      code: -32001,
      message: `Request exceeded maximum execution time ${message}`
    });
  }
}

export default {
  Base,
  MethodNotFound,
  InvalidRequest,
  InvalidParams,
  InternalError,
  ServerError,
  ParseError,
  RequestTimout
};
