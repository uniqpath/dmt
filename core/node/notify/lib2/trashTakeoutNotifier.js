import { dateFns } from 'dmt/common';

const { parse, isTomorrow, isSameMinute } = dateFns;

import ScopedNotifier from './base/scopedNotifier.js';
import convertDateToEUFormat from './lib/convertDateToEUFormat.js';
import parseTimeToday from './lib/parseTimeToday.js';

import dateTemplate from './lib/dateTemplate.js';

class TrashTakeoutNotifier extends ScopedNotifier {
  constructor(records, { program, year, color, ttl, notifyDayBeforeAt, highPriority, symbol = '🗑️', title }) {
    super(`${symbol} ${title || ''}`);

    this.records = records;

    this.program = program;
    this.year = year;
    this.notifyDayBeforeAt = notifyDayBeforeAt;
    this.symbol = symbol;
    this.title = title;
    this.highPriority = !!highPriority;

    this.color = color;
    this.ttl = ttl;
  }

  check() {
    const date = new Date();

    if (this.notifyDayBeforeAt.find(t => isSameMinute(date, parseTimeToday(t)))) {
      const list = [];

      for (const { tag, when } of this.records) {
        if (
          Array(when)
            .flat()
            .find(dayAndMonth => isTomorrow(parse(convertDateToEUFormat(dayAndMonth, this.year), dateTemplate, date)))
        ) {
          list.push(tag);
        }
      }

      if (list.length > 0) {
        this.callback({ msg: list.join(', '), title: this.title, symbol: this.symbol, color: this.color, ttl: this.ttl, highPriority: this.highPriority });
      }
    }
  }
}

export default function trashTakeoutNotifier(...args) {
  return new TrashTakeoutNotifier(...args);
}
