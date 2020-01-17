const path = require('path');
const colors = require('colors');

const dmt = require('dmt-bridge');
const { log } = dmt;

const { exec } = require('child_process');

module.exports = ({ scriptsPath }) => {
  const bashAction = 'dmt_next';

  exec(path.join(scriptsPath, bashAction), (error, stdout, stderr) => {
    if (error) {
      log.write(stdout);
      log.red(stderr);
    } else {
      log.yellow(`Successfully executed bash action: ${colors.green(bashAction)}`);
    }
  });
};
