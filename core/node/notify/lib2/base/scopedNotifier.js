import { program, colors, everyMinute, isMainServer, isMainDevice } from 'dmt/common';

import { push } from 'dmt/notify';

const GLOBAL_DEFAULT_TTL = 180;
const GLOBAL_DEFAULT_COLOR = '#3091AB';

const APP = 'dmt_calendar';

export default class ScopedNotifier {
  constructor(ident, decommissionable) {
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

    if (deviceIdsOrFunction === true) {
      this.deviceCheckFunction = () => true;
      return this;
    }

    if (deviceIdsOrFunction === false) {
      this.deviceCheckFunction = () => false;
      return this;
    }

    if (typeof deviceIdsOrFunction == 'function') {
      this.deviceCheckFunction = deviceIdsOrFunction;
      return this;
    }

    this.deviceIds = Array(deviceIdsOrFunction).flat();

    return this;
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

  handle(callback) {
    this.setCallback(callback);

    if (!this.scopeHasBeenSet) {
      this.deviceCheckFunction = isMainServer;
      this.scopeHasBeenSet = true;
    }

    this.cancelPeriodicCheck = everyMinute(() => {
      if (this.performCheck()) {
        this.check();
      }
    });

    return this;
  }

  defaults() {
    const chain = this.scopeHasBeenSet ? this : this.scope(() => isMainServer() || program.isHub());

    chain.handle(({ title, msg, _title, _msg, color, ttl, tagline, highPriority, url, user, app }) => {
      if (isMainServer() || isMainDevice()) {
        const pm = push
          .optionalApp(app || APP)
          .highPriority(highPriority)
          .url(url)
          .title(title);

        if (this._all) {
          pm.user(user).notifyAll(msg);
        } else {
          pm.user(user).notify(msg);
        }
      } else if (program.isHub() && !user) {
        program.nearbyNotification({
          msg: _msg,
          title: _title,
          omitDeviceName: true,
          color: color || GLOBAL_DEFAULT_COLOR,
          ttl: ttl || GLOBAL_DEFAULT_TTL,
          omitTtl: true,
          tagline,
          dev: this._dev
        });
      }
    });
  }

  all() {
    this._all = true;
    return this;
  }

  dev() {
    this._dev = true;
    return this;
  }
}
