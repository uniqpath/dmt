import { program, dateFns, timeutils } from 'dmt/common';

const { parse, isSameMinute, isAfter, addDays, isSameDay } = dateFns;

const { formatFutureDistance, ONE_HOUR } = timeutils;

import ScopedNotifier from './base/scopedNotifier.js';

import localize from './lib/localize.js';
import { isReloadableNotifications } from './lib/isReloadableNotifications.js';
import convertDateToEUFormat from './lib/convertDateToEUFormat.js';
import parseTimeToday from './lib/parseTimeToday.js';
import describeNearDate from './lib/describeNearDate.js';
import dateTemplate from './lib/dateTemplate.js';
import getObjHash from '../lib/pushover/getObjHash.js';
import getDedupKey from '../lib/pushover/getDedupKey.js';
import delayWarning from './lib/delayWarning.js';

const NOTIFIER_DEFAULT_TIME = '10:00';
const TOMORROW_SYMBOL = '⏳';
const CALENDAR_SYMBOL = '🗓️';
const LAST_EVENT = '❗';

class TrashTakeoutNotifier extends ScopedNotifier {
  constructor(
    records,
    { year, color, ttl, notifyDayBeforeAt = [], notifyDaysBefore = [], highPriority, app, symbol = '🗑️', title, user, users } = {},
    decommissionable = false
  ) {
    super(`${symbol} ${title || ''}`, decommissionable);

    this.records = records;

    this.app = app;

    this.year = year;
    this.notifyDayBeforeAt = notifyDayBeforeAt;
    this.notifyDaysBefore = notifyDaysBefore;
    this.symbol = symbol;
    this.title = title;
    this.highPriority = !!highPriority;

    this.color = color;
    this.ttl = ttl;

    this.user = user || users;
  }

  check(fakeNow) {
    const now = fakeNow || new Date();

    const notifyDayBeforeAt = Array.isArray(this.notifyDayBeforeAt) ? this.notifyDayBeforeAt : [this.notifyDaysBefore];

    const _notifyDaysBefore = Array.isArray(this.notifyDaysBefore) ? this.notifyDaysBefore : [this.notifyDaysBefore];
    const notifyDaysBefore = _notifyDaysBefore.filter(x => x != 0);
    if (notifyDayBeforeAt.length > 0 && !notifyDaysBefore.includes(1)) {
      notifyDaysBefore.push(1);
    }

    const { strIn, capitalizeFirstLetter } = localize(program);

    for (const daysBefore of notifyDaysBefore) {
      const isDayBefore = daysBefore == 1;

      const times = isDayBefore ? notifyDayBeforeAt : [NOTIFIER_DEFAULT_TIME];
      if (times.find(t => isSameMinute(now, parseTimeToday({ time: t, now })))) {
        const list = [];
        const matchingDates = [];

        for (const { tag, title, when } of this.records) {
          const matchingDate = Array(when)
            .flat()
            .find(dayAndMonth => isSameDay(parse(convertDateToEUFormat(dayAndMonth, this.year), dateTemplate, now), addDays(now, daysBefore)));

          if (matchingDate) {
            list.push(title || tag);
            matchingDates.push(parse(convertDateToEUFormat(matchingDate, this.year), dateTemplate, now));
          }
        }

        if (list.length > 0) {
          const isLastNotification = !this.records.some(({ when }) =>
            Array(when)
              .flat()
              .some(dayAndMonth => {
                const eventDate = parse(convertDateToEUFormat(dayAndMonth, this.year), dateTemplate, now);
                return isAfter(eventDate, Math.max(...matchingDates));
              })
          );

          const symbol = isLastNotification ? `${this.symbol} ${LAST_EVENT}` : this.symbol;

          const msg = list.join('\n');
          const title = `${symbol} ${this.title}`;

          const inDays = `${capitalizeFirstLetter(strIn)} ${formatFutureDistance(addDays(now, daysBefore), { lang: program.lang() })}`;

          const describeFuture = () => describeNearDate({ daysBefore, date: addDays(now, daysBefore), inDays });

          const tagline = `${isDayBefore ? TOMORROW_SYMBOL : CALENDAR_SYMBOL} ${describeFuture()}`.trim();

          const obj = {
            msg,
            title,
            _msg: msg,
            _title: this.title,
            symbol,
            color: this.color,
            ttl: this.ttl,
            highPriority: this.highPriority && isLastNotification,
            user: this.user,
            dedupKey: getDedupKey(now)
          };

          const preHash = getObjHash(obj);

          obj.msg = delayWarning(obj.msg, now, ONE_HOUR);

          this.handleMessage({ ...obj, tagline, preHash });
        }
      }
    }
  }
}

export default function trashTakeoutNotifier(notifications, options = {}) {
  const decommissionable = isReloadableNotifications(new Error(), import.meta.url);

  return program.registerNotifier(new TrashTakeoutNotifier(notifications, options, decommissionable));
}
