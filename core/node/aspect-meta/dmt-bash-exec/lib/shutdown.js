const colors = require('colors');

const dmt = require('dmt-bridge');
const { log } = dmt;

const { exec } = require('child_process');

const bashAction = '/sbin/shutdown -h now';

module.exports = ({ program }) => {
  program.store.persistState();

  log.yellow(`Executing bash action: ${colors.green(bashAction)} ...`);

  exec(bashAction, (error, stdout, stderr) => {
    if (error) {
      log.write(stdout);
      log.red(stderr);
    }
  });
};
