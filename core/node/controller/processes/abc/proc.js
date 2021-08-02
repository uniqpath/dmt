import colors from 'colors';
import os from 'os';

import dmt from 'dmt/common';
const { log, prettyFileSize } = dmt;

import { usedSwapMemory, getCPUInfo, getCPUTemperature, checkDiskSpace } from 'dmt/sysinfo';

import { push } from 'dmt/notify';

import startDMT from './startDMT';
import abcTerminator from './abcTerminator';

const BOOT_LIMIT_SECONDS = 40;

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

    abcTerminator(ser, startedAt);

    log.green(`🔦ABC process started and listening on ${colors.gray(dmt.abcSocket)}`);
    if (os.uptime() < BOOT_LIMIT_SECONDS) {
      log.green(`📟 ${dmt.device().id} BOOTED`);
    }
  });

  ser.on('init', ({ pid, networkId }, socket) => {
    log.magenta('New dmt-proc just connected');
    socket.dmt = true;

    const uptime = dmt.prettyTimeAge(startedAt).replace(' ago', '');

    push.initABC(networkId);

    log.gray(`New dmt-proc is running with pid ${colors.cyan(pid)}`);

    ser.emit('/init_response', { abcVersion, uptime });
  });

  ser.on('/dmt_message', ({ message, context }) => {
    if (context == 'set_network') {
      const networkId = message;
      push.initABC(networkId);
    } else {
      log.cyan(`DMT MESSAGE: ${message}`);
      if (message == 'stopping') {
        reportedStoppingAt = Date.now();
      }
    }
  });

  ser.on('connect', socket => {});

  ser.on('disconnect', socket => {
    if ((socket.dmt && !reportedStoppingAt) || Date.now() - reportedStoppingAt > 2000) {
      const msg = '🛑 DMT process killed or crashed';
      log.red(msg);

      if (dmt.isDevMachine() || dmt.isMainDevice()) {
        log.cyan('(not spawning a new dmt-proc because this is dev or main device)');
      } else {
        const msg2 = '✨ Spawning new DMT process …';
        log.magenta(msg2);

        setTimeout(() => {
          startDMT();
        }, 1000);

        push.notify(msg).then(() => {
          push.notify(msg2);
        });
      }

      logStats();
    }
  });

  ser.on('error', e => {
    log.red('ABC IPC communication error occurred:');
    log.red(e);
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
