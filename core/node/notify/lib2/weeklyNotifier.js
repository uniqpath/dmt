import { dateFns, program, colors, holidayDataExists, isHoliday, timeutils, log } from 'dmt/common';

const { formatFutureDistance } = timeutils;

const { isSameMinute, subMinutes, isToday, addDays, differenceInWeeks, startOfWeek, differenceInMinutes, isBefore, addMinutes, format } = dateFns;

import ScopedNotifier from './base/scopedNotifier.js';

import { isReloadableNotifications } from './lib/isReloadableNotifications.js';
import priorityArray from './lib/priorityArray.js';
import parseTimeToday from './lib/parseTimeToday.js';
import parseTimeTomorrow from './lib/parseTimeTomorrow.js';
import convertTimeTo24hFormat from './lib/convertTimeTo24hFormat.js';
import { evaluateTimespan } from './lib/evaluateTimespan.js';
import describeNearTime from './lib/describeNearTime.js';
import localize from './lib/localize.js';

const LAST_EVENT_SYMBOL = '✅';
const NOW_SYMBOL = '🫵';
const CLOCK_SYMBOL = '🕛';
const FINISH_SYMBOL = '🏁';
const TOMORROW_SYMBOL = '⏳';
const EXCLAMATION_SYMBOL = '❗';

const NOTIFIER_DEFAULT_TIME = '10:00';

function isNthWeek(date, n, referenceDate = null) {
  const reference = referenceDate || new Date('2024-01-01');
  const weeksSinceReference = differenceInWeeks(startOfWeek(date), startOfWeek(reference));
  const diff = Math.abs(weeksSinceReference);
  if (n == 1) {
    return diff % 2 != 0;
  }
  return diff % n === 0;
}

class WeeklyNotifier extends ScopedNotifier {
  constructor(
    notifications,
    {
      symbol = '🔔',
      notifyDayBeforeAt,
      notifySameDayAt,
      omitAtEventTime,
      notifyMinutesBefore,
      duration,
      title,
      color,
      app,
      ttl,
      highPriority,
      skipOnHolidays,
      excludedRanges,
      user,
      users
    } = {},
    decommissionable = false
  ) {
    super(symbol, decommissionable);

    this.notifications = Array(notifications).flat(Infinity);

    this.title = title;
    this.symbol = symbol;
    this.color = color;
    this.ttl = ttl;
    this.highPriority = !!highPriority;
    this.app = app;

    this.notifyDayBeforeAt = notifyDayBeforeAt;
    this.notifySameDayAt = notifySameDayAt;
    this.notifyMinutesBefore = notifyMinutesBefore;
    this.omitAtEventTime = omitAtEventTime;
    this.duration = duration;

    this.skipOnHolidays = skipOnHolidays;
    this.excludedRanges = excludedRanges;

    this.user = user || users;
  }

  shouldSkip(date, entry, excludedRanges) {
    const sh = this.skipOnHolidays || entry.skipOnHolidays;

    if (excludedRanges) {
      for (const range of excludedRanges) {
        if (evaluateTimespan({ date, from: range.from, until: range.until }).isWithin) {
          return true;
        }
      }
    }

    if (sh) {
      const country = typeof sh === 'string' ? sh : program.country();
      return holidayDataExists(country) && isHoliday(date, { country });
    }
  }

  parse(_t) {
    const DOW = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

    const [__dow, _time] = _t.replace(' at ', ' ').split(' ');

    const time = convertTimeTo24hFormat(_time || NOTIFIER_DEFAULT_TIME);

    let _dow = __dow;
    let week;

    if (__dow.includes('/')) {
      const [dayPart, weekPart] = __dow.split('/');
      _dow = dayPart;
      week = parseInt(weekPart);
    }

    const dow = DOW.indexOf(_dow.toLowerCase());

    if (dow == -1) {
      throw new Error(
        `Day of week error: ${colors.yellow(_dow)} - in ${colors.yellow(_t)} - ${this.constructor.name} - allowed: ${colors.green(DOW.join(', '))}`
      );
    }

    return { time, dow, week };
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
      duration: _duration,
      notifyMinutesBefore: _notifyMinutesBefore,
      notifySameDayAt: _notifySameDayAt,
      omitAtEventTime: _omitAtEventTime,
      highPriority: _highPriority,
      notifyDayBeforeAt: _notifyDayBeforeAt,
      url,
      excludedRanges: _excludedRanges
    } = entry;

    const msg = Array.isArray(msgStrOrArray) ? this.randomElement(msgStrOrArray) : msgStrOrArray;
    const titleStrOrArray = entry.title || this.title || '';
    const _title = Array.isArray(titleStrOrArray) ? this.randomElement(titleStrOrArray) : titleStrOrArray;

    const excludedRanges = _excludedRanges || this.excludedRanges;
    const duration = _duration || this.duration;

    const omitAtEventTime = _omitAtEventTime == undefined ? this.omitAtEventTime : _omitAtEventTime;

    const notifyMinutesBefore = priorityArray(_notifyMinutesBefore, this.notifyMinutesBefore);
    if (notifyMinutesBefore.length == 0 && !omitAtEventTime) {
      notifyMinutesBefore.push(0);
    }

    const uniqueArray = arr => [...new Set(arr)];

    const notifySameDayAt = uniqueArray(priorityArray(_notifySameDayAt, this.notifySameDayAt));

    const highPriority = _highPriority == undefined ? this.highPriority : _highPriority;

    const notifyDayBeforeAt = uniqueArray(priorityArray(_notifyDayBeforeAt, this.notifyDayBeforeAt));

    const entryUser = entry.user || entry.users;
    const user = entryUser == undefined ? this.user : entryUser;

    for (const _t of Array(when).flat()) {
      const { time, dow: eventWeekDay, week } = this.parse(_t);

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
        app: this.app,
        data: entry.data || {}
      };

      if (now.getDay() == eventWeekDay && (!week || isNthWeek(now, week))) {
        const eventTime = parseTimeToday(time, _title);

        o.eventTime = eventTime;

        const { isWithin, isLastDay: _isLastDay } = evaluateTimespan({ date: eventTime, from, until });

        if (isWithin && !this.shouldSkip(eventTime, entry, excludedRanges)) {
          const _minutesBefore = [...notifyMinutesBefore];

          for (const t of notifySameDayAt) {
            const notifyTime = parseTimeToday(t);
            if (isBefore(notifyTime, eventTime)) {
              const diffInMinutes = differenceInMinutes(eventTime, notifyTime);
              _minutesBefore.push(diffInMinutes);
            }
          }

          const minutesBefore = uniqueArray(_minutesBefore);

          minutesBefore
            .sort((a, b) => b - a)
            .forEach((minBefore, index) => {
              const notificationTime = subMinutes(eventTime, minBefore);

              if (isSameMinute(now, notificationTime)) {
                const isLastDay = _isLastDay || this.isLastDaySpecificCheckForWeeklyNotifier(eventTime, entry, excludedRanges);

                const { datetime, inTime, isNow } = describeNearTime(parseTimeToday(time, _title));

                const isLastEvent = this.isLastEvent({ isLastDay, time, when, eventWeekDay });
                const lastTag = this.lastEventTag(isLastEvent);

                const { capitalizeFirstLetter, strFrom, strUntil } = localize(program);

                const brevityTagline = !isNow && minutesBefore.length >= 2 && minBefore <= 30 && minutesBefore.length - 1 == index;

                let tagline =
                  isNow && msg
                    ? undefined
                    : `${isNow ? NOW_SYMBOL : CLOCK_SYMBOL}${brevityTagline ? '' : ` ${datetime}`}${
                        inTime ? ` ${brevityTagline ? capitalizeFirstLetter(inTime) : `[ ${inTime} ]`}` : ''
                      }${!isNow && minBefore <= 30 ? EXCLAMATION_SYMBOL : ''}`;

                if (duration && minutesBefore.length - 1 == index) {
                  const endTime = addMinutes(eventTime, duration);
                  const startTimeStr = format(eventTime, 'HH:mm');
                  const endTimeStr = format(endTime, 'HH:mm');
                  tagline = `${tagline || ''}${tagline ? '\n' : ''}${FINISH_SYMBOL} `;
                  if (brevityTagline) {
                    tagline += `${capitalizeFirstLetter(strFrom)} ${startTimeStr} ${strUntil} ${endTimeStr}`;
                  } else {
                    tagline += `${capitalizeFirstLetter(strUntil)} ${endTimeStr}`;
                  }
                }

                const title = `${_title}${lastTag}`;
                const pushTitle = `${o.symbol} ${title}`.trim();
                const pushMsg = msg ? `${tagline ? `${tagline}\n\n` : ''}${msg}` : tagline;

                const isLastNotification = index === minutesBefore.length - 1;

                this.callback({
                  ...o,
                  _title: title,
                  highPriority: isLastNotification ? highPriority : false,
                  title: pushTitle,
                  msg: pushMsg,
                  tagline
                });
              }
            });
        }
      }

      const eventTime = parseTimeTomorrow(time, _title);

      const { isWithin, isLastDay: _isLastDay } = evaluateTimespan({ date: eventTime, from, until });

      const isLastDay = _isLastDay || this.isLastDaySpecificCheckForWeeklyNotifier(eventTime, entry, excludedRanges);

      const isLastEvent = this.isLastEvent({ isLastDay, time, when, eventWeekDay });
      const lastTag = this.lastEventTag(isLastEvent);

      const title = `${_title}${lastTag}`;

      if (isWithin && !this.shouldSkip(eventTime, entry, excludedRanges)) {
        if ((now.getDay() + 1) % 7 == eventWeekDay && (!week || isNthWeek(eventTime, week))) {
          for (const minBefore of notifyMinutesBefore) {
            const notificationTime = subMinutes(eventTime, minBefore);

            if (isSameMinute(now, notificationTime) && isToday(notificationTime)) {
              const { datetime, inTime } = describeNearTime(parseTimeTomorrow(time, title));

              const pushTitle = `${o.symbol} ${title}`.trim();

              const tagline = `${CLOCK_SYMBOL}${datetime}${inTime ? ` [ ${inTime} ]` : ''}`;

              const pushMsg = msg ? `${tagline}\n\n${msg}` : tagline;

              this.callback({
                ...o,
                _title: title,
                highPriority,
                title: pushTitle,
                msg: pushMsg,
                isToday: true,
                tagline
              });
            }
          }
        }

        if (notifyDayBeforeAt.length > 0 && (now.getDay() + 1) % 7 == eventWeekDay && (!week || isNthWeek(eventTime, week))) {
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

  isLastDaySpecificCheckForWeeklyNotifier(_eventTime, entry, excludedRanges) {
    const { when, from, until } = entry;

    for (let i = 1; i <= 30; i++) {
      const eventTime = addDays(_eventTime, i);

      for (const _t of Array(when).flat()) {
        const { dow } = this.parse(_t);

        if (!evaluateTimespan({ date: eventTime, from, until }).isWithin) {
          return true;
        }

        if (eventTime.getDay() == dow && !this.shouldSkip(eventTime, entry, excludedRanges)) {
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
