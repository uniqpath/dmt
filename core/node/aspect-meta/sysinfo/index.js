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
  let ticks = 0;

  program.on('slowtick', () => {
    if (dmt.isRPi()) {
      const sysinfo = {};

      Promise.all([usedSwapMemory(), getCPUInfo(), getCPUTemperature(), checkDiskSpace('/')]).then(([usedSwapPerc, cpuUsage, cpuTemp, diskSpace]) => {
        sysinfo.usedSwap = usedSwapPerc;

        if (dmt.isDevUser()) {
          if (usedSwapPerc >= 80) {
            if (!reportedHighSwap) {
              const msg = `🏗️⚠️ High swap usage: ${usedSwapPerc}%`;
              log.gray(msg);
              push.notify(msg);
              reportedHighSwap = true;
            }
          } else if (usedSwapPerc >= 50 && usedSwapPerc < 70) {
            if (!reportedGrowingSwap) {
              const msg = `🏗️⚠️ Rising swap usage: ${usedSwapPerc}%`;
              log.gray(msg);
              push.notify(msg);
              reportedGrowingSwap = true;
            }
          }
        }

        sysinfo.cpuUsage = cpuUsage.percentUsed;

        sysinfo.cpuTemp = cpuTemp;

        if (cpuTemp >= 80 && (!reportedVeryHighCpuTempAt || Date.now() - reportedVeryHighCpuTempAt > 3 * 60000)) {
          const msg = `⚠️ Very high cpu temperature: ${Math.round(cpuTemp)}°C`;
          log.gray(msg);
          push.notify(msg);

          reportedVeryHighCpuTempAt = Date.now();
        } else if (cpuTemp >= 70 && (!reportedHighCpuTempAt || Date.now() - reportedHighCpuTempAt > 3 * 60000)) {
          const msg = `High cpu temperature: ${Math.round(cpuTemp)}°C`;
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
          const msg = `⚠️ Low space: ${sysinfo.freeDiskSpace}`;
          log.gray(msg);
          push.notify(msg);

          reportedLowSpaceAt = Date.now();
        }

        program.store('sysinfo').set(sysinfo, { announce: false });

        ticks += 1;
      });
    }
  });
}

export { init, getCPUInfo, getCPUTemperature, usedSwapMemory, checkDiskSpace };
