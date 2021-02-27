import apns2 from 'apns2';

import fs from 'fs';
import path from 'path';

import dmt from 'dmt/bridge';
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

async function notify(msg) {
  if (client) {
    const device = config.devices.find(d => d.admin);
    if (device) {
      const bn = new BasicNotification(device.token, msg);

      try {
        await client.send(bn);
      } catch (err) {
        log.red('⚠️  Push notification error:');
        log.red(err.reason);
      }
    }
  }
}

async function notifyAll(msg) {
  if (client) {
    const devices = config.devices.filter(device => device.active != false);
    const notifications = devices.map(({ token }) => new BasicNotification(token, msg));

    try {
      await client.sendMany(notifications);
    } catch (err) {
      log.red('⚠️  Push notification error:');
      log.red(err.reason);
    }
  }
}

export { notify, notifyAll };
