import Command from './Command';
import Group from '../Group';
import User from '../User';

class AddUserToGroup extends Command {
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
      url: `/groups/${this.group.id}/add_user.json`,
      query: {
        token: client.apiToken,
        user: this.user.id
      }
    };

    if (this.user.device) {
      options.query.device = this.user.device;
    }

    if (this.user.memo) {
      options.query.device = this.user.memo;
    }

    return client
      .getTransport()
      .sendRequest(options)
      .then(result => {
        return true;
      });
  }
}

export default AddUserToGroup;
