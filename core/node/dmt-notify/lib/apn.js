const fs = require('fs');
const path = require('path');
const moment = require('moment');
const dmt = require('dmt-bridge');
const { log } = dmt;

const stripColor = require('strip-color');

const apn = require('apn');

const apnConfigDir = path.join(dmt.accessTokensDir, 'apple_push');

const configFile = path.join(apnConfigDir, 'config.json');

if (!fs.existsSync(configFile)) {
  module.exports = {
    notify(msg, onFinishedCallback) {
      if (onFinishedCallback) {
        onFinishedCallback();
      }
    },
    notifyAll(msg) {}
  };

  return;
}

const config = require(configFile);

const serverAuth = config.server_auth;
if (serverAuth) {
  serverAuth.token.key = path.join(apnConfigDir, serverAuth.token.key);
}

const apnOptions = {
  token: serverAuth.token,
  production: true
};

function createNote(msg) {
  const note = new apn.Notification();

  note.expiry = Math.floor(Date.now() / 1000) + 3600;
  note.badge = 3;
  note.sound = 'ping.aiff';
  note.alert = `${moment().format('HH:mm')} ${msg}`;
  note.payload = { messageFrom: 'Notifier333' };
  note.topic = serverAuth.topic;

  return note;
}

module.exports = {
  notifyAll(msg) {
    const note = createNote(msg);

    const apnProvider = new apn.Provider(apnOptions);

    for (const device of config.devices) {
      apnProvider.send(note, device.token).then(result => {});
    }
    apnProvider.shutdown();
  },

  sendAdminRaw(msg) {
    return new Promise((success, reject) => {
      const note = createNote(msg);
      const device = config.devices.find(d => d.admin);
      if (device) {
        const apnProvider = new apn.Provider(apnOptions);
        apnProvider.send(note, device.token).then(result => {
          if (result.failed.length == 0) {
            success(result);
          } else {
            reject(result);
          }
        });
      } else {
        reject(new Error('No defined admin device'));
      }
    });
  },

  notify(msg, onFinishedCallback) {
    module.exports
      .sendAdminRaw(msg)
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
};

if (require.main === module) {
  const colors = require('colors');

  const args = process.argv.slice(2);

  (async () => {
    if (args.length == 0) {
      var readline = require('readline');
      var rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        terminal: false
      });

      const buffer = [];

      rl.on('line', function(line) {
        if (line.trim() != '') {
          buffer.push(line);
        }
      });

      rl.on('close', function() {
        if (buffer.length > 0) {
          module.exports
            .sendAdminRaw(stripColor(buffer.join(' / ')))
            .then(result => {
              log.write(colors.green('Push message sent'));
              process.exit();
            })
            .catch(error => {
              log.write(colors.red('Problem sending the push message:'));
              console.log(error);
            });
        } else {
          log.write(colors.red('Arguments not given and nothing piped on stdin'));
        }
      });

      return;
    }

    module.exports
      .sendAdminRaw(args[0])
      .then(result => {
        log.write(colors.green('Push message sent'));
        process.exit();
      })
      .catch(error => {
        log.write(colors.red('Problem sending the push message:'));
        console.log(error);
      });
  })();
}
