import { dateFns, colors, holidayDataExists, isHoliday } from 'dmt/common';

const { isSameMinute, subMinutes, isToday, addDays } = dateFns;

import ScopedNotifier from './base/scopedNotifier.js';

import parseTimeToday from './lib/parseTimeToday.js';
import parseTimeTomorrow from './lib/parseTimeTomorrow.js';
import convertTimeTo24hFormat from './lib/convertTimeTo24hFormat.js';
import { evaluateTimespan } from './lib/evaluateTimespan.js';
import describeNearTime from './lib/describeNearTime.js';
import localize from './lib/localize.js';

const LAST_EVENT_SYMBOL = '✅';
const TOMORROW_SYMBOL = '◆';

const ONE_MINUTE = 60 * 1000;

class WeeklyNotifier extends ScopedNotifier {
  constructor(notifications, { program, symbol = '🔔', notifyDayBeforeAt, notifyMinutesBefore = 0, color, ttl, highPriority, skipOnHolidays }) {
    super(symbol);

    this.program = program;

    this.notifications = Array(notifications).flat(Infinity);

    this.symbol = symbol;
    this.color = color;
    this.ttl = ttl;
    this.highPriority = !!highPriority;

    this.notifyDayBeforeAt = Array(notifyDayBeforeAt || []).flat();
    this.notifyMinutesBefore = notifyMinutesBefore;
    this.skipOnHolidays = skipOnHolidays;
  }

  shouldSkip(date, skipOnHolidays) {
    if (this.skipOnHolidays || skipOnHolidays) {
      const country = this.program.country();
      return holidayDataExists(country) && isHoliday(date, { country });
    }
  }

  parse(_t) {
    const DOW = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

    const [_dow, _time] = _t.replace(' at ', ' ').split(' ');

    const time = convertTimeTo24hFormat(_time);

    const dow = DOW.indexOf(_dow.toLowerCase());

    if (dow == -1) {
      throw new Error(
        `Day of week error: ${colors.yellow(_dow)} - in ${colors.yellow(_t)} - ${this.constructor.name} - allowed: ${colors.green(DOW.join(', '))}`
      );
    }

    return { time, dow };
  }

  checkNotificationTimes(entry) {
    const now = new Date();

    const { title, symbol, when, color, id, ttl, from, until, highPriority: _highPriority } = entry;
    const highPriority = _highPriority == undefined ? this.highPriority : _highPriority;

    const notifyMinutesBefore = entry.notifyMinutesBefore || this.notifyMinutesBefore;

    for (const _t of Array(when).flat()) {
      const { time, dow: eventWeekDay } = this.parse(_t);

      const { tomorrowStr, atStr } = localize(this.program);

      const o = {
        symbol: symbol || this.symbol,
        title: title || '',
        highPriority: false,
        color: color || this.color,
        ttl: ttl || this.ttl,
        id
      };

      if (now.getDay() == eventWeekDay) {
        const eventTime = parseTimeToday(time, title);

        const { isValid, isLastDay: _isLastDay } = evaluateTimespan({ date: eventTime, from, until });

        if (isValid && !this.shouldSkip(eventTime, entry.skipOnHolidays)) {
          const notificationTime = subMinutes(eventTime, notifyMinutesBefore);

          if (isSameMinute(now, notificationTime)) {
            const isLastDay = _isLastDay || this.isLastDaySpecificCheckForWeeklyNotifier(eventTime, entry);

            const { datetime, inTime: tagline } = describeNearTime(this.program, parseTimeToday(time, title));

            const __symbol = this.getLastEventSymbol({ isLastDay, time, when, eventWeekDay });

            const pushTitle = `${o.symbol}${__symbol} ${title} ${tagline ? `— ${tagline}` : ''}`.trim();

            this.callback({
              ...o,
              highPriority,
              pushTitle,
              msg: datetime,
              tagline
            });

            entry.sentAt = Date.now();
          }
        }
      }

      const eventTime = parseTimeTomorrow(time, title);

      const { isValid, isLastDay: _isLastDay } = evaluateTimespan({ date: eventTime, from, until });

      if (isValid && !this.shouldSkip(eventTime, entry.skipOnHolidays)) {
        if ((now.getDay() + 1) % 7 == eventWeekDay) {
          const notificationTime = subMinutes(eventTime, notifyMinutesBefore);

          if (isSameMinute(now, notificationTime) && isToday(notificationTime)) {
            const isLastDay = _isLastDay || this.isLastDaySpecificCheckForWeeklyNotifier(eventTime, entry);

            const { datetime, inTime: tagline } = describeNearTime(this.program, parseTimeTomorrow(time, title));

            const __symbol = this.getLastEventSymbol({ isLastDay, time, when, eventWeekDay });

            const pushTitle = `${o.symbol}${__symbol} ${title} ${tagline ? `— ${tagline}` : ''}`.trim();

            this.callback({
              ...o,
              highPriority,
              pushTitle,
              msg: datetime,
              tagline
            });

            entry.sentAt = Date.now();
          }
        }

        if (this.notifyDayBeforeAt.length > 0 && (now.getDay() + 1) % 7 == eventWeekDay) {
          for (const t of this.notifyDayBeforeAt) {
            const notificationTime = parseTimeToday(t, title);

            if (isSameMinute(now, notificationTime)) {
              const pushTitle = `${o.symbol} ${title}`;

              this.callback({ ...o, pushTitle, msg: `${TOMORROW_SYMBOL} ${tomorrowStr} ${atStr} ${time}`, isDayBefore: true });

              entry.sentAt = Date.now();
            }
          }
        }
      }
    }
  }

  isLastDaySpecificCheckForWeeklyNotifier(_eventTime, entry) {
    const { when, from, until, skipOnHolidays } = entry;

    for (let i = 1; i <= 30; i++) {
      const eventTime = addDays(_eventTime, i);

      for (const _t of Array(when).flat()) {
        const { dow } = this.parse(_t);

        if (!evaluateTimespan({ date: eventTime, from, until }).isValid) {
          return true;
        }

        if (eventTime.getDay() == dow && !this.shouldSkip(eventTime, skipOnHolidays)) {
          return false;
        }
      }
    }

    return true;
  }

  findAllTimesForDOW(eventWeekDay, when) {
    return Array(when)
      .flat()
      .filter(_t => this.parse(_t).dow == eventWeekDay)
      .map(_t => this.parse(_t).time);
  }

  latestTime(when) {
    return Array(when)
      .flat()
      .sort((a, b) => {
        return 60 * b.split(':')[0] + b.split(':')[1] - (60 * a.split(':')[0] + a.split(':')[1]);
      })[0];
  }

  getLastEventSymbol({ isLastDay, when, time, eventWeekDay }) {
    if (isLastDay && this.latestTime(this.findAllTimesForDOW(eventWeekDay, when)) == time) {
      return LAST_EVENT_SYMBOL;
    }

    return '';
  }

  check() {
    for (const entry of this.notifications) {
      const { sentAt } = entry;

      if (entry.to) {
        throw new Error(`${this.ident} Please use 'until' instead of 'to'`);
      }

      if (!sentAt || (sentAt && Date.now() - sentAt > ONE_MINUTE)) {
        this.checkNotificationTimes(entry);
      }
    }
  }
}

export default function weeklyNotifier(...args) {
  return new WeeklyNotifier(...args);
}
