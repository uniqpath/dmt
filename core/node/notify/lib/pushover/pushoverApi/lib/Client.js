import SendMessage from './Command/SendMessage.js';
import VerifyUser from './Command/VerifyUser.js';
import GetReceipt from './Command/GetReceipt.js';
import CancelEmergency from './Command/CancelEmergency.js';
import GetGroupDetails from './Command/GetGroupDetails.js';
import AddUserToGroup from './Command/AddUserToGroup.js';
import RemoveUserFromGroup from './Command/RemoveUserFromGroup.js';
import EnableGroupUser from './Command/EnableGroupUser.js';
import DisableGroupUser from './Command/DisableGroupUser.js';
import RenameGroup from './Command/RenameGroup.js';
import Transport from './Transport.js';

const PUSHOVER_HOST = 'https://api.pushover.net';
const PUSHOVER_VERSION = '1';

class Client {
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

  sendMessage(message) {
    return this.invokeCommand(new SendMessage(message));
  }

  verifyUser(user) {
    return this.invokeCommand(new VerifyUser(user));
  }

  getReceipt(receipt) {
    return this.invokeCommand(new GetReceipt(receipt));
  }

  cancelEmergency(receipt) {
    return this.invokeCommand(new CancelEmergency(receipt));
  }

  getGroupDetails(group) {
    return this.invokeCommand(new GetGroupDetails(group));
  }

  addUserToGroup(user, group) {
    return this.invokeCommand(new AddUserToGroup(user, group));
  }

  removeUserFromGroup(user, group) {
    return this.invokeCommand(new RemoveUserFromGroup(user, group));
  }

  enableGroupUser(user, group) {
    return this.invokeCommand(new EnableGroupUser(user, group));
  }

  disableGroupUser(user, group) {
    return this.invokeCommand(new DisableGroupUser(user, group));
  }

  renameGroup(group, name) {
    return this.invokeCommand(new RenameGroup(group, name));
  }

  getTransport() {
    if (!this.transport) {
      this.transport = new Transport(this);
    }

    return this.transport;
  }

  invokeCommand(command) {
    return command.invoke(this);
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

export default Client;
