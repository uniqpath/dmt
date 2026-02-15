import Command from './Command.js';
import Group from '../Group.js';
import User from '../User.js';

class GetGroupDetails extends Command {
  constructor(group) {
    super();

    Group.validateGroup(group);

    this.group = group;
  }

  invoke(client) {
    let options = {
      method: 'get',
      url: `/groups/${this.group.id}.json`,
      query: {
        token: client.apiToken
      }
    };

    return client
      .getTransport()
      .sendRequest(options)
      .then(result => {
        let group = new Group(this.group.id);
        group.name = result.name;
        group.users = [];

        for (let i of result.users) {
          let user = new User(i.user, i.device);
          user.memo = i.memo;
          user.disabled = i.disabled;

          group.users.push(user);
        }

        return group;
      });
  }
}

export default GetGroupDetails;
