import { sendMessage, sendMessageOptions } from './Command/SendMessage.js';
import { verifyUser } from './Command/VerifyUser.js';
import Transport from './Transport.js';

const PUSHOVER_HOST = 'https://api.pushover.net';
const PUSHOVER_VERSION = '1';

export default class Client {
  constructor(apiToken) {
    this.options = {
      host: PUSHOVER_HOST,
      version: PUSHOVER_VERSION
    };

    this.app = {
      limit: null,
      remaining: null,
      reset: null
    };

    this.apiToken = apiToken;
  }

  get apiToken() {
    return this.options.apiToken;
  }

  set apiToken(value) {
    validateApiToken(value);

    this.options.apiToken = value;
  }

  sendMessageOptions(message) {
    return sendMessageOptions({ message, client: this });
  }

  sendMessage(message) {
    return sendMessage({ message, client: this });
  }

  verifyUser(user) {
    return verifyUser({ user, client: this });
  }

  getTransport() {
    if (!this.transport) {
      this.transport = new Transport(this);
    }

    return this.transport;
  }

  get appLimit() {
    return this.app.limit;
  }

  get appRemaining() {
    return this.app.remaining;
  }

  get appReset() {
    return this.app.reset;
  }
}

function validateApiToken(value) {
  if (!value.match(/^[a-z0-9]{30}$/i)) {
    throw new Error('API token must be 30 characters long and alphanumeric');
  }
}
