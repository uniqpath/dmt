import { timeutils, dateFns, program } from 'dmt/common';

const { isToday, isTomorrow, format, differenceInMinutes, isSameMinute } = dateFns;

const { formatFutureDistance } = timeutils;

import dateTemplate from './dateTemplate.js';

import localize from './localize.js';

export default function describeNearTime(_date) {
  const { strNow, strToday, strTomorrow, strIn, strAt, capitalizeFirstLetter } = localize(program);

  const date = new Date(_date);
  date.setSeconds(0);
  date.setMilliseconds(0);

  const timeTemplate = 'H:mm';

  const time = format(date, timeTemplate);

  const now = new Date();

  now.setSeconds(0);
  now.setMilliseconds(0);

  if (isSameMinute(date, now)) {
    return { datetime: `${capitalizeFirstLetter(strAt)} ${time}`, inTime: strNow, isNow: true };
  }

  const timeDescription = () => {
    if (isToday(date)) {
      return `${strToday} ${strAt} ${time}`;
    }

    if (isTomorrow(date)) {
      return `${strTomorrow} ${strAt} ${time}`;
    }

    const d = format(date, dateTemplate);
    const t = format(date, timeTemplate);
    return `${d} ${strAt} ${t}`;
  };

  if (differenceInMinutes(date, now) <= 180) {
    return { datetime: timeDescription(), inTime: `${strIn} ${formatFutureDistance(date, { referenceDate: now, lang: program.lang() })}` };
  }

  return { datetime: timeDescription() };
}
