import { log, colors, prettyFileSize, isRPi, isLanServer, timeutils } from 'dmt/common';

import { broadcastInterval as nearbyBroadcastInterval } from 'dmt/nearby';

let terminationInProgress;

import getExitMsg from '../errors/getExitMsg.js';

function terminateProgram(err, reason, program) {
  log.magenta(`⚠️  ${reason} ↴`);
  log.red(err);
  const msg = `${reason}: ${err.stack || err}`;

  if (!terminationInProgress) {
    terminationInProgress = true;

    log.yellow('PREPARING TO EXIT THE PROCESS —');

    const exitMsg = getExitMsg(msg, { program, timeutils });

    const dmtStartedAt = program.slot('device').get('dmtStartedAt');
    const lanServerNearby = Date.now() - dmtStartedAt < 30000 && isRPi() && !isLanServer() && !program.lanServerNearby();
    const delay = lanServerNearby ? nearbyBroadcastInterval : 0;

    if (delay) {
      log.gray(`Waiting for ${delay}ms for possible nearby lan server so that notification can be sent more reliably…`);
    }

    setTimeout(() => {
      const delay = isRPi() && !lanServerNearby ? 6000 : 3000;

      program.exceptionNotify(exitMsg, { delay, exitProcess: true });
    }, delay);
  }
}

function reportStopping(program) {
  program.sendABC({ message: 'stopping' });
}

export default function setupGlobalErrorHandler(program) {
  process.on('uncaughtException', (err, origin) => terminateProgram(err, origin, program));

  process.on('SIGTERM', signal => {
    reportStopping(program);
    log.yellow(`Process received a ${signal} signal (usually because of normal stop/restart)`);

    process.exit(0);
  });

  process.on('SIGINT', signal => {
    reportStopping(program);
    log.yellow(`Process has been interrupted: ${signal}`);

    if (log.isProfiling()) {
      log.green('Memory usage:');

      for (const [key, size] of Object.entries(process.memoryUsage())) {
        log.write(`${colors.cyan(key)}: ${prettyFileSize(size)}`);
      }
    }

    process.exit(0);
  });

  process.on('unhandledRejection', (reason, promise) => {
    log.red('⚠️  (2/2) Unhandled Rejection in:', promise, 'reason:', reason);
  });
}
