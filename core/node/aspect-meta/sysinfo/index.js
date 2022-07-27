import { push } from 'dmt/notify';

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

function init(program) {
  if (isRPi()) {
    program.on('tick', () => {
      getCPUInfo().then(cpuUsage => {
        program.slot('device').update({ cpuUsage: cpuUsage.percentUsed }, { announce: false });
      });
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

        if (cpuTemp >= 70) {
          highTempIntervals += 1;
          lowTempIntervals = 0;
        } else {
          lowTempIntervals += 1;
          highTempIntervals = 0;
        }

        let comment = '';

        if (cpuUsage.percentUsed <= 40) {
          comment = "(doesn't explain high temperature, is device covered with something or is environment too hot?)";
        }

        if (cpuTemp >= 80 && highTempIntervals > 2 && (!reportedVeryHighCpuTempAt || Date.now() - reportedVeryHighCpuTempAt > 5 * ONE_HOUR)) {
          const msg = `🥵 Very high cpu temperature: ${Math.round(cpuTemp)}°C, cpu usage: ${cpuUsage.percentUsed}% ${comment}`;
          log.gray(msg);
          push.notify(msg);

          reportedVeryHighCpuTempAt = Date.now();
        } else if (cpuTemp >= 70 && highTempIntervals > 2 && (!reportedHighCpuTempAt || Date.now() - reportedHighCpuTempAt > 5 * ONE_HOUR)) {
          const msg = `🌡️ High cpu temperature: ${Math.round(cpuTemp)}°C, cpu usage: ${cpuUsage.percentUsed}% ${comment}`;
          log.gray(msg);
          push.notify(msg);

          reportedHighCpuTempAt = Date.now();
        } else if (cpuTemp < 70 && lowTempIntervals > 4 && (reportedHighCpuTempAt || reportedVeryHighCpuTempAt)) {
          reportedHighCpuTempAt = undefined;
          reportedVeryHighCpuTempAt = undefined;

          const msg = `✓ cpu temperature dropped to ${Math.round(cpuTemp)}°C, cpu usage: ${cpuUsage.percentUsed}%`;
          log.gray(msg);
          push.notify(msg);
        }
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
