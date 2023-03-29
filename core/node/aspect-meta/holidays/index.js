import { log } from 'dmt/common';

import { globals } from 'dmt/common';

import { getCurrentYearMonthDay } from './helpers.js';
import { holidayName, holidayDataExists, holidaysForYear, isHoliday } from './holidays.js';

function updateCurrentHoliday(program) {
  const country = program.country();

  if (holidayDataExists(country)) {
    const { year, month, day } = getCurrentYearMonthDay();

    const holiday = holidayName(year, month, day, { country });

    if (program.slot('time').get('holiday') != holiday) {
      program.slot('time').update({ holiday });
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
    }, globals.tickerPeriod + 500);

    setTimeout(() => {
      updateCurrentHoliday(program);
    }, 2 * globals.tickerPeriod);
  }
}

export { init, holidaysForYear, holidayDataExists, isHoliday };
