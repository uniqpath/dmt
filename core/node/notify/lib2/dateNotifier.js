import { dateFns, program, SeededRandom, log } from 'dmt/common';

const { parse, isAfter, isTomorrow, isSameMinute, subMinutes } = dateFns;

import ScopedNotifier from './base/scopedNotifier.js';

import parseTimeToday from './lib/parseTimeToday.js';
import convertDateToEUFormat from './lib/convertDateToEUFormat.js';
import convertTimeTo24hFormat from './lib/convertTimeTo24hFormat.js';
import describeNearTime from './lib/describeNearTime.js';
import localize from './lib/localize.js';

import dateTemplate from './lib/dateTemplate.js';

const CLOCK_SYMBOL = '🕛';
const NOW_SYMBOL = '🫵';
const TOMORROW_SYMBOL = '⏳';
const LAST_EVENT = '❗';
const GLOBAL_DEFAULT_TIME = '10:00';

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
  constructor(notifications, { symbol = '📅', title, color, ttl, highPriority, notifyDayBeforeAt, notifyMinutesBefore = 0, user } = {}) {
    super(symbol);

    this.notifications = Array(notifications).flat(Infinity);

    for (const n of this.notifications) {
      n.when = Array(n.when)
        .flat()
        .map(w => this.parseMonthlyFrequency(w, this.getBaseSeed(w, n)))
        .flat();
    }

    this.title = title;
    this.symbol = symbol;
    this.color = color;
    this.ttl = ttl;
    this.highPriority = !!highPriority;

    this.notifyDayBeforeAt = notifyDayBeforeAt;
    this.notifyMinutesBefore = notifyMinutesBefore;

    this.user = user;
  }

  getBaseSeed(whenStr, entry) {
    const titleStrOrArray = entry.title || this.title || '';
    const title = Array.isArray(titleStrOrArray) ? titleStrOrArray.join('') : titleStrOrArray;
    const msg = Array.isArray(entry.msg) ? entry.msg.join('') : entry.msg;
    const user = entry.user == undefined ? this.user : entry.user;

    let str = whenStr;

    str += title || '';
    str += msg || '';
    str += user || '';

    return pseudoRandomNumberFromString(str);
  }

  parseMonthlyFrequency(whenStr, baseSeed = 0) {
    const regexMonthly = /^(\d+)x month(?:ly)?\b/i;
    const regexWeekly = /^(\d+)x week(?:ly)?\b/i;

    const matchesMonthly = whenStr.trim().match(regexMonthly);
    const matchesWeekly = whenStr.trim().match(regexWeekly);

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
      log.red(`⚠️  Converting '${whenStr}' to '${MAX_MONTHLY}x monthly' (${this.ident})`);
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

  checkNotificationTimes(entry) {
    const date = new Date();

    const {
      when,
      msg: msgStrOrArray,
      notifyMinutesBefore: _notifyMinutesBefore,
      notifyDayBeforeAt: _notifyDayBeforeAt,
      defaultTime,
      color,
      ttl,
      highPriority: _highPriority,
      user: _user,
      id
    } = entry;

    const msg = Array.isArray(msgStrOrArray) ? this.randomElement(msgStrOrArray) : msgStrOrArray;

    const titleStrOrArray = entry.title || this.title || '';
    const title = Array.isArray(titleStrOrArray) ? this.randomElement(titleStrOrArray) : titleStrOrArray;

    const symbolStrOrArray = entry.symbol || this.symbol;
    const _symbol = Array.isArray(symbolStrOrArray) ? this.randomElement(symbolStrOrArray) : symbolStrOrArray;

    const notifyMinutesBefore = _notifyMinutesBefore == undefined ? this.notifyMinutesBefore : _notifyMinutesBefore || 0;
    const highPriority = _highPriority == undefined ? this.highPriority : _highPriority;
    const notifyDayBeforeAt = Array((_notifyDayBeforeAt == undefined ? this.notifyDayBeforeAt : _notifyDayBeforeAt || []) || []).flat();
    const user = _user == undefined ? this.user : _user;

    const list = when.map(t => this.getTimepoint({ t, defaultTime }));

    for (const { timepoint, time, isUnspecifiedTime } of list) {
      const symbol = this.isLastEvent({ list, timepoint }) ? `${_symbol}${LAST_EVENT}` : _symbol;

      const o = {
        deviceId: program.device.id,
        symbol,
        highPriority: false,
        _title: title,
        _msg: msg,
        color: color || this.color,
        ttl: ttl || this.ttl,
        user,
        id,
        data: entry.data || {}
      };

      const notificationTime = subMinutes(timepoint, isUnspecifiedTime ? 0 : notifyMinutesBefore);

      const { strToday, strTomorrow, strAt } = localize(program);

      if (isSameMinute(date, notificationTime)) {
        const { datetime, inTime, isNow } = describeNearTime(program, timepoint);

        const _tagline = isNow && msg ? undefined : `${isNow ? NOW_SYMBOL : CLOCK_SYMBOL} ${datetime}${inTime ? ` [ ${inTime} ]` : ''}`;

        const __tagline = isUnspecifiedTime ? undefined : _tagline;

        let tagline = __tagline;

        if (!__tagline && !msg) {
          tagline = `[ ${strToday} ]`;
        }

        const pushTitle = `${symbol} ${title}`.trim();
        const pushMsg = msg ? `${tagline ? `${tagline}\n\n` : ''}${msg}` : tagline;

        this.callback({
          ...o,
          highPriority,
          title: pushTitle,
          msg: pushMsg,
          tagline
        });
      }

      if (isTomorrow(timepoint)) {
        for (const t of notifyDayBeforeAt) {
          const notificationTime = parseTimeToday(t, title);

          if (isSameMinute(date, notificationTime)) {
            const pushTitle = `${symbol} ${title}`;

            const tagline = `${TOMORROW_SYMBOL} ${strTomorrow} ${isUnspecifiedTime ? '' : `${strAt} ${time}`}`.trim();

            const pushMsg = msg ? `${tagline ? `${tagline}\n\n` : ''}${msg}` : tagline;

            this.callback({ ...o, title: pushTitle, msg: pushMsg, tagline, isDayBefore: true });
          }
        }
      }
    }
  }

  getTimepoint({ t, defaultTime }) {
    const [_date, _time] = t.replace(' at ', ' ').split(' ');

    const __time = _time || defaultTime || GLOBAL_DEFAULT_TIME;

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

  check() {
    for (const entry of this.notifications) {
      this.checkNotificationTimes(entry);
    }
  }
}

export default function dateNotifier(...args) {
  return new DateNotifier(...args);
}
