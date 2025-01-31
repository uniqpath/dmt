import { dateFns, program, SeededRandom, log, timeutils } from 'dmt/common';

const { parse, isAfter, addDays, isBefore, isSameDay, isSameMinute, addMinutes, subMinutes, differenceInCalendarDays, differenceInMinutes, format } = dateFns;

import ScopedNotifier from './base/scopedNotifier.js';

import { isReloadableNotifications } from './lib/isReloadableNotifications.js';
import priorityArray from './lib/priorityArray.js';
import detectMonthlyFrequency from './lib/detectMonthlyFrequency.js';
import parseTimeToday from './lib/parseTimeToday.js';
import convertDateToEUFormat from './lib/convertDateToEUFormat.js';
import convertTimeTo24hFormat from './lib/convertTimeTo24hFormat.js';
import describeNearTime from './lib/describeNearTime.js';
import describeNearFuture from './lib/describeNearFuture.js';
import prepareAndPrehashObj from './lib/prepareAndPrehashObj.js';
import getDedupKey from '../lib/pushover/getDedupKey.js';
import localize from './lib/localize.js';
import { evaluateTimespan } from './lib/evaluateTimespan.js';

import dateTemplate from './lib/dateTemplate.js';

const { monthsAgo } = timeutils;

const CLOCK_SYMBOL = '🕛';
const NOW_SYMBOL = '🫵';
const TOMORROW_SYMBOL = '⏳';
const FINISH_SYMBOL = '🏁';
const CALENDAR_SYMBOL = '🗓️';
const SCROLL_SYMBOL = '📜';
const EXCLAMATION_SYMBOL = '❗';

const NOTIFIER_DEFAULT_TIME = '10:00';

function addDays2(date, days) {
  let newDate = new Date(date.getTime());

  if (days % 365 == 0) {
    newDate.setFullYear(newDate.getFullYear() + days / 365);
  } else if (days <= 180 && days % 30 == 0) {
    newDate.setMonth(newDate.getMonth() + days / 30);
  } else {
    newDate = addDays(date, days);
  }

  return newDate;
}

function pseudoRandomNumberFromString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }

  const seededRandom = Math.sin(hash) * 10000;
  const randomDecimal = seededRandom - Math.floor(seededRandom);

  return Math.floor(randomDecimal * 30);
}

class DateNotifier extends ScopedNotifier {
  constructor(
    notifications,
    {
      symbol,
      title,
      color,
      ttl,
      ttlGui,
      highPriority,
      notifySameDayAt,
      omitAtEventTime,
      notifyDayBeforeAt,
      app,
      defaultTime,
      duration,
      notifyMinutesBefore,
      notifyDaysBefore,
      disableDaysBeforeMessageCount,
      notifyDaysAfter,
      repeatDaysAfter,
      everyNthYear,
      user,
      users,
      url,
      urlTitle,
      enableHtml
    } = {},
    decommissionable = false
  ) {
    super(symbol, decommissionable);

    this.notifications = Array(notifications).flat(Infinity);
    this.app = app;

    this.url = url;
    this.urlTitle = urlTitle;
    this.enableHtml = enableHtml;

    for (const n of this.notifications) {
      n.hasRandomPeriodicEvents = Array(n.when)
        .flat()
        .map(w => detectMonthlyFrequency(w))
        .find(({ matchesWeekly, matchesMonthly }) => matchesWeekly || matchesMonthly);

      n.when = Array(n.when)
        .flat()
        .map(w => this.parseMonthlyFrequency(w, this.getBaseSeed(w, n)))
        .flat();
    }

    this.title = title;
    this.symbol = symbol;
    this.color = color;
    this.ttl = ttl;
    this.ttlGui = ttlGui;
    this.highPriority = !!highPriority;

    this.notifySameDayAt = notifySameDayAt;
    this.omitAtEventTime = omitAtEventTime;
    this.notifyDayBeforeAt = notifyDayBeforeAt;
    this.notifyMinutesBefore = notifyMinutesBefore;
    this.notifyDaysBefore = notifyDaysBefore;
    this.disableDaysBeforeMessageCount = disableDaysBeforeMessageCount;
    this.duration = duration;

    this.defaultTime = defaultTime;
    this.everyNthYear = everyNthYear;
    this.notifyDaysAfter = notifyDaysAfter;
    this.repeatDaysAfter = repeatDaysAfter;

    this.user = user || users;
  }

  getBaseSeed(whenStr, entry) {
    const titleStrOrArray = entry.title || this.title || '';
    const title = Array.isArray(titleStrOrArray) ? titleStrOrArray.join('') : titleStrOrArray;
    const msg = Array.isArray(entry.msg) ? entry.msg.join('') : entry.msg;

    const entryUser = entry.user || entry.users;
    const user = entryUser == undefined ? this.user : entryUser;

    let str = whenStr;

    str += title || '';
    str += msg || '';
    str += user || '';

    return pseudoRandomNumberFromString(str);
  }

  parseMonthlyFrequency(whenStr, baseSeed = 0) {
    const { matchesWeekly, matchesMonthly } = detectMonthlyFrequency(whenStr);

    const AVG_DAYS_IN_MONTH = 30;

    const MAX_MONTHLY = 15;

    const FROM_HOUR = 8;
    const TO_HOUR = 20;

    const list = [];
    const year = new Date().getFullYear();

    let freqMonthly;

    if (matchesMonthly) {
      freqMonthly = matchesMonthly[1];
    }

    if (matchesWeekly) {
      freqMonthly = 4 * matchesWeekly[1];
    }

    if (freqMonthly > MAX_MONTHLY) {
      log.cyan(`⚠️  Converting '${whenStr}' to '${MAX_MONTHLY}x monthly' (${this.ident})`);
      freqMonthly = Math.min(MAX_MONTHLY, freqMonthly);
    }

    if (freqMonthly) {
      const regexTime = /\bat (.*)$/i;

      const matchesTime = whenStr.trim().match(regexTime);

      let _time;

      if (matchesTime) {
        _time = matchesTime[1];
      }

      for (let month = 1; month <= 12; month++) {
        const seed = baseSeed + 2 * month + year;

        const rand = new SeededRandom(seed);

        const step = Math.round(AVG_DAYS_IN_MONTH / freqMonthly);

        for (let x = 0; x < freqMonthly; x++) {
          const time = _time || `${FROM_HOUR + Math.floor((TO_HOUR - FROM_HOUR) * rand.next())}:00`;
          const day = freqMonthly == 1 ? `${12 + Math.floor(6 * rand.next())}` : `${x * step + 1 + Math.floor(0.75 * step * rand.next())}`;
          list.push(`${day}.${month}. ${time}`);
        }
      }

      return list;
    }

    return whenStr;
  }

  checkNotificationTimes(entry, fakeNow) {
    const now = fakeNow || new Date();

    const {
      when,
      msg: msgStrOrArray,
      duration: _duration,
      notifyMinutesBefore: _notifyMinutesBefore,
      notifyDayBeforeAt: _notifyDayBeforeAt,
      notifySameDayAt: _notifySameDayAt,
      omitAtEventTime: _omitAtEventTime,
      notifyDaysBefore: _notifyDaysBefore,
      disableDaysBeforeMessageCount: _disableDaysBeforeMessageCount,
      defaultTime: _defaultTime,
      everyNthYear: _everyNthYear,
      notifyDaysAfter: _notifyDaysAfter,
      repeatDaysAfter: _repeatDaysAfter,
      color,
      ttl,
      ttlGui,
      from,
      until,
      highPriority: _highPriority,
      url: _url,
      urlTitle: _urlTitle,
      enableHtml: _enableHtml,
      id
    } = entry;

    let msg = Array.isArray(msgStrOrArray) ? this.randomElement(msgStrOrArray) : msgStrOrArray;

    const titleStrOrArray = entry.title || this.title || '';
    let title = Array.isArray(titleStrOrArray) ? this.randomElement(titleStrOrArray) : titleStrOrArray;

    const duration = _duration || this.duration;

    const everyNthYear = _everyNthYear || this.everyNthYear;

    if (everyNthYear) {
      if (program.lang() == 'sl') {
        if (everyNthYear == 1) {
          title = `${title} [ vsako leto ]`;
        } else {
          let years = 'let';

          if (everyNthYear == 2) {
            years = 'leti';
          }
          if (everyNthYear == 3 || everyNthYear == 4) {
            years = 'leta';
          }

          title = `${title} [ na ${everyNthYear} ${years} ]`;
        }
      } else {
        title = everyNthYear == 1 ? `${title} [ every year ]` : `${title} [ every ${everyNthYear} years ]`;
      }
    }

    let notifyDaysAfter = _notifyDaysAfter || this.notifyDaysAfter;

    if (notifyDaysAfter) {
      notifyDaysAfter = Array.isArray(notifyDaysAfter) ? notifyDaysAfter : [notifyDaysAfter];
    }

    const repeatDaysAfter = _repeatDaysAfter || this.repeatDaysAfter;

    let repeatFinalDaysAfter;

    if (repeatDaysAfter) {
      repeatFinalDaysAfter = true;
      notifyDaysAfter = Array.isArray(repeatDaysAfter) ? repeatDaysAfter : [repeatDaysAfter];
    }

    const symbolStrOrArray = entry.symbol || this.symbol;
    let _symbol = Array.isArray(symbolStrOrArray) ? this.randomElement(symbolStrOrArray) : symbolStrOrArray;
    if (!_symbol) {
      _symbol = notifyDaysAfter ? SCROLL_SYMBOL : CALENDAR_SYMBOL;
    }

    const uniqueArray = arr => [...new Set(arr)];

    const omitAtEventTime = _omitAtEventTime == undefined ? this.omitAtEventTime : _omitAtEventTime;
    const disableDaysBeforeMessageCount = _disableDaysBeforeMessageCount == undefined ? this.disableDaysBeforeMessageCount : _disableDaysBeforeMessageCount;

    const notifyMinutesBefore = priorityArray(_notifyMinutesBefore, this.notifyMinutesBefore);
    if (notifyMinutesBefore.length == 0 && !omitAtEventTime) {
      notifyMinutesBefore.push(0);
    }

    const highPriority = _highPriority == undefined ? this.highPriority : _highPriority;
    const enableHtml = _enableHtml == undefined ? this.enableHtml : _enableHtml;

    const url = _url == undefined ? this.url : _url;
    const urlTitle = _urlTitle == undefined ? this.urlTitle : _urlTitle;

    const notifySameDayAt = uniqueArray(priorityArray(_notifySameDayAt, this.notifySameDayAt));

    const notifyDayBeforeAt = uniqueArray(priorityArray(_notifyDayBeforeAt, this.notifyDayBeforeAt));

    const __notifyDaysBefore = uniqueArray(priorityArray(_notifyDaysBefore, this.notifyDaysBefore));

    const omitOnDayOfEvent = !!__notifyDaysBefore.find(x => x == -1 || x == null);
    const notifyDaysBefore = __notifyDaysBefore.filter(x => x != 0 && x != -1 && x != null);
    if (notifyDayBeforeAt.length > 0 && !notifyDaysBefore.includes(1)) {
      notifyDaysBefore.push(1);
    }

    let defaultTime = _defaultTime || this.defaultTime;
    if (Array.isArray(defaultTime) && defaultTime.length == 1) {
      defaultTime = defaultTime[0];
    }

    const entryUser = entry.user || entry.users;
    const user = entryUser == undefined ? this.user : entryUser;

    let list = when.map(t => this.getTimepoint({ t, defaultTime }));

    const mostRecentEvent = list.reduce((latest, current) => (isAfter(current.timepoint, latest.timepoint) ? current : latest));

    const isPastEvent = isAfter(now, addMinutes(mostRecentEvent.timepoint, 1));

    if (isPastEvent && notifyDaysAfter) {
      const { timepoint, time, isUnspecifiedTime } = mostRecentEvent;

      const SECOND_MSG_MIN = 10 * 60;

      list = [];

      for (const days of notifyDaysAfter) {
        list.push({ timepoint: addDays2(timepoint, days), time, isUnspecifiedTime });
        list.push({ timepoint: addMinutes(addDays2(timepoint, days), SECOND_MSG_MIN), time, isUnspecifiedTime });
      }

      if (repeatFinalDaysAfter) {
        const lastDayAfter = notifyDaysAfter[notifyDaysAfter.length - 1];

        for (let i = 2; i < 100; i++) {
          list.push({ timepoint: addDays2(timepoint, i * lastDayAfter), time, isUnspecifiedTime });
          list.push({ timepoint: addMinutes(addDays2(timepoint, i * lastDayAfter), SECOND_MSG_MIN), time, isUnspecifiedTime });
        }
      }

      const diffDays = differenceInCalendarDays(now, timepoint);

      msg = `${SCROLL_SYMBOL} ${format(timepoint, 'd.M.yyyy')} { ${monthsAgo(diffDays)} }${msg ? `\n\n${msg}` : ''}`;
    }

    for (const { timepoint, time, isUnspecifiedTime } of list) {
      if (everyNthYear && timepoint.getFullYear() % everyNthYear != 0) {
        continue;
      }

      const o = {
        deviceId: program.device.id,
        highPriority: false,
        _title: title,
        _msg: msg,
        color: color || this.color,
        ttl: ttl || this.ttl,
        ttlGui: ttlGui || this.ttlGui,
        user,
        id,
        url,
        urlTitle,
        enableHtml,
        eventTime: timepoint,
        data: entry.data || {}
      };

      const { strToday, strAt, strFrom, strUntil, capitalizeFirstLetter } = localize(program);

      const { isWithin } = evaluateTimespan({ date: timepoint, from, until });

      if (isWithin) {
        const importantEvent = list.length == 1 && notifyDaysBefore.filter(el => el != 1).length > 0;

        if (!omitOnDayOfEvent) {
          const _minutesBefore = isPastEvent || isUnspecifiedTime ? [0] : [...notifyMinutesBefore];

          if (!isPastEvent) {
            for (const t of notifySameDayAt) {
              const notifyTime = parseTimeToday({ time: t, now });
              if (isSameDay(notifyTime, timepoint) && isBefore(notifyTime, timepoint)) {
                const diffInMinutes = differenceInMinutes(timepoint, notifyTime);
                _minutesBefore.push(diffInMinutes);
              }
            }
          }

          const minutesBefore = uniqueArray(_minutesBefore).sort((a, b) => b - a);

          minutesBefore.forEach((min, index) => {
            const notificationTime = subMinutes(timepoint, min);

            if (isSameMinute(now, notificationTime)) {
              const { datetime, inTime, isNow, isPast } = describeNearTime(timepoint);

              const isLastNotification = index === minutesBefore.length - 1;

              const brevityTagline = minutesBefore.length >= 2 && min <= 30 && isLastNotification && !isPast;

              let _tagline =
                isNow && msg
                  ? undefined
                  : `${isNow ? NOW_SYMBOL : CLOCK_SYMBOL}${brevityTagline ? '' : ` ${datetime}`}${
                      inTime ? ` ${brevityTagline ? capitalizeFirstLetter(inTime) : `[ ${inTime} ]`}` : ''
                    }${(!isNow && min <= 30) || isPast ? EXCLAMATION_SYMBOL : ''}`;

              if (duration && minutesBefore.length - 1 == index) {
                const endTime = addMinutes(timepoint, duration);
                const startTimeStr = format(timepoint, 'HH:mm');
                const endTimeStr = format(endTime, 'HH:mm');
                _tagline = `${_tagline || ''}${_tagline ? '\n' : ''}${FINISH_SYMBOL} `;
                if (brevityTagline) {
                  _tagline += `${capitalizeFirstLetter(strFrom)} ${startTimeStr} ${strUntil} ${endTimeStr}`;
                } else {
                  _tagline += `${capitalizeFirstLetter(strUntil)} ${endTimeStr}`;
                }
              }

              const __tagline = isUnspecifiedTime ? undefined : _tagline;

              let tagline = __tagline;

              if (!__tagline && !msg) {
                tagline = `[ ${strToday} ]`;
              }

              const symbol =
                !notifyDaysAfter && isLastNotification && !entry.hasRandomPeriodicEvents && (importantEvent || this.isLastEvent({ list, timepoint }))
                  ? `${_symbol}${EXCLAMATION_SYMBOL}`
                  : _symbol;

              const pushTitle = `${symbol} ${title}`.trim();
              const pushMsg = msg ? `${tagline ? `${tagline}\n\n` : ''}${msg}` : tagline;

              const obj = {
                ...o,
                title: pushTitle,
                msg: pushMsg,
                symbol,
                tagline,
                app: this.app,
                isToday: true,
                highPriority: isLastNotification ? highPriority : false,
                dedupKey: getDedupKey(now)
              };

              this.handleMessage(prepareAndPrehashObj({ obj, msg, now, delayWarning: !(isPastEvent && notifyDaysAfter) }));
            }
          });
        }

        if (!isPastEvent) {
          notifyDaysBefore
            .sort((a, b) => b - a)
            .forEach((daysBefore, index) => {
              if (isSameDay(timepoint, addDays(now, daysBefore))) {
                const times = [];

                if (daysBefore == 1 && notifyDayBeforeAt.length > 0) {
                  times.push(...notifyDayBeforeAt);
                } else {
                  times.push(time);
                }

                for (const t of times) {
                  const notificationTime = parseTimeToday({ time: t, tag: title, now });

                  if (isSameMinute(now, notificationTime)) {
                    const isDayBefore = daysBefore == 1;

                    const symbol = _symbol;

                    const pushTitle = `${symbol} ${title}`;

                    const { inDays, strFuture } = describeNearFuture(timepoint, daysBefore);

                    let tagline = `${isDayBefore ? TOMORROW_SYMBOL : CALENDAR_SYMBOL} ${strFuture} ${isUnspecifiedTime ? '' : `${strAt} ${time}`}`.trim();

                    if (!disableDaysBeforeMessageCount && notifyDaysBefore.length >= 2) {
                      const sequenceDigits = ['0️⃣', '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];
                      const remainingCount = notifyDaysBefore.length - index - (omitOnDayOfEvent ? 1 : 0);
                      const digitIcon = remainingCount > 10 ? `${sequenceDigits[10]}➕` : sequenceDigits[remainingCount];
                      if (remainingCount > 1) {
                        tagline = `${tagline}\n\n[ Will send ${digitIcon} more ${remainingCount == 1 ? 'reminder' : 'reminders'} ]`;
                      }
                    }

                    const pushMsg = msg ? `${tagline ? `${tagline}\n\n` : ''}${msg}` : tagline;

                    const obj = {
                      ...o,
                      title: pushTitle,
                      msg: pushMsg,
                      app: this.app,
                      tagline,
                      isDayBefore,
                      inDays,
                      symbol,
                      dedupKey: getDedupKey(now)
                    };

                    this.handleMessage(prepareAndPrehashObj({ obj, msg, now, delayWarning: false }));
                  }
                }
              }
            });
        }
      }
    }
  }

  getTimepoint({ t, defaultTime }) {
    const [_date, _time] = t.replace(' at ', ' ').split(' ');

    const __time = _time || defaultTime || NOTIFIER_DEFAULT_TIME;

    const isUnspecifiedTime = !_time && !defaultTime;

    const time = convertTimeTo24hFormat(__time);

    const defaultYear = new Date().getFullYear();
    const timepoint = parse(`${convertDateToEUFormat(_date, defaultYear)} ${time}`, `${dateTemplate} H:mm`, new Date());

    return { timepoint, time, isUnspecifiedTime };
  }

  isLastEvent({ list, timepoint }) {
    if (list.length > 1) {
      return !list.find(t => isAfter(t.timepoint, timepoint));
    }
  }

  check(fakeNow) {
    for (const entry of this.notifications) {
      this.checkNotificationTimes(entry, fakeNow);
    }
  }
}

export default function dateNotifier(notifications, options = {}, nestedNotifier = false) {
  const decommissionable = isReloadableNotifications(new Error(), import.meta.url);

  const notifier = new DateNotifier(notifications, options, decommissionable);

  return nestedNotifier ? notifier : program.registerNotifier(notifier);
}
