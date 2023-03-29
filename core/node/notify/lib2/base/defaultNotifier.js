import { isMainServer, isMainDevice, program, log } from 'dmt/common';

import { push } from 'dmt/notify';

const GLOBAL_DEFAULT_TTL = 180;
const GLOBAL_DEFAULT_COLOR = '#3091AB';

const APP = 'dmt_calendar';

export default class DefaultNotifier {
  defaults() {
    const chain = this.scopeHasBeenSet ? { handle: this.__handleNotification.bind(this) } : this.scope(() => isMainServer() || program.isHub());

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
