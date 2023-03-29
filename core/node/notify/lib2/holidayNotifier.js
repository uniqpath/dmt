import { dateFns, program, holidaysForYear } from 'dmt/common';

const { addDays, isSameDay } = dateFns;

import ScopedNotifier from './base/scopedNotifier.js';

import { isReloadableNotifications } from './lib/isReloadableNotifications.js';
import describeNearFuture from './lib/describeNearFuture.js';
import priorityArray from './lib/priorityArray.js';
import localize from './lib/localize.js';

const CALENDAR_SYMBOL = '🗓️';

const NOTIFIER_DEFAULT_TIME = '8:00';

const DEFAULT_APP = 'holidays';

class HolidayNotifier extends ScopedNotifier {
  constructor(
    country,
    { symbol, title, color, ttl, highPriority, notifyAt = NOTIFIER_DEFAULT_TIME, app = DEFAULT_APP, notifyDaysBefore = 1, user, users } = {},
    decommissionable = false
  ) {
    super(symbol, decommissionable);

    this.app = app;
    this.country = country;

    this.title = title;
    this.symbol = symbol;
    this.color = color;
    this.ttl = ttl;
    this.highPriority = !!highPriority;

    this.notifyAt = notifyAt;

    this.notifyDaysBefore = priorityArray(notifyDaysBefore);

    if (this.notifyDaysBefore.length == 0) {
      this.notifyDaysBefore.push(1);
    }

    this.user = user || users;
  }

  check() {
    const { strToday, strTomorrow, capitalizeFirstLetter } = localize(program);

    const now = new Date();

    const [notifyHour, notifyMinute] = this.notifyAt.split(':').map(n => parseInt(n));

    if (now.getHours() === notifyHour && now.getMinutes() === notifyMinute) {
      const thisYear = new Date().getFullYear();
      const { symbol: countryFlag, holidays: holidays1 } = holidaysForYear(thisYear, { country: this.country });
      const { holidays: holidays2 } = holidaysForYear(thisYear + 1, { country: this.country });
      const holidays = holidays1.concat(holidays2);

      for (const daysBefore of this.notifyDaysBefore) {
        for (const { date, holiday, symbol } of holidays) {
          const dateStr = `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`;

          if (isSameDay(addDays(now, daysBefore), date)) {
            const { strFuture } = describeNearFuture(date, daysBefore);

            const holidaySymbol = symbol || CALENDAR_SYMBOL;

            const prevDayHoliday = holidays.some(h => h.holiday == holiday && isSameDay(h.date, addDays(date, -1)));

            const nextDay = addDays(date, 1);
            const nextDayHoliday = holidays.find(h => h.holiday == holiday && isSameDay(h.date, nextDay));

            if (!prevDayHoliday || daysBefore == 0) {
              let msg = [0, 1].includes(daysBefore)
                ? `${holidaySymbol} ${capitalizeFirstLetter(daysBefore == 0 ? strToday : strTomorrow)} ${dateStr}`
                : `${holidaySymbol} ${strFuture} ${dateStr}`;

              if (nextDayHoliday) {
                msg += `\n${nextDayHoliday.symbol || CALENDAR_SYMBOL} ${
                  describeNearFuture(nextDay, daysBefore + 1).strFuture
                } ${nextDay.getDate()}.${nextDay.getMonth() + 1}.${nextDay.getFullYear()}`;
              }

              const pushTitle = `${countryFlag} ${holiday}`;

              const pushMsg = msg;

              this.callback({ title: pushTitle, msg: pushMsg, app: this.app, symbol: countryFlag, user: this.user });
            }
          }
        }
      }
    }
  }
}

export default function holidayNotifier(country, options = {}) {
  const decommissionable = isReloadableNotifications(new Error(), import.meta.url);

  return new HolidayNotifier(country, options, decommissionable);
}
