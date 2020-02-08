import path from 'path';
import fs from 'fs';
import { easterMonday, getDataForCorrectYear } from './helpers';

import { dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));

const COUNTRY_HOLIDAYS = {};

function filePath(country) {
  return path.join(__dirname, `data/${country}.holidays.json`);
}

function holidayDataExists(country) {
  return country && fs.existsSync(filePath(country));
}

function holidaysForYear(year, { country }) {
  if (!COUNTRY_HOLIDAYS[country]) {
    COUNTRY_HOLIDAYS[country] = JSON.parse(fs.readFileSync(filePath(country)));
  }

  const HOLIDAYS = COUNTRY_HOLIDAYS[country];

  const holidays = getDataForCorrectYear(HOLIDAYS, year);

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

export { holidayDataExists, holidaysForYear, holidayName };
