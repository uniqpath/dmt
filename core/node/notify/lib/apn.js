import colors from 'colors';
import fs from 'fs';
import path from 'path';
import dates from 'date-fns';
import apn from 'apn';

import dmt from 'dmt/bridge';
const { log } = dmt;

const apnConfigDir = path.join(dmt.accessTokensDir, 'apple_push');

const configFile = path.join(apnConfigDir, 'config.json');

let config;
let serverAuth;
let apnOptions;

if (fs.existsSync(configFile)) {
  config = JSON.parse(fs.readFileSync(configFile));

  serverAuth = config.server_auth;
  if (serverAuth) {
    serverAuth.token.key = path.join(apnConfigDir, serverAuth.token.key);
  }

  apnOptions = {
    token: serverAuth.token,
    production: true
  };
}

function createNote(msg) {
  const note = new apn.Notification();

  note.expiry = Math.floor(Date.now() / 1000) + 3600;
  note.badge = 3;
  note.sound = 'ping.aiff';
  note.alert = `${dates.format(new Date(), 'HH:mm')} ${msg}`;
  note.payload = { messageFrom: 'Notifier333' };
  note.topic = serverAuth.topic;

  return note;
}

export { notify, notifyAll, sendAdminRaw };

function notifyAll(msg) {
  if (!config) {
    return;
  }

  const note = createNote(msg);

  const apnProvider = new apn.Provider(apnOptions);

  for (const device of config.devices) {
    apnProvider.send(note, device.token).then(result => {});
  }

  apnProvider.shutdown();
}

function sendAdminRaw(msg) {
  return new Promise((success, reject) => {
    const note = createNote(msg);
    const device = config.devices.find(d => d.admin);
    if (device) {
      const apnProvider = new apn.Provider(apnOptions);
      apnProvider.send(note, device.token).then(result => {
        if (result.failed.length == 0) {
          success(result);
          apnProvider.shutdown();
        } else {
          reject(result);
          apnProvider.shutdown();
        }
      });
    } else {
      reject(new Error('No defined admin device'));
    }
  });
}

function notify(msg, onFinishedCallback) {
  if (!config) {
    if (onFinishedCallback) {
      onFinishedCallback();
    }
    return;
  }

  sendAdminRaw(msg)
    .then(result => {
      if (onFinishedCallback) {
        onFinishedCallback({ result });
      }
    })
    .catch(error => {
      log.write(colors.red('Problem sending the push message:'));
      console.log(JSON.stringify(error, null, 2));
      if (onFinishedCallback) {
        onFinishedCallback({ error });
      }
    });
}
