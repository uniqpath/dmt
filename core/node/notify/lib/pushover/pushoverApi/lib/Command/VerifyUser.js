import Group from '../Group.js';
import User from '../User.js';

export function verifyUser({ user, client }) {
  validateUserOrGroup(user);

  const options = {
    method: 'post',
    url: '/users/validate.json',
    query: {
      token: client.apiToken,
      user: user.id
    }
  };

  if (user.deviceName) {
    options.query.device = user.deviceName;
  }

  return client
    .getTransport()
    .sendRequest(options)
    .then(() => {
      return true;
    });
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
