import os from 'os';

import {
  log,
  prettyFileSize,
  colors,
  abcVersion as _abcVersion,
  loop,
  isRPi,
  ipc,
  abcSocket,
  device,
  prettyTimeAge,
  isDevMachine,
  isMainDevice
} from 'dmt/common';

import { usedSwapMemory, getCPUInfo, getCPUTemperature, checkDiskSpace } from 'dmt/sysinfo';

import { push, apn, desktop } from 'dmt/notify';

import startDMT from './startDMT';
import abcTerminator from './abcTerminator';

const BOOT_LIMIT_SECONDS = 60;

const startedAt = Date.now();

const abcVersion = _abcVersion();

let reportedStoppingAt;

let dmtProcConnectedAt;
let dmtProcCrashLoopedAt;
let dmtProcNextWarningAfterCrashLoopAt;

let dmtProcCrashedInForegroundAt;

let dmtForeground;

const MAX_CRASHES = 3;
const crashTimestamps = [];

function logStats() {
  if (isRPi()) {
    Promise.all([usedSwapMemory(), getCPUInfo(), getCPUTemperature(), checkDiskSpace('/')]).then(([usedSwapPerc, cpuUsage, cpuTemp, diskSpace]) => {
      log.cyan(`swap usage: ${usedSwapPerc}%`);
      log.cyan(`cpu usage: ${cpuUsage.percentUsed}%`);
      log.cyan(`free space on main partition: ${prettyFileSize(diskSpace.free)}`);
      log.cyan(`cpu temperature: ${Math.round(cpuTemp)}°C`);
    });
  }
}

function isCrashLoop(MAX_CRASHES) {
  while (crashTimestamps.length > MAX_CRASHES) {
    crashTimestamps.shift();
  }

  return crashTimestamps.length == MAX_CRASHES && Date.now() - crashTimestamps[0] < 60 * 1000;
}

function isSecondCrash() {
  return crashTimestamps.length > 1 && Date.now() - crashTimestamps[crashTimestamps.length - 2] < 60 * 1000;
}

function crashNotify(crashMsg, msg, { highPriority = true } = {}) {
  const _highPriority = false;

  if (isMainDevice()) {
    if (dmtForeground) {
      setTimeout(() => {
        desktop.notify(msg, crashMsg);
      }, 2000);
    } else {
      setTimeout(() => {
        desktop.notify(msg, crashMsg);
      }, 2000);

      setTimeout(() => {
        push.highPriority(_highPriority).notify(`${crashMsg} ${msg}`);
      }, 1000);
    }
  } else {
    setTimeout(() => {
      push.highPriority(_highPriority).notify(`${crashMsg} ${msg}`);
    }, 1000);
  }
}

export default function init() {
  loop(() => {
    if (!dmtProcConnectedAt) {
      if (dmtProcCrashLoopedAt && dmtProcNextWarningAfterCrashLoopAt && Date.now() >= dmtProcNextWarningAfterCrashLoopAt) {
        const msg = `⚠️ dmt-proc still not running after it has crashed repeatedly ${prettyTimeAge(dmtProcCrashLoopedAt)}`;

        if (dmtProcCrashLoopedAt < Date.now() - 10 * 60 * 60 * 1000) {
          dmtProcNextWarningAfterCrashLoopAt = null;
          push.notify(`${msg} (⚠️ now stopping the warnings, please remember to fix the issue)`);
        } else {
          dmtProcNextWarningAfterCrashLoopAt = Date.now() + 4 * 60 * 60 * 1000;
          push.notify(`${msg} — it will require fixing the bug and a manual restart`);
        }
      }

      if (dmtProcCrashedInForegroundAt && dmtProcCrashedInForegroundAt < Date.now() - 3 * 60 * 1000) {
        if (!isMainDevice()) {
          const msg = `✨ Spawning a new dmt-proc after crash ${prettyTimeAge(dmtProcCrashedInForegroundAt)} while running in terminal foreground …`;
          log.cyan(msg);
          push.notify(msg);

          startDMT();
        }

        dmtProcCrashedInForegroundAt = null;
      }
    }
  }, 2 * 60 * 1000);

  const ser = new ipc();

  ser.listen({ path: abcSocket }, e => {
    if (e) throw e;

    abcTerminator(ser, startedAt);

    log.green(`🔦ABC process started and listening on ${colors.gray(abcSocket)}`);
    if (os.uptime() < BOOT_LIMIT_SECONDS) {
      log.green(`📟 ${device().id} BOOTED`);
    }
  });

  ser.on('init', ({ pid, networkId, foreground }, socket) => {
    log.yellow(`🌀 New dmt-proc just connected ${foreground ? colors.gray('(running in terminal foreground)') : ''}`);

    dmtForeground = foreground;

    socket.dmt = true;

    dmtProcConnectedAt = Date.now();
    dmtProcCrashLoopedAt = null;
    dmtProcNextWarningAfterCrashLoopAt = null;

    dmtProcCrashedInForegroundAt = null;

    const uptime = prettyTimeAge(startedAt).replace(' ago', '');

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
    dmtProcConnectedAt = null;

    if ((socket.dmt && !reportedStoppingAt) || Date.now() - reportedStoppingAt > 2000) {
      let crashMsg = '🛑 dmt-proc was killed or has crashed';

      if (dmtForeground) {
        log.red(crashMsg);

        let msg;

        if (isMainDevice()) {
          msg = '✨⚠️ NOT spawning a new dmt-proc because it was running in terminal foreground on mainDevice';
        } else {
          msg = 'dmt-proc was running in terminal foreground ✨⏳ spawning a new dmt-proc in a few minutes …';
        }

        log.cyan(msg);

        dmtProcCrashedInForegroundAt = Date.now();

        crashNotify(crashMsg, msg, { highPriority: false });
      } else {
        crashTimestamps.push(Date.now());

        if (isCrashLoop(MAX_CRASHES)) {
          crashMsg = '⚠️😵‍💫💀 dmt-proc crash loop';
          log.red(crashMsg);
          const msg = '🤷‍♂️ Giving up on restarting dmt-proc, needs a bugfix and manual restart.';
          log.cyan(msg);

          dmtProcCrashLoopedAt = Date.now();
          dmtProcNextWarningAfterCrashLoopAt = Date.now() + 30 * 60 * 1000;

          crashNotify(crashMsg, msg, { highPriority: false });
        } else {
          if (isSecondCrash()) {
            crashMsg = '🛑 dmt-proc crashed again';
          }
          log.red(crashMsg);

          const msg = '✨ Spawning a new dmt-proc …';
          log.cyan(msg);

          setTimeout(() => {
            startDMT();
          }, 1000);

          crashNotify(crashMsg, msg, { highPriority: !isSecondCrash() });
        }
      }

      logStats();
    }
  });

  ser.on('error', e => {
    if (e.code == 'EADDRINUSE') {
      const msg = `abc-proc double start (one from dmt-proc, another most likely from cron job), exiting this one (${process.pid})`;
      log.cyan(msg);
      apn.notify(msg).then(() => {
        process.exit();
      });
    } else {
      const msg = 'ABC IPC communication error occurred:';
      log.red(msg);
      log.red(e);

      apn.notify(msg);
      apn.notify(e.toString());
    }
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
