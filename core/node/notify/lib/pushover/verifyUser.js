import { User } from './pushoverApi/index.js';
import getPushoverClient from './getPushoverClient.js';
import { getUserToken } from './pushoverDef.js';

const pushoverKeyPattern = /^[a-z0-9]{30}$/i;

export default function verifyUser(u) {
  const userKey = pushoverKeyPattern.test(u) ? u : getUserToken(u);

  if (!userKey) {
    throw new Error(`Cannot find user [ ${u} ] in pushover.def`);
  }

  return new Promise((success, reject) => {
    const client = getPushoverClient();
    client
      .verifyUser(new User(userKey))
      .then(() => {
        success({ success: true, msg: 'user is valid and is receiving messages' });
      })
      .catch(error => {
        const errorData = JSON.parse(error.message);
        success({ success: false, msg: JSON.stringify(errorData.data.errors, null, 2) });
      });
  });
}
