import dmt from 'dmt/common';

import { push } from 'dmt/notify';

const { log } = dmt;

import { getCPUInfo, getCPUTemperature } from './lib/piInfo';

import { checkDiskSpace } from './lib/diskSpace';
import { usedSwapMemory } from './lib/usedSwapMemory';

let reportedGrowingSwap;
let reportedHighSwap;

let reportedHighCpuTempAt;
let reportedVeryHighCpuTempAt;

let reportedLowSpaceAt;

const { prettyFileSize } = dmt;

function init(program) {
  program.on('slowtick', () => {
    if (dmt.isRPi()) {
      const sysinfo = {};

      Promise.all([usedSwapMemory(), getCPUInfo(), getCPUTemperature(), checkDiskSpace('/')]).then(([usedSwapPerc, cpuUsage, cpuTemp, diskSpace]) => {
        sysinfo.usedSwap = usedSwapPerc;

        if (dmt.isDevCluster()) {
          if (usedSwapPerc >= 80) {
            if (!reportedHighSwap) {
              const msg = `⚠️ DEV high swap usage: ${usedSwapPerc}%`;
              log.gray(msg);
              push.notify(msg);
              reportedHighSwap = true;
            }
          } else if (usedSwapPerc >= 50 && usedSwapPerc < 70) {
            if (!reportedGrowingSwap) {
              const msg = `⚠️ DEV rising swap usage: ${usedSwapPerc}%`;
              log.gray(msg);
              push.notify(msg);
              reportedGrowingSwap = true;
            }
          }
        }

        sysinfo.cpuUsage = cpuUsage.percentUsed;

        if (dmt.isDevCluster() && sysinfo.cpuUsage >= 80) {
          const msg = `⚠️ DEV high cpu usage: ${sysinfo.cpuUsage}%`;
          push.notify(msg);
        }

        sysinfo.cpuTemp = cpuTemp;

        if (cpuTemp >= 80 && (!reportedVeryHighCpuTempAt || Date.now() - reportedVeryHighCpuTempAt > 3 * 60000)) {
          const msg = `⚠️ very high cpu temperature: ${Math.round(cpuTemp)}°C`;
          log.gray(msg);
          push.notify(msg);

          reportedVeryHighCpuTempAt = Date.now();
        } else if (cpuTemp >= 70 && (!reportedHighCpuTempAt || Date.now() - reportedHighCpuTempAt > 3 * 60000)) {
          const msg = `⚠️ high cpu temperature: ${Math.round(cpuTemp)}°C`;
          log.gray(msg);
          push.notify(msg);

          reportedHighCpuTempAt = Date.now();
        } else if (
          cpuTemp <= 60 &&
          ((reportedHighCpuTempAt && Date.now() - reportedHighCpuTempAt < 10 * 60000) ||
            (reportedVeryHighCpuTempAt && Date.now() - reportedVeryHighCpuTempAt < 10 * 60000))
        ) {
          reportedHighCpuTempAt = undefined;
          reportedVeryHighCpuTempAt = undefined;

          const msg = `✓ cpu temperature dropped to ${Math.round(cpuTemp)}°C`;
          log.gray(msg);
          push.notify(msg);
        }
        sysinfo.freeDiskSpace = prettyFileSize(diskSpace.free);
        sysinfo.totalDiskSpace = prettyFileSize(diskSpace.size);

        if (diskSpace.free < 100000000 && (!reportedLowSpaceAt || Date.now() - reportedLowSpaceAt > 60 * 60000)) {
          const msg = `⚠️ low space: ${sysinfo.freeDiskSpace}`;
          log.gray(msg);
          push.notify(msg);

          reportedLowSpaceAt = Date.now();
        }

        program.store('sysinfo').set(sysinfo, { announce: false });
      });
    }
  });
}

export { init, getCPUInfo, getCPUTemperature, usedSwapMemory, checkDiskSpace };
