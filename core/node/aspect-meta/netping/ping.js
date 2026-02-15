import { log, device, colors, globals, isDevMachine, isDevUser, isPersonalComputer } from 'dmt/common';
import ping from 'nodejs-tcp-ping';

const TIMEOUT = 1500;

const prevAttemptAt = {};

const consecutiveUnresolvedTimeouts = {};

export default function doPing(target, timeout = TIMEOUT) {
  return new Promise((success, reject) => {
    const startedAt = Date.now();

    if (prevAttemptAt[target] && startedAt - prevAttemptAt[target] > 2.1 * globals.tickerPeriod) {
      consecutiveUnresolvedTimeouts[target] = 0;
    }

    prevAttemptAt[target] = startedAt;

    consecutiveUnresolvedTimeouts[target] = (consecutiveUnresolvedTimeouts[target] || 0) + 1;
    if (consecutiveUnresolvedTimeouts[target] >= 3) {
      if (isDevUser()) {
        log.red(`${target} consecutiveUnresolvedTimeout after ${consecutiveUnresolvedTimeouts[target] - 1}x unresolved promise`);
      }

      consecutiveUnresolvedTimeouts[target] = 0;

      const timeoutError = new Error('Timeout');
      timeoutError.code = `${consecutiveUnresolvedTimeouts[target]}x TIMEOUT `;

      reject(timeoutError);
      return;
    }

    ping
      .tcpPing({
        attempts: 5,
        host: target,
        timeout
      })
      .then(results => {
        const delay = Date.now() - startedAt;

        if (delay < timeout) {
          if (consecutiveUnresolvedTimeouts[target] == 2 && isDevUser()) {
            log.green(`⚠️  Ping ${target} anomaly returned to normal (did not reach two consecutive timeouts)`);
          }

          consecutiveUnresolvedTimeouts[target] = 0;

          if (results.filter(el => el.ping < timeout).length == 0) {
            const timeoutError = new Error('Timeout');
            timeoutError.code = `TIMEOUT ${timeout}ms`;
            reject(timeoutError);
          } else {
            success(results);
          }
        } else if (isDevUser()) {
          log.cyan(`⚠️  Ping ${target} anomaly ignored: delay ${colors.red(delay)}ms > timeout (${timeout})ms`);
          log.gray(results);
        }
      })
      .catch(e => {
        const delay = Date.now() - startedAt;

        if (delay < timeout) {
          reject(e);
        } else if (isDevMachine() || device().id == 'eclipse') {
          log.magenta(`⚠️  Ping ${target} anomaly2 ignored: delay ${colors.red(delay)}ms > timeout (${timeout})ms`);
          log.red(e);
        }
      });
  });
}
