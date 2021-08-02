import Command from './Command';
import Group from '../Group';

class RenameGroup extends Command {
  constructor(group, name) {
    super();

    Group.validateGroup(group);

    this.group = group;
    this.name = name;
  }

  invoke(client) {
    let options = {
      method: 'post',
      url: `/groups/${this.group.id}/rename.json`,
      query: {
        token: client.apiToken,
        name: this.name
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

export default RenameGroup;
