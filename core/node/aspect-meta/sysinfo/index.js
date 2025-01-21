import { push } from 'dmt/notify';

import RpiThrottled from 'rpi-throttled';

import { log, isRPi, isDevUser, prettyFileSize, colors } from 'dmt/common';

import { getCPUInfo, getCPUTemperature } from './lib/piInfo.js';

import { checkDiskSpace } from './lib/diskSpace.js';
import { usedSwapMemory } from './lib/usedSwapMemory.js';

let reportedGrowingSwap;
let reportedHighSwap;

let reportedHighCpuTempAt;
let reportedVeryHighCpuTempAt;

let highTempIntervals = 0;
let lowTempIntervals = 0;

let reportedLowSpaceAt;

const ONE_MINUTE = 60 * 1000;
const ONE_HOUR = 60 * ONE_MINUTE;

function underVoltageReportSpacing(underVoltageReportsCount) {
  if (underVoltageReportsCount == 1) {
    return ONE_HOUR;
  }

  if (underVoltageReportsCount == 2) {
    return 3 * ONE_HOUR;
  }

  if (underVoltageReportsCount == 3) {
    return 12 * ONE_HOUR;
  }

  return 72 * ONE_HOUR;
}

function checkAndNotifyTemperature(cpuTemp, cpuUsage) {
  if (cpuTemp >= 70.5) {
    highTempIntervals += 1;
    lowTempIntervals = 0;
  } else {
    lowTempIntervals += 1;
    highTempIntervals = 0;
  }

  let comment = '';

  if (cpuUsage <= 40) {
    comment = "(doesn't explain high temperature, is device covered with something or is environment too hot?)";
  }

  if (cpuTemp >= 80 && highTempIntervals > 2 && (!reportedVeryHighCpuTempAt || Date.now() - reportedVeryHighCpuTempAt > 5 * ONE_HOUR)) {
    const msg = `🥵 Very high cpu temperature: ${Math.round(cpuTemp)}°C, cpu usage: ${cpuUsage}% ${comment}`;
    log.gray(msg);
    push.notify(msg);

    reportedVeryHighCpuTempAt = Date.now();
  } else if (cpuTemp >= 70 && highTempIntervals > 2 && (!reportedHighCpuTempAt || Date.now() - reportedHighCpuTempAt > 5 * ONE_HOUR)) {
    const msg = `🌡️ High cpu temperature: ${Math.round(cpuTemp)}°C, cpu usage: ${cpuUsage}% ${comment}`;
    log.gray(msg);
    push.notify(msg);

    reportedHighCpuTempAt = Date.now();
  } else if (cpuTemp < 70 && lowTempIntervals > 4 && (reportedHighCpuTempAt || reportedVeryHighCpuTempAt)) {
    reportedHighCpuTempAt = undefined;
    reportedVeryHighCpuTempAt = undefined;

    const msg = `✓ cpu temperature dropped to ${Math.round(cpuTemp)}°C, cpu usage: ${cpuUsage}%`;
    log.gray(msg);
    push.notify(msg);
  }
}

function init(program) {
  if (isRPi()) {
    let underVoltageReportsCount = 0;

    let lastUnderVoltageReport;
    const rpi = new RpiThrottled();
    rpi.on('updated', () => {
      if (rpi.underVoltage) {
        let msg = '⚡ RPi under voltage detected';
        if (underVoltageReportsCount >= 3) {
          msg = `${msg} - replace power supply or check usb cable - now switching to reporting less frequently`;
        }

        log.red(msg);
        push.notify(msg);
        program.nearbyNotification({ msg, color: '#D17357', ttl: 180, dev: true });

        underVoltageReportsCount += 1;
        lastUnderVoltageReport = Date.now();
      }
    });

    program.on('tick', () => {
      getCPUInfo().then(cpuUsage => {
        program.slot('device').update({ cpuUsage: cpuUsage.percentUsed }, { announce: false });
      });

      if (isDevUser() && (!lastUnderVoltageReport || Date.now() - lastUnderVoltageReport > underVoltageReportSpacing(underVoltageReportsCount))) {
        rpi.update();
      }
    });

    program.on('slowtick', () => {
      const sysinfo = {};

      Promise.all([usedSwapMemory(), getCPUInfo(), getCPUTemperature(), checkDiskSpace('/')]).then(([usedSwapPerc, cpuUsage, cpuTemp, diskSpace]) => {
        sysinfo.usedSwap = usedSwapPerc;

        if (isDevUser()) {
          if (usedSwapPerc >= 80) {
            if (!reportedHighSwap) {
              const msg = `🏗️⚠️  High swap usage: ${usedSwapPerc}%`;
              log.gray(msg);
              push.notify(msg);
              reportedHighSwap = true;
            }
          } else if (usedSwapPerc >= 50 && usedSwapPerc < 70) {
            if (!reportedGrowingSwap) {
              const msg = `🏗️⚠️  Rising swap usage: ${usedSwapPerc}%`;
              log.gray(msg);
              reportedGrowingSwap = true;
            }
          }
        }

        sysinfo.cpuUsage = cpuUsage.percentUsed;

        if (isDevUser()) {
        }

        sysinfo.cpuTemp = cpuTemp;

        program.slot('device').update({ cpuTemp: Math.round(cpuTemp) }, { announce: false });

        checkAndNotifyTemperature(cpuTemp, cpuUsage.percentUsed);

        sysinfo.freeDiskSpace = prettyFileSize(diskSpace.free);
        sysinfo.totalDiskSpace = prettyFileSize(diskSpace.size);

        if (diskSpace.free < 100000000 && (!reportedLowSpaceAt || Date.now() - reportedLowSpaceAt > ONE_HOUR)) {
          const msg = `⚠️  Low space: ${sysinfo.freeDiskSpace}`;
          log.gray(msg);
          push.notify(msg);

          reportedLowSpaceAt = Date.now();
        }

        program.slot('sysinfo').set(sysinfo, { announce: false });
      });
    });
  }
}

export { init, getCPUInfo, getCPUTemperature, usedSwapMemory, checkDiskSpace };
