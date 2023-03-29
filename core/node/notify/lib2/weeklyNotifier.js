import { dateFns, program, colors, holidayDataExists, isHoliday } from 'dmt/common';

const { isSameMinute, subMinutes, isToday, addDays } = dateFns;

import ScopedNotifier from './base/scopedNotifier.js';

import { isReloadableNotifications } from './lib/isReloadableNotifications.js';
import parseTimeToday from './lib/parseTimeToday.js';
import parseTimeTomorrow from './lib/parseTimeTomorrow.js';
import convertTimeTo24hFormat from './lib/convertTimeTo24hFormat.js';
import { evaluateTimespan } from './lib/evaluateTimespan.js';
import describeNearTime from './lib/describeNearTime.js';
import localize from './lib/localize.js';

const LAST_EVENT_SYMBOL = '✅';
const NOW_SYMBOL = '🫵';
const CLOCK_SYMBOL = '🕛';
const TOMORROW_SYMBOL = '⏳';

class WeeklyNotifier extends ScopedNotifier {
  constructor(
    notifications,
    { symbol = '🔔', notifyDayBeforeAt, notifyMinutesBefore = 0, title, color, ttl, highPriority, skipOnHolidays, user } = {},
    decommissionable = false
  ) {
    super(symbol, decommissionable);

    this.notifications = Array(notifications).flat(Infinity);

    this.title = title;
    this.symbol = symbol;
    this.color = color;
    this.ttl = ttl;
    this.highPriority = !!highPriority;

    this.notifyDayBeforeAt = notifyDayBeforeAt;
    this.notifyMinutesBefore = notifyMinutesBefore;
    this.skipOnHolidays = skipOnHolidays;

    this.user = user;
  }

  shouldSkip(date, entry) {
    const sh = this.skipOnHolidays || entry.skipOnHolidays;

    if (sh) {
      const country = typeof sh === 'string' ? sh : program.country();
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

    const {
      msg: msgStrOrArray,
      symbol: _symbol,
      when,
      color,
      id,
      ttl,
      from,
      until,
      notifyMinutesBefore: _notifyMinutesBefore,
      highPriority: _highPriority,
      notifyDayBeforeAt: _notifyDayBeforeAt,
      url,
      user: _user
    } = entry;

    const msg = Array.isArray(msgStrOrArray) ? this.randomElement(msgStrOrArray) : msgStrOrArray;
    const titleStrOrArray = entry.title || this.title || '';
    const _title = Array.isArray(titleStrOrArray) ? this.randomElement(titleStrOrArray) : titleStrOrArray;

    const notifyMinutesBefore = _notifyMinutesBefore == undefined ? this.notifyMinutesBefore : _notifyMinutesBefore || 0;
    const highPriority = _highPriority == undefined ? this.highPriority : _highPriority;
    const notifyDayBeforeAt = Array((_notifyDayBeforeAt == undefined ? this.notifyDayBeforeAt : _notifyDayBeforeAt || []) || []).flat();
    const user = _user == undefined ? this.user : _user;

    for (const _t of Array(when).flat()) {
      const { time, dow: eventWeekDay } = this.parse(_t);

      const { strTomorrow, strAt } = localize(program);

      const symbolStrOrArray = _symbol || this.symbol;
      const symbol = Array.isArray(symbolStrOrArray) ? this.randomElement(symbolStrOrArray) : symbolStrOrArray;

      const o = {
        symbol,
        _msg: msg,
        highPriority: false,
        color: color || this.color,
        ttl: ttl || this.ttl,
        user,
        id,
        url,
        data: entry.data || {}
      };

      if (now.getDay() == eventWeekDay) {
        const eventTime = parseTimeToday(time, _title);

        const { isWithin, isLastDay: _isLastDay } = evaluateTimespan({ date: eventTime, from, until });

        if (isWithin && !this.shouldSkip(eventTime, entry)) {
          const notificationTime = subMinutes(eventTime, notifyMinutesBefore);

          if (isSameMinute(now, notificationTime)) {
            const isLastDay = _isLastDay || this.isLastDaySpecificCheckForWeeklyNotifier(eventTime, entry);

            const { datetime, inTime, isNow } = describeNearTime(program, parseTimeToday(time, _title));

            const tagline = isNow && msg ? undefined : `${isNow ? NOW_SYMBOL : CLOCK_SYMBOL} ${datetime}${inTime ? ` [ ${inTime} ]` : ''}`;

            const isLastEvent = this.isLastEvent({ isLastDay, time, when, eventWeekDay });
            const lastTag = this.lastEventTag(isLastEvent);

            const title = `${_title}${lastTag}`;
            const pushTitle = `${o.symbol} ${title}`.trim();
            const pushMsg = msg ? `${tagline ? `${tagline}\n\n` : ''}${msg}` : tagline;

            this.callback({
              ...o,
              _title: title,
              highPriority,
              title: pushTitle,
              msg: pushMsg,
              tagline
            });
          }
        }
      }

      const eventTime = parseTimeTomorrow(time, _title);

      const { isWithin, isLastDay: _isLastDay } = evaluateTimespan({ date: eventTime, from, until });

      const isLastDay = _isLastDay || this.isLastDaySpecificCheckForWeeklyNotifier(eventTime, entry);

      const isLastEvent = this.isLastEvent({ isLastDay, time, when, eventWeekDay });
      const lastTag = this.lastEventTag(isLastEvent);

      const title = `${_title}${lastTag}`;

      if (isWithin && !this.shouldSkip(eventTime, entry)) {
        if ((now.getDay() + 1) % 7 == eventWeekDay) {
          const notificationTime = subMinutes(eventTime, notifyMinutesBefore);

          if (isSameMinute(now, notificationTime) && isToday(notificationTime)) {
            const { datetime, inTime } = describeNearTime(program, parseTimeTomorrow(time, title));

            const pushTitle = `${o.symbol} ${title}`.trim();

            const tagline = `${CLOCK_SYMBOL} ${datetime}${inTime ? ` [ ${inTime} ]` : ''}`;

            const pushMsg = msg ? `${tagline}\n\n${msg}` : tagline;

            this.callback({
              ...o,
              _title: title,
              highPriority,
              title: pushTitle,
              msg: pushMsg,
              tagline
            });
          }
        }

        if (notifyDayBeforeAt.length > 0 && (now.getDay() + 1) % 7 == eventWeekDay) {
          for (const t of notifyDayBeforeAt) {
            const notificationTime = parseTimeToday(t, title);

            if (isSameMinute(now, notificationTime)) {
              const pushTitle = `${o.symbol} ${title}`;

              const tagline = `${TOMORROW_SYMBOL} ${strTomorrow} ${strAt} ${time}`;

              const pushMsg = msg ? `${tagline}\n\n${msg}` : tagline;

              this.callback({ ...o, _title: title, title: pushTitle, msg: pushMsg, tagline, isDayBefore: true });
            }
          }
        }
      }
    }
  }

  isLastDaySpecificCheckForWeeklyNotifier(_eventTime, entry) {
    const { when, from, until } = entry;

    for (let i = 1; i <= 30; i++) {
      const eventTime = addDays(_eventTime, i);

      for (const _t of Array(when).flat()) {
        const { dow } = this.parse(_t);

        if (!evaluateTimespan({ date: eventTime, from, until }).isWithin) {
          return true;
        }

        if (eventTime.getDay() == dow && !this.shouldSkip(eventTime, entry)) {
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

  isLastEvent({ isLastDay, when, time, eventWeekDay }) {
    return isLastDay && this.latestTime(this.findAllTimesForDOW(eventWeekDay, when)) == time;
  }

  lastEventTag(isLastEvent) {
    const { strLastTime } = localize(program);
    return isLastEvent ? ` [ ${LAST_EVENT_SYMBOL} ${strLastTime} ]` : '';
  }

  check() {
    for (const entry of this.notifications) {
      if (entry.to) {
        throw new Error(`${this.ident} Please use 'until' instead of 'to'`);
      }

      this.checkNotificationTimes(entry);
    }
  }
}

export default function weeklyNotifier(notifications, options = {}) {
  const decommissionable = isReloadableNotifications(new Error(), import.meta.url);

  return new WeeklyNotifier(notifications, options, decommissionable);
}
