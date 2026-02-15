import { executeAt } from 'dmt/common';

import Notifier from './notifierClass.js';

export default class DynamicNotifier {
  constructor(makeNotifierEvents, options, decommissionable) {
    this.makeNotifierEvents = makeNotifierEvents;
    this.options = options;
    this.notifier = null;
    this.decommissionable = decommissionable;
    this.cancelDailyRefresh = null;
    this.init();
  }

  init() {
    this.refresh();
    this.setupSchedule();
  }

  refresh() {
    this.notifier?.decommission();

    this.notifier = new Notifier(this.makeNotifierEvents(), this.options, this.decommissionable);
  }

  setupSchedule() {
    if (this.cancelDailyRefresh) return;

    this.cancelDailyRefresh = executeAt('0:00', () => {
      this.refresh();
    });
  }

  decommission() {
    this.cancelDailyRefresh?.();
    this.notifier?.decommission();
    this.cancelDailyRefresh = null;
    this.notifier = null;
  }
}
