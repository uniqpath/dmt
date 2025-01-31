import { log, timeutils } from 'dmt/common';
import { push } from 'dmt/notify';

const { ONE_DAY } = timeutils;

import { PowerMonitor, powerLog } from '../powerline/index.js';

function notify({ msg, program, onlyAdmin, pushoverApp, pushoverUser, pushoverUsers }) {
  let users;
  if (pushoverUser || pushoverUsers) {
    users = (pushoverUser || pushoverUsers).split(',').map(u => u.trim());
  }

  if (program.isHub()) {
    if (onlyAdmin) {
      push
        .optionalApp(pushoverApp)
        .ttl(3 * ONE_DAY)
        .omitDeviceName()
        .notify(msg);
    } else {
      push
        .optionalApp(pushoverApp)
        .ttl(3 * ONE_DAY)
        .user(users)
        .omitDeviceName()
        .notifyAll(msg);
    }
  }
}

function notificationGroup(iotDeviceTitle, suffix) {
  return `__dmt_iot_on_off_monitor_${iotDeviceTitle}_${suffix}`;
}

class OnOffMonitor {
  constructor(program, taskDef) {
    const { onlyAdmin, pushoverApp, pushoverUser, pushoverUsers } = taskDef;

    this.program = program;
    this.pm = new PowerMonitor(program, taskDef);

    this.pm.on('start', e => {
      const status = 'Is ON …';
      const msg = `${e.device} ${status}`;
      notify({ program, onlyAdmin, pushoverApp, pushoverUser, pushoverUsers, msg });
      const group = notificationGroup(e.device, 'on');
      program.nearbyNotification({ title: e.device, msg: status, group, ttl: 5 * 60, color: '#77DA9C', omitDeviceName: true });

      log.green(msg);
    });

    this.pm.on('finish', e => {
      const status = 'DONE✓';
      const msg = `${e.device} ${status}`;
      notify({ program, onlyAdmin, pushoverApp, pushoverUser, pushoverUsers, msg });
      const group = notificationGroup(e.device, 'off');
      program.nearbyNotification({ title: e.device, msg: status, group, ttl: 15 * 60, color: '#6163D1', omitDeviceName: true });

      log.blue(msg);
    });
  }

  handleMqttEvent({ topic, msg }) {
    this.pm.handleReading({ topic, msg });
  }
}

export default OnOffMonitor;
