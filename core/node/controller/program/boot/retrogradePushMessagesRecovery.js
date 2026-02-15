import { log, dateFns, timeutils, loop, colors, isMainDevice, isMainServer, isDevUser, dmtUserDir } from 'dmt/common';

const { ONE_SECOND, ONE_MINUTE, ONE_HOUR, ONE_DAY } = timeutils;

const { format } = dateFns;
const MAIN_DEVICE_TESTING = false;

const TESTING_LOOKBACK_MINUTES = 10;

const INITIAL_DELAY = MAIN_DEVICE_TESTING ? 500 : 3000;

const MAX_LOOKBACK = ONE_DAY;

export default function init(program) {
  if (MAIN_DEVICE_TESTING || isMainServer()) {
    setTimeout(() => {
      const aliveTimestamp = MAIN_DEVICE_TESTING ? Date.now() - TESTING_LOOKBACK_MINUTES * ONE_MINUTE : program.slot('aliveTimestamp').get();
      if (aliveTimestamp && JSON.stringify(aliveTimestamp) != '{}') {
        const aliveDate = new Date(aliveTimestamp);

        log.green(
          `🔌 ${colors.cyan('dmt-proc')} started after being offline for ${colors.cyan(timeutils.prettyTime(aliveTimestamp))} ${colors.gray(
            `(since ${aliveDate.toISOString()})`
          )}`
        );

        aliveDate.setSeconds(0);
        aliveDate.setMilliseconds(0);

        const _now = new Date();
        _now.setSeconds(0);
        _now.setMilliseconds(0);

        const now = _now.getTime();

        let timepoint = aliveDate.getTime();

        if (now - aliveDate.getTime() > MAX_LOOKBACK) {
          timepoint = now - MAX_LOOKBACK;
        }

        const firstHourTimepoint = timepoint;

        const hourList = [];

        let checking;

        while (timepoint < now) {
          checking = true;

          if (isDevUser()) {
            const isBeginning = timepoint - firstHourTimepoint < 15 * ONE_MINUTE;
            const isEnd = now - timepoint <= 15 * ONE_MINUTE;

            if (isBeginning || isEnd) {
              log.magenta(`🕖 Checking delayed messages at ${colors.white(format(timepoint, 'H:mm:ss'))} …`);
            } else {
              const hour = new Date(timepoint).getHours();
              if (!hourList.includes(hour)) {
                log.yellow(`🕛 Checking all delayed messages around ${colors.white(`${hour}h`)} …`);
                hourList.push(hour);
              }
            }
          }

          program.simulateNotifiersTimepoint(timepoint);
          timepoint += ONE_MINUTE;
        }

        if (checking && isDevUser()) {
          log.yellow('✅ Finished checking for delayed messages.');
        }
      }
      setTimeout(() => {
        loop(() => {
          if (!program.isStopping()) {
            program.slot('aliveTimestamp', { announce: false }).set(Date.now());
          }
        }, 2000);
      }, 10 * ONE_SECOND);
    }, INITIAL_DELAY);
  }
}
