import apns2 from 'apns2';

import fs from 'fs';
import path from 'path';

import { log, dateFns, accessTokensDir, deviceGeneralIdentifier, colors, isRPi, isLanServer } from 'dmt/common';

const { format } = dateFns;

const { ApnsClient, Notification } = apns2;

const apnConfigDir = path.join(accessTokensDir, 'apple_push');

const configFile = path.join(apnConfigDir, 'config.json');

let client;
let config;

if (fs.existsSync(configFile)) {
  config = JSON.parse(fs.readFileSync(configFile));

  const { server_auth } = config;
  const { token } = server_auth;

  client = new ApnsClient({
    requestTimeout: 2000,
    team: token.teamId,
    keyId: token.keyId,
    signingKey: fs.readFileSync(path.join(apnConfigDir, token.key)),
    defaultTopic: server_auth.topic
  });
}

function notify(program, msg, { users = null, originDevice = undefined } = {}) {
  return new Promise((success, reject) => {
    if (program && isRPi() && !isLanServer() && program.lanServerNearby()) {
      program.nearbyProxyApnMsgViaLanServer({ msg, users });
      success();
      return;
    }

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
        notifyDevices(
          program,
          msg,
          devices.map(({ token }) => token),
          originDevice
        )
          .then(success)
          .catch(reject);
      }
    }
  });
}

function notifyDevices(program, msg, tokens, originDevice) {
  return new Promise((success, reject) => {
    if (client) {
      const deviceName = originDevice || deviceGeneralIdentifier();

      const networkName = program?.network.name();

      msg = `🌀 ${deviceName}${networkName ? ` @ ${networkName}` : ''} — ${msg}`;

      const notifications = tokens.map(token => new Notification(token, { alert: msg }));

      Promise.all(
        notifications.map(notification => {
          return new Promise((success, reject) => {
            client
              .send(notification)
              .then(success)
              .catch(e => {
                log.red(`⚠️  Push notification ${colors.gray(msg)} to ${notification.deviceToken} error:`);
                log.red(e);
                success();
              });
          });
        })
      ).then(success);
    }
  });
}

async function notifyAll(program, msg) {
  if (client) {
    const devices = config.devices.filter(device => device.active != false);
    await notifyDevices(
      program,
      msg,
      devices.map(({ token }) => token)
    );
  }
}

export { notify, notifyAll };
