const dmt = require('dmt-bridge');
const { scan } = dmt;
const path = require('path');
const fs = require('fs');
const os = require('os');

function osData(data) {
  Object.assign(data, {
    osPlatform: os.platform(),
    osRelease: os.release()
  });

  const rpiInfoFile = '/etc/os-release';
  if (fs.existsSync(rpiInfoFile)) {
    const info = scan.readFileLines(rpiInfoFile);
    data.osInfo = info;
  }
}

function nodeVersion(data) {
  data.nodeVersion = process.version;
}

function dmtVersion(data) {
  const versionFile = path.join(dmt.dmtPath, '.version');
  if (fs.existsSync(versionFile)) {
    const version = fs
      .readFileSync(versionFile)
      .toString()
      .trim();
    data.dmtVersion = version;
  }
}

function debugInfo(data) {
  if (dmt.debugMode()) {
    data.debugMode = true;
  }

  if (dmt.isDevMachine()) {
    data.devMachine = true;
  }

  if (dmt.isDevCluster()) {
    data.devCluster = true;
  }
}

function programSideStore({ program, data }) {
  data.wifiSegment = '';

  const { sideStore } = program;

  if (!sideStore) {
    return;
  }

  if (sideStore.wifiSegment) {
    data.wifiSegment = sideStore.wifiSegment;
  }
}

function systemOnce() {
  const data = {};

  osData(data);
  nodeVersion(data);
  dmtVersion(data);
  debugInfo(data);

  return data;
}

function systemPeriodic(program) {
  const data = {};

  programSideStore({ program, data });

  return data;
}

module.exports = { systemOnce, systemPeriodic };
