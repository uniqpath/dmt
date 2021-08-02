import dmt from 'dmt/common';

import { push } from 'dmt/notify';

import { getCPUInfo, getCPUTemperature } from './lib/piInfo';

import { checkDiskSpace } from './lib/diskSpace';
import { usedSwapMemory } from './lib/usedSwapMemory';

let reportedSwap;

const { prettyFileSize } = dmt;

function init(program) {
  program.on('slowtick', () => {
    if (dmt.isRPi()) {
      const sysinfo = {};

      Promise.all([usedSwapMemory(), getCPUInfo(), getCPUTemperature(), checkDiskSpace('/')]).then(([usedSwapPerc, cpuUsage, cpuTemp, diskSpace]) => {
        sysinfo.usedSwap = usedSwapPerc;

        if (usedSwapPerc >= 80) {
          if (!reportedSwap) {
            const msg = `⚠️ high swap usage: ${usedSwapPerc}%`;
            push.notify(msg);
            reportedSwap = true;
          }
        }

        sysinfo.cpuUsage = cpuUsage.percentUsed;

        sysinfo.cpuTemp = cpuTemp;

        if (cpuTemp >= 70) {
          const very = cpuTemp >= 80 ? 'very ' : '';
          const msg = `⚠️ ${very}high cpu temperature: ${Math.round(cpuTemp)}°C`;
          push.notify(msg);
        }

        sysinfo.freeDiskSpace = prettyFileSize(diskSpace.free);
        sysinfo.totalDiskSpace = prettyFileSize(diskSpace.size);

        if (diskSpace.free < 100000000) {
          const msg = `⚠️ low space: ${sysinfo.freeDiskSpace}`;
          push.notify(msg);
        }

        program.store.update({ sysinfo }, { announce: false });
      });
    }
  });
}

export { init, getCPUInfo, getCPUTemperature, usedSwapMemory, checkDiskSpace };
