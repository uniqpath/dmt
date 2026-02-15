import { log, isRPi, isLanServer, loop } from 'dmt/common';

const ONE_MINUTE = 60 * 1000;
const ONE_HOUR = 60 * ONE_MINUTE;

function keep12h(connectivityFailures) {
  return connectivityFailures.filter(timestamp => Date.now() - timestamp < 12 * ONE_HOUR);
}

function shouldCheck() {
  return true;
}

export function init(program) {
  if (shouldCheck()) {
    const slot = program.slot('connectivityReport');

    program.on('internet_connection_lost', () => {
      const connectivityFailures = keep12h(slot.get('connectivityFailures') || []);
      connectivityFailures.push(Date.now());
      slot.update({ count12h: connectivityFailures.length, connectivityFailures }, { announce: false });
    });

    loop(() => {
      const connectivityFailures = keep12h(slot.get('connectivityFailures') || []);
      slot.update({ count12h: connectivityFailures.length, connectivityFailures }, { announce: false });
    }, 5 * ONE_MINUTE);
  }
}
