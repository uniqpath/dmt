import { log, colors, globals, isDevMachine } from 'dmt/common';
import ping from 'nodejs-tcp-ping';

const TIMEOUT = 1500;

const prevAttemptAt = {};

const consecutiveUnresolvedTimeouts = {};

export default function doPing(target, timeout = TIMEOUT) {
  return new Promise((success, reject) => {
    if (isDevMachine()) {
      log.gray(`devMachine -- ping ${target}`);
    }

    const startedAt = Date.now();

    if (prevAttemptAt[target] && startedAt - prevAttemptAt[target] > 2.1 * globals.tickerPeriod) {
      if (isDevMachine()) {
        log.magenta(`devMachine -- pinger ${target} reset timeout counter after ${startedAt - prevAttemptAt[target]}ms`);
      }

      consecutiveUnresolvedTimeouts[target] = 0;
    }

    prevAttemptAt[target] = startedAt;

    consecutiveUnresolvedTimeouts[target] = (consecutiveUnresolvedTimeouts[target] || 0) + 1;
    if (consecutiveUnresolvedTimeouts[target] >= 3) {
      if (isDevMachine()) {
        log.red(`devMachine -- ${target} consecutiveUnresolvedTimeout after ${consecutiveUnresolvedTimeouts[target] - 1}x unresolved promise`);
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
          consecutiveUnresolvedTimeouts[target] = 0;

          if (results.filter(el => el.ping < timeout).length == 0) {
            const timeoutError = new Error('Timeout');
            timeoutError.code = `TIMEOUT ${timeout}ms`;
            reject(timeoutError);
          } else {
            success(results);
          }
        } else if (isDevMachine()) {
          log.green(`⚠️  devMachine → Ping ${target} anomaly ignored: delay ${colors.red(delay)}ms > timeout (${timeout})ms`);
          log.gray(results);
        }
      })
      .catch(reject);
  });
}
