import { program, colors, everyMinute, isMainServer, isMainDevice, log } from 'dmt/common';

import { push } from 'dmt/notify';

const GLOBAL_DEFAULT_GUI_TTL = 180;
const GLOBAL_DEFAULT_COLOR = '#3091AB';

const APP = 'dmt_calendar';

export default class ScopedNotifier {
  constructor(ident, decommissionable) {
    this.decommissionable = decommissionable;

    this.ident = `${this.constructor.name} ${ident || ''}`.trim();

    process.nextTick(() => {
      if (!this.handleMessage) {
        this.defaults();
      }
    });
  }

  scope(deviceIdsOrFunction) {
    this.scopeHasBeenSet = true;

    if (typeof deviceIdsOrFunction == 'function') {
      this.deviceCheckFunction = deviceIdsOrFunction;
      return this;
    }

    if (deviceIdsOrFunction === true) {
      this.deviceCheckFunction = () => true;
      return this;
    }

    if (deviceIdsOrFunction === false) {
      this.deviceCheckFunction = () => false;
      return this;
    }

    this.deviceIds = Array(deviceIdsOrFunction).flat();

    return this;
  }

  simulateTimepoint(timepoint) {
    if (!this.isDecommissioned() && this.performCheck()) {
      this.check(new Date(timepoint));
    }
  }

  performCheck() {
    if (!this.isDecommissioned() && !program.isStopping()) {
      if ((!this.deviceIds || this.deviceIds.includes(program.device.id)) && (!this.deviceCheckFunction || this.deviceCheckFunction())) {
        return true;
      }
    }
  }

  setMessageHandler(callback) {
    this.handleMessage = callback;
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
    return this.initializeHandler(callback);
  }

  then(callback) {
    return this.initializeHandler(callback);
  }

  initializeHandler(callback, check) {
    this.setMessageHandler(callback);

    if (!this.scopeHasBeenSet) {
      this.deviceCheckFunction = isMainServer;
      this.scopeHasBeenSet = true;
    }

    this.cancelPeriodicCheck = everyMinute(() => {
      if (this.performCheck()) {
        if (check) {
          check();
        } else {
          this.check();
        }
      }
    });

    return this;
  }

  defaults() {
    const chain = this.scopeHasBeenSet ? this : this.scope(() => isMainServer() || program.isHub());

    chain.initializeHandler(
      ({ title, msg, _title, _msg, color, ttl, ttlGui, tagline, highPriority, url, urlTitle, enableHtml, user, app, dedupKey, preHash }) => {
        if (isMainServer() || isMainDevice()) {
          const pm = push
            .optionalApp(app || APP)
            .dedup(dedupKey, preHash)
            .user(user)
            .highPriority(highPriority)
            .enableHtml(enableHtml)
            .ttl(ttl)
            .url(url)
            .urlTitle(urlTitle)
            .title(title);

          if (this._all) {
            pm.notifyAll(msg);
          } else {
            pm.notify(msg);
          }
        } else if (program.isHub() && !user && (this._all || this._dev)) {
          program.nearbyNotification({
            msg: _msg,
            title: _title,
            omitDeviceName: true,
            color: color || GLOBAL_DEFAULT_COLOR,
            ttl: ttlGui || GLOBAL_DEFAULT_GUI_TTL,
            omitTtl: true,
            tagline,
            dev: this._dev
          });
        }
      }
    );
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
