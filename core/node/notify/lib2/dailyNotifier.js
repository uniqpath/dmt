import { dateFns } from 'dmt/common';

const { isSameMinute, addMinutes, isAfter, addDays, isSameDay } = dateFns;

import ScopedNotifier from './base/scopedNotifier.js';

import parseTimeYesterday from './lib/parseTimeYesterday.js';
import parseTimeToday from './lib/parseTimeToday.js';
import { evaluateTimespan, parseFrom, parseUntil } from './lib/evaluateTimespan.js';

const ONE_MINUTE = 60 * 1000;

const FINISH_SYMBOL = '✅';
const WARN_SYMBOL = '❗';

class DailyNotifier extends ScopedNotifier {
  constructor(notifications, { program, symbol = '🔔', color, ttl, highPriority, title, warnAfter }) {
    super(`${symbol} ${title || ''}`);

    this.program = program;

    this.notifications = Array(notifications).flat(Infinity);

    this.symbol = symbol;
    this.color = color;
    this.ttl = ttl;
    this.highPriority = !!highPriority;
    this.title = title;
    this.warnAfter = warnAfter;
  }

  checkNotificationTimes(entry) {
    const date = new Date();

    const strReminder = this.program.lang() == 'sl' ? 'opomnik' : 'reminder';

    const { msg, warnAfter: _warnAfter, symbol: _symbol, title, when, id, color, ttl, from, until, highPriority: _highPriority } = entry;

    const warnAfter = _warnAfter == undefined ? this.warnAfter : _warnAfter;
    const highPriority = _highPriority == undefined ? this.highPriority : _highPriority;

    const symbol = _symbol || this.symbol;

    const o = {
      msg,
      title: title || this.title || '',
      symbol,
      highPriority: false,
      ttl: ttl || this.ttl,
      color: color || this.color,
      id
    };

    const { extendedUntil, adjacentEntry } = this.determineExtendedUntil(entry);

    for (const t of Array(when).flat()) {
      const notificationTime = parseTimeToday(t, msg);

      const { isValid } = evaluateTimespan({ date: notificationTime, from, until });

      if (isValid) {
        if (isSameMinute(date, notificationTime)) {
          const { isLastDay, diffDays } = evaluateTimespan({ date: notificationTime, from, until: extendedUntil });

          if (this.isChangeOfRegime(notificationTime, entry, adjacentEntry)) {
            const REGIME_CHANGE_DELAY = 2000;

            const symbol = _symbol || this.symbol;
            const title = this.program.lang() == 'sl' ? 'Nov spored od jutri' : 'New regime from tomorrow';
            const pushTitle = `${symbol} ${title}`;

            const sortedTimes = Array(adjacentEntry.when)
              .flat()
              .map(time => {
                const [h, m] = time.split(':');
                return { time, min: h * 60 + m };
              })
              .sort((a, b) => a.min - b.min)
              .map(el => el.time);

            setTimeout(() => {
              this.callback({
                title,
                msg: `⚠️ ${msg} — ${sortedTimes.join(', ')}`,
                pushTitle,
                color: color || this.color,
                symbol
              });
            }, REGIME_CHANGE_DELAY);
          }

          let tagline;

          const lastEvent = this.isLastEvent({ when, notificationTime, msg });

          if (lastEvent) {
            if (isLastDay) {
              if (this.program.lang() == 'sl') {
                tagline = lastEvent ? 'zadnjič' : 'zadnji dan';
              } else {
                tagline = lastEvent ? 'last time' : 'last day';
              }
            } else if (diffDays && [2, 5, 10, 20, 30].includes(diffDays)) {
              if (this.program.lang() == 'sl') {
                tagline = `še ${diffDays} dni`;
              } else {
                tagline = `${diffDays} more days`;
              }
            } else if (diffDays == 1) {
              if (this.program.lang() == 'sl') {
                tagline = 'še samo jutri';
              } else {
                tagline = 'one more day';
              }
            }
          }

          let ending = '';

          if (isLastDay && lastEvent) {
            ending = `${FINISH_SYMBOL} ${tagline}`;
          } else if (tagline) {
            ending = `— ${tagline}`;
          }

          const pushTitle = `${o.symbol} ${o.title} ${ending}`.trim();
          this.callback({ ...o, highPriority, pushTitle, tagline });

          entry.sentAt = Date.now();
        } else if (warnAfter) {
          const warningNotificationTime = addMinutes(notificationTime, warnAfter);

          if (isSameMinute(date, warningNotificationTime)) {
            const lastEvent = this.isLastEvent({ when, notificationTime, msg });
            const { isLastDay } = evaluateTimespan({ date: notificationTime, from, until: extendedUntil });

            let ending = `— ${strReminder}`;

            if (isLastDay && lastEvent) {
              ending = `${FINISH_SYMBOL} ${strReminder}`;
            }

            const pushTitle = `${symbol} ${o.title} ${ending}`.trim();
            this.callback({ ...o, msg: `${WARN_SYMBOL} ${msg}`, pushTitle, tagline: strReminder, isWarn: true });

            entry.sentAt = Date.now();
          }
        }
      }

      const notificationTimeYesterday = parseTimeYesterday(t, msg);

      if (warnAfter && evaluateTimespan({ date: notificationTimeYesterday, from, until }).isValid) {
        const _warningNotificationTime = addMinutes(notificationTimeYesterday, warnAfter);

        if (isSameMinute(date, _warningNotificationTime)) {
          const lastEvent = this.isLastEvent({ when, notificationTime: notificationTimeYesterday, msg });
          const { isLastDay } = evaluateTimespan({ date: notificationTimeYesterday, from, until: extendedUntil });

          let ending = `— ${strReminder}`;

          if (isLastDay && lastEvent) {
            ending = `${FINISH_SYMBOL} (${strReminder})`;
          }

          const pushTitle = `${symbol} ${o.title} ${ending}`.trim();
          this.callback({ ...o, msg: `${WARN_SYMBOL} ${msg}`, pushTitle, symbol, tagline: strReminder, isWarn: true });
          entry.sentAt = Date.now();
        }
      }
    }
  }

  isLastEvent({ when, notificationTime, msg }) {
    return !Array(when)
      .flat()
      .find(t => isAfter(parseTimeToday(t, msg), notificationTime));
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

  isChangeOfRegime(notificationTime, entry, adjacentEntry) {
    if (adjacentEntry) {
      const { when, msg, from, until } = entry;

      const { isLastDay } = evaluateTimespan({ date: notificationTime, from, until });

      const lastEvent = this.isLastEvent({ when, notificationTime, msg });

      if (isLastDay && lastEvent) {
        return true;
      }
    }
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

export default function dailyNotifier(...args) {
  return new DailyNotifier(...args);
}
