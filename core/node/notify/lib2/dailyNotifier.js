import { dateFns, program, log, timeutils } from 'dmt/common';

const { ONE_MINUTE, ONE_HOUR } = timeutils;

const { isSameMinute, addMinutes, isAfter, addDays, isSameDay } = dateFns;

import { isReloadableNotifications } from './lib/isReloadableNotifications.js';

import ScopedNotifier from './base/scopedNotifier.js';

import localize from './lib/localize.js';
import parseTimeYesterday from './lib/parseTimeYesterday.js';
import parseTimeToday from './lib/parseTimeToday.js';
import delayWarning from './lib/delayWarning.js';
import getDedupKey from '../lib/pushover/getDedupKey.js';
import getObjHash from '../lib/pushover/getObjHash.js';
import { evaluateTimespan, parseFrom, parseUntil } from './lib/evaluateTimespan.js';

const FINISH_SYMBOL = '✅';
const INFO_SYMBOL = 'ℹ️';
const NOW_SYMBOL = '🫵';
const WARN_SYMBOL = '❗';

class DailyNotifier extends ScopedNotifier {
  constructor(notifications, { symbol = '🔔', color, ttl, ttlGui, app, highPriority, title, warnAfter, user, users } = {}, decommissionable = false) {
    super(`${symbol} ${title || ''}`, decommissionable);

    this.notifications = Array(notifications).flat(Infinity);

    this.app = app;
    this.symbol = symbol;
    this.color = color;
    this.ttl = ttl;
    this.ttlGui = ttlGui;
    this.highPriority = !!highPriority;
    this.title = title;
    this.warnAfter = warnAfter;
    this.user = user || users;
  }

  joinWithCommaAnd(array, strAnd) {
    return array.reduce((acc, item, index, arr) => {
      if (index === 0) {
        return item;
      }

      if (index === arr.length - 1) {
        return `${acc} ${strAnd} ${item}`;
      }

      return `${acc}, ${item}`;
    }, '');
  }

  prepareAndPrehashObj({ obj, now }) {
    const preHash = getObjHash(obj);

    obj.msg = delayWarning(obj.msg, now, ONE_HOUR);

    return { ...obj, preHash };
  }

  checkNotificationTimes(entry, fakeNow) {
    const now = fakeNow || new Date();

    const { strReminder, strNewRegimeFromTomorrow, strAt, strAnd, strNow, capitalizeFirstLetter, insteadOf } = localize(program);

    const { msg: msgStrOrArray, warnAfter: _warnAfter, symbol: _symbol, when, id, color, ttl, ttlGui, from, until, highPriority: _highPriority, url } = entry;

    const titleStrOrArray = entry.title || this.title || '';
    const title = Array.isArray(titleStrOrArray) ? this.randomElement(titleStrOrArray) : titleStrOrArray;

    const msg = Array.isArray(msgStrOrArray) ? this.randomElement(msgStrOrArray) : msgStrOrArray;

    const warnAfter = _warnAfter == undefined ? this.warnAfter : _warnAfter;
    const highPriority = _highPriority == undefined ? this.highPriority : _highPriority;

    const entryUser = entry.user || entry.users;
    const user = entryUser == undefined ? this.user : entryUser;

    const symbolStrOrArray = _symbol || this.symbol;
    const symbol = Array.isArray(symbolStrOrArray) ? this.randomElement(symbolStrOrArray) : symbolStrOrArray;

    const o = {
      _msg: msg,
      _title: title,
      symbol,
      highPriority: false,
      ttl: ttl || this.ttl,
      ttlGui: ttlGui || this.ttlGui,
      color: color || this.color,
      user,
      id,
      url,
      app: this.app,
      data: entry.data || {}
    };

    const { extendedUntil, adjacentEntry } = this.determineExtendedUntil(entry);

    for (const t of Array(when).flat()) {
      let _msg = msg;

      if (!msg) {
        _msg = `${NOW_SYMBOL} [ ${strNow} ]`;
      }

      const notificationTime = parseTimeToday({ time: t, tag: _msg, now });

      o.eventTime = notificationTime;

      const { isWithin } = evaluateTimespan({ date: notificationTime, from, until });

      if (isWithin) {
        if (isSameMinute(now, notificationTime)) {
          const { isLastDay, diffDays } = evaluateTimespan({ date: notificationTime, from, until: extendedUntil });

          let regimeChangeMsg;

          if (this.isChangeOfRegime(notificationTime, entry, adjacentEntry, now)) {
            const sortTimes = when =>
              when
                .flat()
                .map(time => {
                  const [h, m] = time.split(':');
                  return { time, min: h * 60 + m };
                })
                .sort((a, b) => a.min - b.min)
                .map(el => el.time);

            regimeChangeMsg = `${INFO_SYMBOL} ${strNewRegimeFromTomorrow} [ ${strAt} ${this.joinWithCommaAnd(
              sortTimes(adjacentEntry.when),
              strAnd
            )} ] ${insteadOf} [ ${this.joinWithCommaAnd(sortTimes(entry.when), strAnd)} ]`;
          }

          let tagline;

          const lastEvent = this.isLastEvent({ when, notificationTime, msg: _msg, now });

          const { strLastTime, strLastDay, strOneMoreDay } = localize(program);

          if (lastEvent) {
            if (isLastDay) {
              tagline = lastEvent ? strLastTime : strLastDay;
            } else if (diffDays && [2, 5, 10, 20, 30].includes(diffDays)) {
              tagline = program.lang() == 'sl' ? `še ${diffDays} dni` : `${diffDays} more days`;
            } else if (diffDays == 1) {
              tagline = strOneMoreDay;
            }
          }

          let ending = '';

          if (isLastDay && lastEvent) {
            ending = `[ ${FINISH_SYMBOL} ${tagline} ]`;
          } else if (tagline) {
            ending = `[ ${tagline} ]`;
          }

          if (regimeChangeMsg) {
            _msg = `${_msg ? `${_msg}\n\n` : ''}${regimeChangeMsg}`;
          }

          const pushTitle = `${symbol} ${title} ${ending}`.trim();

          const obj = { ...o, highPriority, title: pushTitle, msg: _msg, tagline, dedupKey: getDedupKey(now) };

          this.handleMessage(this.prepareAndPrehashObj({ obj, now }));
        } else if (warnAfter) {
          const warningNotificationTime = addMinutes(notificationTime, warnAfter);

          if (isSameMinute(now, warningNotificationTime)) {
            const lastEvent = this.isLastEvent({ when, notificationTime, msg: _msg, now });
            const { isLastDay } = evaluateTimespan({ date: notificationTime, from, until: extendedUntil });

            let ending = `[ ${strReminder} ]`;

            if (isLastDay && lastEvent) {
              ending = `[ ${FINISH_SYMBOL} ${strReminder} ]`;
            }

            const pushTitle = `${symbol} ${title} ${msg ? ending : ''}`.trim();
            const pushMsg = `${WARN_SYMBOL} ${msg || ending}`;

            const obj = {
              ...o,
              msg: pushMsg,
              title: pushTitle,
              tagline: capitalizeFirstLetter(strReminder),
              isWarn: true,
              dedupKey: getDedupKey(now)
            };

            this.handleMessage(this.prepareAndPrehashObj({ obj, now }));
          }
        }
      }

      const notificationTimeYesterday = parseTimeYesterday({ time: t, tag: _msg, now });

      if (warnAfter && evaluateTimespan({ date: notificationTimeYesterday, from, until }).isWithin) {
        const _warningNotificationTime = addMinutes(notificationTimeYesterday, warnAfter);

        if (isSameMinute(now, _warningNotificationTime)) {
          const lastEvent = this.isLastEvent({ when, notificationTime: notificationTimeYesterday, msg: _msg, now });
          const { isLastDay } = evaluateTimespan({ date: notificationTimeYesterday, from, until: extendedUntil });

          let ending = `[ ${strReminder} ]`;

          if (isLastDay && lastEvent) {
            ending = `[ ${FINISH_SYMBOL} ${strReminder} ]`;
          }

          const pushTitle = `${symbol} ${title} ${msg ? ending : ''}`.trim();
          const pushMsg = `${WARN_SYMBOL} ${msg || ending}`;

          const obj = {
            ...o,
            title: pushTitle,
            msg: pushMsg,
            symbol,
            tagline: capitalizeFirstLetter(strReminder),
            isWarn: true,
            dedupKey: getDedupKey(now)
          };

          this.handleMessage(this.prepareAndPrehashObj({ obj, now }));
        }
      }
    }
  }

  isLastEvent({ when, notificationTime, msg, now }) {
    return !Array(when)
      .flat()
      .find(t => isAfter(parseTimeToday({ time: t, tag: msg, now }), notificationTime));
  }

  determineExtendedUntil(entry, list = this.notifications, adjacentEntry = null) {
    if (entry.until) {
      const until = parseUntil(entry.until);

      for (const n of list.filter(_ => _ != entry && _.msg == entry.msg && _.title == entry.title && _.from && _.until)) {
        if (isSameDay(addDays(until, 1), parseFrom(n.from))) {
          return this.determineExtendedUntil(
            n,
            list.filter(_ => _ != entry),
            adjacentEntry || n
          );
        }
      }

      return { extendedUntil: entry.until, adjacentEntry };
    }

    return { extendedUntil: null, adjacentEntry: null };
  }

  isChangeOfRegime(notificationTime, entry, adjacentEntry, now) {
    if (adjacentEntry) {
      const { when, msg, from, until } = entry;

      const { isLastDay } = evaluateTimespan({ date: notificationTime, from, until });

      const lastEvent = this.isLastEvent({ when, notificationTime, msg, now });

      if (isLastDay && lastEvent) {
        return true;
      }
    }
  }

  check(fakeNow) {
    for (const entry of this.notifications) {
      if (entry.to) {
        throw new Error(`${this.ident} Please use 'until' instead of 'to'`);
      }

      this.checkNotificationTimes(entry, fakeNow);
    }
  }
}

export default function dailyNotifier(notifications, options = {}, nestedNotifier = false) {
  const decommissionable = isReloadableNotifications(new Error(), import.meta.url);

  const notifier = new DailyNotifier(notifications, options, decommissionable);

  return nestedNotifier ? notifier : program.registerNotifier(notifier);
}
