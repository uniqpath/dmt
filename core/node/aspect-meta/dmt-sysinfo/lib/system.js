const dmt = require('dmt-bridge');
const { scan } = dmt;
const path = require('path');
const fs = require('fs');
const os = require('os');

function system() {
  const data = {};

  const versionFile = path.join(dmt.dmtPath, '.version');
  if (fs.existsSync(versionFile)) {
    const version = fs
      .readFileSync(versionFile)
      .toString()
      .trim();
    data.dmtVersion = version;
  }

  data.nodeVersion = process.version;

  Object.assign(data, {
    osPlatform: os.platform(),
    osRelease: os.release()
  });

  const rpiInfoFile = '/etc/os-release';
  if (fs.existsSync(rpiInfoFile)) {
    const info = scan.readFileLines(rpiInfoFile);
    data.osInfo = info;
  }

  return data;
}

module.exports = system;
