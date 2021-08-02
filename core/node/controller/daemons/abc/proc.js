import colors from 'colors';
import os from 'os';

import dmt from 'dmt/common';
const { log, prettyFileSize } = dmt;

import { usedSwapMemory, getCPUInfo, getCPUTemperature, checkDiskSpace } from 'dmt/sysinfo';

import { push } from 'dmt/notify';

import startDMT from './startDMT';
import abcTerminator from './abcTerminator';

const BOOT_LIMIT_SECONDS = 40;

function notify(msg) {
  return push.notify(`🕵️‍♂️ ABC: ${msg}`);
}

const startedAt = Date.now();

const abcVersion = dmt.abcVersion();

let reportedStoppingAt;

function logStats() {
  log.magenta('Memory usage:');
  log.cyan(process.memoryUsage());

  if (dmt.isRPi()) {
    Promise.all([usedSwapMemory(), getCPUInfo(), getCPUTemperature(), checkDiskSpace('/')]).then(([usedSwapPerc, cpuUsage, cpuTemp, diskSpace]) => {
      log.cyan(`swap usage: ${usedSwapPerc}%`);
      log.cyan(`cpu usage: ${cpuUsage.percentUsed}%`);
      log.cyan(`free space on main partition: ${prettyFileSize(diskSpace.free)}`);
      log.cyan(`cpu temperature: ${Math.round(cpuTemp)}°C`);
    });
  }
}

export default function init() {
  const ser = new dmt.ipc();

  ser.listen({ path: dmt.abcSocket }, e => {
    if (e) throw e;

    abcTerminator(ser, startedAt, notify);

    log.green(`🕵️‍♂️  ABC process started and listening on ${colors.gray(dmt.abcSocket)}`);
    if (os.uptime() < BOOT_LIMIT_SECONDS) {
      log.green(`📟 ${dmt.device().id} BOOTED`);
    }
  });

  ser.on('init', ({ pid }) => {
    const uptime = dmt.prettyTimeAge(startedAt).replace(' ago', '');

    log.gray(`New dmt-proc is running with pid ${colors.cyan(pid)}`);

    ser.emit('/init_response', { abcVersion, uptime });
  });

  ser.on('/dmt_message', ({ message }) => {
    log.cyan(`DMT MESSAGE: ${message}`);
    if (message == 'stopping') {
      reportedStoppingAt = Date.now();
    }
  });

  ser.on('connect', () => {
    log.magenta('New dmt-proc just connected');
  });

  ser.on('disconnect', () => {
    if (!reportedStoppingAt || Date.now() - reportedStoppingAt > 2000) {
      const msg = '🛑 DMT process crashed or got killed';
      log.red(msg);

      if (dmt.isDevMachine()) {
        log.cyan('(not spawning a new dmt-proc on dev machine)');
      } else {
        const msg2 = '✨ Spawning a new dmt-proc ...';
        log.magenta(msg2);

        setTimeout(() => {
          startDMT(notify);
        }, 1000);

        notify(msg).then(() => {
          notify(msg2);
        });
      }

      logStats();
    }
  });

  ser.on('error', e => {
    log.red('ABC IPC communication error occurred:');
    log.red(e);
    process.exit();
  });

  process.on('SIGINT', signal => {
    ser.close();
    console.log('IPC Server closed');
    process.exit(0);
  });

  process.on('SIGTERM', signal => {
    ser.close();
    console.log('IPC Server closed');
    process.exit(0);
  });
}
