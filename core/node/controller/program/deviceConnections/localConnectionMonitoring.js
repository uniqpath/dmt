import { isMacLidUp } from 'dmt/device-control';
import { log, isMainDevice, isMacOS, timeutils, dateFns } from 'dmt/common';

import { desktop } from 'dmt/notify';

const { format } = dateFns;

const { ONE_SECOND, ONE_MINUTE } = timeutils;

export default class LocalConnectionMonitoring {
  constructor(program, { active = undefined } = {}) {
    this.active = active;

    if (!this.active) return;

    this.program = program;
    this.lidCounter = 0;

    if (program.isHub()) {
      setTimeout(() => {
        if (this.connected === undefined) {
          this.connected = false;

          this.noConnectionSince = format(new Date(), 'H:mm');
        }
      }, 10000);
    }
  }

  monitorClientSidePing() {
    if (!this.active) return;
    if (this.connected && (!this.lastSuccessfullPing || (this.lastSuccessfullPing && Date.now() - this.lastSuccessfullPing > 7000))) {
      this.connected = false;

      this.noConnectionSince = format(new Date(), 'H:mm');

      const msg = '❌ DISCONNECTED';
      log.red(msg);

      if (isMainDevice()) {
        desktop.notify(msg);
      }
    }

    if (this.connected == false && this.program.isHub()) {
      this.program.nearbyNotification({
        msg: `NO INTERNET (${this.noConnectionSince})`,
        ttlMs: 3 * ONE_SECOND,
        omitDesktopNotification: true,
        omitTtl: true,
        color: '#e34042',
        group: 'connection_monitoring'
      });
    }

    if (!this.connected && this.lastSuccessfullPing && Date.now() - this.lastSuccessfullPing < 5000) {
      if (this.connected == false) {
        const msg = '✅ CONNECTED';
        log.green(msg);

        if (isMainDevice()) {
          desktop.notify(msg);
        } else if (this.program.isHub()) {
          this.program.nearbyNotification({
            msg: `BACK ONLINE (${format(new Date(), 'H:mm')})`,
            ttlMs: 1 * ONE_MINUTE,
            color: '#6BFF74',
            group: 'connection_monitoring'
          });
        }
      }

      this.noConnectionSince = undefined;
      this.connected = true;
    }
  }

  successfullPing() {
    if (!this.active) return;

    this.lastSuccessfullPing = Date.now();
  }
}
