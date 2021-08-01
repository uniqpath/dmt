import Command from './Command';
import Group from '../Group';
import User from '../User';

class RemoveUserFromGroup extends Command {
  constructor(user, group) {
    super();

    User.validateUser(user);
    Group.validateGroup(group);

    this.user = user;
    this.group = group;
  }

  invoke(client) {
    const options = {
      method: 'post',
      url: `/groups/${this.group.id}/delete_user.json`,
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

export default RemoveUserFromGroup;
