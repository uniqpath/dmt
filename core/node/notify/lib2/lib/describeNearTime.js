import { timeutils, dateFns, program } from 'dmt/common';

const { isToday: _isToday, isTomorrow, format, differenceInMinutes, isSameMinute } = dateFns;

const { formatFutureDistance, prettyTimeAgo } = timeutils;

import dateTemplate from './dateTemplate.js';

import localize from './localize.js';

export default function describeNearTime(_date, { now = new Date() } = {}) {
  const { strNow, strToday, strTomorrow, strIn, strAt, capitalizeFirstLetter } = localize(program);

  const date = new Date(_date);
  date.setSeconds(0);
  date.setMilliseconds(0);

  const timeTemplate = 'H:mm';

  const time = format(date, timeTemplate);

  now.setSeconds(0);
  now.setMilliseconds(0);

  const diff = differenceInMinutes(date, now);

  const isSoon = diff <= 180 && diff > 0;

  if (isSameMinute(date, now)) {
    return { datetime: `${capitalizeFirstLetter(strAt)} ${time}`, inTime: strNow, isNow: true };
  }

  const isToday = _isToday(date);

  const timeDescription = () => {
    if (isToday) {
      return isSoon ? time : `${strToday} ${strAt} ${time}`;
    }

    if (isTomorrow(date)) {
      return `${strTomorrow} ${strAt} ${time}`;
    }

    const d = format(date, dateTemplate);
    const t = format(date, timeTemplate);
    return `${d} ${strAt} ${t}`;
  };

  if (isSoon) {
    return { datetime: timeDescription(), isToday, inTime: `${strIn} ${formatFutureDistance(date, { referenceDate: now, lang: program.lang() })}` };
  }

  if (diff < 0) {
    return { datetime: timeDescription(), isToday, isPast: true, inTime: `${prettyTimeAgo(date, { now })}` };
  }

  return { datetime: timeDescription(), isToday };
}
