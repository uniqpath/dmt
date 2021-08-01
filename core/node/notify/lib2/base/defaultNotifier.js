import { isMainServer, log } from 'dmt/common';

import { push } from 'dmt/notify';

const GLOBAL_DEFAULT_TTL = 180;
const GLOBAL_DEFAULT_COLOR = '#3091AB';

export default class DefaultNotifier {
  defaults() {
    const { program } = this;

    this.scopeDevice(() => isMainServer() || program.isHub()).handleNotification(({ msg, title, symbol, color, ttl, tagline, highPriority }) => {
      if (isMainServer()) {
        const pm = push.highPriority(highPriority).title(`${symbol} ${title} ${tagline || ''}`);

        if (this._all) {
          pm.notifyAll(msg);
        } else {
          pm.notify(msg);
        }
      } else {
        program.nearbyNotification({
          msg,
          title,
          omitDeviceName: true,
          color: color || GLOBAL_DEFAULT_COLOR,
          ttl: ttl || GLOBAL_DEFAULT_TTL,
          omitTtl: true,
          replaceTtl: tagline,
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
