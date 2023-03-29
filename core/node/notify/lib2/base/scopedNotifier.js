import { program, log, colors, everyMinute } from 'dmt/common';

import DefaultNotifier from './defaultNotifier.js';

export default class ScopedNotifier extends DefaultNotifier {
  constructor(ident, decommissionable) {
    super();

    this.decommissionable = decommissionable;

    this.ident = `${this.constructor.name} ${colors.cyan(ident) || ''}`.trim();

    process.nextTick(() => {
      program.registerNotifier(this);

      if (!this.callback) {
        this.defaults();
      }
    });
  }

  scope(deviceIdsOrFunction) {
    this.scopeHasBeenSet = true;

    const obj = { handle: this.__handleNotification.bind(this) };

    if (typeof deviceIdsOrFunction == 'function') {
      this.deviceCheckFunction = deviceIdsOrFunction;
      return obj;
    }

    this.deviceIds = Array(deviceIdsOrFunction).flat();

    return obj;
  }

  performCheck() {
    if (!this.isDecommissioned()) {
      if ((!this.deviceIds || this.deviceIds.includes(program.device.id)) && (!this.deviceCheckFunction || this.deviceCheckFunction())) {
        return true;
      }
    }
  }

  setCallback(callback) {
    this.callback = callback;
  }

  decommission() {
    if (!this.decommissionable) return;

    this.decommissioned = true;

    if (this.cancelPeriodicCheck) {
      this.cancelPeriodicCheck();
    }
  }

  isDecommissioned() {
    return this.decommissioned;
  }

  randomElement(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  __handleNotification(callback) {
    this.callback = callback;

    if (!this.deviceIds && !this.deviceCheckFunction) {
      log.red(`⚠️  ${this.ident.trim() + ' '}not scoped to any device(s).`);
      log.gray(`${colors.red('↑ All your devices will handle these notifications ↑')} [ Do you really want this? ]`);
    }

    this.cancelPeriodicCheck = everyMinute(() => {
      if (this.performCheck()) {
        this.check();
      }
    });

    return this;
  }
}
