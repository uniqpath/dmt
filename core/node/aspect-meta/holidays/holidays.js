import path from 'path';
import fs from 'fs';
import { easter, easterMonday, getDataForCorrectYear } from './helpers.js';

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

  const HOLIDAYS = JSON.parse(JSON.stringify(COUNTRY_HOLIDAYS[country]));

  const { symbol, holidays } = getDataForCorrectYear(HOLIDAYS, year);

  for (const holiday of holidays) {
    if (holiday.date == 'EASTER') {
      holiday.date = easter(year);
    } else if (holiday.date == 'EASTER_MONDAY') {
      holiday.date = easterMonday(year);
    } else {
      const [day, month] = holiday.date.split('.');
      holiday.date = new Date(year, parseInt(month) - 1, parseInt(day));
    }
  }

  return { symbol, holidays };
}

function holidayName(y, m, d, { country }) {
  const { holidays } = holidaysForYear(y, { country });
  for (const holiday of holidays) {
    const { date, holiday: holidayName } = holiday;
    if (date.getDate() == d && date.getMonth() + 1 == m) return holidayName;
  }
}

function isHoliday(date, { country }) {
  const y = date.getFullYear();

  const { holidays } = holidaysForYear(y, { country });

  for (const holiday of holidays) {
    const { date: date2 } = holiday;
    if (date.getFullYear() == date2.getFullYear() && date.getMonth() == date2.getMonth() && date.getDate() == date2.getDate()) return true;
  }

  return false;
}

export { holidayDataExists, holidaysForYear, holidayName, isHoliday };
