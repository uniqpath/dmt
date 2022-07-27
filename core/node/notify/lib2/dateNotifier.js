import { dateFns, colors } from 'dmt/common';

const { parse, isTomorrow, isSameMinute, subMinutes } = dateFns;

import ScopedNotifier from './base/scopedNotifier.js';

import parseTimeToday from './lib/parseTimeToday.js';
import convertDateToEUFormat from './lib/convertDateToEUFormat.js';
import convertTimeTo24hFormat from './lib/convertTimeTo24hFormat.js';
import describeNearTime from './lib/describeNearTime.js';
import localize from './lib/localize.js';

import dateTemplate from './lib/dateTemplate.js';

const ONE_MINUTE = 60 * 1000;

const TOMORROW_SYMBOL = '🗓️';

const GLOBAL_DEFAULT_TIME = '8:00';

class DateNotifier extends ScopedNotifier {
  constructor(notifications, { program, symbol = '📅', defaultYear, color, ttl, highPriority, notifyDayBeforeAt, notifyMinutesBefore = 0 }) {
    super(symbol);

    this.program = program;

    this.notifications = Array(notifications).flat(Infinity);

    this.symbol = symbol;
    this.color = color;
    this.ttl = ttl;
    this.highPriority = !!highPriority;

    this.defaultYear = defaultYear;

    this.notifyDayBeforeAt = Array(notifyDayBeforeAt || []).flat();
    this.notifyMinutesBefore = notifyMinutesBefore;
  }

  checkNotificationTimes(entry) {
    const date = new Date();

    const { title, when, defaultTime, notifyMinutesBefore: _notifyMinutesBefore, symbol: _symbol, color, ttl, highPriority: _highPriority, id } = entry;

    const notifyMinutesBefore = _notifyMinutesBefore == undefined ? this.notifyMinutesBefore : _notifyMinutesBefore;
    const highPriority = _highPriority == undefined ? this.highPriority : _highPriority;

    for (const _t of Array(when).flat()) {
      const [_date, _time] = _t.replace(' at ', ' ').split(' ');

      const __time = _time || defaultTime || GLOBAL_DEFAULT_TIME;

      const time = convertTimeTo24hFormat(__time);

      const timepoint = parse(`${convertDateToEUFormat(_date, this.defaultYear)} ${time}`, `${dateTemplate} H:mm`, new Date());

      const symbol = _symbol || this.symbol;

      const o = {
        deviceId: this.program.device.id,
        symbol,
        highPriority: false,
        title: title || '',
        color: color || this.color,
        ttl: ttl || this.ttl,
        id
      };

      const notificationTime = subMinutes(timepoint, notifyMinutesBefore);

      const { tomorrowStr, atStr } = localize(this.program);

      if (isSameMinute(date, notificationTime)) {
        const { datetime, inTime: tagline } = describeNearTime(this.program, timepoint);

        const pushTitle = `${symbol} ${title} ${tagline || ''}`;

        this.callback({
          ...o,
          highPriority,
          pushTitle,
          msg: datetime,
          tagline
        });

        entry.sentAt = Date.now();
      }

      if (isTomorrow(timepoint)) {
        for (const t of this.notifyDayBeforeAt) {
          const notificationTime = parseTimeToday(t, title);

          if (isSameMinute(date, notificationTime)) {
            const pushTitle = `${symbol} ${title}`;

            this.callback({ ...o, pushTitle, msg: `${TOMORROW_SYMBOL} ${tomorrowStr} ${atStr} ${time}`, isDayBefore: true });

            entry.sentAt = Date.now();
          }
        }
      }
    }
  }

  check() {
    for (const entry of this.notifications) {
      const { sentAt } = entry;

      if (entry.from || entry.until) {
        throw new Error(`${this.ident} does not support 'from' and 'until'`);
      }

      if (!sentAt || (sentAt && Date.now() - sentAt > ONE_MINUTE)) {
        this.checkNotificationTimes(entry);
      }
    }
  }
}

export default function dateNotifier(...args) {
  return new DateNotifier(...args);
}
