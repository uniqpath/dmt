import apns2 from 'apns2';

import fs from 'fs';
import path from 'path';

import dmt from 'dmt/common';
const { log } = dmt;

const { format } = dmt.dateFns;

const { APNS, BasicNotification } = apns2;

const apnConfigDir = path.join(dmt.accessTokensDir, 'apple_push');

const configFile = path.join(apnConfigDir, 'config.json');

let client;
let config;

if (fs.existsSync(configFile)) {
  config = JSON.parse(fs.readFileSync(configFile));

  const { server_auth } = config;
  const { token } = server_auth;

  client = new APNS({
    team: token.teamId,
    keyId: token.keyId,
    signingKey: fs.readFileSync(path.join(apnConfigDir, token.key)),
    defaultTopic: server_auth.topic
  });
}

async function notify(msg, { users = null } = {}) {
  if (client) {
    let devices;

    if (users) {
      users = users.map(user => user.toLowerCase());
      devices = config.devices.filter(d => users.includes(d.name.toLowerCase()));
    } else {
      devices = config.devices.filter(d => d.admin);
    }

    devices = devices.filter(device => device.active != false);

    if (devices.length > 0) {
      await notifyDevices(
        msg,
        devices.map(({ token }) => token)
      );
    }
  }
}

async function notifyDevices(msg, tokens) {
  if (client) {
    const notifications = tokens.map(token => new BasicNotification(token, msg));

    try {
      await client.sendMany(notifications);
    } catch (err) {
      log.red('⚠️  Push notification error:');
      log.red(err.reason);
    }
  }
}

async function notifyAll(msg) {
  if (client) {
    const devices = config.devices.filter(device => device.active != false);
    await notifyDevices(
      msg,
      devices.map(({ token }) => token)
    );
  }
}

export { notify, notifyAll };
