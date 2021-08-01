import Command from './Command.js';
import Group from '../Group.js';
import User from '../User.js';

class VerifyUser extends Command {
  constructor(user) {
    super();

    validateUserOrGroup(user);

    this.user = user;
  }

  invoke(client) {
    const options = {
      method: 'post',
      url: '/users/validate.json',
      query: {
        token: client.apiToken,
        user: this.user.id
      }
    };

    if (this.user.deviceName) {
      options.query.device = this.user.deviceName;
    }

    return client
      .getTransport()
      .sendRequest(options)
      .then(() => {
        return true;
      });
  }
}

function validateUserOrGroup(user) {
  if (user instanceof User) {
    return;
  }

  if (user instanceof Group) {
    return;
  }

  throw new Error('Expecting type user or group');
}

export default VerifyUser;
