const os = require('os');

function system() {
  return {
    platform: os.platform(),
    release: os.release()
  };
}

module.exports = system;
