import asyncHooks from 'node:async_hooks';

import { log, colors, prettyFileSize, isRPi, isLanServer, timeutils } from 'dmt/common';

import { broadcastInterval as nearbyBroadcastInterval } from 'dmt/nearby';

let terminationInProgress;

import getExitMsg from '../errors/getExitMsg.js';

const DEBUG___SHOW_UNHANDLED_REJECTION_ORIGIN = false;

const creationStacks = new WeakMap();

function captureCreationStack() {
  const e = new Error('Promise creation stack');
  if (e.stack) {
    const lines = e.stack.split('\n');
    creationStacks.set(this, lines.slice(1).join('\n'));
  }
}

if (DEBUG___SHOW_UNHANDLED_REJECTION_ORIGIN) {
  const hook = asyncHooks.createHook({
    init(asyncId, type, triggerAsyncId, resource) {
      if (type === 'PROMISE' && resource && typeof resource.then === 'function') {
        captureCreationStack.call(resource);
      }
    }
  });

  hook.enable();
}

function terminateProgram(err, reason, program) {
  log.magenta(`⚠️  ${reason} ↴`);
  log.red(err);
  const msg = `${reason}: ${err.stack || err}`;

  program.stopping();

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

export default function setupGlobalErrorHandler(program) {
  process.on('uncaughtException', (err, origin) => terminateProgram(err, origin, program));

  process.once('SIGTERM', signal => {
    program.stopping({ notifyABC: true });
    log.yellow(`🏁 Process stop / restart`);

    program.emit('SIGTERM');

    setTimeout(() => {
      process.exit(0);
    }, 300);
  });

  process.once('SIGINT', signal => {
    program.emit('SIGINT');
    program.stopping({ notifyABC: true });

    log.yellow(`Process has been interrupted: ${signal}`);
    setTimeout(() => {
      log.gray('If exiting is taking a while, it is possibly because of connectivity issues and we are waiting for dmt connections to close');
    }, 1000);

    if (log.isProfiling()) {
      log.green('Memory usage:');

      for (const [key, size] of Object.entries(process.memoryUsage())) {
        log.write(`${colors.cyan(key)}: ${prettyFileSize(size)}`);
      }
    }

    setTimeout(() => {
      process.exit(0);
    }, 300);
  });

  process.on('unhandledRejection', (reason, promise) => {
    log.red('⚠️  (2/2) Unhandled Rejection ', promise, colors.yellow('REASON:'), reason);

    if (DEBUG___SHOW_UNHANDLED_REJECTION_ORIGIN) {
      const creation = creationStacks.get(promise);
      if (creation) {
        log.red('\n❗ Promise originated from: ❗\n' + colors.gray(creation) + '\n    👆');
      } else {
        log.red('\n(No captured creation stack for this promise)');
      }
    }
  });
}
