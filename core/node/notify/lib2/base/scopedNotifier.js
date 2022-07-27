import { log, colors, loop, globals } from 'dmt/common';

import DefaultNotifier from './defaultNotifier.js';

export default class ScopedNotifier extends DefaultNotifier {
  constructor(ident) {
    super();
    this.ident = `${this.constructor.name} ${colors.cyan(ident) || ''}`.trim();

    process.nextTick(() => {
      if (!this.callback) {
        this.defaults();
      }
    });
  }

  scopeDevice(deviceIdsOrFunction) {
    if (typeof deviceIdsOrFunction == 'function') {
      this.deviceCheckFunction = deviceIdsOrFunction;
      return { handleNotification: this.__handleNotification.bind(this) };
    }

    this.deviceIds = Array(deviceIdsOrFunction).flat();

    return { handleNotification: this.__handleNotification.bind(this) };
  }

  scopeDevices(...args) {
    return this.scopeDevice(...args);
  }

  __handleNotification(callback) {
    this.callback = callback;

    if (!this.deviceIds && !this.deviceCheckFunction) {
      log.red(`⚠️  ${this.ident.trim() + ' '}not scoped to any device(s).`);
      log.gray(`${colors.red('↑ All your devices will handle these notifications ↑')} [ Do you really want this? ]`);
    }

    loop(() => {
      if ((!this.deviceIds || this.deviceIds.includes(this.program.device.id)) && (!this.deviceCheckFunction || this.deviceCheckFunction())) {
        this.check();
      }
    }, globals.slowTickerPeriod);

    return this;
  }
}
