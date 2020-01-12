const path = require('path');
const fs = require('fs');
const { easterMonday, getDataForCorrectYear } = require('./helpers');

function filePath(country) {
  return path.join(__dirname, `data/${country}/holidays.json`);
}

function holidayDataExists(country) {
  return country && fs.existsSync(filePath(country));
}

function holidaysForYear(year, { country }) {
  const HOLIDAYS = require(filePath(country));

  const holidays = getDataForCorrectYear(HOLIDAYS[country], year);

  if (holidays.EASTER) {
    const _easterMonday = easterMonday(year);
    holidays[`${_easterMonday.getDate()}.${_easterMonday.getMonth() + 1}`] = holidays.EASTER;
    delete holidays.EASTER;
  }

  return holidays;
}

function holidayName(y, m, d, { country }) {
  for (const holiday of Object.entries(holidaysForYear(y, { country }))) {
    if (`${d}.${m}` == holiday[0]) return holiday[1];
  }
}

function isHoliday(y, m, d, { country }) {
  for (const holiday of Object.entries(holidaysForYear(y, { country }))) {
    if (`${d}.${m}` == holiday[0]) return true;
  }

  return false;
}

module.exports = {
  holidayDataExists,
  holidaysForYear,
  holidayName
};

if (require.main === module) {
  console.log(holidayName(2019, 1, 1, { country: 'si' }));
}
