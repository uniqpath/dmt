import { log, prettyFileSize, formatDuration } from 'dmt/common';

import { usedSwapMemory, getCPUInfo, getCPUTemperature, checkDiskSpace } from 'dmt/sysinfo';

export function getStats() {
  return new Promise((success, reject) => {
    Promise.all([usedSwapMemory(), getCPUInfo(), getCPUTemperature(), checkDiskSpace('/')]).then(([usedSwapPerc, cpuUsage, cpuTemp, diskSpace]) => {
      success({
        usedSwap: `${usedSwapPerc}%`,
        cpuUsage: `${cpuUsage.percentUsed}%`,
        cpuTemp: `${Math.round(cpuTemp)}°C`,
        diskSpace: prettyFileSize(diskSpace.free)
      });
    });
  });
}
export function logStats() {
  getStats().then(({ usedSwap, cpuUsage, cpuTemp, diskSpace }) => {
    log.cyan(`swap usage: ${usedSwap}`);
    log.cyan(`cpu usage: ${cpuUsage}`);
    log.cyan(`free space on main partition: ${diskSpace}`);
    log.cyan(`cpu temperature: ${cpuTemp}`);
  });
}

export function reportRecentStats(statsArray) {
  const now = Date.now();

  log.white(
    JSON.stringify(
      statsArray.reverse().map(entry => {
        return { ...entry, when: `${formatDuration(now - entry.createdAt)} ago`, createdAt: undefined };
      }),
      null,
      2
    )
  );
}
