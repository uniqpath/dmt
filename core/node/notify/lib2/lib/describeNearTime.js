import { timeutils, dateFns } from 'dmt/common';

const { isToday, isTomorrow, format, differenceInMinutes, isSameMinute } = dateFns;

const { formatFutureDistance } = timeutils;

import dateTemplate from './dateTemplate.js';

import localize from './localize.js';

export default function describeNearTime(program, _date) {
  const { nowStr, todayStr, tomorrowStr, inStr, atStr } = localize(program);

  const date = new Date(_date);
  date.setSeconds(0);
  date.setMilliseconds(0);

  const timeTemplate = 'H:mm';

  const time = format(date, timeTemplate);

  const now = new Date();

  now.setSeconds(0);
  now.setMilliseconds(0);

  if (isSameMinute(date, now)) {
    return { datetime: `${time} (${nowStr.toUpperCase()})` };
  }

  const timeDescription = () => {
    if (isToday(date)) {
      return `${todayStr} ${atStr} ${time}`;
    }

    if (isTomorrow(date)) {
      return `${tomorrowStr} ${atStr} ${time}`;
    }

    const d = format(date, dateTemplate);
    const t = format(date, timeTemplate);
    return `${d} ${atStr} ${t}`;
  };

  if (differenceInMinutes(date, now) <= 120) {
    return { datetime: timeDescription(), inTime: `${inStr} ${formatFutureDistance(date, { referenceDate: now, lang: program.lang() })}` };
  }

  return { datetime: timeDescription() };
}
