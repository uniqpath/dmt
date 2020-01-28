const fs = require('fs');
const dmt = require('dmt-bridge');
const { textfileParsers } = dmt;
const { textfileKeyValueParser } = textfileParsers;

const { exec } = require('child_process');

const executable = '/System/Library/PrivateFrameworks/Apple80211.framework/Versions/Current/Resources/airport';

const bashAction = `${executable} -I`;

module.exports = () => {
  return new Promise((success, reject) => {
    if (!fs.existsSync(executable)) {
      reject(new Error(`${executable} is missing`));
      return;
    }

    exec(bashAction, (error, stdout, stderr) => {
      if (error) {
        reject(error);
        return;
      }

      const keys = 'BSSID';
      const keyMap = { BSSID: 'bssid' };
      const result = textfileKeyValueParser({ content: stdout, keys, keyMap, delimiter: ':' });
      success(result);
    });
  });
};

if (require.main === module) {
  module.exports().then(console.log);
}
