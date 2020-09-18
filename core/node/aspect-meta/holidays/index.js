import dmt from 'dmt/bridge';
import { getCurrentYearMonthDay } from './helpers';
import { holidayName, holidayDataExists } from './holidays';

function updateCurrentHoliday(program) {
  const country = program.country();

  if (holidayDataExists(country)) {
    const { year, month, day } = getCurrentYearMonthDay();

    const holiday = holidayName(year, month, day, { country });

    if (program.state().time && program.state().time.holiday != holiday) {
      program.store.update({ time: { holiday } });
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
    }, dmt.globals.tickerPeriod * 1000 + 500);

    setTimeout(() => {
      updateCurrentHoliday(program);
    }, 2 * dmt.globals.tickerPeriod * 1000);
  }
}

export { init };
