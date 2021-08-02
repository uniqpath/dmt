import fs from 'fs';

var memInfo = {};
var currentCPUInfo = { total: 0, active: 0 };
var lastCPUInfo = { total: 0, active: 0 };

function getValFromLine(line) {
  var match = line.match(/[0-9]+/gi);
  if (match !== null) return parseInt(match[0]);
  else return null;
}

function getMemoryInfo(cb) {
  fs.readFile('/proc/meminfo', 'utf8', function(err, data) {
    if (err) {
      cb(err);
      return;
    }
    var lines = data.split('\n');
    memInfo.total = Math.floor(getValFromLine(lines[0]) / 1024);
    memInfo.free = Math.floor(getValFromLine(lines[1]) / 1024);
    memInfo.cached = Math.floor(getValFromLine(lines[3]) / 1024);
    memInfo.used = memInfo.total - memInfo.free;
    memInfo.percentUsed = Math.ceil(((memInfo.used - memInfo.cached) / memInfo.total) * 100);

    cb(null, memInfo);
  });
}

function calculateCPUPercentage(oldVals, newVals) {
  const totalDiff = newVals.total - oldVals.total;
  const activeDiff = newVals.active - oldVals.active;
  return Math.ceil((activeDiff / totalDiff) * 100);
}

function getCPUInfo() {
  return new Promise((success, reject) => {
    lastCPUInfo.active = currentCPUInfo.active;
    lastCPUInfo.idle = currentCPUInfo.idle;
    lastCPUInfo.total = currentCPUInfo.total;

    fs.readFile('/proc/stat', 'utf8', (err, data) => {
      if (err) {
        reject(err);
        return;
      }
      const lines = data.split('\n');
      const cpuTimes = lines[0].match(/[0-9]+/gi);
      currentCPUInfo.total = 0;
      currentCPUInfo.idle = parseInt(cpuTimes[3]) + parseInt(cpuTimes[4]);
      for (let i = 0; i < cpuTimes.length; i++) {
        currentCPUInfo.total += parseInt(cpuTimes[i]);
      }
      currentCPUInfo.active = currentCPUInfo.total - currentCPUInfo.idle;
      currentCPUInfo.percentUsed = calculateCPUPercentage(lastCPUInfo, currentCPUInfo);

      success(currentCPUInfo);
    });
  });
}

function getCPUTemperature() {
  return new Promise((success, reject) => {
    const temp = fs.readFileSync('/sys/class/thermal/thermal_zone0/temp');
    success(temp / 1000);
  });
}

export { getCPUInfo, getCPUTemperature };
