import { everyMinute, isMainServer } from 'dmt/common';

import { isReloadableNotifications } from './lib/isReloadableNotifications.js';

import ScopedNotifier from './base/scopedNotifier.js';

import dailyNotifier from './dailyNotifier.js';
import weeklyNotifier from './weeklyNotifier.js';
import dateNotifier from './dateNotifier.js';

import detectMonthlyFrequency from './lib/detectMonthlyFrequency.js';

function startsWithDay(string) {
  const prefixes = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  return prefixes.some(prefix => string.toLowerCase().startsWith(prefix));
}

function isMonthlyFrequency(whenStr) {
  const { matchesWeekly, matchesMonthly } = detectMonthlyFrequency(whenStr);
  return matchesWeekly || matchesMonthly;
}

class Notifier extends ScopedNotifier {
  constructor(notifications, options = {}, decommissionable = false) {
    const { symbol, title } = options;

    super(`${symbol} ${title || ''}`, decommissionable);

    const dailyList = [];
    const weeklyList = [];
    const dateList = [];

    const _notifications = Array(notifications).flat(Infinity);

    for (const n of _notifications) {
      const whenDaily = [];
      const whenWeekly = [];
      const whenDate = [];

      for (const w of Array(n.when).flat()) {
        if (startsWithDay(w)) {
          whenWeekly.push(w);
        } else if (w.includes('.') || isMonthlyFrequency(w)) {
          whenDate.push(w);
        } else {
          whenDaily.push(w);
        }
      }

      if (whenDaily.length > 0) {
        dailyList.push({ ...n, when: whenDaily });
      }

      if (whenWeekly.length > 0) {
        weeklyList.push({ ...n, when: whenWeekly });
      }

      if (whenDate.length > 0) {
        dateList.push({ ...n, when: whenDate });
      }
    }

    if (dailyList.length > 0) {
      this.dailyNotifier = dailyNotifier(dailyList, options);
    }

    if (weeklyList.length > 0) {
      this.weeklyNotifier = weeklyNotifier(weeklyList, options);
    }

    if (dateList.length > 0) {
      this.dateNotifier = dateNotifier(dateList, options);
    }
  }

  decommission() {
    if (!this.decommissionable) return;

    this.decommissioned = true;

    this.cancelPeriodicCheck?.();

    this.dailyNotifier?.decommission();
    this.weeklyNotifier?.decommission();
    this.dateNotifier?.decommission();
  }

  handle(callback) {
    this.callback = callback;
    if (!this.scopeHasBeenSet) {
      this.deviceCheckFunction = isMainServer;
      this.scopeHasBeenSet = true;
    }

    this.dailyNotifier?.setCallback(callback);
    this.weeklyNotifier?.setCallback(callback);
    this.dateNotifier?.setCallback(callback);

    const check = () => {
      if (this.performCheck()) {
        this.dailyNotifier?.check();
        this.weeklyNotifier?.check();
        this.dateNotifier?.check();
      }
    };

    this.cancelPeriodicCheck = everyMinute(check);

    return this;
  }
}

export default function notifier(notifications, options = {}) {
  const decommissionable = isReloadableNotifications(new Error(), import.meta.url);

  return new Notifier(notifications, options, decommissionable);
}
