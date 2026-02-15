import { dateFns } from 'dmt/common';

const { parse } = dateFns;

import convertDateToEUFormat from './convertDateToEUFormat.js';
import convertTimeTo24hFormat from './convertTimeTo24hFormat.js';
import dateTemplate from './dateTemplate.js';

export default function getTimepoint({ t, defaultTime, defaultYear }) {
  const [_date, _time] = t.replace(' at ', ' ').split(' ');

  const __time = _time || defaultTime;

  const isUnspecifiedTime = !_time && !defaultTime;

  const time = convertTimeTo24hFormat(__time);

  const timepoint = parse(`${convertDateToEUFormat(_date, defaultYear)} ${time}`, `${dateTemplate} H:mm`, new Date());

  return { timepoint, time, isUnspecifiedTime };
}
