import { log, device, colors, globals, isDevMachine, isDevUser, isPersonalComputer } from 'dmt/common';
import ping from 'nodejs-tcp-ping';

const TIMEOUT = 1500;

const prevAttemptAt = {};

const consecutiveUnresolvedTimeouts = {};

export default function doPing(target, timeout = TIMEOUT) {
  return new Promise((success, reject) => {
    const startedAt = Date.now();

    ping
      .tcpPing({
        attempts: 5,
        host: target,
        timeout
      })
      .then(results => {
        const delay = Date.now() - startedAt;

        if (delay < timeout) {
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
      .catch(reject);
  });
}
