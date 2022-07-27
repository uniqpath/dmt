import Command from './Command.js';
import Group from '../Group.js';
import User from '../User.js';

class DisableGroupUser extends Command {
  constructor(user, group) {
    super();

    User.validateUser(user);
    Group.validateGroup(group);

    this.user = user;
    this.group = group;
  }

  invoke(client) {
    let options = {
      method: 'post',
      url: `/groups/${this.group.id}/disable_user.json`,
      query: {
        token: client.apiToken,
        user: this.user.id
      }
    };

    return client
      .getTransport()
      .sendRequest(options)
      .then(result => {
        return true;
      });
  }
}

export default DisableGroupUser;
