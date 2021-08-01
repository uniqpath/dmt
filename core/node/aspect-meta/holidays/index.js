import { globals } from 'dmt/common';

import { getCurrentYearMonthDay } from './helpers';
import { holidayName, holidayDataExists } from './holidays';

function updateCurrentHoliday(program) {
  const country = program.country();

  if (holidayDataExists(country)) {
    const { year, month, day } = getCurrentYearMonthDay();

    const holiday = holidayName(year, month, day, { country });

    if (program.store('time').get('holiday') != holiday) {
      program.store('time').update({ holiday });
    }
  }
}

function init(program) {
  program.on('minute_rollover', () => {
    updateCurrentHoliday(program);
  });

  updateCurrentHoliday(program);

  if (!program.country()) {
    setTimeout(() => {
      updateCurrentHoliday(program);
    }, globals.tickerPeriod * 1000 + 500);

    setTimeout(() => {
      updateCurrentHoliday(program);
    }, 2 * globals.tickerPeriod * 1000);
  }
}

export { init };
